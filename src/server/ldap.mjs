import { ldap } from 'ldapjs';
import { config } from "./config.mjs";

export function ldapConnect() {
    const client = ldap.createClient({
        url: config.ldap.port
      });
      
      client.bind('cn=admin,dc=example,dc=org', config.ldap.admin, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      
        console.log('LDAP connection successful');
      
        // Add your LDAP operations here
      });
}

