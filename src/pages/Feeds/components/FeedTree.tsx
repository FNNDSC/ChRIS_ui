import * as React from "react";
import { Item } from '../../../store/feed/types';



interface PropsFromDispatch {

}

interface ITreeProps {
    items: Item[];
    // Add more props here if needed
};

type AllProps = ITreeProps & PropsFromDispatch;

class FeedTree extends React.Component<AllProps> {
    
    public render() {
        const { items } = this.props;
       
        return (
            (items.length >0) ?
                <div>TREE COMPONENT</div> :
                    <div>Empty tree</div>
        )
    }

}

export default FeedTree;