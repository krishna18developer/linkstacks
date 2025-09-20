'use client';

import { LinkWithTags } from '@/lib/supabaseClient';
import LinkThumbnail from './LinkThumbnail';

interface ThumbnailGridProps {
  links: LinkWithTags[];
  onPreview: (link: LinkWithTags) => void;
  tagPath: string | null;
}

export default function ThumbnailGrid({ links, onPreview, tagPath }: ThumbnailGridProps) {
  if (links.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No links yet
        </h3>
        <p className="text-gray-500">
          {tagPath 
            ? `No links in the "${tagPath}" tag yet.`
            : 'Add your first link to get started.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {links.map((link) => (
        <LinkThumbnail
          key={link.id}
          link={link}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
}
