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
} from "@patternfly/react-core";
import { PenFancyIcon } from "@patternfly/react-icons";
import axios from "axios";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useTypedSelector } from "../../store/hooks";

// interface PluginNodeTree {
//     plugin_name: string;
//     plugin_version: string;
//     previous_index: number | null;
// }

const CreateBtn = () => {
  const history = useHistory();

  const selectedPlugin = useTypedSelector(
    (state) => state.instance.selectedPlugin
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [RequestSuccess, setRequestSuccess] = useState(true);
  const [stepIdReached, setStepIdReached] = useState(1);
  const [saved, setSaved] = useState(false);
  const [darker, setDarker] = useState("pipeline")
  const [PipelineName, setPipelineName] = useState(
    "Test Fetal Brain Assessment Pipeline v3.0.0"
  );
  const [Author, setAuthor] = useState("Dohn Joe <JoeTheMan@gmail.com>");
  const [Category, setCategory] = useState("MRI");
  const [Description, setDescription] = useState(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  );
  const [Locked, setLocked] = useState("false");
  const [PluginTree, setPluginTree] = useState<any[]>([]);

  const handleClick = () => {
    setIsModalOpen(!isModalOpen);
    axios
      .get(
        `https://cube.outreachy.chrisproject.org/api/v1/plugins/instances/${selectedPlugin?.data.id}/descendants/`,
        {
          headers: {
            "Content-Type": "application/vnd.collection+json",
            Authorization:
              "Token " + window.sessionStorage.getItem("CHRIS_TOKEN"),
          },
        }
      )
      .then((response: any) => {
        response.data.results.map((result: any, pluginIndex: number) => {
          const tempPluginTree = {
            plugin_name: `${result.plugin_name}`,
            plugin_version: `${result.plugin_version}`,
            previous_index: pluginIndex === 0 ? null : pluginIndex - 1,
          };
          return setPluginTree((prevtree: any) => [
            ...prevtree,
            tempPluginTree,
          ]);
        });
      })
      .catch((errors: Error) => {
        console.error(errors.message);
      });
  };

  const handleHover = () =>{
    console.log("Mouse over!")
    // higlight pipeline nodes
  }

  const NewPipeline = () => {
    axios
      .post(
        `https://store.outreachy.chrisproject.org/api/v1/pipelines/`,
        `${JSON.stringify({
          template: {
            data: [
              { name: "name", value: PipelineName },
              { name: "authors", value: Author },
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
        setRequestSuccess(false);
        console.log("Failed! 💩💩💩");
      });

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
              created!
            </p>
          </Alert>
        ) : (
          <Alert
            variant="danger"
            title="Pipeline Creation Failed! 😞"
            actionClose={
              <AlertActionCloseButton
                onClose={() => setIsModalOpen(!isModalOpen)}
              />
            }
          >
            <p>Pipeline creation failed, please try again!</p>
          </Alert>
        )}
      </div>
    );
  };

  const BasicInfoForm = () => {
    return (
      <Form>
        <FormGroup
          label="Pipeline Name"
          isRequired
          fieldId="pipeline_name"
          helperText="Please provide your full name"
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
          label="Pipeline Author"
          isRequired
          fieldId="pipeline_author"
          helperText="Please provide the pipeline author name"
        >
          <TextInput
            isRequired
            type="text"
            id="pipeline_author"
            name="pipeline_author"
            aria-describedby="pipeline_author"
            value={Author}
            onChange={(val) => setAuthor(val)}
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
          <TextInput
            isRequired
            type="text"
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
          helperText="State whether true or false"
        >
          <TextInput
            isRequired
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
        <p>Pipeline Name : {PipelineName}</p>
        <br />
        <p>Author : {Author}</p>
        <br />
        <p>Category : {Category}</p>
        <br />
        <p>Locked : {Locked}</p>
        <br />
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
      enableNext: true,
    },
    {
      id: 2,
      name: "Pipeline Creation",
      component:
        PluginTree.length > 0 ? (
          <>{PipelineCreation()}</>
        ) : (
          <Alert
            variant="warning"
            title="Please select plugins before proceeding."
          />
        ),
      enableNext: PluginTree.length > 0,
      canJumpTo: stepIdReached >= 2,
      nextButtonText: "Create Pipeline",
    },
    {
      id: 3,
      name: "Finish",
      component: <>{onSave()}</>,
      nextButtonText: "Done",
      canJumpTo: stepIdReached >= 3,
    },
  ];

  const title = "Create Pipeline";

  return (
    <div >
      <Button
        type="button"
        variant="primary"
        icon={<PenFancyIcon />}
        onClick={() => handleClick()}
        onMouseOver={()=> handleHover()}
        style={{marginTop: "1rem"}}
      >
        Create Pipeline
      </Button>

      <Modal
        isOpen={isModalOpen}
        variant={ModalVariant.large}
        showClose={false}
        onClose={() => setIsModalOpen(!isModalOpen)}
        hasNoBodyWrapper
        aria-describedby="create_pipeline"
        aria-labelledby="create_pipeline_description"
      >
        <Wizard
          titleId="create_pipeline"
          descriptionId="create_pipeline_description"
          title={`${title}`}
          description="Create a new pipeline and with the selected list of plugins"
          navAriaLabel={`${title} steps`}
          mainAriaLabel={`${title} content`}
          onClose={() => setIsModalOpen(!isModalOpen)}
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

export default CreateBtn;
