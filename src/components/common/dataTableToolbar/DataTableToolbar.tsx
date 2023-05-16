import React, { useState } from "react";
import {TextInput, DropdownToggle, Dropdown, DropdownItem } from "@patternfly/react-core";
import "./dataTableToolbar.scss";

type AllProps = {
  label: string;
  onSearch: (search: string, searchType:string) => void;
};

 const FeedsQueryTypes = {
  ID: ["Id", "Match feed id exactly with this number"],
  MIN_ID:["Min_Id", "Match feed id greater than this number"],
  MAX_ID: ["Max_Id", "Match feed id less than this number"],
  NAME: ["Name", "Match feed name containing this string"],
  NAME_EXACT: ["Name_Exact","Match feed name exactly with this string"] ,
  NAME_STARTSWITH:["Name_Startswith", "Match feed name starting with this string "],
  FILES_FNAME_ICONTAINS:["Files_Fname_Icontains", "Match the feeds that have files containing all the substrings from the queried string"],
  MIN_CREATION_DATE:["Min_Creation_Date", "Match feed creation date greater than this date"],
  MAX_CREATION_DATE:["Max_Creation_Date", "match feed creation date less than this date"]
  }

const DataTableToolbar: React.FunctionComponent<AllProps> = (
  props: AllProps
) => {
  const [value, setValue] = useState("");
  const [dropdownValue, setDropdownValue] = React.useState<string>( FeedsQueryTypes.NAME[0])
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const onToggle = (isDropdownOpen: boolean) => {
    setIsDropdownOpen(isDropdownOpen);
  };
  const onFocus = () => {
    const element = document.getElementById('toggle-basic');
    element?.focus();
  };

  const onSelect = () => {
    setIsDropdownOpen(false);
    onFocus();
  };

  const updateDropdownValue =(type:string)=>{
    setDropdownValue(type)
    setValue("")
    props.onSearch("", dropdownValue.toLowerCase())
   }

  const dropdownItems = Object.values(FeedsQueryTypes).map((feed) => {
    return<DropdownItem key={feed[0]} component="button" description={feed[1]} onClick={() => updateDropdownValue(feed[0])}>
    {feed[0]}
   </DropdownItem>
  })
   return (
    <div className="datatable-toolbar">
      <div
        style={
          { display: "flex", justifyContent: "space-between", padding: "0.8rem 0rem" }}
      >
       <div style={{ display: "flex", flexDirection: "row" }}>
          <Dropdown
            onSelect={onSelect}
            toggle={
              <DropdownToggle id="toggle-basic" onToggle={onToggle}>
                <div style={{ textAlign: "left", padding: "0 0.5em" }}>
                  <div style={{ fontSize: "smaller", color: "gray" }}>
                   Search Analysis By
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {dropdownValue}
                  </div>
                </div>
              </DropdownToggle>
            }
            isOpen={isDropdownOpen}
            dropdownItems={dropdownItems}
          />
          <TextInput
            value={value}
            type="text"
            style={{height:"100%"}}
            placeholder={(dropdownValue)}
            iconVariant="search"
            aria-label="search"
            onChange={(value: string) => {
              setValue(value);
              props.onSearch(value, dropdownValue.toLowerCase());
            }}
          />
        </div>
    </div>
    </div>
  );
};

export default React.memo(DataTableToolbar);
