import { useContext } from "react";
import { MainRouterContext } from "../../routes";
import { AlertGroup, ChipGroup, Button , Chip} from "@patternfly/react-core";
import { Alert } from "antd";
import { LibraryContext } from "./context";
import { clearCart, clearSelectFolder } from "./context/actions";


export default function Cart() {
  const { state, dispatch } = useContext(LibraryContext);
  const router = useContext(MainRouterContext);
  const { selectedPaths } = state;

  const handleDownload = () => {
    console.log("Handle Download");
  };

  const createFeed = () => {
    const pathList = selectedPaths.map((path) => path);
    router.actions.createFeedWithData(pathList);
  };

  const clearFeed = () => {
    dispatch(clearCart());
    router.actions.clearFeedData();
  };

  const handleDelete = () => {
    console.log("Handle Delete");
  };

  if (selectedPaths.length > 0) {
    return (
      <AlertGroup isToast>
        <Alert
          type="info"
          onClose={() => {
            console.log("Clicked");
          }}
          description={
            <>
              <div
                style={{
                  marginBottom: "1em",
                  display: "flex",
                }}
              >
                <Button
                  style={{ marginRight: "0.5em" }}
                  onClick={createFeed}
                  variant="primary"
                >
                  Create Analysis
                </Button>

                <Button
                  style={{ marginRight: "0.5em" }}
                  onClick={() => {
                    handleDownload();
                  }}
                  variant="secondary"
                >
                  Download Data
                </Button>
                <Button variant="danger" onClick={handleDelete}>
                  Delete Data
                </Button>
              </div>
              {selectedPaths.length > 0 && (
                <>
                  <ChipGroup style={{ marginBottom: "1em" }} categoryName="">
                    {selectedPaths.map((path: string, index: number) => {
                      return (
                        <Chip
                          onClick={() => {
                            dispatch(clearSelectFolder(path));
                          }}
                          key={index}
                        >
                          {path}
                        </Chip>
                      );
                    })}
                  </ChipGroup>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Button variant="tertiary" onClick={clearFeed}>
                      Empty Cart
                    </Button>
                  </div>
                </>
              )}
            </>
          }
          style={{ width: "100%", marginTop: "3em", padding: "2em" }}
        ></Alert>
      </AlertGroup>
    );
  } else {
    return null;
  }
}
