// Node.js server that handles form submission
const express = require('express');
const bodyParser = require('body-parser');

const cors = require('cors');

const app = express();
app.use(cors({
    origin: 'http://localhost:3000'
  }), bodyParser.json());

app.post('/api/user', (req, res) => {
  const { name, surname, email } = req.body;
  // process the form data here
  // ...
  // send the response back to the client
  res.json({ message: 'Form submitted successfully!' });
});

app.listen(4000, () => {
  console.log('Server started on port 4000');
});