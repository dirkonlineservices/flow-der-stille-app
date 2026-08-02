import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '', honeypot: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const trackLead = () => {
    if (typeof window !== 'undefined') {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: 'generate_lead',
        form_name: 'contact_form_flow_der_stille'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const { error } = await supabase.functions.invoke('smart-responder', {
        body: formData
      });

      if (error) throw error;

      setStatus('success');
      trackLead(); // Conversion erst feuern, wenn das Backend "Success" meldet!
    } catch (err) {
      console.error('Email send error:', err);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div style={{
        backgroundColor: 'var(--bg-card, #fff)',
        border: '1px solid var(--border, #e5e7eb)',
        borderRadius: '12px',
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--text-main, #111)'
      }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--accent, #3b82f6)' }} className="text-xl font-bold">Nachricht gesendet</h3>
        <p style={{ color: 'var(--text-muted, #6b7280)' }}>Vielen Dank. Wir haben deine Nachricht erhalten und melden uns in Kürze bei dir.</p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'var(--bg-card, #fff)',
      border: '1px solid var(--border, #e5e7eb)',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Honeypot - Unsichtbar für echte Nutzer, blockt Bots */}
        <input 
          type="text" 
          name="honeypot" 
          value={formData.honeypot} 
          onChange={handleChange} 
          style={{ display: 'none' }} 
          tabIndex={-1} 
          autoComplete="off" 
        />

        <div>
          <label style={{ display: 'block', color: 'var(--text-muted, #6b7280)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Name</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'var(--bg-alt, #f9fafb)',
              border: '1px solid var(--border, #e5e7eb)',
              borderRadius: '8px',
              color: 'var(--text-main, #111)',
              outline: 'none'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: 'var(--text-muted, #6b7280)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>E-Mail</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'var(--bg-alt, #f9fafb)',
              border: '1px solid var(--border, #e5e7eb)',
              borderRadius: '8px',
              color: 'var(--text-main, #111)',
              outline: 'none'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: 'var(--text-muted, #6b7280)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nachricht</label>
          <textarea
            name="message"
            required
            rows={4}
            value={formData.message}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'var(--bg-alt, #f9fafb)',
              border: '1px solid var(--border, #e5e7eb)',
              borderRadius: '8px',
              color: 'var(--text-main, #111)',
              outline: 'none',
              resize: 'vertical'
            }}
          />
        </div>

        {status === 'error' && (
          <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>Es gab ein Problem beim Senden. Bitte versuche es später noch einmal.</p>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            backgroundColor: 'var(--accent, #3b82f6)',
            color: '#fff',
            border: 'none',
            padding: '0.875rem',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            marginTop: '0.5rem',
            fontWeight: 500
          }}
        >
          {status === 'loading' ? 'Wird gesendet...' : 'Nachricht senden'}
        </button>
      </form>
    </div>
  );
};
