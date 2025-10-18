import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import type { FileBrowserFolderFile, PACSFile } from "@fnndsc/chrisapi";
import type * as DoUser from "../../../reducers/user";
import {
  CatchallDisplay,
  DcmDisplay,
  IframeDisplay,
  ImageDisplay,
  JsonDisplay,
  NiiVueDisplay,
  PdfDisplay,
  TextDisplay,
  VideoDisplay,
  XtkDisplay,
} from "./index";

type TDoUser = ThunkModuleToFunc<typeof DoUser>;

type Props = {
  selectedFile?: FileBrowserFolderFile | PACSFile;
  viewerName: string;
  preview?: string;
  isHide?: boolean;

  useUser: UseThunk<DoUser.State, TDoUser>;
};

// XXX Because it is possible that some special display requires some persistently attached (ex: d3/niivue/canvas/etc., we use display-none strategy.
export default (props: Props) => {
  const { selectedFile, viewerName, isHide } = props;

  const isShowJSON = !isHide && selectedFile && viewerName === "JsonDisplay";
  const isShowIframe =
    !isHide && selectedFile && viewerName === "IframeDisplay";
  const isShowImage = !isHide && selectedFile && viewerName === "ImageDisplay";
  const isShowDCM = !isHide && selectedFile && viewerName === "DcmDisplay";
  const isShowPDF = !isHide && selectedFile && viewerName === "PdfDisplay";
  const isShowXtk = !isHide && selectedFile && viewerName === "XtkDisplay";
  const isShowText = !isHide && selectedFile && viewerName === "TextDisplay";
  const isShowNiivue =
    !isHide && selectedFile && viewerName === "NiiVueDisplay";
  const isShowVideo = !isHide && selectedFile && viewerName === "VideoDisplay";

  const isShowCatchAll =
    !isHide &&
    !isShowJSON &&
    !isShowIframe &&
    !isShowImage &&
    !isShowDCM &&
    !isShowPDF &&
    !isShowXtk &&
    !isShowText &&
    !isShowNiivue &&
    !isShowVideo;

  console.info(
    "ViewerDisplay: viewerName:",
    viewerName,
    "isShowJSON:",
    isShowJSON,
    "isShowIframe:",
    isShowIframe,
    "isShowImage:",
    isShowImage,
    "isShowDCM:",
    isShowDCM,
    "isShowPDF:",
    isShowPDF,
    "isShowXtk:",
    isShowXtk,
    "isShowText:",
    isShowText,
    "isShowNiivue:",
    isShowNiivue,
    "isShowVideo:",
    isShowVideo,
    "isShowCatchAll:",
    isShowCatchAll,
  );
  return (
    <>
      <JsonDisplay {...props} isHide={!isShowJSON} />
      <IframeDisplay {...props} isHide={!isShowIframe} />
      <ImageDisplay {...props} isHide={!isShowImage} />
      {/* @ts-expect-error dcmdisplay */}
      <DcmDisplay {...props} isHide={!isShowDCM} />
      <PdfDisplay {...props} isHide={!isShowPDF} />
      <XtkDisplay {...props} isHide={!isShowXtk} />
      <TextDisplay {...props} isHide={!isShowText} />
      <NiiVueDisplay {...props} isHide={!isShowNiivue} />
      <VideoDisplay {...props} isHide={!isShowVideo} />
      <CatchallDisplay {...props} isHide={!isShowCatchAll} />
    </>
  );
};
