import { FilebrowserFile } from "./models.ts";

type NiftiAndOptionPair = {
  nifti: FilebrowserFile;
  sidecarFile: FilebrowserFile | null;
};

function pairNiftisWithAssociatedOptions(
  files: FilebrowserFile[],
): NiftiAndOptionPair[] {
  const niftis = files.filter(isNifti);
  const sidecars = files.filter(isSidecar);

  return niftis.map((nifti) => {
    const sidecarFile =
      sidecars.find((sidecar) => sidecarIsForNifti(nifti, sidecar)) || null;
    return { nifti, sidecarFile };
  });
}

function isNifti(file: FilebrowserFile): boolean {
  return file.fname.endsWith(".nii.gz");
}

function isSidecar(file: FilebrowserFile): boolean {
  return file.fname.endsWith(".chrisvisualdataset.volume.json");
}

function sidecarIsForNifti(
  nifti: FilebrowserFile,
  sidecar: FilebrowserFile,
): boolean {
  return sidecar.fname.endsWith(
    `/${basename(nifti.fname)}.chrisvisualdataset.volume.json`,
  );
}

function basename(path: string): string {
  const i = path.lastIndexOf("/");
  return path.substring(i === -1 ? 0 : i + 1);
}

export type { NiftiAndOptionPair };
export { pairNiftisWithAssociatedOptions };
