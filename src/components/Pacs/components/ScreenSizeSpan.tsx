import { Grid } from "antd";

type Props = {
  mobile: string;
  desktop: string;
};

export default (props: Props) => {
  const { mobile, desktop } = props;
  const screens = Grid.useBreakpoint();
  const prompt = screens.md ? desktop : mobile;
  return <>{prompt}</>;
};
