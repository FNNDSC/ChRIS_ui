import Papa from "papaparse"; // Import PapaParse for CSV parsing
import React from "react";
import type { IFileBlob } from "../../../api/model";
import useSize from "../../FeedTree/useSize";

type AllProps = {
  selectedFile?: IFileBlob;
};

const TextDisplay: React.FunctionComponent<AllProps> = ({ selectedFile }) => {
  const divRef = React.useRef<HTMLDivElement>(null);
  useSize(divRef);

  const [content, setContent] = React.useState<string | null>(null);
  const [csvData, setCsvData] = React.useState<string[][] | null>(null);

  React.useEffect(() => {
    const displayContent = async () => {
      if (selectedFile) {
        const blob = await selectedFile.getFileBlob();
        const reader = new FileReader();

        reader.addEventListener(
          "load",
          () => {
            const result = reader.result as string;
            const fileName = selectedFile.data?.fname || "";
            const isCSVFile = fileName.endsWith(".csv");

            if (isCSVFile) {
              // Parse CSV
              const parsed = Papa.parse(result, { header: false });
              setCsvData(parsed.data);
              setContent(null);
            } else {
              setContent(result);
              setCsvData(null);
            }
          },
          false,
        );

        reader.readAsText(blob);
      }
    };

    displayContent();
  }, [selectedFile]);

  return (
    <div
      ref={divRef}
      style={{
        display: "block",
        overflow: "hidden", // Hide scrollbars on the outer container
        width: "100%",
        height: "100%",
      }}
    >
      {csvData ? (
        // Wrap table in a div to manage overflow
        <div
          style={{
            overflow: "auto", // Enable vertical and horizontal scrolling
            width: "100%",
            height: "100%",
          }}
        >
          <table
            style={{
              borderCollapse: "collapse",
              width: "max-content", // Allow table to take natural width
              minWidth: "100%", // Ensure table fills the container width initially
            }}
          >
            <tbody>
              {csvData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      style={{ border: "1px solid #ccc", padding: "4px" }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Render text content
        <pre
          style={{
            fontFamily: "monospace",
            color: "white",
            whiteSpace: "pre-wrap",
            margin: 0,
          }}
        >
          {content}
        </pre>
      )}
    </div>
  );
};

const MemoedTextDisplay = React.memo(TextDisplay);

export default MemoedTextDisplay;
