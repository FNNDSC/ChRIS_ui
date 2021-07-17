export type Tree = Array<{
  name: string, 
  item: any,
  hasChildren: boolean,
  children: Tree
}>;

export class Directory {
  static buildDirectoryTree(list:Array<any>): Tree {
    const tree: Tree = [];

    const level = { tree };
    list.forEach((item) => {
      const paths = item.fname.split('/')
      paths.reduce((branch:any, name:string, index:number) => {
        if(!branch[name]) {
          branch[name] = { tree: [] }
          branch.tree.push({ 
            name, 
            item: index === paths.length - 1 ? item : null, 
            hasChildren: index < paths.length - 1,
            children: branch[name].tree 
          });
        }

        return branch[name];
      }, level)
    });

    return tree;
  }

  static findChildDirectory(dir:Tree, name:string): Tree {
    for (const child of dir) {
      if (child.name === name)
        return child.children;
    }
    return [];
  }
}
