import React from 'react';
import {
  TextArea,
  ExpandableSection,
  Label,
  Title,
} from "@patternfly/react-core";
import { connect } from "react-redux";
import { ApplicationState } from "../../../store/root/applicationState";
import { isEmpty } from "lodash";
import { ExclamationTriangleIcon } from "@patternfly/react-icons";
import { InputType } from "./types";
import { EditorState, EditorProps } from "./types";
import {
  getRequiredParams,
  getAllParamsWithName,
  getRequiredParamsWithName,
} from "./lib/utils";
import { v4 } from 'uuid';




type ParameterDictionary = {
  [key: string]: {
    [key: string]: string;
  };
};

const Editor=({plugin, dropdownInput, requiredInput, inputChangeFromEditor,
  params}:EditorProps)=>{
 const [editorState, setEditorState] = React.useState<EditorState>({
   value: "",
   docsExpanded: true,
   errors: [],
 });

 const {value, docsExpanded, errors } = editorState;


const generateCommand = React.useCallback(
  (plugin) => {
    const generatedCommand = `${plugin.data.name}: `;
    setEditorState((editorState)=>{
      return {
        ...editorState,
        value:generatedCommand
      }
    })     
  },
  []
);

 React.useEffect(()=>{
  generateCommand(plugin) 
 },[plugin, generateCommand])


 const parameterArray = React.useMemo(() => {
   if (params)
     return params.map((param) => {
       return {
         id: v4(),
         flag: param.data.flag,
         type: param.data.type,
         placeholder: param.data.help,
       };
     });
 }, [params]);
 
 const handleInputChange=(value:string)=>{
   setEditorState({
     ...editorState,
     value
   })
   handleRegex(value); 
 }

 const handleDocsToggle = () => {
   setEditorState({
     ...editorState,
     docsExpanded:!editorState.docsExpanded
   }) 

 }


 const handleGetTokens=(value:string)=>{
   const userValue = value.trim().split(" ").slice(1);
   const paramDictionary: ParameterDictionary = {};
  
  if(userValue.length>0){
    for(let i=0; i<=userValue.length; i++) {
      const flag= userValue[i];
      const value = userValue[i + 1];

      const flags = params && params.map((param) => param.data.flag);

      parameterArray?.forEach((parameter)=>{
              if (parameter.flag === flag) {
                if (
                  !value ||
                  ((value.startsWith("--") || value.startsWith("-"))&&
                  flags && flags.includes(value))
                  ) {
                  paramDictionary[flag] = {
                    value: "",
                    id: parameter.id,
                    placeholder: parameter.placeholder,
                    type: parameter.type,
                  };
                } else if (parameter.type === "boolean" && value) {
                  paramDictionary[flag] = {
                    value: "",
                    id: parameter.id,
                    placeholder: parameter.placeholder,
                    type: parameter.type,
                  };    
                } else {
                  paramDictionary[flag] = {
                    value,
                    id: parameter.id,
                    placeholder: parameter.placeholder,
                    type: parameter.type,
                  };
                }
              }     
      })
    }
  }
  
   return { paramDictionary };
 }


 const handleRegex=(value:string)=>{
  const {paramDictionary}=handleGetTokens(value);

 
 
  const dropdownObject: InputType = {};
  const requiredObject: InputType = {};
   

  const requiredParameters = params && getRequiredParams(params);
  for (const token in paramDictionary) {
    const id = paramDictionary[token].id;
    const editorValue = paramDictionary[token].value;
    const flag = token;
    const type = paramDictionary[token].type;
    const placeholder = paramDictionary[token].placeholder;
    if (
      requiredParameters &&
      requiredParameters.length > 0 &&
      requiredParameters.includes(flag)
    ) {
      const value =
        params &&
        getRequiredParamsWithName(id, flag, editorValue, type, placeholder);
      if (value) requiredObject[id] = value;
    } else {
      const value =
        params &&
        getAllParamsWithName(id, flag, editorValue, type, placeholder);
      if (value) dropdownObject[id] = value;
    }
  }

   
    if(!isEmpty(dropdownObject) || !isEmpty(requiredObject)){
       inputChangeFromEditor(dropdownObject, requiredObject);
    }
 }




  return (
    <div className="configuration">
      <div className="configuration__options">
        <Title headingLevel="h1">{`Configure ${plugin?.data.name}`}</Title>

        <div className="editor">
          <Label className="editor__label">Edit Plugin Configuration:</Label>
          <TextArea
            aria-label="text"
            className="editor__text"
            resizeOrientation="vertical"
            onChange={handleInputChange}
            value={value}
            spellCheck={false}
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
  
}


const mapStateToProps = ({ plugin }: ApplicationState) => ({
  params: plugin.parameters,
});

export default connect(mapStateToProps, null)(Editor);