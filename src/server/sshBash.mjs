import { spawn } from 'child_process';
// import project config
import { config } from "./config.mjs";

export function runScript() {

  // Replace the values with your server and key details
  const server = {
    host: config.certificateAuthorityIPAddress,
    username: config.certificateAuthorityUserName,
    privateKey: config.pathToRSAKey,
  };

  // Replace the path and filename with your Bash script details
  const script = spawn("ssh", [
    "-i",
    `${server.privateKey}`,
    `${server.username}@${server.host}`,
    "bash",
    config.pathToScript,
  ]);

  script.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  script.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  script.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
  });
}
