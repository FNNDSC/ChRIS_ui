import {
  ClipboardCopyButton,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
  PageSection,
  PageSectionVariants,
} from "@patternfly/react-core";
import React, { useEffect, useState } from "react";

const PipelineDocs = () => {
  const [copied, setCopied] = useState(false);
  const [timer, setTimer] = useState<null | number>(null);

  const clipboardCopyFunc = (event: React.SyntheticEvent, text: string) => {
    const clipboard = event.currentTarget.parentElement;
    const el = document.createElement("textarea");
    el.value = text.toString();
    clipboard?.appendChild(el);
    el.select();
    document.execCommand("copy");
    clipboard?.removeChild(el);
  };

  const handleClick = (event: React.SyntheticEvent, text: string) => {
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

  const actions = (TextID: string, Code: string) => {
    return (
      <>
        <CodeBlockAction>
          <ClipboardCopyButton
            id="copy-button"
            textId={TextID}
            aria-label="Copy to clipboard"
            onClick={(e) => handleClick(e, Code)}
            exitDelay={600}
            maxWidth="110px"
            variant="plain"
            position="left"
          >
            {copied ? "Successfully copied to clipboard!" : "Copy to clipboard"}
          </ClipboardCopyButton>
        </CodeBlockAction>
      </>
    );
  };

  const SearchPipelines = `# list all pipellines
  $ caw search
  https://cube.chrisproject.org/api/v1/pipelines/1/           Automatic Fetal Brain Reconstruction Pipeline
  https://cube.chrisproject.org/api/v1/pipelines/2/           Infant FreeSurfer with Cerebellum Step
  https://cube.chrisproject.org/api/v1/pipelines/2/           COVID-Net Chest CT Analysis and Report
  
  # search for pipelines by name
  $ caw search 'Fetal Brain'
  https://cube.chrisproject.org/api/v1/pipelines/1/           Automatic Fetal Brain Reconstruction Pipeline
  `;

  const RunPipeline = `# specify source as a plugin instance ID
  $ caw pipeline --target 3 'Automatic Fetal Brain Reconstruction Pipeline'
  
  # specify source by URL
  $ caw pipeline --target https://cube.chrisproject.org/api/v1/plugins/instances/3/ 'Automatic Fetal Brain Reconstruction Pipeline'
  `;

  const UploadFiles = `# upload files and create a new feed by running pl-dircopy
  $ caw upload something.txt picture.jpg
  
  # upload a folder and create a new feed by running pl-dircopy
  $ caw upload data/
  
  # create a feed with a title and description
  $ caw upload --name 'Caw caw, ima crow' --description 'A murder of crows' \
      something.txt picture.jpg
  
  # create a feed and run a pipeline after the pl-dircopy instance
  $ caw upload --name 'In-utero study' \
      --pipeline 'Automatic Fetal Brain Reconstruction Pipeline' \
      data/T2_*.nii
  `;

  const DownloadFiles = `# download everything from a feed
  $ caw download 'https://cube.chrisproject.org/api/v1/3/files/' results/
  
  # download the output directory of a specific plugin instance
  $ caw download 'https://cube.chrisproject.org/api/v1/plugins/instances/5/files/' results/
  
  # download everything from a path 'chris/uploads/test'
  $ caw download 'https://cube.chrisproject.org/api/v1/uploadedfiles/search/?fname=chris%2Fuploads%2Ftest' results/
  
  # example results
  $ tree results/
  wow
  └── uploads
      └── test
          ├── a.txt
          ├── b.txt
          ├── c.txt
          ├── d.txt
          └── e.txt
  `;

  return (
    <PageSection variant={PageSectionVariants.light}>
      <h1 className="docs_title">Documentation</h1>
      <hr />
      <p>
        Details are provided by the <code>--help</code> command.
        <br />
        You can find more documentation{" "}
        <a href="https://github.com/FNNDSC/caw#caw-pipeline">here</a>.
      </p>

      <div className="docs_content">
        <code className="code_title">caw search</code>
        <p>Search for pipelines that are saved in ChRIS.</p>
        <h2>Examples</h2>
        <CodeBlock
          actions={actions("code-search", SearchPipelines)}
          style={{ borderRadius: "8px" }}
        >
          <CodeBlockCode id="code-search" className="code_content">
            {SearchPipelines}
          </CodeBlockCode>
        </CodeBlock>
      </div>
      <div className="docs_content">
        <code className="code_title">caw pipeline</code>
        <p>Run a pipeline on an existing feed.</p>
        <h3>Examples</h3>
        <CodeBlock actions={actions("code-runpipeline", RunPipeline)}>
          <CodeBlockCode id="code-runpipeline" className="code_content">
            {RunPipeline}
          </CodeBlockCode>
        </CodeBlock>
      </div>
      <div className="docs_content">
        <code className="code_title">caw upload</code>
        <p>
          Upload files into ChRIS storage and then run pl-dircopy, printing the
          URL for the newly created plugin instance.
        </p>
        <h3>Examples</h3>
        <CodeBlock actions={actions("code-uploadfiles", UploadFiles)}>
          <CodeBlockCode id="code-uploadfiles" className="code_content">
            {UploadFiles}
          </CodeBlockCode>
        </CodeBlock>
      </div>
      <div className="docs_content">
        <code className="code_title">caw download</code>
        <p>Download files from ChRIS.</p>
        <h3>Examples</h3>
        <CodeBlock actions={actions("code-download", DownloadFiles)}>
          <CodeBlockCode id="code-download" className="code_content">
            {DownloadFiles}
          </CodeBlockCode>
        </CodeBlock>
      </div>
    </PageSection>
  );
};
export default PipelineDocs;
