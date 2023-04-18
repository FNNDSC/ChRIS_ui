import { Cookies } from "react-cookie";

const useCookieToken = () => {
  const cookie = new Cookies();
  const user = cookie.get("username");
  const token: string = cookie.get(`${user}_token`);
  return token;
};
export default useCookieToken;
