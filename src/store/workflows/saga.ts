import { all, fork, takeEvery, put, call } from "@redux-saga/core/effects";
import {
  getPluginFiles,
  checkRegistration,
  fastsurferRegistration,
} from "../utils";
import {
  WorkflowTypes,
  PACSFile,
  DircopyData,
  Med2ImgData,
  CovidnetData,
  Result,
  PluginList,
  RegistrationCheck,
  PollStatus,
  IFSHackData,
} from "./types";
import {
  getPacsFilesSuccess,
  setAnalysisStep,
  setFeedDetails,
} from "./actions";
import { IActionTypeParam } from "../../api/models/base.model";
import { PluginInstance, Feed } from "@fnndsc/chrisapi";
import { LocalFile } from "../../components/feed/CreateFeed/types";
import ChrisAPIClient from "../../api/chrisapiclient";
import GalleryModel from "../../api/models/gallery.model";
import { v4 } from "uuid";

function* handleGetPacsFilesRequest(action: IActionTypeParam) {
  const client = ChrisAPIClient.getClient();
  const { name, limit, offset } = action.payload;

  try {
    //@ts-ignore
    const fileList = yield client.getPACSFiles({
      PatientID: name,
      limit,
      offset,
    });
    const files: PACSFile[] = fileList.getItems();
    const totalFileCount = fileList.totalCount;

    yield put(
      getPacsFilesSuccess({
        files,
        totalFileCount,
      })
    );
  } catch (error) {
    console.error(error);
  }
}

function* setUpFastsurfer(instance: PluginInstance, pluginList: PluginList) {
  const client = ChrisAPIClient.getClient();
  const {
    plPfdicomTagSub,
    plPfdicomTagExtract,
    plFshack,
    plMultipass,
    plPfdoRun,
    plMgz2Report,
  } = pluginList;

  try {
    const plPfdicomTagSubArgs = {
      extension: ".dcm",
      previous_id: instance.data.id,
      tagStruct: {
        PatientName: "%_name|patientID_PatientName",
        PatientID: "%_md5|7_PatientID",
        AccessionNumber: "%_md5|8_AccessionNumber",
        PatientBirthDate: "%_strmsk|******01_PatientBirthDate",
        "re:.*hysician": "%_md5|4_#tag",
        "re:.*stitution": "#tag",
        "re:.*ddress": "#tag",
      },
      title: "Sub-tags",
    };

    const plPfdicomTagSubInstance: PluginInstance =
      yield client.createPluginInstance(
        plPfdicomTagSub.data.id,
        plPfdicomTagSubArgs
      );

    const plPfdicomTagExtractArgs = {
      outputFileType: "txt,scv,json,html",
      outputFileStem: "Post-Sub",
      title: "Tag-Extract",
      previous_id: plPfdicomTagSubInstance.data.id,
    };

    yield client.createPluginInstance(
      plPfdicomTagExtract.data.id,
      plPfdicomTagExtractArgs
    );

    const plFshackArgs = {
      exec: "recon-all",
      args: "ARGS: -all -notalairach",
      title: "All-mgzs",
      previous_id: plPfdicomTagSubInstance.data.id,
    };
    const fsHackInstance: PluginInstance = yield client.createPluginInstance(
      plFshack.data.id,
      plFshackArgs
    );

    const plMultipassArgs = {
      splitExpr: "++",
      commonArgs:
        "\\'--printElapsedTime --verbosity 5 --saveImages --skipAllLabels --outputFileStem sample --outputFileType png\\'",
      specificArgs:
        "\\'--inputFile recon-of-SAG-anon-dcm/mri/brainmask.mgz --wholeVolume brainVolume ++ --inputFile recon-of-SAG-anon-dcm/mri/aseg.mgz --wholeVolume segVolume --lookupTable __fs__ \\'",
      exec: "pfdo_mgz2img",
      title: "mgz-slices",
      previous_id: fsHackInstance.data.id,
    };
    const plMultipassInstance: PluginInstance =
      yield client.createPluginInstance(plMultipass.data.id, plMultipassArgs);

    const plPfdoRunArgs = {
      dirFilter: "label-brainVolume",
      fileFilter: "png",
      verbose: 5,
      exec: "\\'composite -dissolve 90 -gravity Center %inputWorkingDir/%inputWorkingFile %inputWorkingDir/../../aseg.mgz/label-segVolume/%inputWorkingFile -alpha Set %outputWorkingDir/%inputWorkingFile\\'",
      noJobLogging: "",
      title: "overlay-png",
      previous_id: fsHackInstance.data.id,
    };
    yield client.createPluginInstance(plPfdoRun.data.id, plPfdoRunArgs);

    const plMgz2LutReportArgs = {
      fileName: "recon-of-SAG-anon-dcm/mri/aseg.mgz",
      report_types: "txt,csv,json,html",
      title: "ASEG-report",
      previous_id: plMultipassInstance.data.id,
    };
    yield client.createPluginInstance(
      plMgz2Report.data.id,
      plMgz2LutReportArgs
    );
    yield put(
      setAnalysisStep({
        id: 3,
        title: "Finished Scheduling",
        status: "finish",
        error: "",
      })
    );
    yield put(
      setAnalysisStep({
        id: 4,
        title: "Process Complete",
        status: "finish",
        error: "",
      })
    );
  } catch (error) {
    yield put(
      setAnalysisStep({
        id: 4,
        title: "Finished With Error",
        status: "error",
        error: `${error}`,
      })
    );
  }
}

function* fetchDircopyFiles(instance: PluginInstance, pluginList: PluginList) {
  const client = ChrisAPIClient.getClient();
  const { med2Img, workflowPlugin } = pluginList;
  try {
    yield put(
      setAnalysisStep({
        id: 3,
        title: "Finished Scheduling",
        status: "finish",
        error: "",
      })
    );

    if (
      workflowPlugin.data.name === "pl-covidnet" ||
      workflowPlugin.data.name === "pl-fshack-infant"
    ) {
      const files: any[] = yield getPluginFiles(instance);
      for (let i = 0; i < files.length; i++) {
        const inputFile = files[i].data.fname.split("/").pop();
        if (GalleryModel.isValidDcmFile(inputFile)) {
          if (workflowPlugin.data.name === "pl-covidnet") {
            const imgData: Med2ImgData = {
              inputFile,
              sliceToConvert: 0,
              previous_id: instance.data.id,
            };
            const previousInstance: PluginInstance =
              yield client.createPluginInstance(med2Img.data.id, imgData);

            const data: CovidnetData = {
              previous_id: previousInstance.data.id,
              imagefile: `sample.png`,
            };
            yield client.createPluginInstance(workflowPlugin.data.id, data);
          } else if (workflowPlugin.data.name === "pl-fshack-infant") {
            const data: IFSHackData = {
              previous_id: instance.data.id,
              title: "InfantFS",
              inputFile,
              outputFile: "output",
              exec: "recon-all",
              args: "'{ -all}'",
            };
            yield client.createPluginInstance(workflowPlugin.data.id, data);
          }
        }
      }
    }
    if (workflowPlugin.data.name === "pl-fshack") {
      const data: IFSHackData = {
        previous_id: instance.data.id,
        title: "AdultFS",
        inputFile: ".dcm",
        exec: "recon-all",
        outputFile: "recon-all",
        args: "' -all -notalairach '",
      };
      yield client.createPluginInstance(workflowPlugin.data.id, data);
    }
    yield put(
      setAnalysisStep({
        id: 4,
        title: "Process Complete",
        status: "finish",
        error: "",
      })
    );
  } catch (error) {
    yield put(
      setAnalysisStep({
        id: 4,
        title: "Finished With Error",
        status: "error",
        error: `${error}`,
      })
    );
  }
}

function* pollingBackend(pluginInstance: PluginInstance) {
  //@ts-ignore
  const instance = yield pluginInstance.get();
  const timeout = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  yield timeout(1000);
  const shouldWait = () => {
    const returnValue = ![
      PollStatus.CANCELLED,
      PollStatus.ERROR,
      PollStatus.SUCCESS,
    ].includes(instance.data.status);
    return returnValue;
  };
  while (shouldWait()) {
    yield timeout(6000);
    pluginInstance.get();
  }
  const result = {
    plugin: pluginInstance,
    status: instance.data.status,
  };
  if ([PollStatus.CANCELLED, PollStatus.ERROR].includes(instance.data.status)) {
  } else return result;
}

async function uploadLocalFiles(files: LocalFile[], directory: string) {
  const client = ChrisAPIClient.getClient();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    await client.uploadFile(
      {
        upload_path: `${directory}/${file.name}`,
      },
      {
        fname: (file as LocalFile).blob,
      }
    );
  }
}

function* pacsFilePaths(files: PACSFile[]) {
  return files.map((file: PACSFile) => file.data.fname);
}

function* uploadedFilePaths(files: LocalFile[], directory: string) {
  let localFilePath = "";
  if (files.length > 1) {
    localFilePath = directory;
  } else localFilePath = `${directory}/`;
  return localFilePath;
}

function* handleSubmitAnalysis(action: IActionTypeParam) {
  const client = ChrisAPIClient.getClient();

  const { pacsFile, localFiles, workflowType, username } = action.payload;

  if (workflowType === "fastsurfer") {
    const pluginRegistry: RegistrationCheck = yield fastsurferRegistration();
    if (pluginRegistry.registrationSuccessfull) {
      const pluginList = pluginRegistry.pluginList;
      if (pluginList) {
        yield put(
          setAnalysisStep({
            id: 1,
            title: "Plugins Registeration Check Completed",
            status: "finish",
            error: "",
          })
        );
        const { plMriSagAnon } = pluginList;
        const data = {
          title: "Input-Dicoms",
        };
        const fsPluginInstance: PluginInstance =
          yield client.createPluginInstance(plMriSagAnon.data.id, data);
        const feed: Feed = yield fsPluginInstance.getFeed();
        if (feed) {
          yield all([
            put(
              setAnalysisStep({
                id: 2,
                title: "Feed Created Successfully",
                status: "finish",
                error: "",
              })
            ),
            put(setFeedDetails(feed.data.id)),
          ]);
        }
        yield setUpFastsurfer(fsPluginInstance, pluginList);
      }
    } else {
      yield put(
        setAnalysisStep({
          id: 1,
          title: "Plugin registration check failed",
          status: "error",
          error: "Register all the required plugins for this workflow",
        })
      );
    }
  } else {
    const pluginRegistry: RegistrationCheck = yield checkRegistration(
      workflowType
    );
    if (pluginRegistry.registrationSuccessfull) {
      const pluginList = pluginRegistry.pluginList;
      if (pluginList) {
        const { dircopy } = pluginList;

        yield put(
          setAnalysisStep({
            id: 1,
            title: "Plugins Registeration Check Completed",
            status: "finish",
            error: "",
          })
        );

        let totalFilePaths: string[] = [];

        if (pacsFile.length > 0 && localFiles.length === 0) {
          totalFilePaths = yield pacsFilePaths(pacsFile);
        } else if (localFiles.length > 0 && pacsFile.length === 0) {
          const directoryName = `${username}/uploads/${workflowType}-${v4()}`;
          yield uploadLocalFiles(localFiles, directoryName);
          totalFilePaths.push(
            yield uploadedFilePaths(localFiles, directoryName)
          );
        } else if (localFiles.length > 0 && pacsFile.length > 0) {
          totalFilePaths = yield pacsFilePaths(pacsFile);
          const directoryName = `${username}/uploads/${workflowType}-${v4()}`;
          yield uploadLocalFiles(localFiles, directoryName);
          totalFilePaths.push(
            yield uploadedFilePaths(localFiles, directoryName)
          );
        }

        if (totalFilePaths.length > 0) {
          const data: DircopyData = {
            dir: totalFilePaths.join(","),
            title: `${workflowType}_analysis`,
          };
          const dircopyInstance: PluginInstance =
            yield client.createPluginInstance(dircopy.data.id, data);
          try {
            const feed: Feed = yield dircopyInstance.getFeed();
            if (feed) {
              yield all([
                put(
                  setAnalysisStep({
                    id: 2,
                    title: "Feed Created Successfully",
                    status: "finish",
                    error: "",
                  })
                ),
                put(setFeedDetails(feed.data.id)),
              ]);
             
              if (workflowType === "adult-freesurfer" || workflowType==='infant-freesurfer') {
                yield call(fetchDircopyFiles, dircopyInstance, pluginList);
              } else {
                const result: Result = yield pollingBackend(dircopyInstance);
                if (result.status === "finishedSuccessfully") {
                  console.log("Result", result);
                  yield call(fetchDircopyFiles, result.plugin, pluginList);
                }
              }
            }
          } catch (error) {
            yield put(
              setAnalysisStep({
                id: 2,
                title: "Error Found while creating a Feed",
                status: "error",
                error: `${error}`,
              })
            );
          }
        } else throw new Error("Please select a file");
      }
    } else {
      yield put(
        setAnalysisStep({
          id: 1,
          title: "Plugin registration check failed",
          status: "error",
          error: "Register all the required plugins for this workflow",
        })
      );
    }
  }
}

function* watchGetPacsFilesRequest() {
  yield takeEvery(
    WorkflowTypes.GET_PACS_FILES_REQUEST,
    handleGetPacsFilesRequest
  );
}

function* watchSubmitAnalysis() {
  yield takeEvery(WorkflowTypes.SUBMIT_ANALYSIS, handleSubmitAnalysis);
}

export function* workflowsSaga() {
  yield all([fork(watchGetPacsFilesRequest)]);
  yield all([fork(watchSubmitAnalysis)]);
}
