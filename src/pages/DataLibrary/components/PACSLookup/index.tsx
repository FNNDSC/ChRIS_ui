import React, { useCallback, useContext, useState } from "react";
import Wrapper from "../../../../containers/Layout/PageWrapper";
import { SearchIcon } from "@patternfly/react-icons";
import { Button, Text, TextVariants, Split, SplitItem } from "@patternfly/react-core";

import { LibraryContext } from "../../Library";
import QueryBuilder from "./QueryBuilder";

export const PACS = () => {
  const library = useContext(LibraryContext);
  
  const [query, setQuery] = useState()

  return (
    <Wrapper>
      <article>
        <Text component={TextVariants.h1}>PACS Lookup System</Text>

        <QueryBuilder onChange={setQuery} />

        <Split>
          <SplitItem isFilled />
          <SplitItem>
            <Button isLarge variant="primary">
              <SearchIcon/> Search
            </Button>
          </SplitItem>
        </Split>

        <a href="/library/pacsdemo">Demo</a>
      </article>
    </Wrapper>
  )
}

export default PACS
