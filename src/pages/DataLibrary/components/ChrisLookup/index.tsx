import React, { useCallback, useEffect, useState } from 'react';
import { Button, Card, CardBody, EmptyState, EmptyStateBody, EmptyStateIcon, EmptyStatePrimary, Grid, GridItem, Spinner, TextInput, Title } from '@patternfly/react-core';

import Wrapper from "../../../../containers/Layout/PageWrapper";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import { FeedFileList } from "@fnndsc/chrisapi"
import { CubesIcon, SearchIcon } from '@patternfly/react-icons';

import "./chris-lookup.scss";

const client = ChrisAPIClient.getClient();

export const Swift = () => {
  const [feedFiles, setFeedFiles] = useState<FeedFileList>();
  const [pacsfiles, setPACSFiles] = useState<FeedFileList>();
  const [srvsfiles, setSrvsFiles] = useState<FeedFileList>();

  const getFeedFiles = useCallback(async ()=>{
    //@ts-ignore
    const get = await client.getFiles();
    setFeedFiles(get);
  }, [])

  const getPACSFiles = useCallback(async ()=>{
    //@ts-ignore
    const get = await client.getPACSFiles();
    setPACSFiles(get);
  }, [])

  const getSrvsFiles = useCallback(async ()=>{
    //@ts-ignore
    const get = await client.getServiceFiles();
    setSrvsFiles(get);
  }, [])

  useEffect(() => {
    getFeedFiles();
    getPACSFiles();
    getSrvsFiles();
  }, [getFeedFiles, getPACSFiles, getSrvsFiles])

  // const FileCard = (file) => (
    
  // )

  const FeedFiles = () => {
    if (feedFiles) {
      if (feedFiles.getItems().length) return (
        <>
        { feedFiles.getItems().map(({data: file, url}) => (
          <GridItem key={file.id} sm={12} lg={6}>
            <Card>
              <CardBody>
                <div><a href={url}>{file.fname.replace(/chris\//g, "")}</a></div>
                <div>{(file.fsize/(1024)).toFixed(2)} KB, {(new Date(file.creation_date)).toDateString()}</div>
              </CardBody>
            </Card>
          </GridItem>
        ))}
        </>
      )
      else return (
        <EmptyState>
          <EmptyStateIcon variant="container" component={CubesIcon} />
          <Title size="lg" headingLevel="h4">
            No Feed Files
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
    else return (
      <EmptyState>
        <EmptyStateIcon variant="container" component={Spinner} />
      </EmptyState>
    )
  }

  const PACSFiles = () => {
    if (pacsfiles) {
      if (pacsfiles.getItems().length) return (
        <>
        { pacsfiles.getItems().map(({data: file, url}) => (
          <GridItem key={file.id} sm={12} lg={6}>
            <Card>
              <CardBody>
                <div><a href={url}>{file.fname.replace(/chris\//g, "")}</a></div>
                <div>{(file.fsize/(1024)).toFixed(2)} KB, {(new Date(file.creation_date)).toDateString()}</div>
              </CardBody>
            </Card>
          </GridItem>
        ))}
        </>
      )
      else return (
        <EmptyState>
          <EmptyStateIcon variant="container" component={CubesIcon} />
          <Title size="lg" headingLevel="h4">
            No PACS Files
          </Title>
          <EmptyStateBody>
            You haven&apos;t downloaded any PACS files yet.
          </EmptyStateBody>
          <EmptyStatePrimary>
            <Button variant="link">Search PACS</Button>
          </EmptyStatePrimary>
        </EmptyState>
      )
    }
    else return (
      <EmptyState>
        <EmptyStateIcon variant="container" component={Spinner} />
      </EmptyState>
    )
  }

  const ServiceFiles = () => {
    if (srvsfiles) {
      if (srvsfiles.getItems().length) return (
        <>
        { srvsfiles.getItems().map(({data: file, url}) => (
          <GridItem key={file.id} sm={12} lg={6}>
            <Card>
              <CardBody>
                <div><a href={url}>{file.fname.replace(/chris\//g, "")}</a></div>
                <div>{(file.fsize/(1024)).toFixed(2)} KB, {(new Date(file.creation_date)).toDateString()}</div>
              </CardBody>
            </Card>
          </GridItem>
        ))}
        </>
      )
      else return (
        <EmptyState>
          <EmptyStateIcon variant="container" component={CubesIcon} />
          <Title size="lg" headingLevel="h4">
            No Service Files
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
    else return (
      <EmptyState>
        <EmptyStateIcon variant="container" component={Spinner} />
      </EmptyState>
    )
  }

  return (
    <Wrapper>
      <article id="chris-lookup">
        <h1>ChRIS Storage</h1>

        <Grid hasGutter>
          <GridItem>
            <Grid hasGutter id="recents">
              <GridItem><h3>Recently Opened</h3></GridItem>
              { feedFiles?.getItems().slice(0,4).map(({data: file, url}) => (
                <GridItem key={file.id} sm={12} lg={3}>
                  <Card>
                    <CardBody>
                      <div><a href={url}>{file.fname.replace(/chris\/.+?\/.+?\//g, "")}</a></div>
                      <div>Opened {(new Date(file.creation_date)).toDateString()}</div>
                    </CardBody>
                  </Card>
                </GridItem>
              ))}
            </Grid>
          </GridItem>

          <GridItem/>
          <GridItem/>
          <GridItem>
            <Grid hasGutter id="search">
              <GridItem lg={10} sm={12}>
                <Card style={{ height: "100%" }}>
                  <TextInput type="text" id="search-value" 
                    placeholder="Search ChRIS" 
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
          </GridItem>
          <GridItem/>

          <GridItem>
            <Grid hasGutter>
              <GridItem><h2>Feed Files</h2> <hr /></GridItem>
              <FeedFiles/>
            </Grid>
          </GridItem>

          <GridItem>
            <Grid hasGutter>  
              <GridItem><h2>PACS</h2> <hr /></GridItem>
              <PACSFiles/>
            </Grid>
          </GridItem>

          <GridItem>
            <Grid hasGutter>
              <GridItem><h2>Services</h2> <hr /></GridItem>
              <ServiceFiles/>
            </Grid>
          </GridItem>
        </Grid>
      </article>
    </Wrapper>
  )
}

export default Swift;
