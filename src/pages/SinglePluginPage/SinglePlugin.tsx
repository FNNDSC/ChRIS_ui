import React from "react";
import ChrisAPIClient from "../../api/chrisapiclient";
import { useParams } from "react-router";


import {
  Grid,
  GridItem,
  Card,
  Title,
  Popover,
  Button,
} from "@patternfly/react-core";
import { DownloadIcon, UserAltIcon } from '@patternfly/react-icons';
import { Tabs, Tab, TabTitleText, Spinner} from '@patternfly/react-core';

// New import statements
import { marked } from 'marked';
import { sanitize } from 'dompurify';
import "./SinglePlugin.scss";



const SinglePlugin = () => {
        
  const { pluginName } = useParams() as { pluginName: string};
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
  
  console.log(pluginData);
  
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

 
  if (!pluginData) 
    return (
      <Spinner isSVG diameter="80px" />
    )
  else
    return ( 
      <div>
        <div>
          <p>Something will be here</p>
        </div>

        <Card id="plugin-body">
          {pluginData && (
            <>
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
                        Parameters
                      </Tab>
                      <Tab eventKey={2} title={<TabTitleText>Version</TabTitleText>}>
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
                              {/* <InstallButton/> */}
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
                          {/* Update api here. */}
                        </a>
                      </div>

                      <div className="plugin-body-detail-section">
                        <h4>Author</h4>
                          <a href='#'>
                            <><UserAltIcon /> {pluginData.authors}</>
                          </a>
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
                        {/* Fix me  */}
                        XX.XX License
                      </div>
                      <div className="plugin-body-detail-section">
                        <h4>Content Type</h4>
                        {pluginData.type}
                      </div>
                      <div className="plugin-body-detail-section">
                        <h4>Date added</h4>
                        {/* {(new Date(pluginData.creation_date.split('T')[0])).toDateString()} */}
                      </div>
                    </div>
                  </GridItem>
                </Grid>
              </div>
            </>



          )}
        </Card>

      </div>
    );
};

export default SinglePlugin;
