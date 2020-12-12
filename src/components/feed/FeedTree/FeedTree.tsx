import React, { useEffect, useRef } from "react";
import {connect} from 'react-redux';
import {Spinner} from '@patternfly/react-core'
import {ApplicationState} from '../../../store/root/applicationState'
import {PluginInstancePayload} from '../../../store/feed/types'
import {PluginInstance} from '@fnndsc/chrisapi'
import "./feedTree.scss";
import TreeModel from "../../../api/models/tree.model";



interface ITreeProps {
  pluginInstances:PluginInstancePayload,
  selectedPlugin?:PluginInstance
}



const FeedTree:React.FC<ITreeProps>=({
  pluginInstances,
  selectedPlugin
})=>{
const treeRef=useRef<HTMLDivElement>(null);
const {data:instances, error, loading}=pluginInstances

useEffect(()=>{
if(instances && instances.length>0){
  buildTree(instances)
}

},[instances,selectedPlugin])

const buildTree=(items:PluginInstance[])=>{
  const tree=new TreeModel(items)
  console.log('FeedTree:', tree)
}

if(loading){
  return <Spinner size='sm'/>
}

if(error){
  return <div>Oh snap ! Something went wrong. Please refresh your browser</div>
}

return (
  <div
    style={{
      textAlign: "center",
    }}
    ref={treeRef}
    id="tree"
  >
  </div>
);
}



const mapStateToProps=({feed}:ApplicationState)=>({
pluginInstances:feed.pluginInstances,
selectedPlugin:feed.selectedPlugin
})



export default connect(mapStateToProps)(FeedTree)











