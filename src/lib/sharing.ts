import { supabase } from './supabase';
import { nanoid } from 'nanoid';

export interface ShareOptions {
  expiresIn?: number; // Hours
  canEdit?: boolean;
}

export async function createShareableLink(userId: string, options: ShareOptions = {}) {
  try {
    const accessCode = nanoid(10);
    const expiresAt = options.expiresIn 
      ? new Date(Date.now() + options.expiresIn * 60 * 60 * 1000)
      : null;

    const { error } = await supabase
      .from('shared_workflows')
      .insert({
        owner_id: userId,
        access_code: accessCode,
        expires_at: expiresAt,
        permissions: {
          can_view: true,
          can_edit: options.canEdit || false
        }
      })
      .select()
      .single();

    if (error) throw error;

    const shareUrl = `${window.location.origin}/share/${accessCode}`;
    return { shareUrl, accessCode, expiresAt };
  } catch (err) {
    console.error('Error creating shareable link:', err);
    throw err;
  }
}

export async function validateShareCode(accessCode: string) {
  try {
    const { data, error } = await supabase
      .from('shared_workflows')
      .select('*')
      .eq('access_code', accessCode)
      .single();

    if (error) throw error;

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      throw new Error('This share link has expired');
    }

    return data;
  } catch (err) {
    console.error('Error validating share code:', err);
    throw err;
  }
}

export async function revokeShareableLink(accessCode: string, userId: string) {
  try {
    const { error } = await supabase
      .from('shared_workflows')
      .delete()
      .match({ access_code: accessCode, owner_id: userId });

    if (error) throw error;
  } catch (err) {
    console.error('Error revoking shareable link:', err);
    throw err;
  }
}