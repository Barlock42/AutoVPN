// import project config
import { config } from "./config.mjs";

import mongodb from "mongodb";
const { Server, MongoClient, Db } = mongodb;

export class MongoConnection {
  client = null;
  db = null;
  uri = config.mongo.uri;

  constructor() {
    this.client = new MongoClient(this.uri);

    // Use connect method to connect to the server
    this.client.connect(function (err) {
      console.log("Connected successfully to server");
      const db = this.client.db();
    });

    // this.client.connect(function (err) {
    //   if (err) throw err;
    // });
    // console.log("Connected successfully to server");
  }

  addUser() {
    const username = "myusername";
    const password = "mypassword";
    const roles = [{ role: "readWrite", db: "mydatabase" }];

    this.client.db()(
      { user: username, pwd: password, roles: roles },
      (err, result) => {
        if (err) {
          console.error(err);
          return;
        }

        console.log("User created");
      }
    );
  }
}
