import React from "react";
import { ChNVROptions } from "./models.ts";
import { Updater } from "use-immer";

import styles from "./HeaderOptionBar.module.css";
import DragModeDropdown from "./DragModeDropdown.tsx";

type HeaderOptionsBarProps = {
  options: ChNVROptions;
  setOptions: Updater<ChNVROptions>;
}

const HeaderOptionBar: React.FC<HeaderOptionsBarProps> = ({options, setOptions}) => {

  const toggleRadiologicalConvention = () => setOptions((draft) => {
    draft.isRadiologicalConvention = !options.isRadiologicalConvention;
  });

  return (
    <div className={styles.headerOptionsBar}>
      <div className={styles.headerOption}>
        <div className={styles.headerOptionDescription}>Convention</div>
        <div className={styles.headerOptionWidget}>
          <button onClick={toggleRadiologicalConvention} className={styles.conventionButton}>
            {options.isRadiologicalConvention ? "Radiological" : "Neurological"}
          </button>
        </div>
      </div>
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
    </div>
  );
};

export default HeaderOptionBar;
