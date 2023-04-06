import { config } from "./config.mjs";
import { Client } from "ssh2";
import { readFileSync } from "fs";

export function runScript() {
  const conn = new Client();
  conn
    .on("ready", function () {
      console.log("Client :: ready");
      conn.exec("bash " + config.pathToScript, function (err, stream) {
        if (err) throw err;
        stream
          .on("close", function (code, signal) {
            console.log(
              "Stream :: close :: code: " + code + ", signal: " + signal
            );
            conn.end();
          })
          .on("data", function (data) {
            console.log("STDOUT: " + data);
          })
          .stderr.on("data", function (data) {
            console.log("STDERR: " + data);
          });
      });
    })
    .connect({
      host: config.certificateAuthorityIPAddress,
      port: 22,
      username: config.certificateAuthorityUserName,
      privateKey: readFileSync(config.pathToRSAKey)
    });
}
