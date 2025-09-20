'use client';

import { useState } from 'react';
import { ExternalLink, Edit2, Trash2, Copy, Check } from 'lucide-react';
import { LinkWithTags } from '@/lib/supabaseClient';

interface LinkItemProps {
  link: LinkWithTags;
  onEditTitle: (linkId: number, newTitle: string) => void;
  onDelete: (linkId: number) => void;
  onCopyUrl: () => void;
  tagPaths: string[];
}

export default function LinkItem({ link, onEditTitle, onDelete, onCopyUrl }: LinkItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(link.title || '');
  const [copied, setCopied] = useState(false);

  const handleSaveTitle = () => {
    if (editTitle.trim() !== (link.title || '')) {
      onEditTitle(link.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setEditTitle(link.title || '');
      setIsEditing(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      onCopyUrl();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const getDisplayTitle = () => {
    if (link.title) return link.title;
    
    try {
      const url = new URL(link.url);
      return url.hostname;
    } catch {
      return link.url;
    }
  };

  const getDomain = () => {
    try {
      return new URL(link.url).hostname;
    } catch {
      return 'Unknown';
    }
  };

  const getTagCount = () => {
    return link.link_tags?.length || 0;
  };

  return (
    <div className="link-item group">
      <div className="flex items-start space-x-3">
        {/* Link Icon */}
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
            <ExternalLink className="w-4 h-4 text-gray-600" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="mb-2">
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={handleKeyDown}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            ) : (
              <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {getDisplayTitle()}
                </a>
              </h3>
            )}
          </div>

          {/* URL and Domain */}
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs text-gray-500 truncate flex-1">
              {getDomain()}
            </span>
            <button
              onClick={handleCopyUrl}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-gray-600"
              title="Copy URL"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>

          {/* Tags */}
          {getTagCount() > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500">Tags:</span>
              <div className="flex flex-wrap gap-1">
                {link.link_tags?.slice(0, 2).map((linkTag) => (
                  <span
                    key={linkTag.tag_path}
                    className="tag-badge text-xs"
                  >
                    {linkTag.tag_path.split('/').pop()}
                  </span>
                ))}
                {getTagCount() > 2 && (
                  <span className="text-xs text-gray-500">
                    +{getTagCount() - 2} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Edit title"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDelete(link.id)}
              className="p-1 text-gray-400 hover:text-red-600"
              title="Delete link"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
