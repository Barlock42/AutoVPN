const express = require("express");
const multer = require("multer");

const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // save files to the uploads directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // use the original file name
  },
});

const upload = multer({ storage });

app.post("/submit-form", upload.single("file"), (req, res) => {
  const formData = req.body;
  const fileData = req.file;
  console.log(formData); // display the submitted form data
  console.log(fileData); // display the uploaded file data
  // process the file here, e.g. read data from the file and save to a database
  res.send("Form submitted successfully!");
});

app.listen(3001, () => {
  console.log("Server listening on port 3001");
});
