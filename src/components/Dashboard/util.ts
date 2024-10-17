// COVIDnet Dataset
export const covidnetDataset = {
  nodes: [
    {
      id: "root",
      group: 1,
      item: {
        data: {
          title: "Root Node",
        },
      },
    },
    {
      id: "Convert Original DICOM to JPG",
      group: 2,
      item: {
        data: {
          title: "Convert Original DICOM to JPG",
        },
      },
    },
    {
      id: "Combine PDF and DCM",
      group: 3,
      item: {
        data: {
          title: "Combine PDF and DCM",
        },
      },
    },
    {
      id: "COVIDnet classification",
      group: 4,
      item: {
        data: {
          title: "COVIDnet Classification",
        },
      },
    },
    {
      id: "Unstack folders",
      group: 5,
      item: {
        data: {
          title: "Unstack Folders",
        },
      },
    },
    {
      id: "Generate PDF report",
      group: 6,
      item: {
        data: {
          title: "Generate PDF Report",
        },
      },
    },
  ],
  links: [
    { source: "root", target: "Convert Original DICOM to JPG", value: 5 },
    { source: "root", target: "Combine PDF and DCM", value: 3 },
    { source: "Combine PDF and DCM", target: "Unstack folders", value: 4 },
    {
      source: "Convert Original DICOM to JPG",
      target: "COVIDnet classification",
      value: 6,
    },
    {
      source: "COVIDnet classification",
      target: "Generate PDF report",
      value: 7,
    },
    { source: "Generate PDF report", target: "Combine PDF and DCM", value: 2 },
  ],
};

// Leg Length Discrepancy (LLD) Dataset
export const lldDataset = {
  nodes: [
    {
      id: "root-0",
      group: 1,
      item: {
        data: {
          title: "root-0",
          plugin_name: "pl-simpledsapp",
          plugin_version: "2.1.0",
        },
      },
    },
    {
      id: "dcm-to-mha-1",
      group: 2,
      item: {
        data: {
          title: "dcm-to-mha-1",
          plugin_name: "pl-dcm2mha_cnvtr",
          plugin_version: "1.2.22",
        },
      },
    },
    {
      id: "heatmaps-join-root-3",
      group: 3,
      item: {
        data: {
          title: "heatmaps-join-root-3",
          plugin_name: "pl-topologicalcopy",
          plugin_version: "0.2.6",
        },
      },
    },
    {
      id: "generate-landmark-heatmaps-2",
      group: 4,
      item: {
        data: {
          title: "generate-landmark-heatmaps-2",
          plugin_name: "pl-lld_inference",
          plugin_version: "2.2.10",
        },
      },
    },
    {
      id: "landmarks-to-json-4",
      group: 5,
      item: {
        data: {
          title: "landmarks-to-json-4",
          plugin_name: "pl-csv2json",
          plugin_version: "1.2.2",
        },
      },
    },
    {
      id: "measurement-join-dicom-7",
      group: 6,
      item: {
        data: {
          title: "measurement-join-dicom-7",
          plugin_name: "pl-topologicalcopy",
          plugin_version: "0.2.6",
        },
      },
    },
    {
      id: "heatmaps-join-json-5",
      group: 7,
      item: {
        data: {
          title: "heatmaps-join-json-5",
          plugin_name: "pl-topologicalcopy",
          plugin_version: "0.2.6",
        },
      },
    },
    {
      id: "measure-leg-segments-6",
      group: 8,
      item: {
        data: {
          title: "measure-leg-segments-6",
          plugin_name: "pl-markimg",
          plugin_version: "1.2.30",
        },
      },
    },
    {
      id: "image-to-DICOM-8",
      group: 9,
      item: {
        data: {
          title: "image-to-DICOM-8",
          plugin_name: "pl-dicommake",
          plugin_version: "2.2.2",
        },
      },
    },
    {
      id: "pacs-push-9",
      group: 10,
      item: {
        data: {
          title: "pacs-push-9",
          plugin_name: "pl-orthanc_push",
          plugin_version: "1.2.2",
        },
      },
    },
  ],
  links: [
    { source: "root-0", target: "dcm-to-mha-1", value: 1 },
    { source: "root-0", target: "heatmaps-join-root-3", value: 1 },
    {
      source: "dcm-to-mha-1",
      target: "generate-landmark-heatmaps-2",
      value: 1,
    },
    { source: "heatmaps-join-root-3", target: "landmarks-to-json-4", value: 1 },
    {
      source: "heatmaps-join-root-3",
      target: "measurement-join-dicom-7",
      value: 1,
    },
    { source: "landmarks-to-json-4", target: "heatmaps-join-json-5", value: 1 },
    {
      source: "heatmaps-join-json-5",
      target: "measure-leg-segments-6",
      value: 1,
    },
    { source: "measure-leg-segments-6", target: "image-to-DICOM-8", value: 1 },
    { source: "image-to-DICOM-8", target: "pacs-push-9", value: 1 },
  ],
};

// Fetal Brain Reconstruction Dataset
export const fetalBrainReconstructionDataset = {
  nodes: [
    {
      id: "unstack-folders",
      group: 1,
      item: {
        data: {
          title: "Unstack folders",
          plugin: "pl-unstack-folders v1.0.0",
        },
      },
    },
    {
      id: "convert-dicom-to-nifti",
      group: 2,
      item: {
        data: {
          title: "Convert DICOM to NIFTI",
          plugin: "pl-dcm2niix v1.0.0",
        },
      },
    },
    {
      id: "brain-mask",
      group: 3,
      item: {
        data: {
          title: "Brain Mask",
          plugin: "pl-emerald v0.2.2",
        },
      },
    },
    {
      id: "select-brain-extraction",
      group: 4,
      item: {
        data: {
          title: "Select brain extraction",
          plugin: "pl-bulk-rename v0.1.2",
        },
      },
    },
    {
      id: "n4-bias-field-correction",
      group: 5,
      item: {
        data: {
          title: "N4 Bias Field Correction",
          plugin: "pl-n4biasfieldcorrection v2.5.0.1",
        },
      },
    },
    {
      id: "automatic-fetal-brain-assessment",
      group: 6,
      item: {
        data: {
          title: "Automatic Fetal Brain Assessment",
          plugin: "pl-fetal-brain-assessment v1.3.1",
        },
      },
    },
    {
      id: "reconstruction",
      group: 7,
      item: {
        data: {
          title: "Reconstruction",
          plugin: "pl-NeSVoR-reconstruct v0.5.0",
        },
      },
    },
    {
      id: "brain-extraction-preview-figures",
      group: 8,
      item: {
        data: {
          title: "Brain extraction preview figures",
          plugin: "pl-mri-preview v1.2.2",
        },
      },
    },
    {
      id: "brain-reconstruction-preview-figures",
      group: 9,
      item: {
        data: {
          title: "Brain reconstruction preview figures",
          plugin: "pl-mri-preview v1.2.2",
        },
      },
    },
  ],
  links: [
    { source: "unstack-folders", target: "convert-dicom-to-nifti", value: 1 },
    { source: "convert-dicom-to-nifti", target: "brain-mask", value: 1 },
    { source: "brain-mask", target: "select-brain-extraction", value: 1 },
    {
      source: "select-brain-extraction",
      target: "n4-bias-field-correction",
      value: 1,
    },
    {
      source: "n4-bias-field-correction",
      target: "automatic-fetal-brain-assessment",
      value: 1,
    },
    {
      source: "automatic-fetal-brain-assessment",
      target: "reconstruction",
      value: 1,
    },
    {
      source: "brain-mask",
      target: "brain-extraction-preview-figures",
      value: 1,
    },
    {
      source: "reconstruction",
      target: "brain-reconstruction-preview-figures",
      value: 1,
    },
  ],
};
