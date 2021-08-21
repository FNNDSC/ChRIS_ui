import React, { useEffect, useCallback, useState } from "react";
import { Link, Route, Switch, useHistory } from "react-router-dom";
import { CubesIcon, UploadIcon, SearchIcon } from "@patternfly/react-icons";
import {
  Button,
  Card,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStatePrimary,
  Grid,
  GridItem,
  Modal,
  Spinner,
  Split,
  SplitItem,
  TextInput,
  Title,
} from "@patternfly/react-core";

import ChrisAPIClient from "../../../../api/chrisapiclient";
import { useTypedSelector } from "../../../../store/hooks";
import Wrapper from "../../../../containers/Layout/PageWrapper";

import "./user-library.scss";
import Browser from "./Browser";
import DirectoryTree from "../../../../utils/browser";

const client = ChrisAPIClient.getClient();

export const UserLibrary = () => {
	document.title = 'My Library';
  const username = useTypedSelector(state => state.user.username) as string;

  const [openUploader, setOpenUploader] = useState(false);

  const [uploaded, setUploaded] = useState<DirectoryTree>();
  const [feedfiles, setFeedFiles] = useState<DirectoryTree>();

  const [query, setQuery] = useState<string>();

  const fetchUploaded = useCallback(async () => {
    const params = { limit: 100, offset: 0, fname_nslashes: "3u" };

    try {
      let uploads = await client.getUploadedFiles(params);
      let items = uploads.getItems() || [];

      do {
        setUploaded(DirectoryTree.fromPathList(items));
        params.offset = params.offset += params.limit;

        if (uploads.hasNextPage) {
          uploads = await client.getUploadedFiles(params);
          items = [ ...items, ...(uploads.getItems() || []) ];
        }
      } while (uploads.hasNextPage);
    } catch (error) {
      console.error(error);
    }
  }, [])

  const fetchFiles = useCallback(async () => {
    let nslashes = 4;
    let returned = false;
    let params = { limit: 100, offset: 0, fname_nslashes: `${nslashes}u` };
    
    try {
      let files = await client.getFiles(params);
      let items = files.getItems() || [];

      do {
        returned = !!files.getItems()?.length;
        params = { limit: 100, offset: 0, fname_nslashes: `${++nslashes}u` };

        if (returned) {
          files = await client.getFiles(params);
          items = [ ...items, ...(files.getItems() || []) ];
        }

        do {
          setFeedFiles(DirectoryTree.fromPathList(items));
          params.offset = params.offset += params.limit;

          if (files.hasNextPage) {
            files = await client.getFiles(params);
            items = [ ...items, ...(files.getItems() || []) ];
          }
        } while (files.hasNextPage);
      } while (returned);
    } catch (error) {
      console.error(error);
    }
  }, [])

  const fetchSearch = useCallback(async (query: string) => {
    const searchParams = { limit: 10e6, fname_icontains: query };

    try {
      const files = await client.getFiles(searchParams);
      const uploads = await client.getUploadedFiles(searchParams);
      const pacs = await client.getPACSFiles(searchParams);
      const services = await client.getServiceFiles(searchParams);

      const results = DirectoryTree.fromPathList([
        ...(files.getItems() || []),
        ...(uploads.getItems() || []),
        ...(pacs.getItems() || []),
        ...(services.getItems() || []),
      ]).searchTree(query);

      setSearchResults(results);
    } catch (error) {
      console.error(error);
    }
  }, [])

  useEffect(() => {
    fetchUploaded();
    fetchFiles();
  }, [fetchUploaded, fetchFiles]);

  const UploadedFiles = () => {
    if (!uploaded)
      return (
        <EmptyState>
          <EmptyStateIcon variant="container" component={Spinner} />
          <Title size="lg" headingLevel="h4">
            Loading
          </Title>
        </EmptyState>
      )

    if (!uploaded.dir.length)
      return (
        <EmptyState>
          <EmptyStateIcon variant="container" component={CubesIcon} />
          <Title size="lg" headingLevel="h4">No Uploads</Title>
          <EmptyStateBody>
            You haven&apos;t uploaded any files yet.
          </EmptyStateBody>
          <EmptyStatePrimary>
            <Button variant="link">Upload</Button>
          </EmptyStatePrimary>
        </EmptyState>
      )

    return <Browser
      name="uploads"
      tree={new DirectoryTree(
        uploaded.child(username).child('uploads').dir
        .filter(({ hasChildren })=> hasChildren)
        .slice(0,6)
      )}
      fetchFiles={async (prefix: string) => {
        const files = await client.getUploadedFiles({ limit: 10e6, fname: prefix });
        return DirectoryTree.fileList(files.getItems() || [], prefix);
      }}
    />
  }

  const FeedsFiles = () => {
    if (!feedfiles)
      return (
        <EmptyState>
          <EmptyStateIcon variant="container" component={Spinner} />
          <Title size="lg" headingLevel="h4">
            Loading
          </Title>
        </EmptyState>
      )

    if (!feedfiles.dir.length)
      return (
        <EmptyState>
          <EmptyStateIcon variant="container" component={CubesIcon} />
          <Title size="lg" headingLevel="h4">No Feeds</Title>
          <EmptyStateBody>
            You haven&apos;t created any feeds yet. <br />
          </EmptyStateBody>
        </EmptyState>
      )

    return <Browser
      name="feeds"
      tree={new DirectoryTree(
        feedfiles.child(username).dir
        .filter(({ hasChildren })=> hasChildren)
        // .slice(0,6)
      )}
      fetchFiles={async (prefix: string) => {
        const files = await client.getFiles({ limit: 10e6, fname: prefix });
        return DirectoryTree.fileList(files.getItems() || [], prefix);
      }}
    />
  }

  const history = useHistory();
  const route = (path: string) => {
    if (history.location.pathname !== path)
      history.push(path)
  }

  const sparams = new URLSearchParams(history.location.search);

  const [searchResults, setSearchResults] = useState<DirectoryTree>()

  const SearchResults = () => {
    const _query = sparams.get("q") || ''
    if (!searchResults) {
      fetchSearch(_query);
      return <EmptyState>
        <EmptyStateIcon variant="container" component={Spinner} />
        <Title size="lg" headingLevel="h4">
          Searching
        </Title>
      </EmptyState>;
    }

    if (!searchResults.dir.length)
      return <EmptyState>
        <EmptyStateIcon variant="container" component={CubesIcon} />
        <Title size="lg" headingLevel="h4">No Results</Title>
        <EmptyStateBody>
          Couldn&apos;t find any results for &quot;{_query}&quot;. <br />
        </EmptyStateBody>
        <EmptyStatePrimary>
          <Button variant="link" 
            onClick={() => { 
              setQuery(undefined);
              route('/library');
            }}
          >
            Clear
          </Button>
        </EmptyStatePrimary>
      </EmptyState>
     
    return <Browser
      tree={searchResults}
      name="Search"
      path="/library/search"
    />
    // return <>
    // { searchResults
    //   .dir
    //   .map(({ name, children, hasChildren, item, prefix }) => {
    //     if (hasChildren)
    //       return <Browser
    //         key={prefix + name}
    //         name={name}
    //         tree={new DirectoryTree(children)}
    //         path={`/library/${prefix ? prefix + '/' : ''}${name}`}
    //       />
    //     else return (
    //       <GridItem key={name} sm={12} lg={2}>
    //         <Card isSelectable>
    //           <CardBody>
    //             <div><FileIcon/></div>
    //             <div style={{ maxWidth: "100%" }}><a href={name}>{name}</a></div>
    //             <div>{ (item.data.fsize/(1024*1024)).toFixed(3) } MB</div>
    //           </CardBody>
    //         </Card>
    //       </GridItem>
    //     )
    //   })
    // }
    // </>
  }

  return (
    <Wrapper>
      <article id="user-library">
        <h1>My Library</h1>
        <p></p>

        <section>
          <Grid hasGutter id="search">
            <GridItem lg={10} sm={12}>
              <Card isHoverable style={{ height: "100%" }}>
                <TextInput type="text" 
                  id="search-value" 
                  placeholder="Search Library" 
                  defaultValue={query || ""}
                  onChange={(value) => setQuery(value)} 
                  onKeyDown={({ key }) => {
                    if (query && key.toLowerCase() === "enter") {
                      setSearchResults(undefined)
                      route(`/library/search?q=${query}`)
                    }
                  }}
                />
              </Card>
            </GridItem>

            <GridItem lg={2} sm={12}>
              <Button 
                isLarge 
                id="finalize" 
                variant="primary" 
                onClick={() => {
                  if (query) {
                    setSearchResults(undefined)
                    route(`/library/search?q=${query}`)
                  }
                }}
              >
                <SearchIcon/> Search
              </Button>
            </GridItem>
          </Grid>
        </section>

        <Switch>
          <Route path="/library/search"
            render={() =>{
              return (
                <section>
                  <Split>
                    <SplitItem><h3>Search</h3></SplitItem>
                    <SplitItem style={{ margin: 'auto 1em' }} isFilled><hr /></SplitItem>
                  </Split>

                  <Grid hasGutter>
                    <GridItem/>
                    <SearchResults/>
                  </Grid>
                </section>
              )
            }}
          />

          {/* <Route path="/library/feeds" 
            render={() => {
              if (!feedfiles)
                return <article>
                  <EmptyState>
                    <EmptyStateIcon variant="container" component={Spinner} />
                  </EmptyState>
                </article>
                
                return <Browser 
                  withHeader
                  name="feeds"
                  path="/library/feeds"
                  tree={feedfiles.child(username)}
                  fetchFiles={async (fname: string) => {
                    const files = await client.getFiles({ limit: 10e6, fname });
                    return DirectoryTree.fileList(files.getItems() || [], fname);
                  }}
                />
            }} 
          /> */}

          <Route path="/library/uploads" 
            render={() => {
              if (!uploaded)
                return <article>
                  <EmptyState>
                    <EmptyStateIcon variant="container" component={Spinner} />
                  </EmptyState>
                </article>
                
              return <Browser 
                withHeader
                name="uploads"
                path="/library/uploads"
                tree={uploaded.child(username).child('uploads')}
                fetchFiles={async (fname: string) => {
                  const files = await client.getUploadedFiles({ limit: 10e6, fname });
                  return DirectoryTree.fileList(files.getItems() || [], fname);
                }}
              />
            }} 
          />
          
          <Route path="/library/:username/:folder" 
            render={({ match }) => {
              const { folder } = match.params;
              if (folder === "uploads") {
                if (!uploaded)
                  return <article>
                    <EmptyState>
                      <EmptyStateIcon variant="container" component={Spinner} />
                    </EmptyState>
                  </article>
                  
                return <Browser 
                  withHeader
                  name="uploads"
                  path={`/library/${username}/uploads`}
                  tree={uploaded.child(username).child('uploads')}
                  fetchFiles={async (fname: string) => {
                    const files = await client.getUploadedFiles({ limit: 10e6, fname });
                    return DirectoryTree.fileList(files.getItems() || [], fname);
                  }}
                />
              }

              if (!feedfiles)
                return <article>
                  <EmptyState>
                    <EmptyStateIcon variant="container" component={Spinner} />
                  </EmptyState>
                </article>
                
                return <Browser 
                  withHeader
                  name={folder}
                  path={`/library/${username}/${folder}`} 
                  tree={feedfiles.child(username).child(folder)}
                  fetchFiles={async (fname: string) => {
                    const files = await client.getFiles({ limit: 10e6, fname });
                    return DirectoryTree.fileList(files.getItems() || [], fname);
                  }}
                />
            }} 
          />
          
          <Route path="/library">
            <section>
              <Split>
                <SplitItem><h3>Recent Uploads</h3></SplitItem>
                <SplitItem style={{ margin: 'auto 1em' }} isFilled><hr /></SplitItem>
                <SplitItem>
                  <Button onClick={setOpenUploader.bind(UserLibrary, true)}>
                    <UploadIcon/> Upload
                  </Button>

                  <Modal 
                    width={"50%"}
                    isOpen={openUploader} 
                    onClose={setOpenUploader.bind(UserLibrary, false)}
                    title="Upload a Series"
                  >
                    <h3>Local File Upload</h3>
                  </Modal>
                </SplitItem>
              </Split>

              <Grid hasGutter>
                <GridItem/>
                <UploadedFiles/>

                {
                  (uploaded && uploaded.child(username).child('uploads').dir.length > 6) &&
                  <GridItem>
                    <Split>
                      <SplitItem isFilled/>
                      <SplitItem><Link to="/library/uploads">Show More</Link></SplitItem>
                    </Split>
                  </GridItem>
                }
              </Grid>
            </section>

            <section>
              <Split>
                <SplitItem><h3>Feed Files</h3></SplitItem>
                <SplitItem style={{ margin: 'auto 1em' }} isFilled><hr /></SplitItem>
              </Split>
              
              <Grid hasGutter>
                <GridItem/>
                <FeedsFiles/>

                {/* {
                  (feedfiles && feedfiles.child(username).dir.length > 6) &&
                  <GridItem>
                    <Split>
                      <SplitItem isFilled/>
                      <SplitItem><Link to="/library/feeds">Show More</Link></SplitItem>
                    </Split>
                  </GridItem>
                } */}
              </Grid>
              </section>
          </Route>
        </Switch>
      </article>
      <br /><br /><br /><br /><br />
    </Wrapper>
  )
}

export default UserLibrary
