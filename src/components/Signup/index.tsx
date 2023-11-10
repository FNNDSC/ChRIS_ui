import { LoginPage } from "@patternfly/react-core";
import SignUpForm from "./SignUpForm";

const SignUp = () => {
  return (
    <LoginPage
      className="login pf-background"
      loginTitle="Sign up for a new account"
    >
      <SignUpForm />
    </LoginPage>
  );
};

export default SignUp;
