import { useMemo } from "react";
import { Typography } from "antd";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router";
import WrapperConnect from "../Wrapper";
import { LibraryProvider } from "../LibraryCopy/context";
import ChrisAPIClient from "../../api/chrisapiclient";
import { fetchResource } from "../../api/common";
import Browser from "../LibraryCopy/Browser";
import { InfoIcon } from "../Common";
import {
	Breadcrumb,
	BreadcrumbItem,
	PageSection,
} from "@patternfly/react-core";

const { Paragraph, Text } = Typography;

const useSearchQuery = (query: URLSearchParams) => {
	const search = query.get("search");
	const searchSpace = query.get("space");

	let resultsArray: any[] = [];
	const client = ChrisAPIClient.getClient();
	if (searchSpace === "feeds") {
		const payload = {
			limit: 10,
			offset: 0,
			files_fname_icontains: search,
		};

		const fetchResourceforSearch = async (payload) => {
			const fn = client.getFeeds;
			const boundFn = fn.bind(client);
			return await fetchResource(payload, boundFn);
		};

		const searchData = useQuery({
			queryKey: ["search", payload],
			queryFn: () => fetchResourceforSearch(payload),
		});

		if (searchData.data?.resource?.length > 0) {
			searchData.data?.resource.forEach((result: any) => {
				resultsArray.push({
					folder_path: result.data.creator_username,
					folder_name: `feed_${result.data.id}`,
				});
			});
		}
	}

	if (searchSpace === "pacs") {
		const payload = {
			limit: 10,
			offset: 0,
			fname_icontains_topdir_unique: search,
		};

		const fetchResourceForSearch = async (payload) => {
			const fn = client.getPACSFiles;
			const boundFn = fn.bind(client);
			return await fetchResource(payload, boundFn);
		};

		const searchData = useQuery({
			queryKey: ["search", payload],
			queryFn: () => fetchResourceForSearch(payload),
		});

		if (searchData.data?.resource?.length > 0) {
			searchData.data?.resource.forEach((result: any) => {
				const folderSplit = result.data.fname.split("/");
				const folder_path = folderSplit.slice(0, 3).join("/");

				resultsArray.push({
					folder_path: folder_path,
					folder_name: folderSplit[3],
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

	return (
		<WrapperConnect>
			<PageSection>
				<InfoIcon
					title="Library Search Results"
					p2={
						<Paragraph>
							In addition to browsing over the entire file space,
							the Library also allows for powerful searching
							across the three main parts of the ChRIS Library.
							The <Text strong>Uploads </Text>
							shows all the data (organized by folder) that has
							been uploaded from some external source (typically a
							filesystem). The{" "}
							<Text strong>Completed Analyses</Text> allows easy
							navigation down all the Analyses that have been
							completed in ChRIS. The <Text strong>SERVICES</Text>{" "}
							allows easy browsing of data associated with some
							external service, such as a Picture Archive and
							Communications System (PACS) database.
						</Paragraph>
					}
				/>
			</PageSection>
			<PageSection>
				<LibraryProvider>
					{searchFolderData &&
						searchFolderData.length > 0 &&
						searchFolderData.map((data, index) => {
							return <SearchBrowser key={index} data={data} />;
						})}
				</LibraryProvider>
			</PageSection>
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

		navigate(`/librarycopy/${url}`);
	};

	return (
		<>
			<Breadcrumb style={{ marginLeft: "1rem", marginTop: "0.5rem" }}>
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
