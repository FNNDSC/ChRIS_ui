import React from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import { Grid, GridItem, Card, CardBody, Split, SplitItem } from '@patternfly/react-core';
import { FolderIcon, FileIcon } from '@patternfly/react-icons';
import { Directory, Tree } from "../../../../utils/browser";

interface BrowserProps {
  tree: Tree
  path: string
}

export const Browser: React.FC<BrowserProps> = ({ tree, path }: BrowserProps) => {
  return (
    <Switch>
      <Route exact path={path}>
        <article>
          <h2>Browser</h2>
          <section>
            <Grid hasGutter>
              { tree.filter(({ hasChildren }) => hasChildren).map(({ name, children }) => (
                <GridItem key={name} sm={12} lg={4}>
                  <Card isSelectable>
                    <CardBody>
                      <Split>
                        <SplitItem style={{ marginRight: "1em" }}><FolderIcon/></SplitItem>
                        <SplitItem isFilled><Link to={`${path}/${name}`}>{name}</Link></SplitItem>
                        <SplitItem>
                          <div>{children.length} items</div>
                        </SplitItem>                          
                      </Split>
                    </CardBody>
                  </Card>
                </GridItem>
              ))}

              <GridItem/>

              { tree.filter(({ hasChildren }) => !hasChildren).map(({ name, item }) => (
                <GridItem key={name} sm={12} lg={2}>
                  <Card isSelectable>
                    <CardBody>
                      <div><FileIcon/></div>
                      <div><Link to={item}>{name}</Link></div>
                      <div>{ (item.fsize/(1024*1024)).toFixed(3) } MB</div>
                    </CardBody>
                  </Card>
                </GridItem>
              ))}
            </Grid>
          </section>
        </article>
      </Route>

      <Route path={`${path}/:subfolder`} render={({ match }) => {
        return <Browser 
          path={`${path}/${match.params.subfolder}`} 
          tree={Directory.findChildDirectory(tree, match.params.subfolder)}
        />
      }} />
    </Switch>
  )
}
