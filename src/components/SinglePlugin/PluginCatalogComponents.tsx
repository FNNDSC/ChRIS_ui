import React from "react";
import {
  Grid,
  GridItem,
  Badge,
  Button,
  Card,
  Tabs,
  TabTitleText,
  Tab,
  ClipboardCopy,
  CodeBlock,
  CodeBlockCode,
  Dropdown,
  MenuToggle,
  DropdownItem,
  CodeBlockAction,
  ClipboardCopyButton,
  CardTitle,
  CardBody,
  CardHeader,
  List,
  ListItem,
  DropdownList,
} from "@patternfly/react-core";
import { Alert } from "antd";
import { UserAltIcon, CheckCircleIcon } from "@patternfly/react-icons";
import { PluginMeta, Plugin, PluginInstance } from "@fnndsc/chrisapi";
import { useNavigate } from "react-router";
import PluginImg from "../../assets/brainy-pointer.png";
import { Link } from "react-router-dom";

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

export const HeaderSinglePlugin = ({
  currentPluginMeta,
}: {
  currentPluginMeta: PluginMeta;
}) => {
  return (
    <Card style={{ width: "100%" }}>
      <Grid
        style={{
          padding: "2em 2em",
        }}
      >
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

export type ParameterPayload = {
  generatedCommand: string;
  version: string;
  url: string;
  computes: any[];
  pluginInstances: PluginInstance[];
};

export const DropdownPluginVersions = ({
  plugins,
  currentPluginMeta,
  parameterPayload,
  setPluginParameters,
}: {
  plugins?: Plugin[];
  currentPluginMeta: PluginMeta;
  parameterPayload?: ParameterPayload;
  setPluginParameters: (plugin: Plugin) => Promise<void>;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownItems =
    plugins && plugins.length > 0
      ? plugins.map((plugin: Plugin) => {
          return (
            <DropdownItem
              style={{
                padding: "0",
              }}
              icon={
                plugin.data.version === parameterPayload?.version && (
                  <CheckCircleIcon style={{ color: "green" }} />
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  setPluginParameters(plugin);
                }
              }}
              onClick={() => {
                setPluginParameters(plugin);
                setIsOpen(!isOpen);
              }}
              component="button"
              key={plugin.data.id}
              name={plugin.data.version}
              value={plugin.data.version}
              autoFocus={
                plugin.data.version === parameterPayload?.version ? true : false
              }
            >
              {plugin.data.version}
            </DropdownItem>
          );
        })
      : [];

  const onFocus = () => {
    const element = document.getElementById("toggle-basic");
    element?.focus();
  };

  const onSelect = () => {
    onFocus();
  };
  const onToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <Dropdown
        isOpen={isOpen}
        onSelect={onSelect}
        toggle={(toggleRef) => {
          return (
            <MenuToggle onClick={onToggle} ref={toggleRef}>
              {currentPluginMeta.data.name}
            </MenuToggle>
          );
        }}
      >
        <DropdownList>{dropdownItems}</DropdownList>
      </Dropdown>
    </div>
  );
};

export const HeaderCardPlugin = ({
  plugins,
  currentPluginMeta,
  readme,
  parameterPayload,
  removeEmail,
  setPluginParameters,
}: {
  plugins?: Plugin[];
  currentPluginMeta: PluginMeta;
  readme?: string;
  removeEmail: (authors: string[]) => string[];
  parameterPayload?: ParameterPayload;
  setPluginParameters: (plugin: Plugin) => Promise<void>;
}) => {
  const [feeds, setFeeds] = React.useState<{
    [key: string]: any[];
  }>();
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);

  const fetchFeeds = React.useCallback(
    async (parameterPayload: ParameterPayload) => {
      const feedDict: {
        [id: number]: {
          name: string;
          id: number;
        };
      } = {};
      const feedsTemp: any[] = [];
      setFeedLoad(true);
      for (let i = 0; i < parameterPayload.pluginInstances.length; i++) {
        const instance = parameterPayload.pluginInstances[i];
        const feed = await instance.getFeed();

        if (feed) {
          const note = await feed.getNote();

          const id = feed.data.id;

          if (!feedDict[id]) {
            feedsTemp.push({
              name: feed.data.name,
              id,
              note: note.data.content,
            });
            feedDict[id] = id;
          }
        }
      }

      setFeeds((feedState) => {
        return {
          ...feedState,
          [parameterPayload.version]: feedsTemp,
        };
      });

      setFeedLoad(false);
    },
    [],
  );

  React.useEffect(() => {
    if (parameterPayload) {
      fetchFeeds(parameterPayload);
    }
  }, [parameterPayload, fetchFeeds]);

  const [feedLoad, setFeedLoad] = React.useState(false);
  const handleTabClick = async (_event: any, tabIndex: string | number) => {
    setActiveTabKey(tabIndex);
    if (
      tabIndex === 2 &&
      parameterPayload?.pluginInstances &&
      parameterPayload.pluginInstances.length > 0 &&
      feeds &&
      !feeds[parameterPayload.version]
    ) {
      fetchFeeds(parameterPayload);
    }
  };

  return (
    <Card className="plugin-body">
      <DropdownPluginVersions
        parameterPayload={parameterPayload}
        plugins={plugins}
        currentPluginMeta={currentPluginMeta}
        setPluginParameters={setPluginParameters}
      />
      <div>
        <Grid hasGutter>
          <GridItem md={8} sm={12}>
            <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
              <Tab eventKey={0} title={<TabTitleText>Overview</TabTitleText>}>
                <div style={{ color: "gray", margin: "1em 0" }}>README</div>
                {readme ? (
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
                  <div dangerouslySetInnerHTML={{ __html: readme }} />
                ) : (
                  <div style={{ margin: "auto" }}>
                    <Alert type="info" description="No github repo found." />
                  </div>
                )}
              </Tab>
              <Tab eventKey={1} title={<TabTitleText>Resources</TabTitleText>}>
                {parameterPayload && (
                  <>
                    <TabResources parameterPayload={parameterPayload} />
                  </>
                )}
              </Tab>

              <Tab eventKey={2} title={<TabTitleText>Use Cases</TabTitleText>}>
                {feedLoad ? (
                  <div>Fetching unique sample feeds...</div>
                ) : parameterPayload &&
                  feeds &&
                  feeds[parameterPayload.version] &&
                  feeds[parameterPayload.version].length > 0 ? (
                  <TabUseCases feeds={feeds[parameterPayload.version]} />
                ) : (
                  <span>No feeds found</span>
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
      </div>
    </Card>
  );
};

export const TabResources = ({
  parameterPayload,
}: {
  parameterPayload: ParameterPayload;
}) => {
  const clipboardCopyFunc = (_event: any, text: string) => {
    navigator.clipboard.writeText(text.toString());
  };
  const [copied, setCopied] = React.useState(false);
  const onClick = (event: any, text?: string) => {
    if (text) {
      clipboardCopyFunc(event, text);
      setCopied(true);
    }
  };
  const actions = (
    <CodeBlockAction>
      <span style={{ margin: "0.5em" }}>
        Version: {parameterPayload?.version}
      </span>
      <ClipboardCopyButton
        id="basic-copy-button"
        textId="code-content"
        aria-label="Copy to clipboard"
        onClick={(e) => onClick(e, parameterPayload?.generatedCommand)}
        exitDelay={copied ? 1500 : 600}
        maxWidth="110px"
        variant="plain"
        onTooltipHidden={() => setCopied(false)}
      >
        {copied ? "Successfully copied to clipboard!" : "Copy to clipboard"}
      </ClipboardCopyButton>
    </CodeBlockAction>
  );
  return (
    <>
      <div style={{ marginTop: "1.5em" }}>
        <h3>Parameters: </h3>
        <CodeBlock style={{ backgroundColor: "inherit" }} actions={actions}>
          <CodeBlockCode id="code-content">
            {parameterPayload.generatedCommand}
          </CodeBlockCode>
        </CodeBlock>
      </div>
      <div style={{ marginTop: "1.5em" }}>
        <h3>Compute:</h3>
        {parameterPayload && parameterPayload.computes.length > 0 ? (
          parameterPayload.computes.map((compute) => {
            return (
              <Card key={compute.data.id}>
                <CardHeader>
                  <CardTitle>{compute.data.name}</CardTitle>
                </CardHeader>
                <CardBody>
                  {compute.data.description
                    ? compute.data.description
                    : "No description for this compute resource"}
                </CardBody>
              </Card>
            );
          })
        ) : (
          <span>No Compute Found</span>
        )}
      </div>
    </>
  );
};

export const TabUseCases = ({ feeds }: { feeds: any[] }) => {
  return (
    <List
      style={{
        marginTop: "1.5em",
      }}
      isBordered
      isPlain
    >
      {feeds.map((feed: any) => {
        return (
          <ListItem key={feed.id}>
            <Link to={`../feeds/${feed.id}`}>{feed.name}</Link>
            <p
              style={{
                margin: "0",
                color: "#8A8D90",
              }}
            >
              {feed.note}
            </p>
          </ListItem>
        );
      })}
    </List>
  );
};

export const HeaderSidebar = ({
  parameterPayload,
  currentPluginMeta,
  removeEmail,
}: {
  parameterPayload?: ParameterPayload;
  currentPluginMeta: PluginMeta;
  removeEmail: (authors: string[]) => string[];
}) => {
  return (
    <div className="plugin-body-side-col">
      <div className="plugin-body-detail-section">
        <p>
          Copy and Paste the URL below into your ChRIS Admin Dashboard to
          install this plugin.
        </p>

        <ClipboardCopy isReadOnly hoverTip="Copy" clickTip="Copied">
          {parameterPayload?.url ? parameterPayload.url : "Fetching the url..."}
        </ClipboardCopy>
      </div>
      <div className="plugin-body-detail-section">
        <h4>Repository</h4>
        <a href={currentPluginMeta.data.public_repo}>
          {currentPluginMeta.data.public_repo}
        </a>
      </div>

      <div className="plugin-body-detail-section">
        <h4>Author</h4>
        {removeEmail(currentPluginMeta.data.authors.split(",")).map(
          (author) => (
            <div key={author}>
              <UserAltIcon /> {author}
            </div>
          ),
        )}
      </div>
      <div className="plugin-body-detail-section">
        <h4>Collaborators</h4>
        {
          // To get the contributors list, I require authentication see link
          // https://docs.github.com/en/rest/collaborators/collaborators?apiVersion=2022-11-28
          <a
            className="pf-m-link"
            href={`${currentPluginMeta.data.public_repo}/graphs/contributors`}
          >
            View contributors on Github
          </a>
        }
      </div>

      <div className="plugin-body-detail-section">
        <h4>License</h4>
        {currentPluginMeta.data.license} License
      </div>
      <div className="plugin-body-detail-section">
        <h4>Content Type</h4>
        {currentPluginMeta.data.type}
      </div>
      <div className="plugin-body-detail-section">
        <h4>Date added</h4>
        {new Date(
          currentPluginMeta.data.creation_date.split("T")[0],
        ).toDateString()}
      </div>
    </div>
  );
};
