import { Select } from "antd";
import type { ReadonlyNonEmptyArray } from "fp-ts/lib/ReadonlyNonEmptyArray";

type Props = {
  services: ReadonlyNonEmptyArray<string>;
  service: string;
  setService: (service: string) => void;
};

export default (props: Props) => {
  const { services, service, setService } = props;
  const style = { width: "100%" };

  return (
    <div title="PACS service">
      <Select
        options={services.map((value) => ({ label: value, value }))}
        value={service}
        onChange={setService}
        style={style}
      />
    </div>
  );
};
