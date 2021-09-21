import {
  ClipboardCopyButton,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
  PageSection,
} from "@patternfly/react-core";
import {
  AngleRightIcon,
  CalendarDayIcon,
  CodeBranchIcon,
  UserAltIcon,
} from "@patternfly/react-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Wrapper from "../../../containers/Layout/PageWrapper";
import PipelineTree from "../../../components/pipelines/PipelineTree";

const Pipeline = () => {
  const { id }: any = useParams();
  const [copied, setCopied] = useState(false);
  const [timer, setTimer] = useState<any>(null);
  const [pipeline, setPipeline] = useState<any>({});
  const [pipings, setPipings] = useState<any>([]);
  const [selectedNode, setselectedNode] = useState(0);

  
const chrisURL = process.env.REACT_APP_CHRIS_UI_URL;

  const blob = new Blob([JSON.stringify(pipeline)], {
    type: "application/vnd.collection+json",
  });

  useEffect(() => {
    axios
      .get(`${chrisURL}pipelines/${id}/`, {
        headers: {
          "Content-Type": "application/vnd.collection+json",
          Authorization:
          "Token " + window.sessionStorage.getItem("CHRIS_TOKEN"),
        },
      })
      .then((response: any) => {
        setPipeline(response.data);
        console.log("response",response.data)
      })
      .catch((errors) => {
        console.error(errors);
      });
  }, [id]);

  useEffect(() => {
    axios
      .get(
        `${chrisURL}pipelines/${id}/pipings/`,
        {
          headers: {
            "Content-Type": "application/vnd.collection+json",
            Authorization:
            "Token " + window.sessionStorage.getItem("CHRIS_TOKEN"),
          },
        }
      )
      .then((response: any) => {
        setPipings(response.data.results);
      })
      .catch((errors) => {
        console.error(errors);
      });
  }, [id, chrisURL]);

  const clipboardCopyFunc = (event: React.SyntheticEvent, text: string) => {
    const clipboard = event.currentTarget.parentElement;
    const el = document.createElement("textarea");
    el.value = text.toString();
    clipboard?.appendChild(el);
    el.select();
    document.execCommand("copy");
    clipboard?.removeChild(el);
  };

  const onClick = (event: React.SyntheticEvent, text: string) => {
    if (timer) {
      window.clearTimeout(timer);
      setCopied(false);
    }
    clipboardCopyFunc(event, text);
    setCopied(true);
  };

  useEffect(() => {
    setTimer(
      window.setTimeout(() => {
        setCopied(false);
      }, 1000)
    );
    setTimer(null);
  }, [copied]);

  const code = `# specify source as a plugin instance ID
  $ caw pipeline --target 3 '${pipeline.name}'
  
  # specify source by URL
  $ caw pipeline --target ${pipeline.url} '${pipeline.name}'
  `;

  const actions = (
    <>
      <CodeBlockAction>
        <ClipboardCopyButton
          id="copy-button"
          textId="code-content"
          aria-label="Copy to clipboard"
          onClick={(e) => onClick(e, code)}
          exitDelay={600}
          maxWidth="110px"
          variant="plain"
        >
          {copied ? "Successfully copied to clipboard!" : "Copy to clipboard"}
        </ClipboardCopyButton>
      </CodeBlockAction>
    </>
  );

  const onNodeClick = (node: any, event: React.SyntheticEvent) =>{
    console.log("Selected Plugin", node)
     }
   
  return (
    <Wrapper>
      <PageSection className="pipeline_main">
        <Link to="/pipelines" style={{ color: "#0275d8", marginRight: "8px" }}>
          Pipelines
        </Link>
        <Link to={`/pipelines/${id}/`} style={{ color: "#ffffff" }}>
          <AngleRightIcon /> {pipeline.id}
        </Link>
        <h1>
          <CodeBranchIcon />
          {pipeline.name}
        </h1>
        <div className="pipeline_main_top">
          <div className="pipeline_main_top_left">
            <div>
              <p>
                Creator
                <br />
                <UserAltIcon />
                {pipeline.authors}
              </p>
            </div>
            <div>
              <p>
                Created
                <br />
                <CalendarDayIcon />
                {pipeline.creation_date}
              </p>
            </div>
          </div>
          <div className="pipeline_main_top_right">
            <div>
              <a
                href={URL.createObjectURL(blob)}
                download={
                  `${pipeline.name}_${pipeline.id}.json` ||
                  `Pipeline_${id}.json`
                }
                className="save_button"
              >
                Export Pipeline
              </a>
            </div>
          </div>
        </div>
        <div className="pipeline_main_bottom">
          <div className="pipeline_main_bottom_left">
            <p>Pipeline Graph</p>
            <PipelineTree pluginData={pipings} onNodeClick={(node:any, event: React.SyntheticEvent)=>onNodeClick(node, event)}/>
            {console.log("Plugin Data from pipeline", pipings)}
            {/* id: 1
                pipeline: "https://store.outreachy.chrisproject.org/api/v1/pipelines/1/"
                pipeline_id: 1
                plugin: "https://store.outreachy.chrisproject.org/api/v1/plugins/26/"
                plugin_id: 26
                plugin_name: "pl-fetal-brain-mask"
                plugin_version: "1.2.1"
                previous: null
            url: "https://store.outreachy.chrisproject.org/api/v1/pipelines/pipings/1/" */}

            {/* <div>{pipeline.plugin_pipings}</div>
            {pipings.map((piping: any, index: number) => {
              return (
                <>
                  <a onClick={() => setselectedNode(index)} key={piping.id}>
                    {piping.plugin_name}
                  </a>
                  <br />
                </>
              );
            })} */}
          </div>
          <div className="pipeline_main_bottom_right">
            <p>
              Selected Node:
              <br />
              <b>{pipings[selectedNode]?.plugin_name}</b>
            </p>
            <br />
            <p>
              Plugin Version: <b>{pipings[selectedNode]?.plugin_version}</b>
            </p>
            <br />
            <p>
              Node ID: <b>{pipings[selectedNode]?.plugin_id}</b>
            </p>
            <br />
            <b>Command</b>
            <br />
            <p>This plugin will run under the following command:</p>
            <br />
            <CodeBlock actions={actions} id="code-content" >
              <CodeBlockCode >{code}</CodeBlockCode>
            </CodeBlock>
          </div>
        </div>
      </PageSection>
    </Wrapper>
  );
};

export default Pipeline;
