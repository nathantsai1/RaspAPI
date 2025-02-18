const express = require('express');
const app = express();
require('dotenv').config();

const port = 3000;
const PORT = process.env.PORT || 3000;

const fs = require('fs');
const path = require('path')

const { general_error } = require('./errors.js');
const { normal_post, normal_db } = require('./check.js');
const { set_goal, add_user, find_goals, upload_workout, delete_info, get_today, change_password, change_username, get_all } = require('./DBwork.js');

let strings = '';
exports.strings = strings;
let fullUrl, specific, url;
app.use(express.json());  // This will automatically parse JSON request bodies
// this script gets the link, type(CRUD), and spits out the output of the API

// GET requests

// TODO: home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// get the introduction page
app.get('/api/fitness_tracker', (req, res) => {
    res.json({ 
      introduction: 'Hello, and welcome to the "running API" app',
      description: "This API is designed to work in tandom with your running goals",
      help: "use the /api/fitness_tracker/help endpoint to get more information on how to use this API"
    });
});
  
app.get('/api/fitness_tracker/:help', (req, res) => {
  // get help/error list and send to API
  fullUrl = req.originalUrl;
  specific = fullUrl.slice(21);
  if (specific.includes("help")) {
    url = "txt/list.txt"
  } else if(specific.includes("error")) {
    url = "txt/errors.txt"
  } else {
    res.status(404).send("Not found.");
    return false;
  }
  fs.readFile(url, (err, data) => {
    if (err) throw err;
    res.json(JSON.parse(data));
    return true;
  });
});

// POST request

// get amount ran today, 
// daily amount ran, 
// daily goal, 
// and trend of a runner's milage
// app.use(express.json());

app.post('/api/fitness_tracker', (req, res) => {
  // decode data
  async function hi(){
  try {
    strings = req.body;
    // check for required parts
    if(!normal_post(strings, res)) {
      return false;
    }

    // check for correct function
    if (strings.function == "add_run") {
      // 1
      // is distance an actual number? idfk
      if (Number(strings.distance) == NaN) {
        res.status(600).json(general_error(604, 'invalid distance', 'distance parameter is not a number'));
        return false;
      }
      if (normal_db(await upload_workout(strings.username, strings.password, Number(strings.distance)), res, true)) {
        return true;
      }
      return false;
    } else if (strings.function == "get_today") {
      // 2
      const today = await get_today(strings.username, strings.password);
      if (today == 1 || today == 2 || today == 3 || today == -1) {
        normal_db(today, res, true)
        return false;
      }
      // add the workouts that were recorded today
      let list = [];
      today.forEach(element => {
        // if the date is after the start of today
        if (parseInt(element.date) > new Date(new Date().setUTCHours(0,0,0,0)).getTime()) {
          list.push(element);
        }
      });
      // i will send
      if (list.length == 0) {
        res.status(404).json(general_error(410, 'no data', 'no data recorded today'));
        return false;
      } else {
        let temp = 0;
        list.forEach(element => {
          temp += Numeric(element.distance);
        });
        res.json({message: "success", recorded_workouts_today: list, total_distance: `${temp} miles`});
        return true;
      }
    } else if (strings.function == "set_goal") {
      // #3
      if(!normal_db(await set_goal(strings.username, strings.password, strings.daily_goal), res, true)) {
        return false;
      } 
      return true;
    } else if (strings.function == "get_all") {
      const result = await get_all(strings.username, strings.password);
      if (!normal_db(result)) {
        return false;
      }
      res.json({message: "success", all_workouts: result});
      return true;
    } else if (strings.function == "add_user") {
      // #5
      if (!strings.question) {
        res.status(404).json(general_error(405, 'missing required argument(s)', 'argument(s) missing: "question"'));
        return false;
      } else if (strings.question.length < 4) {
        res.status(400).json(general_error(405, 'invalid question length', 'question parameter is too short'));
        return false;
      }
      if(!await add_user(strings.username, strings.password, strings.question)) {
        // if there is a problem with adding the user
        res.status(408).json(general_error(408, 'invalid user', 'user already exists'));
        return false;
      }
      res.json({ message: `Success: user "${strings.username}" added!` });
      return true;
    } else if (strings.function == "find_goal") {
      // #6
      const result = await find_goals(strings.username, strings.password);
      if (result == 1 || result == 2 || result == 3 || result == 4) {
        normal_db(result, res, true);
        return false;
      }
      res.send({message: "success", goal: `${result[0].goal} miles/day`});
      return true;
    } else {
      res.status(400).json(general_error(407, 'invalid function', 'function parameter is not valid'));
      return false;
    }
  } catch (e) {
    console.log('error: ', e)
  }
}
hi()
});

// PUT request
app.put('/api/fitness_tracker', (req, res) => {
  async function hi() {
    console.log('hi')
    try {
      const string = req.body
      normal_db(string, res);
        if (!normal_post(string, res)) {
          return false;
        } 
        if (string.function == "change_password") {
          // TODO: change password
          if (!string.new_password || !string.question) {
            console.log('3')
            res.status(404).json(general_error(405, 'missing required argument(s)', 'argument(s) missing: "new_password" and/or "question"'));
            return false;
          }
          console.log(2);
          const result = await change_password(string.username, string.password, string.new_password, string.question);
          if (result == 1 || result == 2 || result == 3 || result == -1) {
            normal_db(result, res, true);
            return false;
          }
          console.log(3);
          res.json({ message: 'Success: password changed' });
          return true;

        } else if (string.function == "change_username") {
          // TODO: change username
          if (!string.new_username || !string.question) {
            res.status(404).json(general_error(405, 'missing required argument(s)', 'argument(s) missing: "new_username" and/or "question"'));
            return false;
          }
          const result = await change_username(string.username, string.new_username, string.password, string.question);
          if (result == 1 || result == 2 || result == 3 || result == -1) {
            normal_db(result, res, true);
            return false;
          }
          res.json({ message: 'Success: username changed' });
          return true;
      } else {
        res.status(400).json(general_error(407, 'invalid function', 'function parameter is not valid'));
        return false;
      }} catch (e) {
        console.log('error: ', e)
        res.json(general_error(501, 'server-side error', 'try again in a few minutes'));
        return false;
      }
  }
  hi()
});
  
// DELETE request
app.delete('/api/fitness_tracker', (req, res) => {
  async function hi() {
    try {
      const string = req.body;
      if (!normal_post(string, res)) {
        return false;
      }
      if (string.function == "delete_user") {
        if (!string.are_you_sure) {
          res.status(404).json(general_error(405, 'missing required argument(s)', 'argument(s) missing: "confirm_username"'));
          return false;
        } else if (!string.are_you_sure == "abcdefghijklmnopqrstuvwxyz") {
          res.status(400).json(general_error(603, 'invalid confirmation', 'confirmation does not match'));
          return false;
        }
        const result = await delete_info(string.username, string.password);
        if (result) {
          res.json({ message: 'Success: user deleted' });
          return false;
        }
        res.json({ message: 'Error: please try again later' });
        return true;
      } else {
        res.status(400).json(general_error(407, 'invalid function', 'function parameter is not valid'));
        return false;
      }
    } catch (e) {
      console.log('error: ', e)
      res.json(general_error(501, 'server-side error', 'try again in a few minutes'));
      return false;
    }
  }
  hi()
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${port}`);
});