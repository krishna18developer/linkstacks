'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateAndNormalizeBoardPath } from '@/lib/validators';
import { db } from '@/lib/supabaseClient';
import { Plus, ArrowRight } from 'lucide-react';

interface BoardCreatorProps {
  onSuccess?: (slugPath: string) => void;
}

export default function BoardCreator({ onSuccess }: BoardCreatorProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Validate and normalize the board path
      const normalizedPath = validateAndNormalizeBoardPath(input.trim());
      
      // Check if board already exists
      const exists = await db.checkBoardExists(normalizedPath);
      if (exists) {
        setError('A board with this path already exists');
        setIsLoading(false);
        return;
      }

      // Create the board
      const slugSegments = normalizedPath.split('/');
      await db.createBoard(normalizedPath, slugSegments);

      // Navigate to the new board
      if (onSuccess) {
        onSuccess(normalizedPath);
      } else {
        router.push(`/${normalizedPath}`);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create board');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (error) setError(null);
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create a New Board
        </h1>
        <p className="text-gray-600">
          Organize your links with hierarchical tags and collaborative editing
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="board-path" className="block text-sm font-medium text-gray-700 mb-2">
            Board Path
          </label>
          <div className="relative">
            <input
              id="board-path"
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="my-board or @username/project or teams/alpha/ai"
              className="input-field pr-12"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="text-sm text-gray-500 space-y-1">
          <p><strong>Examples:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><code>my-shows</code> - Simple board</li>
            <li><code>@krishna/movies</code> - Personal board with username</li>
            <li><code>teams/alpha/ai</code> - Team board with hierarchy</li>
          </ul>
          <p className="mt-2">
            Use lowercase letters, numbers, @, ., _, -, and / separators. Each segment: 1-24 characters.
          </p>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <Plus className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
            <span>Hierarchical tag organization</span>
          </div>
          <div className="flex items-start space-x-2">
            <Plus className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
            <span>Multi-segment board paths</span>
          </div>
          <div className="flex items-start space-x-2">
            <Plus className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
            <span>Drag-and-drop reordering</span>
          </div>
          <div className="flex items-start space-x-2">
            <Plus className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
            <span>Automatic link metadata</span>
          </div>
          <div className="flex items-start space-x-2">
            <Plus className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
            <span>Collaborative editing</span>
          </div>
          <div className="flex items-start space-x-2">
            <Plus className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
            <span>Global search</span>
          </div>
        </div>
      </div>
    </div>
  );
}
