/**
 * Position utilities for drag and drop reordering
 */

export interface PositionUpdate {
  linkId: number;
  tagPath: string;
  position: number;
}

export function calculateNewPositions(
  items: Array<{ id: number; position: number }>,
  activeIndex: number,
  overIndex: number,
  tagPath: string
): PositionUpdate[] {
  const newItems = [...items];
  const [removed] = newItems.splice(activeIndex, 1);
  newItems.splice(overIndex, 0, removed);
  
  return newItems.map((item, index) => ({
    linkId: item.id,
    tagPath,
    position: index,
  }));
}

export function reorderArray<T>(array: T[], from: number, to: number): T[] {
  const newArray = [...array];
  const [removed] = newArray.splice(from, 1);
  newArray.splice(to, 0, removed);
  return newArray;
}

export function getNextPosition(existingPositions: number[]): number {
  if (existingPositions.length === 0) return 0;
  return Math.max(...existingPositions) + 1;
}

export function normalizePositions(items: Array<{ id: number; position: number }>, tagPath: string): PositionUpdate[] {
  return items.map((item, index) => ({
    linkId: item.id,
    tagPath,
    position: index,
  }));
}
