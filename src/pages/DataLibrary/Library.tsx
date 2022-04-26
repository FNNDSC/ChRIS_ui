import React, { useEffect } from "react";
import { Typography } from "antd";

import { useDispatch } from "react-redux";
import { setSidebarActive } from "../../store/ui/actions";
import Wrapper from "../Layout/PageWrapper";
import DataLibrary from "./components/UserLibrary/";
import Search from "./components/UserLibrary/Search";
import { LibraryProvider } from "./components/UserLibrary/context";

export type File = string;
export type Series = File[];

const { Title, Paragraph, Text } = Typography;

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

  const pStyle = {
    fontSize: "1.15em",
  };

  return (
    <Wrapper>
      <article id="user-library">
        <div>
          <Title>Library</Title>
          <Paragraph style={pStyle}>
            The Library provides a card-focused mechanism for browsing, viewing,
            and interacting with data in the ChRIS system. In addition to
            browsing over the entire file space, the Library also allows for
            powerful searching and group selection. By selecting a group of
            cards in the Library, you can easily apply a single analysis to all
            the elements of that selection.
          </Paragraph>
          <Paragraph style={pStyle}>
            Data is organized broadly in three areas. The{" "}
            <Text strong>My Uploads </Text>
            shows all the data (organized by folder) that you might have
            uploaded. The <Text strong>Completed Analyses</Text> allows easy
            navigation down all the Analyses you have run. The{" "}
            <Text strong>External Services</Text> allows you to browse data
            associated with some external service, such as a PACS database. You
            can select multiple or single cards from any place in this Library
            and start new Analyses.
          </Paragraph>
        </div>
        <LibraryProvider>
          <Search />
          <DataLibrary />
        </LibraryProvider>
      </article>
    </Wrapper>
  );
};

export default Library;
