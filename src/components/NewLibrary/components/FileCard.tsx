import type {
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "@fnndsc/chrisapi";
import {
  Button,
  Card,
  CardHeader,
  Checkbox,
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
import { FolderContextMenu } from "./ContextMenu";

type Pagination = {
  totalCount: number;
  hasNextPage: boolean;
};

type ComponentProps = {
  name: string;
  computedPath: string;
  date: string;
  onClick: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onMouseDown?: () => void;
  onCheckboxChange?: (e: React.FormEvent<HTMLInputElement>) => void;
  isChecked?: boolean;
  icon: React.ReactElement;
  bgRow?: string;
};

const PresentationComponent = ({
  name,
  computedPath,
  date,
  onClick,
  onMouseDown,
  onCheckboxChange,
  isChecked,
  icon,
  bgRow,
}: ComponentProps) => {
  return (
    <GridItem xl={4} lg={5} xl2={3} md={6} sm={12}>
      <FolderContextMenu folderPath={computedPath}>
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
          <CardHeader
            actions={{
              actions: (
                <Checkbox
                  className="large-checkbox"
                  isChecked={isChecked}
                  id={name}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onCheckboxChange?.(e)}
                />
              ),
            }}
          >
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
      </FolderContextMenu>
    </GridItem>
  );
};

export const LinkCard = ({
  linkFiles,
  computedPath,
}: {
  linkFiles: FileBrowserFolderLinkFile[];
  computedPath: string;
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
            key={val.data.fname}
            icon={<ExternalLinkSquareAltIcon />}
            name={linkName}
            date={creation_date}
            computedPath={computedPath}
            onClick={() => {
              navigate(val.data.path);
            }}
          />
        );
      })}
    </Fragment>
  );
};

export const FilesCard = ({
  files,
  computedPath,
}: {
  files: FileBrowserFolderFile[];
  computedPath: string;
  pagination?: Pagination;
}) => {
  return (
    <Fragment>
      {files.map((file) => {
        return (
          <SubFileCard
            key={file.data.fname}
            file={file}
            computedPath={computedPath}
          />
        );
      })}
    </Fragment>
  );
};

export const SubFileCard = ({
  file,
  computedPath,
}: { file: FileBrowserFolderFile; computedPath: string }) => {
  const isDarkTheme = useContext(ThemeContext).isDarkTheme;
  const selectedPaths = useTypedSelector((state) => state.cart.selectedPaths);
  const handleDownloadMutation = useDownload();
  const { handlers } = useLongPress();
  const { handleOnClick, handleOnMouseDown, handleCheckboxChange } = handlers;
  const [api, contextHolder] = notification.useNotification();
  const [preview, setIsPreview] = useState(false);
  const listOfPaths = file.data.fname.split("/");
  const fileName = listOfPaths[listOfPaths.length - 1];
  const creation_date = file.data.creation_date;
  const { isSuccess, isError, error: downloadError } = handleDownloadMutation;

  const isSelected =
    selectedPaths.length > 0 &&
    selectedPaths.some((payload) => {
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
        onCheckboxChange={(e) => {
          e.stopPropagation();
          handleCheckboxChange(e, file.data.fname, file, "file");
        }}
        computedPath={computedPath}
        isChecked={isSelected}
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
