import { supabase } from './supabase';

export interface ActivationCode {
  id: string;
  email: string;
  code: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function generateActivationCode(email: string): Promise<ActivationCode> {
  try {
    const { data, error } = await supabase
      .rpc('generate_activation_code')
      .single();

    if (error) throw error;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    const { data: activationCode, error: insertError } = await supabase
      .from('activation_codes')
      .insert({
        email,
        code: data,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return activationCode;
  } catch (error) {
    console.error('Error generating activation code:', error);
    throw error;
  }
}

export async function verifyActivationCode(email: string, code: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('activation_codes')
      .select()
      .eq('email', email)
      .eq('code', code)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) return false;

    // Mark code as used
    const { error: updateError } = await supabase
      .from('activation_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('id', data.id);

    if (updateError) throw updateError;

    return true;
  } catch (error) {
    console.error('Error verifying activation code:', error);
    return false;
  }
}