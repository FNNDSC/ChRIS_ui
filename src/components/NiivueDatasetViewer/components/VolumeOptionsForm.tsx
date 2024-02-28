import {
  Card,
  CardBody,
  CardTitle,
  Form,
  FormGroup,
  Button,
  Flex,
  FlexItem,
  Tooltip,
  TextContent,
  Text,
  TextVariants,
} from "@patternfly/react-core";
import { RedoIcon } from "@patternfly/react-icons";
import ColormapDropdown from "./ColormapDropdown";
import React from "react";
import { ChNVRVolume } from "../models";
import { DatasetVolume } from "../statefulTypes";

type VolumeOptionsFormProps = {
  name: string;
  state: ChNVRVolume;
  defaultOptions: DatasetVolume["default"];

  onChange: (nextState: ChNVRVolume) => void;
};

const ColormapLabel: React.FC<{ is: string }> = ({ is }) => (
  <TextContent>
    <Text component={TextVariants.p}>
      This volume contains labels color-coded by the <code>{is}</code> file.
    </Text>
  </TextContent>
);

const ColormapSelector: React.FC<{
  currentColormap: string;
  defaultColormap: string;
  setColormap: (cm: string) => void;
}> = ({ currentColormap, defaultColormap, setColormap }) => (
  <Flex>
    <FlexItem grow={{ default: "grow" }}>
      <ColormapDropdown
        selectedColormap={currentColormap}
        onSelect={setColormap}
      />
    </FlexItem>
    <FlexItem>
      <Tooltip content={`Reset colormap to "${defaultColormap}"`}>
        <Button
          isDisabled={currentColormap === defaultColormap}
          onClick={() => setColormap(defaultColormap)}
        >
          <RedoIcon />
        </Button>
      </Tooltip>
    </FlexItem>
  </Flex>
);

/**
 * A form to change the options of a volume.
 */
const VolumeOptionsForm: React.FC<VolumeOptionsFormProps> = ({
  name,
  state,
  defaultOptions,
  onChange,
}) => {
  return (
    <Card isPlain>
      <CardTitle>{name}</CardTitle>
      <CardBody>
        <Form>
          <FormGroup label="Colormap">
            {defaultOptions.colormapLabelFile ? (
              <ColormapLabel is={defaultOptions.colormapLabelFile} />
            ) : (
              <ColormapSelector
                currentColormap={state.colormap}
                defaultColormap={defaultOptions.colormap}
                setColormap={(colormap) => onChange({ ...state, colormap })}
              />
            )}
          </FormGroup>
        </Form>
      </CardBody>
    </Card>
  );
};

export default VolumeOptionsForm;
