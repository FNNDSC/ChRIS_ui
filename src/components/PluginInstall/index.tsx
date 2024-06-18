import { ListVariant, LoginForm, LoginPage } from "@patternfly/react-core";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { useSearchQueryParams } from "../Feeds/usePaginate";
import { ExclamationCircleIcon } from "../Icons";
import WrapperConnect from "../Wrapper";
import { Alert } from "antd";
import { SpinContainer } from "../Common";
import { useNavigate } from "react-router";

const PluginInstall = () => {
  const navigate = useNavigate();
  const [showHelperText, setShowHelperText] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [isValidUsername, setIsValidUsername] = React.useState(true);
  const [password, setPassword] = React.useState("");
  const [isValidPassword, setIsValidPassword] = React.useState(true);
  const [isRememberMeChecked, setIsRememberMeChecked] = React.useState(false);

  const query = useSearchQueryParams();
  const url = query.get("uri");
  let decodedURL = "";
  if (url) {
    decodedURL = decodeURIComponent(url);
  }

  async function handleSave() {
    const adminURL = import.meta.env.VITE_CHRIS_UI_URL;

    if (!adminURL) {
      throw new Error("Failed to fetch the admin url");
    }

    const modifiedURL = adminURL.replace("/api/v1/", "/chris-admin/api/v1/");
    const credentials = btoa(`${username.trim()}:${password.trim()}`); // Base64 encoding for Basic Auth
    const pluginData = {
      compute_names: "host",
      plugin_store_url: decodedURL,
    };

    try {
      const response = await fetch(modifiedURL, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pluginData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      // biome-ignore lint/complexity/noUselessCatch: <explanation>
      throw error;
    }
  }

  const { isPending, isSuccess, isError, error, data, mutate } = useMutation({
    mutationFn: async () => await handleSave(),
  });

  React.useEffect(() => {
    if (isSuccess) {
      if (data) {
        const id = data.collection.items[0].data[0].value;
        if (typeof id === "number" && !Number.isNaN(id)) {
          navigate(`/plugin/${id}`);
        }
      }
    }
  }, [isSuccess]);

  const handleUsernameChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string,
  ) => {
    setUsername(value);
  };

  const handlePasswordChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string,
  ) => {
    setPassword(value);
  };

  const onRememberMeClick = () => {
    setIsRememberMeChecked(!isRememberMeChecked);
  };

  const onLoginButtonClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault();
    setIsValidUsername(!!username);
    setIsValidPassword(!!password);
    setShowHelperText(!username || !password);

    if (username && password) {
      mutate();
    }
  };

  const loginForm = (
    <LoginForm
      showHelperText={showHelperText}
      helperText="Invalid login credentials."
      helperTextIcon={<ExclamationCircleIcon />}
      usernameLabel="Username"
      usernameValue={username}
      onChangeUsername={handleUsernameChange}
      isValidUsername={isValidUsername}
      passwordLabel="Password"
      passwordValue={password}
      onChangePassword={handlePasswordChange}
      isValidPassword={isValidPassword}
      rememberMeLabel="Keep me logged in."
      isRememberMeChecked={isRememberMeChecked}
      onChangeRememberMe={onRememberMeClick}
      onLoginButtonClick={onLoginButtonClick}
      loginButtonLabel="Log in"
    />
  );

  return (
    <WrapperConnect>
      <LoginPage
        footerListVariants={ListVariant.inline}
        backgroundImgSrc="/assets/images/pfbg-icon.svg"
        textContent="You can now install plugins from our public servers with the click of a button. All you need are the credentials for your admin account"
        loginTitle="Admin Login"
        loginSubtitle="Enter your admin credentials."
      >
        {loginForm}
        <div
          style={{
            marginTop: "1rem",
          }}
        >
          {isPending && <SpinContainer title="Installing the plugin..." />}
          {isError && <Alert type="error" description={error.message} />}
          {isSuccess && (
            <Alert
              type="success"
              description="Plugin installed successfully..."
            />
          )}
        </div>
      </LoginPage>
    </WrapperConnect>
  );
};

export default PluginInstall;
