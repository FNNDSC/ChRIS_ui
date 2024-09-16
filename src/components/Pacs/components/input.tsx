import React from "react";
import { PACSqueryCore } from "../../../api/pfdcm";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  Grid,
  GridItem,
  MenuToggle,
  MenuToggleElement,
  TextInputGroup,
  TextInputGroupMain,
  ToggleGroup,
  ToggleGroupItem,
} from "@patternfly/react-core";
import { hideOnDesktop, hideOnMobile } from "../../../cssUtils.ts";
import { SearchIcon, TimesIcon } from "@patternfly/react-icons";

type InputFieldProps = {
  setQuery: (query: PACSqueryCore) => void;
  query: PACSqueryCore;
  id?: string;
  "aria-label"?: string;
};

type PacsInputProps = InputFieldProps & {
  service: string;
  services: ReadonlyArray<string>;
  setService: (service: string) => void;
};

/**
 * An input field for searching in PACS by MRN
 */
const MrnInput: React.FC<InputFieldProps> = ({ query, setQuery, ...props }) => {
  const clearInput = () => setQuery({});

  return (
    <TextInputGroup>
      <TextInputGroupMain
        icon={<SearchIcon />}
        value={query.patientID || ""}
        onChange={(_event, value) =>
          setQuery({
            patientID: value,
          })
        }
        name="mrnSearchInput"
        placeholder="Search for DICOM studies by MRN"
      />
      {!isQueryEmpty(query) && (
        <Button
          variant="plain"
          onClick={clearInput}
          aria-label="Clear button and input"
        >
          <TimesIcon />
        </Button>
      )}
    </TextInputGroup>
  );
};

/**
 * An advanced search input field for searching in PACS by PatientID, AccessionNumber, ...
 */
const AdvancedInput: React.FC<InputFieldProps> = ({
  query,
  setQuery,
  ...props
}) => {
  return (
    <>
      <h1>Advanced search not implemented.</h1>
    </>
  );
};

type ServiceDropdownProps = {
  service: string;
  setService: (service: string) => void;
  services: ReadonlyArray<string>;
};

const ServiceDropdown: React.FC<ServiceDropdownProps> = ({
  service,
  services,
  setService,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Dropdown
      isOpen={isOpen}
      onSelect={(_e, value) => {
        typeof value === "string" && setService(value);
        setIsOpen(false);
      }}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => setIsOpen((open) => !open)}
          isExpanded={isOpen}
          isFullWidth
          title="PACS service"
        >
          {service}
        </MenuToggle>
      )}
    >
      <DropdownList>
        {services.map((service) => (
          <DropdownItem value={service} key={service}>
            {service}
          </DropdownItem>
        ))}
      </DropdownList>
    </Dropdown>
  );
};

/**
 * A `<span>` which shows different text on mobile vs desktop layouts.
 */
const ScreenSizeSpan: React.FC<{
  mobile: React.ReactNode;
  desktop: React.ReactNode;
}> = ({ mobile, desktop }) => (
  <>
    <span className={hideOnDesktop}>{mobile}</span>
    <span className={hideOnMobile}>{desktop}</span>
  </>
);

const PacsInput: React.FC<PacsInputProps> = ({
  service,
  services,
  setService,
  ...props
}) => {
  const [advancedSearch, setAdvancedSearch] = React.useState(false);

  const InputElement = advancedSearch ? AdvancedInput : MrnInput;

  const advancedSearchToggle = (
    <ToggleGroup>
      <ToggleGroupItem
        text={<ScreenSizeSpan mobile="MRN" desktop="MRN Search" />}
        isSelected={!advancedSearch}
        onChange={() => setAdvancedSearch(false)}
      />
      <ToggleGroupItem
        text={<ScreenSizeSpan mobile="Advanced" desktop="Advanced Search" />}
        isSelected={advancedSearch}
        onChange={() => setAdvancedSearch(true)}
      />
    </ToggleGroup>
  );

  const serviceDropdown = (
    <ServiceDropdown
      services={services}
      service={service}
      setService={setService}
    />
  );

  return (
    <Grid>
      <GridItem span={6} md={3}>
        {advancedSearchToggle}
      </GridItem>
      <GridItem span={6} md={3} order={{ md: "2" }}>
        {serviceDropdown}
      </GridItem>
      <GridItem span={12} md={6}>
        <InputElement {...props} />
      </GridItem>
    </Grid>
  );
};

function isQueryEmpty(query: { [key: string]: any } | null): boolean {
  return (
    query === null ||
    Object.values(query).findIndex((value) => `${value}`.length > 0) === -1
  );
}

export default PacsInput;
export { isQueryEmpty };
