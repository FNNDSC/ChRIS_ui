import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setSidebarActive } from "../../store/ui/actions";
import Wrapper from "../Layout/PageWrapper";
import DataLibrary from "./components/UserLibrary/";
import { LibraryProvider } from "./components/UserLibrary/context";

export type File = string;
export type Series = File[];

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
    <Wrapper>
      <article id="user-library">
        <div>
          <h1>My Library</h1>
          <p>
            The Library provides a card-focused mechanism for browsing, viewing, and interacting with data in the ChRIS system. In addition to browsing over the entire file space, the Library also allows for powerful searching and group selection. By selecting a group of cards in the Library, you can easily apply a single analysis to all the elements of that selection.
          </p>
          <p>
            Data is organized broadly in three areas. The <b>My Uploads</b> shows all the data (organized by folder) that you might have uploaded. The <b>Completed Analyses</b> allows easy navigation down all the Analyses you have run. The <b>External Services</b> allows you to browse data associated with some external service, such as a PACS database. You can select multiple or single cards from any place in this Library and start new Analyses.
          </p>
        </div>
        <LibraryProvider>
          <DataLibrary />
        </LibraryProvider>
      </article>
    </Wrapper>
  );
};

export default Library;
