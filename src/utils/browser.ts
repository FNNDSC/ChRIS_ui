import { UploadedFile } from "@fnndsc/chrisapi";

type PathItem = UploadedFile | any;
type PathList = PathItem[];

export type Branch = {
  name: string, 
  item: any,
  prefix: string,
  hasChildren: boolean,
  isLast: boolean,
  children: Tree,
  creation_date: Date
};

export type Tree = Branch[];

class DirectoryTree {
  dir: Tree;
  list: PathList;

  constructor(dir: Tree, list?: PathList) {
    this.dir = dir;
    this.list = list || [];
  }

  /**
   * Build a directory tree from file paths.
   * @param list List of files paths
   * @returns Tree
   */
  static fromPathList(list: PathList) {
    const dir: Tree = [];
    const level = { dir };

    for (const item of list) {
      const paths = item.data.fname.split('/')
      paths.reduce((branch:any, name:string, index:number) => {
        if(!branch[name]) {
          branch[name] = { dir: [] }
          branch.dir.push({ 
            name, 
            prefix: paths.slice(0, index).join('/'),
            item: index === paths.length - 1 ? item : null, 
            hasChildren: index < paths.length - 1,
            isLast: index === paths.length - 2,
            children: branch[name].dir,
            creation_date: item.data.creation_date
          });
        }

        return branch[name];
      }, level)
    }

    return new DirectoryTree(dir, list);
  }

  static fileList(list: PathList, prefix: string) {
    return new DirectoryTree(
      list.map(item => {
        const fname = item.data.fname.split('/');
        return {
          name: fname[fname.length - 1], 
          item,
          prefix,
          children: [],
          isLast: true,
          hasChildren: false,
          creation_date: item.data.creation_date
        }
      })
    )
  }

  /**
   * Get immediate child.
   * @param name child name
   * @returns Tree
   */
  child(name: string): DirectoryTree {
    for (const child of this.dir) {
      if (child.name === name) {
        const list = this.list.filter(({ data }) => data.fname.includes(child.prefix))
        return new DirectoryTree(child.children, list);
      }
    }
    return new DirectoryTree([]);
  }

  /**
   * Intersection search.
   * @param query Search term
   * @returns Tree
   */
  searchTree(query: string): DirectoryTree {
    let space = this.list;

    for (const token of query.split(" ")) {
      space = space.filter((item: PathItem) => item.data.fname.includes(token))
    }

    const dir = DirectoryTree.fromPathList(space)
      .findChildren(query.split(" ")[0])

    return new DirectoryTree(dir, space)
  }

  /**
   * Recursively find a child which contains a query
   * @param query find what
   * @param dir 
   * @param found 
   * @returns Tree
   */
  findChildren(query: string, dir = this.dir, found: Tree = []): Tree {
    for (const _dir of dir) {
      if (!_dir.hasChildren)
        return []

      if (_dir.children.filter(({ name }) => name.includes(query)).length)
        found.push(_dir)
      else
        this.findChildren(query, _dir.children, found)
    }

    return found
  }
}

export default DirectoryTree
