import React, { useEffect, useCallback, useState } from "react";
import { Link, Route, Switch, useLocation, useHistory } from "react-router-dom";
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

import Wrapper from "../../../../containers/Layout/PageWrapper";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import { Browser, FolderCard } from "./Browser";

import "./user-library.scss";
import DirectoryTree from "../../../../utils/browser";

const client = ChrisAPIClient.getClient();

export const UserLibrary = () => {
	document.title = 'My Library';

  const [openUploader, setOpenUploader] = useState(false);

  const [uploaded, setUploaded] = useState<DirectoryTree>();
  const [services, setServices] = useState<DirectoryTree>();

  const [query, setQuery] = useState<string>();

  const fetchUploaded = useCallback(async () => {
    try {
      // const params = { limit: 250, fname_nslashes: "3u" };
      // const uploads = await client.getUploadedFiles(params);
      // let items = uploads.getItems();
      // setUploaded(DirectoryTree.fromPathList(uploads.getItems()));

      let params = { limit: 250, offset: 0, fname_nslashes: "3u" };
      let uploads = await client.getUploadedFiles(params);
      let items = uploads.getItems();

      while (uploads.hasNextPage) {
        params = { ...params, offset: params.offset += params.limit }
        uploads = await client.getUploadedFiles(params)
        items = [ ...items, ...uploads.getItems() ]
        
        setUploaded(DirectoryTree.fromPathList(items));
      }
    } catch (error) {
      console.error(error);
    }
  }, [])

  const fetchServices = useCallback(async () => {
    try {
      //@ts-ignore
      const pacs = await client.getPACSFiles({ limit: 10e6 });
      //@ts-ignore
      const service = await client.getServiceFiles({ limit: 10e6 });

      setServices(
        DirectoryTree.fromPathList([
          // { data: {fname: "SERVICES/PACS/FNNDSC Fuji/Patient-1234567/study/series/file_1.jpg"}},
          // { data: {fname: "SERVICES/PACS/FNNDSC Fuji/Patient-2345678/study/series/file_4.jpg"}},
          // { data: {fname: "SERVICES/PACS/FNNDSC Fuji/Patient-3456789/study/series/file_8.jpg"}},
          // { data: {fname: "SERVICES/PACS/Orthanc/Patient-1234567/study/series/file_1.jpg"}},
          // { data: {fname: "SERVICES/PACS/Orthanc/Patient-2345678/study/series/file_4.txt"}},
          // { data: {fname: "SERVICES/PACS/Orthanc/Patient-3456789/study/series/file_8.txt"}},
          // { data: {fname: "SERVICES/PACS/Orthanc/Patient-4567890/study/series/file_8.txt"}},
          // { data: {fname: "SERVICES/Genomics/Database/Patient-3456789/study/series/file_9.txt"}},
          // { data: {fname: "SERVICES/Genomics/Database/Patient-3456789/study/file_X.txt"}},
          ...pacs.getItems(), 
          ...service.getItems(),
        ])
      );
    } catch (error) {
      console.error(error);
    }
  }, [])

  const fetchSearch = useCallback(async (query: string) => {
    try {
      // const uploads = await client.getUploadedFiles({ limit: 10e6, fname: query });
      //@ts-ignore
      const pacs = await client.getPACSFiles({ limit: 10e6, fname: query });
      //@ts-ignore
      const service = await client.getServiceFiles({ limit: 10e6, fname: query });

      // setUploaded(DirectoryTree.fromPathList(uploads.getItems()));
      setServices(
        DirectoryTree.fromPathList([
          ...pacs.getItems(), 
          ...service.getItems(),
        ])
      );
    } catch (error) {
      console.error(error);
    }
  }, [])

  useEffect(() => {
    fetchUploaded();
    fetchServices();
  }, [fetchUploaded, fetchServices]);

  const UploadedFiles = () => {
    if (uploaded) {
      const files = <>
        { uploaded.child('chris').child('uploads').dir
          .filter(({ hasChildren })=> hasChildren)
          .slice(0,6)
          .map((folder) => (
            <GridItem key={folder.prefix + folder.name} sm={12} lg={4}>
              <FolderCard item={folder} />
            </GridItem>
        ))}
      </>

      if (uploaded.dir.length)
        return files
      else 
        return (
          <EmptyState>
            <EmptyStateIcon variant="container" component={CubesIcon} />
            <Title size="lg" headingLevel="h4">
              No Uploaded Studies
            </Title>
            <EmptyStateBody>
              You haven&apos;t uploaded any files yet.
            </EmptyStateBody>
            <EmptyStatePrimary>
              <Button variant="link">Upload</Button>
            </EmptyStatePrimary>
          </EmptyState>
        )
    }
    else {
      return (
        <EmptyState>
          <EmptyStateIcon variant="container" component={Spinner} />
          <Title size="lg" headingLevel="h4">
            Loading
          </Title>
        </EmptyState>
      )
    }
  }

  const Services = () => {
    if (services) {
      const items = <>
        { services.child('SERVICES').dir
          .filter(({ hasChildren }) => hasChildren)
          .map((folder) => (
            <GridItem key={folder.prefix + folder.name} sm={12} lg={4}>
              <FolderCard item={folder} />
            </GridItem>
        ))}
      </>

      if (services.dir.length)
        return items
      else 
        return (
          <EmptyState>
            <EmptyStateIcon variant="container" component={CubesIcon} />
            <Title size="lg" headingLevel="h4">
              No Services
            </Title>
            <EmptyStateBody>
              You haven&apos;t pulled any series from any services yet. <br />
            </EmptyStateBody>
          </EmptyState>
        )
    }
    else {
      return (
        <EmptyState>
          <EmptyStateIcon variant="container" component={Spinner} />
          <Title size="lg" headingLevel="h4">
            Loading
          </Title>
        </EmptyState>
      )
    }
  }

  const route = useHistory().push;
  const params = new URLSearchParams(useLocation().search);

  const SearchResults = () => {
    const searchSpace = [uploaded, services]
    const _query = params.get("q") || ''
    // fetchSearch(_query)

    const searchResults = new DirectoryTree([])
    for (const dir of searchSpace) {
      searchResults.dir = [ 
        ...searchResults.dir, 
        ...(dir?.searchTree(_query).dir || [])
      ]
    }

    if (!searchSpace.filter(item => !!item).length) 
      return <EmptyState>
        <EmptyStateIcon variant="container" component={Spinner} />
        <Title size="lg" headingLevel="h4">
          Searching
        </Title>
      </EmptyState>;

    if (!searchResults?.dir.length)
      return <EmptyState>
        <EmptyStateIcon variant="container" component={CubesIcon} />
        <Title size="lg" headingLevel="h4">
          No Results
        </Title>
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
      fetchFiles={async (prefix: string) => {
        const files = await client.getUploadedFiles({ limit: 10e6, fname: prefix });
        return DirectoryTree.fileList(files.getItems(), prefix);
      }}
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
                  value={query || ""}
                  onChange={(value) => setQuery(value)} 
                />
              </Card>
            </GridItem>

            <GridItem lg={2} sm={12}>
              <Button 
                isLarge 
                id="finalize" 
                variant="primary" 
                onClick={() => {
                  if (query) route(`/library/search?q=${query}`)
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
                  name="SERVICES"
                  path="/library/SERVICES"
                  tree={services.child('SERVICES')}
                  fetchFiles={async (prefix: string) => {
                    //@ts-ignore
                    const pacs = await client.getPACSFiles({ limit: 10e6, fname: prefix });
                    //@ts-ignore
                    const service = await client.getServiceFiles({ limit: 10e6, fname: prefix });

                    return DirectoryTree.fileList([
                      ...pacs.getItems(), 
                      ...service.getItems(),
                    ], prefix);
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
                  name={folder}
                  path={`/library/${folder}`} 
                  tree={uploaded.child(folder)}
                  fetchFiles={async (prefix: string) => {
                    const files = await client.getUploadedFiles({ limit: 10e6, fname: prefix });
                    return DirectoryTree.fileList(files.getItems(), prefix);
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

                <GridItem>
                  <Split>
                    <SplitItem isFilled/>
                    <SplitItem><Link to="/library/chris/uploads">Show More</Link></SplitItem>
                  </Split>
                </GridItem>
              </Grid>
            </section>

            <section>
              <Split>
                <SplitItem><h3>Services</h3></SplitItem>
                <SplitItem style={{ margin: 'auto 1em' }} isFilled><hr /></SplitItem>
              </Split>
              
              <Grid hasGutter>
                <GridItem/>
                <Services/>
              </Grid>
              </section>
          </Route>
        </Switch>
      </article>
    </Wrapper>
  )
}

export default UserLibrary
