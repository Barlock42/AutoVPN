import axios from "axios";
import { config } from "./config.mjs";

export function bitrixRequest() {
  return axios
    .get(config.bitixAddress, {
      params: {
        filter: { ACTIVE: "1" },
        // add any other parameters required by the API method
      },
    })
    .then((response) => {
      // handle successful response
      console.log(response.data.result);
      return response.data.result;
    })
    .catch((error) => {
      // handle error
      console.error(error);
      throw error;
    });
}
