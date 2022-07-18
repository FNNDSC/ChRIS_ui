// Description: get file type by file extention
export function getFileExtension(filename: string) {
  const name = filename.substring(filename.lastIndexOf('.') + 1)

  return name
}
