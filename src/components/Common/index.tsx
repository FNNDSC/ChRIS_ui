import {
  Bullseye,
  ClipboardCopy,
  ClipboardCopyButton,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
  Flex,
  FlexItem,
  Hint,
  MenuToggle,
  TextInput,
} from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import { Alert, Popover, Spin } from "antd";
import React, { type ReactNode, useState } from "react";
import Dots from "react-activity/dist/Dots";
import "react-activity/dist/library.css";
import { Cookies } from "react-cookie";
import ReactJson from "react-json-view";
import {
  ArchiveIcon,
  CubesIcon,
  ExternalLinkSquareAltIcon,
  FileIcon,
  FileImageIcon,
  FilePdfIcon,
  FileTxtIcon,
  FolderIcon,
  InfoIcon as InfoIconComponent,
  SearchIcon,
} from "../Icons";
import "./common.css";

export const EmptyStateComponent = ({ title }: { title?: string }) => {
  return (
    <EmptyState variant={EmptyStateVariant.lg}>
      <EmptyStateHeader icon={<EmptyStateIcon icon={CubesIcon} />} />
      <EmptyStateBody>{title ? title : "No results found"}</EmptyStateBody>
    </EmptyState>
  );
};

export const SpinContainer = ({ title }: { title: string }) => {
  return (
    <div className="example">
      <Spin tip={title}>
        <div className="content" />
      </Spin>
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

export const DotsIndicator = ({ title }: { title: string }) => {
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
        {title}
      </div>
    </div>
  );
};

export const ClipboardCopyContainer = ({ path }: { path: string }) => {
  const [copied, setCopied] = React.useState(false);

  const clipboardCopyFunc2 = (
    _event: React.ClipboardEvent<HTMLDivElement>,
    text: string,
  ) => {
    if (typeof navigator.clipboard === "undefined") {
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

export const InfoIconCustom = ({
  title,
  p1,
  p2,
  p3,
  p4,
  customStyle,
}: {
  title: string;
  p1?: React.ReactNode;
  p2?: React.ReactNode;
  p3?: React.ReactNode;
  p4?: React.ReactNode;
  customStyle?: {
    [key: string]: React.CSSProperties;
  };
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
    <div style={{ display: "flex" }}>
      <h4
        className="info-section-title"
        style={{
          ...customStyle?.title,
          marginBottom: 0,
          fontSize: "1.25rem",
          fontWeight: 500,
          lineHeight: "1.4",
        }}
      >
        {title}
      </h4>
      <Popover placement="top" trigger="hover" content={content}>
        <span style={{ display: "inline-flex", alignSelf: "flex-start" }}>
          <InfoIconComponent />
        </span>
      </Popover>
    </div>
  );
};

export const InfoSection: React.FC<{
  title: string;
  content?: React.ReactNode;
}> = ({ title, content }) => (
  <InfoIconCustom
    customStyle={{
      title: {
        color: "white",
      },
    }}
    title={title}
    p1={<div className="info-section-paragraph">{content}</div>}
  />
);

export const addInfoSectionStyles = () => {
  if (!document.getElementById("info-section-styles")) {
    const style = document.createElement("style");
    style.id = "info-section-styles";
    style.textContent = `
      .info-section-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 500;
        line-height: 1.4;
      }
      .info-section-paragraph {
        color: #d2d2d2;
        font-size: 1rem;
        line-height: 1.5;
        margin-top: 0.5rem;
      }
    `;
    document.head.appendChild(style);
  }
};

if (typeof window !== "undefined") {
  addInfoSectionStyles();
}

export const InfoIcon = ({
  title,
  p1,
  p2,
  p3,
  p4,
  customStyle,
}: {
  title: string;
  p1?: any;
  p2?: any;
  p3?: any;
  p4?: any;
  customStyle?: {
    [key: string]: React.CSSProperties;
  };
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
    <div style={{ display: "flex" }}>
      <h4
        style={{
          ...customStyle?.title,
          marginBottom: 0,
          fontSize: "1.25rem",
          fontWeight: 500,
          lineHeight: "1.4",
        }}
      >
        {title}
      </h4>
      <Popover placement="top" trigger="hover" content={content}>
        <span style={{ display: "inline-flex", alignSelf: "flex-start" }}>
          <InfoIconComponent />
        </span>
      </Popover>
    </div>
  );
};

type AllProps = {
  label: string;
  onSearch: (search: string, searchType: string) => void;
  search?: string;
  searchType?: string;
  customStyle?: React.CSSProperties;
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
  props: AllProps,
) => {
  const { searchType, search, customStyle } = props;
  const [value, setValue] = useState(search ? search : "");
  const [dropdownValue, setDropdownValue] = React.useState<string>(
    searchType?.toUpperCase() && FeedsQueryTypes[searchType]
      ? searchType
      : FeedsQueryTypes.NAME[0],
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
          ...customStyle,
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
            placeholder={`Search the resource by ${dropdownValue}`}
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
  cleanUpErrors?: () => void;
}) => {
  return (
    <Alert
      type="error"
      closable
      onClose={cleanUpErrors}
      description={
        <ReactJson
          name="error"
          enableClipboard
          displayDataTypes={false}
          src={errors}
          theme={"monokai"}
        />
      }
    />
  );
};

export const ClipboardCopyFixed = ({
  value,
  onChange,
}: {
  value: string;
  onChange?: (_event: any, text?: string | number) => void;
}) => {
  const handleCopy = async (_event: any, text: string) => {
    if (!text) {
      console.warn("No text provided to copy.");
      return;
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text.toString());
      } catch (error) {
        alert("Failed to copy text to clipboard. Please try again.");
      }
    } else {
      console.warn(
        "Clipboard API not found. This copy function will not work. This is likely because you're using an",
        "unsupported browser or you're not using HTTPS.",
      );
      alert(
        "Clipboard API is not supported in your browser. Please use a supported browser or enable HTTPS.",
      );
    }
  };

  return (
    <ClipboardCopy
      hoverTip="Copy"
      clickTip="Copied"
      onCopy={(event) => handleCopy(event, value)}
      onChange={onChange}
    >
      {value}
    </ClipboardCopy>
  );
};

export const getIcon = (
  type: string,
  isDarkTheme: boolean,
  customStyle?: React.CSSProperties,
) => {
  const color = isDarkTheme ? "#FFFFFF" : "#000000"; // white for dark theme, black for light theme
  const iconStyle = { color, ...customStyle };
  switch (type.toLowerCase()) {
    case "dir":
      return <FolderIcon style={iconStyle} />;
    case "dcm":
    case "jpg":
    case "png":
      return <FileImageIcon style={iconStyle} />;
    case "txt":
      return <FileTxtIcon style={iconStyle} />;
    case "pdf":
      return <FilePdfIcon style={iconStyle} />;
    case "zip":
      return <ArchiveIcon style={iconStyle} />;
    case "link":
      return <ExternalLinkSquareAltIcon style={iconStyle} />;
    case "folder":
      return <FolderIcon style={iconStyle} />;
    default:
      return <FileIcon style={iconStyle} />;
  }
};

// This example has been simplified to focus on the empty state. In real usage,
// you may want to derive your rows from typed underlying data and minimal state. See other examples.

interface EmptyTableProps {
  columnNames: {
    [key: string]: string;
  }[];
}

export const TableEmptyState: React.FunctionComponent<EmptyTableProps> = ({
  columnNames,
}: EmptyTableProps) => (
  <Table aria-label="Empty state table">
    <Thead>
      <Tr>
        {columnNames.map((column, index) => {
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          return <Th key={index}>{Object.values(column)[0]}</Th>;
        })}
      </Tr>
    </Thead>
    <Tbody>
      <Tr>
        <Td colSpan={8}>
          <Bullseye>
            <EmptyState variant={EmptyStateVariant.sm}>
              <EmptyStateHeader
                icon={<EmptyStateIcon icon={SearchIcon} />}
                titleText="No results found"
                headingLevel="h2"
              />
              <EmptyStateBody>No Data Found under this path</EmptyStateBody>
            </EmptyState>
          </Bullseye>
        </Td>
      </Tr>
    </Tbody>
  </Table>
);
