/* This file needs to be typed */

import _ from "lodash";
export function flattenMyTree(tree) {
  function recurse(nodes, path) {
    return _.map(nodes, function (node) {
      var newPath = _.union(path, [node.name]);
      return [
        _.assign(
          { pathname: newPath.join("/"), level: path.length },
          _.omit(node, "children")
        ),
        recurse(node.children, newPath),
      ];
    });
  }
  return _.flattenDeep(recurse(tree, []));
}

export function findWhere(array, key, value) {
  let t = 0; //counter
  if (!array) return;

  while (t < array.length && array[t][key] !== value) {
    t++;
  }
  if (t < array.length) {
    return array[t];
  } else {
    return false;
  }
}

export function filterArray(testFiles) {
  return testFiles.reduce((acc, current) => {
    const x = acc.find((item) => item.path === current.path);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);
}

function generateTreeNodes(treeNode) {
  const arr = [];
  const key = treeNode.props.eventKey;
  for (let i = 0; i < 3; i += 1) {
    arr.push({ title: `leaf ${key}-${i}`, key: `${key}-${i}` });
  }
  return arr;
}

function setLeaf(treeData, curKey, level) {
  const loopLeaf = (data, lev) => {
    const l = lev - 1;
    data.forEach((item) => {
      if (
        item.key.length > curKey.length
          ? item.key.indexOf(curKey) !== 0
          : curKey.indexOf(item.key) !== 0
      ) {
        return;
      }
      if (item.children) {
        loopLeaf(item.children, l);
      } else if (l < 1) {
        item.isLeaf = true;
      }
    });
  };
  loopLeaf(treeData, level + 1);
}

function getNewTreeData(treeData, curKey, child, level) {
  const loop = (data) => {
    if (level < 1 || curKey.length - 3 > level * 2) return;
    data.forEach((item) => {
      if (curKey.indexOf(item.key) === 0) {
        if (item.children) {
          loop(item.children);
        } else {
          item.children = child;
        }
      }
    });
  };
  loop(treeData);
  setLeaf(treeData, curKey, level);
}
