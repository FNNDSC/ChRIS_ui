import React, { useState } from "react";
import { Niivue } from "@niivue/niivue";
import {
  NiivueCanvasProps,
  NiivueCanvas,
} from "niivue-react/src/NiivueCanvas.tsx";
import styles from "./index.module.css";
import { useTypedSelector } from "../../store/hooks.ts";
import ChrisAPIClient from "../../api/chrisapiclient.ts";

/**
 * Type emitted by Niivue.onLocationChange
 *
 * https://github.com/niivue/niivue/issues/860
 */
type CrosshairLocation = {
  string: string;
};

type SizedNiivueCanvasProps = NiivueCanvasProps & {
  size?: number;
  isScaling?: boolean;
  onLocationChange?: (location: CrosshairLocation) => void;
};

/**
 * A wrapper for `NiivueCanvas` including some workarounds for sizing-related
 * features. The `textHeight` option of `Niivue` is calculated based on
 * `baseTextHeight`, `size`, and `isScaling`.
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
 *
 * ## Other Workarounds
 *
 * Some workarounds for these bugs are included:
 *
 * - https://github.com/niivue/niivue/issues/861
 *   Canvas does not resize when parent is resized (the Niivue canvas gets
 *   smushed when the sidebar is toggled)
 * - https://github.com/niivue/niivue/issues/862
 *   Canvas height irreversibly grows in size when window is resized
 */
const SizedNiivueCanvas: React.FC<SizedNiivueCanvasProps> = ({
  size,
  isScaling,
  options,
  onStart,
  onLocationChange,
  volumes,
  ...props
}) => {
  const [[canvasWidth, canvasHeight], setCanvasDimensions] = useState<
    [number, number]
  >([400, 400]);

  const baseTextHeight = isScaling
    ? 0.06
    : textHeightModel(canvasWidth, canvasHeight);
  const textHeight = ((size || 10) / 10) * baseTextHeight;
  const fullOptions = options ? { ...options, textHeight } : { textHeight };

  const fullOnStart = (nv: Niivue) => {
    if (onLocationChange) {
      nv.onLocationChange = (location) =>
        onLocationChange(location as CrosshairLocation);
    }

    // Override nv.resizeListener, which updates the canvas' width and height.
    const superResizeListener = nv.resizeListener.bind(nv);
    const canvas = nv.canvas as HTMLCanvasElement;
    const updateCanvasDimensions = () => {
      const devicePixelRatio = nv.uiData.dpr as number;
      setCanvasDimensions([
        canvas.width / devicePixelRatio,
        canvas.height / devicePixelRatio,
      ]);
    };
    nv.resizeListener = function () {
      superResizeListener();
      updateCanvasDimensions();
    };
    updateCanvasDimensions();

    // workaround for https://github.com/niivue/niivue/issues/861
    // nv.resizeListener() needs to be called after parent element is resized
    const badlyResizeCanvasEveryHalfSecond = () => {
      setTimeout(() => {
        nv.resizeListener();
        badlyResizeCanvasEveryHalfSecond();
      }, 500);
    };
    badlyResizeCanvasEveryHalfSecond();
  };

  const isLoggedIn = useTypedSelector(({ user }) => user.isLoggedIn);
  const client = ChrisAPIClient.getClient();
  let authedVolumes =
    isLoggedIn && volumes !== undefined
      ? volumes.map((v) => {
          return {
            ...v,
            headers: {
              Authorization: `Token ${client.auth.token}`,
            },
          };
        })
      : volumes;

  return (
    <div className={styles.niivueContainer}>
      <NiivueCanvas
        {...props}
        volumes={authedVolumes}
        onStart={fullOnStart}
        options={fullOptions}
      />
    </div>
  );
};

/**
 * A piecewise linear function which produces a value for `textHeight` that
 * results in Niivue drawing its font size to be approximately the same as
 * web default font size.
 */
function textHeightModel(canvasWidth: number, canvasHeight: number): number {
  const shortestDimension = Math.min(canvasWidth, canvasHeight);
  if (shortestDimension < 400) {
    return 0.05;
  }
  if (shortestDimension < 800) {
    return -5e-5 * shortestDimension + 0.07;
  }
  if (shortestDimension < 1600) {
    return -1.25e-5 * shortestDimension + 0.04;
  }
  return 0.02;
}

export type { CrosshairLocation };
export default SizedNiivueCanvas;
