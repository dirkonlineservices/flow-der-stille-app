import React, { useState } from 'react';
import { getSupabase } from '../lib/supabaseClient';
import SEO from '../components/SEO';

export default function OnlineWiderruf() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', order_id: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFirstStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('contract_revocations')
        .insert([{
            name: formData.name,
            email: formData.email,
            order_id: formData.order_id
        }]);
      
      if (error) throw error;

      // Tracking
      if (typeof window !== 'undefined') {
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push({
          event: 'contract_revocation_submitted',
          order_id: formData.order_id
        });
      }

      setStep(3);
    } catch (err: any) {
        setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[var(--color-bg-body)] p-6">
      <SEO title="Online-Widerruf" description="Online-Formular für Ihren Widerruf." />
      <div className="w-full max-w-md bg-[var(--color-bg-card)] p-8 rounded-3xl shadow-lg border border-[var(--color-border-main)]">
        <h2 className="text-3xl font-serif text-[var(--color-accent-primary)] mb-6 text-center">
            {step === 1 ? 'Widerruf einreichen' : step === 2 ? 'Widerruf bestätigen' : 'Widerruf abgeschickt'}
        </h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        {step === 1 && (
            <form onSubmit={handleFirstStep} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">Vollständiger Name</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-[var(--color-bg-alt)] rounded-xl border border-[var(--color-border-main)] focus:ring-2 focus:ring-[var(--color-accent-primary)] outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">E-Mail-Adresse</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-3 bg-[var(--color-bg-alt)] rounded-xl border border-[var(--color-border-main)] focus:ring-2 focus:ring-[var(--color-accent-primary)] outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">Vertrags-Identifikation (Bestellnummer)</label>
                    <input type="text" required value={formData.order_id} onChange={(e) => setFormData({...formData, order_id: e.target.value})} className="w-full p-3 bg-[var(--color-bg-alt)] rounded-xl border border-[var(--color-border-main)] focus:ring-2 focus:ring-[var(--color-accent-primary)] outline-none" />
                </div>
                <button type="submit" className="w-full py-3 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] text-white rounded-xl font-medium transition-all">Widerruf einreichen</button>
            </form>
        )}
        {step === 2 && (
            <div className="space-y-4">
                <p className="text-[var(--color-text-muted)] text-sm">Bitte bestätigen Sie Ihre Angaben:</p>
                <div className="bg-[var(--color-bg-alt)] p-4 rounded-xl text-sm space-y-1">
                    <p><strong>Name:</strong> {formData.name}</p>
                    <p><strong>E-Mail:</strong> {formData.email}</p>
                    <p><strong>Bestellnummer:</strong> {formData.order_id}</p>
                </div>
                <button onClick={handleConfirm} disabled={loading} className="w-full py-3 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] text-white rounded-xl font-medium transition-all disabled:opacity-50">Widerruf bestätigen</button>
                <button onClick={() => setStep(1)} className="w-full text-center text-sm text-[var(--color-text-muted)] hover:underline">Zurück zur Eingabe</button>
            </div>
        )}
        {step === 3 && (
            <p className="text-center text-[var(--color-text-muted)]">Vielen Dank, Ihr Widerruf wurde erfolgreich übermittelt. Eine Bestätigung erhalten Sie in Kürze per E-Mail.</p>
        )}
      </div>
    </div>
  );
}
