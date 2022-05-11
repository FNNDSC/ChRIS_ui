import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import Wrapper from "../Layout/PageWrapper";
import {
  Title,
  PageSection,
  Card,
  CardBody,
  CardTitle,
  CardFooter,
  CardHeader,
  CardHeaderMain,
  Grid,
  GridItem,
  Button,
  Badge,
} from "@patternfly/react-core";
import { MdOutlineImageSearch } from "react-icons/md";
import { FaMagic } from "react-icons/fa";
import { RouteComponentProps } from "react-router-dom";
import { setSidebarActive } from "../../store/ui/actions";
import FirstPng from "../../assets/images/img_1.png";
import SecondPng from "../../assets/images/img_2.png";
import ThirdPng from "../../assets/images/img_3.png";
import FourthPng from "../../assets/images/img_4.png";
import TreeOne from "../../assets/images/tree_1.png";
import TreeTwo from "../../assets/images/tree_2.png";
import TreeThree from "../../assets/images/tree_3.png";
import TreeFour from "../../assets/images/tree_4.png";
import "./Dashboard.scss";
import Moment from "react-moment";
interface DashboardProps extends RouteComponentProps {
  children: React.ReactNode;
}

const style = {
  height: "5em",
  width: "5em",
};

const DashboardPage = (props: DashboardProps) => {
  const dispatch = useDispatch();

  const { children } = props;

  React.useEffect(() => {
    dispatch(
      setSidebarActive({
        activeItem: "overview",
      })
    );
  }, [dispatch]);

  const outlineSearch = <MdOutlineImageSearch style={style} />;
  const magicWand = <FaMagic style={style} />;

  return (
    <Wrapper>
      <PageSection hasShadowBottom variant="light">
        <Title headingLevel="h1">Welcome to ChRIS</Title>
        <p>
          Retrieve, analyze, and visualize <i>any data </i> using a powerful
          cloud computing platform: ChRIS.
          <b> Let&apos;s get started.</b>
          <br />
          <span>
            Version: <b>{process.env.REACT_APP_CHRIS_UI_VERSION}</b>{" "}
          </span>
          <br />
          <span>
            Latest update:{" "}
            <b>
              <Moment format="DD MMM YYYY @ HH:mm">{`2022-05-11T15:00:11.007464-04:00`}</Moment>
            </b>
          </span>
        </p>
        {children}
      </PageSection>
      <PageSection>
        <Grid hasGutter>
          <GridItem style={{ marginBottom: "1rem" }} lg={6}>
            <CardDisplay
              component={
                <div style={{ display: "flex" }}>
                  <ImageComponent img={FirstPng} />
                  <ImageComponent img={SecondPng} />
                  <ImageComponent img={ThirdPng} />
                  <ImageComponent img={FourthPng} />
                </div>
              }
              title="You've got data!"
              body='Visit the "Library" in the main navigation to review your data collection'
              buttonText="Go to the Library"
              buttonLink="/library"
              className="dashboard-carddisplay"
            />
          </GridItem>
          <GridItem lg={6}>
            <CardDisplay
              component={
                <div style={{ display: "flex" }}>
                  <ImageComponent img={TreeOne} />
                  <ImageComponent img={TreeTwo} />
                  <ImageComponent img={TreeThree} />
                  <ImageComponent img={TreeFour} />
                </div>
              }
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
              buttonLink="/library/pacs"
            />
          </GridItem>
          <GridItem lg={6}>
            <CardDisplay
              component={<LogoComponent logo={magicWand} />}
              title="Run a quick workflow"
              body='Vist "Run a Quick Workflow" to choose from existing analysis templates that allow for detailed analysis'
              buttonText="Run a Quick Workflow"
              buttonLink="/workflows"
            />
          </GridItem>
        </Grid>
      </PageSection>
    </Wrapper>
  );
};

export default DashboardPage;

const CardDisplay = ({
  component,
  title,
  body,
  buttonText,
  buttonLink,
  className,
}: {
  component: React.ReactElement;
  title: string;
  body: string;
  buttonText: string;
  buttonLink: string;
  className?: string;
}) => {
  const history = useHistory();
  return (
    <Card style={{ overflow: "hidden" }}>
      <CardHeader
        style={{ margin: "0 2rem", display: "flex", justifyContent: "center" }}
        className={className}
      >
        <CardHeaderMain>{component}</CardHeaderMain>
      </CardHeader>
      <div style={{ margin: "0 auto", textAlign: "center" }}>
        <CardTitle>
          <Title headingLevel="h2"> {title}</Title>
        </CardTitle>
        <CardBody>{body}</CardBody>
        <CardFooter>
          <Button
            onClick={() => {
              history.push(buttonLink);
            }}
          >
            {buttonText}
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
};

const styleImg = { marginRight: "1em" };

const ImageComponent = ({ img }: { img: string }) => {
  return <img style={styleImg} src={img} alt="Image for analyses and Data" />;
};

const LogoComponent = ({ logo }: { logo: JSX.Element }) => {
  return <>{logo}</>;
};
