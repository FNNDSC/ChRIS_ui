import { SpinContainer } from "../Common";

type Props = {
  title: string;
  isHide?: boolean;
};

export default (props: Props) => {
  const { title, isHide } = props;
  return <SpinContainer title={title} isHide={isHide} />;
};
