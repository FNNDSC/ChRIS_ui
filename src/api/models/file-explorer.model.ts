// Description: get file type by file extention
export function getFileExtension(filename: string) {
  console.log("Filename", filename);
  return filename.substring(filename.lastIndexOf(".") + 1);
}
