import React from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DataDeletion() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl md:text-4xl font-serif text-white mb-8 tracking-tight">Konto & Daten unwiderruflich löschen</h1>
        
        <p className="text-gray-400 text-base leading-relaxed mb-10">
          Wenn du keinen Zugriff mehr auf die App hast und dein Konto sowie alle zugehörigen Daten bei 'Flow der Stille' löschen möchtest, kannst du dies hier anfordern.
          <br /><br />
          Sende uns dazu einfach eine E-Mail von der Adresse, mit der du registriert bist. Wir führen die Löschung innerhalb von 14 Tagen manuell durch.
        </p>

        <a 
          href="mailto:support@flow-der-stille.de?subject=Anforderung%20zur%20Kontol%C3%B6schung&body=Hallo%20Team%2C%20bitte%20l%C3%B6scht%20mein%20Konto%20und%20alle%20zugeh%C3%B6rigen%20Daten%20bei%20Flow%20der%20Stille.%20Meine%20registrierte%20E-Mail-Adresse%20lautet%3A%20%5BBitte%20E-Mail%20eintragen%5D."
          className="inline-flex items-center gap-3 bg-emerald-900/30 border border-emerald-900/50 hover:bg-emerald-900/50 text-emerald-200 px-8 py-4 rounded-2xl transition-all font-medium text-lg"
        >
          <Mail size={20} />
          E-Mail-Anfrage senden
        </a>
      </div>

      <footer className="mt-20">
        <Link to="/datenschutz" className="text-gray-600 hover:text-gray-400 text-sm flex items-center gap-2 transition-colors">
          <ArrowLeft size={14} />
          Zurück zum Datenschutz
        </Link>
      </footer>
    </div>
  );
}
