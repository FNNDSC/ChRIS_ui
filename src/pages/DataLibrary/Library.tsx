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
        <h1>Library</h1>
        <DataLibrary />
      </Wrapper>
    </div>
  );
};

  

export default Library;
