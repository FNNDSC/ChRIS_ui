import { Button, Tooltip } from "@patternfly/react-core";
import { Drawer, List, Space } from "antd";
import { useDispatch } from "react-redux";
import {
  clearSelectFolder,
  setToggleCart,
  startDownload,
} from "../../../store/cart/actionts";
import { useTypedSelector } from "../../../store/hooks";
import { FileIcon, FolderIcon } from "../../Icons";

const Cart = () => {
  const dispatch = useDispatch();
  const { openCart, selectedPaths } = useTypedSelector((state) => state.cart);

  return (
    <Drawer
      width={"500px"}
      title={
        <>
          <Button
            style={{
              marginRight: "1em",
            }}
          >
            Create Feed
          </Button>
          <Button
            onClick={() => {
              console.log("Download");
              dispatch(startDownload(selectedPaths));
            }}
          >
            Download
          </Button>
        </>
      }
      open={openCart}
      onClose={() => {
        dispatch(setToggleCart());
      }}
      extra={
        <Space>
          <Button
            style={{ color: "inherit" }}
            variant="danger"
            onClick={() => {
              console.log("Clicked");
            }}
          >
            Clear Cart
          </Button>
        </Space>
      }
    >
      <List
        dataSource={selectedPaths}
        bordered
        renderItem={(item) => {
          return (
            <List.Item
              key={item.path}
              actions={[
                <Button
                  onClick={() => {
                    dispatch(clearSelectFolder(item.path));
                  }}
                  variant="secondary"
                  size="sm"
                  key={`a-${item.path}`}
                >
                  Clear
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={item.type === "folder" ? <FolderIcon /> : <FileIcon />}
                title={
                  <Tooltip content={item.path}>
                    <a href="http://" style={{ color: "inherit" }}>
                      {item.path}
                    </a>
                  </Tooltip>
                }
              />
            </List.Item>
          );
        }}
      />
    </Drawer>
  );
};

export default Cart;
