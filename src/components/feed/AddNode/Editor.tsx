import React from "react";
import {
  TextArea,
  ExpandableSection,
  Title,
  Checkbox,
} from "@patternfly/react-core";
import { connect } from "react-redux";
import { ApplicationState } from "../../../store/root/applicationState";
import { ExclamationTriangleIcon } from "@patternfly/react-icons";
import { EditorState, EditorProps } from "./types";
import { unpackParametersIntoString } from "./lib/utils";


const Editor = ({
  plugin,
  params,
  dropdownInput,
  requiredInput,
  setEditorValue,
}: EditorProps) => {
  const [editorState, setEditorState] = React.useState<EditorState>({
    value: "",
    docsExpanded: true,
    errors: [],
    readOnly: true,
    dictionary: {},
    savingValues: false,
  });

  const { docsExpanded, errors, readOnly } = editorState;

  React.useEffect(() => {
    let derivedValue = "";

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
    setEditorValue(value);
    setEditorState({
      ...editorState,
      value,
    });
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
