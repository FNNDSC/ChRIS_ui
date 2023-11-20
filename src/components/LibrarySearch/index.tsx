import { useMemo } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router";
import WrapperConnect from "../Wrapper";
import { LibraryProvider } from "../LibraryCopy/context";
import ChrisAPIClient from "../../api/chrisapiclient";
import { fetchResource } from "../../api/common";
import Browser from "../LibraryCopy/Browser";
import { Breadcrumb, BreadcrumbItem } from "@patternfly/react-core";

const useSearchQuery = (query: URLSearchParams) => {
	const search = query.get("search");
	const searchSpace = query.get("space");

	let resultsArray = [];

	if (searchSpace === "feeds") {
		const payload = {
			limit: 10,
			offset: 0,
			files_fname_icontains: search,
		};

		const fetchResourceforSearch = async (payload) => {
			const client = ChrisAPIClient.getClient();
			const fn = client.getFeeds;
			const boundFn = fn.bind(client);
			return await fetchResource(payload, boundFn);
		};

		const searchData = useQuery({
			queryKey: ["search", payload],
			queryFn: () => fetchResourceforSearch(payload),
		});

		console.log("Search Data", searchData);

		if (searchData.data?.resource.length > 0) {
			searchData.data?.resource.forEach((result) => {
				resultsArray.push({
					folder_path: result.data.creator_username,
					folder_name: `feed_${result.data.id}`,
				});
			});
		}
	}

	return resultsArray;
};

function useSearchQueryParams() {
	const { search } = useLocation();

	return useMemo(() => new URLSearchParams(search), [search]);
}

export default function LibrarySearch() {
	
	const query = useSearchQueryParams();
	const searchFolderData = useSearchQuery(query);

	console.log("SearchFolderData", searchFolderData, query);
	return (
		<WrapperConnect>
			<LibraryProvider>
				{searchFolderData &&
					searchFolderData.length > 0 &&
					searchFolderData.map((data, index) => {
						return <SearchBrowser key={index} data={data} />;
					})}
			</LibraryProvider>
		</WrapperConnect>
	);
}

function SearchBrowser({ data }: { data: any }) {
	const navigate = useNavigate();
	const pathSplit = data.folder_path.split("/");

	const handleFolderClick = (path: string, folder?: boolean) => {
		let url = "";

		if (!folder) {
			url = `${data.folder_path}/${path}`;
		} else url = `${path}/${data.folder_name}`;

		console.log("URL", url);

		navigate(`/librarycopy/${url}`);
	};

	return (
		<>
			<Breadcrumb style={{ marginLeft: "1rem" }}>
				{pathSplit.map((path, index: number) => {
					return (
						<BreadcrumbItem
							to="#"
							onClick={() => {
								handleFolderClick(path, false);
							}}
							key={index}
						>
							{path}
						</BreadcrumbItem>
					);
				})}
			</Breadcrumb>
			<Browser
				files={[]}
				folders={[data.folder_name]}
				handleFolderClick={handleFolderClick}
			/>
		</>
	);
}
