import React, { ReactNode, useState } from "react";
import { Cookies } from "react-cookie";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Popover, Typography, Spin, Alert } from "antd";
import {
  Flex,
  FlexItem,
  ClipboardCopyButton,
  Hint,
  MenuToggle,
  DropdownList,
  TextInput,
  Dropdown,
  DropdownItem,
  EmptyStateVariant,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateHeader,
} from "@patternfly/react-core";
import ReactJson from "react-json-view";
import SearchIcon from "@patternfly/react-icons/dist/esm/icons/search-icon";
import CubesIcon from "@patternfly/react-icons/dist/esm/icons/cubes-icon";
import Dots from "react-activity/dist/Dots";
import "react-activity/dist/library.css";
import "./common.css";

export const EmptyStateComponent = () => {
  return (
    <EmptyState variant={EmptyStateVariant.lg}>
      <EmptyStateHeader icon={<EmptyStateIcon icon={CubesIcon} />} />
      <EmptyStateBody>No results found.</EmptyStateBody>
    </EmptyState>
  );
};

export const SpinContainer = ({ title }: { title: string }) => {
  return (
    <div className="example">
      <Spin tip={title} />
    </div>
  );
};

export const RenderFlexItem = ({
  title,
  subTitle,
}: {
  title: ReactNode;
  subTitle: ReactNode;
}) => {
  return (
    <div>
      <Flex flex={{ default: "flex_1" }} style={{ marginBottom: "0.5rem" }}>
        <Flex style={{ width: "20%" }} direction={{ default: "column" }}>
          <FlexItem>{title}</FlexItem>
        </Flex>
        <Flex flex={{ default: "flex_1" }} direction={{ default: "column" }}>
          <FlexItem>{subTitle}</FlexItem>
        </Flex>
      </Flex>
    </div>
  );
};

export const DotsIndicator = () => {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Dots />
      <div
        style={{
          color: "#b8bbbe",
          fontSize: "0.75rem",
          marginLeft: "0.75rem",
        }}
      >
        Please wait for a status to appear for larger files... 
      </div>
    </div>
  );
};

export const ClipboardCopyContainer = ({ path }: { path: string }) => {
  const [copied, setCopied] = React.useState(false);

  const clipboardCopyFunc2 = (
    _event: React.ClipboardEvent<HTMLDivElement>,
    text: string
  ) => {
    if (typeof navigator.clipboard == "undefined") {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      new Promise((res, rej) => {
        document.execCommand("copy") ? res("successful") : rej();
      });
      document.body.removeChild(textArea);
    }
    navigator.clipboard.writeText(text);
  };

  return (
    <ClipboardCopyButton
      onClick={(event: any) => {
        setCopied(true);
        clipboardCopyFunc2(event, path);
      }}
      onTooltipHidden={() => setCopied(false)}
      id="clipboard-plugininstance-files"
      textId="clipboard-plugininstance-files"
      variant="plain"
    >
      {copied ? "Copied!" : "Copy path to clipboard"}
    </ClipboardCopyButton>
  );
};

export const useCookieToken = () => {
  const cookie = new Cookies();
  const user = cookie.get("username");
  const token: string = cookie.get(`${user}_token`);
  return token;
};

const { Title } = Typography;

export const InfoIcon = ({
  title,
  p1,
  p2,
  p3,
  p4,
}: {
  title: string;
  p1?: any;
  p2?: any;
  p3?: any;
  p4?: any;
}) => {
  const content = (
    <Hint>
      {p1}
      {p2}
      {p3}
      {p4}
    </Hint>
  );

  return (
    <Title level={4}>
      {title}
      <Popover placement="bottom" trigger="hover" content={content}>
        <InformationCircleIcon
          style={{
            height: "1em",
            width: "0.75em",
            marginLeft: "0.25em",
          }}
        />
      </Popover>
    </Title>
  );
};

type AllProps = {
  label: string;
  onSearch: (search: string, searchType: string) => void;
  search?: string;
  searchType?: string;
};

const FeedsQueryTypes: any = {
  ID: ["Id", "Match feed id exactly with this number"],
  MIN_ID: ["Min_Id", "Match feed id greater than this number"],
  MAX_ID: ["Max_Id", "Match feed id less than this number"],
  NAME: ["Name", "Match feed name containing this string"],
  NAME_EXACT: ["Name_Exact", "Match feed name exactly with this string"],
  NAME_STARTSWITH: [
    "Name_Startswith",
    "Match feed name starting with this string ",
  ],
  FILES_FNAME_ICONTAINS: [
    "Files_Fname_Icontains",
    "Match the feeds that have files containing all the substrings from the queried string",
  ],
  MIN_CREATION_DATE: [
    "Min_Creation_Date",
    "Match feed creation date greater than this date",
  ],
  MAX_CREATION_DATE: [
    "Max_Creation_Date",
    "match feed creation date less than this date",
  ],
};

export const DataTableToolbar: React.FunctionComponent<AllProps> = (
  props: AllProps
) => {
  const { searchType, search } = props;
  const [value, setValue] = useState(search ? search : "");
  const [dropdownValue, setDropdownValue] = React.useState<string>(
    searchType?.toUpperCase() && FeedsQueryTypes[searchType]
      ? searchType
      : FeedsQueryTypes.NAME[0]
  );

  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const onToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  const onFocus = () => {
    const element = document.getElementById("toggle-basic");
    element?.focus();
  };

  const onSelect = () => {
    setIsDropdownOpen(false);
    onFocus();
  };

  const updateDropdownValue = (type: string) => {
    setDropdownValue(type);
    setValue("");
    props.onSearch("", dropdownValue.toLowerCase());
  };

  const dropdownItems = Object.values(FeedsQueryTypes).map((feed: any) => {
    return (
      <DropdownItem
        key={feed[0]}
        description={feed[1]}
        onClick={() => updateDropdownValue(feed[0])}
      >
        {feed[0]}
      </DropdownItem>
    );
  });
  return (
    <div className="datatable-toolbar">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "0.8rem 0rem",
        }}
      >
        <div style={{ display: "flex", flexDirection: "row" }}>
          <Dropdown
            onSelect={onSelect}
            toggle={(toggleRef) => {
              return (
                <MenuToggle
                  ref={toggleRef}
                  id="toggle-basic"
                  onClick={onToggle}
                >
                  <div>{dropdownValue}</div>
                </MenuToggle>
              );
            }}
            shouldFocusToggleOnSelect
            isOpen={isDropdownOpen}
          >
            <DropdownList>{dropdownItems}</DropdownList>
          </Dropdown>
          <TextInput
            value={value}
            type="text"
            placeholder={dropdownValue}
            customIcon={<SearchIcon />}
            aria-label="search"
            onChange={(_event, value: string) => {
              setValue(value);
              props.onSearch(value, dropdownValue.toLowerCase());
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const ErrorAlert = ({
  errors,
  cleanUpErrors,
}: {
  errors: any;
  cleanUpErrors: () => void;
}) => {
  return (
    <Alert
      type="warning"
      closable
      onClose={cleanUpErrors}
      description={<ReactJson  src={errors} />}
    ></Alert>
  );
};
