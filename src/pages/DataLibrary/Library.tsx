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
    <div>
      <Wrapper>
        <article id="user-library">
          <div>
            <h1>My Library</h1>
          </div>
          <LibraryProvider>
            <DataLibrary />
          </LibraryProvider>
        </article>
      </Wrapper>
    </div>
  );
};

export default Library;
