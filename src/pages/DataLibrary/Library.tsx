import React, { useContext, useState } from "react";
import Wrapper from "../Layout/PageWrapper";
import DataLibrary from "./components/UserLibrary/";

export type File = string;
export type Series = File[];

export const Library: React.FC = () => {
  document.title = "Data Library";

  return (
    <div>
      <Wrapper>
        <article id="user-library">
          <div>
            <h1>My Library</h1>
          </div>
          <DataLibrary />
        </article>
      </Wrapper>
    </div>
  );
};

  

export default Library;
