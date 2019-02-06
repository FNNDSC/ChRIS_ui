import * as React from 'react'
import { Page,  PageSection, PageSectionVariants } from '@patternfly/react-core';
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
                <Page 
                    className="pf-background"
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