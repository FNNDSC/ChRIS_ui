export const fastsurferJson = () => {
  return [
    {
      id: 1,
      name: "pl-dircopy",
      previous_id: null,
    },
    {
      id: 2,
      name: "pl-pfdicom_tagExtract",
      previous_id: 1,
    },
    {
      id: 3,
      name: "pl-pfdicom_tagSub",
      previous_id: 1,
    },
    {
      id: 4,
      name: "pl-pfdicom_tagExtract",
      previous_id: 3,
    },
    {
      id: 5,
      name: "pl-fshack",
      previous_id: 4,
    },
    {
      id: 6,
      name: "pl-fastsurfer_inference",
      previous_id: 5,
    },
    {
      id: 7,
      name: "pl-multipass",
      previous_id: 6,
    },
    {
      id: 8,
      name: "pl-pfdorun",
      previous_id: 7,
    },
    {
      id: 9,
      name: "pl-mgz2LUT_report",
      previous_id: 6,
    },
  ];
};

export const freesurferJson = () => {
  return [
    {
      id: 1,
      name: "pl-dircopy",
      previous_id: null,
    },
    {
      id: 2,
      name: "pl-pfdicom_tagExtract",
      previous_id: 1,
    },
    {
      id: 3,
      name: "pl-pfdicom_tagSub",
      previous_id: 1,
    },
    {
      id: 4,
      name: "pl-pfdicom_tagExtract",
      previous_id: 3,
    },
    {
      id: 5,
      name: "adult-fs",
      previous_id: 4,
    },
    {
      id: 6,
      name: "png-images",
      previous_id: 5,
    },
    {
      id: 7,
      name: "overlay-png",
      previous_id: 6,
    },
    {
      id: 8,
      name: "segmentation-report",
      previous_id: 5,
    },
  ];
};

export interface TreeNode {
  children: TreeNode[];
  id: number;
  name: string;
  parentId: number | null;
}

export interface TreeType {
  id: number;
  name: string;
  previous_id: number | null;
}

export const getFeedTree = (items: TreeType[]) => {
  const tree = [],
    mappedArr: {
      [key: string]: TreeNode;
    } = {};

  items.forEach((item) => {
    const id = item.id;
    if (!mappedArr.hasOwnProperty(id)) {
      mappedArr[id] = {
        id: id,
        name: item.name,
        parentId: item.previous_id && item.previous_id,
        children: [],
      };
    }
  });

  for (const id in mappedArr) {
    let mappedElem;
    if (mappedArr.hasOwnProperty(id)) {
      mappedElem = mappedArr[id];
      if (mappedElem.parentId) {
        const parentId = mappedElem.parentId;
        if (parentId && mappedArr[parentId] && mappedArr[parentId].children) {
          mappedArr[parentId].children.push(mappedElem);
        }
      } else tree.push(mappedElem);
    }
  }
  return tree;
};
