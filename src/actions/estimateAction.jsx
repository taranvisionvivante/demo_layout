import { authApi } from "../utilities/helpers/ApiHelper";
import { greenhseBaseUrl } from "../components/config/config.jsx";


const SmtpEmailApi = async (emailParams) => {
    const url = greenhseBaseUrl + 'smtp-email-test.php';
    try {
        const response = await authApi.postAPI(url, emailParams);
        return response;
    } catch (error) {
        console.error("Something went wrong!", error);
    }
};

  export {SmtpEmailApi}