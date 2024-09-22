import React from "react";
import PacsInput, { PacsInputProps } from "./components/input.tsx";
import PacsStudiesView, {
  PacsStudiesViewProps,
} from "./components/PacsStudiesView.tsx";
import { getDefaultPacsService } from "./components/helpers.ts";
import { useSearchParams } from "react-router-dom";
import { PACSqueryCore } from "../../api/pfdcm";

type PacsViewProps = Pick<PacsInputProps, "services" | "onSubmit"> &
  Pick<PacsStudiesViewProps, "data"> & {
    onRetrieve: (service: string, query: PACSqueryCore) => void;
  };

/**
 * PACS Query and Retrieve view component.
 *
 * This component has a text input field for specifying a PACS query,
 * and will display studies and series found in PACS.
 */
const PacsView: React.FC<PacsViewProps> = ({
  services,
  onSubmit,
  onRetrieve,
  data,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultService = React.useMemo(
    () => getDefaultPacsService(services),
    [services],
  );
  const service = searchParams.get("service") || defaultService;
  const setService = (service: string) =>
    setSearchParams((searchParams) => {
      searchParams.set("service", service);
      return searchParams;
    });

  const curriedOnRetrieve = (query: PACSqueryCore) =>
    onRetrieve(service, query);

  return (
    <>
      <PacsInput
        onSubmit={onSubmit}
        services={services}
        service={service}
        setService={setService}
      />
      <PacsStudiesView data={data} onRetrieve={curriedOnRetrieve} />
    </>
  );
};

export default PacsView;
