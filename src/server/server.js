// Node.js server that handles form submission
const express = require('express');
const bodyParser = require('body-parser');

const cors = require('cors');

const app = express();
app.use(cors(bodyParser.json()));

app.post('/api/user', (req, res) => {
  const { name, surname, email } = req.body;
  // process the form data here
  // ...
  // send the response back to the client
  console.log('Got the message');
  res.json({ message: 'Form submitted successfully!' });
  console.log('Got the message');
});

app.listen(4000, () => {
  console.log('Server started on port 4000');
});