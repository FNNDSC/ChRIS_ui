import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import debounce from "lodash/debounce";
interface FilterState {
  perPage: number;
  page: number;
  filter: string;
}

export const usePaginate = () => {
  const [filterState, setFilterState] = useState<FilterState>({
    perPage: 20,
    page: 1,
    filter: "",
  });
  const { perPage, page, filter } = filterState;
  const dispatch = useDispatch();

  const handlePageSet = (e: any, page: number) => {
    setFilterState({
      ...filterState,
      page,
    });
  };

  const handlePerPageSet = (e: any, perPage: number) => {
    setFilterState({ ...filterState, perPage });
  };

  const handleFilterChange = debounce((value: string) => {
    setFilterState({
      ...filterState,
      filter: value,
    });
  }, 200);

  const run = useCallback(
    (action) => {
      dispatch(action(filter, perPage, perPage * (page - 1)));
    },
    [page, perPage, filter, dispatch]
  );

  return {
    filterState,
    handlePageSet,
    handlePerPageSet,
    run,
    handleFilterChange,
  };
};
