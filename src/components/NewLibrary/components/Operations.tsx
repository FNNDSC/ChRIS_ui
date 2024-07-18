import { Button } from "@patternfly/react-core";
import type { MenuProps } from "antd";
import { Dropdown } from "antd";
import { AddIcon } from "../../Icons";
import { useRef } from "react";
import { useDispatch } from "react-redux";
import { startUpload } from "../../../store/cart/actionts";
import { useTypedSelector } from "../../../store/hooks";

const items: MenuProps["items"] = [
  {
    key: "1",
    label: "New Folder",
  },
  {
    key: "2",
    label: "File Upload",
  },
  {
    key: "3",
    label: "Folder Upload",
  },
];

const Operations = () => {
  const username = useTypedSelector((state) => state.user.username);
  const dispatch = useDispatch();
  const folderInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files || [];
    const files = Array.from(fileList);
    dispatch(
      startUpload({
        files: files,
        isFolder: false,
        currentPath: `home/${username}/uploads/test-upload-cart`,
      }),
    );
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files || [];
    const files = Array.from(fileList);

    dispatch(
      startUpload({
        files: files,
        isFolder: true,
        currentPath: `home/${username}/uploads`,
      }),
    );
  };

  return (
    <>
      <Dropdown
        menu={{
          items,
          selectable: true,
          onClick: (info) => {
            if (info.key === "3") {
              folderInput.current?.click();
            }
            if (info.key === "2") {
              fileInput.current?.click();
            }
          },
        }}
      >
        <Button
          icon={
            <AddIcon
              style={{
                color: "inherit",
                height: "1em",
                width: "1em",
              }}
            />
          }
        >
          New
        </Button>
      </Dropdown>
      <input
        ref={folderInput}
        style={{ display: "none" }}
        type="file"
        //@ts-ignore
        webkitdirectory="true"
        onChange={handleFolderChange}
        multiple
      />
      <input
        ref={fileInput}
        style={{ display: "none" }}
        type="file"
        onChange={handleFileChange}
        multiple
      />
    </>
  );
};

export default Operations;
