import React, { useContext } from "react";
import { Card, TextInput, Button, Spinner } from "@patternfly/react-core";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import { fetchResource } from "../../../../utils";
import { LibraryContext } from "./context";
import {
  setFolders,
  setInitialPath,
  setPaginatedFolders,
  setPagination,
  setRoot,
} from "./context/actions";

const Search = () => {
  const { dispatch } = useContext(LibraryContext);
  const [value, setValue] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSearch = async () => {
    setLoading(true);
    const paginate = {
      limit: 10,
      offset: 0,
      fname_icontains: value,
    };
    const client = ChrisAPIClient.getClient();

    const uploadFn = client.getUploadedFiles;
    const feedfn = client.getFiles;
    const servicesfn = client.getServiceFiles;
    const boundUploadFn = uploadFn.bind(client);
    const boundFeedFn = feedfn.bind(client);
    const boundServicesFn = servicesfn.bind(client);
    const uploadedFiles = await fetchResource(paginate, boundUploadFn);
    const feedFiles = await fetchResource(paginate, boundFeedFn);
    const servicesFiles = await fetchResource(paginate, boundServicesFn);
 

    const setResources = (path: string, folder: string, type: string) => {
      dispatch(setFolders([folder], path));
      dispatch(setInitialPath(path, type));
      dispatch(setPaginatedFolders([], path));
      dispatch(
        setPagination(path, {
          hasNext: false,
          limit: 30,
          offset: 0,
          totalCount: 0,
        })
      );
      dispatch(setRoot(true, type));
    };

    console.log(
      "UploadedFiles, ServicesFiles, feedFiles",
      uploadedFiles,
      servicesFiles,
      feedFiles
    );

    if (uploadedFiles && uploadedFiles.length > 0) {
      uploadedFiles.forEach((file: any) => {
        const names = file.data.fname.split("/");
        const index = names.findIndex((name: any, index: number) => {
          if (name === value) {
            return index;
          }
        });

        if (index) {
          const path = `${names[0]}/${names[1]}`;
          const folder = names[index - 1]; // Gideon or Test_upload
          setResources(path, folder, "uploads");
        }
      });
    }
    if (feedFiles && feedFiles.length > 0) {
      let path;
      feedFiles.forEach((file: any) => {
        const names = file.data.fname.split(`/`);
        path = names[0];
        const folder = names[1];
        setResources(path, folder, "feed");
      });
    }
    if (servicesFiles && servicesFiles.length > 0) {
      // Code yet to be written
    }
    setLoading(false);
    setValue("");
  };

  return (
    <div>
      <Card style={{ height: "100%", display: "flex", flexDirection: "row" }}>
        <TextInput
          value={value}
          type="text"
          id="search-value"
          placeholder="Search Library"
          onChange={(value: string) => setValue(value)}
        />

        <Button
          style={{
            marginLeft: "0.5em",
          }}
          onClick={handleSearch}
        >
          Search
        </Button>
      </Card>
      {loading && (
        <>
          <Spinner size="md" />
          <span>Fetching Search Results....</span>
        </>
      )}
    </div>
  );
};

export default React.memo(Search);
