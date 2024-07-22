import type {
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "@fnndsc/chrisapi";
import {
  Button,
  Card,
  CardHeader,
  GridItem,
  Modal,
  ModalVariant,
  Split,
  SplitItem,
} from "@patternfly/react-core";
import { notification } from "antd";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Fragment } from "react/jsx-runtime";
import useDownload, { useTypedSelector } from "../../../store/hooks";
import { ThemeContext } from "../../DarkTheme/useTheme";
import { ExternalLinkSquareAltIcon, FileIcon } from "../../Icons";
import FileDetailView from "../../Preview/FileDetailView";
import useLongPress, {
  elipses,
  getBackgroundRowColor,
} from "../utils/longpress";

type Pagination = {
  totalCount: number;
  hasNextPage: boolean;
};
export const LinkCard = ({
  linkFiles,
}: {
  linkFiles: FileBrowserFolderLinkFile[];
  pagination?: Pagination;
}) => {
  const navigate = useNavigate();
  return (
    <Fragment>
      {linkFiles.map((val) => {
        const pathList = val.data.path.split("/");
        const linkName = pathList[pathList.length - 1];
        const creation_date = val.data.creation_date;
        return (
          <GridItem xl={5} lg={4} xl2={5} md={3} sm={1} key={val.data.fname}>
            <Card
              isCompact
              isSelectable
              isClickable
              isFlat
              onClick={() => {
                navigate(val.data.path);
              }}
              isRounded
            >
              <CardHeader>
                <Split>
                  <SplitItem style={{ marginRight: "1em" }}>
                    <ExternalLinkSquareAltIcon />
                  </SplitItem>
                  <SplitItem>
                    <Button variant="link" style={{ padding: 0 }}>
                      {elipses(linkName, 40)}
                    </Button>
                    <div>{new Date(creation_date).toDateString()}</div>
                  </SplitItem>
                </Split>
              </CardHeader>
            </Card>
          </GridItem>
        );
      })}
    </Fragment>
  );
};

export const FilesCard = ({
  files,
}: {
  files: FileBrowserFolderFile[];
  pagination?: Pagination;
}) => {
  return (
    <Fragment>
      {files.map((file) => {
        return <SubFileCard key={file.data.fname} file={file} />;
      })}
    </Fragment>
  );
};

export const SubFileCard = ({ file }: { file: FileBrowserFolderFile }) => {
  const isDarkTheme = useContext(ThemeContext).isDarkTheme;
  const selectedPaths = useTypedSelector((state) => state.cart.selectedPaths);
  const handleDownloadMutation = useDownload();

  const { handlers } = useLongPress();
  const { handleOnClick, handleOnMouseDown } = handlers;
  const [api, contextHolder] = notification.useNotification();
  const [preview, setIsPreview] = useState(false);
  const listOfPaths = file.data.fname.split("/");
  const fileName = listOfPaths[listOfPaths.length - 1];
  const creation_date = file.data.creation_date;
  const { isSuccess, isError, error: downloadError } = handleDownloadMutation;

  const isSelected = selectedPaths.some((payload) => {
    payload.path === file.data.fname;
  });
  const selectedBgRow = getBackgroundRowColor(isSelected, isDarkTheme);

  useEffect(() => {
    if (isSuccess) {
      api.success({
        message: "Successfully Triggered the Download",
        duration: 1,
      });

      setTimeout(() => {
        handleDownloadMutation.reset();
      }, 1000);
    }

    if (isError) {
      api.error({
        message: "Download Error",
        //@ts-ignore
        description: downloadError.message,
      });
    }
  }, [isSuccess, isError, downloadError]);

  return (
    <GridItem xl={4} lg={5} xl2={3} md={6} sm={12} key={file.data.fname}>
      <Card
        style={{
          background: selectedBgRow,
        }}
        isCompact
        isSelectable
        isClickable
        isFlat
        onClick={(e) => {
          if (!preview) {
            handleOnClick(
              e,
              file,
              file.data.fname,
              file.data.fname,
              "file",
              () => {
                setIsPreview(!preview);
              },
            );
          }
        }}
        onMouseDown={() => {
          if (!preview) {
            handleOnMouseDown();
          }
        }}
        isRounded
      >
        {contextHolder}
        <CardHeader>
          <Split>
            <SplitItem style={{ marginRight: "1em" }}>
              <FileIcon />
            </SplitItem>

            <SplitItem>
              <Button
                variant="link"
                style={{
                  padding: 0,
                }}
              >
                {elipses(fileName, 40)}
              </Button>
              <div>{new Date(creation_date).toDateString()}</div>
            </SplitItem>
          </Split>
        </CardHeader>
      </Card>
      {
        <Modal
          className="library-preview"
          variant={ModalVariant.large}
          title="Preview"
          aria-label="viewer"
          isOpen={preview}
          onClose={() => setIsPreview(false)}
        >
          <FileDetailView selectedFile={file} preview="large" />
        </Modal>
      }
    </GridItem>
  );
};
