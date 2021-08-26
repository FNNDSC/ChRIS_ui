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
  const [services, setServices] = useState<DirectoryTree>();

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

  const fetchServices = useCallback(async () => {
    const params = { limit: 100, offset: 0, fname_nslashes: "5u" };

    try {
      let service = await client.getServiceFiles(params);
      let pacs = await client.getPACSFiles({ ...params, fname_nslashes: "6u" });
      let items = [
        ...(pacs.getItems() || []), 
        ...(service.getItems() || []),
      ];

      do {
        setServices(DirectoryTree.fromPathList(items));
        params.offset = params.offset += params.limit;

        if (service.hasNextPage) {
          service = await client.getServiceFiles(params);
          items = [ ...items, ...(service.getItems() || []) ];
        }
        if (pacs.hasNextPage) {
          pacs = await client.getPACSFiles(params);
          items = [ ...items, ...(pacs.getItems() || []) ];
        }
      } while (service.hasNextPage || pacs.hasNextPage);
    } catch (error) {
      console.error(error);
    }
  }, [])

  const fetchSearch = useCallback(async (query: string) => {
    const searchParams = { limit: 10e6, fname_icontains: query };

    try {
      const uploads = await client.getUploadedFiles(searchParams);
      const pacs = await client.getPACSFiles(searchParams);
      const services = await client.getServiceFiles(searchParams);

      const results = DirectoryTree.fromPathList([
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
    fetchServices();
  }, [fetchUploaded, fetchServices]);

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

  const ServiceFiles = () => {
    if (!services)
      return (
        <EmptyState>
          <EmptyStateIcon variant="container" component={Spinner} />
          <Title size="lg" headingLevel="h4">
            Loading
          </Title>
        </EmptyState>
      )

    if (!services.dir.length)
      return (
        <EmptyState>
          <EmptyStateIcon variant="container" component={CubesIcon} />
          <Title size="lg" headingLevel="h4">No Services</Title>
          <EmptyStateBody>
            You haven&apos;t pulled from any services yet. <br />
          </EmptyStateBody>
        </EmptyState>
      )

    return <Browser
      name="SERVICES"
      tree={new DirectoryTree(
        services.child('SERVICES').dir
        .filter(({ hasChildren })=> hasChildren)
        .slice(0,6)
      )}
      fetchFiles={async (fname: string) => {
        const pacs = await client.getPACSFiles({ limit: 10e6, fname });
        const service = await client.getServiceFiles({ limit: 10e6, fname });

        return DirectoryTree.fileList([
          ...(pacs.getItems() || []),
          ...(service.getItems() || []),
        ], fname);
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
              <Card style={{ height: "100%" }}>
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

          <Route path="/library/SERVICES" 
            render={() => {
              if (!services)
                return <article>
                  <EmptyState>
                    <EmptyStateIcon variant="container" component={Spinner} />
                  </EmptyState>
                </article>
                
                return <Browser 
                  withHeader
                  name="SERVICES"
                  path="/library/SERVICES"
                  tree={services.child('SERVICES')}
                  fetchFiles={async (fname: string) => {
                    const pacs = await client.getPACSFiles({ limit: 10e6, fname });
                    const service = await client.getServiceFiles({ limit: 10e6, fname });

                    return DirectoryTree.fileList([
                      ...(pacs.getItems() || []),
                      ...(service.getItems() || []),
                    ], fname);
                  }}
                />
            }} 
          />

          <Route path="/library/:folder" 
            render={({ match }) => {
              if (!uploaded)
                return <article>
                  <EmptyState>
                    <EmptyStateIcon variant="container" component={Spinner} />
                  </EmptyState>
                </article>
                
                const { folder } = match.params;
                return <Browser 
                  withHeader
                  name={folder}
                  path={`/library/${folder}`} 
                  tree={uploaded.child(folder)}
                  fetchFiles={async (fname: string) => {
                    const files = await client.getUploadedFiles({ limit: 10e6, fname });
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
                      <SplitItem><Link to={`/library/${username}/uploads`}>Show More</Link></SplitItem>
                    </Split>
                  </GridItem>
                }
              </Grid>
            </section>

            <section>
              <Split>
                <SplitItem><h3>Services</h3></SplitItem>
                <SplitItem style={{ margin: 'auto 1em' }} isFilled><hr /></SplitItem>
              </Split>
              
              <Grid hasGutter>
                <GridItem/>
                <ServiceFiles/>

                {
                  (services && services.child('SERVICES').dir.length > 6) &&
                  <GridItem>
                    <Split>
                      <SplitItem isFilled/>
                      <SplitItem><Link to="/library/SERVICES">Show More</Link></SplitItem>
                    </Split>
                  </GridItem>
                }
              </Grid>
              </section>
          </Route>
        </Switch>
      </article>
    </Wrapper>
  )
}

export default UserLibrary
