import React, { useEffect, useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, Route, Switch, useHistory } from "react-router-dom";
import { CubesIcon, SearchIcon, UploadIcon } from "@patternfly/react-icons";
import {
  Button,
  Card,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStatePrimary,
  Grid,
  GridItem,
  Spinner,
  Split,
  SplitItem,
  TextInput,
  Title,
  Modal,
  ModalVariant,
} from "@patternfly/react-core";
import { v4 } from "uuid";

import ChrisAPIClient from "../../../../api/chrisapiclient";
import { useTypedSelector } from "../../../../store/hooks";
import Wrapper from "../../../../containers/Layout/PageWrapper";
import FileUpload from "../../../../components/common/fileupload";

import "./user-library.scss";
import Browser from "./Browser";
import DirectoryTree from "../../../../utils/browser";
import { setSidebarActive } from "../../../../store/ui/actions";
import { LocalFile } from "../../../../components/feed/CreateFeed/types";

export const UserLibrary = () => {
  const client = ChrisAPIClient.getClient();
  document.title = "My Library";
  const [uploadedFileModal, setUploadFileModal] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState(false);
  const [directoryName, setDirectoryName] = React.useState("");
  const username = useTypedSelector((state) => state.user.username) as string;
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(
      setSidebarActive({
        activeItem: "lib",
      })
    );
  }, [dispatch]);

  const [uploaded, setUploaded] = useState<DirectoryTree>();
  const [services, setServices] = useState<DirectoryTree>();
  const [feedfiles, setFeedFiles] = useState<DirectoryTree>();

  const [query, setQuery] = useState<string>();

  const fetchUploaded = useCallback(async () => {
    const params = { limit: 100, offset: 0, fname_nslashes: "3u" };

    try {
      let uploads = await client.getUploadedFiles(params);
      let items = uploads.getItems() || [];

      do {
        setUploaded(
          DirectoryTree.fromPathList(items).child(username).child("uploads")
        );
        params.offset = params.offset += params.limit;

        if (uploads.hasNextPage) {
          uploads = await client.getUploadedFiles(params);
          items = [...items, ...(uploads.getItems() || [])];
        }
      } while (uploads.hasNextPage);
    } catch (error) {
      console.error(error);
    }
  }, [client, username]);

  const fetchServices = useCallback(async () => {
    const params = { limit: 100, offset: 0, fname_nslashes: "5u" };

    try {
      let service = await client.getServiceFiles(params);
      let pacs = await client.getPACSFiles({ ...params, fname_nslashes: "6u" });
      let items = [...(pacs.getItems() || []), ...(service.getItems() || [])];

      do {
        setServices(DirectoryTree.fromPathList(items).child("SERVICES"));
        params.offset = params.offset += params.limit;

        if (service.hasNextPage) {
          service = await client.getServiceFiles(params);
          items = [...items, ...(service.getItems() || [])];
        }
        if (pacs.hasNextPage) {
          pacs = await client.getPACSFiles(params);
          items = [...items, ...(pacs.getItems() || [])];
        }
      } while (service.hasNextPage || pacs.hasNextPage);
    } catch (error) {
      console.error(error);
    }
  }, [client]);

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
          items = [...items, ...(files.getItems() || [])];
        }

        do {
          setFeedFiles(DirectoryTree.fromPathList(items).child(username));
          params.offset = params.offset += params.limit;

          if (files.hasNextPage) {
            files = await client.getFiles(params);
            items = [...items, ...(files.getItems() || [])];
          }
        } while (files.hasNextPage);
      } while (returned);
    } catch (error) {
      console.error(error);
    }
  }, [client, username]);

  const fetchSearch = useCallback(
    async (query: string) => {
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
    },
    [client]
  );

  useEffect(() => {
    fetchUploaded();
    fetchServices();
    fetchFiles();
  }, [fetchUploaded, fetchServices, fetchFiles]);

  const UploadedFiles = () => {
    if (!uploaded)
      return (
        <EmptyState>
          <EmptyStateIcon variant="container" component={Spinner} />
          <Title size="lg" headingLevel="h4">
            Loading
          </Title>
        </EmptyState>
      );

    if (!uploaded.dir.length)
      return (
        <EmptyState>
          <EmptyStateIcon variant="container" component={CubesIcon} />
          <Title size="lg" headingLevel="h4">
            No Uploads
          </Title>
          <EmptyStateBody>
            You haven&apos;t uploaded any files yet.
          </EmptyStateBody>
          <EmptyStatePrimary>
            <Button variant="link">Upload</Button>
          </EmptyStatePrimary>
        </EmptyState>
      );

    return (
      <Browser
        name="uploads"
        tree={
          new DirectoryTree(
            uploaded.dir.filter(({ hasChildren }) => hasChildren).slice(0, 6)
          )
        }
        fetchFiles={async (prefix: string) => {
          const files = await client.getUploadedFiles({
            limit: 10e6,
            fname: prefix,
          });
          return DirectoryTree.fileList(files.getItems() || [], prefix);
        }}
      />
    );
  };

  const ServiceFiles = () => {
    if (!services)
      return (
        <EmptyState>
          <EmptyStateIcon variant="container" component={Spinner} />
          <Title size="lg" headingLevel="h4">
            Loading
          </Title>
        </EmptyState>
      );

    if (!services.dir.length)
      return (
        <EmptyState>
          <EmptyStateIcon variant="container" component={CubesIcon} />
          <Title size="lg" headingLevel="h4">
            No Services
          </Title>
          <EmptyStateBody>
            You haven&apos;t pulled from any services yet. <br />
          </EmptyStateBody>
        </EmptyState>
      );

    return (
      <Browser
        name="SERVICES"
        tree={
          new DirectoryTree(
            services.dir.filter(({ hasChildren }) => hasChildren).slice(0, 6)
          )
        }
        fetchFiles={async (fname: string) => {
          const pacs = await client.getPACSFiles({ limit: 10e6, fname });
          const service = await client.getServiceFiles({ limit: 10e6, fname });

          return DirectoryTree.fileList(
            [...(pacs.getItems() || []), ...(service.getItems() || [])],
            fname
          );
        }}
      />
    );
  };

  const FeedsFiles = () => {
    if (!feedfiles)
      return (
        <EmptyState>
          <EmptyStateIcon variant="container" component={Spinner} />
          <Title size="lg" headingLevel="h4">
            Loading
          </Title>
        </EmptyState>
      );

    if (!feedfiles.dir.length)
      return (
        <EmptyState>
          <EmptyStateIcon variant="container" component={CubesIcon} />
          <Title size="lg" headingLevel="h4">
            No Feeds
          </Title>
          <EmptyStateBody>
            You haven&apos;t created any feeds yet. <br />
          </EmptyStateBody>
        </EmptyState>
      );

    return (
      <Browser
        name="feeds"
        tree={
          new DirectoryTree(
            feedfiles.dir.filter(({ hasChildren }) => hasChildren).slice(0, 6)
          )
        }
        fetchFiles={async (prefix: string) => {
          const files = await client.getFiles({ limit: 10e6, fname: prefix });
          return DirectoryTree.fileList(files.getItems() || [], prefix);
        }}
      />
    );
  };

  const history = useHistory();
  const route = (path: string) => {
    if (history.location.pathname !== path) history.push(path);
  };

  const sparams = new URLSearchParams(history.location.search);

  const [searchResults, setSearchResults] = useState<DirectoryTree>();

  const SearchResults = () => {
    const _query = sparams.get("q") || "";
    if (!searchResults) {
      fetchSearch(_query);
      return (
        <EmptyState>
          <EmptyStateIcon variant="container" component={Spinner} />
          <Title size="lg" headingLevel="h4">
            Searching
          </Title>
        </EmptyState>
      );
    }

    if (!searchResults.dir.length)
      return (
        <EmptyState>
          <EmptyStateIcon variant="container" component={CubesIcon} />
          <Title size="lg" headingLevel="h4">
            No Results
          </Title>
          <EmptyStateBody>
            Couldn&apos;t find any results for &quot;{_query}&quot;. <br />
          </EmptyStateBody>
          <EmptyStatePrimary>
            <Button
              variant="link"
              onClick={() => {
                setQuery(undefined);
                route("/library");
              }}
            >
              Clear
            </Button>
          </EmptyStatePrimary>
        </EmptyState>
      );

    return (
      <Browser tree={searchResults} name="Search" path="/library/search" />
    );
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
  };

  const fetchUploadedDir = async (fname: string) => {
    const files = await client.getUploadedFiles({ limit: 10e6, fname });
    return DirectoryTree.fileList(files.getItems() || [], fname);
  };

  const fetchServicesDir = async (fname: string) => {
    const pacs = await client.getPACSFiles({ limit: 10e6, fname });
    const service = await client.getServiceFiles({ limit: 10e6, fname });

    return DirectoryTree.fileList(
      [...(pacs.getItems() || []), ...(service.getItems() || [])],
      fname
    );
  };

  const fetchFeedDir = async (fname: string) => {
    const files = await client.getFiles({ limit: 10e6, fname });
    return DirectoryTree.fileList(files.getItems() || [], fname);
  };

  return (
    <Wrapper>
      <article id="user-library">
        <h1>My Library</h1>
        <p></p>

        <section>
          <Grid hasGutter id="search">
            <GridItem lg={10} sm={12}>
              <Card style={{ height: "100%" }}>
                <TextInput
                  type="text"
                  id="search-value"
                  placeholder="Search Library"
                  defaultValue={query || ""}
                  onChange={(value) => setQuery(value)}
                  onKeyDown={({ key }) => {
                    if (query && key.toLowerCase() === "enter") {
                      setSearchResults(undefined);
                      route(`/library/search?q=${query}`);
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
                    setSearchResults(undefined);
                    route(`/library/search?q=${query}`);
                  }
                }}
              >
                <SearchIcon /> Search
              </Button>
            </GridItem>
          </Grid>
        </section>

        <Switch>
          <Route
            path="/library/search"
            render={() => {
              return (
                <section>
                  <Split>
                    <SplitItem>
                      <h3>Search</h3>
                    </SplitItem>
                    <SplitItem style={{ margin: "auto 1em" }} isFilled>
                      <hr />
                    </SplitItem>
                  </Split>

                  <Grid hasGutter>
                    <GridItem />
                    <SearchResults />
                  </Grid>
                </section>
              );
            }}
          />

          <Route
            path="/library/SERVICES"
            render={() => {
              if (!services)
                return (
                  <article>
                    <EmptyState>
                      <EmptyStateIcon variant="container" component={Spinner} />
                    </EmptyState>
                  </article>
                );

              return (
                <Browser
                  withHeader
                  name="SERVICES"
                  path="/library/SERVICES"
                  tree={services}
                  fetchFiles={fetchServicesDir}
                />
              );
            }}
          />

          <Route
            path="/library/uploads"
            render={() => {
              if (!uploaded)
                return (
                  <article>
                    <EmptyState>
                      <EmptyStateIcon variant="container" component={Spinner} />
                    </EmptyState>
                  </article>
                );

              return (
                <Browser
                  withHeader
                  name="uploads"
                  path="/library/uploads"
                  tree={uploaded}
                  fetchFiles={fetchUploadedDir}
                />
              );
            }}
          />

          <Route
            path="/library/feeds"
            render={() => {
              if (!feedfiles)
                return (
                  <article>
                    <EmptyState>
                      <EmptyStateIcon variant="container" component={Spinner} />
                    </EmptyState>
                  </article>
                );

              return (
                <Browser
                  withHeader
                  name="feeds"
                  path="/library/feeds"
                  tree={feedfiles}
                  fetchFiles={fetchFeedDir}
                />
              );
            }}
          />

          <Route
            path="/library/:username/:folder"
            render={({ match }) => {
              const { folder } = match.params;
              if (folder === "uploads") {
                if (!uploaded)
                  return (
                    <article>
                      <EmptyState>
                        <EmptyStateIcon
                          variant="container"
                          component={Spinner}
                        />
                      </EmptyState>
                    </article>
                  );

                return (
                  <Browser
                    withHeader
                    name="uploads"
                    path={`/library/${username}/uploads`}
                    tree={uploaded}
                    fetchFiles={fetchUploadedDir}
                  />
                );
              }

              if (!feedfiles)
                return (
                  <article>
                    <EmptyState>
                      <EmptyStateIcon variant="container" component={Spinner} />
                    </EmptyState>
                  </article>
                );

              return (
                <Browser
                  withHeader
                  name={folder}
                  path={`/library/${username}/${folder}`}
                  tree={feedfiles.child(folder)}
                  fetchFiles={fetchFeedDir}
                />
              );
            }}
          />

          <Route path="/library">
            <section>
              <Split>
                <SplitItem>
                  <h3>Recent Uploads</h3>
                </SplitItem>
                <SplitItem style={{ margin: "auto 1em" }} isFilled>
                  <hr />
                </SplitItem>
                {
                  <SplitItem>
                    <Button
                      onClick={() => {
                        setUploadFileModal(true);
                      }}
                    >
                      <UploadIcon /> Upload
                    </Button>
                  </SplitItem>
                }
              </Split>
              <Modal
                variant={ModalVariant.small}
                onClose={() => {
                  setUploadFileModal(false);
                }}
                title="Upload your files"
                isOpen={uploadedFileModal}
              >
                <FileUpload
                  className=""
                  handleDeleteDispatch={() => {
                    console.log("test");
                  }}
                  localFiles={[]}
                  dispatchFn={async (files) => {
                    const directory = `${username}/uploads/test-upload-${v4().substr(
                      0,
                      4
                    )}`;
                    const client = ChrisAPIClient.getClient();
                    for (let i = 0; i < files.length; i++) {
                      setUploadedFiles(true);
                      const file = files[i];

                      if (i == 0) {
                        setDirectoryName(directory);
                      }

                      await client.uploadFile(
                        {
                          upload_path: `${directory}/${file.name}`,
                        },
                        {
                          fname: (file as LocalFile).blob,
                        }
                      );
                    }
                    setUploadedFiles(false);
                    setUploadFileModal(false);
                  }}
                />
                {uploadedFiles && (
                  <div>
                    Files are being uploaded at {directoryName}. Please wait....
                  </div>
                )}
              </Modal>

              <Grid hasGutter>
                <GridItem />
                <UploadedFiles />

                {uploaded && uploaded.dir.length > 6 && (
                  <GridItem>
                    <Split>
                      <SplitItem isFilled />
                      <SplitItem>
                        <Link to="/library/uploads">Show More</Link>
                      </SplitItem>
                    </Split>
                  </GridItem>
                )}
              </Grid>
            </section>

            <section>
              <Split>
                <SplitItem>
                  <h3>Services</h3>
                </SplitItem>
                <SplitItem style={{ margin: "auto 1em" }} isFilled>
                  <hr />
                </SplitItem>
              </Split>

              <Grid hasGutter>
                <GridItem />
                <ServiceFiles />

                {services && services.dir.length > 6 && (
                  <GridItem>
                    <Split>
                      <SplitItem isFilled />
                      <SplitItem>
                        <Link to="/library/SERVICES">Show More</Link>
                      </SplitItem>
                    </Split>
                  </GridItem>
                )}
              </Grid>
            </section>

            <section>
              <Split>
                <SplitItem>
                  <h3>Feed Files</h3>
                </SplitItem>
                <SplitItem style={{ margin: "auto 1em" }} isFilled>
                  <hr />
                </SplitItem>
              </Split>

              <Grid hasGutter>
                <GridItem />
                <FeedsFiles />

                {feedfiles && feedfiles.dir.length > 6 && (
                  <GridItem>
                    <Split>
                      <SplitItem isFilled />
                      <SplitItem>
                        <Link to="/library/feeds">Show More</Link>
                      </SplitItem>
                    </Split>
                  </GridItem>
                )}
              </Grid>
            </section>
          </Route>
        </Switch>
      </article>
    </Wrapper>
  );
};

export default UserLibrary;
