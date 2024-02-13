import { Collection, FileBrowserPathFile } from "@fnndsc/chrisapi";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";

/**
 * A type-safe wrapper for `FileBrowserPathFile` which also handles
 * the annoyances of Collection+JSON.
 */
class FpFileBrowserFile {
  private readonly file: FileBrowserPathFile;

  constructor(file: FileBrowserPathFile) {
    this.file = file;
  }

  get creation_date(): string {
    return this.file.data.creation_date;
  }

  get fname(): string {
    return this.file.data.fname;
  }

  get fsize(): number {
    return this.file.data.fsize;
  }

  get file_resource() {
    return Collection.getLinkRelationUrls(
      this.file.collection.items[0],
      "file_resource",
    )[0];
  }

  get url() {
    return Collection.getLinkRelationUrls(
      this.file.collection.items[0],
      "url",
    )[0];
  }

  getFileBlob(
    ...args: Parameters<FileBrowserPathFile["getFileBlob"]>
  ): TE.TaskEither<Error, Blob> {
    return TE.tryCatch(() => this.file.getFileBlob(...args), E.toError);
  }
}

export default FpFileBrowserFile;
