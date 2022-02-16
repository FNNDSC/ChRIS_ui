import { TreeNode } from "../../store/workflows/types";

export const getFeedTree = (items: any[]) => {
  const tree = [],
    mappedArr: {
      [key: string]: TreeNode;
    } = {};

  items.forEach((item) => {
    const id = item.data.id;
    if (!mappedArr.hasOwnProperty(id)) {
      mappedArr[id] = {
        id: id,
        plugin_id: item.data.plugin_id,
        pipeline_id: item.data.pipeline_id,
        previous_id: item.data.previous_id && item.data.previous_id,
        children: [],
      };
    }
  });

  for (const id in mappedArr) {
    let mappedElem;
    if (mappedArr.hasOwnProperty(id)) {
      mappedElem = mappedArr[id];
      if (mappedElem.previous_id) {
        const parentId = mappedElem.previous_id;
        if (parentId && mappedArr[parentId] && mappedArr[parentId].children) {
          mappedArr[parentId].children.push(mappedElem);
        }
      } else tree.push(mappedElem);
    }
  }
  return tree;
};

interface PipelineData {
  name: string;
  authors?: string;
  category?: string;
  description?: string;
  locked?: boolean;
  plugin_tree?: string;
  plugin_inst_id?: number;
}

export const fastsurferPipeline = () => {
  const data: PipelineData = {
    name: "fastsurfer_dev",
    authors: "gideonpinto123@gmail.com",
    description: "test",
    category: "mri",
    locked: false,
    plugin_tree: JSON.stringify([
      {
        plugin_name: "pl-simpledsapp",
        plugin_version: "2.0.2",
        previous_index: null,
      },
      {
        plugin_name: "pl-pfdicom_tagextract",
        plugin_version: "3.1.2",
        previous_index: 0,
        plugin_parameter_defaults: [
          {
            name: "outputFileType",
            default: "txt,scv,json,html",
          },
          {
            name: "outputFileStem",
            default: "Post-Sub",
          },
          {
            name: "imageFile",
            default: "'m:%_nospc|-_ProtocolName.jpg'",
          },
          {
            name: "imageScale",
            default: "3:none",
          },
        ],
      },
      {
        plugin_name: "pl-pfdicom_tagsub",
        plugin_version: "3.2.3",
        previous_index: 0,
        plugin_parameter_defaults: [
          {
            name: "extension",
            default: ".dcm",
          },
          {
            name: "splitToken",
            default: "++",
          },
          {
            name: "splitKeyValue",
            default: ",",
          },
          {
            name: "tagInfo",
            default:
              "'PatientName,%_name|patientID_PatientName ++ PatientID,%_md5|7_PatientID ++ AccessionNumber,%_md5|8_AccessionNumber ++ PatientBirthDate,%_strmsk|******01_PatientBirthDate ++ re:.*hysician,%_md5|4_#tag ++ re:.*stitution,#tag ++ re:.*ddress,#tag'",
          },
        ],
      },
      {
        plugin_name: "pl-pfdicom_tagextract",
        plugin_version: "3.1.2",
        previous_index: 2,
        plugin_parameter_default: [
          {
            name: "outputFileType",
            default: "txt,scv,json,html",
          },
          {
            name: "outputFileStem",
            default: "Post-Sub",
          },
          {
            name: "imageFile",
            default: "'m:%_nospc|-_ProtocolName.jpg'",
          },
          {
            name: "imageScale",
            default: "3:none",
          },
          {
            name: "extension",
            default: ".dcm",
          },
        ],
      },
      {
        plugin_name: "pl-fshack",
        plugin_version: "1.2.0",
        previous_index: 2,
        plugin_parameter_default: [
          {
            name: "exec",
            default: "recon-all",
          },
          {
            name: "args",
            default: "'ARGS:-autorecon1'",
          },
          {
            name: "outputFile",
            default: "recon-of-SAG-anon-dcm",
          },
          {
            name: "inputFile",
            default: ".dcm",
          },
        ],
      },
      {
        plugin_name: "pl-fastsurfer_inference",
        plugin_version: "1.0.15",
        previous_index: 4,
        plugin_parameter_default: [
          {
            name: "subjectDir",
            default: "recon-of-SAG-anon-dcm",
          },
          {
            name: "subject",
            default: "mri",
          },
          {
            name: "copyInputFiles",
            default: "mgz",
          },
          {
            name: "iname",
            default: "brainmask.mgz",
          },
        ],
      },
      {
        plugin_name: "pl-multipass",
        plugin_version: "1.2.12",
        previous_index: 5,
        plugin_parameter_default: [
          {
            name: "splitExpr",
            default: "++",
          },
          {
            name: "commonArgs",
            default:
              "'--printElapsedTime --verbosity 5 --saveImages --skipAllLabels --outputFileStem sample --outputFileType png'",
          },
          {
            name: "specificArgs",
            default:
              "'--inputFile mri/brainmask.mgz --wholeVolume brainVolume ++ --inputFile mri/aparc.DKTatlas+aseg.deep.mgz --wholeVolume segVolume --lookupTable __fs__'",
          },
          {
            name: "exec",
            default: "pfdo_mgz2image",
          },
        ],
      },
      {
        plugin_name: "pl-pfdorun",
        plugin_version: "2.2.6",
        previous_index: 6,
        plugin_parameter_default: [
          {
            name: "dirFilter",
            default: "label-brainVolume",
          },
          {
            name: "fileFilter",
            default: "png",
          },
          {
            name: "exec",
            default:
              "'composite -dissolve 90 -gravity Center %inputWorkingDir/%inputWorkingFile %inputWorkingDir/../../aparc.DKTatlas+aseg.deep.mgz/label-segVolume/%inputWorkingFile -alpha Set %outputWorkingDir/%inputWorkingFile'",
          },
          {
            name: "verbose",
            default: "5",
          },
        ],
      },
      {
        plugin_name: "pl-mgz2lut_report",
        plugin_version: "1.3.1",
        previous_index: 5,
        plugin_parameter_default: [
          {
            name: "file_name",
            default: "mri/aparc.DKTatlas+aseg.deep.mgz",
          },
          {
            name: "report_types",
            default: "txt,csv,json,html,pdf",
          },
        ],
      },
    ]),
  };

  return data;
};

export const fetalReconstructionPipeline = () => {
  const data = {
    name: `fetalreconstruction`,
    authors: "gideonpinto123@gmail.com",
    description: "test",
    category: "mri",
    locked: false,
    plugin_tree: JSON.stringify([
      {
        plugin_name: "pl-fetal-brain-mask",
        plugin_version: "1.2.1",
        previous_index: null,
      },
      {
        plugin_name: "pl-ANTs_N4BiasFieldCorrection",
        plugin_version: "0.2.7.1",
        previous_index: 0,
        compute_env: "titan",
        plugin_parameter_defaults: [
          {
            name: "inputPathFilter",
            default: "extracted/0.0/*.nii",
          },
        ],
      },
      {
        plugin_name: "pl-fetal-brain-assessment",
        plugin_version: "1.3.0",
        previous_index: 1,
      },
      {
        plugin_name: "pl-irtk-reconstruction",
        plugin_version: "1.0.3",
        previous_index: 2,
        plugin_parameter_defaults: [
          {
            name: "inputPathFilter",
            default: "Best_Images_crop/*.nii",
          },
          {
            name: "csv",
            default: "quality_assessment.csv",
          },
        ],
      },
    ]),
  };
  return data;
};

export const freesurferPipeline = () => {
  const data = {
    name: `adultfreesurfer`,
    authors: "gideonpinto123@gmail.com",
    description: "test",
    category: "mri",
    locked: false,
    plugin_tree: JSON.stringify([
      {
        plugin_name: "pl-simpledsapp",
        plugin_version: "2.0.2",
        previous_index: null,
      },

      {
        plugin_name: "pl-pfdicom_tagextract",
        plugin_version: "3.1.2",
        previous_index: 0,
        plugin_parameter_defaults: [
          {
            name: "extension",
            default: ".dcm",
          },
          {
            name: "outputFileType",
            default: "txt,scv,json,html",
          },
          {
            name: "outputFileStem",
            default: "Pre-Sub",
          },
          {
            name: "imageScale",
            default: "3:none",
          },
          {
            name: "imageFile",
            default: "'m:%_nospc|-_ProtocolName.jpg'",
          },
        ],
      },
      {
        plugin_name: "pl-pfdicom_tagsub",
        plugin_version: "3.2.3",
        previous_index: 0,
        plugin_parameter_defaults: [
          {
            name: "extension",
            default: ".dcm",
          },
          {
            name: "splitToken",
            default: "++",
          },
          {
            name: "splitKeyValue",
            default: ",",
          },
          {
            name: "tagInfo",
            default:
              "'PatientName,%_name|patientID_PatientName ++ PatientID,%_md5|7_PatientID ++ AccessionNumber,%_md5|8_AccessionNumber ++ PatientBirthDate,%_strmsk|******01_PatientBirthDate ++ re:.*hysician,%_md5|4_#tag ++ re:.*stitution,#tag ++ re:.*ddress,#tag'",
          },
        ],
      },
      {
        plugin_name: "pl-pfdicom_tagextract",
        plugin_version: "3.1.2",
        previous_index: 2,
        plugin_parameter_default: [
          {
            name: "outputFileType",
            default: "txt,scv,json,html",
          },
          {
            name: "outputFileStem",
            default: "Post-Sub",
          },
          {
            name: "imageFile",
            default: "'m:%_nospc|-_ProtocolName.jpg'",
          },
          {
            name: "imageScale",
            default: "3:none",
          },
          {
            name: "extension",
            default: ".dcm",
          },
        ],
      },
      {
        plugin_name: "pl-fshack",
        plugin_version: "1.2.0",
        previous_index: 2,
        plugin_parameter_default: [
          {
            name: "inputFile",
            default: ".dcm",
          },
          {
            name: "exec",
            default: "recon-all",
          },
          {
            name: "outputFile",
            default: "recon-of-SAG-anon-dcm",
          },
          {
            name: "args",
            default: "'ARGS: -all'",
          },
        ],
      },
      {
        plugin_name: "pl-multipass",
        plugin_version: "1.2.12",
        previous_index: 4,
        plugin_parameter_default: [
          {
            name: "splitExpr",
            default: "++",
          },
          {
            name: "commonArgs",
            default:
              "'--printElapsedTime --verbosity 5 --saveImages --skipAllLabels --outputFileStem sample --outputFileType png'",
          },
          {
            name: "specificArgs",
            default:
              "'--inputFile recon-of-SAG-anon-dcm/mri/brainmask.mgz --wholeVolume brainVolume ++ --inputFile recon-of-SAG-anon-dcm/mri/aparc.a2009s+aseg.mgz --wholeVolume segVolume --lookupTable __fs__'",
          },
          {
            name: "exec",
            default: "pfdo_mgz2image",
          },
        ],
      },
      {
        plugin_name: "pl-pfdorun",
        plugin_version: "2.2.6",
        previous_index: 5,
        plugin_parameter_default: [
          {
            name: "dirFilter",
            default: "label-brainVolume",
          },
          {
            name: "fileFilter",
            default: "png",
          },
          {
            name: "verbose",
            default: "5",
          },
          {
            name: "exec",
            default:
              "'composite -dissolve 90 -gravity Center %inputWorkingDir/%inputWorkingFile %inputWorkingDir/../../aparc.a2009s+aseg.mgz/label-segVolume/%inputWorkingFile -alpha Set %outputWorkingDir/%inputWorkingFile'",
          },
        ],
      },
      {
        plugin_name: "pl-mgz2lut_report",
        plugin_version: "1.3.1",
        previous_index: 4,
        plugin_parameter_default: [
          {
            name: "file_name",
            default: "recon-of-SAG-anon-dcm/mri/aparc.a2009s+aseg.mgz",
          },
          {
            name: "report_types",
            default: "txt,csv,json,html,pdf",
          },
        ],
      },
    ]),
  };
  return data;
};
