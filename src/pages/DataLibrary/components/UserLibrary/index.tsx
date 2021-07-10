import React, { useEffect, useCallback, useState } from "react";
import { CubesIcon, UploadIcon } from "@patternfly/react-icons";
import {
  Button,
  Card,
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

  const [loading, setLoading] = useState(true);

  const [uploaded, setUploaded] = useState<UploadedFileList>();
  const [collections, setCollections] = useState<UploadedFileList>();

  const getUploadedFiles = useCallback(async () => {
    // return [];
    const params = { limit: 8 };
    if (uploaded && uploaded.hasNextPage)
      params.limit += params.limit;

    try {
      const uploads = await client.getUploadedFiles(params);
      setUploaded(uploads);
    } catch (error) {
      console.error(error);
    }
    
    setLoading(false);
  }, [client, uploaded])

  useEffect(() => {
    getUploadedFiles();
  }, [getUploadedFiles])


  const UploadedFiles = () => {
    if (uploaded) {
      const files = <>
        { uploaded.getItems().map((file) => (
          <GridItem key="" sm={12} lg={3}>
            <Card>
              <CardHeader>
                {`${file}`}
              </CardHeader>
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
        <Text component={TextVariants.h1}>My Library</Text>

        <Text component={TextVariants.h2}>Recent</Text>
        <Grid hasGutter>
          <GridItem></GridItem>
        </Grid>

        <Split>
          <SplitItem isFilled>
            <Text component={TextVariants.h2}>Uploaded</Text>
          </SplitItem>
          <SplitItem>
            <Button isLarge><UploadIcon/> Upload</Button>
          </SplitItem>
        </Split>
        <Grid hasGutter>
          {/* { UploadedFiles() } */}
          <UploadedFiles/>

          { uploaded?.hasNextPage &&
            <GridItem>
              <Split>
                <SplitItem isFilled/>
                <SplitItem>
                  <Button variant="link" onClick={getUploadedFiles}>Older</Button>
                </SplitItem>
              </Split>
            </GridItem>
          }
        </Grid>

        <Text component={TextVariants.h2}>Collections</Text>
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
      </article>
    </Wrapper>
  )
}

export default UserLibrary
