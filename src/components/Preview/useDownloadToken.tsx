import { useEffect, useState } from "react";
import ChrisAPIClient from "../../api/chrisapiclient";

const useDownloadToken = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    async function fetchToken() {
      const client = ChrisAPIClient.getClient();
      const response = await client.createDownloadToken();
      const token = response.data.token;
      setToken(token);
    }
    fetchToken();
  }, []);

  return token;
};

export default useDownloadToken;
