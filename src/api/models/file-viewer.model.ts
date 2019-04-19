export interface IFileState {
    blob?: Blob;
    blobName: string;
    blobText: any;
    fileType: string;
  }


// Description: get file type by file extention
export function downloadFile(Fileblob: any, fileName: string) {
  const url = window.URL.createObjectURL(new Blob([Fileblob]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Description: Mapping for plugin tabs *Note: Should come from db
export const pluginViewerMap: any = {
  default: ["FileBrowserViewer"],
  dircopy: ["RevViewer", "FileBrowserViewer"],
  pacscopy: ["RevViewer", "FileBrowserViewer"],
  // mri10yr06mo01da_normal: ["RevViewer", "FileBrowserViewer"], // This is temp for custom display
  freesurfer_pp: ["DicomViewer_2D", "DicomViewer_3D", "FreesurferDataTable", "FileBrowserViewer"],
  simpledsapp: ["VolumeGrowth", "SegmentAnalysis", "ZScoreDataTable", "FileBrowserViewer"],
  mpcs: ["VolumeGrowth", "SegmentAnalysis", "ZScoreDataTable", "FileBrowserViewer"],
  z2labelmap: ["ZScoreViewer", "FileBrowserViewer"]
};

// Description: Mapping for Viewer type by file type *Note: Should come from db
// File type: Viewer component name
export const fileViewerMap: any = {
  stats: "IframeDisplay",
  txt: "IframeDisplay",
  html: "IframeDisplay",
  csv: "IframeDisplay",
  ctab: "IframeDisplay",
  json: "JsonDisplay",
  png: "ImageDisplay",
  jpg: "ImageDisplay",
  jpeg: "ImageDisplay",
  gif: "ImageDisplay",
  dcm: "DcmDisplay",
  default: "CatchallDisplay"
};
