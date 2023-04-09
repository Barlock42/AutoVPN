// import project config
import { config } from "./config.mjs";

import ldapjs from "ldapjs";
const { createClient } = ldapjs;

export function ldapConnect() {
  const client = createClient({
    url: config.ldap.port,
  });

  client.bind("cn=admin,dc=example,dc=org", config.ldap.admin, (err) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log("LDAP connection successful");

    // Add your LDAP operations here
  });
}
