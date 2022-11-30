import React from "react";
import dwv from "dwv";
import { useTypedSelector } from "../../../../store/hooks";

import ChrisAPIClient from "../../../../api/chrisapiclient";

// Image decoders (for web workers)
dwv.image.decoderScripts = {
  jpeg2000: `${process.env.PUBLIC_URL}/assets/dwv/decoders/pdfjs/decode-jpeg2000.js`,
  "jpeg-lossless": `${process.env.PUBLIC_URL}/assets/dwv/decoders/rii-mango/decode-jpegloss.js`,
  "jpeg-baseline": `${process.env.PUBLIC_URL}/assets/dwv/decoders/pdfjs/decode-jpegbaseline.js`,
  rle: `${process.env.PUBLIC_URL}/assets/dwv/decoders/dwv/decode-rle.js`,
};

function getDwvState() {
  return {
    tools: {
      Scroll: {},
      ZoomAndPan: {},
      WindowLevel: {},
      Draw: {
        options: ["Ruler"],
        type: "factory",
        events: ["drawcreate", "drawchange", "drawmove", "drawdelete"],
      },
    },
    toolNames: [],
    selectedTool: "Select Tool",
    loadProgress: 0,
    dataLoaded: false,
    dwvApp: null,
    metaData: [],
    showDicomTags: false,
    toolMenuAnchorEl: null,
    dropboxDivId: "dropBox",
    dropboxClassName: "dropBox",
    borderClassName: "dropBoxBorder",
    hoverClassName: "hover",
  };
}

const DicomViewerContainer = () => {
  const [dwvState, setDwvState] = React.useState(getDwvState);
  const files = useTypedSelector((state) => state.explorer.selectedFolder);
  const divRef = React.useRef(null);

  const loadImagesIntoDwv = React.useCallback(async () => {
    if (divRef.current) {
      const client = ChrisAPIClient.getClient();

      const headerObj = [
        {
          name: "Authorization",
          value: "Token " + client.auth.token,
        },
      ];

      const app = new dwv.App();

      app.init({
        dataViewConfigs: { "*": [{ divId: "layerGroup0" }] },
        tools: dwvState.tools,
      });

      const fileLoader: any[] = [];

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          fileLoader.push(`${file.url}${file.data.fname}`);
        }
      }

      if (fileLoader.length > 0) {
        app.addEventListener("load", function () {
          app.setTool("Scroll");
          app.render(0);
        });

        app.loadURLs(fileLoader, {
          requestHeaders: headerObj,
        });
      }
    }
  }, []);

  React.useLayoutEffect(() => {
    loadImagesIntoDwv();
  }, []);

  return (
    <div id="dwv">
      <div ref={divRef} id="layerGroup0" className="layerGroup"></div>
    </div>
  );
};

export default DicomViewerContainer;
