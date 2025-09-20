'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Tag } from 'lucide-react';
import { buildTagTree, TagNode } from '@/lib/tagTree';

interface TagTreeProps {
  tags: string[];
  selectedTag: string | null;
  onTagSelect: (tagPath: string) => void;
}

export default function TagTree({ tags, selectedTag, onTagSelect }: TagTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleExpanded = (nodePath: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodePath)) {
      newExpanded.delete(nodePath);
    } else {
      newExpanded.add(nodePath);
    }
    setExpandedNodes(newExpanded);
  };

  const tagTree = buildTagTree(tags);

  const renderNode = (node: TagNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.fullPath);
    const hasChildren = node.children.length > 0;
    const isSelected = selectedTag === node.fullPath;

    return (
      <div key={node.fullPath}>
        <div
          className={`
            flex items-center py-1.5 px-2 rounded-md cursor-pointer group
            ${isSelected 
              ? 'bg-blue-100 text-blue-900' 
              : 'hover:bg-gray-100 text-gray-700'
            }
          `}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(node.fullPath);
            }
            onTagSelect(node.fullPath);
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 mr-1 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-1 flex-shrink-0" />
            )
          ) : (
            <div className="w-4 h-4 mr-1 flex-shrink-0" />
          )}
          
          <Tag className="w-3 h-3 mr-2 flex-shrink-0" />
          
          <span className="text-sm truncate">
            {node.name}
          </span>
          
          {node.linkCount !== undefined && (
            <span className="ml-auto text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded-full">
              {node.linkCount}
            </span>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (tags.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Tag className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No tags yet</p>
        <p className="text-xs text-gray-400">Add links to create tags</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-2">
        <div className="mb-2">
          <button
            onClick={() => onTagSelect('')}
            className={`
              w-full flex items-center py-2 px-2 rounded-md text-sm font-medium
              ${selectedTag === '' 
                ? 'bg-blue-100 text-blue-900' 
                : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            <Tag className="w-4 h-4 mr-2" />
            All Links
          </button>
        </div>
        
        {tagTree.children.map(node => renderNode(node))}
      </div>
    </div>
  );
}
