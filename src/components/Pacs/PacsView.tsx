import React from "react";
import PacsInput, { PacsInputProps } from "./components/input.tsx";
import PacsStudiesView, {
  PacsStudiesViewProps,
} from "./components/PacsStudiesView.tsx";
import { getDefaultPacsService } from "./components/helpers.ts";
import { useSearchParams } from "react-router-dom";
import { PACSqueryCore } from "../../api/pfdcm";
import { IPacsState } from "../../store/pacs/types.ts";
import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";

type PacsViewProps = Pick<PacsInputProps, "services" | "onSubmit"> & {
  data: IPacsState;
  onRetrieve: (service: string, query: PACSqueryCore) => void;
};

/**
 * Wraps {@link PacsStudiesViewProps}, handling the union variants of `data`
 * whether it be `null` or "loading".
 */
const MaybePacsStudiesView: React.FC<
  Pick<PacsViewProps, "data"> & Pick<PacsStudiesViewProps, "onRetrieve">
> = ({ data, onRetrieve }) => {
  switch (data.studies) {
    case null:
      return <>Enter a search to get started</>;
    case "loading":
      return <>loading</>;
    default:
      return pipe(
        data.studies,
        E.match(
          (error) => <>Error: {error.message}</>,
          (studies) => (
            <PacsStudiesView studies={studies} onRetrieve={onRetrieve} />
          ),
        ),
      );
  }
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
      <MaybePacsStudiesView onRetrieve={curriedOnRetrieve} data={data} />
    </>
  );
};

export default PacsView;
