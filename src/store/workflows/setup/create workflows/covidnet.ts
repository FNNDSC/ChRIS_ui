import GalleryModel from "../../../../api/models/gallery.model";
import { Med2ImgData, CovidnetData, PluginList } from "../../types";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import { PluginInstance } from "@fnndsc/chrisapi";
import { getPluginFiles } from "../../utils";
import { setYieldAnalysis } from "../../saga";

export function* runCovidnetWorkflow(
  dircopy: PluginInstance,
  pluginList: PluginList
) {
  const client = ChrisAPIClient.getClient();
  const files: any[] = yield getPluginFiles(dircopy);
  for (let i = 0; i < files.length; i++) {
    const inputFile = files[i].data.fname.split("/").pop();
    if (GalleryModel.isValidDcmFile(inputFile)) {
      const filename = inputFile.split(".")[0];
      const imgData: Med2ImgData = {
        inputFile,
        sliceToConvert: 0,
        previous_id: dircopy.data.id,
        outputFileStem: `${filename}.jpg`,
      };
      const med2img = pluginList["pl-med2img"];
      const med2imgInstance: PluginInstance = yield client.createPluginInstance(
        med2img.data.id,
        imgData
      );
      const covidnetData: CovidnetData = {
        previous_id: med2imgInstance.data.id,
        imagefile: `${filename}.jpg`,
      };
      const covidnet = pluginList["pl-covidnet"];
      const covidnetInstance: PluginInstance =
        yield client.createPluginInstance(covidnet.data.id, covidnetData);
      const pdfGeneration = pluginList["pl-covidnet-pdfgeneration"];
      const pdfGenerationData = {
        previous_id: covidnetInstance.data.id,
        imagefile: `${filename}.jpg`,
        patientId: 123456,
      };
      yield client.createPluginInstance(
        pdfGeneration.data.id,
        pdfGenerationData
      );
    }
  }

  yield setYieldAnalysis(3, "Created a Feed Tree", "finish", "");
  yield setYieldAnalysis(4, "Success", "finish", "");
}
