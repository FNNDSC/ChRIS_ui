import React from 'react'
import { PageSection } from '@patternfly/react-core'
import { FeedDetails } from '../../../components'

const FeedViewMobile = () => {
  return (
    <div className="feed-view-mobile">
      <PageSection
        hasShadowBottom
        variant="darker"
        className="section-one"
      ></PageSection>
      <React.Suspense fallback={<div>Fetching the Resources in a moment</div>}>
        <PageSection>
          <FeedDetails />
        </PageSection>
      </React.Suspense>
    </div>
  )
}

export default FeedViewMobile
