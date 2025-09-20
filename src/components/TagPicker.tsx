'use client';

import { useState, useRef, useEffect } from 'react';
import { Tag, Plus, X } from 'lucide-react';
import { tagPathSchema } from '@/lib/validators';

interface TagPickerProps {
  selectedTags: string[];
  availableTags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export default function TagPicker({
  selectedTags,
  availableTags,
  onTagsChange,
  placeholder = "Add tags...",
  className = "",
}: TagPickerProps) {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter available tags based on input
  const filteredTags = availableTags.filter(tag => 
    tag.toLowerCase().includes(input.toLowerCase()) &&
    !selectedTags.includes(tag)
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    setError(null);
    setIsOpen(value.length > 0);
  };

  // Handle tag selection
  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag]);
    }
    setInput('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Handle creating new tag
  const handleCreateTag = () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    try {
      // Validate the tag path
      tagPathSchema.parse(trimmedInput);
      
      if (selectedTags.includes(trimmedInput)) {
        setError('Tag already selected');
        return;
      }

      onTagsChange([...selectedTags, trimmedInput]);
      setInput('');
      setIsOpen(false);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Invalid tag format');
      }
    }
  };

  // Handle removing tag
  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredTags.length > 0) {
        handleTagSelect(filteredTags[0]);
      } else {
        handleCreateTag();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setInput('');
    } else if (e.key === 'Backspace' && input === '' && selectedTags.length > 0) {
      handleRemoveTag(selectedTags[selectedTags.length - 1]);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-1.5 inline-flex items-center justify-center w-3 h-3 rounded-full hover:bg-blue-200"
              >
                <X className="w-2 h-2" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(input.length > 0)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Tag className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
        >
          {/* Available Tags */}
          {filteredTags.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 mb-1">Existing Tags</div>
              {filteredTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagSelect(tag)}
                  className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded flex items-center"
                >
                  <Tag className="w-3 h-3 mr-2 text-gray-400" />
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Create New Tag */}
          {input.trim() && !availableTags.includes(input.trim()) && (
            <div className="border-t border-gray-200 p-2">
              <button
                onClick={handleCreateTag}
                className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded flex items-center text-blue-600"
              >
                <Plus className="w-3 h-3 mr-2" />
                Create &quot;{input.trim()}&quot;
              </button>
            </div>
          )}

          {/* No Results */}
          {filteredTags.length === 0 && input.trim() && availableTags.includes(input.trim()) && (
            <div className="p-2 text-sm text-gray-500 text-center">
              Tag already selected
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="mt-1 text-xs text-gray-500">
        Use / to create hierarchical tags (e.g., &quot;Tech/AI&quot;). Press Enter to add.
      </div>
    </div>
  );
}
