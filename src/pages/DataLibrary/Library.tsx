import React, { useContext, useState } from "react";
import { Route } from "react-router-dom";
import { RouterContext, RouterProvider } from "../../containers/Routing/RouterContext";
import { MainRouterContext } from "../../routes";
import { Alert, AlertActionLink, AlertGroup, Chip, ChipGroup } from "@patternfly/react-core";

import UserLibrary from "./components/UserLibrary";
import PACSLookup from "./components/PACSLookup";
import { PACSDemo } from "./components/PACSLookup/demo";
import { PACSStudy } from "../../api/pfdcm";

export const [State, LibraryContext] = RouterContext({
	state: {
		selectData: [] as PACSStudy[]
	}
})

export const Library: React.FC = () => {
	const [state, setState] = useState(State)
	const [route, setRoute] = useState<string>()
	
	const router = useContext(MainRouterContext)

	const actions = {
		select: (item: PACSStudy) => setState({ selectData: [ ...state.selectData, item ] }),
		clear: (itemid?: string) => {
			if (!itemid)
				setState({ selectData: [] });
			else {
				for (let i=0; i < state.selectData.length; i++) {
					if (state.selectData[i].studyInstanceUID === itemid) {
						const selection = state.selectData.slice(0, i).concat(state.selectData.slice(i+1))
						setState({ selectData: selection })
					}
				}
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
					title={
						`Selected ${state.selectData.length} ${state.selectData.length > 1 ? 'studies' : 'study'}. ` + 
						'Start an analysis with selected studies.'
					}
					style={{ width: "100%", marginTop: "3em" }}
					actionLinks={
						<React.Fragment>
							<AlertActionLink onClick={actions.createFeedWithSelected}>Create Feed</AlertActionLink>
							<AlertActionLink onClick={actions.clear.bind(Library, undefined)}>Clear</AlertActionLink>
						</React.Fragment>
					}
				>
					<ChipGroup>
						{
							state.selectData.map(({ studyInstanceUID, patientName, modalitiesInStudy }) => (
								<Chip key={studyInstanceUID} onClick={actions.clear.bind(Library, studyInstanceUID)}>
									{ patientName }, { modalitiesInStudy }
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
