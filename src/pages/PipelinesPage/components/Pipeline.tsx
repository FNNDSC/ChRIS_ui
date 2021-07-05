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
  UserAltIcon
} from "@patternfly/react-icons";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Wrapper from "../../../containers/Layout/PageWrapper";

const Pipeline = () => {
  const [copied, setCopied] = useState(false);
  const [timer, setTimer] = useState<any>(null);

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

  const code = `apiVersion: helm.openshift.io/v1beta1/
                kind: HelmChartRepository
                metadata:
                name: azure-sample-repo
                spec:
                connectionConfig:
                url: https://raw.githubusercontent.com/Azure-Samples/helm-charts/master/docs`;

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
        <Link to="/pipelines/1" style={{ color: "#ffffff" }}>
          <AngleRightIcon /> 1
        </Link>
        <h1>
          <CodeBranchIcon /> Fetal Brain MRI Reconstruction pipeline
        </h1>
        <div className="pipeline_main_top">
          <div className="pipeline_main_top_left">
            <div>
              <p>
                Creator
                <br />
                <UserAltIcon /> Jane Doe
              </p>
            </div>
            <div>
              <p>
                Created
                <br />
                <CalendarDayIcon /> 2 Jan 2018 @14:32ET
              </p>
            </div>
          </div>
          <div className="pipeline_main_top_right">
            <div>
              <Button href="https://chrisstore.co/">View in ChRIS Store</Button>
            </div>
            <div>
              <Button href="/feeds">Download Pipeline</Button>
            </div>
          </div>
        </div>
        <div className="pipeline_main_bottom">
          <div className="pipeline_main_bottom_left">
            <p>Pipeline Graph</p>
          </div>
          <div className="pipeline_main_bottom_right">
            <p>
              Selected Node
              <br />
              <b>pl-Freesurfer_PP</b>
            </p>
            <br />
            <p>
              Created <b>2 Jan 2018 @14:32ET</b>
            </p>
            <br />
            <p>
              Node ID <b>123e34354</b>
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
