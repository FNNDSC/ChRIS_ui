import React, { SyntheticEvent, useEffect, useState } from "react";
import { useTypedSelector } from "../../../store/hooks";
import { getPluginInstanceGraph } from "./utils";
import Tree, { CustomNodeElementProps, Orientation, TreeLinkDatum, TreeNodeDatum, TreeProps } from 'react-d3-tree';
import { NodeFileRef, NodeTree } from "./utils/NodeData";
import { HierarchyPointNode } from "d3-hierarchy";
import FileBrowser from "../FeedOutputBrowser/FileBrowser";
import { useFeedBrowser } from "../FeedOutputBrowser/useFeedBrowser";
import "./NodeTree.css";

import FileDetailView from "../Preview/FileDetailView";
import { FileBrowserProps } from "../FeedOutputBrowser/types";
import { TbFile, TbFolder, TbJpg, TbJson, TbMarkdown, TbPng } from "react-icons/tb";
import { setFilePreviewPanel } from "../../../store/drawer/actions";
import { setSelectedFile } from "../../../store/explorer/actions";
import { useDispatch } from "react-redux";
import { FeedFile, PluginInstance } from "@fnndsc/chrisapi";

function IwFileIcon({ ext } : { ext: string} )
{
	if (ext === "png") return (<TbPng />);
	if (ext === "jpg") return (<TbJpg />);
	if (ext === "md") return (<TbMarkdown />);
	if (ext === "json") return (<TbJson />);
	//if (ext === "dcm") return (<TbFile />);

	return (<TbFile />);
}

function IwFileBrowser(props: FileBrowserProps)
{
	const {files, folders} = props.pluginFilesPayload;
	const [selected, setSelected] = useState("");
	const [currentFolder, setCurrentFolder] = useState(props.pluginFilesPayload.path);
	const dispatch = useDispatch();

	function clickRowFile(file: FeedFile)
	{
		setSelected(file.data.fname);
		dispatch(setSelectedFile(file, props.selected));
	}

	function clickRowFolder(folder: string)
	{
		props.handleFileClick(folder);
		setCurrentFolder(folder);
	}

	function setDefaultSelected()
	{
		if (selected !== "")
			return;

		if (files.length == 0)
			return;

		// todo: find the first or middle file that is an image
	
		const defaultFile = files.at(files.length / 2)!;
		clickRowFile(defaultFile);
	}

	useEffect(setDefaultSelected, [selected]);

	return (
		<div>
			{folders.map((folder) =>
			{
				const name = `${currentFolder}/${folder}`;
				const shortName = name.substring(name.lastIndexOf('/') + 1);
				const ext = name.substring(name.lastIndexOf('.') + 1);
				const isSelected = name == selected;
				const rowClass = `cs410f23-fileview-row ${isSelected ? "cs410f23-fileview-row-selected" : ""}`;

				// onClick={() => { clickRow(file); } }

				return (
					<div key={name} className={rowClass} onClick={() => { clickRowFolder(name); } }>
						<span className="cs410f23-fileview-row-icon"><TbFolder /></span>
						<span>{shortName}</span>
					</div>
				);
			})}

			{files.map((file) =>
			{
				const name = file.data.fname;
				const shortName = name.substring(name.lastIndexOf('/') + 1);
				const ext = name.substring(name.lastIndexOf('.') + 1);
				const isSelected = name == selected;
				const rowClass = `cs410f23-fileview-row ${isSelected ? "cs410f23-fileview-row-selected" : ""}`;

				return (
					<div key={name} className={rowClass} onClick={() => { clickRowFile(file); } }>
						<span className="cs410f23-fileview-row-icon"><IwFileIcon ext={ext} /></span>
						<span>{shortName}</span>
					</div>
				);
			})}
		</div>
	);
}

function CustomNode({ element, onMouseOver, onMouseOut }: { element: CustomNodeElementProps, onMouseOver: () => any, onMouseOut: () => any}) 
{
	const data = (element.nodeDatum as unknown as NodeTree).data;
	const selectedTest = data.node;
	
	const fileBrowserProps = useFeedBrowser(data.node);
	const selectedFilePayload = useTypedSelector( (state) => state.explorer.selectedFile );
	const { pluginFilesPayload, handleFileClick, filesLoading } = fileBrowserProps;

	return (
		<foreignObject
			className="cs410f23-wrap"
			width={200}
			height={300}
			x={-100}
			y={-150}
		>
			<div className="cs410f23-node" 
				onMouseOver={onMouseOver}
				onMouseOut={onMouseOut}
			>
				<div className="cs410f23-preview">
					{selectedFilePayload && selectedTest && (
						<FileDetailView
							selectedFile={selectedFilePayload[selectedTest.data.id]}
							preview="small"
						/>
					)}
				</div>

				<div className="cs410f23-header">
					<p>{data.title}</p>
					<div className="iw-controls">
						<span><i className="bi bi-image iw-button-preview"></i></span>
						<span><i className="bi bi-folder iw-button-body"></i></span>
					</div>
				</div>

				<div className="cs410f23-body">
					<div className="cs410f23-fileview">
						{pluginFilesPayload && selectedTest ? (
							<IwFileBrowser
								//@ts-ignore
								selected={selectedTest}
								handleFileClick={handleFileClick}
								pluginFilesPayload={pluginFilesPayload}
								filesLoading={filesLoading}
								usedInsideFeedOutputBrowser={false}
							/>
						) : (
							<div>Files are not available yet </div>
						)}
					</div>
					<div className="cs410f23-status"></div>
				</div>
			</div>
		</foreignObject>
	);
}

const gNodeWidth = 200;

function straightPathFunc(link: TreeLinkDatum): string {
	const { source, target } = link;

	const sourceX = source.y + gNodeWidth / 2;
	const sourceY = source.x + 65;
	const targetX = target.y - gNodeWidth / 2 - 2;
	const targetY = target.x + 65;

	// calculate the x and y coordinates of the handle points
	const sourceHandleX = sourceX + 100;
	const sourceHandleY = sourceY;
	const targetHandleX = targetX - 100;
	const targetHandleY = targetY;

	// construct the path using the handle points and node points
	const path = `M${sourceX},${sourceY} C${sourceHandleX},${sourceHandleY} ${targetHandleX},${targetHandleY} ${targetX},${targetY}`;

	return path;
}

function ReactFlowContainer() {
	const pluginInstances = useTypedSelector(
		(state) => state.instance.pluginInstances
	);

	const { data: instances } = pluginInstances;
	const [nodes, setNodes] = useState(new NodeTree());
	const [allowMove, setAllowMove] = useState(false);

	useEffect(() => {
		if (instances) {
			const getData = async () => {
				const nodeTree = await getPluginInstanceGraph(instances);
				nodeTree && setNodes(nodeTree);
			};

			getData();
		}

	}, []);

	const disableMovingChart = () => setAllowMove(false);
	const enableMovingChart = () => setAllowMove(true);

	return (
		<div className="cs410f23-node-tree">

			<svg style={{height: 0}}>
				<defs>
					<marker id="end-arrow" viewBox="0 -5 10 10" refX="6" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,-5L10,0L0,5" fill="#8a8d90"></path><path d="M0,-5L10,0L0,5" fill="#8a8d90"></path></marker>
				</defs>
			</svg>

			<Tree
				data={nodes}
				draggable={allowMove}
				zoomable={allowMove}
				collapsible={false}
				renderCustomNodeElement={(element: CustomNodeElementProps) => {
					return <CustomNode 
								element={element}
								onMouseOver={disableMovingChart}
								onMouseOut={enableMovingChart} 
							/>;
				}}
				pathFunc={straightPathFunc}
				nodeSize={{ x: 300, y: 400 }}
			/>
		</div>
	);
}

export default ReactFlowContainer;
