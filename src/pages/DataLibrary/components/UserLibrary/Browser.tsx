import React, { useState } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import {
  Grid,
  GridItem,
  Card,
  CardBody,
  Split,
  SplitItem,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  TextInput,
  Modal,
  Badge,
  KebabToggle,
  CardActions,
  CardHeader,
  Dropdown,
  DropdownItem,
} from "@patternfly/react-core";
import { FolderIcon } from '@patternfly/react-icons';
import pluralize from 'pluralize';

import DirectoryTree, { Branch } from "../../../../utils/browser";
import FileDetailView from '../../../../components/feed/Preview/FileDetailView';

interface BrowserProps {
  tree: DirectoryTree
  path?: string
  name?: string
}

export const BrowserBreadcrumbs = ({ path }: { path: string }) => {
  const pathtokens = path.split('/');
  return (
    <Breadcrumb>
      { pathtokens.map(( token, index ) => {
        if (!token) return null;

        if (index === 1)
          return <BreadcrumbItem key="library" render={() => <Link to="/library">Library</Link>}/>

        if (index === pathtokens.length - 1)
          return <BreadcrumbItem key={token} to="#" isActive><b>{token}</b></BreadcrumbItem>

        const tokenpath = pathtokens.slice(0, index + 1).join('/')
        return (
          <BreadcrumbItem key={token} render={() => <Link to={tokenpath}>{ token }</Link>}/>
        )
      })}
    </Breadcrumb>
  )
}

function elipses(str:string, len: number) {
  if (str.length <= len) return str
  return str.slice(0, len - 3) + "...";
}

export const Browser: React.FC<BrowserProps> = ({ name, tree, path }: BrowserProps) => {
  const [filter, setFilter] = useState<string>();
  const [viewfile, setViewFile] = useState<any>();

  const folders = tree.dir
    .filter(({ hasChildren }) => hasChildren)
    .filter(({ name }) => {
      if (filter)
        return name.includes(filter)
      return true;
    });
  
  const files = tree.dir
    .filter(({ hasChildren }) => !hasChildren)
    .filter(({ name }) => {
      if (filter)
        return name.includes(filter)
      return true;
    });

  path = path || '/library'

  return (
    <Switch>
      <Route path={`${path}/:subfolder`} render={({ match }) => {
        return <Browser 
          name={match.params.subfolder}
          path={`${path}/${match.params.subfolder}`} 
          tree={tree.child(match.params.subfolder)}
        />
      }} />

      <Route>
        <article>
          <section>
            {
              path &&
              <div style={{ margin: "0 0 1em 0" }}>
                <BrowserBreadcrumbs path={path} />
              </div>
            }

            <Split>
              <SplitItem isFilled>
                <h2><FolderIcon/> { name }</h2> 
                <Switch>
                  <Route exact path="/library/search">
                    <h3>{ tree.dir.length } {pluralize('match', tree.dir.length)}</h3>
                  </Route>
                  <Route>
                    <h3>{ tree.dir.length } {pluralize('item', tree.dir.length)}</h3>
                  </Route>
                </Switch>
              </SplitItem>

              <SplitItem>
                <Card>
                  <TextInput id={`${path}-filter`}
                    placeholder="Filter by Name"
                    onChange={(value) => setFilter(value || undefined)} 
                  />
                </Card>
              </SplitItem>
            </Split>
          </section>

          <Grid hasGutter>
            { folders.map((folder) => (
              <GridItem key={folder.name} sm={12} lg={4}>
                <FolderCard item={folder} onSelect={() => {
                  console.log()
                }}/>
              </GridItem>
            ))}

            { files && <GridItem/> }

            { files.map(({ name: fname, item }) => (
              <GridItem key={fname} sm={12} lg={2}>
                <Card isSelectable onClick={() => setViewFile(item)}>
                  <CardBody>
                    <div style={{ margin: "-1.5em -1.5em 1em -1.5em", maxHeight: "10em", overflow: "hidden" }}>
                      <FileDetailView selectedFile={item} preview="small" />
                    </div>
                    <div style={{ overflow: "hidden" }}>
                      <Button variant="link" style={{ padding: "0" }}>
                        {elipses(fname,20)}
                      </Button>
                    </div>
                    <div>{ (item.data.fsize/(1024*1024)).toFixed(3) } MB</div>
                  </CardBody>
                </Card>
              </GridItem>
            ))}
          </Grid>

          <Modal 
            title="Preview"
            aria-label="viewer" 
            width={'50%'}
            isOpen={!!viewfile} 
            onClose={() => setViewFile(undefined)}
          >
            <FileDetailView selectedFile={viewfile} preview="large" />
          </Modal>
        </article>
      </Route>
    </Switch>
  )
}

interface FolderCardProps {
  item: Branch;
  onSelect?: () => void;
}

export const FolderCard = ({ item, onSelect }: FolderCardProps) => {
  const [dropdown, setDropdown] = useState(false);
  
  const toggle = (
    <KebabToggle 
      style={{ padding: "0" }} onToggle={setDropdown.bind(FolderCard, !dropdown)} 
    />
  )

  const { name, children, prefix, creation_date } = item;
  return (
    <Card isSelectable onSelect={onSelect}>
      <CardHeader>
        <CardActions>
          <Dropdown
            onSelect={() => { /** */ }}
            toggle={toggle}
            isOpen={dropdown}
            isPlain
            position="right"
            dropdownItems={[
              <DropdownItem key="link">
                <Link to={`/library/${prefix}/${name}`}>View</Link>
              </DropdownItem>,
              <DropdownItem key="action" component="button">
                Create Feed
              </DropdownItem>,
              <DropdownItem key="action" component="button">
                Delete
              </DropdownItem>
            ]}
          />
        </CardActions>

        <Split style={{ overflow: "hidden" }}>
          <SplitItem style={{ marginRight: "1em" }}><FolderIcon/></SplitItem>
          
          <SplitItem isFilled>
            <div>
              <Link to={`/library/${prefix}/${name}`}>{elipses(name,25)}</Link>
              <Route exact path="/library/search">
                <Badge style={{ margin: "0 0.5em" }}>
                  { children.length } {pluralize('match', children.length)}
                </Badge>
              </Route>
            </div>

            <div style={{ fontSize: "0.85em" }}>
              {children.length} {pluralize('item', children.length)}, {(new Date(creation_date)).toDateString()}
            </div>
          </SplitItem>
        </Split>
      </CardHeader>
    </Card>
  )
}


export default Browser
