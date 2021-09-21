import {
  Alert,
  AlertActionCloseButton,
  AlertActionLink,
  Button,
  Form,
  FormGroup,
  List,
  ListItem,
  Modal,
  ModalVariant,
  Popover,
  TextArea,
  TextInput,
  Title,
  TitleSizes,
  Wizard,
} from "@patternfly/react-core";
import { PenFancyIcon } from "@patternfly/react-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useTypedSelector } from "../../store/hooks";
import { pluginTree } from "./pipelinetypes";

const chrisURL = process.env.REACT_APP_CHRIS_UI_URL;
const UserName = window.sessionStorage.getItem("USERNAME");

const SavePipelineBtn = () => {
  const history = useHistory();

  const selectedPlugin = useTypedSelector(
    (state) => state.instance.selectedPlugin
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [RequestSuccess, setRequestSuccess] = useState(true);
  const [stepIdReached, setStepIdReached] = useState<any>(1);
  const [PipelineName, setPipelineName] = useState("");
  const [Category, setCategory] = useState("");
  const [Description, setDescription] = useState("");
  const [Locked, setLocked] = useState("false");
  const [PluginTree, setPluginTree] = useState<pluginTree[]>([]);
  const [ErrorMsg, setErrorMsg] = useState(
    "Please select plugins before proceeding."
  );
  const [btndisabled, setBtndisabled] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const CheckRootNode = selectedPlugin?.collection.items[0].data;

  const validatePipeline = () => {
    if (
      !CheckRootNode.some(
        (node: any) => node.value === "finishedSuccessfully"
      ) ||
      !CheckRootNode.some((node: any) => node.name === "previous_id")
    ) {
      setBtndisabled(true);
      setShowPopover(true);
      !CheckRootNode.some((node: any) => node.value === "finishedSuccessfully")
        ? setErrorMsg(
            "You cannot create a pipeline from a node that has not finished successfully."
          )
        : setErrorMsg("You cannot create a pipeline from your feed root node.");
    } else {
      setBtndisabled(false);
      setErrorMsg("");
    }
  };

  useEffect(() => {
    validatePipeline();
  }, [CheckRootNode]);

  useEffect(() => {
    setTimeout(() => setShowPopover(false), 3000);
  }, [showPopover === true, isModalOpen === false]);

  const handleClick = () => {
    if (ErrorMsg === "") {
      setIsModalOpen(true);
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
        .then((response) => {
          console.log("Response", response.data.results);
          const tempList: pluginTree[] = [];
          const result = response.data.results;
          for (let i = 0; i < result.length; i++) {
            const tempPluginTree = {
              plugin_name: `${result[i].plugin_name}`,
              plugin_version: `${result[i].plugin_version}`,
              previous_index:
                i === 0
                  ? null
                  : i === 1
                  ? 0
                  : result[i].previous_id === result[i - 1].previous_id
                  ? tempList[i - 1].previous_index
                  : tempList[i - 1].previous_index + 1,
            };
            tempList.push(tempPluginTree);
          }

          setPluginTree(() => tempList);
        })
        .catch((errors: Error) => {
          console.error(errors.message);
        });
    } else setShowPopover(true);
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
    if (stepIdReached && stepIdReached >= 3 && isModalOpen) {
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
          setRequestSuccess(true);
          console.log("Success 🎉🎉🎉", res);
        })
        .catch((errors) => {
          console.error(errors.message);
          setErrorMsg(errors.message);
          setRequestSuccess(false);
          console.log("Failed! 💩💩💩");
          console.log(
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
            })}`
          );
        });
    }

    return onSave();
  };

  const onNext = (
    { id, name }: { id?: string | null | number; name: React.ReactNode },
    {
      prevId,
      prevName,
    }: { prevId?: string | number; prevName: React.ReactNode }
  ) => {
    setStepIdReached(
      stepIdReached && id && stepIdReached < id ? id : stepIdReached
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
          {PluginTree.map((plugin: pluginTree, index: number) => {
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
      canJumpTo: stepIdReached && stepIdReached >= 2,
      nextButtonText: "Save Pipeline",
    },
    {
      id: 3,
      name: "Finish",
      component: <>{NewPipeline()}</>,
      nextButtonText: "Done",
      canJumpTo: stepIdReached && stepIdReached >= 3,
    },
  ];

  const title = "Save Pipeline";

  return (
    <div onClick={() => handleClick()}>
      <Popover
        aria-label="pipeline warning"
        headerContent={<div>Warning ⚠</div>}
        bodyContent={<div>{ErrorMsg}</div>}
        isVisible={showPopover}
        showClose={false}
      >
        <Button
          type="button"
          variant="primary"
          icon={<PenFancyIcon />}
          onClick={() => handleClick()}
          style={{ marginTop: "1rem" }}
          isDisabled={btndisabled}
        >
          Save Pipeline
        </Button>
      </Popover>

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
          height={400}
        />
      </Modal>
    </div>
  );
};

export default SavePipelineBtn;
