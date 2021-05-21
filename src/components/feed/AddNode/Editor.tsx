import React from "react";
import {
  TextArea,
  ExpandableSection,
  Title,
  Checkbox,
  Button,
} from "@patternfly/react-core";
import { connect } from "react-redux";
import { ApplicationState } from "../../../store/root/applicationState";
import { isEmpty } from "lodash";
import { ExclamationTriangleIcon } from "@patternfly/react-icons";
import { v4 } from "uuid";
import { InputType } from "./types";
import { EditorState, EditorProps } from "./types";
import {
  getRequiredParams,
  getAllParamsWithName,
  getRequiredParamsWithName,
  unpackParametersIntoString,
} from "./lib/utils";
import ReactJSON from "react-json-view";

type ParameterDictionary = {
  [key: string]: {
    [key: string]: string;
  };
};

const Editor = ({
  plugin,
  inputChangeFromEditor,
  params,
  dropdownInput,
  requiredInput,
}: EditorProps) => {
  const [editorState, setEditorState] = React.useState<EditorState>({
    value: "",
    docsExpanded: false,
    errors: [],
    readOnly: true,
    dictionary: {},
  });

  const { docsExpanded, errors, readOnly, dictionary } = editorState;

  React.useEffect(() => {
    let derivedValue = "";
    console.log("RequiredInput, dropdownInput", requiredInput, dropdownInput);

    if (requiredInput) {
      derivedValue += unpackParametersIntoString(requiredInput);
    }

    if (dropdownInput) {
      derivedValue += unpackParametersIntoString(dropdownInput);
    }

    setEditorState((state) => {
      return {
        ...state,
        value: derivedValue.trim(),
      };
    });
  }, [dropdownInput, requiredInput]);

  const handleInputChange = (value: string) => {
    handleRegex(value);
  };

  const handleDocsToggle = () => {
    setEditorState({
      ...editorState,
      docsExpanded: !editorState.docsExpanded,
    });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setEditorState({
      ...editorState,
      readOnly: checked,
    });
  };

  const handleGetTokens = (value: string) => {
    const userValue = value.trim();

    const lookupTable: {
      [key: string]: string;
    } = {};

    const dictionary: {
      [key: string]: string;
    } = {};

    let specialCharIndex = undefined;

    const flags = params && params.map((param) => param.data.flag);
    const values = userValue.split(" ");
    for (let i = 0; i < values.length; i++) {
      const currentValue = values[i];
      if (
        flags?.includes(currentValue) &&
        (currentValue.startsWith("--") || currentValue.startsWith("-")) &&
        !specialCharIndex
      ) {
        if (!lookupTable[currentValue]) {
          lookupTable[i] = currentValue;
          dictionary[currentValue] = "";
        }
      } else {
        const previousIndex = i > 0 ? i - 1 : i;
        if (specialCharIndex || specialCharIndex === 0) {
          const flag = lookupTable[specialCharIndex];
          if (flag) {
            dictionary[flag] += ` ${currentValue}`;
          }
        }

        // current value doesn't seem to be a flag
        // Check if previous index was a flag
        if (currentValue.startsWith("\\'") || currentValue === "\\'") {
          specialCharIndex = previousIndex;
        }

        if (currentValue.endsWith("\\'") || currentValue === "\\'") {
          specialCharIndex = undefined;
        }

        if (lookupTable[previousIndex]) {
          const flag = lookupTable[previousIndex];
          dictionary[flag] += currentValue;
        }
      }
    }

    setEditorState({
      ...editorState,
      value,
      dictionary,
    });
  };

  const handleRegex = (value: string) => {
    handleGetTokens(value);
  };

  return (
    <div className="configuration">
      <div className="configuration__options">
        <Title headingLevel="h1">{`Configure ${plugin?.data.name} v.${plugin?.data.version}`}</Title>
        <div className="editor">
          <TextArea
            aria-label="text"
            className="editor__text"
            resizeOrientation="vertical"
            onChange={handleInputChange}
            value={editorState.value}
            spellCheck={false}
            isReadOnly={readOnly}
          />
        </div>
        <div className="checkbox">
          <Checkbox
            id="read-only-toggle"
            label="Toggle Read Only Mode"
            aria-label="Toggle read-only mode"
            description="Deactivate the read-only mode to copy paste your parameters"
            onChange={handleCheckboxChange}
            isChecked={readOnly}
          />
        </div>

        <div className="errors">
          {errors.map((error, i) => (
            <div key={i}>
              <ExclamationTriangleIcon />
              <span className="error-message">{error}</span>
            </div>
          ))}
        </div>

        <div className="unpacking-dictionary">
          {Object.keys(dictionary).length > 0 && (
            <>
              <Title headingLevel="h4">Parsed Input:</Title>
              <ReactJSON
                name={false}
                displayDataTypes={false}
                src={dictionary}
                displayObjectSize={false}
                collapsed={false}
              />
              <Button onClick={() => console.log("Save input")}>Save</Button>
            </>
          )}
        </div>

        <ExpandableSection
          className="docs"
          toggleText="Plugin configuration documentation:"
          isExpanded={docsExpanded}
          onToggle={handleDocsToggle}
        >
          {params &&
            params
              .filter((param) => param.data.ui_exposed)
              .map((param) => {
                return (
                  <div key={param.data.id} className="param-item">
                    <b className="param-title">[{param.data.flag}]</b>
                    {!param.data.optional && (
                      <span className="required-star"> *</span>
                    )}
                    <div className="param-help">{param.data.help}</div>
                  </div>
                );
              })}
        </ExpandableSection>
      </div>
    </div>
  );
};

const mapStateToProps = ({ plugin }: ApplicationState) => ({
  params: plugin.parameters,
});

export default connect(mapStateToProps, null)(Editor);
