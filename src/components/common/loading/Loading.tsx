import * as React from "react";
import styles from "./Loading.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


const LoadingComponent: React.FunctionComponent<any> = (props) => (
    <div className={styles.loading}>
      <FontAwesomeIcon icon="spinner" size="5x" pulse   />
    </div>
);

export default LoadingComponent;
