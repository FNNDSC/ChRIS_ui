import { useTypedSelector } from "../../../store/hooks";
import { Drawer, List } from "antd";
import { Tooltip } from "@patternfly/react-core";
import { useDispatch } from "react-redux";
import { setToggleCart } from "../../../store/cart/actionts";
import { FolderIcon, FileIcon } from "../../Icons";

const Cart = () => {
  const dispatch = useDispatch();
  const { openCart, selectedPaths } = useTypedSelector((state) => state.cart);

  return (
    <Drawer
      title=""
      open={openCart}
      onClose={() => {
        dispatch(setToggleCart());
      }}
    >
      <List
        dataSource={selectedPaths}
        bordered
        renderItem={(item) => {
          return (
            <List.Item key={item.path}>
              <List.Item.Meta
                avatar={item.type === "folder" ? <FolderIcon /> : <FileIcon />}
                title={
                  <Tooltip content={item.path}>
                    <a href="#" style={{ color: "inherit" }}>
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
