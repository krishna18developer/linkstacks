'use client';

import { useState, useEffect } from 'react';
import { X, ExternalLink, Image as ImageIcon, Globe } from 'lucide-react';
import { LinkWithTags } from '@/lib/supabaseClient';

interface LinkPreviewProps {
  link: LinkWithTags;
  isOpen: boolean;
  onClose: () => void;
}

interface PreviewData {
  title: string;
  description?: string;
  image?: string;
  favicon?: string;
  domain: string;
  source: 'microlink' | 'jina' | 'hostname';
}

export default function LinkPreview({ link, isOpen, onClose }: LinkPreviewProps) {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !previewData) {
      fetchPreviewData();
    }
  }, [isOpen]);

  const fetchPreviewData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to get preview data from Microlink
      const microlinkUrl = `${process.env.NEXT_PUBLIC_MICROLINK_BASE || 'https://api.microlink.io'}?url=${encodeURIComponent(link.url)}&screenshot=true&meta=true`;
      
      const response = await fetch(microlinkUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        setPreviewData({
          title: data.title || data.meta?.title || link.title || 'Untitled',
          description: data.description || data.meta?.description,
          image: data.image?.url || data.screenshot?.url,
          favicon: data.logo?.url || data.favicon?.url,
          domain: data.url || new URL(link.url).hostname,
          source: 'microlink'
        });
      } else {
        // Fallback to basic data
        setPreviewData({
          title: link.title || 'Untitled',
          description: undefined,
          image: undefined,
          favicon: undefined,
          domain: new URL(link.url).hostname,
          source: 'hostname'
        });
      }
    } catch (err) {
      console.warn('Failed to fetch preview data:', err);
      setError('Failed to load preview');
      
      // Fallback to basic data
      setPreviewData({
        title: link.title || 'Untitled',
        description: undefined,
        image: undefined,
        favicon: undefined,
        domain: new URL(link.url).hostname,
        source: 'hostname'
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            {previewData?.favicon && (
              <img 
                src={previewData.favicon} 
                alt="Favicon" 
                className="w-4 h-4"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <span className="text-sm text-gray-500">
              {previewData?.domain || getDomainFromUrl(link.url)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading preview...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-red-600 mb-2">Failed to load preview</p>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          ) : (
            <div>
              {/* Preview Image */}
              {previewData?.image && (
                <div className="relative">
                  <img
                    src={previewData.image}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {previewData.source}
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {previewData?.title || link.title || 'Untitled'}
                </h2>
                
                {previewData?.description && (
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {previewData.description}
                  </p>
                )}

                {/* URL */}
                <div className="flex items-center space-x-2 mb-4">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm truncate flex-1"
                  >
                    {link.url}
                  </a>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </div>

                {/* Tags */}
                {link.link_tags && link.link_tags.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Tags:</h3>
                    <div className="flex flex-wrap gap-2">
                      {link.link_tags.map((linkTag) => (
                        <span
                          key={linkTag.tag_path}
                          className="tag-badge"
                        >
                          {linkTag.tag_path}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center space-x-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Visit Link</span>
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(link.url);
                    }}
                    className="btn-secondary"
                  >
                    Copy URL
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
