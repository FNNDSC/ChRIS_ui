import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import WrapperConnect from "../Wrapper";
import {
  Title,
  PageSection,
  Card,
  CardBody,
  CardTitle,
  CardFooter,
  Grid,
  GridItem,
  Button,
} from "@patternfly/react-core";
import { IconSearch, IconWand } from "@tabler/icons-react";
import { setSidebarActive } from "../../store/ui/actions";
import "./dashboard.css";

interface DashboardProps {
  children?: React.ReactNode;
}

const style = {
  height: "5em",
  width: "5em",
};

const DashboardPage = (props: DashboardProps) => {
  const dispatch = useDispatch();

  const { children } = props;

  React.useEffect(() => {
    document.title = "Overview";
    dispatch(
      setSidebarActive({
        activeItem: "Dashboard",
      })
    );
  }, [dispatch]);

  const outlineSearch = <IconSearch style={style} />;
  const magicWand = <IconWand style={style} />;

  /*

  const buildVersion = preval`
    const { execSync } = require('child_process')
    module.exports = execSync('npm run -s print-version', {encoding: 'utf-8'})
  `;

  */

  return (
    <WrapperConnect>
      <PageSection hasShadowBottom>
        <Title style={{ color: "white" }} headingLevel="h1">
          Welcome to ChRIS
        </Title>
        <p>
          Retrieve, analyze, and visualize <i>any data </i> using a powerful
          cloud computing platform: ChRIS.
          <b> Let&apos;s get started.</b>
        </p>
        <p>
          Build: <code className="build-version"></code>
        </p>
        {children}
      </PageSection>
      <PageSection>
        <Grid hasGutter>
          <GridItem lg={6}>
            <CardDisplay
              title="You've got data!"
              body='Visit the "Library" in the main navigation to review your data collection'
              buttonText="Go to the Library"
              buttonLink="/library"
              className="dashboard-carddisplay"
            />
          </GridItem>
          <GridItem lg={6}>
            <CardDisplay
              title="You've got analyses!"
              body='Visit "New and Existing Analyses" in the main navigation to review your data analyses'
              buttonText="Go to New and Existing Analyses"
              buttonLink="/feeds"
              className="dashboard-carddisplay"
            />
          </GridItem>
          <GridItem lg={6}>
            <CardDisplay
              component={<LogoComponent logo={outlineSearch} />}
              title="Discover and collect new data"
              body='Visit "PACS Query/Retrieve" in the main navigation to pull medical data and save it your library'
              buttonText="PACS Query/Retrieve"
              buttonLink="/pacs"
            />
          </GridItem>
          <GridItem lg={6}>
            <CardDisplay
              component={<LogoComponent logo={magicWand} />}
              title="Run a quick workflow"
              body='Visit "Run a Quick Workflow" to choose from existing analysis templates that allow for detailed analysis'
              buttonText="Run a Quick Workflow"
              buttonLink="/feeds"
            />
          </GridItem>
        </Grid>
      </PageSection>
    </WrapperConnect>
  );
};

export default DashboardPage;

const CardDisplay = ({
  title,
  body,
  buttonText,
  buttonLink,
}: {
  title: string;
  body: string;
  buttonText: string;
  buttonLink: string;
  className?: string;
  component?: React.ReactElement;
}) => {
  const navigate = useNavigate();
  return (
    <Card style={{ overflow: "hidden" }}>
      <div style={{ margin: "0 auto", textAlign: "center" }}>
        <CardTitle>
          <Title headingLevel="h2"> {title}</Title>
        </CardTitle>
        <CardBody>{body}</CardBody>
        <CardFooter>
          <Button
            onClick={() => {
              navigate(buttonLink);
            }}
          >
            {buttonText}
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
};

const LogoComponent = ({ logo }: { logo: JSX.Element }) => {
  return <>{logo}</>;
};
