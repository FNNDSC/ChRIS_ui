import WrapperConnect from "../Wrapper";
import { PageSection } from "@patternfly/react-core";
import { InfoIcon } from "../Common";
import { Typography } from "antd";

const PublicDatasets: React.FunctionComponent = () => {
  return (
    <WrapperConnect>
      <PageSection>
        <InfoIcon
          title="Public Datasets"
          p1={
            <Typography>
              <p>
                Datasets found in public feeds can be visualized here using
                <a href="https://github.com/niivue/niivue" target="_blank" rel="noreferrer nofollow">Niivue</a>.
              </p>
              <p>
                For how to add data here, see the documentation:
                <a href="https://chrisproject.org/docs/public_dataset_viewer" target="_blank" rel="noreferrer nofollow">
                  https://chrisproject.org/docs/public_dataset_viewer
                </a>.
              </p>
            </Typography>
          }
        />
      </PageSection>
      <PageSection>
        <p>hello, world!</p>
      </PageSection>
    </WrapperConnect>
  );
}

export default PublicDatasets;
