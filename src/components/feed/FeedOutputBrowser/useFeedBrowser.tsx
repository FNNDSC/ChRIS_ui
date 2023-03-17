import React from "react";
import {
  setExplorerMode,
  setExplorerRequest,
  setSelectedFolder,
} from "../../../store/explorer/actions";
import { useTypedSelector } from "../../../store/hooks";
import { useDispatch } from "react-redux";
import JSZip from "jszip";
import { getPluginFilesRequest } from "../../../store/resources/actions";
import { ExplorerMode } from "../../../store/explorer/types";
import FileViewerModel from "../../../api/models/file-viewer.model";
import { getPluginName } from "./utils";
import { fetchResource } from "../../../api/common";
import { removeTool } from "../../detailedView/displays/DicomViewer/utils";
import {
  handleClose,
  handleMaximize,
  handleMinimize,
} from "../../common/button";

const status = ["finishedSuccessfully", "finishedWithError", "cancelled"];

const getInitialDownloadState = () => {
  return {
    count: 0,
    status: false,
    plugin_name: "",
    error: "",
    fetchingFiles: false,
  };
};

export const useFeedBrowser = () => {
  const dispatch = useDispatch();
  const drawerState = useTypedSelector((state) => state.drawers);
  const [download, setDownload] = React.useState(getInitialDownloadState);
  const [pluginModalOpen, setPluginModalOpen] = React.useState(false);

  const pluginInstances = useTypedSelector(
    (state) => state.instance.pluginInstances
  );
  const { pluginFiles, loading: filesLoading } = useTypedSelector(
    (state) => state.resource
  );
  const selected = useTypedSelector((state) => state.instance.selectedPlugin);
  const { data: plugins } = pluginInstances;

  const pluginFilesPayload = selected && pluginFiles[selected.data.id];

  const statusTitle = useTypedSelector((state) => {
    if (selected) {
      const id = selected.data.id;
      if (selected.data.id && state.resource.pluginInstanceStatus[id]) {
        return state.resource.pluginInstanceStatus[id].status;
      } else return;
    }
  });

  const downloadAllClick = async () => {
    const zip = new JSZip();
    let count = 0;

    if (selected) {
      const params = {
        limit: 100,
        offset: 0,
      };
      const selectedNodeFn = selected.getFiles;
      const boundFn = selectedNodeFn.bind(selected);
      setDownload({
        ...download,
        fetchingFiles: true,
      });
      const { resource: files } = await fetchResource(params, boundFn);
      setDownload({
        ...download,
        fetchingFiles: false,
      });

      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          count += 1;
          const percentage = Math.round(
            Number(((count / files.length) * 100).toFixed(2))
          );

          setDownload({
            plugin_name: selected.data.plugin_name,
            status: true,
            count: percentage,
            error: "",
            fetchingFiles: false,
          });
          const file: any = files[i];
          const fileBlob = await file.getFileBlob();
          zip.file(file.data.fname, fileBlob);
        }
        const blob = await zip.generateAsync({ type: "blob" });
        const filename = `${getPluginName(selected)}.zip`;
        FileViewerModel.downloadFile(blob, filename);
        setDownload(getInitialDownloadState);
      } else {
        setDownload({
          ...download,
          status: false,
          error:
            "Files are not available for download yet. Please wait or try again later...",
        });
      }
    }
  };

  const finished = selected && status.includes(selected.data.status);

  React.useEffect(() => {
    if ((statusTitle && status.includes(statusTitle)) || finished) {
      if (download.error) {
        setDownload((state) => {
          return {
            ...state,
            error: "Files are ready for download now...",
          };
        });
      }

      if (selected && !pluginFilesPayload) {
        dispatch(
          getPluginFilesRequest({
            id: selected.data.id,
            path: selected.data.output_path,
          })
        );
      }

      if (download.error) {
        setTimeout(() => {
          setDownload(getInitialDownloadState);
        }, 3000);
      }
    }
  }, [
    selected,
    finished,
    dispatch,
    pluginFilesPayload,
    statusTitle,
    download.error,
  ]);

  const handleFileClick = (path: string) => {
    if (selected) {
      dispatch(
        getPluginFilesRequest({
          id: selected.data.id,
          path,
        })
      );
    }
  };

  const handleFileBrowserOpen = () => {
    setFolder();
    setPluginModalOpen(!pluginModalOpen);
    dispatch(setExplorerRequest());
  };

  const handlePluginModalClose = () => {
    if (pluginModalOpen) {
      removeTool();
    }
    setPluginModalOpen(!pluginModalOpen);
  };

  const setFolder = () => {
    if (pluginFilesPayload && pluginFilesPayload.files) {
      dispatch(setSelectedFolder(pluginFilesPayload.files));
    }
  };

  const handleDicomViewerOpen = () => {
    setFolder();
    setPluginModalOpen(!pluginModalOpen);
    dispatch(setExplorerMode(ExplorerMode.DicomViewer));
  };

  const handleXtkViewerOpen = () => {
    setFolder();
    setPluginModalOpen(!pluginModalOpen);
    dispatch(setExplorerMode(ExplorerMode.XtkViewer));
  };

  const handleTerminalViewerOpen = () => {
    setPluginModalOpen(!pluginModalOpen);
    dispatch(setExplorerMode(ExplorerMode.TerminalViewer));
  };

  const handleSidebarDrawer = (action: string) => {
    if (action === "close") {
      handleClose("directory", dispatch);
    } else if (action === "maximized") {
      handleMaximize("directory", dispatch);
    } else handleMinimize("directory", dispatch);
  };

  return {
    handleDicomViewerOpen,
    handleXtkViewerOpen,
    handlePluginModalClose,
    handleFileBrowserOpen,
    handleTerminalViewerOpen,
    handleFileClick,
    downloadAllClick,
    filesLoading,
    plugins,
    statusTitle,
    download,
    selected,
    pluginFilesPayload,
    pluginModalOpen,
    handleSidebarDrawer,
    sidebarStatus: drawerState.directory,
    filesStatus: drawerState.files,
  };
};
