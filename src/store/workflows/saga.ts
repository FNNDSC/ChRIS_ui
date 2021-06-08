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
} from "@fnndsc/chrisapi";
import { LocalFile } from "../../components/feed/CreateFeed/types";
import ChrisAPIClient from "../../api/chrisapiclient";
import GalleryModel from "../../api/models/gallery.model";

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
            yield client.createPluginInstance(med2img.data.id, imgData);

          const data: CovidnetData = {
            previous_id: previousInstance.data.id,
            imagefile: `sample.png`,
          };

          yield client.createPluginInstance(workflowPlugin.data.id, data);
        }

        if (workflowPlugin.data.name === "pl-fshack-infant") {
          const imgData: Med2ImgData = {
            title: "Input image",
            previous_id: instance.data.id,
            inputFile,
            sliceToConvert: "m",
          };

          yield client.createPluginInstance(med2img.data.id, imgData);

          const data: IFSHackData = {
            previous_id: instance.data.id,
            title: "InfantFS",
            inputFile,
            outputFile: "output",
            exec: "recon-all",
            args: "'{ -all }'",
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
      }
    }
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

  if (workflowType === "freesurfer") {
    const plfshackLookup: PluginInstanceList = yield client.getPlugins({
      name_exact: "pl-fshack-infant",
    });
    workflowPlugin = plfshackLookup.getItems()[0];
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
      const randomCode = Math.floor(Math.random() * 100);
      const pacsFilePaths = pacsFile.map((file: PACSFile) => {
        return file.data.fname;
      });
      const localFilePaths = `${username}/uploads/${workflowType}-${randomCode}`;

      if (localFiles.length > 0) {
        localFiles.map(async (file: LocalFile) => {
          client.uploadFile(
            {
              upload_path: `${localFilePaths}/${file.name}`,
            },
            {
              fname: (file as LocalFile).blob,
            }
          );
        });
      }
      let totalFilePaths: string[] = [];
      if (localFiles.length > 0 && pacsFile.length > 0) {
        totalFilePaths = [localFilePaths, ...pacsFilePaths];
      } else if (localFiles.length > 0) totalFilePaths = [localFilePaths];
      else totalFilePaths = [...pacsFilePaths];

      const data: DircopyData = {
        dir: totalFilePaths.join(","),
        title: `${workflowType}_analysis`,
      };

      const dircopyInstance: PluginInstance = yield client.createPluginInstance(
        dircopy.data.id,
        data
      );

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
