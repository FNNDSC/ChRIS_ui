import { LogViewer } from "@patternfly/react-log-viewer";

type LogTerminalProps = {
  text: string;
};

const LogTerminal = ({ text }: LogTerminalProps) => {
  return (
    <>
      <LogViewer hasLineNumbers={false} height={"100%"} data={text} />
    </>
  );
};

export default LogTerminal;
