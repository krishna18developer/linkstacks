import { createClient } from '@supabase/supabase-js';

// Database types
export interface Board {
  id: string;
  slug_path: string;
  slug_segments: string[];
  title?: string;
  created_at: string;
}

export interface Link {
  id: number;
  board_id: string;
  url: string;
  title?: string;
  client_id?: string;
  soft_deleted: boolean;
  created_at: string;
}

export interface LinkTag {
  link_id: number;
  tag_path: string;
  position: number;
}

export interface LinkWithTags extends Link {
  link_tags: LinkTag[];
}

// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Only throw error in development if variables are actually missing
if (process.env.NODE_ENV === 'development' && 
    (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
  console.warn('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We're using anonymous access only
  },
});

// Database queries
export const db = {
  // Board operations
  async getBoardBySlug(slugPath: string): Promise<Board | null> {
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .eq('slug_path', slugPath)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }
    
    return data;
  },

  async createBoard(slugPath: string, slugSegments: string[], title?: string): Promise<Board> {
    const { data, error } = await supabase
      .from('boards')
      .insert({
        slug_path: slugPath,
        slug_segments: slugSegments,
        title,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async checkBoardExists(slugPath: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('boards')
      .select('id')
      .eq('slug_path', slugPath)
      .single();
    
    return !error && !!data;
  },

  // Tag operations
  async getTagsForBoard(boardId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('link_tags')
      .select('tag_path')
      .eq('link_id', supabase.from('links').select('id').eq('board_id', boardId))
      .order('tag_path');
    
    if (error) throw error;
    
    // Get unique tag paths
    const uniqueTags = [...new Set(data.map(item => item.tag_path))];
    return uniqueTags;
  },

  // Link operations
  async getLinksForBoardAndTag(boardId: string, tagPath: string): Promise<LinkWithTags[]> {
    const { data, error } = await supabase
      .from('links')
      .select(`
        *,
        link_tags!inner(tag_path, position)
      `)
      .eq('board_id', boardId)
      .eq('soft_deleted', false)
      .eq('link_tags.tag_path', tagPath)
      .order('position', { referencedTable: 'link_tags' })
      .order('id');
    
    if (error) throw error;
    return data || [];
  },

  async createLink(
    boardId: string,
    url: string,
    title: string | undefined,
    tagPaths: string[],
    clientId: string
  ): Promise<LinkWithTags> {
    // First, create the link
    const { data: link, error: linkError } = await supabase
      .from('links')
      .insert({
        board_id: boardId,
        url,
        title,
        client_id: clientId,
      })
      .select()
      .single();
    
    if (linkError) throw linkError;
    
    // Get the maximum position for each tag path
    const positionPromises = tagPaths.map(async (tagPath) => {
      const { data: maxPos } = await supabase
        .from('link_tags')
        .select('position')
        .eq('tag_path', tagPath)
        .order('position', { ascending: false })
        .limit(1)
        .single();
      
      return {
        tag_path: tagPath,
        position: (maxPos?.position ?? -1) + 1,
      };
    });
    
    const positions = await Promise.all(positionPromises);
    
    // Create link_tags entries
    const linkTags = positions.map(({ tag_path, position }) => ({
      link_id: link.id,
      tag_path,
      position,
    }));
    
    const { error: tagsError } = await supabase
      .from('link_tags')
      .insert(linkTags);
    
    if (tagsError) throw tagsError;
    
    return {
      ...link,
      link_tags: linkTags,
    };
  },

  async updateLinkTitle(linkId: number, title: string): Promise<void> {
    const { error } = await supabase
      .from('links')
      .update({ title })
      .eq('id', linkId);
    
    if (error) throw error;
  },

  async softDeleteLink(linkId: number): Promise<void> {
    const { error } = await supabase
      .from('links')
      .update({ soft_deleted: true })
      .eq('id', linkId);
    
    if (error) throw error;
  },

  async updateLinkPositions(updates: { linkId: number; tagPath: string; position: number }[]): Promise<void> {
    const promises = updates.map(({ linkId, tagPath, position }) =>
      supabase
        .from('link_tags')
        .update({ position })
        .eq('link_id', linkId)
        .eq('tag_path', tagPath)
    );
    
    const results = await Promise.all(promises);
    
    for (const { error } of results) {
      if (error) throw error;
    }
  },

  async searchLinks(boardId: string, query: string): Promise<LinkWithTags[]> {
    const { data, error } = await supabase
      .from('links')
      .select(`
        *,
        link_tags(tag_path, position)
      `)
      .eq('board_id', boardId)
      .eq('soft_deleted', false)
      .or(`title.ilike.%${query}%,url.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
};
