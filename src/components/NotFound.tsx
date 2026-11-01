import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  const [isReported, setIsReported] = useState(false);

  const handleReturnHome = () => {
    const dataLayer = (window as any).dataLayer || [];
    dataLayer.push({ event: '404_return_home_click' });
    navigate('/');
  };

  const handleReportError = async () => {
    setIsReported(true);
    const dataLayer = (window as any).dataLayer || [];
    dataLayer.push({ event: 'error_report_clicked', error_path: window.location.pathname });
    
    // Placeholder for Supabase integration:
    // await supabase.from('error_reports').insert({ path: window.location.pathname });
    console.log("Fehlerpfad erfasst:", window.location.pathname);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-main)] p-4 text-center">
      <h1 className="text-[var(--text-muted)] text-xl font-light mb-6">
        Dieser Raum der Stille existiert leider nicht.
      </h1>
      <button
        onClick={handleReturnHome}
        className="px-6 py-3 bg-[var(--accent)] text-white rounded-full font-medium transition-all hover:bg-[var(--accent-hover)]"
      >
        Zurück zur Startseite
      </button>
      <button
        onClick={handleReportError}
        disabled={isReported}
        className="mt-4 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors disabled:opacity-50"
      >
        {isReported ? "Danke! Der Fehler wurde erfasst." : "Fehler an Entwickler melden"}
      </button>
    </div>
  );
};

export default NotFound;
