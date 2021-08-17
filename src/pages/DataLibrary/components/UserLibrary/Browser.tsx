import React, { useContext, useState } from "react";
import { Switch, Route, Link, useHistory } from "react-router-dom";
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
  EmptyState,
  EmptyStateIcon,
  Spinner,
  EmptyStateBody,
  DropdownSeparator,
  EmptyStatePrimary,
  Title,
} from "@patternfly/react-core";
import {
  FolderIcon,
  CubesIcon,
  EyeIcon,
  FolderOpenIcon,
  CodeBranchIcon,
  CubeIcon,
  TrashIcon
} from "@patternfly/react-icons";
import pluralize from "pluralize";

import DirectoryTree, { Branch, Tree } from "../../../../utils/browser";
import FileDetailView from "../../../../components/feed/Preview/FileDetailView";
import { LibraryContext, Series, File } from "../../Library";
import { MainRouterContext } from "../../../../routes";
import { CheckIcon } from "@patternfly/react-icons";
import GalleryDicomView from "../../../../components/dicomViewer/GalleryDicomView";

interface BrowserProps {
  tree: DirectoryTree;
  name: string;
  path?: string;
  withHeader?: boolean;
  fetchFiles?: (prefix: string) => Promise<DirectoryTree>;
}

export const BrowserBreadcrumbs = ({ path }: { path: string }) => {
  const pathtokens = path.split("/");
  return (
    <Breadcrumb>
      {pathtokens.map((token, index) => {
        if (!token) return null;

        if (index === 1)
          return (
            <BreadcrumbItem
              key="library"
              render={() => <Link to="/library">Library</Link>}
            />
          );

        if (index === pathtokens.length - 1)
          return (
            <BreadcrumbItem key={token} to="#" isActive>
              <b>{token}</b>
            </BreadcrumbItem>
          );

        const tokenpath = pathtokens.slice(0, index + 1).join("/");
        return (
          <BreadcrumbItem
            key={token}
            render={() => <Link to={tokenpath}>{token}</Link>}
          />
        );
      })}
    </Breadcrumb>
  );
};

function elipses(str: string, len: number) {
  if (str.length <= len) return str;
  return str.slice(0, len - 3) + "...";
}

export const Browser: React.FC<BrowserProps> = ({
  name,
  tree,
  path,
  withHeader,
  fetchFiles,
}: BrowserProps) => {
  const [filter, setFilter] = useState<string>();
  const [viewfile, setViewFile] = useState<any>();
  const [viewfolder, setViewFolder] = useState<any[]>();

  const [files, setFiles] = useState<Tree>();
  const [fpath, setFilesPath] = useState<string>();

  const folders = tree.dir
    .filter(({ hasChildren }) => hasChildren)
    .filter(({ name }) => {
      if (filter) return name.includes(filter);
      return true;
    });

  path = path || "/library";

  const library = useContext(LibraryContext);
  const router = useContext(MainRouterContext);

  const select = (items: Series | File) => {
    if (Array.isArray(items)) {
      if (!library.actions.isSeriesSelected(items))
        library.actions.select(items)
      else
        library.actions.clear(items.map(({ data }) => data.fname))
    }
    else {
      if (!library.actions.isSelected(items))
        library.actions.select(items)
      else
        library.actions.clear(items.data.fname)
    }
  }

  const fetchFolderItems = async (action: FolderActions, item: Branch): Promise<void> => {
    if (!fetchFiles) return

    setFilesPath(item.path);
    setFiles(undefined);

    const _files = (await fetchFiles(item.path)).dir
    const items = _files?.filter(({ item }) => !!item) || [];
    setFiles(_files);

    switch (action) {
      case "feed":
        router.actions.createFeedWithData(items.map(({ item }) => item));
        break;
        
      case "view":
        setViewFolder(
          items.map(({ item }) => ({
            file: item
          }))
        );
        break;

      case "select":
        select(items.map(({ item }) => item));
        break;
    
      default: break;
    }
  }

  return (
    <Switch>
      <Route
        path={`${path}/:subfolder`}
        render={({ match }) => {
          for (const child of tree.dir) {
            if (child.name === match.params.subfolder) {
              if (child.isLast) {
                if (files && fpath === child.path)
                  return (
                    <Browser
                      withHeader={withHeader}
                      name={match.params.subfolder}
                      path={`${path}/${match.params.subfolder}`}
                      tree={new DirectoryTree(files)}
                    />
                  );

                if (!fetchFiles) break;

                setFilesPath(child.path);
                fetchFiles(child.path).then((files) => setFiles(files.dir));
                return (
                  <EmptyState>
                    <EmptyStateIcon variant="container" component={Spinner} />
                    <EmptyStateBody>Fetching Files</EmptyStateBody>
                  </EmptyState>
                );
              }

              return (
                <Browser
                  withHeader={withHeader}
                  name={match.params.subfolder}
                  path={`${path}/${match.params.subfolder}`}
                  tree={tree.child(match.params.subfolder)}
                  fetchFiles={fetchFiles}
                />
              );
            }
          }

          return (
            <EmptyState>
              <EmptyStateIcon variant="container" component={CubesIcon} />
              <Title size="lg" headingLevel="h4">
                Not Found
              </Title>
              <EmptyStateBody>Check the URL of this folder.</EmptyStateBody>
              <EmptyStatePrimary>
                <Link to="/library">Back to Library</Link>
              </EmptyStatePrimary>
            </EmptyState>
          );
        }}
      />

      <Route path={path}>
        <article>
          {!!withHeader && (
            <section>
              {path && (
                <div style={{ margin: "0 0 1em 0" }}>
                  <BrowserBreadcrumbs path={path} />
                </div>
              )}

              <Split>
                <SplitItem isFilled>
                  <h2>
                    <FolderOpenIcon /> {name}
                  </h2>
                  <Switch>
                    <Route exact path="/library/search">
                      <h3>
                        {tree.dir.length} {pluralize("match", tree.dir.length)}
                      </h3>
                    </Route>
                    <Route>
                      <h3>
                        {tree.dir.length} {pluralize("item", tree.dir.length)}
                      </h3>
                    </Route>
                  </Switch>
                </SplitItem>

                <SplitItem>
                  <Card>
                    <TextInput
                      id={`${path}-filter`}
                      placeholder="Filter by Name"
                      onChange={(value) => setFilter(value || undefined)}
                    />
                  </Card>
                </SplitItem>
              </Split>
            </section>
          )}

          <Grid hasGutter>
            {folders.map((folder) => (
              <GridItem key={folder.name} sm={12} lg={4}>
                {!folder.isLast ? (
                  <FolderCard item={folder} />
                ) : (
                  <FolderCard
                    item={folder}
                    onSelect={fetchFolderItems}
                    isLoading={folder.path === fpath && !files}
                  />
                )}
              </GridItem>
            ))}

            {tree.dir
              .filter(({ hasChildren }) => !hasChildren)
              .filter(({ name }) => {
                if (filter) return name.includes(filter);
                return true;
              })
              // FileCard
              .map(({ name: fname, item }) => (
                <GridItem key={fname} sm={12} lg={2}>
                  <Card
                    isRounded
                    isCompact
                    isSelectable
                    isSelected={library.actions.isSelected(item)}
                    onClick={select.bind(Browser, item)}
                    style={{ overflow: "hidden" }}
                  >
                    <CardBody>
                      <div
                        style={{
                          margin: "-1.15em -1.15em 1em -1.15em",
                          maxHeight: "10em",
                          overflow: "hidden",
                        }}
                      >
                        <FileDetailView selectedFile={item} preview="small" />
                      </div>
                      <div style={{ overflow: "hidden" }}>
                        <Button
                          variant="link"
                          style={{ padding: "0" }}
                          onClick={() => setViewFile(item)}
                        >
                          <b>{elipses(fname, 20)}</b>
                        </Button>
                      </div>
                      <div>
                        {(item.data.fsize / (1024 * 1024)).toFixed(3)} MB
                      </div>
                    </CardBody>
                  </Card>
                </GridItem>
              ))}
          </Grid>

          { !!viewfile && <Modal
            title="Preview"
            aria-label="viewer"
            width={"50%"}
            isOpen={!!viewfile}
            onClose={() => setViewFile(undefined)}
          >
            <FileDetailView selectedFile={viewfile} preview="large" />
          </Modal>}

          { !!viewfolder && <Modal
            title="View"
            aria-label="viewer"
            width={"50%"}
            isOpen={!!viewfolder}
            onClose={() => setViewFolder(undefined)}
          >
            <GalleryDicomView files={viewfolder} />
          </Modal>}
        </article>
      </Route>
    </Switch>
  );
};

type FolderActions = "view" | "feed" | "select";
interface FolderCardProps {
  item: Branch;
  isSelected?: boolean;
  isLoading?: boolean;
  onSelect?: (action: FolderActions, item: Branch) => any;
}

export const FolderCard = ({ item, onSelect, isLoading, isSelected }: FolderCardProps) => {
  const [dropdown, setDropdown] = useState(false);
  const { push, location } = useHistory();

  const route = (path: string) => {
    if (location.pathname !== path)
      push(path)
  }

  const toggle = (
    <KebabToggle
      style={{ padding: "0" }}
      onToggle={setDropdown.bind(FolderCard, !dropdown)}
    />
  );

  const dispatch = (action: FolderActions) => {
    if (onSelect)
      onSelect(action, item);
  }

  const { name, children, prefix, creation_date, isLast } = item;
  const pad = <span style={{ padding: "0 0.25em" }} />;
  return (
    <Card isRounded isHoverable isSelectable isSelected={!!isSelected}>
      <CardHeader>
        { (isLast && !!onSelect) && (
          <CardActions>
            <Dropdown
              onSelect={() => setDropdown(false)}
              toggle={toggle}
              isOpen={dropdown}
              isPlain 
              position="right"
              dropdownItems={[
                <DropdownItem key="select" onClick={dispatch.bind(FolderCard, "select")}>
                  <CheckIcon />{ pad } <b>Select</b>
                </DropdownItem>,

                <DropdownItem key="browse" style={{ color: "var(--pf-global--link--Color)" }}
                  onClick={() => route(`/library/${prefix}/${name}`)}>
                  <FolderOpenIcon />{ pad } <b>Browse</b>
                </DropdownItem>,

                <DropdownItem key="view" component="button" onClick={dispatch.bind(FolderCard, "view")}>
                  <EyeIcon />{ pad } View
                </DropdownItem>,

                <DropdownItem key="feed" component="button" onClick={dispatch.bind(FolderCard, "feed")}>
                  <CodeBranchIcon />{ pad } Create Feed
                </DropdownItem>,

                <DropdownSeparator key="separator" />,
                <DropdownItem key="delete" component="button">
                  <TrashIcon/>{ pad } Delete
                </DropdownItem>,
              ]}
            />
          </CardActions>
        )}

        <Split style={{ overflow: "hidden" }}>
          <SplitItem style={{ marginRight: "1em" }}>
            {
              (() => {
                if (isLoading) return <Spinner size="md" />
                if (isLast) return <CubeIcon />

                return <FolderIcon />
              })()
            }
          </SplitItem>

          <SplitItem isFilled>
            <div>
              { isLast 
                ? <b style={{ color: "var(--pf-global--link--Color)" }}>{elipses(name, 25)}</b>
                : <Link to={`/library/${prefix}/${name}`}>{elipses(name, 25)}</Link>
              }
              <Route exact path="/library/search">
                <Badge style={{ margin: "0 0.5em" }}>
                  {children.length} {pluralize("match", children.length)}
                </Badge>
              </Route>
            </div>

            <div style={{ fontSize: "0.85em" }}>
              {new Date(creation_date).toDateString()}
            </div>
          </SplitItem>
        </Split>
      </CardHeader>
    </Card>
  );
};

export default Browser;
