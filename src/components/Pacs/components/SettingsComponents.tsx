import React from "react";
import axios from "axios";
import { PacsQueryContext, Types } from "../context";
import { Checkbox, Button } from "@patternfly/react-core";
import ChrisApiClient from "../../../api/chrisapiclient";
import { useTypedSelector } from "../../../store/hooks";
import "@patternfly/react-core/dist/styles/base.css";

const SettingsComponent = ({
	study,
	handleModalClose,
}: {
	study: any;
	handleModalClose: () => void;
}) => {
	const username = useTypedSelector((state) => state.user.username);
	const { dispatch } = React.useContext(PacsQueryContext);
	const [recordDict, setRecordDict] = React.useState<Record<string, boolean>>(
		{},
	);

	const handleChange = (key: string, checked: boolean) => {
		if (!recordDict[key]) {
			setRecordDict({
				...recordDict,
				[key]: checked,
			});
		} else {
			const newState = { ...recordDict };
			delete newState[key];
			setRecordDict(newState);
		}
	};

	return (
		<div>
			{Object.entries(study).map(([key]) => {
				return (
					<div
						key={key}
						style={{ display: "flex", alignItems: "center" }}
					>
						<Checkbox
							id={key}
							isChecked={recordDict[key] ? true : false}
							onChange={(_event, checked: boolean) => {
								handleChange(key, checked);
							}}
							aria-label={`Study ${key} Checkbox`}
						/>
						<div
							style={{
								flex: "1",
								display: "flex",
								alignItems: "center",
								marginLeft: "1rem",
								fontWeight: "bold",
							}}
						>
							{key}
						</div>
					</div>
				);
			})}

			<Button
				onClick={async () => {
					const url = `${
						import.meta.env.VITE_CHRIS_UI_URL
					}uploadedfiles/`;

					const client = ChrisApiClient.getClient();
					await client.setUrls();
					const formData = new FormData();
					const fileName = "settings.json";

					const data = JSON.stringify(recordDict);

					formData.append(
						"upload_path",
						`${username}/uploads/config/${fileName}`,
					);

					formData.append(
						"fname",
						new Blob([data], {
							type: "application/json",
						}),
						fileName,
					);

					const config = {
						headers: {
							Authorization: "Token " + client.auth.token,
						},
					};

					await axios.post(url, formData, config);

					dispatch({
						type: Types.SET_RESOURCES_DICT,
						payload: {
							type: "study",
							resourcesDict: recordDict,
						},
					});

					handleModalClose();
				}}
				variant="tertiary"
				style={{
					marginTop: "1rem",
				}}
			>
				Submit
			</Button>

			<Button
				style={{
					marginLeft: "1rem",
				}}
				variant="tertiary"
				onClick={() => {
					setRecordDict({});

					dispatch({
						type: Types.SET_RESOURCES_DICT,
						payload: {
							type: "study",
							resourcesDict: {},
						},
					});
				}}
			>
				Reset to Default
			</Button>
		</div>
	);
};

export default SettingsComponent;
