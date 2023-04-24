import { spawn } from "child_process";
// import project config
import { config } from "./config.mjs";

// Replace the values with your server and key details
const server = {
  host: config.certifcateAuthority.IPAddress,
  username: config.certifcateAuthority.UserName,
  privateKey: config.certifcateAuthority.pathToRSAKey,
  pathToScript: config.certifcateAuthority.pathToScript,
};

export async function runScript(callback, email) {
  return new Promise((resolve, reject) => {
    // Replace the path and filename with your Bash script details
    const script = spawn("ssh", [
      "-i",
      `${server.privateKey}`,
      `${server.username}@${server.host}`,
      "sudo",
      "bash",
      server.pathToScript,
      email
    ]);

    script.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    script.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    script.on("close", async (code) => {
      if (code === 0) {
        // console.log("Script ran successfully");
        // Call the callback function after the script has finished
        if (await callback(email)) resolve(true);
        else resolve(false);
      } else {
        // console.error(`Script failed with code ${code}`);
        resolve(false);
      }
    });
  });
}

export async function getCert(email) {
  return new Promise((resolve, reject) => {
    const script = spawn("scp", [
      "-i",
      `${server.privateKey}`,
      `${server.username}@${server.host}:${
        config.certifcateAuthority.filePath +
        email + ".ovpn"
      }`,
      config.server.certsPath,
    ]);

    script.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    script.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    script.on("close", (code) => {
      if (code === 0) {
        console.log("Certificate downloaded successfully");
        resolve(true);
      } else {
        console.error(`Certificate download failed with code ${code}`);
        resolve(false);
      }
    });
  });
}
