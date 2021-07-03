import React, { useEffect, useCallback, useState } from "react";
import { CubesIcon } from "@patternfly/react-icons";
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
  Text,
  TextVariants,
  Title,
} from "@patternfly/react-core";

import Wrapper from "../../../../containers/Layout/PageWrapper";
import ChrisAPIClient from "../../../../api/chrisapiclient";

export const UserLibrary = () => {
	document.title = 'My Library';

  const client = ChrisAPIClient.getClient();

  const [uploaded, setUploaded] = useState<any[]>();
  const [services, setServices] = useState<any[]>();

  const getUploadedFiles = useCallback(async () => {
    return [];
    const params = {
      limit: 100,
      offset: 0,
    };
  
    try {
      let fileList = await client.getUploadedFiles(params);
      const files = fileList.getItems();
  
      while (fileList.hasNextPage) {
        try {
          params.offset += params.limit;
          fileList = await client.getUploadedFiles(params);
          files.push(...fileList.getItems());
        } catch (error) {
          // break;
          return files;
        }
      }
    
      return files;
    } catch (error) {
      
    }
  }, [client])

  const getPACSFiles = useCallback(async () => {
    const params = {
      limit: 100,
      offset: 0,
    };
  
    try {
      //@ts-ignore
      let fileList = await client.getPACSFiles(params);
      const files = fileList.getItems();
  
      while (fileList.hasNextPage) {
        try {
          params.offset += params.limit;
          //@ts-ignore
          fileList = await client.getPACSFiles(params);
          files.push(...fileList.getItems());
        } catch (error) {
          // break;
          return files;
        }
      }
    
      return files;
    } catch (error) {
      
    }
  }, [client])

  useEffect(() => {
    getUploadedFiles().then(files => setUploaded(files));
    getPACSFiles().then(files => setServices(files));
  }, [getPACSFiles, getUploadedFiles])

  return (
    <Wrapper>
      <article>
        <Text component={TextVariants.h1}>My Library</Text>

        <Text component={TextVariants.h2}>Uploaded</Text>
        <Grid>
          {
            uploaded ? (
              !uploaded.length ? (
                <EmptyState>
                  <EmptyStateIcon variant="container" component={CubesIcon} />
                  <Title size="lg" headingLevel="h4">
                    No Uploaded Files
                  </Title>
                  <EmptyStateBody>
                    You haven&apos;t uploaded any files yet.
                  </EmptyStateBody>
                </EmptyState>
              ) :
              uploaded.map((file) => (
                <GridItem key="">
                  <Card>
                    <CardHeader>
                      {`${file}`}
                    </CardHeader>
                  </Card>
                </GridItem>
              ))
            ) : (
              <EmptyState>
                <EmptyStateIcon variant="container" component={Spinner} />
                <Title size="lg" headingLevel="h4">
                  Loading
                </Title>
              </EmptyState>
            )
          }
        </Grid>

        <Text component={TextVariants.h2}>PACS Files</Text>
        <Grid>
          {
            services ? (
              !services.length ? (
                <EmptyState>
                  <EmptyStateIcon variant="container" component={CubesIcon} />
                  <Title size="lg" headingLevel="h4">
                    No PACS Files
                  </Title>
                  <EmptyStateBody>
                    You haven&apos;t downloaded any PACS files yet.
                  </EmptyStateBody>
                </EmptyState>
              ) :
              services.map((file) => (
                <GridItem key="">
                  <Card>
                    <CardHeader>
                      {`${file}`}
                    </CardHeader>
                  </Card>
                </GridItem>
              ))
            ) : (
              <EmptyState>
                <EmptyStateIcon variant="container" component={Spinner} />
                <Title size="lg" headingLevel="h4">
                  Loading
                </Title>
              </EmptyState>
            )
          }
        </Grid>
      </article>
    </Wrapper>
  )
}

export default UserLibrary
