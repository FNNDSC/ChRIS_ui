import React from "react";
import {
  PageSection,
  Grid,
  GridItem,
  DataList,
  DataListItem,
  DataListToggle,
  DataListContent
} from "@patternfly/react-core";


interface INodeProps {
  selected: any;
}

class PluginDetailPanel extends React.Component<INodeProps> {
  render() {
    const { selected } = this.props;
    let isExpanded = true; // ***** working - to be done *****
    const toggle = (id: string) => {
      isExpanded = !isExpanded;
    };

    return (
      <React.Fragment>
        <h1>[Plugin Name]</h1>
        <Grid>
          <GridItem sm={12} md={4}>
            <DataList aria-label="Plugin Description">
              <DataListItem
                aria-labelledby="Plugin Description"
                isExpanded={isExpanded}
              >
                [Plugin Name]
                <DataListToggle
                  onClick={() => toggle("ex-toggle1")}
                  isExpanded={isExpanded}
                  id="ex-toggle1"
                  aria-labelledby="Plugin Description"
                  aria-label="Toggle details for"
                />
                <DataListContent
                  aria-label="Primary Content Details for plugin"
                  isHidden={!isExpanded}
                >
                  test
                </DataListContent>
              </DataListItem>
            </DataList>
          </GridItem>
          <GridItem sm={12} md={4}>
            <DataList aria-label="Plugin Configuration">
              <DataListItem
                aria-labelledby="Plugin Configuration"
                isExpanded={isExpanded}
              >
                [Plugin Name]
                <DataListToggle
                  onClick={() => toggle("ex-toggle1")}
                  isExpanded={isExpanded}
                  id="ex-toggle1"
                  aria-labelledby="Plugin Configuration"
                  aria-label="Toggle details for Plugin Configuration"
                />
                <DataListContent
                  aria-label="Plugin Configuration"
                  isHidden={!isExpanded}
                >
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                  </p>
                </DataListContent>
              </DataListItem>
            </DataList>
          </GridItem>
          <GridItem sm={12} md={4}>
            <DataList aria-label="Plugin Output">
              <DataListItem aria-labelledby="ex-item1" isExpanded={isExpanded}>
                [Plugin Name]
                <DataListToggle
                  onClick={() => toggle("ex-toggle1")}
                  isExpanded={isExpanded}
                  id="ex-toggle1"
                  aria-labelledby="Plugin Output"
                  aria-label="Toggle details for Plugin Output"
                />
                <DataListContent
                  aria-label="Plugin Output"
                  isHidden={!isExpanded}
                >
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit,
                    sed do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua.
                  </p>
                </DataListContent>
              </DataListItem>
            </DataList>
          </GridItem>
        </Grid>
      </React.Fragment>
    );
  }
}

export default PluginDetailPanel;
