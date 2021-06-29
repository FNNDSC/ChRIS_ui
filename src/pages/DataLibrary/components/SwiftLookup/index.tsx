import React from 'react';
import { Grid, GridItem, TextVariants, Text } from '@patternfly/react-core';

import Wrapper from "../../../../containers/Layout/PageWrapper";

export const Swift = () => {
  return (
    <Wrapper>
      <article>
        <Grid hasGutter>
          <GridItem><Text component={TextVariants.h1}>Search ChRIS</Text></GridItem>
        </Grid>
      </article>
    </Wrapper>
  )
}

export default Swift;
