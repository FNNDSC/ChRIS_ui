import React, { useContext, useState } from "react";
import { Route } from "react-router-dom";
import { RouterContext, RouterProvider } from "../../containers/Routing/RouterContext";
import { MainRouterContext } from "../../routes";
import {
  Alert,
  AlertActionLink,
  AlertGroup,
  Chip,
  ChipGroup,
} from "@patternfly/react-core";
import UserLibrary from "./components/UserLibrary";
import PACSLookup from "./components/PACSLookup";
import pluralize from "pluralize";

export type File = string;
export type Series = File[];

export const [State, LibraryContext] = RouterContext({
	state: {
		selectData: [] as Series
	}
})

export const Library: React.FC = () => {
	document.title = 'Data Library';

	const [state, setState] = useState(State)
	const [route, setRoute] = useState<string>()
	
	const router = useContext(MainRouterContext)

	const actions = {
		isSelected: (s: File) => state.selectData.includes(s),
		isSeriesSelected: (s: Series) => s.every(f => state.selectData.includes(f)),
		select: (item: File | Series) => {
			if (Array.isArray(item))
				setState({ selectData: [ ...state.selectData, ...item ] })
			else
				setState({ selectData: [ ...state.selectData, item ] })
		},
		
		clear: (itemid?: File | Series) => {
			if (!itemid)
				setState({ selectData: [] });
			else {
				const fselection = (arr: Series, find: string) => {
					for (let i=0; i < arr.length; i++) {
						if (arr[i] === find) {
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
			<Route path="/library/pacs" component={PACSLookup} />
			<Route path="/library" component={UserLibrary} />
		</RouterProvider>

		{ state.selectData.length !== 0 &&
			<AlertGroup isToast>
				<Alert
					variant="info"
					title={`Selected ${state.selectData.length} ${pluralize('file', state.selectData.length)}.`}
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
							state.selectData.map((fname) => (
								<Chip key={fname} onClick={actions.clear.bind(Library, fname)}>
									{ fname.split('/').reverse().shift() }
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
