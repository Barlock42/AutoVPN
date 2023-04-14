import { generateToken } from "./tokenGen.mjs";
import { bitrixRequest } from "./bitrixRequest.mjs";
import { runScript } from "./sshBash.mjs";
// import project config
import { config } from "./config.mjs";

import url from "url";
import querystring from "querystring";

import path from "path";
import fs from "fs";

// Node.js server that handles form submission
import express from "express";
import bodyParser from "body-parser";

// Firebase connection
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue } from "firebase/database";

import cors from "cors";
import { SES } from "@aws-sdk/client-ses";

// Initialize Firebase
// Initialize Firebase
const firebaseConfig = config.firebaseConfig;
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // disables the SSL/TLS certificate verification for all HTTPS requests
const ses = new SES({
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey,
  region: config.region, // replace with your preferred region
});

// runScript(); // run script on serverSide to get a certificate

const sendVerificationEmail = async (email, verificationLink) => {
  const params = {
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `
          Нажмите <a href="${verificationLink}">сюда</a> для подтверждения вашего email адреса.`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Подтверждения вашего email адреса",
      },
    },
    Source: config.email, // replace with your verified email address
  };

  try {
    await ses.sendEmail(params).promise();
    console.log(`Verification email sent to ${email}`);
  } catch (err) {
    console.error(
      `Error sending verification email to ${email} from ${config.email}: ${err.message}`
    );
  }
};

let userToken = generateToken();

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
  }),
  bodyParser.json()
);

app.post("/api/user", (req, res) => {
  const { email } = req.body;

  bitrixRequest()
    .then((json) => {
      // use the JSON data returned by the Bitrix API
      const emails = json.map((item) => item.EMAIL);
      // console.log(emails.length);
      let emailFound = false;

      // Loop through all emails
      for (let i = 0; i < emails.length; i++) {
        if (emails[i] === email) {
          emailFound = true;
          // Check if all data matches
          console.log(`Email ${email} exists and active in Bitrix.`);

          // Check if user exists
          const usersRef = ref(database, "users");
          // Access Firebase Realtime Database
          onValue(ref(database, "users"), (snapshot) => {
            if (!snapshot.exists()) {
              // User does not exist, add them to the database
              push(usersRef, {
                email: email,
                token: userToken,
                time: new Date().getTime(),
                issued: false,
              });
            }
          });

          sendVerificationEmail(
            email,
            `http://localhost:4000/api/verification/download?token=${userToken}`
          );

          // send the response back to the client
          res.json({
            message: "На ваш адрес отправлено письмо для подтверждения почты.",
          });
          break; // Exit loop if data is found
        }
      }

      if (!emailFound) {
        console.error(`Email ${email} doesn't exist or not active in Bitrix.`);
        // send the response back to the client
        res.json({ message: "Ваш email не был найден." });
      }
    })
    .catch((error) => {
      // handle error
      console.error(error);
    });
});

app.get("/api/verification/download", (req, res) => {
  console.log("Got download request");
  // console.log(req.url);
  const parsedUrl = url.parse(req.url);

  //console.log(parsedUrl.query);
  const queryParam = querystring.parse(parsedUrl.query);

  console.log("Token value:", queryParam.token);

  const filePath = path.join(config.certPath, config.certName);
  console.log(filePath);
  const stat = fs.statSync(filePath);

  res.setHeader("Content-Length", stat.size);
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${config.certName}`
  );

  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
});

const PORT = 4000;

app.listen(4000, () => {
  console.log(`Server started on port ${PORT}`);
});
