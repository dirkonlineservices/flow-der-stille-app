import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Leaf, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function Danke() {
  useEffect(() => {
    // DataLayer Push für den Form-Submit Flow
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      'event': 'form_submit',
      'form_name': 'Flow der Stille'
    });
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-20 px-4 text-center">
      <SEO title="Danke" description="Vielen Dank für Ihre Anfrage bei Flow der Stille." />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--color-bg-card)] p-12 rounded-3xl shadow-sm border border-[var(--color-border-main)]"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[var(--color-bg-alt)] rounded-full flex items-center justify-center text-[var(--color-accent-primary)]">
            <Leaf size={32} />
          </div>
        </div>
        
        <h1 className="text-4xl font-serif text-[var(--color-text-main)] mb-4">Vielen Dank!</h1>
        <p className="text-lg text-[var(--color-text-muted)] mb-8">
          Wir haben Ihre Anfrage erhalten und melden uns in Kürze bei Ihnen.
        </p>
        
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] text-white rounded-full font-medium transition-all"
        >
          <ArrowLeft size={18} /> Zurück zur App
        </Link>
      </motion.div>
    </div>
  );
}
