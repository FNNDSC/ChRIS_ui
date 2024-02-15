import { useParams } from "react-router";
import NiivueDatasetViewer from "./NiivueDatasetViewer";

/**
 * `NiivueDatasetViewerPage` is a small wrapper for {@link NiivueDatasetViewer},
 * connecting it to the `react-router`'s parameters.
 *
 * `NiivueDatasetViewerPage` must be used with a dynamic segment named `plinstId`.
 */
const NiivueDatasetViewerPage = () => {
  const { plinstId } = useParams();

  if (plinstId === undefined) {
    console.dir(useParams());
    throw new Error("plinstId of NiivueDatasetViewerPage is undefined");
  }

  return <NiivueDatasetViewer plinstId={plinstId} />;
};

export default NiivueDatasetViewerPage;
