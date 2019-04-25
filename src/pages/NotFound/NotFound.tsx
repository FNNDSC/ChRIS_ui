import * as React from "react";
import Wrapper from "../../containers/Layout/PageWrapper";
import { Alert, PageSection, PageSectionVariants } from "@patternfly/react-core";
import "./not-found.scss";


class NotFoundPage extends React.Component {
    componentDidMount() {
        document.title = "Page Not Found";
    }

    render() {
        return (
            <Wrapper>
                <PageSection variant={PageSectionVariants.default}>
                    <Alert
                        aria-label="Page Not Found"
                        variant="danger"
                        title="Page Not Found!"  >
                        Page Not Found! Go <a href="/">Home</a>
                    </Alert>
                </PageSection>
            </Wrapper>
        );
    }
}

export { NotFoundPage as NotFound };
