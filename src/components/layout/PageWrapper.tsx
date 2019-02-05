import * as React from 'react'
import { Page,  PageSection, PageSectionVariants, BackgroundImage, BackgroundImageSrc } from '@patternfly/react-core';
import Header from './Header';
import Sidebar from './Sidebar';
interface AllProps {
    // children: (props: any) => React.ReactNode
}

class Wrapper extends React.Component {
    onNavToggle = () => {
        // Toggle Navbar
    }

    render() {
        const { children } = this.props;
      
        return (
            <React.Fragment>
                <BackgroundImage src={'/images/header-background.png'} />
                <Page 
                    header={<Header/>} 
                    sidebar={<Sidebar />} >
                    <PageSection variant={PageSectionVariants.light}>
                        {children}
                    </PageSection>
                </Page>
            </React.Fragment>
        );
    }
}

export default Wrapper;