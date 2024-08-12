import { useState, useCallback, useMemo } from "react";
import { useLocation } from "react-router";
import { useDispatch } from "react-redux";
import { debounce } from "lodash";

export interface FilterState {
  perPage: number;
  page: number;
  search: string;
  searchType: string;
}

export const usePaginate = () => {
  const [filterState, setFilterState] = useState<FilterState>({
    perPage: 15,
    page: 1,
    search: "",
    searchType: "name",
  });
  const { perPage, page, search, searchType } = filterState;
  const dispatch = useDispatch();

  const handlePageSet = (_e: any, page: number) => {
    setFilterState({
      ...filterState,
      page,
    });
  };

  const handlePerPageSet = (_e: any, perPage: number) => {
    setFilterState({ ...filterState, perPage });
  };

  const handleFilterChange = (search: string, searchType: string) => {
    setFilterState({
      ...filterState,
      search,
      searchType,
    });
  };

  const debouncedFilterUpdate = debounce(
    (search: string, searchType: string) =>
      handleFilterChange(search, searchType),
    100,
  );

  const run = useCallback(
    (action: any) => {
      dispatch(action(searchType, search, perPage, perPage * (page - 1)));
    },
    [page, perPage, search, dispatch, searchType],
  );

  return {
    filterState,
    handlePageSet,
    handlePerPageSet,
    handleFilterChange,
    run,
    debouncedFilterUpdate,
    dispatch,
  };
};

export function useSearchQueryParams() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}
