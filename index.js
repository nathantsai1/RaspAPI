const express = require('express');
const app = express();
require('dotenv').config();

const port = 3000;
const PORT = process.env.PORT || 3000;

const fs = require('fs');
const path = require('path');
var bodyParser = require('body-parser');

const { general_error } = require('./src/errors.js');
const { normal_post, normal_db } = require('./src/check.js');
const { set_goal, add_user, find_goals, upload_workout, delete_info, get_today, change_password, change_username, get_all } = require('./src/DBwork.js');

let strings = '';
exports.strings = strings;
let fullUrl, specific, url;
app.use(express.json());  // This will automatically parse JSON request bodies
app.use(bodyParser.urlencoded({
  extended: true
}));
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

// TODO: Get POST reqs /get_today, /past_workouts, /find_goal
app.post('/api/fitness_tracker/get_today', (req, res) => {
  async function hi() {
    // 2
    strings = req.body;
    try {
      if (!strings.api_key) {
        let err = general_error(405, 'missing required argument(s)', 'argument(s) missing: "api_key"');
        res.status(404).json(err);
        return false;
      }
      const today = await get_today(strings.api_key);
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
          temp += Number(element.distance);
        });
        res.json({message: "success", recorded_workouts_today: list, total_distance: `${temp} miles`});
        return true;
      }} catch (e) {
        console.log('error: ', e)
        res.json(general_error(501, 'server-side error', 'try again in a few minutes'));
        return
      }
};
hi();
});

app.post('/api/fitness_tracker/past_workouts', (req, res) => {
  async function hi() {
    strings = req.body;
    try {
      if (!strings.api_key) {
        res.status(404).json(general_error(405, 'missing required argument(s)', 'argument(s) "api_key" missing'));
        return false;
      }
      const result = await get_all(strings.api_key);
      if (result == 1 || result == 2 || result == 3 || result == -1) {
        normal_db(result, res, true);
        return false;
      }
      if (result.length == 0) {
        res.status(404).json(general_error(410, 'no data', 'no data recorded'));
        return false;
      }
      let temp = 0;
      result.forEach(element => {
        temp += Number(element.distance);
      });
      res.json({message: "success", recorded_workouts: result, total_distance: `${temp} miles`});
      return true;
    } catch (e) {
      console.log('error: ', e)
      res.json(general_error(501, 'server-side error', 'try again in a few minutes'));
      return false;
    }
  }
  hi();
});

app.post('/api/fitness_tracker/find_goal', (req, res) => {
  async function hi() {
    strings = req.body;
    if (!normal_post(strings, res)) {
      return false;
    }
    const result = await find_goals(strings.api_key);
    if (result == 1 || result == 2 || result == 3 || result == -1) {
      normal_db(result, res, true);
      return false;
    }
    if (result.length == 0) {
      res.status(404).json(general_error(410, 'no data', 'no data recorded'));
      return false;
    }
    res.json({message: "success", goal: result[0].goal});
    return true;
  }
  return hi();
});

app.get('/api/fitness_tracker/:help', (req, res) => {
  // get help/error list and send to API
  specific = req.params.help
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

// POST requests: add_run, set_goal, add_user
app.post('/api/fitness_tracker/add_run', (req, res) => {
  // is distance an actual number? idfk
  async function hi() {
    strings = req.body;
    if (!normal_post(strings, res)) {
      return false;
    }
    if (Number(strings.distance) == NaN) {
      res.status(600).json(general_error(604, 'invalid distance', 'distance parameter is not a number'));
      return false;
    }
    if (normal_db(await upload_workout(strings.api_key, Number(strings.distance)), res, true)) {
      return true;
    }
    return false;
  }
  return hi();
});

app.post('/api/fitness_tracker/set_goal', (req, res) => {
  async function hi() {
    strings = req.body;
    if (!normal_post(strings, res)) {
      return false;
    }
    if(!normal_db(await set_goal(strings.api_key, strings.daily_goal), res, true)) {
      return false;
    } 
    return true;
  }
  return hi();
});

app.post('/api/fitness_tracker/add_user', (req, res) => {
  // #5
  async function hi(){
    strings = req.body;
    if (!strings.question || !strings.username || !strings.password) {
      res.status(404).json(general_error(405, 'missing required argument(s)', 'argument(s) missing: "question", "username", and/or "password"'));
      return false;
    } else if (strings.question.length < 4 || strings.username.length < 4 || strings.password.length < 4) {
      res.status(400).json(general_error(405, 'invalid "question", "username", and/or "password" length', '"question", "username", and/or "password" parameter is too short(should be 4+ characters)'));
      return false;
    }
    const result = await add_user(strings.username, strings.password, strings.question);
    if(result == false) {
      // if there is a problem with adding the user
      res.status(408).json(general_error(408, 'invalid user', 'user already exists'));
      return false;
    }
    res.json({ message: `Success: user "${strings.username}" added! Your api key is: "${result}. DO NOT LOSE IT BECAUSE WE WILL."` });
    return true;
  }
return hi()
});

// PUT requests
app.put('/api/fitness_tracker/change_username', (req, res) => {
  async function hi() {
    strings = req.body;
    if (!normal_post(strings, res)) {
      return false;
    }
    // TODO: change username
    if (!strings.new_username || !strings.question || !strings.api_key) {
      res.status(404).json(general_error(405, 'missing required argument(s)', 'argument(s) missing: "new_username", "api_key" and/or "question"'));
      return false;
    }
    const result = await change_username(strings.api_key, strings.new_username, strings.question);
    if (result == 1 || result == 2 || result == 3 || result == -1) {
      normal_db(result, res, true);
      return false;
    }
    res.json({ message: 'Success: username changed' });
    return true;
  }
  hi();
});

app.put('/api/fitness_tracker/change_password', (req, res) => {
  async function hi() {
    strings = req.body;
    if (!normal_post(strings, res)) {
      return false;
    }
    // TODO: change username
    if (!strings.new_password || !strings.question || !strings.api_key) {
      res.status(404).json(general_error(405, 'missing required argument(s)', 'argument(s) missing: "new_username", "api_key" and/or "question"'));
      return false;
    }
    const result = await change_password(strings.api_key, strings.new_password, strings.question);
    if (result == 1 || result == 2 || result == 3 || result == -1) {
      normal_db(result, res, true);
      return false;
    }
    res.json({ message: 'Success: password changed' });
    return true;
  }
  hi();
});

app.put('/api/fitness_tracker/:something', (req, res) => {
  res.json({ message: 'PUT request',
  description: 'This is a PUT request, which is used to update an existing resource',
  error: `invalid function: query parameter "${req.params.something}" is not valid`
   });
});
  
// DELETE request
app.delete('/api/fitness_tracker/delete_account', (req, res) => {
  async function hi() {
    try {
      const string = req.body;
      if (!normal_post(string, res)) {
        return false;
      }
        if (!string.are_you_sure) {
          res.status(404).json(general_error(405, 'missing required argument(s)', 'argument(s) missing: "confirm_username"'));
          return false;
        } else if (!string.are_you_sure == "abcdefghijklmnopqrstuvwxyz") {
          res.status(400).json(general_error(603, 'invalid confirmation', 'confirmation does not match'));
          return false;
        }
        const result = await delete_info(string.api_key);
        if (result == 1 || result == 2 || result == 3 || result == -1) {
          normal_db(result, res, true);
          return false;
        }
          res.json({ message: 'Success: user deleted' });
          return true;
    } catch (e) {
      console.log('error: ', e)
      res.json(general_error(501, 'server-side error', 'try again in a few minutes'));
      return false;
    }
  }
  hi()
});

// internal server err to ward of hacker people
app.use((err, req, res, next) => {
  if (err) {
    return res.sendStatus(500);
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${port}`);
});