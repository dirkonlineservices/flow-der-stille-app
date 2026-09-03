import React, { useState, useEffect } from 'react';
import { 
  Trophy, AlertTriangle, Bell, CheckCircle2, Users, 
  Sparkles, RefreshCw, ChevronDown, ChevronUp, Search, Info
} from 'lucide-react';
import { 
  fetchGamificationDistribution, 
  sendWeekThresholdAlert, 
  GamificationStats, 
  GamificationUserProgress 
} from '../lib/gamificationMonitorService';

export function GamificationRadar() {
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<number>(30); // Standardmäßig z.B. Woche 30
  const [testSending, setTestSending] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    const data = await fetchGamificationDistribution();
    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendTestAlert = async () => {
    setTestSending(true);
    const ok = await sendWeekThresholdAlert(
      selectedWeek, 
      'test-user@flow-der-stille.de', 
      'Beispiel-Nutzer (Test)', 
      'test-id'
    );
    setTestSending(false);
    if (ok) {
      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 4000);
    }
  };

  if (loading && !stats) {
    return (
      <div className="p-8 text-center bg-[var(--color-bg-card)] rounded-3xl border border-[var(--color-border-main)]">
        <RefreshCw size={24} className="animate-spin mx-auto text-[var(--color-accent-primary)] mb-2" />
        <p className="text-xs text-[var(--color-text-muted)]">Gamification-Fortschritt der Nutzer wird analysiert...</p>
      </div>
    );
  }

  const alertStyles = {
    green: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200',
    yellow: 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200',
    orange: 'bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 text-orange-900 dark:text-orange-200',
    red: 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
  };

  const usersInSelectedWeek = stats?.users.filter(u => u.week === selectedWeek) || [];
  const filteredUsers = stats?.users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `woche ${u.week}`.includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="bg-[var(--color-bg-card)] rounded-3xl border border-[var(--color-border-main)] shadow-sm p-6 sm:p-8 space-y-6">
      
      {/* Header mit Titel & Aktionen */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border-main)]/70">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Trophy size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[var(--color-text-main)]">
                52-Wochen Gamification Radar &amp; Alarm
              </h3>
              <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Live-Monitor
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Frühwarnsystem: Zeigt, in welcher Woche sich welche Nutzer befinden, um rechtzeitig neue Übungen anzulegen.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-[var(--color-bg-alt)] hover:bg-[var(--color-bg-border)] text-[var(--color-text-main)] text-xs font-semibold border border-[var(--color-border-main)] transition flex items-center gap-1.5 cursor-pointer"
            title="Daten aktualisieren"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Aktualisieren</span>
          </button>
        </div>
      </div>

      {/* 1. Alarm-Box / Frühwarn-Banner */}
      <div className={`p-4 sm:p-5 rounded-2xl border ${alertStyles[stats?.alertLevel || 'green']} shadow-2xs`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm flex items-center gap-2">
                <span>Frühwarn-Status:</span>
                <span className="uppercase tracking-wider text-xs font-semibold px-2 py-0.5 rounded-full bg-white/70 dark:bg-black/30">
                  {stats?.alertLevel === 'green' ? '🟢 Alles im Plan' : stats?.alertLevel === 'yellow' ? '🟡 Frühwarnung (Woche 30+)' : stats?.alertLevel === 'orange' ? '🟠 Endspurt (Woche 40+)' : '🚨 Dringender Vorlaufbedarf'}
                </span>
              </div>
              <p className="text-xs mt-1 leading-relaxed opacity-95">
                {stats?.alertMessage}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSendTestAlert}
              disabled={testSending}
              className="px-3.5 py-1.5 bg-white/90 dark:bg-stone-800 hover:bg-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer border border-current"
              title="Test-E-Mail an das Team senden"
            >
              <Bell size={13} />
              <span>{testSending ? 'Sendet...' : 'Test-Alarm per E-Mail'}</span>
            </button>
            {testSuccess && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 whitespace-nowrap animate-fade-in">
                <CheckCircle2 size={14} /> E-Mail gesendet!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Schnell-Kennzahlen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[var(--color-bg-alt)] border border-[var(--color-border-main)]">
          <span className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
            🏆 Spitzenreiter
          </span>
          <div className="text-2xl font-bold font-serif text-[var(--color-text-main)] mt-1">
            Woche {stats?.maxWeekReached} <span className="text-sm font-normal text-[var(--color-text-muted)]">/ 52</span>
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 block font-semibold">
            {Math.round(((stats?.maxWeekReached || 1) / 52) * 100)} % des Gesamtkurses
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--color-bg-alt)] border border-[var(--color-border-main)]">
          <span className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
            ⏳ Verbleibende Vorlaufzeit
          </span>
          <div className="text-2xl font-bold font-serif text-[var(--color-text-main)] mt-1">
            {Math.max(0, 52 - (stats?.maxWeekReached || 1))} <span className="text-sm font-normal text-[var(--color-text-muted)]">Wochen</span>
          </div>
          <span className="text-[10px] text-[var(--color-text-muted)] mt-0.5 block">
            Bis der 1. Nutzer Woche 52 beendet
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--color-bg-alt)] border border-[var(--color-border-main)]">
          <span className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
            👥 Getrackte Nutzer
          </span>
          <div className="text-2xl font-bold font-serif text-[var(--color-text-main)] mt-1">
            {stats?.totalTrackedUsers || 0}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 block font-semibold">
            Im Gamification-System aktiv
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--color-bg-alt)] border border-[var(--color-border-main)]">
          <span className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
            🎯 Nutzer in Woche {selectedWeek}
          </span>
          <div className="text-2xl font-bold font-serif text-[var(--color-accent-primary)] mt-1">
            {stats?.weekDistribution[selectedWeek] || 0}
          </div>
          <span className="text-[10px] text-[var(--color-text-muted)] mt-0.5 block">
            Woche {selectedWeek} von 52
          </span>
        </div>
      </div>

      {/* 3. Phasen-Verteilung (Die 4 Quartale der 52 Wochen) */}
      <div className="p-5 rounded-2xl bg-[var(--color-bg-alt)]/60 border border-[var(--color-border-main)] space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            <span>Verteilung nach 4 Entwicklungs-Phasen</span>
          </h4>
          <span className="text-[11px] text-[var(--color-text-muted)]">
            52 Wochen gesamt
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-main)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Phase 1 (Woche 1–13)</span>
              <span className="text-sm font-bold">{stats?.phaseCounts.phase1 || 0} User</span>
            </div>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Fundament der Ruhe &amp; Wahrnehmung</p>
          </div>

          <div className="p-3 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-main)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400">Phase 2 (Woche 14–26)</span>
              <span className="text-sm font-bold">{stats?.phaseCounts.phase2 || 0} User</span>
            </div>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Emotionale Balance &amp; Resilienz</p>
          </div>

          <div className="p-3 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-main)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Phase 3 (Woche 27–39)</span>
              <span className="text-sm font-bold">{stats?.phaseCounts.phase3 || 0} User</span>
            </div>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Vertiefte Achtsamkeit &amp; Reflexion</p>
          </div>

          <div className="p-3 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-main)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-700 dark:text-purple-400">Phase 4 (Woche 40–52)</span>
              <span className="text-sm font-bold">{stats?.phaseCounts.phase4 || 0} User</span>
            </div>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Meisterschaft der Stille (Endspurt)</p>
          </div>
        </div>
      </div>

      {/* 4. Konkrete Wochen-Abfrage (z.B. "Wie viele User sind in Woche 30?") */}
      <div className="p-5 rounded-2xl bg-[var(--color-bg-alt)]/60 border border-[var(--color-border-main)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
              <Search size={16} className="text-[var(--color-accent-primary)]" />
              <span>Gezielte Wochenabfrage (z. B. Woche 30)</span>
            </h4>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Wähle eine beliebige Woche aus, um die Anzahl und Namen der Nutzer anzuzeigen:
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-[var(--color-text-muted)]">Woche:</label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="px-3 py-1.5 bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-xl text-xs font-bold text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]"
            >
              {Array.from({ length: 52 }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  Woche {w} ({stats?.weekDistribution[w] || 0} User)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Schnellwahl-Buttons für häufig geprüfte Meilensteine */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-[var(--color-text-muted)] mr-1">Wichtige Meilensteine:</span>
          {[1, 13, 26, 30, 35, 40, 45, 50, 52].map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWeek(w)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                selectedWeek === w
                  ? 'bg-[var(--color-accent-primary)] text-white shadow-xs'
                  : 'bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-border)] text-[var(--color-text-main)] border border-[var(--color-border-main)]'
              }`}
            >
              Woche {w} ({stats?.weekDistribution[w] || 0})
            </button>
          ))}
        </div>

        {/* Ergebnis der gewählten Woche */}
        <div className="p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-main)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs text-[var(--color-text-muted)] block">Aktuelles Ergebnis für:</span>
            <span className="text-base font-bold font-serif text-[var(--color-text-main)]">
              Woche {selectedWeek} von 52: <span className="text-[var(--color-accent-primary)]">{usersInSelectedWeek.length} Nutzer</span>
            </span>
          </div>

          {usersInSelectedWeek.length > 0 ? (
            <div className="text-xs text-[var(--color-text-main)]">
              <span className="font-semibold">Nutzer in dieser Woche: </span>
              {usersInSelectedWeek.map(u => u.name).join(', ')}
            </div>
          ) : (
            <span className="text-xs text-[var(--color-text-muted)] italic">
              Derzeit befindet sich kein Nutzer exakt in Woche {selectedWeek}.
            </span>
          )}
        </div>
      </div>

      {/* 5. Alle Nutzer & Detail-Fortschritt einsehen (Aufklappbar) */}
      <div className="pt-2">
        <button
          onClick={() => setShowUserList(!showUserList)}
          className="w-full p-4 bg-[var(--color-bg-alt)] hover:bg-[var(--color-bg-border)] rounded-2xl border border-[var(--color-border-main)] transition flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-xs font-bold text-[var(--color-text-main)]">
            <Users size={16} className="text-[var(--color-accent-primary)]" />
            <span>Alle Nutzer mit aktuellem Wochenfortschritt auflisten ({stats?.users.length || 0})</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent-primary)]">
            <span>{showUserList ? 'Einklappen' : 'Details anzeigen'}</span>
            {showUserList ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {showUserList && (
          <div className="mt-3 p-4 bg-[var(--color-bg-alt)]/40 rounded-2xl border border-[var(--color-border-main)] space-y-3 animate-fade-in">
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nutzer suchen (Name, E-Mail oder Woche)..."
                className="w-full p-2 bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-xl text-xs text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]"
              />
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-3 bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-[var(--color-text-main)] truncate">
                      {u.name}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)] truncate">
                      {u.email}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-[var(--color-accent-primary)] text-sm">
                      Woche {u.week} <span className="text-[10px] text-[var(--color-text-muted)]">/ 52</span>
                    </span>
                    <div className="w-28 bg-[var(--color-bg-alt)] rounded-full h-1.5 mt-1 border border-[var(--color-border-main)] overflow-hidden">
                      <div
                        className="bg-[var(--color-accent-primary)] h-full rounded-full transition-all"
                        style={{ width: `${u.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
