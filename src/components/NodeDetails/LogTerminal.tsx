import { Toolbar, ToolbarContent, ToolbarItem } from "@patternfly/react-core";
import { LogViewer, LogViewerSearch } from "@patternfly/react-log-viewer";

type LogTerminalProps = {
  text: string;
};

const LogTerminal = ({ text }: LogTerminalProps) => {
  // container style
  const containerStyle: React.CSSProperties = {
    // If "maximized", fill entire viewport
    height: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  };

  return (
    <div style={containerStyle}>
      <LogViewer
        /* Provide the log text (could be text or data.data, etc.) */
        data={text}
        /* Let user toggle wrap text via the checkbox */

        /* Hide line numbers if desired */
        hasLineNumbers={true}
        /* Optionally set a fixed or relative height */

        /* Provide a custom toolbar with PatternFly controls */
        toolbar={
          <Toolbar>
            <ToolbarContent>
              {/* 2) Built-in LogViewerSearch for searching logs */}
              <ToolbarItem>
                <LogViewerSearch placeholder="Search" />
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
        }
      />
    </div>
  );
};

export default LogTerminal;
