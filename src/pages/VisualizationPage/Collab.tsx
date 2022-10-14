import React from "react";
import { useDispatch } from "react-redux";
import {
  ModalVariant,
  Modal,
  Form,
  FormGroup,
  TextInput,
  Button,
  ActionGroup,
} from "@patternfly/react-core";
import { setSidebarActive } from "../../store/ui/actions";
import Wrapper from "../Layout/PageWrapper";
import { useTypedSelector } from "../../store/hooks";
import { setCurrentUrl } from "../../store/resources/actions";

interface Value {
  [key: string]: string;
}

const Collab = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [value, setValue] = React.useState<Value>({});

  const url = useTypedSelector((state) => state.resource.url);

  const dispatch = useDispatch();
  React.useEffect(() => {
    document.title = "Collab";
    if (!url) {
      setIsOpen(true);
    }
    dispatch(
      setSidebarActive({
        activeItem: "collab",
      })
    );
  }, [dispatch, url]);

  const handleInputChange = (url: string, valueString: string) => {
    setValue({
      ...value,
      [url]: valueString,
    });
  };

  const handleModalToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Wrapper>
      <Modal
        variant={ModalVariant.small}
        isOpen={isOpen}
        onClose={handleModalToggle}
      >
        <Form isHorizontal>
          <FormGroup fieldId="url" label="Enter the URL" isRequired>
            <TextInput
              aria-label="collab"
              value={value.url}
              isRequired
              type="text"
              id="horizontal-form-name"
              aria-describedby="horizontal-form-name-helper"
              name="horizontal-form-name"
              onChange={(value) => {
                handleInputChange("url", value);
              }}
            />
          </FormGroup>
          <FormGroup fieldId="token" label="Enter the Token" isRequired>
            <TextInput
              isRequired
              type="text"
              id="horizontal-form-name"
              aria-describedby="horizontal-form-name-helper"
              name="horizontal-form-name"
              onChange={(value) => {
                handleInputChange("token", value);
              }}
            />
          </FormGroup>
          <ActionGroup>
            <Button
              onClick={() => {
                if (value.url && value.token) {
                  dispatch(setCurrentUrl(value.url));
                  setIsOpen(false);
                }
              }}
              variant="primary"
            >
              Submit
            </Button>
          </ActionGroup>
        </Form>
      </Modal>
      <div
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        {url && (
          <iframe
            style={{
              height: "100%",
              width: "100%",
            }}
            allowFullScreen
            src={url}
            title="Medview"
           />
        )}
      </div>
    </Wrapper>
  );
};

export default Collab;
