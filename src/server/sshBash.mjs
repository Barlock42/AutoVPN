import { spawn } from "child_process";
// import project config
import { config } from "./config.mjs";
// import sftp client
import { Client } from 'ssh2';
import fs from 'fs';

// Replace the values with your server and key details
const server = {
  host: config.certifcateAuthority.IPAddress,
  username: config.certifcateAuthority.UserName,
  privateKey: config.certifcateAuthority.pathToRSAKey,
  pathToScript: config.certifcateAuthority.pathToScript,
};

const sshConfig = {
  host: server.host,
  port: '22',
  username: server.username,
  privateKey: server.privateKey
};

export function runScript() {
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
    // console.log(`child process exited with code ${code}`);
  });
}

export function getCert() {
  console.log('getCert')
  const conn = new Client();
  conn.on('ready', function() {
    console.log('Client :: ready');
    conn.sftp(function(err, sftp) {
      if (err) throw err;
      const remoteFilePath = config.certifcateAuthority.filePath + config.certifcateAuthority.fileName;
      const localFilePath = config.server.certsPath + config.certifcateAuthority.fileName;
      const readStream = sftp.createReadStream(remoteFilePath);
      const writeStream = fs.createWriteStream(localFilePath);
      readStream.pipe(writeStream);
      readStream.on('close', function() {
        console.log('File transfer completed');
        conn.end();
      });
    });
  }).connect(sshConfig);

}
