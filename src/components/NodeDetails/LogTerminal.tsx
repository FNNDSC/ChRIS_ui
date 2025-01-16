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
    height: isTerminalMaximized ? "100vh" : "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column" as const,
    flexGrow: 1,
  };

  const logViewerStyle = {
    flexGrow: 1,
    overflow: "auto",
    height: "100%",
    width: "100%",
  };

  return (
    <div style={containerStyle}>
      <LogViewer style={logViewerStyle} hasLineNumbers={false} data={text} />
    </div>
  );
};

export default LogTerminal;
