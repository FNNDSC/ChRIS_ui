import { Skeleton } from "@patternfly/react-core";
import Spacing from "@patternfly/react-styles/css/utilities/Spacing/spacing";

const PacsLoadingScreen = () => (
  <>
    <Skeleton
      height="50px"
      className={Spacing.mb_4xl}
      screenreaderText="Loading ChRIS PACS query and retrieve app"
    />
    <Skeleton height="40px" width="90%" className={Spacing.mbSm} />
    <Skeleton height="40px" width="90%" className={Spacing.mbSm} />
    <br />
    <Skeleton height="40px" width="90%" className={Spacing.mbSm} />
    <Skeleton height="40px" width="90%" className={Spacing.mbSm} />
    <br />
    <Skeleton height="40px" width="90%" className={Spacing.mbSm} />
    <Skeleton height="40px" width="90%" className={Spacing.mbSm} />
  </>
);

export default PacsLoadingScreen;
