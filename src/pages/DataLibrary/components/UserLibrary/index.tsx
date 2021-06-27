import React from "react";
import Wrapper from "../../../../containers/Layout/PageWrapper";

import { Text, TextVariants } from "@patternfly/react-core";

export const UserLibrary = () => {
	document.title = 'My Library';

  return (
    <Wrapper>
      <article>
        <Text component={TextVariants.h1}>My Library</Text>
      </article>
    </Wrapper>
  )
}

export default UserLibrary
