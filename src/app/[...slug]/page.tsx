'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { 
  ArrowLeft, 
  Share2, 
  Plus,
  Grid3X3,
  List
} from 'lucide-react';
import { db, Board, LinkWithTags } from '@/lib/supabaseClient';
import { getClientId } from '@/lib/titleFetcher';
import { useToast, ToastContainer } from '@/components/Toast';
import TagTree from '@/components/TagTree';
import TagBreadcrumbs from '@/components/TagBreadcrumbs';
import LinkList from '@/components/LinkList';
import ThumbnailGrid from '@/components/ThumbnailGrid';
import LinkPreview from '@/components/LinkPreview';
import AddLinkForm from '@/components/AddLinkForm';
import SearchBar from '@/components/SearchBar';

// SWR fetchers
const fetchBoard = async (slugPath: string): Promise<Board | null> => {
  return await db.getBoardBySlug(slugPath);
};

const fetchTags = async (boardId: string): Promise<string[]> => {
  return await db.getTagsForBoard(boardId);
};

const fetchLinks = async (boardId: string, tagPath: string | null): Promise<LinkWithTags[]> => {
  if (tagPath) {
    return await db.getLinksForBoardAndTag(boardId, tagPath);
  } else {
    // Get all links for the board
    const allTags = await db.getTagsForBoard(boardId);
    const allLinks: LinkWithTags[] = [];
    
    for (const tag of allTags) {
      const links = await db.getLinksForBoardAndTag(boardId, tag);
      allLinks.push(...links);
    }
    
    // Remove duplicates and sort by creation date
    const uniqueLinks = allLinks.filter((link, index, self) => 
      index === self.findIndex(l => l.id === link.id)
    );
    
    return uniqueLinks.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
};

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const { showSuccess, showError, toasts, removeToast } = useToast();
  
  const slugPath = Array.isArray(params.slug) ? params.slug.join('/') : '';
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'thumbnails'>('list');
  const [previewLink, setPreviewLink] = useState<LinkWithTags | null>(null);

  // Fetch board data
  const { data: board, error: boardError } = useSWR(
    slugPath ? `board-${slugPath}` : null,
    () => fetchBoard(slugPath)
  );

  // Fetch tags
  const { data: tags = [], error: tagsError } = useSWR(
    board ? `tags-${board.id}` : null,
    board ? () => fetchTags(board.id) : null
  );

  // Fetch links
  const { data: links = [], error: linksError, mutate: mutateLinks } = useSWR(
    board && selectedTag !== undefined ? `links-${board.id}-${selectedTag || 'all'}` : null,
    board ? () => fetchLinks(board.id, selectedTag) : null
  );

  // Search links
  const { data: searchResults = [], error: searchError } = useSWR(
    board && searchQuery ? `search-${board.id}-${searchQuery}` : null,
    board ? () => db.searchLinks(board.id, searchQuery) : null
  );

  // Handle errors
  useEffect(() => {
    if (boardError) {
      showError('Failed to load board', boardError.message);
    }
    if (tagsError) {
      showError('Failed to load tags', tagsError.message);
    }
    if (linksError) {
      showError('Failed to load links', linksError.message);
    }
    if (searchError) {
      showError('Search failed', searchError.message);
    }
  }, [boardError, tagsError, linksError, searchError, showError]);

  // Handle board not found
  if (board === null && !boardError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Board Not Found</h1>
          <p className="text-gray-600 mb-6">The board &quot;{slugPath}&quot; does not exist.</p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading board...</p>
        </div>
      </div>
    );
  }

  const handleAddLink = async (data: { url: string; title?: string; tagPaths: string[] }) => {
    try {
      const clientId = getClientId();
      await db.createLink(board.id, data.url, data.title, data.tagPaths, clientId);
      
      // Refresh data
      mutateLinks();
      
      showSuccess('Link added successfully');
      setShowAddForm(false);
    } catch (error) {
      showError('Failed to add link', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleEditTitle = async (linkId: number, newTitle: string) => {
    try {
      await db.updateLinkTitle(linkId, newTitle);
      mutateLinks();
      showSuccess('Title updated');
    } catch (error) {
      showError('Failed to update title', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleDeleteLink = async (linkId: number) => {
    try {
      await db.softDeleteLink(linkId);
      mutateLinks();
      showSuccess('Link deleted');
    } catch (error) {
      showError('Failed to delete link', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleCopyUrl = () => {
    showSuccess('URL copied to clipboard');
  };

  const handleReorder = async (updates: Array<{ linkId: number; tagPath: string; position: number }>) => {
    try {
      await db.updateLinkPositions(updates);
      mutateLinks();
    } catch (error) {
      showError('Failed to reorder links', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showSuccess('Board URL copied to clipboard');
    } catch {
      showError('Failed to copy URL');
    }
  };

  const handlePreview = (link: LinkWithTags) => {
    setPreviewLink(link);
  };

  const handleClosePreview = () => {
    setPreviewLink(null);
  };

  const currentLinks = isSearchMode ? searchResults : links;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {board.title || slugPath}
                </h1>
                <p className="text-sm text-gray-500">/{slugPath}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('thumbnails')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'thumbnails' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Thumbnail view"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="Share board"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Link
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card h-fit">
              <div className="mb-4">
                <SearchBar
                  onSearch={(query) => {
                    setSearchQuery(query);
                    setIsSearchMode(query.length > 0);
                  }}
                  placeholder="Search links..."
                  className="mb-4"
                />
              </div>
              
              {!isSearchMode && (
                <TagTree
                  tags={tags}
                  selectedTag={selectedTag}
                  onTagSelect={setSelectedTag}
                />
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Breadcrumbs */}
            {!isSearchMode && (
              <div className="mb-6">
                <TagBreadcrumbs
                  tagPath={selectedTag}
                  onTagSelect={setSelectedTag}
                />
              </div>
            )}

            {/* Add Link Form */}
            {showAddForm && (
              <div className="mb-6">
                <AddLinkForm
                  availableTags={tags}
                  onSubmit={handleAddLink}
                />
              </div>
            )}

            {/* Links */}
            <div className="card">
              {isSearchMode ? (
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Search Results for &quot;{searchQuery}&quot;
                  </h2>
                  <p className="text-sm text-gray-600">
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              ) : (
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedTag ? `Links in &quot;${selectedTag}&quot;` : 'All Links'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {links.length} link{links.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}

              {viewMode === 'list' ? (
                <LinkList
                  links={currentLinks}
                  tagPath={selectedTag}
                  onReorder={handleReorder}
                  onEditTitle={handleEditTitle}
                  onDelete={handleDeleteLink}
                  onCopyUrl={handleCopyUrl}
                  onPreview={handlePreview}
                  tagPaths={tags}
                />
              ) : (
                <ThumbnailGrid
                  links={currentLinks}
                  onPreview={handlePreview}
                  tagPath={selectedTag}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {/* Link Preview Modal */}
      {previewLink && (
        <LinkPreview
          link={previewLink}
          isOpen={!!previewLink}
          onClose={handleClosePreview}
        />
      )}
    </div>
  );
}
