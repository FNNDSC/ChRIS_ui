import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import {
  Button,
  Card,
  ListVariant,
  LoginForm,
  LoginPage,
} from "@patternfly/react-core";
import { useMutation } from "@tanstack/react-query";
import type React from "react";
import { useEffect, useState } from "react";
import { Cookies, useCookies } from "react-cookie";
import { useNavigate } from "react-router";
import ChrisAPIClient from "../../api/chrisapiclient";
import type * as DoUI from "../../reducers/ui";
import { useAppSelector } from "../../store/hooks";
import { Alert } from "../Antd";
import { SpinContainer } from "../Common";
import { useSearchQueryParams } from "../Feeds/usePaginate";
import { ExclamationCircleIcon } from "../Icons";
import Wrapper from "../Wrapper";

type TDoUI = ThunkModuleToFunc<typeof DoUI>;

type Props = {
  useUI: UseThunk<DoUI.State, TDoUI>;
};

const PluginInstall = (props: Props) => {
  const { useUI } = props;
  const isStaff = useAppSelector((state) => state.user.isStaff);
  const [_cookie, setCookie] = useCookies();
  const navigate = useNavigate();
  const [showHelperText, setShowHelperText] = useState(false);
  const [username, setUsername] = useState("");
  const [isValidUsername, setIsValidUsername] = useState(true);
  const [password, setPassword] = useState("");
  const [isValidPassword, setIsValidPassword] = useState(true);
  const [isRememberMeChecked, setIsRememberMeChecked] = useState(false);

  const query = useSearchQueryParams();
  const url = query.get("uri");
  const pluginName = query.get("plugin");
  let decodedURL = "";
  if (url) {
    decodedURL = decodeURIComponent(url);
  }

  const handleSave = async () => {
    const adminURL = import.meta.env.VITE_CHRIS_UI_URL;

    if (!adminURL) {
      throw new Error("Failed to fetch the admin url");
    }

    const modifiedURL = adminURL.replace("/api/v1/", "/chris-admin/api/v1/");

    const client = ChrisAPIClient.getClient();
    const admin = client.auth.token;
    const nonAdmin = btoa(`${username.trim()}:${password.trim()}`); // Base64 encoding for Basic Auth

    const authorization = isStaff ? `Token ${admin}` : `Basic ${nonAdmin}`;

    const pluginData = {
      compute_names: "host",
      plugin_store_url: decodedURL,
    };

    try {
      const response = await fetch(modifiedURL, {
        method: "POST",
        headers: {
          Authorization: authorization,
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
  };

  const { isPending, isSuccess, isError, error, data, mutate } = useMutation({
    mutationFn: async () => await handleSave(),
  });

  useEffect(() => {
    const cookies = new Cookies();

    if (cookies.get("admin_username")) {
      setUsername(cookies.get("admin_username"));
    }

    if (cookies.get("admin_password")) {
      setPassword(cookies.get("admin_password"));
    }
  }, []);

  useEffect(() => {
    if (isSuccess) {
      if (data) {
        const url = data.collection.items[0].links[0].href;

        const regex = /\/(\d+)\//;
        const match = url.match(regex);
        //convert id into number and check if it is valid
        const id = match ? +match[1] : null;

        if (typeof id === "number" && !Number.isNaN(id)) {
          if (isRememberMeChecked) {
            const oneDayToSeconds = 24 * 60 * 60;
            setCookie("admin_username", username, {
              path: "/",
              maxAge: oneDayToSeconds,
            });
            setCookie("admin_password", password, {
              path: "/",
              maxAge: oneDayToSeconds,
            });
          }

          setTimeout(() => {
            navigate(`/plugin/${id}`);
          }, 1500);
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

  const nonLoginForm = (
    <Card>
      <Button
        onClick={() => {
          mutate();
        }}
      >
        Click to Install
      </Button>
    </Card>
  );

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
    <Wrapper useUI={useUI}>
      <LoginPage
        footerListVariants={ListVariant.inline}
        backgroundImgSrc="/assets/images/pfbg-icon.svg"
        textContent="You can now install plugins from our public servers with the click of a button. All you need are the credentials to your admin account."
        loginTitle={
          !isStaff ? "Admin Login" : "Great! Let's install the plugin."
        }
        loginSubtitle={`${
          pluginName
            ? `You are trying to install ${pluginName} from one of our remote servers`
            : ""
        } ${!isStaff ? "Enter your admin credentials" : ""}`}
      >
        {!isStaff ? loginForm : nonLoginForm}
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
              description="Plugin installed successfully Redirecting you to the plugin page..."
            />
          )}
        </div>
      </LoginPage>
    </Wrapper>
  );
};

export default PluginInstall;
