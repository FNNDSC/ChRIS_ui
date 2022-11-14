import { EventDataNode } from "rc-tree/lib/interface";
import { DataBreadcrumb } from "../types/feed";

import { fetchFilesFromAPath } from "../../../../store/resources/saga";

export const getNewTreeData = (
  treeData: DataBreadcrumb[],
  curKey: string,
  child: DataBreadcrumb[]
) => {
  const loop = (data: DataBreadcrumb[]) => {
    data.forEach((item) => {
      if (
        curKey.indexOf(item.key as string) === 0 ||
        (item.key as string).indexOf(curKey) === 0
      ) {
        if (item.children) {
          loop(item.children);
        } else if (item.key === curKey) {
          item.children = child;
        }
      }
    });
  };

  loop(treeData);
};

export const generateTreeNodes = async (
  treeNode: EventDataNode,

): Promise<DataBreadcrumb[]> => {
  const arr: any[] = [];
  //@ts-ignore
  const { files, folders } = await fetchFilesFromAPath(treeNode.breadcrumb);
  const items = [...files, ...folders];

  for (let i = 0; i < items.length; i++) {
    if (typeof items[i] === "object") {
      const filePath = items[i].data.fname.split("/");
      const fileName = filePath[filePath.length - 1];
      arr.push({
        //@ts-ignore
        breadcrumb: `${treeNode.breadcrumb}/${fileName}`,
        title: fileName,
        key: `${treeNode.key}-${i}`,
        isLeaf: true,
      });
    } else {
      arr.push({
        //@ts-ignore
        breadcrumb: `${treeNode.breadcrumb}/${items[i]}`,
        title: items[i],
        key: `${treeNode.key}-${i}`,
      });
    }
  }

  return arr;
};
