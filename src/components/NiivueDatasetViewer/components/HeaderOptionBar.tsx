import React from "react";
import { ChNVROptions } from "../models";
import { Updater } from "use-immer";

import styles from "./HeaderOptionBar.module.css";
import DragModeDropdown from "./DragModeDropdown";
import SliceTypeButton from "./SliceTypeButton";

type HeaderOptionsBarProps = {
  options: ChNVROptions;
  setOptions: Updater<ChNVROptions>;
};

const HeaderOptionBar: React.FC<HeaderOptionsBarProps> = ({
  options,
  setOptions,
}) => {
  return (
    <div className={styles.headerOptionsBar}>
      <div className={styles.headerOption}>
        <div className={styles.headerOptionDescription}>Right-click drag</div>
        <div className={styles.headerOptionWidget}>
          <div className={styles.dragmodeDropdown}>
            <DragModeDropdown
              selectedMode={options.dragMode}
              onSelect={(dragMode) => {
                setOptions((draft) => {
                  draft.dragMode = dragMode;
                });
              }}
            />
          </div>
        </div>
      </div>
      <div className={styles.headerOption}>
        <SliceTypeButton
          selectedSliceType={[
            options.sliceType,
            options.multiplanarForceRender,
          ]}
          onSelect={(sliceType, multiplanarForceRender) =>
            setOptions((draft) => {
              draft.sliceType = sliceType;
              draft.multiplanarForceRender = multiplanarForceRender;
            })
          }
        />
      </div>
    </div>
  );
};

export default HeaderOptionBar;
