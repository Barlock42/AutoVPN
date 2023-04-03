import axios from "axios";

export function bitrixRequest() {
  axios
    .get("https://your-domain.bitrix24.com/rest/user.get", {
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