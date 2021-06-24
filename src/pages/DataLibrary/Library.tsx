import React, { useContext, useState } from "react";
import { Route } from "react-router-dom";
import { RouterContext, RouterProvider } from "../../containers/Routing/RouterContext";
import { MainRouterContext } from "../../routes";
import { Alert, AlertActionLink, AlertGroup, Chip, ChipGroup } from "@patternfly/react-core";

import UserLibrary from "./components/UserLibrary";
import PACSLookup from "./components/PACSLookup";
import { PACSDemo } from "./components/PACSLookup/demo";
import { PACSSeries } from "../../api/pfdcm";

export const [State, LibraryContext] = RouterContext({
	state: {
		selectData: [] as PACSSeries[]
	}
})

export const Library: React.FC = () => {
	const [state, setState] = useState(State)
	const [route, setRoute] = useState<string>()
	
	const router = useContext(MainRouterContext)

	const actions = {
		select: (item: PACSSeries | PACSSeries[]) => {
			if (Array.isArray(item))
				setState({ selectData: [ ...state.selectData, ...item ] })
			else
				setState({ selectData: [ ...state.selectData, item ] })
		},
		
		clear: (itemid?: string | Array<string>) => {
			if (!itemid)
				setState({ selectData: [] });
			else {
				const fselection = (arr: PACSSeries[], find: string) => {
					for (let i=0; i < arr.length; i++) {
						if (arr[i].seriesInstanceUID === find) {
							return arr.slice(0, i).concat(arr.slice(i+1))
						}
					}
					return arr
				}

				if (Array.isArray(itemid)) {
					let selection = state.selectData;
					for (const id of itemid)
						selection = fselection(selection, id)
					setState({ selectData: selection })
				}
				else 
					setState({ selectData: fselection(state.selectData, itemid) })
			}
		},

		createFeedWithSelected: router.actions.createFeedWithData
			.bind(Library, state.selectData)
	}

	return (
		<>
		<RouterProvider {...{actions, state, route, setRoute}} context={LibraryContext}>
			<Route exact path="/library" component={UserLibrary} />
			<Route path="/library/swift" component={PACSLookup} />
			<Route path="/library/pacs" component={PACSLookup} />
			<Route path="/library/pacsdemo" component={PACSDemo} />
		</RouterProvider>

		{ state.selectData.length !== 0 &&
			<AlertGroup isToast>
				<Alert
					variant="info"
					title={`Selected ${state.selectData.length} series.`}
					style={{ width: "100%", marginTop: "3em" }}
					actionLinks={
						<React.Fragment>
							<AlertActionLink onClick={actions.clear.bind(Library, undefined)}>Pull Series</AlertActionLink>
							<AlertActionLink onClick={actions.createFeedWithSelected}>Create Feed</AlertActionLink>
							<AlertActionLink onClick={actions.clear.bind(Library, undefined)}>Clear</AlertActionLink>
						</React.Fragment>
					}
				>
					<ChipGroup>
						{
							state.selectData.map(({ seriesInstanceUID, seriesDescription, patientName, modality }) => (
								<Chip key={seriesInstanceUID} onClick={actions.clear.bind(Library, seriesInstanceUID)}>
									{ patientName }, { modality }, {seriesDescription}
								</Chip>
							))
						}
					</ChipGroup>
				</Alert>
			</AlertGroup>
		}
		</>
	)
}

export default Library
