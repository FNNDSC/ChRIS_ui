import { Niivue, NVImageFromUrlOptions, SLICE_TYPE } from "@niivue/niivue";
import { useEffect, useRef, useState } from "react";
import { getToken } from "../../api/api.ts";
import { useAppSelector } from "../../store/hooks.ts";
import FreeSurferColorLUT from "../Preview/displays/FreesurferColorLUT.v7.4.1.json";
import BlackBody from "../Preview/displays/mipav/black_body.json";
import Cardiac from "../Preview/displays/mipav/cardiac.json";
import Flow from "../Preview/displays/mipav/flow.json";
import GEColor from "../Preview/displays/mipav/ge_color.json";
import GrayRainbow from "../Preview/displays/mipav/gray_rainbow.json";
import HotGreen from "../Preview/displays/mipav/hot_green.json";
import HotIron from "../Preview/displays/mipav/hot_iron.json";
import HotMetal from "../Preview/displays/mipav/hot_metal.json";
import Hue1 from "../Preview/displays/mipav/hue1.json";
import Hue2 from "../Preview/displays/mipav/hue2.json";
import IRed from "../Preview/displays/mipav/ired.json";
import NIHMIPAV from "../Preview/displays/mipav/nih.json";
import Rainbow from "../Preview/displays/mipav/rainbow.json";
import Rainbow2 from "../Preview/displays/mipav/rainbow2.json";
import Rainbow3 from "../Preview/displays/mipav/rainbow3.json";
import Ratio from "../Preview/displays/mipav/ratio.json";

import {
  type ColorMap,
  type CrosshairLocation,
  DisplayColorMap,
  SliceType,
} from "../Preview/displays/types.ts";
import styles from "./index.module.css";

/**
 * A wrapper for `NiivueCanvas` which accepts extra props `size` and `isScaling`
 * which come together to set the value of `textHeight.
 *
 * Also, `onLocationChange` is accepted as a prop.
 *
 * ## Relative or Absolute(-ish) decoration size scaling
 *
 * See https://github.com/niivue/niivue/issues/857
 *
 * If `isScaling` is true, the vanilla behavior of NiivueCanvas is used
 * where everything (colorbars, font size, line width) scale with the
 * dimensions of the canvas. In this mode, the size of everything tends
 * to look too big on desktop screens.
 *
 * If `isScaling` is false, then `textHeight` is calculated to be some
 * value which will in effect size things absolutely, i.e. the size of
 * colorbars, text font, and line width will stay roughly the same
 * regardless of canvas dimensions.
 *
 * The final value of `textHeight` will be multiplied by `size / 10`.
 * The units of `size` are arbitrary, though it is roughly calibrated to
 * the font `pt` size where `size=10` is about the same size as text size.
 */

const SLICE_TYPE_MAP = {
  [SliceType.Axial]: SLICE_TYPE.AXIAL,
  [SliceType.Coronal]: SLICE_TYPE.CORONAL,
  [SliceType.Sagittal]: SLICE_TYPE.SAGITTAL,
  [SliceType.Multiplanar]: SLICE_TYPE.MULTIPLANAR,
};

const _COLOR_MAP: { [key: string]: ColorMap } = {
  [DisplayColorMap.Freesurfer]: FreeSurferColorLUT,
  [DisplayColorMap.BlackBody]: BlackBody,
  [DisplayColorMap.Cardiac]: Cardiac,
  [DisplayColorMap.Flow]: Flow,
  [DisplayColorMap.GEColor]: GEColor,
  [DisplayColorMap.GrayRainbow]: GrayRainbow,
  [DisplayColorMap.HotGreen]: HotGreen,
  [DisplayColorMap.HotIron]: HotIron,
  [DisplayColorMap.HotMetal]: HotMetal,
  [DisplayColorMap.Hue1]: Hue1,
  [DisplayColorMap.Hue2]: Hue2,
  [DisplayColorMap.IRed]: IRed,
  [DisplayColorMap.NIH2]: NIHMIPAV,
  [DisplayColorMap.Rainbow]: Rainbow,
  [DisplayColorMap.Rainbow2]: Rainbow2,
  [DisplayColorMap.Rainbow3]: Rainbow3,
  [DisplayColorMap.Ratio]: Ratio,
};

type Props = {
  size?: number;
  isScaling?: boolean;
  onLocationChange?: (location: CrosshairLocation) => void;
  urls?: string[];
  colormap: string;
  calMin: number;
  calMax: number;

  sliceType?: SliceType;

  isRadiologistView: boolean;

  isHide?: boolean;
};

export default (props: Props) => {
  const {
    size,
    isScaling,
    onLocationChange,
    urls,
    colormap,
    calMin,
    calMax,
    sliceType: propsSliceType,
    isRadiologistView,
    isHide,
  } = props;
  const sliceType = propsSliceType || SliceType.Multiplanar;

  // react useRef, useState, useSelector
  const glRef = useRef<HTMLCanvasElement>(null);
  const [theNiivue, setTheNiivue] = useState<Niivue | null>(null);

  const [[canvasWidth, canvasHeight], setCanvasDimensions] = useState([
    400, 400,
  ]);

  const [volumeUrl, setVolumeUrl] = useState("");

  const isLoggedIn = useAppSelector(({ user }) => user.isLoggedIn);

  // useEffect
  useEffect(() => {
    if (isHide) {
      return;
    }
    if (!glRef.current) {
      return;
    }
    if (theNiivue) {
      return;
    }

    // https://github.com/niivue/niivue/blob/main/packages/niivue/src/nvdocument.ts#L115
    // type NVConfigOptions
    const nv = new Niivue({
      backColor: [0, 0, 0, 0],
      isColorbar: true,
      crosshairWidth: 1,
      isRadiologicalConvention: isRadiologistView,
      sliceType: SLICE_TYPE_MAP[sliceType],
      isNearestInterpolation: true,
    });
    nv.attachToCanvas(glRef.current);
    nv.onLocationChange = (location) => {
      console.info("SizedNiivueCanvas: location:", location);
      if (onLocationChange) {
        onLocationChange(location as CrosshairLocation);
      }
    };
    for (const key in _COLOR_MAP) {
      nv.addColormap(key, _COLOR_MAP[key]);
    }
    setTheNiivue(nv);
  }, [theNiivue, glRef.current, isHide]);

  useEffect(() => {
    if (!theNiivue) {
      return;
    }
    theNiivue.setSliceType(SLICE_TYPE_MAP[sliceType]);
  }, [theNiivue, sliceType]);

  useEffect(() => {
    if (!theNiivue) {
      return;
    }

    theNiivue.setRadiologicalConvention(isRadiologistView);
  }, [theNiivue, isRadiologistView]);

  useEffect(() => {
    if (!theNiivue) {
      return;
    }

    console.info(
      "SizedNiivueCanvas: updated colormap: volumes:",
      theNiivue.volumes.length,
    );
    if (!theNiivue.volumes.length) {
      return;
    }

    theNiivue.volumes[0].setColormap(colormap);
    theNiivue.volumes[0].cal_min = calMin;
    theNiivue.volumes[0].cal_max = calMax;

    console.info(
      "SizedNiivueCanvas: to refreshLayers: colormap:",
      colormap,
      "calMax:",
      calMax,
      "volumes[0].cal_max:",
      theNiivue.volumes[0].cal_max,
      "calMin:",
      calMin,
      "volumes[0].cal_min:",
      theNiivue.volumes[0].cal_min,
      "volumes:",
      theNiivue.volumes[0],
    );

    theNiivue.refreshLayers(theNiivue.volumes[0], 0);
    theNiivue.refreshDrawing(true);
  }, [theNiivue, calMin, calMax, colormap]);

  useEffect(() => {
    if (isHide) {
      return;
    }
    if (!theNiivue) {
      return;
    }

    if (!urls?.length) {
      return;
    }

    if (urls[0] === volumeUrl) {
      return;
    }

    // XXX TODO: multiple volumes (labelling)
    const volumes = urls.map((url) =>
      NVImageFromUrlOptions(
        url, // url
        undefined, // urlImageData
        undefined, // name
        colormap, // colormap
        undefined, // opacity
        calMin, // cal_min
        calMax, // cal_max
        undefined, // trustCalMinMax
        undefined, // percentileFrac
        true, // ignoreZeroVoxels
        undefined, // useQFormNotSForm
        undefined, // colormapNegative
        undefined, // frame4D
        undefined, // imageType
        undefined, // cal_minNeg
        undefined, // cal_maxNeg
        true, // colorbarVisible
        undefined, // alphaThreshold
      ),
    );

    console.info("SizedNiivueCanvas: volumes:", volumes);

    const token = getToken();
    const authedVolumes = !isLoggedIn
      ? volumes
      : volumes.map((v) => {
          return {
            ...v,
            headers: {
              Authorization: `Token ${token}`,
            },
          };
        });

    setVolumeUrl(urls[0]);
    (async () => {
      await theNiivue.loadVolumes(authedVolumes);
      console.info("after theNiivue.loadVolumes:", theNiivue.volumes.length);
    })();
  }, [theNiivue, urls, isLoggedIn, isHide]);

  /*
  const fullOptions = React.useMemo(() => {
    // set textHeight.
    // Internal to niivue, the font size scales with the outer canvas size.
    // To undo this effect, we need to divide by the canvas' width or height.
    // See https://github.com/niivue/niivue/issues/857
    const multiplier =
      2 / (isScaling ? Math.min(canvasWidth, canvasHeight) : 800);
    const textHeight = multiplier * (size || 10);
    return options ? { ...options, textHeight } : { textHeight };
  }, [options, size, isScaling, canvasWidth, canvasHeight]);
  */

  return (
    <div className={styles.niivueContainer}>
      <canvas ref={glRef} height={canvasWidth} width={canvasHeight} />
    </div>
  );
};
