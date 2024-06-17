import React from "react";
import {
  FormGroup,
  Form,
  TextInput,
  Button,
  ActionGroup,
} from "@patternfly/react-core";
import WrapperConnect from "../Wrapper";
import { useSearchQueryParams } from "../Feeds/usePaginate";

const PluginInstall = () => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const query = useSearchQueryParams();
  const url = query.get("uri");

  let decodedURL = "";

  if (url) {
    decodedURL = decodeURIComponent(url);
  }

  async function handleSave() {
    const adminURL = import.meta.env.VITE_CHRIS_UI_URL;
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
      console.log("Data", data);
    } catch (error) {
      // biome-ignore lint/complexity/noUselessCatch: <explanation>
      throw error;
    }
  }

  return (
    <WrapperConnect>
      <Form isWidthLimited>
        <FormGroup label="Enter username" isRequired>
          <TextInput
            id="username"
            name="username"
            value={username}
            type="text"
            onChange={(_e, value) => setUsername(value)}
          />
        </FormGroup>
        <FormGroup label="Enter password" isRequired>
          <TextInput
            id="password"
            name="password"
            value={password}
            type="password"
            onChange={(_e, value) => setPassword(value)}
          />
        </FormGroup>
        <ActionGroup>
          <Button
            onClick={() => {
              handleSave();
            }}
            isDisabled={!(username && password)}
            variant="primary"
          >
            Submit
          </Button>
        </ActionGroup>
      </Form>
    </WrapperConnect>
  );
};

export default PluginInstall;
