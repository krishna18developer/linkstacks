import { z } from 'zod';

// Board path validation: lowercase letters/numbers/@-._ and / separators, 3–80 chars, segments 1–24 chars
export const boardPathSchema = z
  .string()
  .min(3, 'Board path must be at least 3 characters')
  .max(80, 'Board path must be at most 80 characters')
  .regex(
    /^[a-z0-9@._-]+(\/[a-z0-9@._-]+)*$/,
    'Board path must contain only lowercase letters, numbers, @, ., _, -, and / separators'
  )
  .refine(
    (path) => {
      const segments = path.split('/');
      return segments.every(segment => segment.length >= 1 && segment.length <= 24);
    },
    'Each segment must be 1-24 characters long'
  );

// URL validation: http/https only
export const urlSchema = z
  .string()
  .url('Must be a valid URL')
  .refine(
    (url) => url.startsWith('http://') || url.startsWith('https://'),
    'URL must start with http:// or https://'
  );

// Tag path validation: slash-delimited segments; each 1–24 chars, [A-Za-z0-9 _-]
export const tagPathSchema = z
  .string()
  .min(1, 'Tag path cannot be empty')
  .max(200, 'Tag path must be at most 200 characters')
  .regex(
    /^[A-Za-z0-9 _-]+(\/[A-Za-z0-9 _-]+)*$/,
    'Tag path must contain only letters, numbers, spaces, _, -, and / separators'
  )
  .refine(
    (path) => {
      const segments = path.split('/');
      return segments.every(segment => segment.length >= 1 && segment.length <= 24);
    },
    'Each tag segment must be 1-24 characters long'
  );

// Board creation schema
export const createBoardSchema = z.object({
  slugPath: boardPathSchema,
  title: z.string().optional(),
});

// Link creation schema
export const createLinkSchema = z.object({
  url: urlSchema,
  title: z.string().optional(),
  tagPaths: z.array(tagPathSchema).min(1, 'At least one tag path is required'),
});

// Link update schema
export const updateLinkSchema = z.object({
  title: z.string().optional(),
  tagPaths: z.array(tagPathSchema).optional(),
});

// Type exports
export type BoardPath = z.infer<typeof boardPathSchema>;
export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;

// Utility function to normalize board path
export function normalizeBoardPath(path: string): string {
  return path
    .toLowerCase()
    .replace(/\/+/g, '/') // Remove duplicate slashes
    .replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
    .trim();
}

// Utility function to validate and normalize board path
export function validateAndNormalizeBoardPath(path: string): string {
  const normalized = normalizeBoardPath(path);
  return boardPathSchema.parse(normalized);
}
