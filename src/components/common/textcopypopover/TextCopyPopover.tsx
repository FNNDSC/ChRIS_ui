import React from "react";
import { Popover, TextArea, ClipboardCopy } from "@patternfly/react-core";
import { BasePlacement } from "tippy.js";

import "./textcopypopover.scss";


interface TextCopyPopoverProps {
  text: string;
  headerContent: JSX.Element | string;
  isVisible?: boolean;
  position?: BasePlacement;
  subheaderContent?: string;
  rows?: number;
  tabIndex?: number;
  className?: string;
  shouldClose?: () => void;
  onMouseDown?: (event: React.MouseEvent) => void;
  onBlur?: (event: React.FocusEvent) => void;
  maxWidth?: string;
  children?: JSX.Element;
}

const TextCopyPopover:React.FC<TextCopyPopoverProps>=({
  text,
  children,
  className,
  headerContent,
  maxWidth
})=>{

  const mergeClassNames=(...names:(string|undefined)[])=>names.join(" ")
  

  const rows= text ? text.split(`\n`).length : 0
  const body = (
    <>
      <TextArea value={text} rows={rows} aria-label="full-path" />
      <ClipboardCopy>{text}</ClipboardCopy>
    </>
  );
  return(
    <Popover
    headerContent={headerContent}
    bodyContent={body}
    className={
      mergeClassNames(`text-copy-popover`, className)
    }
    enableFlip
    minWidth={maxWidth}
    position='bottom'
    >
      {children as React.ReactElement<any>}
    </Popover>
  )
}


export default TextCopyPopover;