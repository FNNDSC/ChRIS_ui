import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ApplicationState } from "../../../store/root/applicationState";
import { setSidebarActive } from "../../../store/ui/actions";
import { RouteComponentProps } from "react-router-dom";
import {
  PageSection,
  PageSectionVariants,
  Grid,
  GridItem,
  DataList,
  DataListItem,
  DataListToggle,
  DataListContent,
} from "@patternfly/react-core";

import { pf4UtilityStyles } from '../../../lib/pf4-styleguides';
import './feed.scss';
interface PropsFromDispatch {
  setSidebarActive: typeof setSidebarActive;
}
type AllProps = PropsFromDispatch & RouteComponentProps;

class FeedView extends React.Component<AllProps> {
  componentDidMount() {
    const { setSidebarActive } = this.props;
    document.title = "My Feeds - ChRIS UI Demo site";
    setSidebarActive({
      activeItem: 'my_feeds',
      activeGroup: 'feeds_grp'
    })
  }

  render() {
    const { children } = this.props;
    let isExpanded = true;
    const toggle = (id: string) => {
      isExpanded = !isExpanded;
      console.log(isExpanded, id);
    };

    return (
      <React.Fragment>
        <PageSection variant={PageSectionVariants.darker}>
          <h1>Hippocampal Volume</h1>
        </PageSection>
        {/* {`${pf4UtilityStyles.accessibleStyles.hiddenOnLg} ${pf4UtilityStyles.spacingStyles.mr_0}`} */}
        <PageSection className={pf4UtilityStyles.spacingStyles.p_0} variant={PageSectionVariants.light}>
          <Grid className="feed-view">
            <GridItem className="feed-block pf-u-p-md" sm={12} md={6}  >
              Feed tree chart
            </GridItem>
            <GridItem className="node-block pf-u-p-md" sm={12} md={6} >
              Selected node information block
            </GridItem>
          </Grid>
        </PageSection>
        {/* Bottom section with information */}
        <PageSection>
          <div className="plugin-info pf-u-py-md" >
            <h1>Plugin Title</h1>
            <Grid>
              <GridItem sm={12} md={4}  >
                <DataList aria-label="Expandable data list example">
                  <DataListItem aria-labelledby="ex-item1" isExpanded={isExpanded}>
                    [Plugin Name]
              <DataListToggle
                      onClick={() => toggle('ex-toggle1')}
                      isExpanded={isExpanded}
                      id="ex-toggle1"
                      aria-labelledby="ex-toggle1 ex-item1"
                      aria-label="Toggle details for"
                    />
                    <DataListContent aria-label="Primary Content Details" isHidden={!isExpanded}>
                      test
                  </DataListContent>
                  </DataListItem>
                </DataList>
              </GridItem>
              <GridItem sm={12} md={4}  >
                <DataList aria-label="Expandable data list example">
                  <DataListItem aria-labelledby="ex-item1" isExpanded={isExpanded}>
                    [Plugin Name]
              <DataListToggle
                      onClick={() => toggle('ex-toggle1')}
                      isExpanded={isExpanded}
                      id="ex-toggle1"
                      aria-labelledby="ex-toggle1 ex-item1"
                      aria-label="Toggle details for"
                    />
                    <DataListContent aria-label="Primary Content Details" isHidden={!isExpanded}>
                      <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
                    </DataListContent>
                  </DataListItem>
                </DataList>
              </GridItem>
              <GridItem sm={12} md={4}  >
                <DataList aria-label="Expandable data list example">
                  <DataListItem aria-labelledby="ex-item1" isExpanded={isExpanded}>
                    [Plugin Name]
                    <DataListToggle
                            onClick={() => toggle('ex-toggle1')}
                            isExpanded={isExpanded}
                            id="ex-toggle1"
                            aria-labelledby="ex-toggle1 ex-item1"
                            aria-label="Toggle details for"
                          />
                    <DataListContent aria-label="Primary Content Details" isHidden={!isExpanded}>
                      <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et
                        dolore magna aliqua.</p>
                    </DataListContent>
                  </DataListItem>
                </DataList>
              </GridItem>
            </Grid>

          </div>
          {/* END OF Bottom section with information */}
        </PageSection>
      </React.Fragment>
    );
  }
}


const mapDispatchToProps = (dispatch: Dispatch) => ({
  setSidebarActive: (active: { activeItem: string, activeGroup: string }) => dispatch(setSidebarActive(active))
});

const mapStateToProps = ({ ui }: ApplicationState) => ({
  sidebarActiveItem: ui.sidebarActiveItem,
  sidebarActiveGroup: ui.sidebarActiveGroup
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedView)
