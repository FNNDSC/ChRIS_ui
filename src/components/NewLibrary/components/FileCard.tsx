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
  Tooltip,
} from "@patternfly/react-core";
import { notification } from "antd";
import { isEmpty } from "lodash";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Fragment } from "react/jsx-runtime";
import { getFileExtension } from "../../../api/model";
import useDownload, { useTypedSelector } from "../../../store/hooks";
import { getIcon } from "../../Common";
import { ThemeContext } from "../../DarkTheme/useTheme";
import { ExternalLinkSquareAltIcon } from "../../Icons";
import FileDetailView from "../../Preview/FileDetailView";
import useLongPress, {
  elipses,
  getBackgroundRowColor,
} from "../utils/longpress";

type Pagination = {
  totalCount: number;
  hasNextPage: boolean;
};

type ComponentProps = {
  name: string;
  date: string;
  onClick: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onMouseDown?: () => void;
  icon: React.ReactElement;
  bgRow?: string;
};

const PresentationComponent = ({
  name,
  date,
  onClick,
  onMouseDown,
  icon,
  bgRow,
}: ComponentProps) => {
  return (
    <GridItem xl={4} lg={5} xl2={3} md={6} sm={12}>
      <Card
        style={{
          cursor: "pointer",
          background: bgRow ? bgRow : "inherit",
        }}
        isCompact
        isSelectable
        isClickable
        isFlat
        onClick={(e) => onClick(e)}
        onMouseDown={onMouseDown}
        isRounded
      >
        <CardHeader>
          <Split>
            <SplitItem style={{ marginRight: "1em" }}>{icon}</SplitItem>
            <SplitItem>
              <Tooltip content={name}>
                <Button variant="link" style={{ padding: 0 }}>
                  {elipses(name, 40)}
                </Button>
              </Tooltip>
              <div>{!isEmpty(date) ? new Date(date).toDateString() : ""}</div>
            </SplitItem>
          </Split>
        </CardHeader>
      </Card>
    </GridItem>
  );
};

export const LinkCard = ({
  linkFiles,
  showServicesFolder,
}: {
  linkFiles: FileBrowserFolderLinkFile[];
  showServicesFolder: boolean;
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
          <PresentationComponent
            icon={<ExternalLinkSquareAltIcon />}
            name={linkName}
            date={creation_date}
            key={val.data.fname}
            onClick={() => {
              navigate(val.data.path);
            }}
          />
        );
      })}
      {showServicesFolder && (
        <PresentationComponent
          icon={<ExternalLinkSquareAltIcon />}
          name="SERVICES"
          date=""
          key={"SERVICES"}
          onClick={() => {
            navigate("SERVICES");
          }}
        />
      )}
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
    return payload.path === file.data.fname;
  });

  const selectedBgRow = getBackgroundRowColor(isSelected, isDarkTheme);
  const ext = getFileExtension(file.data.fname);
  const icon = getIcon(ext);

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
    <>
      {contextHolder}
      <PresentationComponent
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
        name={fileName}
        date={creation_date}
        icon={icon}
        bgRow={selectedBgRow}
      />

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
    </>
  );
};
