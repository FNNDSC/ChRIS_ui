import React from "react";
import matchAll from "string.prototype.matchall";
import { PluginParameter } from "@fnndsc/chrisapi";

/* NOTE: The string parsing is done "outside" of react 
   (not using state, etc.) to enable selection restoration 
  */

function parseHtml(
  paramString: string,
  params: PluginParameter[]
): [string, string[]] {
  // locates flag/value pairs
  const tokenRegex = /([^\s=]+)(?:(?:=|\s+|[^--])([^ --]+))?/g;

  const tokens = [...matchAll(paramString, tokenRegex)];
  const errors = [];
  let str = paramString;
  let offset = 0;

  for (const token of tokens) {
    const [_, flag, value] = token;
    const paramName = flag.replace(/-/g, "");
    const validParam = params.find(param => param.data.flag.startsWith(flag));
    if (!validParam) {
      str = `${str.substring(0, token.index + offset)}<span class="warning">${
        token[0]
      }</span>${str.substring(token.index + offset + token[0].length)}`;
      offset += `<span class="warning"></span>`.length;
      errors.push(`'${paramName}' is not a valid parameter name.`);
    } else if (validParam.data.type === "path") {
      const dirRegex = /^\.?\/?(\/[\w-]+)*\/?$/;

      // TODO: Currently this only checks if it is a syntactically valid path
      // It should also check that the path exists in the parent plugins output dir

      if (value && value.match(dirRegex) === null) {
        str = `${str.substring(
          0,
          token.index + offset + flag.length + 1
        )}<span class="warning">${value}</span>${str.substring(
          token.index + offset + flag.length + value.length + 1
        )}`; // the one is for the space or equals sign
        offset += '<span class="warning"></span>'.length;
        errors.push(
          `The value provided for '${paramName}' is not a valid path.`
        );
      }
    }
  }

  return [str, errors];
}

interface Selection {
  start: number;
  end: number;
}

function saveSelection(containerEl: Node) {
  const sel = window.getSelection();
  if (!sel) return { start: 0, end: 0 };
  const range = sel.getRangeAt(0);
  const preSelectionRange = range.cloneRange();
  preSelectionRange.selectNodeContents(containerEl);
  preSelectionRange.setEnd(range.startContainer, range.startOffset);
  const start = preSelectionRange.toString().length;

  return {
    start: start,
    end: start + range.toString().length
  };
}

function restoreSelection(containerEl: any, savedSel: Selection) {
  let charIndex = 0;
  const range = document.createRange();
  range.setStart(containerEl, 0);
  range.collapse(true);
  const nodeStack = [containerEl];
  let node;
  let foundStart = false;
  let stop = false;

  while (!stop && (node = nodeStack.pop())) {
    if (node.nodeType == 3) {
      let nextCharIndex = charIndex + node.length;
      if (
        !foundStart &&
        savedSel.start >= charIndex &&
        savedSel.start <= nextCharIndex
      ) {
        range.setStart(node, savedSel.start - charIndex);
        foundStart = true;
      }
      if (
        foundStart &&
        savedSel.end >= charIndex &&
        savedSel.end <= nextCharIndex
      ) {
        range.setEnd(node, savedSel.end - charIndex);
        stop = true;
      }
      charIndex = nextCharIndex;
    } else {
      let i = node.childNodes.length;
      while (i--) {
        nodeStack.push(node.childNodes[i]);
      }
    }
  }

  const sel = window.getSelection();
  if (sel) {
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

interface ParameterEditorProps {
  initialParamString: string;
  params: PluginParameter[];
  handleErrorChange: (error: string[]) => void;
}

class ParameterEditor extends React.Component<ParameterEditorProps> {
  constructor(props: ParameterEditorProps) {
    super(props);

    this.handleInput = this.handleInput.bind(this);
  }

  handleInput(e: React.FormEvent<HTMLDivElement>) {
    const { target } = e;
    const editor = target as HTMLDivElement;
    const transformedHtml = editor.innerHTML
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ");

    const [html, errors] = parseHtml(transformedHtml, this.props.params);
    const saved = saveSelection(editor);
    editor.innerHTML = html.replace(/ (?![^<]*>)/g, "&nbsp"); // replace all spaces except those in tags
    restoreSelection(target, saved);

    this.props.handleErrorChange(errors);
  }

  render() {
    const { initialParamString } = this.props;

    return (
      <div
        contentEditable
        spellCheck={false}
        onInput={this.handleInput}
        dangerouslySetInnerHTML={{ __html: initialParamString }}
      />
    );
  }
}

export default ParameterEditor;
