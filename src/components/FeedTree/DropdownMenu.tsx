import { Dropdown, type MenuProps } from "antd";
import { useDispatch } from "react-redux";
import { useTypedSelector } from "../../store/hooks";
import { getNodeOperations } from "../../store/plugin/actions";
import { AddIcon, DeleteIcon, PatternflyArchiveIcon } from "../Icons";

const DropdownMenu = ({
  children,
  handleZip,
}: {
  children: React.ReactElement;
  handleZip: () => void;
}) => {
  const { selectedPlugin } = useTypedSelector((state) => {
    return state.instance;
  });
  const cancelled =
    selectedPlugin?.data.status === "cancelled" ||
    selectedPlugin?.data.status === "finishedWithError";
  const dispatch = useDispatch();
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: "Add a Child Node",
      icon: <AddIcon />,
      disabled: cancelled,
    },
    {
      key: "2",
      label: "Add a Pipeline",
      icon: <AddIcon />,
      disabled: cancelled,
    },
    {
      key: "3",
      label: "Add a Graph Node",
      disabled: true,
      icon: <AddIcon />,
    },
    {
      key: "4",
      label: "Delete a Node",
      disabled:
        selectedPlugin?.data.plugin_type === "fs" &&
        selectedPlugin?.data.plugin_name === "pl-dircopy",
      icon: <DeleteIcon />,
    },
    {
      key: "5",
      label: "Zip",
      icon: <PatternflyArchiveIcon />,
    },
  ];

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    e.domEvent.stopPropagation();

    if (e.key === "1") {
      dispatch(getNodeOperations("childNode"));
    }
    if (e.key === "2") {
      dispatch(getNodeOperations("childPipeline"));
    }

    if (e.key === "3") {
      dispatch(getNodeOperations("graphNode"));
    }

    if (e.key === "4") {
      dispatch(getNodeOperations("deleteNode"));
    }

    if (e.key === "5") {
      handleZip();
    }
  };

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const handleLongPress: MenuProps["onTouchStart"] = (e) => {
    // Our mobile experience is horribly broken due to the drawers. This feature will be tested once that is in order
    e.preventDefault();
    // Open the dropdown on long press
    // You may adjust the duration based on your preference
    setTimeout(() => {
      // Open the dropdown
      handleMenuClick(e);
    }, 500); // 500 milliseconds as an example duration for long press
  };

  return (
    <Dropdown
      menu={{
        items,
        onClick: !isMobile ? handleMenuClick : undefined,
        onTouchStart: isMobile ? handleLongPress : undefined,
      }}
      trigger={isMobile ? ["click"] : ["contextMenu"]}
      arrow
    >
      {children}
    </Dropdown>
  );
};

export default DropdownMenu;
