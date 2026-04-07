import { baseUrl } from "../../components/config/config";
// import { greenhseBaseUrl } from "../../components/config/config";

// Created a header helper component
export const HeaderHelper = () => {
  var accessToken = "";
  const newToken = localStorage.getItem("accessToken");
  if (newToken) {
    accessToken = newToken;
  }
  const header = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + accessToken,
  };
  return header;
};


//Created an api class contains getAPI, postAPI, PutAPI and DeleteAPI.
class AuthApi {

  //get api call
  // async getAPI(url) {
  //   return fetch( url,
  //     {
  //       method: "GET",
  //       headers: HeaderHelper(),
  //     })
  //     .then(res => res.json())
  //     .then(async data => {
  //       return data;
  //     })
  //     .catch(err => {
  //       console.log(err);
  //     });
  // }
async getAPI(url) {
  try {
    const res = await fetch(url, { method: "GET", headers: HeaderHelper() });
    const text = await res.text();
    // console.log("Raw API response:", text); // <- see what server actually sent
    try {
      return JSON.parse(text);
    } catch {
      console.error("Response is not JSON");
      return null;
    }
  } catch (err) {
    console.error("Network error:", err);
    return null;
  }
}




  //post api call
  async postAPI(url,emailParams) {
    // return fetch( url, {
    //   method: 'POST',
    //   headers: HeaderHelper(),
    //   body: emailParams
    // })
    //   .then(APIResponse => APIResponse)
    //   .then(async response => {
    //     return response;
    //   })
    //   .catch(err => {
    //     console.log(err);
    //   });
    return fetch("https://www.getestimate.greenhse.com/api/smtp-email-test.php", emailParams)
    .then((response) => response.json())
     .then((result) => result)
    .catch((error) => console.error(error));
  }

  //update (put) api call
  async updateAPI(url, data) {
    return fetch( url, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: HeaderHelper(),
    })
      .then(APIResponse => APIResponse.json())
      .then(async response => {
        return response;
      })
      .catch(err => {
        console.log(err);
      });
  }

  //delete api call
  async deleteAPI(url, data) {
    console.log({ data, url });

    return fetch( url, {
      method: "DELETE",
      body: JSON.stringify(data),
      headers: HeaderHelper(),
    })
      .then(APIResponse => APIResponse.json())
      .then(response => response);
  }
}
export const authApi = new AuthApi();

