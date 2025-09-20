/**
 * Tag tree utilities for building hierarchical tag structures
 */

export interface TagNode {
  name: string;
  fullPath: string;
  children: TagNode[];
  isLeaf: boolean;
  linkCount?: number;
}

export function buildTagTree(tagPaths: string[]): TagNode {
  const root: TagNode = {
    name: '',
    fullPath: '',
    children: [],
    isLeaf: false,
  };

  for (const tagPath of tagPaths) {
    const segments = tagPath.split('/');
    let current = root;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const fullPath = segments.slice(0, i + 1).join('/');
      
      let child = current.children.find(c => c.name === segment);
      
      if (!child) {
        child = {
          name: segment,
          fullPath,
          children: [],
          isLeaf: i === segments.length - 1,
        };
        current.children.push(child);
      }
      
      current = child;
    }
  }

  // Sort children alphabetically
  function sortChildren(node: TagNode) {
    node.children.sort((a, b) => a.name.localeCompare(b.name));
    node.children.forEach(sortChildren);
  }

  sortChildren(root);
  return root;
}

export function flattenTagTree(node: TagNode): TagNode[] {
  const result: TagNode[] = [];
  
  function traverse(current: TagNode) {
    if (current.fullPath) {
      result.push(current);
    }
    current.children.forEach(traverse);
  }
  
  traverse(node);
  return result;
}

export function getTagBreadcrumbs(tagPath: string): Array<{ name: string; path: string }> {
  const segments = tagPath.split('/');
  const breadcrumbs: Array<{ name: string; path: string }> = [];
  
  for (let i = 0; i < segments.length; i++) {
    const path = segments.slice(0, i + 1).join('/');
    breadcrumbs.push({
      name: segments[i],
      path,
    });
  }
  
  return breadcrumbs;
}

export function findTagNode(root: TagNode, tagPath: string): TagNode | null {
  const segments = tagPath.split('/');
  let current = root;
  
  for (const segment of segments) {
    const child = current.children.find(c => c.name === segment);
    if (!child) {
      return null;
    }
    current = child;
  }
  
  return current;
}

export function getAllParentPaths(tagPath: string): string[] {
  const segments = tagPath.split('/');
  const parentPaths: string[] = [];
  
  for (let i = 1; i < segments.length; i++) {
    parentPaths.push(segments.slice(0, i).join('/'));
  }
  
  return parentPaths;
}

export function getAllChildPaths(root: TagNode, tagPath: string): string[] {
  const node = findTagNode(root, tagPath);
  if (!node) return [];
  
  return flattenTagTree(node).map(n => n.fullPath);
}
