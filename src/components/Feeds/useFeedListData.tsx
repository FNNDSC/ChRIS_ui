import { useQuery } from "@tanstack/react-query";
import { useTypedSelector } from "../../store/hooks";
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

export const useFeedListData = () => {
  const query = useSearchQueryParams();
  const isLoggedIn = useTypedSelector((state) => state.user.isLoggedIn);
  const { perPage, page, type, search, searchType } = useSearchQuery(query);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["feeds", perPage, page, type, search, searchType],
    queryFn: () => fetchFeeds({ perPage, page, type, search, searchType }),
    enabled: type === "private" || isLoggedIn,
  });

  const {
    data: publicFeeds,
    isLoading: publicFeedLoading,
    isFetching: publicFeedFetching,
  } = useQuery({
    queryKey: ["publicFeeds", perPage, page, type, search, searchType],
    queryFn: () =>
      fetchPublicFeeds({ perPage, page, type, search, searchType }),
    enabled: type === "public" || !isLoggedIn,
  });

  const feedCount =
    type === "private" ? data?.totalFeedsCount : publicFeeds?.totalFeedsCount;

  const loadingFeedState =
    isLoading || isFetching || publicFeedLoading || publicFeedFetching;

  return {
    feedCount,
    loadingFeedState,
    feedsToDisplay:
      type === "private" ? data?.feeds || [] : publicFeeds?.feeds || [],
    searchFolderData: { perPage, page, type, search, searchType },
  };
};
