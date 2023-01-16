import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { Form, FormGroup, TextInput, TextArea } from "@patternfly/react-core";
import { Typeahead } from "react-bootstrap-typeahead";
import { CreateFeedContext } from "./context";
import { Tag } from "@fnndsc/chrisapi";
import { Types } from "./types/feed";
import { fetchTagList } from "./utils/basicInformation";
 import { WizardContext } from "@patternfly/react-core/";

const BasicInformation: React.FC = () => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { feedName, feedDescription, tags } = state.data;
  const [availableTagsLoaded, setAvailableTagsLoaded] =
    useState<boolean>(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
   const {onNext} = useContext(WizardContext)
  const inputElement = useRef<any>()
  useEffect(() => {
    let mounted = true;
    fetchTagList().then((tags: Tag[]) => {
      if (mounted) {
        setAvailableTagsLoaded(true);
        setAvailableTags(tags);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (inputElement.current) {
      inputElement.current.focus()
    }
  }, [])
  const handleKeyDown = useCallback((e:any) => {
 
    if (feedName && e.code == "Enter") {
     e.preventDefault()
     onNext()
    }else if (e.target.closest('INPUT, TEXTAREA') && e.code == "ArrowRight"){
     return; 
    } else if (feedName && e.code == "ArrowRight") {
     onNext()
    }
 }, [onNext, feedName])
  

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [ handleKeyDown])

  return (
        <Form className="pf-u-w-75 basic-information">
          <h1 className="pf-c-title pf-m-2xl">Basic Information</h1>
          <FormGroup label="Analysis Name" isRequired fieldId="analysis-name">
            <TextInput
              isRequired
              type="text"
              id="analysis-name"
              aria-label="analysis-name"
              name="analysis-name"
              placeholder="e.g. Tractography Study"
              value={feedName}
              ref={inputElement}
              onChange={(value: string) => {
                dispatch({
                  type: Types.FeedNameChange,
                  payload: {
                    value,
                  },
                });
              }}
              maxLength={100}
            />
          </FormGroup>

          <FormGroup label="Analysis Note" fieldId="analysis-descripti on">
            <TextArea
              id="analysis-description"
              name="analysis-description"
              placeholder="Use this field to describe the purpose of your analysis, the type of data you're processing, or any other details or notes that might be handy to store in the feed."
              rows={5}
              value={feedDescription}
              onChange={(value: string) => {
                dispatch({
                  type: Types.FeedDescriptionChange,
                  payload: {
                    value,
                  },
                });
              }}
            />
          </FormGroup>

          <FormGroup label="Tags" fieldId="tags">
            <Typeahead
              id="tags"
              placeholder={
                availableTagsLoaded ? "Choose a tag..." : "Loading tags..."
              }
              multiple
              options={availableTags}
              //@ts-ignore
              onChange={(tags: Tag[]) => {
                dispatch({
                  type: Types.TagsChange,
                  payload: {
                    tags,
                  },
                });
              }}
              selected={tags}
              //@ts-ignore
              labelKey={(tag: Tag) => tag.data.name}
              emptyLabel={availableTagsLoaded ? "No tags found" : "Loading tags..."}
            />
          </FormGroup>
        </Form> 
  );
};

export default BasicInformation;
