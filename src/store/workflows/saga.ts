import { all, fork, takeEvery, put } from "@redux-saga/core/effects";
import { WorkflowTypes, AnalysisStep } from "./types";
import { getPacsFilesSuccess, setAnalysisStep } from "./actions";
import ChrisApiClient from "../../api/chrisapiclient";
import { IActionTypeParam } from "../../api/models/base.model";
import {
  PluginInstanceList,
  PluginInstance,
  IPluginCreateData,
  Feed,
  Note,
} from "@fnndsc/chrisapi";

interface DircopyData extends IPluginCreateData {
  dir: string;
}

interface Med2ImgData extends IPluginCreateData {
  inputFile: any;
  sliceToConvert: number;
  outputFileStem: string;
}

interface CovidnetData extends IPluginCreateData {
  imagefile: string;
}

function* handleGetPacsFilesRequest() {
  const client = ChrisApiClient.getClient();
  try {
    //@ts-ignore
    const fileList = yield client.getPACSFiles();
    const files = fileList.getItems();
    yield put(getPacsFilesSuccess(files));
  } catch (error) {
    console.error(error);
  }
}

function* handleSubmitAnalysis(action: IActionTypeParam) {
  const client = ChrisApiClient.getClient();
  const pacsFile = action.payload;

  try {
    const dircopyList: PluginInstanceList = yield client.getPlugins({
      name_exact: "pl-dircopy",
    });
    const dircopy = dircopyList.getItems()[0];

    const med2imgList: PluginInstanceList = yield client.getPlugins({
      name_exact: "pl-med2img",
    });

    const med2Img = med2imgList.getItems()[0];
    const covidnetList: PluginInstanceList = yield client.getPlugins({
      name_exact: "pl-covidnet",
    });
    const covidnet = covidnetList.getItems()[0];
    if (dircopy && med2Img && covidnet) {
      const payload: AnalysisStep = {
        id: 1,
        title: "Plugin Registration Check",
        status: "finish",
        description: "Check completed",
      };
      yield put(setAnalysisStep(payload));
      const data: DircopyData = { dir: pacsFile.data.fname };
      const dircopyInstance: PluginInstance = yield client.createPluginInstance(
        dircopy.data.id,
        data
      );
      const feed: Feed = yield dircopyInstance.getFeed();
      console.log("Feed", feed);
      const note: Note = yield feed.getNote();
      yield note?.put({
        title: `Description`,
        content: `Analysis run on ${pacsFile.data.PatientID}`,
      });
      yield feed.put({
        name: `Analysis run on ${pacsFile.data.PatientID}`,
      });
      if (feed) {
        const payload: AnalysisStep = {
          id: 2,
          title: "Feed Created",
          status: "finish",
          description: "Check Completed",
        };
        yield put(setAnalysisStep(payload));
        const inputFile = pacsFile.data.fname.split("/").pop();
        const fileName = pacsFile.data.fname.split("/").pop()?.split(".")[0];
        const imgData: Med2ImgData = {
          inputFile,
          sliceToConvert: 0,
          outputFileStem: `${fileName}.jpg`,
          previous_id: `${dircopyInstance.data.id}`,
        };
        const med2ImgInstance: PluginInstance =
          yield client.createPluginInstance(med2Img.data.id, imgData);
        if (med2ImgInstance) {
          const payload: AnalysisStep = {
            id: 3,
            title: "Med2Img Created",
            status: "finish",
            description: "Check Completed",
          };
          yield put(setAnalysisStep(payload));

          const covidnetData: CovidnetData = {
            previous_id: `${med2ImgInstance.data.id}`,
            title: pacsFile.data.fname,
            imagefile: `${fileName}.jpg`,
          };
          const covidnetInstance: PluginInstance =
            yield client.createPluginInstance(covidnet.data.id, covidnetData);

          if (covidnetInstance) {
            const payload: AnalysisStep = {
              id: 4,
              title: "Covidnet created",
              status: "finish",
              description: "Check Completed",
            };
            yield put(setAnalysisStep(payload));
          }
        }
      }
    }
  } catch (error) {
    console.error(error);
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
