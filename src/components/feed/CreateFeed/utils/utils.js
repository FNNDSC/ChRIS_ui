/* This file needs to be typed */

import _ from "lodash";
export function flattenMyTree(tree) {
  function recurse(nodes, path) {
    return _.map(nodes, function(node) {
      var newPath = _.union(path, [node.name]);
      return [
        _.assign(
          { pathname: newPath.join("/"), level: path.length },
          _.omit(node, "children")
        ),
        recurse(node.children, newPath)
      ];
    });
  }
  return _.flattenDeep(recurse(tree, []));
}

export function findWhere(array, key, value) {
  let t = 0; //counter

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
    const x = acc.find(item => item.path === current.path);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);
}
