'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Image as ImageIcon, Maximize2 } from 'lucide-react';
import { LinkWithTags } from '@/lib/supabaseClient';

interface LinkThumbnailProps {
  link: LinkWithTags;
  onPreview: (link: LinkWithTags) => void;
  className?: string;
}

interface ThumbnailData {
  title: string;
  image?: string;
  favicon?: string;
  domain: string;
}

export default function LinkThumbnail({ link, onPreview, className = "" }: LinkThumbnailProps) {
  const [thumbnailData, setThumbnailData] = useState<ThumbnailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchThumbnailData();
  }, [link.url]);

  const fetchThumbnailData = async () => {
    setIsLoading(true);
    setImageError(false);

    try {
      // Try to get thumbnail data from Microlink
      const microlinkUrl = `${process.env.NEXT_PUBLIC_MICROLINK_BASE || 'https://api.microlink.io'}?url=${encodeURIComponent(link.url)}&screenshot=true&meta=true`;
      
      const response = await fetch(microlinkUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        setThumbnailData({
          title: data.title || data.meta?.title || link.title || 'Untitled',
          image: data.image?.url || data.screenshot?.url,
          favicon: data.logo?.url || data.favicon?.url,
          domain: data.url || new URL(link.url).hostname,
        });
      } else {
        // Fallback to basic data
        setThumbnailData({
          title: link.title || 'Untitled',
          image: undefined,
          favicon: undefined,
          domain: new URL(link.url).hostname,
        });
      }
    } catch (err) {
      console.warn('Failed to fetch thumbnail data:', err);
      
      // Fallback to basic data
      setThumbnailData({
        title: link.title || 'Untitled',
        image: undefined,
        favicon: undefined,
        domain: new URL(link.url).hostname,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return 'Unknown';
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 group ${className}`}>
      {/* Thumbnail Image */}
      <div className="relative h-32 bg-gray-100">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : thumbnailData?.image && !imageError ? (
          <img
            src={thumbnailData.image}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}
        
        {/* Maximize Button */}
        <button
          onClick={() => onPreview(link)}
          className="absolute top-2 right-2 p-1.5 bg-black bg-opacity-50 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          title="Preview link"
        >
          <Maximize2 className="w-3 h-3" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Title */}
        <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
          {thumbnailData?.title || link.title || 'Untitled'}
        </h3>

        {/* Domain */}
        <div className="flex items-center space-x-1 mb-2">
          {thumbnailData?.favicon && (
            <img 
              src={thumbnailData.favicon} 
              alt="Favicon" 
              className="w-3 h-3"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <span className="text-xs text-gray-500 truncate">
            {thumbnailData?.domain || getDomainFromUrl(link.url)}
          </span>
        </div>

        {/* Tags */}
        {link.link_tags && link.link_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {link.link_tags.slice(0, 2).map((linkTag) => (
              <span
                key={linkTag.tag_path}
                className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded"
              >
                {linkTag.tag_path.split('/').pop()}
              </span>
            ))}
            {link.link_tags.length > 2 && (
              <span className="text-xs text-gray-500">
                +{link.link_tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Visit</span>
          </a>
          
          <button
            onClick={() => onPreview(link)}
            className="text-xs text-gray-600 hover:text-gray-800 flex items-center space-x-1"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Preview</span>
          </button>
        </div>
      </div>
    </div>
  );
}
