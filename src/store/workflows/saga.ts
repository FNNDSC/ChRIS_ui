import { all, fork, takeEvery, put, call } from "@redux-saga/core/effects";
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
import {
  PluginInstanceList,
  PluginInstance,
  Feed,
  PluginInstanceFileList,
  UploadedFileList,
} from "@fnndsc/chrisapi";
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

function* getFiles(instance: PluginInstance) {
  const fileList: PluginInstanceFileList = yield instance.getFiles();
  const files = fileList.getItems();
  return files;
}

function* fetchDircopyFiles(instance: PluginInstance, pluginList: PluginList) {
  const client = ChrisAPIClient.getClient();
  const { med2img, workflowPlugin } = pluginList;
  try {
    yield put(
      setAnalysisStep({
        id: 3,
        title: "Finished Scheduling",
        status: "finish",
        error: "",
      })
    );
    const files: any[] = yield getFiles(instance);

    if (workflowPlugin.data.name === "pl-covidnet") {
      for (let i = 0; i < files.length; i++) {
        const inputFile = files[i].data.fname.split("/").pop();
        if (GalleryModel.isValidDcmFile(inputFile)) {
          const imgData: Med2ImgData = {
            inputFile,
            sliceToConvert: 0,
            previous_id: instance.data.id,
          };
          const previousInstance: PluginInstance =
            yield client.createPluginInstance(med2img.data.id, imgData);

          const data: CovidnetData = {
            previous_id: previousInstance.data.id,
            imagefile: `sample.png`,
          };

          yield client.createPluginInstance(workflowPlugin.data.id, data);
        }
      }
    }
    console.log("Files", files[0].data.fname);

    if (
      workflowPlugin.data.name === "pl-fshack-infant" ||
      workflowPlugin.data.name === "pl-fshack"
    ) {
      const title =
        workflowPlugin.data.name === "pl-fshack-infant"
          ? "InfantFS"
          : "AdultFS";

      const data: IFSHackData = {
        previous_id: instance.data.id,
        title,
        inputFile: ".dcm",
        outputFile: "output",
        exec: "recon-all",
        args: "'-all '",
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

function* checkRegistration(workflowType: string) {
  const client = ChrisAPIClient.getClient();
  let registrationSuccessfull = false;

  const dircopyLookup: PluginInstanceList = yield client.getPlugins({
    name_exact: "pl-dircopy",
  });
  const dircopy: Plugin = yield dircopyLookup.getItems()[0];
  const med2imgLookup: PluginInstanceList = yield client.getPlugins({
    name_exact: "pl-med2img",
  });
  const med2img: Plugin = med2imgLookup.getItems()[0];

  let workflowPlugin: Plugin | undefined = undefined;

  if (workflowType === "covidnet") {
    const covidnetLookup: PluginInstanceList = yield client.getPlugins({
      name_exact: "pl-covidnet",
    });
    workflowPlugin = covidnetLookup.getItems()[0];
  }

  if (workflowType === "infant-freesurfer") {
    const plfshackLookup: PluginInstanceList = yield client.getPlugins({
      name_exact: "pl-fshack-infant",
    });
    workflowPlugin = plfshackLookup.getItems()[0];
  }
  if (workflowType === "adult-freesurfer") {
    const plfashckLookup: PluginInstanceList = yield client.getPlugins({
      name_exact: "pl-fshack",
    });
    workflowPlugin = plfashckLookup.getItems()[0];
  }

  if (dircopy && med2img && workflowPlugin) {
    registrationSuccessfull = true;
  }
  return {
    registrationSuccessfull,
    pluginList: {
      dircopy,
      workflowPlugin,
      med2img,
    },
  };
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
        totalFilePaths.push(yield uploadedFilePaths(localFiles, directoryName));
      } else if (localFiles.length > 0 && pacsFile.length > 0) {
        totalFilePaths = yield pacsFilePaths(pacsFile);
        const directoryName = `${username}/uploads/${workflowType}-${v4()}`;
        yield uploadLocalFiles(localFiles, directoryName);
        totalFilePaths.push(yield uploadedFilePaths(localFiles, directoryName));
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

            const result: Result = yield pollingBackend(dircopyInstance);
            if (result.status === "finishedSuccessfully") {
              yield call(fetchDircopyFiles, result.plugin, pluginList);
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
