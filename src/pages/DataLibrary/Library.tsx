import React, { useContext, useState } from "react";
import { Route } from "react-router-dom";
import { RouterContext, RouterProvider } from "../../containers/Routing/RouterContext";
import { MainRouterContext } from "../../routes";
import { Alert, AlertActionLink, AlertGroup } from "@patternfly/react-core";

import UserLibrary from "./components/UserLibrary";
import PACSLookup from "./components/PACSLookup";
import { PACSDemo } from "./components/PACSLookup/demo";
import { DataItem } from "./DataTypes";

export const [State, LibraryContext] = RouterContext({
	state: {
		selectData: [] as DataItem[]
	}
})

export const Library: React.FC = () => {
	const [state, setState] = useState(State)
	const [route, setRoute] = useState<string>()
	
	const router = useContext(MainRouterContext)

	const actions = {
		select: (dataitem: DataItem) => setState({ selectData: [ ...state.selectData, dataitem ] }),
		clear: () => setState({ selectData: [] }),

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

		{
			state.selectData.length ? (
				<AlertGroup isToast>
					<Alert
						isLiveRegion
						variant="info"
						title={`${state.selectData.length} studies selected`}
						actionLinks={
							<React.Fragment>
								<AlertActionLink onClick={actions.createFeedWithSelected}>Create Feed</AlertActionLink>
								<AlertActionLink onClick={actions.clear}>Clear</AlertActionLink>
							</React.Fragment>
						}
					/>
				</AlertGroup>
			) : null
		}
		</>
	)
}

export default Library
