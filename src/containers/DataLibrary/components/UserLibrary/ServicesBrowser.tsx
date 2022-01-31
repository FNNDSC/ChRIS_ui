import React, { useCallback, useState } from "react";
import {
  EmptyState,
  EmptyStateIcon,
  Spinner,
  Title,
  EmptyStateBody,
} from "@patternfly/react-core";
import { CubesIcon } from "@patternfly/react-icons";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import DirectoryTree from "../../../../utils/browser";
import Browser from "./Browser";

interface ServicesBrowserProps {
  small?: boolean;
  showPagination?: boolean;
  pageLength?: number;
}

const client = ChrisAPIClient.getClient();

export const ServicesBrowser: React.FC<ServicesBrowserProps> = ({
  pageLength,
}: ServicesBrowserProps) => {
  document.title = "Services | My Library";
  const PAGE_LENGTH = pageLength || 15;

  const [services, setServices] = useState<DirectoryTree>();

  const [pages, setPages] = useState<number[]>([0]);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const fetchCurrentPage = useCallback(async () => {
    const current = pages[currentPage];
    const params = { limit: 100, offset: current, fname_nslashes: "5u" };

    try {
      let items: any[] = [];
      let repeat = false;

      // Keep fetching files with an increasing offset
      // until the DirectoryTree to show currently has enough children.
      do {
        const services = await client.getServiceFiles(params);
        const pacs = await client.getPACSFiles({
          ...params,
          fname_nslashes: "6u",
        });
        items = [...(pacs.getItems() || []), ...(services.getItems() || [])];

        const directory = DirectoryTree.fromPathList(items).child("SERVICES");

        // decide whether to repeat if there exist more files and we dont
        // have enough children to show yet.
        repeat =
          (services.hasNextPage || pacs.hasNextPage) &&
          directory.dir.length < PAGE_LENGTH;
        params.offset += params.limit;

        setServices(directory);
      } while (repeat);

      // Before leaving, set the end offset for next time for pagination.
      setPages([...pages, params.offset]);
      setCurrentPage(currentPage + 1);
    } catch (error) {
      console.error(error);
    }
  }, [PAGE_LENGTH, currentPage, pages]);

  const nextPage = () => {
    setServices(undefined);
    fetchCurrentPage();
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);

    nextPage();
  };

  if (!services)
    return (
      <EmptyState>
        <EmptyStateIcon variant="container" component={Spinner} />
        <Title size="lg" headingLevel="h4">
          Loading
        </Title>
      </EmptyState>
    );

  if (!services.dir.length)
    return (
      <EmptyState>
        <EmptyStateIcon variant="container" component={CubesIcon} />
        <Title size="lg" headingLevel="h4">
          No Services
        </Title>
        <EmptyStateBody>
          You haven&apos;t pulled from any services yet. <br />
        </EmptyStateBody>
      </EmptyState>
    );

  const fetchServicesDir = async (fname: string) => {
    const pacs = await client.getPACSFiles({ limit: 10e6, fname });
    const service = await client.getServiceFiles({ limit: 10e6, fname });

    return DirectoryTree.fileList(
      [...(pacs.getItems() || []), ...(service.getItems() || [])],
      fname
    );
  };

  return (
    <section>
      {/* Pagination Controls */}
      <Browser
        withHeader
        name="SERVICES"
        path="/library/SERVICES"
        tree={services}
        fetchFiles={fetchServicesDir}
      />
    </section>
  );
};
