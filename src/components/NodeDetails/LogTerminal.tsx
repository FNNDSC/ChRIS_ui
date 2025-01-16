import { LogViewer } from "@patternfly/react-log-viewer";
import { useAppSelector } from "../../store/hooks";

type LogTerminalProps = {
  text: string;
};

const LogTerminal = ({ text }: LogTerminalProps) => {
  const isTerminalMaximized = useAppSelector(
    (state) => state.drawers.node.maximized,
  );

  const containerStyle = {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column" as const,
    flexGrow: 1,
  };

  return (
    <div style={containerStyle}>
      <LogViewer hasLineNumbers={false} data={text} />
    </div>
  );
};

export default LogTerminal;
