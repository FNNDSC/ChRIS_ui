import React from 'react';

import { Popover, TextArea } from '@patternfly/react-core-updated';
import { CopyIcon } from '@patternfly/react-icons';
import { Instance, BasicPlacement } from 'tippy.js';

import './textcopypopover.scss';

interface TextCopyPopoverProps {
  text: string,
  headerContent: JSX.Element | string,
  isVisible?: boolean,
  position?: BasicPlacement,
  subheaderContent?: string,

  tabIndex?: number,
  className?: string
  shouldClose?: (instance: Instance) => void,
  onMouseDown?: (event: React.MouseEvent) => void,
  onBlur?: (event: React.FocusEvent) => void,
  maxWidth?: string,
}

interface TextCopyPopoverState {
  copied: boolean
}

class TextCopyPopover extends React.Component<TextCopyPopoverProps, TextCopyPopoverState> {

  copiedTimerId?: number;

  constructor(props: TextCopyPopoverProps) {
    super(props);
    this.state = { 
      copied: false,
    };

    this.handleCopyClick = this.handleCopyClick.bind(this);
  }

  componentWillUnmount() {
    if (this.copiedTimerId) {
      window.clearTimeout(this.copiedTimerId);
    }
  }

  handleCopyClick(e: React.MouseEvent) {
    e.preventDefault();
    const button = e.target as HTMLElement;
    const input = document.createElement('input');
    input.value = this.props.text;
    button.appendChild(input);
    input.focus();
    input.select();
    document.execCommand('copy');
    button.focus();
    button.removeChild(input);
    this.setState({ copied: true });
    this.copiedTimerId = window.setTimeout(() => {
      this.setState({ copied: false });
    }, 5000);
  }
  
  mergeClassnames(...names: (string | undefined)[]) {
    return names.join(' ');
  }

  render() {

    const { text, children, subheaderContent, className, ...props } = this.props;

    const body = (
      <React.Fragment>
        { subheaderContent }
        <TextArea
          value={text}
          spellCheck={false}
          aria-label="full-path"
        />
        <a href="#" tabIndex={0} onClick={this.handleCopyClick}>
          <CopyIcon />
          {
            this.state.copied ?
              'Text copied' :
              'Copy text'
          }
        </a>
      </React.Fragment>
    )

    return (
      <Popover
        bodyContent={body}
        className={this.mergeClassnames('text-copy-popover', className)}
        {...props}
      >
        { children as React.ReactElement<any> }
      </Popover >
    );
  }
}

export default TextCopyPopover;