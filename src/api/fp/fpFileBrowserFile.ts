import { Collection, FileBrowserPathFile } from "@fnndsc/chrisapi";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

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

  /**
   * Get the data of this file, assuming it is UTF-8 plaintext.
   */
  getAsText(
    ...args: Parameters<FileBrowserPathFile["getFileBlob"]>
  ): TE.TaskEither<Error, string> {
    return pipe(
      this.getFileBlob(...args),
      TE.flatMap((blob) => {
        const task = () => blob.text();
        return TE.rightTask(task);
      }),
    );
  }
}

export default FpFileBrowserFile;
