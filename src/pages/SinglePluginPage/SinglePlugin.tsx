import React from "react";
import ChrisAPIClient from "../../api/chrisapiclient";
import { useNavigate, useParams } from "react-router";
import { Plugin, PluginMeta, PluginParameter } from "@fnndsc/chrisapi";
import Wrapper from "../Layout/PageWrapper";
import {
  Grid,
  GridItem,
  Card,
  Title,
  Popover,
  Button,
  CodeBlock,
  CodeBlockCode,
  Badge,
  Split,
  SplitItem,
} from "@patternfly/react-core";
import { DownloadIcon, UserAltIcon } from "@patternfly/react-icons";
import { Tabs, Tab, TabTitleText, Spinner } from "@patternfly/react-core";
import PluginImg from "../../assets/images/brainy-pointer.png";
import { marked } from "marked";
import { sanitize } from "dompurify";
import "./SinglePlugin.scss";
import { fetchResource } from "../../api/common";
import { unpackParametersIntoString } from "../../components/feed/AddNode/lib/utils";

const SinglePlugin = () => {
  const { id } = useParams() as { id: string };
  const navigate = useNavigate();
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);
  const [readme, setReadme] = React.useState<string>("");
  const [plugins, setPlugins] = React.useState<Plugin[]>();
  const [parameterPayload, setParameterPayload] = React.useState<
    {
      generatedCommand: string;
      version: string;
    }[]
  >();

  const setReadmeHTML = ($: any) => setReadme(sanitize($));

  const [currentPluginMeta, setCurrentPluginMeta] =
    React.useState<PluginMeta>();

  React.useEffect(() => {
    async function fetchPlugins(id: number) {
      const client = ChrisAPIClient.getClient();
      const pluginMeta = await client.getPluginMeta(id);
      const pluginMetas = await client.getPluginMetas();
      const pluginMets = pluginMetas.getItems()
      console.log(pluginMets);
      console.log(pluginMetas)
      
      document.title = pluginMeta.data.name;
      setCurrentPluginMeta(pluginMeta);
      const fn = pluginMeta.getPlugins;
      const boundFn = fn.bind(pluginMeta);
      const params = {
        limit: 1000,
        offset: 0,
      };

      const results = await fetchResource<Plugin>(params, boundFn);
      setPlugins(results["resource"]);
    }
    fetchPlugins(+id);
  }, [id]);

  // Function to fetch the Readme from the Repo.
  const fetchReadme = React.useCallback(async (repo: string) => {
    const ghreadme = await fetch(`https://api.github.com/repos/${repo}/readme`);
    if (!ghreadme.ok) {
      throw new Error("Failed to fetch repo.");
    }
    const { download_url, content }: { download_url: string; content: string } =
      await ghreadme.json();
    const file = atob(content);
    const type: string = download_url.split(".").reverse()[0];
    return { file, type };
  }, []);

  const setPluginParameters = async (plugins: Plugin[]) => {
    if (plugins && plugins?.length > 0) {
      const pluginPayload = Promise.all(
        plugins.map(async (plugin) => {
          const params = { limit: 1000, offset: 0 };
          const fn = plugin.getPluginParameters;
          const boundFn = fn.bind(plugin);
          const { resource: parameters } = await fetchResource<PluginParameter>(
            params,
            boundFn
          );
          let generatedCommand = ``;
          if (parameters.length > 0) {
            parameters.forEach((param) => {
              const generateInput = {
                [param.data.id]: {
                  flag: param.data.flag,
                  id: param.data.id,
                  paramName: param.data.name,
                  type: param.data.type,
                  value: param.data.default ? param.data.default : "",
                },
              };
              generatedCommand += unpackParametersIntoString(generateInput);
            });
          }
          return {
            generatedCommand,
            version: `${plugin.data.name}:${plugin.data.version}`,
          };
        })
      );
      return pluginPayload;
    }
  };

  React.useEffect(() => {
    async function fetchRepo(currentPluginMeta: PluginMeta) {
      const repoName =
        currentPluginMeta.data.public_repo.split("github.com/")[1];
      const { file, type } = await fetchReadme(repoName);
      if (type === "md" || type === "rst") {
        setReadmeHTML(marked.parse(file));
      } else {
        setReadmeHTML(file);
      }
    }

    if (currentPluginMeta) fetchRepo(currentPluginMeta);
  }, [fetchReadme, currentPluginMeta]);

  React.useEffect(() => {
    async function setPluginPayload() {
      if (plugins && plugins?.length > 0) {
        const pluginPayload = await setPluginParameters(plugins);
        setParameterPayload(pluginPayload);
      }
    }

    setPluginPayload();
  }, [plugins]);

  const removeEmail = (authors: string[]) => {
    const emailRegex = /(<|\().+?@.{2,}?\..{2,}?(>|\))/g;
    // Match '<' or '(' at the beginning and end
    // Match <string>@<host>.<tld> inside brackets
    if (!Array.isArray(authors))
      // eslint-disable-next-line no-param-reassign
      authors = [authors];
    return authors.map((author) => author.replace(emailRegex, "").trim());
  };

  const handleTabClick = (_event: any, tabIndex: string | number) => {
    setActiveTabKey(tabIndex);
  };

  return (
    <Wrapper>
      {!currentPluginMeta ? (
        <div style={{ margin: "auto" }}>
          <Spinner isSVG diameter="80px" />
        </div>
      ) : (
        <div className="plugin">
          <section className="plugin-head">
            <Grid hasGutter>
              <GridItem style={{ marginRight: "2em" }} lg={2} sm={12}>
                <img
                  className="plugin-icon"
                  src={PluginImg}
                  alt="Plugin icon"
                />
              </GridItem>

              <GridItem lg={10} sm={12}>
                <Grid>
                  <GridItem lg={10} sm={12}>
                    <h3 className="plugin-name">
                      {currentPluginMeta.data.name}{" "}
                      <Badge>{currentPluginMeta.data.category}</Badge>
                    </h3>
                    <h2 className="plugin-title">
                      {currentPluginMeta.data.title}
                    </h2>
                  </GridItem>

                  <GridItem lg={2} sm={12} className="plugin-stats">
                    <Split>
                      <SplitItem isFilled />
                      <SplitItem>
                        <Button
                          variant="primary"
                          onClick={() => navigate("../../catalog")}
                        >
                          Back to Plugins
                        </Button>
                      </SplitItem>
                    </Split>
                  </GridItem>

                  <GridItem>
                    <p style={{ color: "gray" }}>
                      Created{" "}
                      {new Date(
                        currentPluginMeta.data.creation_date.split("T")[0]
                      ).toDateString()}
                    </p>
                  </GridItem>
                </Grid>
              </GridItem>
            </Grid>
          </section>
          <section>
            <Card className="plugin-body">
              <div style={{ marginBottom: "1rem" }}>
                <Title headingLevel="h2">{currentPluginMeta.data.name}</Title>
              </div>

              <div>
                <Grid hasGutter>
                  <GridItem md={8} sm={12}>
                    {
                      <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
                        <Tab
                          eventKey={0}
                          title={<TabTitleText>Overview</TabTitleText>}
                        >
                          <div style={{ color: "gray", margin: "1em 0" }}>
                            README
                          </div>
                          {readme ? (
                            <div dangerouslySetInnerHTML={{ __html: readme }} />
                          ) : (
                            <div style={{ margin: "auto" }}>
                              <Spinner isSVG diameter="80px" />
                            </div>
                          )}
                        </Tab>
                        <Tab
                          eventKey={1}
                          title={<TabTitleText>Parameters</TabTitleText>}
                        >
                          <h2>
                            {parameterPayload &&
                              parameterPayload.map((parameter: any) => {
                                return (
                                  <CodeBlock key={parameter}>
                                    <CodeBlockCode id="code-content">
                                      {parameter.version}:
                                      {parameter.generatedCommand}
                                    </CodeBlockCode>
                                  </CodeBlock>
                                );
                              })}
                          </h2>
                        </Tab>
                        <Tab
                          eventKey={2}
                          title={<TabTitleText>Versions</TabTitleText>}
                        >
                          <h2>
                            {parameterPayload &&
                              parameterPayload.map((parameter: any) => {
                                return (
                                  <CodeBlock key={parameter}>
                                    <CodeBlockCode id="code-content">
                                      {parameter.version}
                                    </CodeBlockCode>
                                  </CodeBlock>
                                );
                              })}
                          </h2>
                        </Tab>
                      </Tabs>
                    }
                  </GridItem>

                  <GridItem md={4} sm={12}>
                    <div className="plugin-body-side-col">
                      <div className="plugin-body-detail-section">
                        <h2>Install</h2>
                        <p>
                          Click to install this plugin to your ChRIS Server.
                        </p>
                        <br />
                        <Popover
                          position="bottom"
                          maxWidth="30rem"
                          headerContent={<b>Install to your ChRIS server</b>}
                          bodyContent={() => (
                            <div>
                              <p>
                                Copy and Paste the URL below into your ChRIS
                                Admin Dashboard to install this plugin.
                              </p>
                              <br />
                            </div>
                          )}
                        >
                          <Button isBlock style={{ fontSize: "1.125em" }}>
                            <DownloadIcon /> Install to ChRIS
                          </Button>
                        </Popover>
                      </div>
                      <div className="plugin-body-detail-section">
                        <h4>Repository</h4>
                        <a href={currentPluginMeta.data.public_repo}>
                          {currentPluginMeta.data.public_repo}
                        </a>
                      </div>

                      <div className="plugin-body-detail-section">
                        <h4>Author</h4>
                        {removeEmail(
                          currentPluginMeta.data.authors.split(",")
                        ).map((author) => (
                          <div key={author}>
                            <UserAltIcon /> {author}
                          </div>
                        ))}
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
                          currentPluginMeta.data.creation_date.split("T")[0]
                        ).toDateString()}
                      </div>
                    </div>
                  </GridItem>
                </Grid>
              </div>
            </Card>
          </section>
        </div>
      )}
    </Wrapper>
  );
};

export default SinglePlugin;
