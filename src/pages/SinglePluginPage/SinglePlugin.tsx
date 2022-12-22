import React from "react";
import ChrisAPIClient from "../../api/chrisapiclient";
import { useNavigate, useParams } from "react-router";


import {
  Grid,
  GridItem,
  Card,
  Title,
  Popover,
  Button,
  ClipboardCopy,
  ExpandableSection,
  Badge,
  Split,
  SplitItem,
} from "@patternfly/react-core";
import { DownloadIcon, UserAltIcon } from '@patternfly/react-icons';
import { Tabs, Tab, TabTitleText, Spinner} from '@patternfly/react-core';

// New import statements
import PluginImg from '../../assets/images/brainy-pointer.png'
import { marked } from 'marked';
import { sanitize } from 'dompurify';
import "./SinglePlugin.scss";



const SinglePlugin = () => {
        
  const { pluginName } = useParams() as { pluginName: string};
  const navigate = useNavigate();
  document.title = pluginName;
  const [ pluginData, setPluginData ] = React.useState<{[key: string]: any}>({});

  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);
  const [readme, setReadme] = React.useState<string>('');

  const setReadmeHTML = ($: any) => setReadme(sanitize($));

  const handleTabClick = (_event: any, tabIndex: string | number) => {
    setActiveTabKey(tabIndex);
  };
  
  const pluginFunc = (pluginItem: any, plugin_name: string): any => {

    const pluginDict = (somePlugin: any) => {
      const pluginData = somePlugin.collection.items[0].data;
      return Object.assign({}, 
      ...pluginData.map((o: any) => ({ [o.name]: o.value }))
    )};

    let plugin = null;

    for (let i = 0; i < pluginItem?.length; i++){
      const singlePlugin = pluginDict(pluginItem[i]);
      if (singlePlugin.name == plugin_name) {
        plugin = singlePlugin;
        break;
      }
    }
    return plugin;
  }

  
  React.useEffect(() => {
    async function fetchPlugins( plugin_name: string) {
      const client = ChrisAPIClient.getClient();
      const pluginsList = await client.getPlugins();
      const pluginsItem = pluginsList.getItems();
  
      let selectedPlugin: {[key: string]: any};
  
      if (pluginsItem) {
        selectedPlugin = pluginFunc(pluginsItem, plugin_name);
        setPluginData(pluginData => ({...pluginData, ...selectedPlugin}));
      }
    }
    fetchPlugins(pluginName);
  }, [pluginName]);
  
  const fetchReadme = React.useCallback(async (repo: string) => {
    const ghreadme = await fetch(`https://api.github.com/repos/${repo}/readme`);
    if (!ghreadme.ok) {
      throw new Error("Failed to fetch repo.");
    }
    const { download_url, content }: { download_url: string; content: string} = await ghreadme.json();
    const file = atob(content);
    const type: string = download_url.split('.').reverse()[0];
    return { file, type };
  }, [])

  React.useEffect(() => {
    
    // Function to fetch the Readme from the Repo.
    async function fetchRepo() {
      const repoName = pluginData.public_repo.split('github.com/')[1];
      const { file, type} = await fetchReadme(repoName);
      if (type === 'md' || type === 'rst') {
        setReadmeHTML(marked.parse(file));
      }
      else {
        setReadmeHTML(file);
      }
    }

    if (pluginData)
      fetchRepo();
    else
      throw new Error("RepoName failed");

  }, [fetchReadme, pluginData])


  const InstallButton = (pluginBtn: any): any => {
    console.log(pluginBtn.version)
    if (pluginBtn.version)
      return <ClipboardCopy isReadOnly>{ pluginBtn.url }</ClipboardCopy>
    if (pluginBtn.versions)
      return (
      <>
        <p><b>Version { pluginBtn.versions[0].version }</b></p>
        <ClipboardCopy isReadOnly>
          { pluginBtn.versions[0].url }
        </ClipboardCopy>
        <br />
        {
          pluginBtn.versions.length > 1 &&
          <ExpandableSection toggleText="More Versions">
            { pluginBtn.versions.slice(1).map((version: any) =>(
              <div key={version.version}>
                <a href={`/p/${version.id}`}>
                  Version {version.version}
                </a>
              </div>
            ))}
          </ExpandableSection>
        }
      </> )
    return  <Spinner isSVG diameter="60px" />
  }

  const removeEmail = (authors: string[]) => {
    const emailRegex = /(<|\().+?@.{2,}?\..{2,}?(>|\))/g;
    // Match '<' or '(' at the beginning and end
    // Match <string>@<host>.<tld> inside brackets
    if (!Array.isArray(authors))
      // eslint-disable-next-line no-param-reassign
      authors = [ authors ]
    return authors.map((author) => author.replace(emailRegex, "").trim());
  }

 
  if (!Object.keys(pluginData).length)
    return (
      <>
        <div style={{margin: "auto"}}>
          <Spinner isSVG diameter="80px" />
        </div>
      </>
    )
  else
    return (
      <>
      {pluginData && (
        <div className="plugin">
          <section className="plugin-head">
              <Grid hasGutter>
                <GridItem style={{ marginRight: '2em' }} lg={2} sm={12}>
                  <img
                    className="plugin-icon"
                    src={PluginImg}
                    alt="Plugin icon"
                  />
                </GridItem>

                <GridItem lg={10} sm={12}>
                  <Grid>
                    <GridItem lg={10} sm={12}>
                      <h3 className="plugin-name">{pluginData.name} <Badge>{pluginData.category}</Badge></h3>
                      <h2 className="plugin-title">{pluginData.title}</h2>
                    </GridItem>

                    <GridItem lg={2} sm={12} className="plugin-stats">
                      <Split>
                        <SplitItem isFilled />
                        <SplitItem>
                          <Button variant="primary" onClick={() => navigate(-1)}>
                            Back to Plugins
                          </Button>
                        </SplitItem>
                      </Split>
                    </GridItem>

                    <GridItem>
                      <p style={{ color: "gray" }}>
                        Created {(new Date(pluginData.creation_date.split('T')[0])).toDateString()}
                      </p>
                    </GridItem>
                  </Grid>
                </GridItem>
              </Grid>
          </section>

          <section>
            <Card className="plugin-body">

              <div style={{marginBottom: "1rem"}}>
                <Title headingLevel="h2">{pluginData.name}</Title>
              </div>

              <div>
                <Grid hasGutter>
                  <GridItem md={8} sm={12}>
                    <Tabs
                    activeKey={activeTabKey}
                    onSelect={handleTabClick}
                    >
                      <Tab eventKey={0} title={<TabTitleText>Overview</TabTitleText>}>
                        <div style={{ color: 'gray', margin: '1em 0' }}>README</div>
                        { readme ? <div dangerouslySetInnerHTML={{ __html: readme }} /> : null }
                      </Tab>
                      <Tab eventKey={1} title={<TabTitleText>Parameters</TabTitleText>}>
                        <h2>Parameters Content</h2>
                      </Tab>
                      <Tab eventKey={2} title={<TabTitleText>Versions</TabTitleText>}>
                        <h2>Versions of this plugin</h2>
                        <p className="pluginList__version">
                          version: {pluginData.version}
                        </p>
                      </Tab>
                    </Tabs>
                  </GridItem>

                  <GridItem md={4} sm={12}>
                    <div className="plugin-body-side-col">
                      <div className="plugin-body-detail-section">
                        <h2>Install</h2>
                        <p>Click to install this plugin to your ChRIS Server.</p>
                        <br />
                        <Popover
                          position="bottom"
                          maxWidth="30rem"
                          headerContent={<b>Install to your ChRIS server</b>}
                          bodyContent={() => (
                            <div>
                              <p>
                                Copy and Paste the URL below into your ChRIS Admin Dashboard
                                to install this plugin.
                              </p>
                              <br />
                              <InstallButton pluginBtn={pluginData}/>
                            </div>
                          )}
                        >
                          <Button isBlock style={{ fontSize: '1.125em' }}>
                            <DownloadIcon />
                            {' '}
                            Install to ChRIS
                          </Button>
                        </Popover>
                      </div>
                      <div className="plugin-body-detail-section">
                        <h4>Repository</h4>
                        <a href={pluginData.public_repo}>
                          {pluginData.public_repo}
                        </a>
                      </div>

                      <div className="plugin-body-detail-section">
                        <h4>Author</h4>
                          { removeEmail(pluginData.authors.split(',')).map(author => (
                            <a key={author} href={`#`}>
                              <p><UserAltIcon /> {author}</p>
                            </a>
                          ))}
                      </div>
                      <div className="plugin-body-detail-section">
                        <h4>Collaborators</h4>
                        {
                          // FIXME
                          <a className="pf-m-link" href={`${pluginData.documentation}/graphs/contributors`}>
                            View contributors on Github
                          </a>
                        }
                      </div>

                      <div className="plugin-body-detail-section">
                        <h4>License</h4>
                        {pluginData.license} License
                      </div>
                      <div className="plugin-body-detail-section">
                        <h4>Content Type</h4>
                        {pluginData.type}
                      </div>
                      <div className="plugin-body-detail-section">
                        <h4>Date added</h4>
                        {(new Date(pluginData.creation_date.split('T')[0])).toDateString()}
                      </div>
                    </div>
                  </GridItem>
                </Grid>
              </div>
            </Card>
          </section>
        </div>
      )}
      </>
    );
};

export default SinglePlugin;
