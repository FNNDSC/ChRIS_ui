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

  const fullOptions = React.useMemo(() => {
    // set textHeight.
    // Internal to niivue, the font size scales with the outer canvas size.
    // To undo this effect, we need to divide by the canvas' width or height.
    // See https://github.com/niivue/niivue/issues/857
    const multiplier = 2 / (isScaling ? Math.min(canvasWidth, canvasHeight) : 800);
    const textHeight = multiplier * (size || 10);
    return options ? { ...options, textHeight } : { textHeight };
  }, [options, size, isScaling, canvasWidth, canvasHeight]);

  const fullOnStart = (nv: Niivue) => {
    if (onLocationChange) {
      nv.onLocationChange = (location) =>
        onLocationChange(location as CrosshairLocation);
    }
  };

  const isLoggedIn = useTypedSelector(({ user }) => user.isLoggedIn);
  const client = ChrisAPIClient.getClient();
  const authedVolumes =
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

export type { CrosshairLocation };
export default SizedNiivueCanvas;
