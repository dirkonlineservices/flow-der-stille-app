import { getSupabase } from './supabaseClient';

export interface GamificationUserProgress {
  id: string;
  email: string;
  name: string;
  week: number;
  percentage: number;
  phase: number;
  lastActive?: string;
  appVersion?: string;
}

export interface GamificationStats {
  totalTrackedUsers: number;
  maxWeekReached: number;
  leadUser: GamificationUserProgress | null;
  phaseCounts: {
    phase1: number; // Woche 1–13
    phase2: number; // Woche 14–26
    phase3: number; // Woche 27–39
    phase4: number; // Woche 40–52
  };
  weekDistribution: Record<number, number>; // { [weekNumber]: count }
  alertLevel: 'green' | 'yellow' | 'orange' | 'red';
  alertMessage: string;
  users: GamificationUserProgress[];
}

// Schwellenwerte für Frühwarnung per E-Mail:
// Dirk & Team benötigen 7 bis 8 Wochen Vorlaufzeit (Woche 44/45), Endspurt (Woche 48) und Abschluss (Woche 52)
const ALERT_MILESTONES = [44, 48, 52];

/**
 * Synchronisiert den Wochenfortschritt des Nutzers in Supabase (profiles)
 * und löst bei Erreichen von 7-8 Wochen Vorlaufzeit (Woche 44/45) oder Endspurt automatisch einen E-Mail-Alarm aus.
 */
export async function syncUserWeekProgress(
  userId: string,
  weekIndex: number, // 0-basiert (0 = Woche 1, 43 = Woche 44, etc.)
  userEmail?: string,
  userName?: string
): Promise<void> {
  const currentWeek = weekIndex + 1; // 1 bis 52
  const supabase = getSupabase();

  try {
    // 1. In profiles speichern (wir nutzen message_count als integer + premium_type als Text-Fallback)
    const updatePayload: any = {
      message_count: currentWeek,
      premium_type: `woche_${currentWeek}`,
      updated_at: new Date().toISOString()
    };

    const { error: updateErr } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId);

    if (updateErr) {
      console.warn('Profiles update failed, trying fallback:', updateErr.message);
    }
  } catch (e) {
    console.warn('Could not update user week in profiles:', e);
  }

  // 2. Alarm-Prüfung: Hat der Nutzer einen Meilenstein erreicht?
  if (ALERT_MILESTONES.includes(currentWeek)) {
    const alertKey = `flow_alert_sent_week_${currentWeek}_${userId}`;
    const alreadySent = localStorage.getItem(alertKey);

    if (!alreadySent) {
      localStorage.setItem(alertKey, new Date().toISOString());
      await sendWeekThresholdAlert(currentWeek, userEmail, userName, userId);
    }
  }
}

/**
 * Sendet die automatische Alarm-E-Mail an das Team / Dirk
 */
export async function sendWeekThresholdAlert(
  weekNumber: number,
  userEmail?: string,
  userName?: string,
  userId?: string
): Promise<boolean> {
  const supabase = getSupabase();
  const remainingWeeks = Math.max(0, 52 - weekNumber);

  let urgencyPrefix = 'ℹ️ INFORMATION';
  let urgencyLevel = 'Frühzeitige Information';

  if (weekNumber >= 52) {
    urgencyPrefix = '🏆 MEISTERSCHAFT VOLLENDET';
    urgencyLevel = 'Nutzer hat alle 52 Wochen absolviert!';
  } else if (weekNumber >= 48) {
    urgencyPrefix = '🟠 ERHÖHTE AUFMERKSAMKEIT';
    urgencyLevel = `Endspurt! Nur noch ${remainingWeeks} Wochen Vorlaufzeit bis zum Kursende.`;
  } else if (weekNumber >= 44) {
    urgencyPrefix = '⚠️ FRÜHWARNUNG GAMIFICATION (7-8 WOCHEN VORLAUF)';
    urgencyLevel = `Genau 7 bis 8 Wochen Vorlaufzeit (${remainingWeeks} Wochen verbleibend). Perfektes Zeitfenster zur Erstellung neuer Inhalte!`;
  }

  try {
    const { error } = await supabase.functions.invoke('smart-responder', {
      body: {
        name: 'Flow der Stille Gamification Radar',
        email: userEmail || 'system@flow-der-stille.de',
        message: `[${urgencyPrefix}] 52-Wochen-Achtsamkeitskurs\n\n` +
          `Status-Update für die Wochenaufgaben:\n` +
          `Ein Nutzer hat soeben WOCHE ${weekNumber} von 52 erreicht!\n\n` +
          `-----------------------------------------\n` +
          `Nutzer: ${userName || 'Kunde'} <${userEmail || 'Nicht angegeben'}>\n` +
          `Nutzer-ID: ${userId || 'Unbekannt'}\n` +
          `Aktuelle Woche: Woche ${weekNumber} von 52 (${Math.round((weekNumber / 52) * 100)} % absolviert)\n` +
          `Verbleibende Wochen bis zum Ziel: ${remainingWeeks} Woche(n)\n` +
          `Dringlichkeitsstufe: ${urgencyLevel}\n` +
          `Datum: ${new Date().toLocaleString('de-DE')}\n` +
          `-----------------------------------------\n\n` +
          `💡 Empfohlene Handlungsschritte für das Team:\n` +
          `- Neue Achtsamkeitsübungen oder Meditationen vorbereiten\n` +
          `- Folgeinhalte für Level 2 / Fortgeschrittene planen\n` +
          `- Im Admin-Dashboard prüfen, wie viele weitere Nutzer folgen\n\n` +
          `Du kannst den Status jederzeit direkt in deinem Admin-Bereich unter "Mein Bereich" oder im Admin-Dashboard einsehen.`,
        honeypot: ''
      }
    });

    return !error;
  } catch (err) {
    console.error('Fehler beim Senden der Alarm-E-Mail:', err);
    return false;
  }
}

/**
 * Lädt die Verteilung aller registrierten Nutzer über die 52 Wochen
 */
export async function fetchGamificationDistribution(): Promise<GamificationStats> {
  const supabase = getSupabase();

  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, full_name, message_count, updated_at, created_at, premium_type');

    if (error || !profiles) {
      throw error || new Error('No profiles returned');
    }

    const weekDistribution: Record<number, number> = {};
    for (let i = 1; i <= 52; i++) {
      weekDistribution[i] = 0;
    }

    const phaseCounts = {
      phase1: 0, // 1–13
      phase2: 0, // 14–26
      phase3: 0, // 27–39
      phase4: 0  // 40–52
    };

    let maxWeek = 1;
    let leadUser: GamificationUserProgress | null = null;

    const users: GamificationUserProgress[] = profiles.map((p: any) => {
      // message_count speichert die Woche (1 bis 52), standardmäßig mindestens 1
      const rawWeek = parseInt(p.message_count, 10);
      const week = !isNaN(rawWeek) && rawWeek > 0 ? Math.min(52, rawWeek) : 1;

      weekDistribution[week] = (weekDistribution[week] || 0) + 1;

      if (week <= 13) phaseCounts.phase1++;
      else if (week <= 26) phaseCounts.phase2++;
      else if (week <= 39) phaseCounts.phase3++;
      else phaseCounts.phase4++;

      const displayName = (p.first_name || p.full_name || p.email?.split('@')[0] || 'Nutzer').trim();
      const userProg: GamificationUserProgress = {
        id: p.id,
        email: p.email || '',
        name: displayName,
        week,
        percentage: Math.round((week / 52) * 100),
        phase: week <= 13 ? 1 : week <= 26 ? 2 : week <= 39 ? 3 : 4,
        lastActive: p.updated_at || p.created_at,
        appVersion: p.premium_type || undefined
      };

      if (week >= maxWeek) {
        maxWeek = week;
        leadUser = userProg;
      }

      return userProg;
    });

    // Nutzer nach Fortschritt absteigend sortieren
    users.sort((a, b) => b.week - a.week);

    // Alarm-Stufe berechnen (Basis: 7 bis 8 Wochen Vorlaufzeit)
    let alertLevel: 'green' | 'yellow' | 'orange' | 'red' = 'green';
    let alertMessage = `🟢 Alles im grünen Bereich: Spitzenreiter ist in Woche ${maxWeek}/52. Mehr als 8 Wochen Vorlaufzeit verbleiben.`;

    if (maxWeek >= 52) {
      alertLevel = 'red';
      alertMessage = `🏆 Kursende erreicht: Nutzer haben alle 52 Wochen absolviert!`;
    } else if (maxWeek >= 48) {
      alertLevel = 'orange';
      alertMessage = `🟠 Erhöhte Aufmerksamkeit: Spitzenreiter in Woche ${maxWeek}/52. Nur noch ${52 - maxWeek} Wochen verbleibend bis zum Kursende.`;
    } else if (maxWeek >= 44) {
      alertLevel = 'yellow';
      alertMessage = `⚠️ Frühwarnung aktiv (7–8 Wochen Vorlaufzeit): Spitzenreiter in Woche ${maxWeek}/52! Genau das ideale Zeitfenster (${52 - maxWeek} Wochen Vorlauf) zur Vorbereitung neuer Übungen.`;
    }

    return {
      totalTrackedUsers: profiles.length,
      maxWeekReached: maxWeek,
      leadUser,
      phaseCounts,
      weekDistribution,
      alertLevel,
      alertMessage,
      users
    };
  } catch (err) {
    console.error('Fehler beim Laden der Gamification-Verteilung:', err);
    return {
      totalTrackedUsers: 0,
      maxWeekReached: 1,
      leadUser: null,
      phaseCounts: { phase1: 0, phase2: 0, phase3: 0, phase4: 0 },
      weekDistribution: {},
      alertLevel: 'green',
      alertMessage: 'Verbindung zu Gamification-Daten wird hergestellt...',
      users: []
    };
  }
}
