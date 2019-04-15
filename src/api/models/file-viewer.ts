
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