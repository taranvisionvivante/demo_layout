import { authApi } from "../utilities/helpers/ApiHelper";
import { greenhseBaseUrl } from "../components/config/config.js";

const GetAllCategoriesApi = async (id) => {
  const url = `https://www.getestimate.greenhse.com/api/categories.php?id=${id}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      console.error("API error:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
};

  
  
  const GetProductApi = async(id) =>  {

    let url = greenhseBaseUrl+`product.php?id=${id}`;
    // alert(url)

    try{
        const response = await authApi.getAPI(url);
        // if (response.headers.success === 200) {
        //     return response
        // } else {
        //     console.error(response.headers.message, { duration: 4000, },);
        // }\
        // console.log("response",response)
        return response;
    } catch(e){
      console.error("Something went wrong!", e);
    }
  }

  const GetAllProductApi = async(id) =>  {

    let url = greenhseBaseUrl+`allproduct.php`;
    try{
        const response = await authApi.getAPI(url);
        // if (response.headers.success === 200) {
        //     return response
        // } else {
        //     console.error(response.headers.message, { duration: 4000, },);
        // }\
        // console.log("response",response)
        return response;
    } catch(e){
      console.error("Something went wrong!", e);
    }
  }


  export{ GetAllCategoriesApi, GetProductApi, GetAllProductApi }

  