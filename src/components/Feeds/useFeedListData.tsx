import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "../../store/hooks";
import { fetchFeeds, fetchPublicFeeds } from "./utilties"; // Your API functions
import { useLocation } from "react-router";
import { useMemo } from "react";

export function useSearchQueryParams() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const useSearchQuery = (query: URLSearchParams) => ({
  page: query.get("page") || "1",
  search: query.get("search") || "",
  searchType: query.get("searchType") || "name",
  perPage: query.get("perPage") || "20",
  type: query.get("type") || "public",
});

export const useFeedListData = (theType: string) => {
  const query = useSearchQueryParams();
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const { perPage, page, search, searchType } = useSearchQuery(query);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["feeds", perPage, page, theType, search, searchType],
    queryFn: () =>
      fetchFeeds({ perPage, page, type: theType, search, searchType }),
    enabled: theType === "private" || isLoggedIn,
  });

  const {
    data: publicFeeds,
    isLoading: publicFeedLoading,
    isFetching: publicFeedFetching,
  } = useQuery({
    queryKey: ["publicFeeds", perPage, page, theType, search, searchType],
    queryFn: () =>
      fetchPublicFeeds({ perPage, page, type: theType, search, searchType }),
    enabled: theType === "public" || !isLoggedIn,
  });

  const feedCount =
    theType === "private"
      ? data?.totalFeedsCount
      : publicFeeds?.totalFeedsCount;

  const loadingFeedState =
    isLoading || isFetching || publicFeedLoading || publicFeedFetching;

  return {
    feedCount,
    loadingFeedState,
    feedsToDisplay:
      theType === "private" ? data?.feeds || [] : publicFeeds?.feeds || [],
    searchFolderData: { perPage, page, type: theType, search, searchType },
  };
};
