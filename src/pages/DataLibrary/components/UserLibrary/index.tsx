import React, { useEffect, useCallback, useState } from "react";
import { CubesIcon, UploadIcon } from "@patternfly/react-icons";
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
  Spinner,
  Split,
  SplitItem,
  Text,
  TextVariants,
  Title,
} from "@patternfly/react-core";

import { UploadedFileList } from "@fnndsc/chrisapi";
import Wrapper from "../../../../containers/Layout/PageWrapper";
import ChrisAPIClient from "../../../../api/chrisapiclient";

export const UserLibrary = () => {
	document.title = 'My Library';

  const client = ChrisAPIClient.getClient();

  const [uploaded, setUploaded] = useState<UploadedFileList>();
  const [collections, setCollections] = useState<UploadedFileList>();

  const getUploadedFiles = useCallback(async () => {
    const params = { limit: 1 };
    if (uploaded && uploaded.hasNextPage)
      params.limit += params.limit;

    try {
      const uploads = await client.getUploadedFiles(params);
      setUploaded(uploads);
    } catch (error) {
      console.error(error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client])

  // const getCollections = useCallback(async () => {
  //   if (collections && collections.hasNextPage)
  //     params.limit += params.limit;

  //   try {
  //     const collect = await client.getCollections(params);
  //     setCollections(collect);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [client])

  useEffect(() => {
    getUploadedFiles();
    // getCollections();
  }, [getUploadedFiles])


  const UploadedFiles = () => {
    if (uploaded) {
      const files = <>
        { uploaded.getItems().map(({ data: file, url }) => (
          <GridItem key={file.fname} sm={12} lg={3}>
            <Card>
              <CardHeader>
                <a href={url}><b>{file.fname.replace(/chris\/uploads\//g, "")}</b></a>
                
              </CardHeader>
              <CardBody>
                {(new Date(file.creation_date)).toDateString()}
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </>

      if (uploaded.getItems().length)
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

  const Collections = () => {
    // if (collections) {
    //   const items = <>
    //     { collections.getItems().map((file) => (
    //       <GridItem key="" sm={12} lg={6}>
    //         <Card>
    //           <CardHeader>
    //             {`${file}`}
    //           </CardHeader>
    //         </Card>
    //       </GridItem>
    //     ))}
    //   </>

    //   if (collections.getItems().length)
    //     return items
    //   else 
        return (
          <EmptyState>
            <EmptyStateIcon variant="container" component={CubesIcon} />
            <Title size="lg" headingLevel="h4">
              No Collections
            </Title>
            <EmptyStateBody>
              You haven&apos;t created any collections yet. <br />
              Select data from various sources and save your dataset as a collection.
            </EmptyStateBody>
          </EmptyState>
        )
    // }
    // else {
    //   return (
    //     <EmptyState>
    //       <EmptyStateIcon variant="container" component={Spinner} />
    //       <Title size="lg" headingLevel="h4">
    //         Loading
    //       </Title>
    //     </EmptyState>
    //   )
    // }
  }

  return (
    <Wrapper>
      <article>
        <h1>My Library</h1>

        {/* <section>
          <Text component={TextVariants.h2}>Recent</Text>
          <Grid hasGutter>
            <GridItem></GridItem>
          </Grid>
        </section> */}

        <section>
          <Split>
            <SplitItem><h3>Uploaded</h3></SplitItem>
            <SplitItem style={{ margin: 'auto 1em' }} isFilled><hr /></SplitItem>
            <SplitItem>
              <Button><UploadIcon/> Upload</Button>
            </SplitItem>
          </Split>

          <Grid hasGutter>
            <UploadedFiles/>

            { uploaded?.hasNextPage &&
              <GridItem>
                <Button style={{ padding: 0 }} variant="link" onClick={getUploadedFiles}>Load Older</Button>
              </GridItem>
            }
          </Grid>
        </section>

        <section>
          <Split>
            <SplitItem><h3>Collections</h3></SplitItem>
            <SplitItem style={{ margin: 'auto 1em' }} isFilled><hr /></SplitItem>
          </Split>
          
          <Grid hasGutter>
            <Collections/>

            {/* { collections?.hasNextPage &&
              <GridItem>
                <Split>
                  <SplitItem isFilled/>
                  <SplitItem>
                    <Button variant="link" onClick={getUploadedFiles}>Older</Button>
                  </SplitItem>
                </Split>
              </GridItem>
            } */}
          </Grid>
        </section>
      </article>
    </Wrapper>
  )
}

export default UserLibrary
