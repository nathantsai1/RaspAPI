const express = require('express');
const app = express();
const port = 3000;
const PORT = process.env.PORT || 3000;
const fs = require('fs');
let strings = '';
let fullUrl, specific, url;

// GET request
app.get('/api/fitness_tracker', (req, res) => {
    res.json({ introduction: 'Hello, and welcome to the "weather API"',
      description: "This API is designed to work in tandom with the Weather App",
    help: "use the /api/fitness_tracker/help endpoint to get more information on how to use this API"});
});
  
app.get('/api/fitness_tracker/:help', (req, res) => {
  // get help/error list and send to API
  fullUrl = req.originalUrl;
  specific = fullUrl.slice(21);
  if (specific.includes("help")) {
    url = "txt/list.txt"
  } else {
    url = "txt/errors.txt"
  }
  fs.readFile(url, (err, data) => {
    if (err) throw err;
    res.json({help: data.toString()});
    return true;
  });
});

// POST request
app.post('/api/fitness_tracker', (req, res) => {
  let data = '';
  req.on('data', chunk => {
    data += chunk.toString();
  });
  req.on('end', () => {
  console.log(data)
  try {
    strings = JSON.parse(data.replace(/(\w+)=(\w+)/g, '"$1":"$2"'));
    if (!strings.user || !strings.message) {
      res.status(400).send('40');
      return;
    }
    res.json({ message: 'POST request received' });
  } catch (e) {
    console.log('error', e)
  }

    // res.end('Data received');
  });
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