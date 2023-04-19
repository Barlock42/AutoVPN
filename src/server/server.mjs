import { generateToken } from "./tokenGen.mjs";
import { bitrixRequest } from "./bitrixRequest.mjs";
import { runScript, getCert } from "./sshBash.mjs";
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
import { getDatabase, ref, push, onValue } from "firebase/database";
import admin from "firebase-admin";
import { serviceAccount } from "./serviceAccount.mjs";

import cors from "cors";
import { SES } from "@aws-sdk/client-ses";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.firebaseConfig.databaseURL,
});

const db = admin.database();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // disables the SSL/TLS certificate verification for all HTTPS requests
const ses = new SES({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.region, // replace with your preferred region
});

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

  ses.sendEmail(params, (err, data) => {
    if (err) {
      // console.error(`Error sending verification email: ${err.message}`);
    } else {
      // console.log(`Verification email sent to ${email}`);
    }
  });
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

      // Look through all emails
      if (emails.includes(email)) {
        emailFound = true;
        // console.log(`Email ${email} exists and active in Bitrix.`);

        // Check if user exists
        const usersRef = db.ref("users");
        // Access Firebase Realtime Database
        usersRef
          .orderByChild("email")
          .equalTo(email)
          .once("value")
          // eslint-disable-next-line no-loop-func
          .then((snapshot) => {
            if (snapshot.exists()) {
              // console.log(`Element with email ${email} exists.`);
              snapshot.forEach((childSnapshot) => {
                const userKey = childSnapshot.key;
                const user = childSnapshot.val();
                // console.log(user);
                if (user.issued) {
                  // console.log(
                  //   `User with email ${email} has been issued a token.`
                  // );

                  // console.log("Token value:", user.token);
                  sendVerificationEmail(
                    email,
                    `http://localhost:4000/api/verification/download?token=${user.token}`
                  );
                } else {
                  console.log(
                    `User with email ${email} has not been issued a token.`
                  );

                  // Update the 'issued' field in the existing record
                  // usersRef.child(userKey).update({
                  //   issued: true,
                  // });

                  runScript(getCert); // run script on serverSide to get a certificate

                  // console.log("Token value:", userToken);
                  // sendVerificationEmail(
                  //   email,
                  //   `http://localhost:4000/api/verification/download?token=${userToken}`
                  // );
                }
              });
            } else {
              // console.log(`Element with email ${email} does not exists.`);
              // User does not exist, add them to the database
              push(usersRef, {
                email: email,
                token: userToken,
                time: new Date().getTime(),
                issued: false,
              });

              runScript(); // run script on serverSide to get a certificate
              // console.log("Token value:", userToken);
              sendVerificationEmail(
                email,
                `http://localhost:4000/api/verification/download?token=${userToken}`
              );
            }
          })
          .catch((error) => {
            // console.log("Error: ", error);
          });

        // send the response back to the client
        res.json({
          message: "На ваш адрес отправлено письмо для подтверждения почты.",
        });
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
  // console.log("Got download request");
  // console.log(req.url);
  const parsedUrl = url.parse(req.url);

  //console.log(parsedUrl.query);
  const queryParam = querystring.parse(parsedUrl.query);

  // console.log("Token value:", queryParam.token);

  if (!!queryParam.token) {
    // The token is not null or undefined
    // Check if token exists
    const usersRef = db.ref("users");
    // Access Firebase Realtime Database
    usersRef
      .orderByChild("token")
      .equalTo(queryParam.token)
      .once("value")
      .then((snapshot) => {
        if (snapshot.exists()) {
          // console.log(`Element with token ${queryParam.token} exists.`);
          const filePath = path.join(
            config.certificate.path,
            config.certificate.name
          );
          // console.log(filePath);
          const stat = fs.statSync(filePath);

          res.setHeader("Content-Length", stat.size);
          res.setHeader("Content-Type", "application/octet-stream");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename=${config.certificate.name}`
          );

          const readStream = fs.createReadStream(filePath);
          readStream.pipe(res);
        } else {
          // console.log("Trying to redirect");
          res.status(400).send("Токен недействителен.");
          // res.redirect(
          //   `http://localhost:3000/result?variable=${JSON.stringify(
          //     "Токен недействителен."
          //   )}`
          // );
        }
      });
  } else {
    // The token is null or undefined
    res.status(400).send("Токен не предоставлен.");
  }
});

const PORT = 4000;

app.listen(4000, () => {
  console.log(`Server started on port ${PORT}`);
});
