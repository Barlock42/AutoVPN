// import project config
import { config } from "./config.mjs";

import ldapjs from "ldapjs";
const { createClient } = ldapjs;

export class LdapConnection {
  client = null;
  baseDN = "dc=example,dc=org";

  constructor() {
    this.client = createClient({
      url: config.ldap.port,
      // tlsOptions: {
      //   rejectUnauthorized: false
      // }
    });

    this.client.bind("cn=admin,dc=example,dc=org", config.ldap.admin, (err) => {
      if (err) {
        console.error("LDAP connection wasn't successful:", err);
        return;
      }

      console.log("LDAP connection successful");
    });
  }

  addUser(userEmail, userToken) {
    const email = userEmail;
    const userUid = email.substring(0, email.indexOf("@"));

    const searchFilter = `(uid=${userUid})`;
    const searchOptions = {
      filter: searchFilter,
      scope: "sub",
      attributes: ['dn', 'cn', 'mail']
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
            mail: userEmail,
            userPassword: userToken
          };

          const dn = `uid=${newUser.uid},ou=users,dc=example,dc=org`;
          const entry = {
            objectClass: ['top', 'person', 'inetOrgPerson'],
            cn: newUser.uid,
            sn: newUser.uid,
            uid: newUser.uid,
            mail: newUser.mail,
            userPassword: newUser.userPassword
          };

          this.client.add(dn, entry, (err) => {
            if (err) {
              console.error('LDAP add error:', err);
            } else {
              console.log('LDAP add success');
            }
          });
        }
      });
    });
  }

  getUser(userEmail) {
    const email = userEmail;
    const userUid = email.substring(0, email.indexOf("@"));

    const searchFilter = `(uid=${userUid})`;
    const searchOptions = {
      filter: searchFilter,
      scope: "sub",
      attributes: ['dn', 'cn', 'mail']
    };

    this.client.search(this.baseDN, searchOptions, (err, res) => {
      if (err) {
        console.error(err);
        return;
      }

      res.on("error", (err) => {
        console.error(err);
      });

      res.on("end", (result) => {
        return result;
      });
    });
  }
}

