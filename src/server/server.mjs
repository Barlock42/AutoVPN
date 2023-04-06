import { generateRandomCode } from "./codeGen.mjs";
import { bitrixRequest } from "./bitrixRequest.mjs";
import { config } from "./config.mjs";

// Node.js server that handles form submission
import express from "express";
import bodyParser from "body-parser";

import cors from "cors";
import AWS from "aws-sdk";

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // disables the SSL/TLS certificate verification for all HTTPS requests
const ses = new AWS.SES({
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey,
  region: config.region, // replace with your preferred region
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
          Data: `Введите 6-значный код ${userCode} для подтверждения.
          Click <a href="${verificationLink}">here</a> to verify your email address.`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Verify your email address",
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

let userCode = generateRandomCode();
const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
  }),
  bodyParser.json()
);

app.post("/api/user", (req, res) => {
  const { name, surname, email } = req.body;

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
            `${name} ${surname} with email ${email} exists and active in Bitrix.`
          );
          console.log(userCode);
          sendVerificationEmail(
            email,
            "http://localhost:4000/api/verification/"
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
