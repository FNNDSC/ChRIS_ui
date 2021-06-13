import React from "react";
import { Switch, Route } from "react-router-dom";
import { PACS } from "./components/PACSQuery";

export const Query = () => {
	return (
		<Switch>
			<Route path="/pacs" component={PACS} />
		</Switch>
	)
}

export default Query
