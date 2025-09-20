'use client';

import { ChevronRight, Home } from 'lucide-react';
import { getTagBreadcrumbs } from '@/lib/tagTree';

interface TagBreadcrumbsProps {
  tagPath: string | null;
  onTagSelect: (tagPath: string) => void;
}

export default function TagBreadcrumbs({ tagPath, onTagSelect }: TagBreadcrumbsProps) {
  if (!tagPath) {
    return (
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Home className="w-4 h-4" />
        <span>All Links</span>
      </nav>
    );
  }

  const breadcrumbs = getTagBreadcrumbs(tagPath);

  return (
    <nav className="flex items-center space-x-2 text-sm">
      <button
        onClick={() => onTagSelect('')}
        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Home className="w-4 h-4" />
      </button>
      
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.path} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <button
            onClick={() => onTagSelect(breadcrumb.path)}
            className={`
              text-gray-600 hover:text-gray-900 transition-colors
              ${index === breadcrumbs.length - 1 ? 'font-medium text-gray-900' : ''}
            `}
          >
            {breadcrumb.name}
          </button>
        </div>
      ))}
    </nav>
  );
}
