import React, { useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabaseClient';
import { PROMO_KEYS, loadPromo } from '../lib/promo';

/** Admin card to control the web-wide promo (keys promo_* in public.app_config). */
export const PromoAdminCard: React.FC = () => {
  const [values, setValues] = useState<Record<string, string>>({
    promo_aktiv: 'false',
    promo_rabatt_prozent: '10',
    promo_start: '',
    promo_ende: '',
    promo_titel: 'Black Friday Wochenende',
  });
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSupabase()
      .from('app_config')
      .select('key, value')
      .in('key', PROMO_KEYS)
      .then(({ data }) => {
        if (!data) return;
        setValues((prev) => {
          const next = { ...prev };
          data.forEach((row: any) => { next[row.key] = row.value; });
          return next;
        });
      });
  }, []);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((prev) => ({ ...prev, [key]: e.target.type === 'checkbox' ? String(e.target.checked) : e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    const now = new Date().toISOString();
    const rows = PROMO_KEYS.map((key) => ({ key, value: (values[key] || '').trim(), updated_at: now }));
    const { error } = await getSupabase().from('app_config').upsert(rows, { onConflict: 'key' });
    setSaving(false);
    if (error) {
      setStatus(`Fehler: ${error.message}`);
    } else {
      setStatus('Gespeichert. Die Webseite zeigt die Aktion beim nächsten Seitenaufruf.');
      loadPromo(true);
    }
  };

  const inputClass = 'w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-sm text-stone-950';

  return (
    <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
      <div>
        <h3 className="font-serif text-xl font-bold text-stone-950">Rabattaktion Webseite (Ruhe-Shop)</h3>
        <p className="text-xs text-stone-700 mt-1">
          Gilt nur für PayPal-Käufe im Web. App-Preise werden in App Store Connect und der Play Console gesetzt.
          Zeiten im Format 2026-11-29T23:59:59+01:00.
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold text-stone-950">
        <input type="checkbox" checked={values.promo_aktiv === 'true'} onChange={set('promo_aktiv')} className="w-4 h-4 accent-emerald-700" />
        Aktion aktiv
      </label>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-xs font-semibold text-stone-800 space-y-1">
          <span>Titel</span>
          <input className={inputClass} value={values.promo_titel} onChange={set('promo_titel')} />
        </label>
        <label className="text-xs font-semibold text-stone-800 space-y-1">
          <span>Rabatt in Prozent</span>
          <input className={inputClass} type="number" min={1} max={90} value={values.promo_rabatt_prozent} onChange={set('promo_rabatt_prozent')} />
        </label>
        <label className="text-xs font-semibold text-stone-800 space-y-1">
          <span>Start</span>
          <input className={inputClass} value={values.promo_start} onChange={set('promo_start')} />
        </label>
        <label className="text-xs font-semibold text-stone-800 space-y-1">
          <span>Ende</span>
          <input className={inputClass} value={values.promo_ende} onChange={set('promo_ende')} />
        </label>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="px-5 py-2 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-bold disabled:opacity-60">
          {saving ? 'Speichert ...' : 'Aktion speichern'}
        </button>
        {status && <span className="text-xs font-semibold text-stone-800">{status}</span>}
      </div>
    </form>
  );
};

export default PromoAdminCard;
