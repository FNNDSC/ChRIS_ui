import { useMemo, useContext } from "react";
import { Typography } from "antd";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router";
import { Link } from "react-router-dom";

import WrapperConnect from "../Wrapper";
import { LibraryContext, LibraryProvider } from "../LibraryCopy/context";

import Browser from "../LibraryCopy/Browser";
import { InfoIcon } from "../Common";
import {
  Breadcrumb,
  BreadcrumbItem,
  PageSection,
  EmptyState,
  EmptyStateHeader,
  EmptyStateBody,
  EmptyStateIcon,
} from "@patternfly/react-core";
import CubesIcon from "@patternfly/react-icons/dist/esm/icons/cubes-icon";
import { SpinContainer } from "../Common";
import { find } from "../../api/filesystem";
import Cart from "../LibraryCopy/Cart";

const { Paragraph, Text } = Typography;

const useSearchQuery = (query: URLSearchParams) => {
  const search = query.get("search");
  const searchSpace = query.get("space");
  let resultsArray: any[] = [];

  const { data, isLoading } = useQuery({
    queryKey: ["search", searchSpace, search],
    queryFn: () => find(searchSpace, search),
  });

  const length = data?.resource?.length;

  if (length && length > 0) {
    if (searchSpace === "feeds") {
      data?.resource.forEach((result: any) => {
        resultsArray.push({
          folder_path: result.data.creator_username,
          folder_name: `feed_${result.data.id}`,
        });
      });
    }

    if (searchSpace === "pacs") {
      data?.resource.forEach((result: any) => {
        const folderSplit = result.data.fname.split("/");
        const folder_path = folderSplit.slice(0, 3).join("/");

        resultsArray.push({
          folder_path: folder_path,
          folder_name: folderSplit[3],
        });
      });
    }
  }

  return {
    results: resultsArray,
    loading: isLoading,
  };
};

function useSearchQueryParams() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function LibrarySearch() {
  const query = useSearchQueryParams();
  const { results: searchFolderData, loading } = useSearchQuery(query);

  return (
    <WrapperConnect>
      <PageSection>
        <InfoIcon
          title="Library Search Results"
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
      <PageSection>
        <LibraryProvider>
          {loading && <SpinContainer title="Fetching Search Results" />}
          {searchFolderData && searchFolderData.length > 0 ? (
            searchFolderData.map((data, index) => {
              return <SearchBrowser key={index} data={data} />;
            })
          ) : (
            <EmptyState>
              <EmptyStateHeader
                titleText="No Search Results Found"
                headingLevel="h4"
                icon={<EmptyStateIcon icon={CubesIcon} />}
              />
              <EmptyStateBody>
                <Link to="/library">Go back to the Library</Link>
              </EmptyStateBody>
            </EmptyState>
          )}
        </LibraryProvider>
      </PageSection>
    </WrapperConnect>
  );
}

function SearchBrowser({ data }: { data: any }) {
  const navigate = useNavigate();
  const pathSplit = data.folder_path.split("/");

  const handleFolderClick = (path: string, folder?: boolean) => {
    let url = "";

    if (!folder) {
      url = `${data.folder_path}/${path}`;
    } else url = `${path}/${data.folder_name}`;

    navigate(`/library/${url}`);
  };

  return (
    <>
      <Cart />
      <Breadcrumb style={{ marginLeft: "1rem", marginTop: "0.5rem" }}>
        {pathSplit.map((path: string, index: number) => {
          return (
            <BreadcrumbItem
              to="#"
              onClick={() => {
                handleFolderClick(path, false);
              }}
              key={index}
            >
              {path}
            </BreadcrumbItem>
          );
        })}
      </Breadcrumb>
      <Browser
        path={data.folder_path}
        files={[]}
        folders={[data.folder_name]}
        handleFolderClick={handleFolderClick}
      />
    </>
  );
}
