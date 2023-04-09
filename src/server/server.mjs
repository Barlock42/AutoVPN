import { generateToken } from "./tokenGen.mjs";
import { bitrixRequest } from "./bitrixRequest.mjs";
import { runScript } from "./sshBash.mjs";
import { ldapConnect } from "./ldap.mjs";
// import project config
import { config } from "./config.mjs";

// Node.js server that handles form submission
import express from "express";
import bodyParser from "body-parser";

import cors from "cors";
import AWS from "aws-sdk";

// ldapConnect();

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // disables the SSL/TLS certificate verification for all HTTPS requests
const ses = new AWS.SES({
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
    // await ses.sendEmail(params).promise();
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
      //console.log(emails);

      // Loop through all emails
      for (let i = 1; ; i++) {
        if (emails[i] === email) {
          // Check if all data matches
          console.log(
            `Email ${email} exists and active in Bitrix.`
          );

          sendVerificationEmail(
            email,
            `http://localhost:4000/api/verification?${userToken}`
          );
          break; // Exit loop if data is found
        }
      }
    })
    .catch((error) => {
      // handle error
      console.error(error);
    });

  // send the response back to the client
  res.json({ message: "Form submitted successfully!" });
});

app.listen(4000, () => {
  console.log("Server started on port 4000");
});
