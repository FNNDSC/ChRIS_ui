import {
  Button,
  PageSection,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
  ClipboardCopyButton,
} from "@patternfly/react-core";
import {
  CalendarDayIcon,
  CodeBranchIcon,
  AngleRightIcon,
  UserAltIcon,
} from "@patternfly/react-icons";
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Wrapper from "../../../containers/Layout/PageWrapper";
import axios from "axios";
import ForceGraph3D, {
  NodeObject,
  ForceGraphMethods,
} from "react-force-graph-3d";

const Pipeline = () => {
  const { id }: any = useParams();
  const [copied, setCopied] = useState(false);
  const [timer, setTimer] = useState<any>(null);
  const [pipeline, setPipeline] = useState<any>({});
  const [pipings, setPipings] = useState<any>([]);
  const [selectedNode, setselectedNode] = useState(0);

  const blob = new Blob([JSON.stringify(pipeline)], {
    type: "application/json",
  });

  useEffect(() => {
    axios
      .get(`https://store.outreachy.chrisproject.org/api/v1/pipelines/${id}/`, {
        headers: {
          "Content-Type": "application/vnd.collection+json",
        },
      })
      .then((response: any) => {
        setPipeline(response.data);
      })
      .catch((errors) => {
        console.error(errors);
      });
  }, [id]);

  useEffect(() => {
    axios
      .get(
        `https://store.outreachy.chrisproject.org/api/v1/pipelines/1/pipings/`,
        {
          headers: {
            "Content-Type": "application/vnd.collection+json",
          },
        }
      )
      .then((response: any) => {
        setPipings(response.data.results);
      })
      .catch((errors) => {
        console.error(errors);
      });
  }, []);

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
            {/* <ForceGraph3D graphData={} />, */}
            <div>{pipeline.plugin_pipings}</div>
            {pipings.map((piping: any, index: number) => {
              return (
                <>
                  <a
                    onClick={() => setselectedNode(index)}
                    key={piping.id}
                  >
                    {piping.plugin_name}
                  </a>
                  <br />
                </>
              );
            })}
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
            <CodeBlock actions={actions}>
              <CodeBlockCode id="code-content">{code}</CodeBlockCode>
            </CodeBlock>
          </div>
        </div>
      </PageSection>
    </Wrapper>
  );
};

export default Pipeline;
