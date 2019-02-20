import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { ApplicationState } from '../../../store/root/applicationState';
import { setSidebarActive } from '../../../store/ui/actions';
import { getPluginInstanceListRequest } from '../../../store/feed/actions';
import { IFeedState } from '../../../store/feed/types';
import { RouteComponentProps } from 'react-router-dom';
import FeedTree from './FeedTree';
import {
  PageSection,
  PageSectionVariants,
  Grid,
  GridItem,
  DataList,
  DataListItem,
  DataListToggle,
  DataListContent
} from '@patternfly/react-core';
import { pf4UtilityStyles } from '../../../lib/pf4-styleguides';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import imgPlaceholder from '../../../assets/images/feed_ph_70x70.png';
import './feed.scss';

interface IPropsFromDispatch {
  setSidebarActive: typeof setSidebarActive;
  getPluginInstanceListRequest: typeof getPluginInstanceListRequest;

}
type AllProps = IFeedState & IPropsFromDispatch & RouteComponentProps<{ id: string }>;

class FeedView extends React.Component<AllProps> {
  constructor(props: AllProps) {
    super(props);
    const { setSidebarActive, getPluginInstanceListRequest, match } = this.props;
    const feedId = match.params.id;
    !!feedId && getPluginInstanceListRequest('2');
    document.title = 'My Feeds - ChRIS UI Demo site';
    setSidebarActive({
      activeGroup: 'feeds_grp',
      activeItem: 'my_feeds'
    });

    this.onNodeClick = this.onNodeClick.bind(this);
  }

  render() {
    const { items } = this.props;
    let isExpanded = true; // ***** working *****
    const toggle = (id: string) => {
      isExpanded = !isExpanded;
    };

    // NOTE: working - will separate into components ***** working
    return (
      <React.Fragment>
        {/* Top section with Feed information */}
        <PageSection variant={PageSectionVariants.darker}>
          <div className="feed-info-block pf-l-grid">
            <div className="pf-l-grid__item pf-m-1-col">
              <img src={imgPlaceholder} alt="placeholder for feed" />
            </div>
            <div className="pf-l-grid__item pf-m-11-col">
              <h1>Hippocampal Volume - [Feed Title]</h1>
              <ul className="pf-c-list pf-m-inline">
                <li>
                  <small>Creator</small>
                  <p><FontAwesomeIcon icon={['far', 'user']} /> [user name]</p>
                </li>
                <li>
                  <small>Created</small>
                  <p><FontAwesomeIcon icon={['far', 'calendar-alt']} /> 2 Jan 2018 @ 14:23</p>
                </li>
                <li>
                  <small>Total Runtime</small>
                  <p><FontAwesomeIcon icon={['far', 'clock']} /> 3h, 8min</p>
                </li>
              </ul>
            </div>
          </div>
        </PageSection>
        {/* END Top section with Feed information */}

        {/* Mid section with Feed and node actions */}
        <PageSection className={pf4UtilityStyles.spacingStyles.p_0} variant={PageSectionVariants.light}>
          <Grid className="feed-view">
            <GridItem className="feed-block pf-u-p-md" sm={12} md={6}  >
              {
                (!!items) ?
                  <FeedTree items={items} onNodeClick={this.onNodeClick} /> :
                   <div>Empty tree message</div>
              }
            </GridItem>
            <GridItem className="node-block pf-u-p-md" sm={12} md={6} >
              Selected node information block
            </GridItem>
          </Grid>
        </PageSection>
        {/* END Mid section with Feed and node actions */}

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
                      aria-label="Toggle details for" />
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


  // Description: handle node clicks to load next node information
  onNodeClick(node: any) {
    // Node was clicked
    console.log('Trigger the load of information on the panels', node);
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getPluginInstanceListRequest: (id: string) => dispatch(getPluginInstanceListRequest(id)),
  setSidebarActive: (active: { activeItem: string, activeGroup: string }) => dispatch(setSidebarActive(active)),
});

const mapStateToProps = ({ ui, feed }: ApplicationState) => ({
  items: feed.items,
  sidebarActiveGroup: ui.sidebarActiveGroup,
  sidebarActiveItem: ui.sidebarActiveItem
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(FeedView);
