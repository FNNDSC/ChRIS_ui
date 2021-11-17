import React, { useContext, useState } from "react";
import { Switch, Route, Link, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
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
  EmptyStatePrimary,
  Title,
  HelperText,
  HelperTextItem,
} from "@patternfly/react-core";
import {
  FolderIcon,
  CubesIcon,
  FolderOpenIcon,
  CodeBranchIcon,
  CubeIcon,
} from "@patternfly/react-icons";
import pluralize from "pluralize";
import JSZip from "jszip";
import DirectoryTree, { Branch, Tree } from "../../../../utils/browser";
import FileDetailView from "../../../../components/feed/Preview/FileDetailView";
import { LibraryContext, Series, File } from "../../Library";
import { MainRouterContext } from "../../../../routes";
import { CheckIcon } from "@patternfly/react-icons";
import GalleryDicomView from "../../../../components/dicomViewer/GalleryDicomView";
import { DownloadIcon } from "@patternfly/react-icons";
import FileViewerModel from "../../../../api/models/file-viewer.model";

import {
  isNifti,
  isDicom,
  getDicomPatientName,
  getDicomStudyDate,
  getDicomStudyTime,
  getDicomStudyDescription,
  getDicomSeriesDate,
  getDicomSeriesTime,
  getDicomSeriesDescription,
  getDicomSeriesNumber,
  getDicomInstanceNumber,
  getDicomSliceDistance,
  getDicomEchoNumber,
  getDicomSliceLocation,
  getDicomColumns,
  getDicomRows,
  dicomDateTimeToLocale,
} from "../../../../components/dicomViewer/utils";
import { setFilesForGallery } from "../../../../store/explorer/actions";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import * as cornerstoneNIFTIImageLoader from "cornerstone-nifti-image-loader";
import * as cornerstoneFileImageLoader from "cornerstone-file-image-loader";
const ImageId = cornerstoneNIFTIImageLoader.nifti.ImageId;

interface BrowserProps {
  tree: DirectoryTree;
  name: string;
  path?: string;
  withHeader?: boolean;
  fetchFiles?: (prefix: string) => Promise<DirectoryTree>;
  onFolderSelect?: (then: FolderActions, folder: Branch) => any;
  handleDelete?: () => void;
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
  onFolderSelect,
  handleDelete,
}: BrowserProps) => {
  const dispatch = useDispatch();
  const [filter, setFilter] = useState<string>();
  const [viewfile, setViewFile] = useState<any>();
  const [viewfolder, setViewFolder] = useState(false);
  const [showDownloadText, setDownloadText] = useState(false);

  const [files, setFiles] = useState<Tree>();
  const [fpath, setFilesPath] = useState<string>();

  const { push, location } = useHistory();

  const route = (path: string) => {
    if (location.pathname !== path) push(path);
  };

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
        library.actions.select(items);
      else library.actions.clear(items);
    } else {
      if (!library.actions.isSelected(items)) library.actions.select(items);
      else library.actions.clear(items);
    }
  };

  const onFolderSelectAction = async (
    then: FolderActions,
    folder: Branch
  ): Promise<void> => {
    if (onFolderSelect) return onFolderSelect(then, folder);
    setFilesPath(folder.path);
    setFiles(undefined);
    if (then === "feed")
      return router.actions.createFeedWithData([folder.path]);
    if (then === "browse") return route(`/library/${folder.path}`);

    if (!fetchFiles) return;
    const _files = (await fetchFiles(folder.path)).dir;
    const items = _files?.filter(({ item }) => !!item) || [];
    setFiles(_files);

    switch (then) {
      case "view":
        const imageIds: string[] = [];
        let niftiSlices = 0;
        let step = 0;
        step = items.length / 50;
        const nextProgress = step;
        let count = 0;
        let nifti = false;
        for (let i = 0; i < items.length; i++) {
          const item = items[i].item;
          if (isNifti(item.data.fname)) {
            nifti = true;
            const fileArray = item.data.fname.split("/");
            const fileName = fileArray[fileArray.length - 1];
            const imageIdObject = ImageId.fromURL(
              `nifti:${item.url}${fileName}`
            );

            niftiSlices = cornerstone.metaData.get(
              "multiFrameModule",
              imageIdObject.url
            ).numberOfFrames;

            imageIds.push(
              ...Array.from(
                Array(niftiSlices),
                (_, i) =>
                  `nifti:${imageIdObject.filePath}#${imageIdObject.slice.dimension}-${i},t-0`
              )
            );
          } else if (isDicom(item.data.fname)) {
            const file = await item.getFileBlob();
            imageIds.push(
              cornerstoneWADOImageLoader.wadouri.fileManager.add(file)
            );
          } else {
            const file = await item.getFileBlob();
            imageIds.push(cornerstoneFileImageLoader.fileManager.add(file));
          }
        }
        const dispatchFiles: any[] = [];

        let item = {};

        if (nifti) {
          for (let i = 0; i < imageIds.length; i++) {
            cornerstone.loadImage(imageIds[i]).then(
              (image: any) => {
                item = {
                  image: image,
                  imageId: imageIds[i],
                  nifti: nifti,
                  sliceMax: niftiSlices,
                };
                dispatchFiles.push(item);
                count++;
                const progress = Math.floor(count * (100 / imageIds.length));
                if (progress > nextProgress) {
                  console.log("Progress");
                }

                if (count === imageIds.length) {
                  dispatch(setFilesForGallery(dispatchFiles));
                  close();
                }
              },
              (e: any) => {
                console.log("Error in reading multiple files", e);
                count++;
                if (count === imageIds.length) {
                  dispatch(setFilesForGallery(dispatchFiles));
                  close();
                }
              }
            );
          }
        } else {
          for (let i = 0; i < items.length; i++) {
            const selectedFile = items[i].item;
            cornerstone.loadImage(imageIds[i]).then(
              (image: any) => {
                if (image.data) {
                  const patientName = getDicomPatientName(image);
                  const studyDate = getDicomStudyDate(image);
                  const studyTime = getDicomStudyTime(image);
                  const studyDescription = getDicomStudyDescription(image);

                  const seriesDate = getDicomSeriesDate(image);
                  const seriesTime = getDicomSeriesTime(image);
                  const seriesDescription = getDicomSeriesDescription(image);
                  const seriesNumber = getDicomSeriesNumber(image);

                  const instanceNumber = getDicomInstanceNumber(image);
                  const sliceDistance = getDicomSliceDistance(image);
                  const echoNumber = getDicomEchoNumber(image);
                  const sliceLocation = getDicomSliceLocation(image);
                  const columns = getDicomColumns(image);
                  const rows = getDicomRows(image);
                  const studyDateTime =
                    studyDate === undefined
                      ? undefined
                      : dicomDateTimeToLocale(`${studyDate}.${studyTime}`);

                  item = {
                    imageId: imageIds[i],
                    instanceNumber: instanceNumber,
                    name: selectedFile?.data.fname,
                    image: image,
                    rows: rows,
                    columns: columns,
                    sliceDistance: sliceDistance,
                    sliceLocation: sliceLocation,
                    patient: {
                      patientName: patientName,
                    },
                    study: {
                      studyDate: studyDate,
                      studyTime: studyTime,
                      studyDateTime: studyDateTime,
                      studyDescription: studyDescription,
                    },
                    series: {
                      seriesDate: seriesDate,
                      seriesTime: seriesTime,
                      seriesDescription: seriesDescription,
                      seriesNumber: seriesNumber,
                      echoNumber: echoNumber,
                    },
                    sliceMax: imageIds.length,
                  };
                }

                dispatchFiles.push(item);
                count++;
                const progress = Math.floor(count * (100 / items.length));
                if (progress > nextProgress) {
                  console.log("Progress");
                }
                if (count === items.length) {
                  dispatch(setFilesForGallery(dispatchFiles));
                  close();
                }
              },
              (e: any) => {
                console.log("Error in reading multiple files", e);
                count++;
              }
            );
          }
        }
        setViewFolder(true);

        break;

      case "select":
        select(items.map(({ item }) => item.data.fname));
        break;

      case "delete": {
        _files?.map(async (file) => {
          await file.item.delete();
        });
        break;
      }

      default:
        break;
    }
  };

  return (
    <Switch>
      <Route
        path={`${path}/:subfolder`}
        render={({ match }) => {
          const child = tree.branch(match.params.subfolder);
          if (!child)
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

          if (child.isLastParent) {
            if (files && fpath === child.path)
              return (
                <Browser
                  withHeader={withHeader}
                  name={match.params.subfolder}
                  path={`${path}/${match.params.subfolder}`}
                  tree={new DirectoryTree(files)}
                  handleDelete={handleDelete}
                />
              );

            if (!fetchFiles) return;

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
              onFolderSelect={onFolderSelect}
              fetchFiles={fetchFiles}
              handleDelete={handleDelete}
            />
          );
        }}
      />

      <Route exact path={path}>
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
                    onChange={(value: any) => setFilter(value || undefined)}
                  />
                </Card>
              </SplitItem>
              <SplitItem
                style={{
                  marginLeft: "1rem",
                }}
              >
                <Button
                  icon={<DownloadIcon />}
                  onClick={async () => {
                    setDownloadText(true);
                    const zip = new JSZip();
                    const files = tree.dir
                      .filter(({ isLeaf }) => isLeaf)
                      .filter(({ name }) => {
                        if (filter) return name.includes(filter);
                        return true;
                      });

                    for (const file of files) {
                      const fileBlob = await file.item.getFileBlob();
                      zip.file(file.name, fileBlob);
                    }
                    const blob = await zip.generateAsync({
                      type: "blob",
                    });

                    FileViewerModel.downloadFile(blob, "Library.zip");
                    setDownloadText(false);
                  }}
                />
              </SplitItem>
            </Split>
            <SplitItem>
              {showDownloadText && (
                <HelperText>
                  <HelperTextItem variant="success" hasIcon>
                    Please wait as the files are being zipped
                  </HelperTextItem>
                </HelperText>
              )}
            </SplitItem>
          </section>
        )}

        <Grid hasGutter>
          {folders
            .sort(
              ({ creation_date: a }, { creation_date: b }) =>
                b.getTime() - a.getTime()
            )
            .map((folder) => (
              <GridItem key={folder.name} sm={12} lg={4}>
                <FolderCard
                  item={folder}
                  onSelect={onFolderSelectAction}
                  isSelected={
                    folder.isLastParent &&
                    library.actions.isSeriesSelected(
                      folder.children.map(({ item }) => item.data.fname)
                    )
                  }
                  isLoading={folder.path === fpath && !files}
                />
              </GridItem>
            ))}

          {tree.dir
            .filter(({ isLeaf }) => isLeaf)
            .filter(({ name }) => {
              if (filter) return name.includes(filter);
              return true;
            })
            .map((file) => (
              <GridItem key={file.name} sm={12} lg={2}>
                <FileCard
                  file={file}
                  isSelected={library.actions.isSelected(file.item.data.fname)}
                  onSelect={select.bind(Browser, file.item.data.fname)}
                  onOpen={({ item }) => setViewFile(item)}
                />
              </GridItem>
            ))}
        </Grid>

        {!!viewfile && (
          <Modal
            title="Preview"
            aria-label="viewer"
            width={"50%"}
            isOpen={!!viewfile}
            onClose={() => setViewFile(undefined)}
          >
            <FileDetailView selectedFile={viewfile} preview="large" />
          </Modal>
        )}

        {viewfolder && (
          <Modal
            title="View"
            aria-label="viewer"
            width={"75%"}
            isOpen={!!viewfolder}
            onClose={() => setViewFolder(false)}
          >
            <GalleryDicomView />
          </Modal>
        )}
      </Route>
    </Switch>
  );
};

type FolderActions =
  | "view"
  | "browse"
  | "feed"
  | "select"
  | "delete"
  | "download";
interface FolderCardProps {
  item: Branch;
  isSelected?: boolean;
  isLoading?: boolean;
  onSelect?: (action: FolderActions, item: Branch) => any;
  subtitle?: string | React.ReactElement;
}

export const FolderCard = ({
  item,
  onSelect,
  isLoading,
  isSelected,
  subtitle,
}: FolderCardProps) => {
  const [dropdown, setDropdown] = useState(false);

  const toggle = (
    <KebabToggle
      style={{ padding: "0" }}
      onToggle={() => setDropdown(!dropdown)}
    />
  );

  const dispatch = (action: FolderActions) => {
    if (onSelect) onSelect(action, item);
  };

  const { name, children, creation_date, isLastParent } = item;
  const pad = <span style={{ padding: "0 0.25em" }} />;
  return (
    <Card isRounded isHoverable isSelectable isSelected={!!isSelected}>
      <CardHeader>
        {isLastParent && !!onSelect && (
          <CardActions>
            <Dropdown
              onSelect={() => setDropdown(false)}
              toggle={toggle}
              isOpen={dropdown}
              isPlain
              position="right"
              dropdownItems={[
                <DropdownItem
                  key="select"
                  onClick={dispatch.bind(FolderCard, "select")}
                >
                  <CheckIcon />
                  {pad} <b>Select</b>
                </DropdownItem>,

                <DropdownItem
                  key="feed"
                  component="button"
                  onClick={dispatch.bind(FolderCard, "feed")}
                >
                  <CodeBranchIcon />
                  {pad} Create Feed
                </DropdownItem>,
              ]}
            />
          </CardActions>
        )}

        <Split style={{ overflow: "hidden" }}>
          <SplitItem style={{ marginRight: "1em" }}>
            {(() => {
              if (isLoading) return <Spinner size="md" />;
              if (isLastParent) return <CubeIcon />;

              return <FolderIcon />;
            })()}
          </SplitItem>

          <SplitItem isFilled>
            <div>
              <Button
                variant="link"
                style={{ padding: 0 }}
                onClick={dispatch.bind(FolderCard, "browse")}
              >
                <b>{elipses(name, 36)}</b>
              </Button>
              <Route exact path="/library/search">
                <Badge style={{ margin: "0 0.5em" }}>
                  {children.length} {pluralize("match", children.length)}
                </Badge>
              </Route>
            </div>

            {subtitle && <div>{subtitle}</div>}

            <div style={{ fontSize: "0.85em" }}>
              {new Date(creation_date).toDateString()}
            </div>
          </SplitItem>
        </Split>
      </CardHeader>
    </Card>
  );
};

interface FileCardProps {
  file: Branch;
  isSelected?: boolean;
  onSelect?: (fname: string) => void;
  onOpen?: (file: Branch) => void;
}

export const FileCard = ({
  file,
  isSelected,
  onSelect,
  onOpen,
}: FileCardProps) => {
  return (
    <Card
      isRounded
      isCompact
      isSelectable
      isSelected={isSelected}
      style={{ overflow: "hidden" }}
    >
      <CardBody>
        <div
          onClick={onOpen?.bind(FileCard, file)}
          style={{
            margin: "-1.15em -1.15em 1em -1.15em",
            maxHeight: "10em",
            overflow: "hidden",
          }}
        >
          <FileDetailView selectedFile={file.item} preview="small" />
        </div>
        <div style={{ overflow: "hidden" }}>
          <Button
            variant="link"
            style={{ padding: "0" }}
            onClick={onSelect?.bind(FileCard, file.item.data.fname)}
          >
            <b>{elipses(file.name, 22)}</b>
          </Button>
        </div>
        <div>{(file.item.data.fsize / (1024 * 1024)).toFixed(3)} MB</div>
      </CardBody>
    </Card>
  );
};

export default Browser;
