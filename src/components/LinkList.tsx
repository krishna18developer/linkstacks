'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { LinkWithTags } from '@/lib/supabaseClient';
import LinkItem from './LinkItem';

interface SortableLinkItemProps {
  link: LinkWithTags;
  onEditTitle: (linkId: number, newTitle: string) => void;
  onDelete: (linkId: number) => void;
  onCopyUrl: () => void;
  tagPaths: string[];
}

function SortableLinkItem({ link, onEditTitle, onDelete, onCopyUrl, tagPaths }: SortableLinkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </div>
      <LinkItem
        link={link}
        onEditTitle={onEditTitle}
        onDelete={onDelete}
        onCopyUrl={onCopyUrl}
        tagPaths={tagPaths}
      />
    </div>
  );
}

interface LinkListProps {
  links: LinkWithTags[];
  tagPath: string | null;
  onReorder: (updates: Array<{ linkId: number; tagPath: string; position: number }>) => void;
  onEditTitle: (linkId: number, newTitle: string) => void;
  onDelete: (linkId: number) => void;
  onCopyUrl: () => void;
  tagPaths: string[];
}

export default function LinkList({
  links,
  tagPath,
  onReorder,
  onEditTitle,
  onDelete,
  onCopyUrl,
  tagPaths,
}: LinkListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = links.findIndex((link) => link.id === active.id);
    const newIndex = links.findIndex((link) => link.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reorderedLinks = arrayMove(links, oldIndex, newIndex);
    
    // Create position updates
    const updates = reorderedLinks.map((link, index) => ({
      linkId: link.id,
      tagPath: tagPath || '',
      position: index,
    }));

    onReorder(updates);
  };

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={links.map(link => link.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {links.map((link) => (
            <div key={link.id} className="group">
              <SortableLinkItem
                link={link}
                onEditTitle={onEditTitle}
                onDelete={onDelete}
                onCopyUrl={onCopyUrl}
                tagPaths={tagPaths}
              />
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
