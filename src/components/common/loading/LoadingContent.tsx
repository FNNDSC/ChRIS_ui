import React from 'react';
import './loadingcontent.scss';

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


const LoadingContent = ({
    width, height, top, left, bottom, right, className, type
}:LoadingContentProps): React.ReactElement => {
  const computedStyle = {
    width: width,
    height: height,
    marginTop: top,
    marginLeft: left,
    marginBottom: bottom,
    marginRight: right,
  };

  let addedClasses = className;
  switch (type) {
    case 'white':
      addedClasses += ' white';
      break;
    default:
  }

  return (
    <div
      className={`loading-content ${addedClasses}`}
      style={computedStyle}
    />
  );
};

LoadingContent.defaultProps = {
  top: "0",
  left: "0",
  bottom: "0",
  right: "0",
  className: "",
  type: "",
};

export default LoadingContent;
