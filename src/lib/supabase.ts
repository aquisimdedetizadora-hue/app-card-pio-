import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Restaurant } from '../types';

// Safely obtain Supabase URL & Key from client or server environment
const supabaseUrl = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  '';

const supabaseAnonKey = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_SERVICE_ROLE_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  '';

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Normalizes any slug string
 */
export function cleanSlug(raw: string): string {
  if (!raw) return '';
  return raw
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^(\/|#|\/r\/|r\/)+/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Maps Supabase database row to frontend Restaurant interface
 */
export function mapRowToRestaurant(row: any): Restaurant {
  if (!row) return row;
  const settings = row.settings || {};
  return {
    id: row.id,
    ownerId: row.owner_id || row.ownerId || 'owner-default',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    settings: {
      name: row.name || settings.name || '',
      slug: cleanSlug(row.slug || settings.slug || ''),
      category: row.category || settings.category || 'Outro',
      description: row.description || settings.description || '',
      phone: row.phone || settings.phone || '',
      whatsapp: row.whatsapp || settings.whatsapp || '',
      instagram: row.instagram || settings.instagram || '',
      address: row.address || settings.address || { street: '', number: '', neighborhood: '', city: '', state: '' },
      logoUrl: row.logo_url || row.logoUrl || settings.logoUrl || '',
      coverUrl: row.cover_url || row.coverUrl || settings.coverUrl || '',
      isOpenManual: row.is_open_manual !== undefined ? row.is_open_manual : (settings.isOpenManual ?? true),
      autoCloseEnabled: row.auto_close_enabled ?? settings.autoCloseEnabled ?? true,
      useAutomaticHours: row.use_automatic_hours ?? settings.useAutomaticHours ?? false,
      allowOrdersWhenClosed: row.allow_orders_when_closed ?? settings.allowOrdersWhenClosed ?? true,
      businessHours: row.business_hours || settings.businessHours || [],
      delivery: row.delivery || settings.delivery || { enabled: true, feeType: 'fixed', fixedFee: 5, estimatedTimeMin: 30, estimatedTimeMax: 50, minimumOrderValue: 0 },
      pickup: row.pickup || settings.pickup || { enabled: true, estimatedTimeMin: 15, estimatedTimeMax: 30 },
      dineIn: row.dine_in || settings.dineIn || { enabled: true },
      paymentMethods: row.payment_methods || settings.paymentMethods || {
        pix: { enabled: true },
        creditCard: { enabled: true },
        debitCard: { enabled: true },
        cash: { enabled: true, allowChange: true },
        mealVoucher: { enabled: false }
      },
      theme: row.theme || settings.theme || {
        primaryColor: '#10b981',
        backgroundColor: '#020617',
        cardBackgroundColor: '#0f172a',
        textColor: '#f8fafc',
        accentColor: '#34d399',
        buttonColor: '#10b981',
        buttonTextColor: '#020617',
        borderRadius: '16px',
        cardStyle: 'standard'
      }
    }
  };
}
