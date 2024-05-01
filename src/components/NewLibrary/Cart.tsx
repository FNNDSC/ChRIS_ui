import { Drawer, List } from "antd";
import { useContext } from "react";
import { LibraryContext } from "./context";
import { Button, Grid, GridItem } from "@patternfly/react-core";
import { FolderIcon } from "../Icons";
import { clearSelectFolder } from "./context/actions";

const Cart = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const { state, dispatch } = useContext(LibraryContext);

  return (
    <Drawer
      title="Cart"
      placement="right"
      closable={true}
      onClose={onClose}
      open={open}
    >
      <Grid hasGutter={true}>
        <GridItem span={4}>
          <Button size="sm" variant="primary">
            Create Feed
          </Button>
        </GridItem>

        <GridItem span={4}>
          <Button size="sm" variant="primary">
            Download
          </Button>
        </GridItem>

        <GridItem span={4}>
          <Button size="sm" variant="danger">
            Delete
          </Button>
        </GridItem>
      </Grid>
      <List
        style={{ marginTop: "2rem" }}
        dataSource={state.selectedPaths}
        bordered
        renderItem={(item) => {
          return (
            <List.Item
              key={item}
              actions={[
                <a
                  // biome-ignore lint/a11y/useValidAnchor: <explanation>
                  onClick={() => {
                    dispatch(clearSelectFolder(item));
                  }}
                  key={`a-${item}`}
                >
                  Clear
                </a>,
              ]}
            >
              <List.Item.Meta
                avatar={<FolderIcon />}
                title={<a href="https://ant.design/index-cn">{item}</a>}
              />
            </List.Item>
          );
        }}
      />
    </Drawer>
  );
};

export default Cart;
