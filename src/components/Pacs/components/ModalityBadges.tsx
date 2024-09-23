import { Flex, Tag } from "antd";

const ModalityBadges: React.FC<{ modalities: string }> = ({ modalities }) => {
  const modalityList = modalities
    .split(/\s+|\\/)
    .map((s) => s.trim())
    .reduce(
      (acc: string[], cur) => (acc.includes(cur) ? acc : acc.concat(cur)),
      [],
    );
  return (
    <Flex gap={0}>
      {modalityList.map((modality) => (
        <Tag key={modality} color="var(--pf-v5-global--primary-color--300)">
          {modality}
        </Tag>
      ))}
    </Flex>
  );
};

export default ModalityBadges;
