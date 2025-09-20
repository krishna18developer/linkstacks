'use client';

import { useState } from 'react';
import { Plus, Link as LinkIcon, Loader2 } from 'lucide-react';
import { createLinkSchema } from '@/lib/validators';
import { fetchTitle } from '@/lib/titleFetcher';
import TagPicker from './TagPicker';

interface AddLinkFormProps {
  availableTags: string[];
  onSubmit: (data: { url: string; title?: string; tagPaths: string[] }) => Promise<void>;
  className?: string;
}

export default function AddLinkForm({ availableTags, onSubmit, className = "" }: AddLinkFormProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    setError(null);

    // Auto-fetch title when URL is pasted or typed
    if (newUrl.trim() && isValidUrl(newUrl.trim())) {
      setIsFetchingTitle(true);
      try {
        const result = await fetchTitle(newUrl.trim());
        if (result.title && !title) {
          setTitle(result.title);
        }
      } catch (err) {
        console.warn('Failed to fetch title:', err);
      } finally {
        setIsFetchingTitle(false);
      }
    }
  };

  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return urlString.startsWith('http://') || urlString.startsWith('https://');
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Validate the form data
      const formData = {
        url: url.trim(),
        title: title.trim() || undefined,
        tagPaths: selectedTags,
      };

      createLinkSchema.parse(formData);

      // Submit the link
      await onSubmit(formData);

      // Reset form
      setUrl('');
      setTitle('');
      setSelectedTags([]);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to add link');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Focus form when 'a' key is pressed
    // if (e.key === 'a' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    //   const input = document.getElementById('url-input') as HTMLInputElement;
    //   if (input && document.activeElement !== input) {
    //     e.preventDefault();
    //     input.focus();
    //   }
    // }

    // Disable default behavior for 'a' key -> since its bugging down the form
  };

  return (
    <div className={`card ${className}`} onKeyDown={handleKeyDown}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <Plus className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Add Link</h3>
        </div>

        {/* URL Input */}
        <div>
          <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-2">
            URL *
          </label>
          <div className="relative">
            <input
              id="url-input"
              type="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://example.com"
              className="input-field pr-10"
              disabled={isLoading}
              required
            />
            <LinkIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            {isFetchingTitle && (
              <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Title Input */}
        <div>
          <label htmlFor="title-input" className="block text-sm font-medium text-gray-700 mb-2">
            Title (optional)
          </label>
          <input
            id="title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Link title (auto-fetched if empty)"
            className="input-field"
            disabled={isLoading}
          />
          {isFetchingTitle && (
            <p className="mt-1 text-xs text-blue-600">Fetching title...</p>
          )}
        </div>

        {/* Tag Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags *
          </label>
          <TagPicker
            selectedTags={selectedTags}
            availableTags={availableTags}
            onTagsChange={setSelectedTags}
            placeholder="Add tags..."
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !url.trim() || selectedTags.length === 0}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Link
              </>
            )}
          </button>
        </div>
      </form>

      {/* Keyboard Shortcuts Help */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <p className="mb-1"><strong>Keyboard shortcuts:</strong></p>
          <p>Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">A</kbd> to focus this form</p>
        </div>
      </div>
    </div>
  );
}
