import React from "react";
import { Spin, Alert } from "antd";

const SpinAlert = ({ browserType }: { browserType: string }) => (
    <Spin tip="Loading...">
      <Alert
        message={`Fetching ${browserType} files`}
        description="Please wait"
        type="info"
      />
    </Spin>
  );

export default SpinAlert;
