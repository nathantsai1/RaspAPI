const express = require('express');
const app = express();

const port = 3000;
const PORT = process.env.PORT || 3000;

const fs = require('fs');
const path = require('path')

let strings = '';
let fullUrl, specific, url;
app.use(express.json());  // This will automatically parse JSON request bodies
// this script gets the link, type(CRUD), and spits out the output of the API

// GET requests

// TODO: home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
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
  try {
    strings = req.body;
    // check for required parts
    if (!strings.user || !strings.password || !strings.function) {
      res.status(400).send('40');
      return false;
    }
    // check for correct function
    if (strings.function == "add_user") {
      res.status(400).send('41');
      return false;
    } else if (strings.function != "find_goals") {
      // do something
    } else if (strings.function != "upload_workout") {
      // do
    }
    res.json('hi');
  } catch (e) {
    console.log('error: ', e)
  }
});

// PUT request
app.put('/api/fitness_tracker', (req, res) => {
  res.json({ message: 'PUT request received' });
});
  
// DELETE request
app.delete('/api/fitness_tracker', (req, res) => {
  res.json({ message: 'DELETE request received' });
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${port}`);
});