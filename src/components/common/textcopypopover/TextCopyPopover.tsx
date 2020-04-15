import React from "react";

import { Popover, TextArea, ClipboardCopy } from "@patternfly/react-core";
import { Instance, BasePlacement } from "tippy.js";

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
  shouldClose?: (instance: Instance) => void;
  onMouseDown?: (event: React.MouseEvent) => void;
  onBlur?: (event: React.FocusEvent) => void;
  maxWidth?: string;
}

class TextCopyPopover extends React.Component<TextCopyPopoverProps> {
  // eslint-disable-next-line
  constructor(props: TextCopyPopoverProps) {
    super(props);
  }

  mergeClassnames(...names: (string | undefined)[]) {
    return names.join(" ");
  }

  render() {
    const {
      text,
      children,
      subheaderContent,
      className,
      rows,
      ...props
    } = this.props;

    const body = (
      <React.Fragment>
        {subheaderContent}

        <TextArea value={text} rows={rows} aria-label="full-path" />
        <ClipboardCopy>{text}</ClipboardCopy>
      </React.Fragment>
    );

    return (
      <Popover
        bodyContent={body}
        className={this.mergeClassnames("text-copy-popover", className)}
        {...props}
      >
        {children as React.ReactElement<any>}
      </Popover>
    );
  }
}

export default TextCopyPopover;
