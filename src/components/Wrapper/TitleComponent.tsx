import { Tooltip } from "@patternfly/react-core";
import { Typography } from "antd";
import { matchPath, useLocation } from "react-router";
import { elipses } from "../../api/common";
import BUILD_VERSION from "../../getBuildVersion";
import { useTypedSelector } from "../../store/hooks";
import { InfoIcon } from "../Common";
import {
  useFeedListData,
  useSearchQueryParams,
} from "../Feeds/useFeedListData";
import { useFetchFeed } from "../Feeds/useFetchFeed";
import { CodeBranchIcon } from "../Icons";

const { Paragraph, Title } = Typography;

// Component for displaying name and description
const InfoSection: React.FC<{ title: string; content: React.ReactNode }> = ({
  title,
  content,
}) => <InfoIcon title={title} p1={<Paragraph>{content}</Paragraph>} />;

// Feeds name component
const FeedsNameComponent: React.FC = () => {
  const { feedCount, loadingFeedState } = useFeedListData();
  const feedCountText =
    !feedCount && loadingFeedState
      ? "Fetching..."
      : feedCount === -1
        ? 0
        : feedCount;

  return (
    <InfoSection
      title={`New and Existing Analyses (${feedCountText})`}
      content="Analyses (aka ChRIS feeds) are computational experiments where data
      are organized and processed by ChRIS plugins. In this view, you may
      view your analyses and also the ones shared with you."
    />
  );
};

// Library name component
const LibraryNameComponent: React.FC = () => (
  <InfoSection
    title="Your Library"
    content={
      <>
        The Library provides a card-focused mechanism for browsing, viewing, and
        interacting with data in the ChRIS system. A card is analogous to a file
        or folder in a conventional filesystem, and multiple cards can be
        grouped into a shopping cart to allow for bulk operations. Simply long
        press and release a card to add it to the cart. Bulk operations include:{" "}
        <b>Download</b> (which will copy all cart contents to your local
        filesystem), <b>Delete</b> (which will permanently remove all data in
        the cards from ChRIS), and <b>Create</b> which will seed a new analysis
        with a new root node containing each card as a subdirectory.
      </>
    }
  />
);

// Overview name component
const OverviewNameComponent: React.FC = () => (
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

// Plugin catalog component
const PluginCatalogComponent: React.FC = () => (
  <InfoSection
    title="Installed Plugins"
    content={
      <>
        ChRIS is a platform that runs <b>Plugins</b>. A plugin is a single
        application (similar to <i>apps</i> on a mobile device). Examples of
        ChRIS <b>Plugins</b> are applications that analyze images (like{" "}
        <a href="https://github.com/FNNDSC/pl-fshack">pl-fshack</a> that runs a
        neuro image analysis program called{" "}
        <a href="https://surfer.nmr.mgh.harvard.edu">FreeSurfer</a>). Other{" "}
        <b>Plugins</b> perform operations like zipping files, converting medical
        images from DICOM to jpg, etc. On this page you can browse{" "}
        <b>Plugins</b> available for you to use. For more options, consult the{" "}
        <a href="https://next.chrisstore.co">ChRIS store</a>.
      </>
    }
  />
);

// Compute catalog component
const ComputeCatalogComponent: React.FC = () => (
  <InfoSection
    title="Compute"
    content={
      <>
        This page presents the available <b>Compute</b> environments that are
        known to ChRIS. These denote computers and clusters/clouds that can be
        selected to run various <b>plugins</b> and <b>pipelines</b>. The special{" "}
        <b>host</b> environment is always available and is the actual server
        that is running ChRIS. It is generally not recommended to run intensive
        computation on the <b>host</b> environment. Adding new <b>Compute</b> to
        ChRIS is typically enabled by using the separate ChRIS admin interface.
      </>
    }
  />
);

// Pipeline catalog component
const PipelineCatalogComponent: React.FC = () => (
  <Title level={4} style={{ marginBottom: 0 }}>
    Pipelines
  </Title>
);

// Store catalog component
const StoreCatalogComponent: React.FC = () => (
  <InfoSection
    title="Plugin Store"
    content="This is a global store from where you can install your plugins."
  />
);

// Configuration for path mappings
const pathToComponentMap: Record<string, React.FC | null> = {
  "/feeds": FeedsNameComponent,
  "/": OverviewNameComponent,
  "/catalog": PluginCatalogComponent,
  "/compute": ComputeCatalogComponent,
  "/pipelines": PipelineCatalogComponent,
  "/store": StoreCatalogComponent,
};

// Feeds detail component
const FeedsDetailComponent: React.FC<{ id?: string }> = ({ id }) => {
  const query = useSearchQueryParams();
  const type = query.get("type");
  const isLoggedIn = useTypedSelector((state) => state.user.isLoggedIn);

  const { feed } = useFetchFeed(id, type, isLoggedIn);

  if (!feed) {
    return null;
  }

  return (
    <Title level={4} style={{ marginBottom: 0 }}>
      <CodeBranchIcon style={{ marginRight: "0.25em" }} />
      <Tooltip content={feed?.data.name}>
        <span>{elipses(feed?.data.name, 40)}</span>
      </Tooltip>
    </Title>
  );
};

// Title component to dynamically map location to the appropriate component
const TitleComponent: React.FC = () => {
  const location = useLocation();

  // Check if the current location matches specific paths
  const feedMatch = matchPath("/feeds/:id", location.pathname);
  const libraryMatch = matchPath("/library/*", location.pathname);

  if (feedMatch) {
    const { id } = feedMatch.params;
    return <FeedsDetailComponent id={id} />;
  }

  if (libraryMatch) {
    return <LibraryNameComponent />;
  }

  const Component = pathToComponentMap[location.pathname];
  return Component ? <Component /> : null;
};

export default TitleComponent;
