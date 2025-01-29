import type {
  Plugin,
  PluginInstance,
  PluginMeta,
  PluginParameter,
} from "@fnndsc/chrisapi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Alert, Spin } from "antd";
import highlightjs from "highlight.js"; // npm install highlight.js
import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";
import type React from "react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  ActionGroup,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  ClipboardCopyButton,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  Form,
  FormGroup,
  FormHelperText,
  Grid,
  GridItem,
  HelperText,
  HelperTextItem,
  List,
  ListItem,
  MenuToggle,
  Modal,
  Tab,
  TabTitleText,
  Tabs,
  TextInput,
  Title,
} from "@patternfly/react-core";
import { CheckCircleIcon, UserAltIcon } from "@patternfly/react-icons";

import ChrisAPIClient from "../../api/chrisapiclient";
import { fetchResource } from "../../api/common";
import PluginImg from "../../assets/brainy-pointer.png";
import { useTypedSelector } from "../../store/hooks";
import { unpackParametersIntoString } from "../AddNode/utils";
import {
  ClipboardCopyFixed,
  EmptyStateComponent,
  SpinContainer,
} from "../Common";
import WrapperConnect from "../Wrapper";
import "./singlePlugin.css";
import "./github-markdown.css";

/**
 * Suppose your DarkTheme logic is here:
 */
import { ThemeContext } from "../DarkTheme/useTheme";

export type ParameterPayload = {
  generatedCommand: string;
  version: string;
  url: string;
  computes: any[];
  pluginInstances: PluginInstance[];
};

const SinglePlugin = () => {
  const isLoggedIn = useTypedSelector(({ user }) => user.isLoggedIn);
  const { id } = useParams<{ id: string }>();
  const [parameterPayload, setParameterPayload] = useState<ParameterPayload>();

  /**
   * Fetch README from GitHub. Convert it to HTML if it's .md/.rst,
   * otherwise wrap in <pre> for raw display.
   */
  const fetchReadme = async (currentPluginMeta?: PluginMeta) => {
    if (!currentPluginMeta) return "";
    const repo = currentPluginMeta.data.public_repo.split("github.com/")[1];
    const ghreadme = await fetch(`https://api.github.com/repos/${repo}/readme`);
    if (!ghreadme.ok) {
      return "";
    }
    const { download_url, content }: { download_url: string; content: string } =
      await ghreadme.json();

    const file = atob(content);
    const extension = download_url.split(".").pop()?.toLowerCase();

    if (extension === "md" || extension === "rst") {
      return micromark(file, {
        extensions: [gfm()],
        htmlExtensions: [gfmHtml()],
      });
    }
    return `<pre>${file}</pre>`;
  };

  /**
   * Fetch plugin meta, all plugin versions, plus README
   */
  const fetchPlugins = async (pluginMetaId: number) => {
    const client = ChrisAPIClient.getClient();
    const pluginMeta = await client.getPluginMeta(pluginMetaId);
    document.title = pluginMeta.data.name;

    const boundFn = pluginMeta.getPlugins.bind(pluginMeta);
    const params = { limit: 1000, offset: 0 };
    const results = await fetchResource<Plugin>(params, boundFn);

    const readme = await fetchReadme(pluginMeta);

    return {
      currentPluginMeta: pluginMeta,
      plugins: results.resource,
      readme,
    };
  };

  /**
   * For a given plugin version, fetch parameters, default command, etc.
   */
  const setPluginParameters = useCallback(
    async (plugin: Plugin) => {
      let generatedCommand = "";
      const params = { limit: 10, offset: 0 };
      const boundParamFn = plugin.getPluginParameters.bind(plugin);
      const boundComputeFn = plugin.getPluginComputeResources.bind(plugin);

      // fetch parameters
      const { resource: parameters } = await fetchResource<PluginParameter>(
        params,
        boundParamFn,
      );
      // If logged in, fetch optional compute resources
      const { resource: computes } = isLoggedIn
        ? await fetchResource(params, boundComputeFn)
        : { resource: [] };

      // fetch pluginInstances if logged in
      const pluginInstances = isLoggedIn
        ? ((
            await plugin.getPluginInstances({ limit: 1000 })
          ).getItems() as PluginInstance[])
        : [];

      // Build default command
      if (parameters.length > 0) {
        for (const param of parameters) {
          const generateInput = {
            [param.data.id]: {
              flag: param.data.flag,
              id: param.data.id,
              paramName: param.data.name,
              type: param.data.type,
              value: param.data.default
                ? param.data.default
                : param.data.type !== "boolean"
                  ? "' '"
                  : "",
            },
          };
          generatedCommand += unpackParametersIntoString(generateInput);
        }
      }

      setParameterPayload({
        generatedCommand,
        version: plugin.data.version,
        url: plugin.url,
        computes,
        pluginInstances,
      });
    },
    [isLoggedIn],
  );

  // Use React Query to fetch plugin data
  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["pluginData", id],
    queryFn: () => fetchPlugins(Number(id)),
    enabled: !!id,
  });

  // Once we have plugin versions, load parameters for the first one
  useEffect(() => {
    if (data?.plugins && data.plugins.length > 0) {
      setPluginParameters(data.plugins[0]);
    }
  }, [data?.plugins, setPluginParameters]);

  return (
    <WrapperConnect>
      {(isLoading || isFetching) && (
        <SpinContainer title="Please wait as resources for this plugin are being fetched..." />
      )}
      {isError && error && <Alert type="error" description={error.message} />}
      {data && !isLoading && !isError && (
        <>
          <HeaderSinglePlugin currentPluginMeta={data.currentPluginMeta} />
          <HeaderCardPlugin
            plugins={data.plugins}
            currentPluginMeta={data.currentPluginMeta}
            readme={data.readme}
            parameterPayload={parameterPayload}
            removeEmail={removeEmail}
            setPluginParameters={setPluginParameters}
          />
        </>
      )}
      {!data && !isLoading && !isError && <EmptyStateComponent />}
    </WrapperConnect>
  );
};

export default SinglePlugin;

/** Utility function to remove email addresses from authors. */
export function removeEmail(authors: string | string[]): string[] {
  const emailRegex = /(<|\().+?@.{2,}?\..{2,}?(>|\))/g;
  let authorArray: string[] = [];
  if (!Array.isArray(authors)) {
    authorArray = [authors];
  } else {
    authorArray = authors;
  }
  return authorArray.map((author) => author.replace(emailRegex, "").trim());
}

// -------------------------------------------------
// HEADER
// -------------------------------------------------
export const HeaderSinglePlugin = ({
  currentPluginMeta,
}: {
  currentPluginMeta: PluginMeta;
}) => {
  return (
    <Card style={{ width: "100%" }}>
      <Grid style={{ padding: "2em 2em" }}>
        <GridItem lg={1} md={1} xl={1} xl2={1} sm={12}>
          <img className="plugin-icon" src={PluginImg} alt="Plugin icon" />
        </GridItem>
        <GridItem lg={11} md={11} xl={11} xl2={11} sm={12}>
          <HeaderComponent currentPluginMeta={currentPluginMeta} />
        </GridItem>
      </Grid>
    </Card>
  );
};

export const HeaderComponent = ({
  currentPluginMeta,
}: {
  currentPluginMeta: PluginMeta;
}) => {
  const navigate = useNavigate();

  return (
    <Grid>
      <GridItem lg={10} sm={12}>
        <h3 className="plugin-name">
          {currentPluginMeta.data.name}{" "}
          <Badge>{currentPluginMeta.data.category}</Badge>
        </h3>
        <h2 className="plugin-title">{currentPluginMeta.data.title}</h2>
      </GridItem>

      <GridItem lg={2} sm={12} className="plugin-stats">
        <Button variant="primary" onClick={() => navigate("../../catalog")}>
          Back to Plugins
        </Button>
      </GridItem>

      <GridItem>
        <p style={{ color: "gray" }}>
          Created{" "}
          {new Date(
            currentPluginMeta.data.creation_date.split("T")[0],
          ).toDateString()}
        </p>
      </GridItem>
    </Grid>
  );
};

// -------------------------------------------------
// MAIN BODY
// -------------------------------------------------
interface HeaderCardPluginProps {
  plugins?: Plugin[];
  currentPluginMeta: PluginMeta;
  readme?: string;
  parameterPayload?: ParameterPayload;
  removeEmail: (authors: string | string[]) => string[];
  setPluginParameters: (plugin: Plugin) => Promise<void>;
}

export const HeaderCardPlugin: React.FC<HeaderCardPluginProps> = ({
  plugins,
  currentPluginMeta,
  readme,
  parameterPayload,
  removeEmail,
  setPluginParameters,
}) => {
  const [feeds, setFeeds] = useState<{ [version: string]: any[] }>({});
  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);
  const [feedLoad, setFeedLoad] = useState(false);

  // fetch feed data if user clicks "Use Cases" tab
  const fetchFeeds = useCallback(async (payload: ParameterPayload) => {
    setFeedLoad(true);
    const feedDict: Record<number, boolean> = {};
    const feedsTemp: any[] = [];

    for (let i = 0; i < payload.pluginInstances.length; i++) {
      const instance = payload.pluginInstances[i];
      const feed = await instance.getFeed();
      if (feed) {
        const note = await feed.getNote();
        const fid = feed.data.id;
        if (!feedDict[fid]) {
          feedsTemp.push({
            name: feed.data.name,
            id: fid,
            note: note.data.content,
          });
          feedDict[fid] = true;
        }
      }
    }
    setFeeds((prev) => ({
      ...prev,
      [payload.version]: feedsTemp,
    }));
    setFeedLoad(false);
  }, []);

  const handleTabClick = (_e: any, tabIndex: string | number) => {
    setActiveTabKey(tabIndex);
    if (tabIndex === 2 && parameterPayload) {
      // "Use Cases" tab
      if (!feeds[parameterPayload.version]) {
        fetchFeeds(parameterPayload);
      }
    }
  };

  return (
    <Card className="plugin-body pf-u-my-md">
      <DropdownPluginVersions
        parameterPayload={parameterPayload}
        plugins={plugins}
        currentPluginMeta={currentPluginMeta}
        setPluginParameters={setPluginParameters}
      />
      <Divider />
      <Grid hasGutter className="pf-u-p-lg">
        <GridItem md={8} sm={12}>
          <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
            <Tab eventKey={0} title={<TabTitleText>Overview</TabTitleText>}>
              {/* Directly show the README by default, no expand/hide */}
              <TabOverview readme={readme} />
            </Tab>
            <Tab eventKey={1} title={<TabTitleText>Resources</TabTitleText>}>
              {parameterPayload && (
                <TabResources parameterPayload={parameterPayload} />
              )}
            </Tab>
            <Tab eventKey={2} title={<TabTitleText>Use Cases</TabTitleText>}>
              {feedLoad ? (
                <div className="pf-u-my-md">Fetching sample feeds...</div>
              ) : parameterPayload &&
                feeds[parameterPayload.version] &&
                feeds[parameterPayload.version].length > 0 ? (
                <TabUseCases feeds={feeds[parameterPayload.version]} />
              ) : (
                <span>No feeds found.</span>
              )}
            </Tab>
          </Tabs>
        </GridItem>

        <GridItem md={4} sm={12}>
          <HeaderSidebar
            parameterPayload={parameterPayload}
            currentPluginMeta={currentPluginMeta}
            removeEmail={removeEmail}
          />
        </GridItem>
      </Grid>
    </Card>
  );
};

// ---------------------------------------
// Versions Dropdown
// ---------------------------------------
export const DropdownPluginVersions = ({
  parameterPayload,
  plugins,
  currentPluginMeta,
  setPluginParameters,
}: {
  parameterPayload?: ParameterPayload;
  plugins?: Plugin[];
  currentPluginMeta: PluginMeta;
  setPluginParameters: (plugin: Plugin) => Promise<void>;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const onToggle = () => setIsOpen(!isOpen);
  const onSelect = () => {
    const element = document.getElementById("toggle-basic");
    element?.focus();
  };

  const dropdownItems =
    plugins && plugins.length > 0
      ? plugins.map((plugin: Plugin) => {
          const isSelected = plugin.data.version === parameterPayload?.version;
          return (
            <DropdownItem
              style={{ padding: "0" }}
              key={plugin.data.id}
              icon={
                isSelected && <CheckCircleIcon style={{ color: "green" }} />
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  setPluginParameters(plugin);
                }
              }}
              onClick={() => {
                setPluginParameters(plugin);
                setIsOpen(false);
              }}
              component="button"
            >
              {plugin.data.version}
            </DropdownItem>
          );
        })
      : [];

  return (
    <div style={{ marginBottom: "1rem" }}>
      <Dropdown
        isOpen={isOpen}
        onSelect={onSelect}
        toggle={(toggleRef) => (
          <MenuToggle onClick={onToggle} ref={toggleRef}>
            {currentPluginMeta.data.name}
          </MenuToggle>
        )}
      >
        <DropdownList>{dropdownItems}</DropdownList>
      </Dropdown>
    </div>
  );
};

// ---------------------------------------
// Tab: Overview (README, always visible, no expand/hide)
// ---------------------------------------
const TabOverview: React.FC<{ readme?: string }> = ({ readme }) => {
  const mdRef = useRef<HTMLDivElement>(null);
  const { isDarkTheme } = useContext(ThemeContext);

  // Step 1: Dynamically import the highlight.js CSS for light or dark
  useEffect(() => {
    async function loadHighlightCSS() {
      if (isDarkTheme) {
        // conditionally load the dark highlight theme
        await import("highlight.js/styles/github-dark.css");
      } else {
        // conditionally load the light highlight theme
        await import("highlight.js/styles/github.css");
      }
    }
    loadHighlightCSS();
  }, [isDarkTheme]);

  // Step 2: Re-highlight code blocks after readme is updated (or theme changes)
  useEffect(() => {
    if (readme && mdRef.current) {
      mdRef.current.querySelectorAll("pre code").forEach((block) => {
        highlightjs.highlightElement(block as HTMLElement);
      });
    }
  }, [readme, isDarkTheme]);

  // We'll apply either .markdown-dark or .markdown-light class
  const markdownThemeClass = isDarkTheme ? "markdown-dark" : "markdown-light";

  return (
    <div>
      {readme ? (
        <div
          ref={mdRef}
          className={`markdown-body ${markdownThemeClass}`}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
          dangerouslySetInnerHTML={{ __html: readme }}
        />
      ) : (
        <Alert
          type="info"
          description="No GitHub README was found for this plugin."
        />
      )}
    </div>
  );
};

// ---------------------------------------
// Tab: Resources
// ---------------------------------------
export const TabResources = ({
  parameterPayload,
}: {
  parameterPayload: ParameterPayload;
}) => {
  const [copied, setCopied] = useState(false);

  const onClickCopy = (_evt: any, text?: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const actions = (
    <CodeBlockAction>
      <span style={{ margin: "0.5em" }}>
        Version: {parameterPayload.version}
      </span>
      <ClipboardCopyButton
        id="basic-copy-button"
        textId="code-content"
        aria-label="Copy to clipboard"
        onClick={(e) => onClickCopy(e, parameterPayload.generatedCommand)}
        exitDelay={600}
        maxWidth="110px"
        variant="plain"
      >
        {copied ? "Copied!" : "Copy"}
      </ClipboardCopyButton>
    </CodeBlockAction>
  );

  return (
    <div className="pf-u-mt-md">
      <Title headingLevel="h3" className="pf-u-mb-sm">
        Parameters
      </Title>
      <CodeBlock style={{ backgroundColor: "inherit" }} actions={actions}>
        <CodeBlockCode id="code-content">
          {parameterPayload.generatedCommand}
        </CodeBlockCode>
      </CodeBlock>

      <div style={{ marginTop: "1.5em" }}>
        <Title headingLevel="h3" className="pf-u-mb-sm">
          Compute Resources
        </Title>
        {parameterPayload.computes.length > 0 ? (
          parameterPayload.computes.map((compute) => (
            <Card key={compute.data.id} className="pf-u-my-sm">
              <CardHeader>
                <CardTitle>{compute.data.name}</CardTitle>
              </CardHeader>
              <CardBody>
                {compute.data.description || "No description provided."}
              </CardBody>
            </Card>
          ))
        ) : (
          <span>No Compute Found</span>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------
// Tab: Use Cases (Sample feeds for this plugin)
// ---------------------------------------
export const TabUseCases = ({ feeds }: { feeds: any[] }) => {
  return (
    <List style={{ marginTop: "1.5em" }} isBordered isPlain>
      {feeds.map((feed: any) => (
        <ListItem key={feed.id}>
          <Link to={`../feeds/${feed.id}`}>{feed.name}</Link>
          <p style={{ margin: 0, color: "#8A8D90" }}>{feed.note}</p>
        </ListItem>
      ))}
    </List>
  );
};

// ---------------------------------------
// Sidebar: install plugin, authors, license, etc.
// ---------------------------------------
interface HeaderSidebarProps {
  parameterPayload?: ParameterPayload;
  currentPluginMeta: PluginMeta;
  removeEmail: (authors: string | string[]) => string[];
}

export const HeaderSidebar: React.FC<HeaderSidebarProps> = ({
  parameterPayload,
  currentPluginMeta,
  removeEmail,
}) => {
  const [installModal, setInstallModal] = useState(false);
  const [value, setValue] = useState("");

  const handleSave = () => {
    if (!value) {
      throw new Error("You must provide a valid root URL.");
    }
    const trimmed = value.replace(/\/+$/, "");
    if (parameterPayload?.url) {
      const encodedURL = encodeURIComponent(parameterPayload.url);
      const fullUrl = `${trimmed}/install?uri=${encodedURL}&plugin=${currentPluginMeta.data.name}`;
      setInstallModal(false);
      setValue("");
      window.open(fullUrl, "_blank");
    }
  };

  const handleInstallMutation = useMutation({
    mutationFn: async () => handleSave(),
  });

  return (
    <div className="plugin-body-side-col">
      {/* INSTALL MODAL */}
      <Modal
        aria-label="Install plugin"
        variant="small"
        isOpen={installModal}
        onClose={() => setInstallModal(false)}
      >
        <Form isWidthLimited>
          <FormGroup label="Enter the URL to your website" isRequired>
            <TextInput
              isRequired
              id="url"
              type="url"
              value={value}
              onChange={(_event, val) => setValue(val)}
            />
            <FormHelperText>
              <HelperText>
                <HelperTextItem>
                  Example: http://localhost:5173 (no trailing slash).
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          </FormGroup>
          <ActionGroup>
            <Button
              onClick={() => handleInstallMutation.mutate()}
              isDisabled={!value}
              variant="primary"
              icon={handleInstallMutation.isPending && <Spin />}
            >
              Take me to my website
            </Button>
            <Button onClick={() => setInstallModal(false)} variant="link">
              Cancel
            </Button>
          </ActionGroup>
          {handleInstallMutation.isError && (
            <Alert
              closable
              type="error"
              description={handleInstallMutation.error?.message}
            />
          )}
        </Form>
      </Modal>

      {/* SIDEBAR SECTIONS */}
      <div className="plugin-body-detail-section pf-u-mb-md">
        <Button onClick={() => setInstallModal(true)}>
          Install this plugin
        </Button>
      </div>

      <div className="plugin-body-detail-section pf-u-mb-md">
        <p>Copy and paste the URL below into your ChRIS Admin Dashboard:</p>
        <ClipboardCopyFixed
          value={parameterPayload?.url || "Fetching plugin URL..."}
        />
      </div>

      <div className="plugin-body-detail-section pf-u-mb-md">
        <Title headingLevel="h4">Repository</Title>
        <a
          href={currentPluginMeta.data.public_repo}
          target="_blank"
          rel="noopener noreferrer"
        >
          {currentPluginMeta.data.public_repo}
        </a>
      </div>

      <div className="plugin-body-detail-section pf-u-mb-md">
        <Title headingLevel="h4">Author(s)</Title>
        {removeEmail(currentPluginMeta.data.authors.split(",")).map(
          (author) => (
            <div key={author} style={{ marginBottom: "0.5em" }}>
              <UserAltIcon /> {author}
            </div>
          ),
        )}
      </div>

      <div className="plugin-body-detail-section pf-u-mb-md">
        <Title headingLevel="h4">Collaborators</Title>
        <a
          className="pf-m-link"
          href={`${currentPluginMeta.data.public_repo}/graphs/contributors`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View contributors on GitHub
        </a>
      </div>

      <div className="plugin-body-detail-section pf-u-mb-md">
        <Title headingLevel="h4">License</Title>
        {currentPluginMeta.data.license} License
      </div>

      <div className="plugin-body-detail-section pf-u-mb-md">
        <Title headingLevel="h4">Content Type</Title>
        {currentPluginMeta.data.type}
      </div>

      <div className="plugin-body-detail-section pf-u-mb-md">
        <Title headingLevel="h4">Date added</Title>
        {new Date(
          currentPluginMeta.data.creation_date.split("T")[0],
        ).toDateString()}
      </div>
    </div>
  );
};
