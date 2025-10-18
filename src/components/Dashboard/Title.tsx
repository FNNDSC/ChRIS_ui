import BUILD_VERSION from "../../getBuildVersion";
import { InfoSection } from "../Common";

export default (
  <InfoSection
    title="Welcome to ChRIS"
    content={
      <>
        Retrieve, analyze, and visualize <i>any data</i> using a powerful cloud
        computing platform: ChRIS. <b>Let's get started.</b>
        <p>
          Build: <code className="build-version">{BUILD_VERSION}</code>
        </p>
      </>
    }
  />
);
