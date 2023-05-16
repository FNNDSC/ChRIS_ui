import React, { useState } from "react";
import {TextInput, DropdownToggle, Dropdown, DropdownItem } from "@patternfly/react-core";
import "./dataTableToolbar.scss";

type AllProps = {
  label: string;
  onSearch: (search: string, searchType:string) => void;
};

export enum FeedsQueryTypes{
  ID="Id",
  MIN_ID="Min_Id",
  MAX_ID="Max_Id",
  NAME="Name",
  NAME_EXACT="Name_Exact",
  NAME_STARTSWITH="Name_Startswith",
  FILES_FNAME_ICONTAINS="Files_Fname_Icontains",
  MIN_CREATION_DATE="Min_Creation_Date",
  MAX_CREATION_DATE="Max_Creation_Date"

}

const DataTableToolbar: React.FunctionComponent<AllProps> = (
  props: AllProps
) => {
  const [value, setValue] = useState("");
  const [dropdownValue, setDropdownValue] = React.useState<string>( FeedsQueryTypes.NAME)
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
    return<DropdownItem key={feed} component="button" onClick={() => updateDropdownValue(feed)}>
    {feed}
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
