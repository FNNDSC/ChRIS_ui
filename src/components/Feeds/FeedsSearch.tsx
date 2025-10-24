import { Input, Select, Space } from "antd";

const { Search } = Input;

const options = [
  {
    value: "name",
    label: "Name",
  },
  {
    value: "id",
    label: "ID",
  },
  {
    value: "name_exact",
    label: "Exact Match",
  },

  {
    value: "name_startsWith",
    label: "Match Starts With",
  },
];

interface FeedSearchProps {
  search: string;
  searchType: string;
  onSearch: (search: string, searchType: string) => void;
  loading: boolean;
}

const FeedSearch = ({
  search,
  searchType,
  onSearch,
  loading,
}: FeedSearchProps) => {
  return (
    <Space size="middle">
      <Select
        onChange={(value: string) => {
          onSearch(search, value);
        }}
        value={searchType}
        options={options}
      />
      <Search
        onChange={(e) => {
          onSearch(e.target.value, searchType);
        }}
        value={search}
        loading={loading && search.length > 0}
        enterButton="Search"
        placeholder="Search in Analyses"
      />
    </Space>
  );
};

export default FeedSearch;
