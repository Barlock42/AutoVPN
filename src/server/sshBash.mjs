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

export function runScript(callback) {
  // Replace the path and filename with your Bash script details
  const script = spawn("ssh", [
    "-i",
    `${server.privateKey}`,
    `${server.username}@${server.host}`,
    "bash",
    server.pathToScript,
  ]);

  script.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  script.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  script.on("close", (code) => {
    if (code === 0) {
      // console.log("Script ran successfully");
      // Call the callback function after the script has finished
      if (callback()) return true;
      else return false;
    } else {
      // console.error(`Script failed with code ${code}`);
      return false;
    }
  });
}

export function getCert() {
  const script = spawn("scp", [
    "-i",
    `${server.privateKey}`,
    `${server.username}@${server.host}:${
      config.certifcateAuthority.filePath + config.certifcateAuthority.fileName
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
      // console.log("Certificate downloaded successfully");
      return true;
    } else {
      // console.error(`Certificate download failed with code ${code}`);
      return false;
    }
  });
}
