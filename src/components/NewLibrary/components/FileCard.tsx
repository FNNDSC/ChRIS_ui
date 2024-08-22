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
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { isEmpty } from "lodash";
import type React from "react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getFileExtension } from "../../../api/model";
import useDownload, { useTypedSelector } from "../../../store/hooks";
import { notification } from "../../Antd";
import { getIcon } from "../../Common";
import { ThemeContext } from "../../DarkTheme/useTheme";
import { ExternalLinkSquareAltIcon } from "../../Icons";
import FileDetailView from "../../Preview/FileDetailView";
import useLongPress, {
  elipses,
  getBackgroundRowColor,
} from "../utils/longpress";
import { FolderContextMenu } from "./ContextMenu";
import { OperationContext, type OriginState } from "../context";

type Pagination = {
  totalCount: number;
  hasNextPage: boolean;
};

type ComponentProps = {
  name: string;
  computedPath: string;
  date: string;
  origin: OriginState;
  onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onMouseDown?: () => void;
  onCheckboxChange?: (e: React.FormEvent<HTMLInputElement>) => void;
  onContextMenuClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onNavigate: () => void;
  isChecked?: boolean;
  icon: React.ReactElement;
  bgRow?: string;
};

const PresentationComponent: React.FC<ComponentProps> = ({
  name,
  origin,
  date,
  onClick,
  onNavigate,
  onMouseDown,
  onCheckboxChange,
  onContextMenuClick,
  isChecked,
  icon,
  bgRow,
}) => (
  <GridItem xl={4} lg={5} xl2={3} md={6} sm={12}>
    <FolderContextMenu origin={origin}>
      <Card
        style={{ cursor: "pointer", background: bgRow || "inherit" }}
        isCompact
        isSelectable
        isClickable
        isFlat
        isRounded
        onClick={onClick}
        onMouseDown={onMouseDown}
        onContextMenu={onContextMenuClick}
      >
        <CardHeader
          actions={{
            actions: (
              <Checkbox
                className="large-checkbox"
                isChecked={isChecked}
                id={name}
                onClick={(e) => e.stopPropagation()}
                onChange={onCheckboxChange}
              />
            ),
          }}
        >
          <Split>
            <SplitItem style={{ marginRight: "1em" }}>{icon}</SplitItem>
            <SplitItem>
              <Tooltip content={name}>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate();
                  }}
                  variant="link"
                  style={{ padding: 0 }}
                >
                  {elipses(name, 40)}
                </Button>
              </Tooltip>

              <div
                style={{
                  fontSize: "0.85rem",
                }}
              >
                <div>
                  {!isEmpty(date)
                    ? format(new Date(date), "dd MMM yyyy, HH:mm")
                    : "N/A"}
                </div>
              </div>
            </SplitItem>
          </Split>
        </CardHeader>
      </Card>
    </FolderContextMenu>
  </GridItem>
);

type LinkCardProps = {
  linkFiles: FileBrowserFolderLinkFile[];
  computedPath: string;
  pagination?: Pagination;
};

export const LinkCard: React.FC<LinkCardProps> = ({
  linkFiles,
  computedPath,
}) => {
  return (
    <>
      {linkFiles.map((val) => (
        <SubLinkCard
          key={val.data.fname}
          linkFile={val}
          computedPath={computedPath}
        />
      ))}
    </>
  );
};

type FilesCardProps = {
  files: FileBrowserFolderFile[];
  computedPath: string;
  pagination?: Pagination;
};

export const FilesCard: React.FC<FilesCardProps> = ({
  files,
  computedPath,
}) => (
  <>
    {files.map((file) => (
      <SubFileCard
        key={file.data.fname}
        file={file}
        computedPath={computedPath}
      />
    ))}
  </>
);

type SubFileCardProps = {
  file: FileBrowserFolderFile;
  computedPath: string;
};

export const getFileName = (
  file: FileBrowserFolderFile | FileBrowserFolderLinkFile,
) => {
  return file.data.fname.split("/").pop() || "";
};

export const SubFileCard: React.FC<SubFileCardProps> = ({
  file,
  computedPath,
}) => {
  const { isDarkTheme } = useContext(ThemeContext);
  const selectedPaths = useTypedSelector((state) => state.cart.selectedPaths);
  const handleDownloadMutation = useDownload();
  const { handlers } = useLongPress();
  const [api, contextHolder] = notification.useNotification();
  const [preview, setIsPreview] = useState(false);
  const fileName = getFileName(file);
  const isSelected = selectedPaths.some(
    (payload) => payload.path === file.data.fname,
  );
  const selectedBgRow = getBackgroundRowColor(isSelected, isDarkTheme);
  const ext = getFileExtension(file.data.fname);
  const icon = getIcon(ext, isDarkTheme);

  useEffect(() => {
    if (handleDownloadMutation.isSuccess) {
      api.success({
        message: "Successfully Triggered the Download",
        duration: 1,
      });
      setTimeout(() => handleDownloadMutation.reset(), 1000);
    }

    if (handleDownloadMutation.isError) {
      api.error({
        message: "Download Error",
        description: handleDownloadMutation.error?.message,
      });
    }
  }, [
    handleDownloadMutation.isSuccess,
    handleDownloadMutation.isError,
    api,
    handleDownloadMutation,
  ]);

  const handleClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) =>
    handlers.handleOnClick(e, file, file.data.fname, "file");

  const handleCheckboxChange = (e: React.FormEvent<HTMLInputElement>) => {
    e.stopPropagation();
    handlers.handleCheckboxChange(e, file.data.fname, file, "file");
  };

  return (
    <>
      {contextHolder}
      <PresentationComponent
        origin={{
          type: OperationContext.LIBRARY,
          additionalKeys: [computedPath],
        }}
        onClick={handleClick}
        onMouseDown={handlers.handleOnMouseDown}
        onCheckboxChange={handleCheckboxChange}
        onContextMenuClick={handleClick}
        onNavigate={() => setIsPreview(!preview)}
        computedPath={computedPath}
        isChecked={isSelected}
        name={fileName}
        date={file.data.creation_date}
        icon={icon}
        bgRow={selectedBgRow}
      />
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
    </>
  );
};

type SubLinkCardProps = {
  linkFile: FileBrowserFolderLinkFile;
  computedPath: string;
};

export const getLinkFileName = (file: FileBrowserFolderLinkFile) => {
  return file.data.path.split("/").pop() || "";
};

export const SubLinkCard: React.FC<SubLinkCardProps> = ({
  linkFile,
  computedPath,
}) => {
  const navigate = useNavigate();
  const { isDarkTheme } = useContext(ThemeContext);
  const selectedPaths = useTypedSelector((state) => state.cart.selectedPaths);
  const handleDownloadMutation = useDownload();
  const { handlers } = useLongPress();
  const [api, contextHolder] = notification.useNotification();

  const linkName = getLinkFileName(linkFile);
  const isSelected = selectedPaths.some(
    (payload) => payload.path === linkFile.data.path,
  );
  const selectedBgRow = getBackgroundRowColor(isSelected, isDarkTheme);
  const icon = <ExternalLinkSquareAltIcon />;

  useEffect(() => {
    if (handleDownloadMutation.isSuccess) {
      api.success({
        message: "Successfully Triggered the Download",
        duration: 1,
      });
      setTimeout(() => handleDownloadMutation.reset(), 1000);
    }

    if (handleDownloadMutation.isError) {
      api.error({
        message: "Download Error",
        description: handleDownloadMutation.error?.message,
      });
    }
  }, [
    handleDownloadMutation.isSuccess,
    handleDownloadMutation.isError,
    api,
    handleDownloadMutation,
  ]);

  const handleClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) =>
    handlers.handleOnClick(e, linkFile, linkFile.data.path, "linkFile");

  const handleCheckboxChange = (e: React.FormEvent<HTMLInputElement>) => {
    e.stopPropagation();
    handlers.handleCheckboxChange(e, linkFile.data.path, linkFile, "linkFile");
  };

  return (
    <>
      {contextHolder}
      <PresentationComponent
        origin={{
          type: OperationContext.LIBRARY,
          additionalKeys: [computedPath],
        }}
        onClick={handleClick}
        onMouseDown={handlers.handleOnMouseDown}
        onCheckboxChange={handleCheckboxChange}
        onContextMenuClick={handleClick}
        onNavigate={() => navigate(linkFile.data.path)}
        computedPath={computedPath}
        isChecked={isSelected}
        name={linkName}
        date={linkFile.data.creation_date}
        icon={icon}
        bgRow={selectedBgRow}
      />
    </>
  );
};
