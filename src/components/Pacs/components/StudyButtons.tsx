import { Flex, Button, Tooltip, TooltipProps } from "antd";
import { AppstoreOutlined, ImportOutlined } from "@ant-design/icons";

type StudyButtonsProps = {
  ohifUrl?: string;
  isLoading?: boolean;
  isPulled?: boolean;
  tooltipPlacement?: TooltipProps["placement"];
};

const StudyButtons: React.FC<StudyButtonsProps> = ({
  ohifUrl,
  isLoading,
  isPulled,
  tooltipPlacement = "left",
}) => (
  // TODO add "Create feed" button
  <Flex vertical={true} gap="middle">
    <Tooltip
      title={
        isPulled ? (
          <>
            This study is already pulled in <em>ChRIS</em>.
          </>
        ) : (
          <>
            Pull study to <em>ChRIS</em>
          </>
        )
      }
      placement={tooltipPlacement}
    >
      <Button
        title="Pull study"
        type="primary"
        loading={isLoading}
        disabled={isPulled}
      >
        <ImportOutlined />
      </Button>
    </Tooltip>
    {ohifUrl && (
      <Tooltip title="Open in OHIF" placement={tooltipPlacement}>
        <Button href={ohifUrl} target="_blank">
          <AppstoreOutlined />
        </Button>
      </Tooltip>
    )}
  </Flex>
);

export default StudyButtons;
