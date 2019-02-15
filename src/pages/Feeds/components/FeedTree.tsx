import * as React from "react";
import { Item } from '../../../store/feed/types';

interface PropsFromDispatch {

}

interface ITreeProps {
    items: Array<any>;
    // Add more props here if needed
};

type AllProps = ITreeProps & PropsFromDispatch;

class FeedTree extends React.Component<AllProps> {

    public render() {
        const { items } = this.props;
        console.log(items);
        return (
            (items.length > 0) ?
                <Tree items={items} /> :
                    <div>Empty tree</div>
        )
    }
}


class Tree extends React.Component<ITreeProps> {
    public render() {
        const { items } = this.props;
        return (
            <div>
                Build Tree in this component
               {
                    items.map((item, i) => (
                        <div key={i}>
                        id: {item.id}, feed_id: {item.feed_id}, plugin_id: {item.plugin_id}, previous_id: {item.previous_id}</div>
                    ))
                }
            </div>
        )
    }
}


export default FeedTree;