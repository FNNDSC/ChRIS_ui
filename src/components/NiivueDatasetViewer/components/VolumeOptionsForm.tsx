import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  Slider,
  Text,
  TextContent,
  TextVariants,
  Tooltip,
} from "@patternfly/react-core";
import { RedoIcon } from "@patternfly/react-icons";
import type React from "react";
import type { ChNVRVolume } from "../models";
import type { DatasetVolume } from "../statefulTypes";
import ColormapDropdown from "./ColormapDropdown";

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
              <>
                <ColormapSelector
                  currentColormap={state.colormap}
                  defaultColormap={defaultOptions.colormap}
                  setColormap={(colormap) => onChange({ ...state, colormap })}
                />

                {state.cal_min !== undefined &&
                  state.cal_max !== undefined &&
                  defaultOptions.cal_min !== undefined &&
                  defaultOptions.cal_max !== undefined && (
                    <>
                      <FormGroup label="cal_min">
                        <Slider
                          value={state.cal_min}
                          onChange={(_e, cal_min) =>
                            onChange({ ...state, cal_min })
                          }
                          min={defaultOptions.cal_min}
                          max={state.cal_max}
                          step={
                            (defaultOptions.cal_max - defaultOptions.cal_min) /
                            20
                          }
                        />
                      </FormGroup>
                      <FormGroup label="cal_max">
                        <Slider
                          value={state.cal_max}
                          onChange={(_e, cal_max) =>
                            onChange({ ...state, cal_max })
                          }
                          min={state.cal_min}
                          max={2 * defaultOptions.cal_max}
                          step={
                            (defaultOptions.cal_max - defaultOptions.cal_min) /
                            20
                          }
                        />
                      </FormGroup>
                    </>
                  )}
              </>
            )}
          </FormGroup>
          <FormGroup label="Opacity">
            <Slider
              value={state.opacity}
              onChange={(_e, opacity) => onChange({ ...state, opacity })}
              min={0.0}
              max={1.0}
              step={0.05}
            />
          </FormGroup>
        </Form>
      </CardBody>
    </Card>
  );
};

export default VolumeOptionsForm;
