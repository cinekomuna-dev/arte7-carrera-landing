import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';

/** Cliente Supabase con service role (bypassa RLS) para el cron.
 *  Devuelve null si no hay service key configurada. */
export function serviceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

const secret = () => process.env.CRON_SECRET || 'dev-secret-change-me';

/** Token de baja firmado (no reversible, corto) para los links de unsubscribe. */
export function bajaToken(id: string): string {
  return createHmac('sha256', secret()).update(`baja:${id}`).digest('hex').slice(0, 24);
}
export function verifyBaja(id: string, t: string): boolean {
  return !!t && bajaToken(id) === t;
}

/** Verifica el secreto del cron (Vercel manda Authorization: Bearer $CRON_SECRET). */
export function authorizedCron(req: Request): boolean {
  const cs = process.env.CRON_SECRET;
  if (!cs) return false; // sin secreto configurado, no se ejecuta en serio
  const auth = req.headers.get('authorization') || '';
  if (auth === `Bearer ${cs}`) return true;
  // fallback manual: ?secret= en la URL
  try { return new URL(req.url).searchParams.get('secret') === cs; } catch { return false; }
}
