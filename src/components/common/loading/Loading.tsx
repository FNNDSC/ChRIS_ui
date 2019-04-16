import * as React from "react";
import styles from "./Loading.module.scss";
import {SizeProp} from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon} from "@fortawesome/react-fontawesome";

interface ILoadingProps {
  size?: SizeProp;
  isLocal?: boolean; // loading to local component
  color?: string;
}

const LoadingComponent: React.FunctionComponent<any> = (props: ILoadingProps) => {
  const size = !!props.size ? props.size : "5x";
  const color= !!props.size ? props.color : "black";
  return (
    <div className={`${!!props.isLocal ? styles.local : styles.loading }` }>
      <FontAwesomeIcon icon="spinner" size={size} color={color} pulse />
    </div>
  )

};

export default LoadingComponent;
