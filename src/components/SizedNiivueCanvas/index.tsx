import { Niivue, NVImageFromUrlOptions, SLICE_TYPE } from "@niivue/niivue";
import { useEffect, useRef, useState } from "react";
import { getToken } from "../../api/api.ts";
import { useAppSelector } from "../../store/hooks.ts";
import {
  type ColorMap,
  type CrosshairLocation,
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

type Props = {
  size?: number;
  isScaling?: boolean;
  onLocationChange?: (location: CrosshairLocation) => void;
  urls?: string[];
  colormap?: string;
  calMin?: number;
  calMax?: number;
  colormapLabel?: ColorMap | null;

  sliceType?: SliceType;

  isRadiologistView?: boolean;

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
    colormapLabel,
    sliceType: propsSliceType,
    isRadiologistView,
    isHide,
  } = props;
  const sliceType = propsSliceType || SliceType.Multiplanar;

  // react useRef, useState, useSelector
  const glRef = useRef<HTMLCanvasElement>(null);
  const [theNiivue, setTheNiivue] = useState<Niivue | null>(null);

  const [[canvasWidth, canvasHeight], setCanvasDimensions] = useState<
    [number, number]
  >([400, 400]);

  const isLoggedIn = useAppSelector(({ user }) => user.isLoggedIn);

  // useEffect
  // biome-ignore lint/correctness/useExhaustiveDependencies: no need for the onLocationChange
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

    const nv = new Niivue({
      backColor: [0, 0, 0, 0],
      isColorbar: true,
      crosshairWidth: 1,
      isRadiologicalConvention: isRadiologistView,
      sliceType: SLICE_TYPE_MAP[sliceType],
    });
    nv.attachToCanvas(glRef.current);
    if (onLocationChange) {
      nv.onLocationChange = (location) => {
        // console.info("SizedNiivueCanvas: location:", location);
        // onLocationChange(location as CrosshairLocation);
      };
    }
    setTheNiivue(nv);
  }, [theNiivue, isHide]);

  useEffect(() => {
    if (!theNiivue) {
      return;
    }
    theNiivue.setSliceType(SLICE_TYPE_MAP[sliceType]);
  }, [theNiivue, sliceType]);

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
        colormapLabel, // colormapLabel
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
