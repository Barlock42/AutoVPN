// import project config
import { config } from "./config.mjs";

import ldapjs from "ldapjs";
const { createClient } = ldapjs;

export function ldapConnect() {
  const client = createClient({
    url: config.ldap.port,
  });

  client.bind("cn=admin,dc=userDataBase,dc=org", config.ldap.admin, (err) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log("LDAP connection successful");

    // Replace with the actual base DN and search filter for your LDAP directory
    const baseDN = "dc=userDataBase,dc=org";
    const searchFilter = "(uid=john)";

    const searchOptions = {
      filter: searchFilter,
      scope: "sub",
      attributes: ["dn"],
    };

    client.search(baseDN, searchOptions, (err, res) => {
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
            cn: "John Doe",
            sn: "Doe",
            uid: "john",
            password: "secret",
            email: "john@example.com",
          };

          client.add(`uid=${newUser.uid},${baseDN}`, newUser, (err) => {
            if (err) {
              console.error(err);
              return;
            }

            console.log("New user created:", newUser.uid);
          });
        }
      });
    });
  });
}
