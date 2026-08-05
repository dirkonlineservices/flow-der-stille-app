import React, { useState } from 'react';
import { ShieldAlert, Check } from 'lucide-react';
import { useDisclaimerStatus } from '../hooks/useDisclaimerStatus';

interface DisclaimerModalProps {
  isOpen: boolean;
  onAccepted: () => void;
}

export default function DisclaimerModal({ isOpen, onAccepted }: DisclaimerModalProps) {
  const [isChecked, setIsChecked] = useState(false);
  const { acceptDisclaimer } = useDisclaimerStatus();

  if (!isOpen) return null;

  const handleAccept = async () => {
    if (!isChecked) return;
    await acceptDisclaimer();
    onAccepted();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="max-w-xl w-full rounded-2xl border p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all duration-300"
        style={{ 
          backgroundColor: 'var(--bg-card)', 
          borderColor: 'var(--border)', 
          color: 'var(--text-main)' 
        }}
      >
        {/* Accent top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[var(--accent)]" />

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[var(--bg-alt)] border border-[var(--border)] flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-[var(--accent)]" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Wichtiger Hinweis &amp; Haftungsausschluss
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] font-sans">
              Flow der Stille • Sicherheit &amp; Verantwortung
            </p>
          </div>
        </div>

        <div className="space-y-4 text-sm font-sans text-[var(--text-muted)] max-h-[50vh] overflow-y-auto pr-2 mb-6 custom-scrollbar">
          <p className="leading-relaxed">
            Die hier angebotenen Meditationen, Tiefenentspannungen und Selbsthypnosen dienen ausschließlich der persönlichen Entspannung, der Mentaltresor-Nutzung und der Selbsterfahrung. Sie stellen ausdrücklich keine therapeutischen oder fachlichen Behandlungen dar und ersetzen keinen Arzt, Therapeuten oder Fachberater.
          </p>

          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-alt)] space-y-2">
            <h3 className="font-semibold text-[var(--text-main)] text-xs uppercase tracking-wider">
              Voraussetzungen für die Nutzung:
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-xs leading-relaxed">
              <li>Setzt körperliche und geistige Gesundheit voraus.</li>
              <li>Nicht anzuwenden bei Epilepsie, schweren Herzerkrankungen, Psychosen oder während der Einnahme von bewusstseinsverändernden Medikamenten/Drogen.</li>
              <li>Niemals während des Autofahrens oder bei Tätigkeiten anwenden, die volle Aufmerksamkeit erfordern.</li>
              <li>Die Nutzung erfolgt vollkommen auf eigene Verantwortung und Gefahr.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-6 pt-2 border-t border-[var(--border)]">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5 flex items-center justify-center">
              <input 
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-5 h-5 rounded border border-[var(--border)] bg-[var(--bg-alt)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] transition-all flex items-center justify-center">
                <Check className={`w-3.5 h-3.5 text-white transition-opacity ${isChecked ? 'opacity-100' : 'opacity-0'}`} />
              </div>
            </div>
            <span className="text-xs sm:text-sm text-[var(--text-main)] font-sans select-none leading-relaxed group-hover:opacity-90">
              Ich habe den Hinweis gelesen und stimme der Nutzung auf eigene Verantwortung zu.
            </span>
          </label>

          <button
            onClick={handleAccept}
            disabled={!isChecked}
            className={`w-full py-3.5 px-6 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              isChecked 
                ? 'bg-[var(--accent)] text-white hover:opacity-95 shadow-md cursor-pointer' 
                : 'bg-[var(--bg-alt)] text-[var(--text-muted)] opacity-50 cursor-not-allowed border border-[var(--border)]'
            }`}
          >
            Ich habe den Hinweis gelesen und stimme der Nutzung auf eigene Verantwortung zu.
          </button>
        </div>
      </div>
    </div>
  );
}
