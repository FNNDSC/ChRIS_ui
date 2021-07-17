import React, { useEffect, useCallback, useState } from "react";
import { Link, Route, Switch } from "react-router-dom";
import { CubesIcon, UploadIcon, SearchIcon, FolderIcon, FileIcon } from "@patternfly/react-icons";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
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
import { Browser } from "./Browser";

import "./user-library.scss";
import { Directory, Tree } from "../../../../utils/browser";

const client = ChrisAPIClient.getClient();

export const UserLibrary = () => {
	document.title = 'My Library';

  const [openUploader, setOpenUploader] = useState(false);

  const [uploaded, setUploaded] = useState<Tree>();
  const [services, setServices] = useState<Tree>();

  const fetchUploaded = useCallback(async () => {
    try {
      const uploads = await client.getUploadedFiles({ limit: 10e6 });
      setUploaded(
        Directory.buildDirectoryTree(uploads.getItems().map(({ data }) => {
          data.fname = data.fname.replace(/chris\/uploads\//g, "");
          return data
        }))
      );
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
        Directory.buildDirectoryTree(
        // [
        //   { data: {fname: "SERVICES/PACS/Patient-1234567/study/series/file_1.txt"}},
        //   { data: {fname: "SERVICES/PACS/Patient-1234567/study/series/file_2.txt"}},
        //   { data: {fname: "SERVICES/PACS/Patient-1234567/study/series/file_3.txt"}},
        //   { data: {fname: "SERVICES/PACS/Patient-2345678/study/series/file_4.txt"}},
        //   { data: {fname: "SERVICES/PACS/Patient-2345678/study/series/file_5.txt"}},
        //   { data: {fname: "SERVICES/PACS/Patient-2345678/study/series/file_6.txt"}},
        //   { data: {fname: "SERVICES/PACS/Patient-2345678/study/series/file_7.txt"}},
        //   { data: {fname: "SERVICES/PACS/Patient-3456789/study/series/file_8.txt"}},
        //   { data: {fname: "SERVICES/PACS/Patient-3456789/study/series/file_9.txt"}},
        //   { data: {fname: "SERVICES/PACS/Patient-3456789/study/series/file_X.txt"}},
        //   { data: {fname: "SERVICES/Orthanc/Patient-1234567/study/series/file_1.txt"}},
        //   { data: {fname: "SERVICES/Orthanc/Patient-1234567/study/series/file_2.txt"}},
        //   { data: {fname: "SERVICES/Orthanc/Patient-1234567/study/series/file_3.txt"}},
        //   { data: {fname: "SERVICES/Orthanc/Patient-2345678/study/series/file_4.txt"}},
        //   { data: {fname: "SERVICES/Orthanc/Patient-2345678/study/series/file_5.txt"}},
        //   { data: {fname: "SERVICES/Orthanc/Patient-2345678/study/series/file_6.txt"}},
        //   { data: {fname: "SERVICES/Orthanc/Patient-2345678/study/series/file_7.txt"}},
        //   { data: {fname: "SERVICES/Orthanc/Patient-3456789/study/series/file_8.txt"}},
        //   { data: {fname: "SERVICES/Another/Patient-3456789/study/series/file_9.txt"}},
        //   { data: {fname: "SERVICES/Another/Patient-3456789/study/file_X.txt"}},
        //   { data: {fname: "SERVICES/Another/Patient-3456789/study/file_Y.txt"}},
        // ]
        [
          ...pacs.getItems(), ...service.getItems()
        ]
        .map(({ data }) => {
          data.fname = data.fname.replace(/SERVICES\//g, '');
          return data
        })
        )
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
        { uploaded.slice(0,6).map(({ name, children, item, hasChildren }) => (
          <GridItem key={name} sm={12} lg={4}>
            <Card isSelectable>
              <CardBody>
                <Split>
                  <SplitItem style={{ marginRight: "1em" }}>{ children.length ? <FolderIcon/> : <FileIcon/> }</SplitItem>
                  <SplitItem isFilled style={{ overflow: "hidden" }}>
                    <Link to={`/library/uploads/${name}`}>{name}</Link>
                  </SplitItem>
                  <SplitItem>
                    { hasChildren ?
                      <div>{children.length} items</div>
                    : <div>{ (item.fsize/(1024*1024)).toFixed(3) } MB</div>
                    }
                  </SplitItem>
                </Split>
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </>

      if (uploaded.length)
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
        { services.slice(0,8).map(({ name, children, item, hasChildren }) => (
          <GridItem key={name} sm={12} lg={2}>
            <Card isSelectable>
              <CardBody style={{ margin: "1em 0" }}>
                <div><CubesIcon style={{ height: "50%" }} /></div>
                <div><Link to={`/library/SERVICES/${name}`}>{name}</Link></div>
                { hasChildren ?
                  <div>{children.length} items</div>
                : <div>{ (item.fsize/(1024*1024)).toFixed(3) } MB</div>
                }
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </>

      if (services.length)
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

  return (
    <Wrapper>
      <article id="user-library">
        <h1>My Library</h1>
        <p></p>

        <section>
          <Grid hasGutter id="search">
            <GridItem lg={10} sm={12}>
              <Card style={{ height: "100%" }}>
                <TextInput type="text" id="search-value" 
                  placeholder="Search Library" 
                  onChange={() => { /**/ }} 
                />
              </Card>
            </GridItem>

            <GridItem lg={2} sm={12}>
              <Button isLarge variant="primary" id="finalize" onClick={()=>({})}>
                <SearchIcon/> Search
              </Button>
            </GridItem>
          </Grid>
        </section>

        <Switch>
          <Route path="/library/:folder" 
            render={({ match }) => {
              if (!uploaded || !services)
                return <article>
                  <EmptyState>
                    <EmptyStateIcon variant="container" component={Spinner} />
                  </EmptyState>
                </article>

              if (match.params.folder === 'uploads')
                return <Browser path={`/library/${match.params.folder}`} tree={uploaded} />
              if (match.params.folder === 'SERVICES')
                return <Browser path={`/library/${match.params.folder}`} tree={services} />
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

                  <Modal isOpen={openUploader} onClose={setOpenUploader.bind(UserLibrary, false)}
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
                    <SplitItem><Link to="/library/uploads">Show More</Link></SplitItem>
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
