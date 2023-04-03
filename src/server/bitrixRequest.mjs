import axios from "axios";
import { config } from './config.mjs';

export function bitrixRequest() {
  axios
    .get( config.bitixAddress , {
      params: {
        filter: {},
        auth: "your-auth-token",
        // add any other parameters required by the API method
      },
    })
    .then((response) => {
      // handle successful response
      console.log(response.data.result);
    })
    .catch((error) => {
      // handle error
      console.error(error);
    });
}