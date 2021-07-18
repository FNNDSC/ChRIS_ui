type PathList = Array<{ 
  fname: string,
  [x: string]: any
}>;

type Tree = Array<{
  name: string, 
  item: any,
  prefix: string,
  hasChildren: boolean,
  children: Tree
}>;

class DirectoryTree {
  dir: Tree = [];
  list: PathList = [];

  constructor(dir: Tree) {
    this.dir = dir;
  }

  /**
   * Build a directory tree from file paths.
   * @param list List of files paths
   * @returns Tree
   */
  static fromPathList(list: PathList) {
    const dir: Tree = [];
    const level = { dir };

    list.forEach((item) => {
      const paths = item.fname.split('/')
      paths.reduce((branch:any, name:string, index:number) => {
        if(!branch[name]) {
          branch[name] = { dir: [] }
          branch.dir.push({ 
            name, 
            prefix: paths.slice(0, index).join('/'),
            item: index === paths.length - 1 ? item : null, 
            hasChildren: index < paths.length - 1,
            children: branch[name].dir 
          });
        }

        return branch[name];
      }, level)
    });

    const tree = new DirectoryTree(dir);
    tree.list = list;
    return tree
  }

  /**
   * Get immediate child.
   * @param name child name
   * @returns Tree
   */
  child(name: string): DirectoryTree {
    for (const child of this.dir) {
      if (child.name === name)
        return new DirectoryTree(child.children);
    }
    return new DirectoryTree([]);
  }

  /**
   * Primitive intersection search.
   * @param query Search term
   * @returns Tree
   */
  searchTree(query: string): DirectoryTree {
    let space = this.list;

    for (const token of query.split(" ")) {
      space = space.filter(({ fname }) => fname.includes(token))
    }

    return DirectoryTree.fromPathList(space)
  }
}

export default DirectoryTree
