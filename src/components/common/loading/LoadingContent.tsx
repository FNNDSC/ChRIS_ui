import React from 'react';
import './loadingcontent.scss';

interface LoadingContentProps {
    className?: string;
    type?: string;
    width: string;
    height: string;
    top?: string;
    left?: string;
    bottom?: string;
    right?: string;
}

/*
  Rectangular placeholder for loading content blocks
  Originally created by @jdtzmn for ChRIS_store_ui
*/
const LoadingContent: React.FunctionComponent<LoadingContentProps> = ({
    width, height, top, left, bottom, right, className, type
}) => {
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
  className: '',
  type: '',
  top: '0',
  left: '0',
  bottom: '0',
  right: '0',
};

export default LoadingContent;
