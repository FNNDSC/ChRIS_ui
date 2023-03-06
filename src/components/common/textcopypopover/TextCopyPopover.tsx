import React from "react";
import {
  Popover,
  TextArea,
  ClipboardCopy,
  ClipboardCopyButton,
} from "@patternfly/react-core";
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

export const TextCopyPopover: React.FC<TextCopyPopoverProps> = ({
  text,
  children,
  className,
  headerContent,
  maxWidth,
}) => {
  const mergeClassNames = (...names: (string | undefined)[]) => {
    return names.join(" ");
  };

  const rows = text ? text.split(`\n`).length : 0;
  const body = (
    <>
      <TextArea value={text} rows={rows} aria-label="full-path" />
      <ClipboardCopy>{text}</ClipboardCopy>
    </>
  );
  return (
    <Popover
      headerContent={headerContent}
      bodyContent={body}
      className={mergeClassNames(`text-copy-popover`, className)}
      enableFlip={true}
      minWidth={maxWidth}
      position="bottom"
    >
      {children as React.ReactElement<any>}
    </Popover>
  );
};

export const ClipboardCopyContainer = ({ path }: { path: string }) => {
  const [copied, setCopied] = React.useState(false);

  const clipboardCopyFunc2 = (
    _event: React.ClipboardEvent<HTMLDivElement>,
    text: string
  ) => {
    if (typeof navigator.clipboard == "undefined") {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      new Promise((res, rej) => {
        document.execCommand("copy") ? res("successful") : rej();
      });
      document.body.removeChild(textArea);
    }
    navigator.clipboard.writeText(text);
  };

  return (
    <ClipboardCopyButton
      onClick={(event: any) => {
        setCopied(true);
        clipboardCopyFunc2(event, path);
      }}
      onTooltipHidden={() => setCopied(false)}
      id="clipboard-plugininstance-files"
      textId="clipboard-plugininstance-files"
      variant="plain"
    >
      {copied ? "Copied!" : "Copy path to clipboard"}
    </ClipboardCopyButton>
  );
};
