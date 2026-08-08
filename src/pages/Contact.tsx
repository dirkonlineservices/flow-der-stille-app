import React from 'react';
import SEO from '../components/SEO';
import { ContactForm } from '../components/ContactForm';

export default function Contact() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <SEO title="Kontakt" description="Schreibe uns eine Nachricht." />
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-serif text-[var(--color-accent-primary,var(--accent))] mb-2">Kontakt</h1>
        <p className="text-[var(--color-text-muted,var(--text-muted))]">Schreibe uns eine Nachricht. Wir melden uns bei dir.</p>
      </header>

      <ContactForm />
    </div>
  );
}
