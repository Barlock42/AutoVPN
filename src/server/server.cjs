let generateRandomCode = () => {};
import("./codeGen.mjs").then((module) => {
  generateRandomCode = module.generateRandomCode;
});

async function getCode() {
  return await generateRandomCode();
}

console.log(getCode());

// Node.js server that handles form submission
const express = require("express");
const bodyParser = require("body-parser");

const cors = require("cors");
const XLSX = require("xlsx");

let userCode = null;
getCode().then((result) => {
  userCode = result;
  console.log(userCode); // print the string value of userCode
}).catch((err) => {
  console.error(err); // handle any errors that occurred while generating the code
});

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
  }),
  bodyParser.json()
);

app.post("/api/user", (req, res) => {
  const { name, surname, email } = req.body;
  // Load the Excel file
  const workbook = XLSX.readFile(
    "/Users/konstantin/Documents/GitHub/AutoVPN/src/data/User_Download_28022023_154740.xlsx"
  );
  // Get the first sheet name;
  const sheetName = workbook.SheetNames[0];
  // Get the sheet
  const sheet = workbook.Sheets[sheetName];
  // Convert the sheet to JSON object
  //const data = XLSX.utils.sheet_to_json(sheet);

  // Loop through all rows in the sheet and check if the data exists
  for (let i = 2; ; i++) {
    // Assuming row 1 is header
    const nameCell = sheet[`A${i}`]; // Assuming name column is A
    if (!nameCell) {
      // End loop if cell is empty
      break;
    }
    const curName = nameCell.v; // Get the name value

    const surnameCell = sheet[`B${i}`]; // Assuming surname column is B
    const curSurname = surnameCell ? surnameCell.v : ""; // Get the surname value or empty string

    const emailCell = sheet[`C${i}`]; // Assuming email column is C
    const curEmail = emailCell ? emailCell.v : ""; // Get the email value or empty string

    const statusCell = sheet[`D${i}`]; // Assuming status column is D
    const curStatus = statusCell ? statusCell.v : ""; // Get the status value or empty string

    if (
      curName === name &&
      curSurname === surname &&
      curEmail === email &&
      curStatus === "Active"
    ) {
      // Check if all data matches
      console.log(
        `${name} ${surname} with email ${email} exists adn active in the Excel file.`
      );
      console.log(userCode);
      //   transporter.sendMail(message, function(error, info) {
      //     if (error) {
      //         console.log(error);
      //     } else {
      //         console.log('Email sent: ' + info.response);
      //     }
      // });
      break; // Exit loop if data is found
    }
  }
  // send the response back to the client //
  res.json({ message: "Form submitted successfully!" });
});

app.listen(4001, () => {
  //
  console.log("Server started on port 4001");
});
