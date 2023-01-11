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

export const generateTreeNodes =  async(tree: DataBreadcrumb[]): Promise<DataBreadcrumb[]> => {
  for(const node of tree){
    const arr: any[] = [];
      //@ts-ignore
    const { files, folders } = await fetchFilesFromAPath(node.breadcrumb);
    const items = [...files, ...folders];

    for (let i = 0; i < items.length; i++) {
      if (typeof items[i] === "object") {
        const filePath = items[i].data.fname.split("/");
        const fileName = filePath[filePath.length - 1];
        arr.push({
          //@ts-ignore
          breadcrumb: `${node.breadcrumb}/${fileName}`,
          title: fileName,
          key: `${node.key}-${i}`,
          isLeaf: true,
        });
      } else {
        arr.push({
          //@ts-ignore
          breadcrumb: `${node.breadcrumb}/${items[i]}`,
          title: items[i],
          key: `${node.key}-${i}`,
        });
      }
    }
    //@ts-ignore
    getNewTreeData(tree, node.key, arr)
  }
    //@ts-ignore

  return tree
  
 };

