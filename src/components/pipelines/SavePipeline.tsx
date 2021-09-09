import {
  Alert,
  AlertActionCloseButton,
  AlertActionLink,
  Button,
  Form,
  FormGroup,
  List,
  ListItem,
  TextInput,
  Title,
  TitleSizes,
  Modal,
  Wizard,
  ModalVariant,
  Spinner,
  TextArea,
  FormAlert,
} from "@patternfly/react-core";
import { PenFancyIcon } from "@patternfly/react-icons";
import axios from "axios";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useTypedSelector } from "../../store/hooks";

const chrisURL = process.env.REACT_APP_CHRIS_UI_URL;
const UserName = window.sessionStorage.getItem("USERNAME");

const SavePipelineBtn = () => {
  const history = useHistory();

  const selectedPlugin = useTypedSelector(
    (state) => state.instance.selectedPlugin
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [RequestSuccess, setRequestSuccess] = useState(true);
  const [stepIdReached, setStepIdReached] = useState(1);
  const [PipelineName, setPipelineName] = useState("");
  const [Category, setCategory] = useState("");
  const [Description, setDescription] = useState("");
  const [Locked, setLocked] = useState("false");
  const [PluginTree, setPluginTree] = useState<any[]>([]);
  const [ErrorMsg, setErrorMsg] = useState(
    "Please select plugins before proceeding."
  );

  const handleClick = () => {
    const CheckRootNode = selectedPlugin?.collection.items[0].data;
    setIsModalOpen(!isModalOpen);

    if (
      CheckRootNode.some(
        (node: any) =>
          node.name === "previous_id" && node.value === "finishedSuccessfully"
      )
    ) {
      axios
        .get(
          `${chrisURL}plugins/instances/${selectedPlugin?.data.id}/descendants/`,
          {
            headers: {
              "Content-Type": "application/vnd.collection+json",
              Authorization:
                "Token " + window.sessionStorage.getItem("CHRIS_TOKEN"),
            },
          }
        )
        .then((response: any) => {
          const tempList: any[] = [];
          response.data.results.map((result: any, pluginIndex: number) => {
            const tempPluginTree = {
              plugin_name: `${result.plugin_name}`,
              plugin_version: `${result.plugin_version}`,
              previous_index: pluginIndex === 0 ? null : pluginIndex - 1,
            };
            return tempList.push(tempPluginTree);
          });
          setPluginTree(() => tempList);
        })
        .catch((errors: Error) => {
          console.error(errors.message);
        });
    }
    //define and handle errors
    else {
      if (
        CheckRootNode.some(
          (node: any) => node.value === "finishedSuccessfully"
        ) === false
      ) {
        setErrorMsg(
          "You cannot create a pipeline from a node that has not finished successfully."
        );
      } else {
        setErrorMsg("You cannot create a pipeline from your feed root node.");
      }
    }
  };

  const handleHover = () => {
    console.log("Mouse over!");
    // highlight pipeline nodes
  };

  const onSave = () => {
    return (
      <div>
        {RequestSuccess ? (
          <Alert
            variant="success"
            title="Pipeline Creation was successful! 🎉"
            actionClose={
              <AlertActionCloseButton
                onClose={() => setIsModalOpen(!isModalOpen)}
              />
            }
            actionLinks={
              <>
                <AlertActionLink onClick={() => history.push("/pipelines")}>
                  View pipeline
                </AlertActionLink>
              </>
            }
          >
            <p>
              <a href="/pipelines">{PipelineName}</a> has successfully been
              saved!
            </p>
          </Alert>
        ) : (
          <Alert
            variant="danger"
            title="Pipeline Creation Failed"
            actionClose={
              <AlertActionCloseButton
                onClose={() => setIsModalOpen(!isModalOpen)}
              />
            }
          >
            <p>{ErrorMsg}</p>
          </Alert>
        )}
      </div>
    );
  };

  const NewPipeline = () => {
    if (stepIdReached >= 3 && isModalOpen) {
      axios
        .post(
          `${chrisURL}pipelines/`,
          `${JSON.stringify({
            template: {
              data: [
                { name: "name", value: PipelineName },
                { name: "authors", value: UserName },
                { name: "Category", value: Category },
                {
                  name: "description",
                  value: Description,
                },
                { name: "locked", value: Locked },
                {
                  name: "plugin_tree",
                  value: JSON.stringify(PluginTree),
                },
              ],
            },
          })}`,
          {
            headers: {
              "Content-Type": "application/vnd.collection+json",
              Authorization:
                "Token " + window.sessionStorage.getItem("CHRIS_TOKEN"),
            },
          }
        )
        .then((res) => {
          console.log("Success 🎉🎉🎉", res);
          setRequestSuccess(true);
        })
        .catch((errors) => {
          console.error(errors.message);
          setErrorMsg(errors.message)
          setRequestSuccess(false);
          console.log("Failed! 💩💩💩");
        });
    }

    return onSave();
  };

  const onNext = ({ id, name }: any, { prevId, prevName }: any) => {
    setStepIdReached(stepIdReached < id ? id : stepIdReached);
  };

  const onBack = ({ id, name }: any, { prevId, prevName }: any) => {
    console.log(
      `current id: ${id}, current name: ${name}, previous id: ${prevId}, previous name: ${prevName}`
    );
  };

  const onGoToStep = ({ id, name }: any, { prevId, prevName }: any) => {
    console.log(
      `current id: ${id}, current name: ${name}, previous id: ${prevId}, previous name: ${prevName}`
    );
  };

  const handleClose = () => {
    setIsModalOpen(!isModalOpen);
    setPluginTree([]);
    setErrorMsg("");
  };

  const BasicInfoForm = () => {
    return (
      <Form>
        <FormGroup
          label="Pipeline Name"
          isRequired
          fieldId="pipeline_name"
          helperText="Please provide the pipeline name"
        >
          <TextInput
            isRequired
            type="text"
            id="pipeline_name"
            name="pipeline_name"
            aria-describedby="pipeline_name"
            value={PipelineName}
            onChange={(val) => setPipelineName(val)}
          />
        </FormGroup>
        <FormGroup
          label="Pipeline Category"
          isRequired
          fieldId="pipeline_category"
          helperText="Please provide the pipeline category e.g MRI, Free-surfer"
        >
          <TextInput
            isRequired
            type="text"
            id="pipeline_category"
            name="pipeline_category"
            aria-describedby="pipeline_category"
            value={Category}
            onChange={(val) => setCategory(val)}
          />
        </FormGroup>
        <FormGroup
          label="Description"
          isRequired
          fieldId="pipeline_description"
          helperText="Please provide pipeline description"
        >
          <TextArea
            isRequired
            autoResize
            id="pipeline_description"
            name="pipeline_description"
            aria-describedby="pipeline_description"
            value={Description}
            onChange={(val) => setDescription(val)}
          />
        </FormGroup>
        <FormGroup
          label="Locked"
          isRequired
          fieldId="locked"
          helperText="Would you like to make the pipeline editable?"
        >
          <TextInput
            type="text"
            id="locked"
            name="locked"
            aria-describedby="locked"
            value={Locked}
            onChange={(val) => setLocked(val)}
          />
        </FormGroup>
      </Form>
    );
  };

  const PipelineCreation = () => {
    return (
      <div>
        <Title
          headingLevel="h3"
          size={TitleSizes["2xl"]}
          style={{ textAlign: "center" }}
        >
          Pipeline Preview
        </Title>
        <br />
        <ul>
          <li>
            <b>Pipeline Name :</b> {PipelineName}
          </li>
          <li>
            <b>Category : </b>
            {Category}
          </li>
          <li>
            <b>Locked : </b>
            {Locked}
          </li>
          <br />
        </ul>
        <b>Pipeline Nodes:</b>
        <List isBordered>
          {PluginTree.map((plugin: any, index: number) => {
            return <ListItem key={index}>{plugin.plugin_name}</ListItem>;
          })}
        </List>
      </div>
    );
  };

  const steps = [
    {
      id: 1,
      name: "Basic Information",
      component: <>{BasicInfoForm()}</>,
      enableNext: PipelineName != "" && Category != "" && Description != "",
    },
    {
      id: 2,
      name: "Pipeline Review",
      component:
        PluginTree.length > 0 ? (
          <>{PipelineCreation()}</>
        ) : (
          <Alert variant="warning" title={ErrorMsg} />
        ),
      enableNext: PluginTree.length > 0,
      canJumpTo: stepIdReached >= 2,
      nextButtonText: "Save Pipeline",
    },
    {
      id: 3,
      name: "Finish",
      component: <>{NewPipeline()}</>,
      nextButtonText: "Done",
      canJumpTo: stepIdReached >= 3,
    },
  ];

  const title = "Save Pipeline";

  return (
    <div>
      <Button
        type="button"
        variant="primary"
        icon={<PenFancyIcon />}
        onClick={() => handleClick()}
        onMouseOver={() => handleHover()}
        style={{ marginTop: "1rem" }}
      >
        Save Pipeline
      </Button>

      <Modal
        isOpen={isModalOpen}
        variant={ModalVariant.large}
        showClose={false}
        onClose={() => handleClose()}
        hasNoBodyWrapper
        aria-describedby="save_pipeline"
        aria-labelledby="save_pipeline_description"
      >
        <Wizard
          titleId="save_pipeline"
          descriptionId="save_pipeline_description"
          title={`${title}`}
          description="Save a new pipeline and with the selected list of plugins"
          navAriaLabel={`${title} steps`}
          mainAriaLabel={`${title} content`}
          onClose={() => handleClose()}
          onSave={() => onSave()}
          steps={steps}
          onNext={(step, prevstep) => onNext(step, prevstep)}
          onBack={(step, prevstep) => onBack(step, prevstep)}
          onGoToStep={(step, prevstep) => onGoToStep(step, prevstep)}
          height={400}
        />
      </Modal>
    </div>
  );
};

export default SavePipelineBtn;
