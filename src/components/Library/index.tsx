import React, { useEffect } from "react";
import { Typography } from "antd";
import { PageSection } from "@patternfly/react-core";
import { useDispatch } from "react-redux";
import { setSidebarActive } from "../../store/ui/actions";
import WrapperConnect from "../Wrapper";
import DataLibrary from "./UserLibrary";
import { InfoIcon } from "../Common";
import { LibraryProvider } from "./context";
import "./user-library.css";

export type File = string;
export type Series = File[];
const { Paragraph, Text } = Typography;

export const Library: React.FC = () => {
  const dispatch = useDispatch();
  document.title = "Data Library";

  useEffect(() => {
    document.title = "My Library";
    dispatch(
      setSidebarActive({
        activeItem: "lib",
      })
    );
  }, [dispatch]);

  return (
    <WrapperConnect>
      <PageSection isFilled={false}>
        <InfoIcon
          title="Library"
          p1={
            <Paragraph>
              The Library provides a card-focused mechanism for browsing,
              viewing, and interacting with data in the ChRIS system. A card is
              analogous to a file or folder in a convention filesystem, and
              multiple cards can be grouped into a shopping cart to allow for
              bulk operations. Simply long press and release a card to add it to
              the cart. Bulk operations include: <b>Download</b> (which will
              copy all cart contents to your local filesystem), <b>Delete</b>{" "}
              (which will permanently remove all data in the cards from ChRIS),
              and <b>Create</b> which will seed a new analysis with a new root
              node containing each card as a subdirectory.
            </Paragraph>
          }
          p2={
            <Paragraph>
              In addition to browsing over the entire file space, the Library
              also allows for powerful searching across the three main parts of
              the ChRIS Library. The <Text strong>Uploads </Text>
              shows all the data (organized by folder) that has been uploaded
              from some external source (typically a filesystem). The{" "}
              <Text strong>Completed Analyses</Text> allows easy navigation down
              all the Analyses that have been completed in ChRIS. The{" "}
              <Text strong>SERVICES</Text> allows easy browsing of data
              associated with some external service, such as a Picture Archive
              and Communications System (PACS) database.
            </Paragraph>
          }
        />
      </PageSection>

      <LibraryProvider>
        <PageSection>
          <DataLibrary />
        </PageSection>
      </LibraryProvider>
    </WrapperConnect>
  );
};

export default Library;
