import React from "react";
import { Spin } from "antd";
import "./loadingcontent.scss";

interface LoadingContentProps {
  width?: string;
  height?: string;
  top?: string;
  left?: string;
  bottom?: string;
  right?: string;
  className?: string;
  type?: string;
}

export const LoadingContent = ({
  width,
  height,
  top,
  left,
  bottom,
  right,
}: LoadingContentProps): React.ReactElement => {
  const computedStyle = {
    width: width,
    height: height,
    marginTop: top,
    marginLeft: left,
    marginBottom: bottom,
    marginRight: right,
    backgroundColor: "rgba(3, 3, 3, 0.62)",
  };

  return <div className={`loading-content`} style={computedStyle} />;
};

LoadingContent.defaultProps = {
  top: "0",
  left: "0",
  bottom: "0",
  right: "0",
  className: "",
  type: "",
};

export const SpinContainer = ({
  title,
  background = "inherit",
  fontColor,
}: {
  title: string;
  background?: string;
  fontColor?: string;
}) => {
  return (
    <div
      style={{
        background,
      }}
      className="example"
    >
      <Spin style={{ color: fontColor }} tip={title} />
    </div>
  );
};
