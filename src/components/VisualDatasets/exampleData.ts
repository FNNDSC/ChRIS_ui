import { FilebrowserFile } from "./models.ts";

const EXAMPLE_FILES: { [key: string]: FilebrowserFile } = {
  seragSidecar: {
    creation_date: "2024-02-02T00:28:20.942972-05:00",
    fname: "chris/feed_12/pl-dircopy_16/pl-tsdircopy_19/pl-bulk-rename_20/pl-topologicalcopy_34/pl-visual-dataset_35/data/Age 30/serag.nii.gz.chrisvisualdataset.volume.json",
    fsize: 317,
    file_resource: "https://example.com/api/v1/files/1878/serag.nii.gz.chrisvisualdataset.volume.json"
  },
  seragNifti: {
    creation_date: "2024-02-02T00:28:20.943198-05:00",
    fname: "chris/feed_12/pl-dircopy_16/pl-tsdircopy_19/pl-bulk-rename_20/pl-topologicalcopy_34/pl-visual-dataset_35/data/Age 30/serag.nii.gz",
    fsize: 1579570,
    file_resource: "https://example.com/api/v1/files/1903/serag.nii.gz"
  },
  otherNifti: {
    creation_date: "2024-02-02T00:28:20.943199-05:00",
    fname: "chris/feed_12/pl-dircopy_16/pl-tsdircopy_19/pl-bulk-rename_20/pl-topologicalcopy_34/pl-visual-dataset_35/data/Age 30/other.nii.gz",
    fsize: 1234567,
    file_resource: "https://example.com/api/v1/files/1999/other.nii.gz"
  },
  aliSidecar: {
    creation_date: "2024-02-02T00:28:20.942206-05:00",
    fname: "chris/feed_12/pl-dircopy_16/pl-tsdircopy_19/pl-bulk-rename_20/pl-topologicalcopy_34/pl-visual-dataset_35/data/Age 30/ali.nii.gz.chrisvisualdataset.volume.json",
    fsize: 1242,
    file_resource: "https://example.com/api/v1/files/1795/ali.nii.gz.chrisvisualdataset.volume.json"
  },
  aliNifti: {
    creation_date: "2024-02-02T00:28:20.942408-05:00",
    fname: "chris/feed_12/pl-dircopy_16/pl-tsdircopy_19/pl-bulk-rename_20/pl-topologicalcopy_34/pl-visual-dataset_35/data/Age 30/ali.nii.gz",
    fsize: 758789,
    file_resource: "https://example.com/api/v1/files/1817/ali.nii.gz"
  }
};

export default EXAMPLE_FILES;
