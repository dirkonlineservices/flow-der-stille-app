import { useEffect, useState } from 'react';
import { getSupabase } from './supabaseClient';

/**
 * Cart-wide web promotion (e.g. Black Friday), controlled via public.app_config:
 *   promo_aktiv           'true' | 'false'
 *   promo_rabatt_prozent  e.g. '10'
 *   promo_start           ISO timestamp, e.g. '2026-11-27T00:00:00+01:00'
 *   promo_ende            ISO timestamp, e.g. '2026-11-29T23:59:59+01:00'
 *   promo_titel           e.g. 'Black Friday Wochenende'
 *
 * Applies to web (PayPal) checkout only. Native apps use App Store / Play prices.
 * The edge function process-purchase reads the same keys to validate the paid amount.
 */
export interface PromoConfig {
  enabled: boolean;
  percent: number;
  startsAt: Date | null;
  endsAt: Date | null;
  title: string;
}

export const PROMO_KEYS = ['promo_aktiv', 'promo_rabatt_prozent', 'promo_start', 'promo_ende', 'promo_titel'];

const EMPTY: PromoConfig = { enabled: false, percent: 0, startsAt: null, endsAt: null, title: '' };

let cached: Promise<PromoConfig> | null = null;

function isNativeApp(): boolean {
  return typeof window !== 'undefined' && Boolean((window as any).Capacitor?.isNativePlatform?.());
}

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export function loadPromo(force = false): Promise<PromoConfig> {
  if (isNativeApp()) return Promise.resolve(EMPTY);
  if (cached && !force) return cached;
  cached = (async () => {
    try {
      const { data, error } = await getSupabase()
        .from('app_config')
        .select('key, value')
        .in('key', PROMO_KEYS);
      if (error || !data) return EMPTY;
      const map: Record<string, string> = {};
      data.forEach((row: any) => { map[row.key] = row.value; });
      const percent = Math.min(90, Math.max(0, parseInt(map.promo_rabatt_prozent || '0', 10) || 0));
      return {
        enabled: map.promo_aktiv === 'true' && percent > 0,
        percent,
        startsAt: parseDate(map.promo_start),
        endsAt: parseDate(map.promo_ende),
        title: map.promo_titel || 'Black Friday Wochenende',
      };
    } catch {
      return EMPTY;
    }
  })();
  return cached;
}

export function isPromoLive(promo: PromoConfig | null, now: number = Date.now()): boolean {
  if (!promo || !promo.enabled) return false;
  if (promo.startsAt && now < promo.startsAt.getTime()) return false;
  if (promo.endsAt && now > promo.endsAt.getTime()) return false;
  return true;
}

/** Rounds to full cents: 1.99 -> 1.79, 4.99 -> 4.49, 9.99 -> 8.99 at 10 %. */
export function applyPromo(price: number, percent: number): number {
  if (!percent || !price) return price;
  return Math.round(price * (100 - percent)) / 100;
}

export function formatEuro(value: number): string {
  return value.toFixed(2).replace('.', ',');
}

/** Returns the promo only while it is live (re-checked every minute). */
export function useLivePromo(): PromoConfig | null {
  const [promo, setPromo] = useState<PromoConfig | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let active = true;
    loadPromo().then((p) => { if (active) setPromo(p); });
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  return isPromoLive(promo, now) ? promo : null;
}

/**
 * Native app popup for the same promotion. Store prices are set in App Store Connect /
 * Play Console; this only announces them. Extra app_config keys:
 *   promo_app_aktiv       'true' | 'false'
 *   promo_app_plattformen comma list, e.g. 'ios' or 'ios,android'
 */
export const PROMO_APP_KEYS = ['promo_app_aktiv', 'promo_app_plattformen'];

export interface AppPromoConfig extends PromoConfig {
  platforms: string[];
}

export async function loadAppPromo(platform: string): Promise<AppPromoConfig | null> {
  try {
    const { data, error } = await getSupabase()
      .from('app_config')
      .select('key, value')
      .in('key', [...PROMO_KEYS, ...PROMO_APP_KEYS]);
    if (error || !data) return null;
    const map: Record<string, string> = {};
    data.forEach((row: any) => { map[row.key] = row.value; });
    const percent = Math.min(90, Math.max(0, parseInt(map.promo_rabatt_prozent || '0', 10) || 0));
    const platforms = (map.promo_app_plattformen || 'ios').split(',').map((p) => p.trim().toLowerCase()).filter(Boolean);
    const promo: AppPromoConfig = {
      enabled: map.promo_app_aktiv === 'true' && percent > 0 && platforms.includes(platform),
      percent,
      startsAt: parseDate(map.promo_start),
      endsAt: parseDate(map.promo_ende),
      title: map.promo_titel || 'Black Friday Wochenende',
      platforms,
    };
    return isPromoLive(promo) ? promo : null;
  } catch {
    return null;
  }
}
