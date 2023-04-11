// import project config
import { config } from "./config.mjs";

import ldapjs from "ldapjs";
const { createClient } = ldapjs;

export class LdapConnection {
  client = null;
  baseDN = "dc=userDataBase,dc=org";

  constructor() {
    this.client = createClient({
      url: config.ldap.port,
    });

    this.client.bind("cn=admin,dc=userDataBase,dc=org", config.ldap.admin, (err) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log("LDAP connection successful");
    });
  }

  addUser(userEmail, userToken) {
    const email = userEmail;
    const userUid = email.substring(0, email.indexOf("@"));
    console.log(userUid); // Output: john.doe

    const searchFilter = `(uid=${userUid})`;
    const searchOptions = {
      filter: searchFilter,
      scope: "sub",
      attributes: ["dn"],
    };

    this.client.search(this.baseDN, searchOptions, (err, res) => {
      if (err) {
        console.error(err);
        return;
      }

      let foundUser = false;

      res.on("searchEntry", (entry) => {
        foundUser = true;
        console.log(`User already exists: ${entry.dn}`);
      });

      res.on("error", (err) => {
        console.error(err);
      });

      res.on("end", (result) => {
        if (!foundUser) {
          // User does not exist, create a new entry
          const newUser = {
            uid: userUid,
            email: userEmail,
            token: userToken,
          };

          this.client.add(
            `uid=${newUser.uid},${this.baseDN}`,
            newUser,
            (err) => {
              if (err) {
                console.error(err);
                return;
              }

              console.log("New user created:", newUser.uid);
            }
          );
        }
      });
    });
  }

  getUser(userEmail) {
    const email = userEmail;
    const userUid = email.substring(0, email.indexOf("@"));
    console.log(userUid); // Output: john.doe

    const searchFilter = `(uid=${userUid})`;
    const searchOptions = {
      filter: searchFilter,
      scope: "sub",
      attributes: ["dn"],
    };

    this.client.search(this.baseDN, searchOptions, (err, res) => {
      if (err) {
        console.error(err);
        return;
      }

      let foundUser = false;

      res.on("searchEntry", (entry) => {
        foundUser = true;
        console.log(`User already exists: ${entry.dn}`);
      });

      res.on("error", (err) => {
        console.error(err);
      });

      res.on("end", (result) => {
        return foundUser;
      });
    });
  }
}
