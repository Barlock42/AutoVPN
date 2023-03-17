// Node.js server that handles form submission
const express = require('express');
const bodyParser = require('body-parser');

const cors = require('cors');
const XLSX = require('xlsx');

const app = express();
app.use(cors({
    origin: 'http://localhost:3000'
  }), bodyParser.json());

app.post('/api/user', (req, res) => {
  const { name, surname, email } = req.body;
  // Load the Excel file
  const workbook = XLSX.readFile('/Users/konstantin/Documents/GitHub/AutoVPN/src/data/User_Download_28022023_154740.xlsx');
  // Get the first sheet name;
  const sheetName = workbook.SheetNames[0];
  // Get the sheet
  const sheet = workbook.Sheets[sheetName];
  // Convert the sheet to JSON object
  console.log(sheet);
  //const data = XLSX.utils.sheet_to_json(sheet);
  // send the response back to the client
  res.json({ message: 'Form submitted successfully!' });
});

app.listen(4000, () => {
  console.log('Server started on port 4000');
});