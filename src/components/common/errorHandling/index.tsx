import React from "react";
import ReactJson from "react-json-view";
import { Alert } from "antd";

interface LoadingErrorAlertProps {
  error: any;
  handleClose?: () => void;
}

export const LoadingErrorAlert: React.FC<LoadingErrorAlertProps> = (
  props: LoadingErrorAlertProps
) => {
  const { error } = props;

  const title = (
    <ReactJson
      quotesOnKeys={false}
      displayDataTypes={false}
      displayObjectSize={false}
      name={false}
      src={error}
    />
  );

  return (
    <Alert
      className="loading-error-alert"
      type="error"
      message={title}
      showIcon
    />
  );
};
