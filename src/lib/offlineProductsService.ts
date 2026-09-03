/**
 * offlineProductsService.ts
 *
 * Stellt den kompletten Produktkatalog offline in der App-Sandbox bereit.
 * Sorgt dafür, dass auch im Flugmodus (ohne Internet/Supabase) alle Produkte,
 * Beschreibungen, Preise, Kategorien und Audio-Pfade sofort sichtbar und nutzbar sind.
 */

export interface ProductData {
  id: string;
  titel: string;
  beschreibung: string;
  kategorie: string;
  audio_path: string;
  created_at: string;
  preis: number;
  waehrung: string;
  dauer: number;
  highlights: string[] | null;
  audio_hinweis: string | null;
  play_store_id: string | null;
  hoerprobe_url: string | null;
  is_active: boolean;
  image_url?: string;
}

const STORAGE_KEY_PRODUCTS = 'flow_offline_products_cache';
const STORAGE_KEY_PURCHASES = 'flow_offline_my_purchases_cache';

// Vorab gebündelter Offline-Katalog für den Flugmodus
export const DEFAULT_PRODUCTS: ProductData[] = [
  {
    "id": "gefuehrte_atemuebung",
    "titel": "Geführte Atemübung  ",
    "beschreibung": "Geführte Atemübung\nHöre eine geführte Atemübung zur Beruhigung deines Nervensystems.\n\nStelle sicher, dass deine Gerätelautstärke eingeschaltet ist.",
    "kategorie": "Kostenfreie Anwendungen",
    "audio_path": "https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/Kostenfreie%20Produkte/anleitung_atmen.mp3",
    "created_at": "2026-06-14T10:35:29+00:00",
    "preis": 0,
    "waehrung": "EUR",
    "dauer": 109,
    "highlights": null,
    "audio_hinweis": "Kostenfreie Schnupper-Übung: Kompakt mit moderner KI generiert, um dir sofort und ohne Hürde Ruhe zu schenken.",
    "play_store_id": "fds_gefuehrte_atemuebung",
    "hoerprobe_url": null,
    "is_active": true
  },
  {
    "id": "pmr_basis",
    "titel": "Progressive Muskelentspannung",
    "beschreibung": "Tiefenentspannung für deinen Körper: Progressive Muskelentspannung (PMR)\r\n\r\nAnwendung zur Progressiven Muskelentspannung Schalte den Stress des Alltags aktiv ab. Diese geführte PMR-Sitzung nutzt das wissenschaftlich bewiesene Prinzip der bewussten Anspannung und Entspannung, um tiefe körperliche Ruhe zu erzeugen, Stresssymptome zu lindern und deine Schlafqualität nachhaltig zu verbessern. Ideal für zwischendurch oder als Abendroutine.",
    "kategorie": "Kostenfreie Anwendungen",
    "audio_path": "https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/Kostenfreie%20Produkte/Progressive%20Muskelentspannung.mp3",
    "created_at": "2026-06-14T11:14:23+00:00",
    "preis": 0,
    "waehrung": "EUR",
    "dauer": 254,
    "highlights": null,
    "audio_hinweis": "Kostenfreie Schnupper-Übung: Kompakt mit moderner KI generiert, um dir sofort und ohne Hürde Ruhe zu schenken.",
    "play_store_id": "fds_pmr_basis",
    "hoerprobe_url": null,
    "is_active": true
  },
  {
    "id": "meditation_loslassen",
    "titel": "Meditation Loslassen",
    "beschreibung": "Kurz Meditation zum Loslassen (4:54) \nTauche ein in vollkommene innere Ruhe und lasse emotionale Lasten hinter dir.\nTrägst du unbewusst Stress, alte Sorgen oder blockierende Emotionen mit dir herum? \nDiese tiefenentspannende, geführte Meditation ist dein sicherer Raum, um den Geist zu klären und schwere Energien sanft dem Wind zu übergeben.",
    "kategorie": "Meditation ",
    "audio_path": "",
    "created_at": "2026-06-16T06:31:55+00:00",
    "preis": 1.99,
    "waehrung": "EUR",
    "dauer": 294,
    "highlights": null,
    "audio_hinweis": "Herzenswerk: Von uns selbst geschrieben & mit warmer Stimme von Lisa Ragusa persönlich eingesprochen. Hintergrundmusik mit KI-Unterstützung komponiert.",
    "play_store_id": "fds_meditation_loslassen",
    "hoerprobe_url": null,
    "is_active": false
  },
  {
    "id": "selbsthypnose_ernaehrung",
    "titel": "Selbsthypnose: Gesunde Ernährung & Aktiver Lebensstil",
    "beschreibung": "Kennst du das? Der Kopf weiß genau, was gut für den Körper wäre, doch im stressigen Alltag greifen wir oft automatisch zu alten Mustern. Echte Veränderung beginnt nicht mit Verzicht, sondern mit einer neuen inneren Ausrichtung.\n\nDiese 14-minütige Selbsthypnose ist deine tägliche Abkürzung zu mehr Wohlbefinden. Sie verbindet modernste Mentaltechniken mit tiefer Entspannung, um dein Unterbewusstsein sanft auf eine gesunde Ernährung und die Freude an der Bewegung auszurichten. In weniger als einer Viertelstunde baust du inneren Druck ab und stärkst die intuitive Lust auf einen aktiven Lebensstil.\n\nFür wen geeignet?\nIdeal für alle, die wenig Zeit haben, aber nachhaltig und ohne Kampf ihre Gewohnheiten auf ein neues, vitales Level heben möchten.",
    "kategorie": "Selbsthypnose",
    "audio_path": "https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/Selbsthypnosen/Hynose%20Gesunde%20Ern%C3%A4hrung%20%26%20Aktiver%20Lebensstil.mp3",
    "created_at": "2026-06-24T13:05:30+00:00",
    "preis": 1.99,
    "waehrung": "EUR",
    "dauer": 847,
    "highlights": null,
    "audio_hinweis": "Herzenswerk: Von uns selbst geschrieben & mit warmer Stimme von Lisa Ragusa persönlich eingesprochen. Hintergrundmusik mit KI-Unterstützung komponiert.",
    "play_store_id": "fds_hypnose_gesunde_ernaehrung",
    "hoerprobe_url": null,
    "is_active": true
  },
  {
    "id": "selbshypnose_mehr_selbsbewusstsein_&_inneres_vertrauen",
    "titel": "Selbsthypnose: Mehr Selbstbewusstsein & Inneres Vertrauen",
    "beschreibung": "Echtes Selbstbewusstsein entsteht nicht durch laute Worte, sondern durch eine tiefe, unerschütterliche Ruhe in dir selbst. Die App Flow der Stille begleitet dich in einer 15:30 Minuten dauernden Session Schritt für Schritt in eine wohlthuende mentale Entspannung.\n\nIndem dein Verstand zur Ruhe kommt, lösen sich Selbstzweifel und innere Unruhe auf. Die gezielte Selbsthypnose hilft dir dabei, deinen eigenen Wert wieder klar zu spüren und mit gesundem Vertrauen auf deine Stärken zu blicken. Du begegnest Herausforderungen gelassener, triffst Entscheidungen mit Klarheit und ruhst fest in dir selbst.\n\nDeine Vorteile\nInnere Stabilität: Löse Zweifel und verankere ein ruhiges, solides Grundvertrauen.\n\nKlarer Auftritt: Begegne deinen Aufgaben und Mitmenschen aus einer Haltung der Gelassenheit.\n\nEffektives Ritual: In 15:30 Minuten zu einer gestärkten Wahrnehmung deiner eigenen Ressourcen.",
    "kategorie": "Selbsthypnose",
    "audio_path": "https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/Selbsthypnosen/Mehr%20Selbstbewusstsein%20%26%20Inneres%20Vertrauen%2015_30%20min.mp3",
    "created_at": "2026-07-21T07:31:06+00:00",
    "preis": 1.99,
    "waehrung": "EUR",
    "dauer": 930,
    "highlights": [
      "Ruhige Stärke von innen heraus. Verankere tiefes Vertrauen in deine eigenen Fähigkeiten."
    ],
    "audio_hinweis": "Herzenswerk: Von uns selbst geschrieben & mit warmer Stimme von Lisa Ragusa persönlich eingesprochen. Hintergrundmusik mit KI-Unterstützung komponiert.",
    "play_store_id": "fds_hypnose_selbstbewusstsein",
    "hoerprobe_url": null,
    "is_active": true
  },
  {
    "id": "selbsthypnose_fokus&konzentration",
    "titel": "Selbsthypnose: Fokus & Absolute Konzentration",
    "beschreibung": "In einer Welt voller Ablenkungen ist ungestörte Konzentration eine deiner wertvollsten Ressourcen. Die App Flow der Stille begleitet dich mit gezielter Selbsthypnose direkt in den Zustand absoluter Klarheit.\r\n\r\nAnstatt dich mit Mühe und Willenskraft zum Fokussieren zu zwingen, führt dich die Audio Session sanft in eine tiefe mentale Ruhe. Dein Verstand lässt störende Gedankenschleifen los. Dein Fokus richtet sich vollständig auf das, was jetzt gerade zählt.\r\n\r\nOb vor wichtigen Projekten, intensiven Lernphasen oder komplexen Aufgaben: Mit Flow der Stille verankerst du tiefe Konzentration als natürliche Routine im Alltag.\r\n\r\nDeine Vorteile\r\nKlarer Geist: Beende inneren Lärm und mentale Zerstreuung.\r\n\r\nMüheloser Fokus: Gelange ohne Druck in deinen persönlichen Flow Zustand.\r\n\r\nSchnelle Aktivierung: Ideal als kurzes Pre-Work-Ritual vor anspruchsvollen Aufgaben.",
    "kategorie": "Selbsthypnose",
    "audio_path": "https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/Selbsthypnosen/Selbsthypnose%20Fokus%20%26%20Absolute%20Konzentration%2015_41%20min.mp3.mp3",
    "created_at": "2026-07-22T07:19:01+00:00",
    "preis": 1.99,
    "waehrung": "EUR",
    "dauer": 941,
    "highlights": [
      "Schalte den Lärm aus. Aktiviere deinen tiefen Arbeitsmodus in nur wenigen Minuten."
    ],
    "audio_hinweis": "Herzenswerk: Von uns selbst geschrieben & mit warmer Stimme von Lisa Ragusa persönlich eingesprochen. Hintergrundmusik mit KI-Unterstützung komponiert.",
    "play_store_id": "fds_hypnose_fokus",
    "hoerprobe_url": null,
    "is_active": true
  },
  {
    "id": "meditation_innere_ruhe",
    "titel": "Meditation Innere Ruhe",
    "beschreibung": "Viele Anforderungen und Reize lassen den eigenen Raum manchmal eng werden. Diese Übung lädt dich ein, gedanklichen Druck sanft loszulassen und wieder festen Boden unter den Füßen zu spüren.\r\n\r\nDu richtest die Aufmerksamkeit nach innen und schenkst deinem Körper eine ehrliche Pause. Mit jedem bewussten Atemzug entsteht Platz für Sicherheit und Verankerung, sodass sich dein Geist wieder ordnen kann.\r\n\r\nIn 19:10 Min. findest du Schritt für Schritt zurück in dein eigenes Tempo und gewinnst wohltuende Klarheit. Wenn du magst, begleitet dich diese Meditation dabei, wieder ganz bei dir anzukommen.",
    "kategorie": "Meditation",
    "audio_path": "https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/meditation/Meditation%20innere%20Ruhe.mp3",
    "created_at": "2026-07-30T08:36:12+00:00",
    "preis": 1.99,
    "waehrung": "EUR",
    "dauer": 1150,
    "highlights": null,
    "audio_hinweis": "Herzenswerk: Von uns selbst geschrieben & mit warmer Stimme von Lisa Ragusa persönlich eingesprochen. Hintergrundmusik mit KI-Unterstützung komponiert.",
    "play_store_id": "fds_meditation_innere_ruhe",
    "hoerprobe_url": null,
    "is_active": true
  },
  {
    "id": "meditation_inneres_kind",
    "titel": "Meditation Inneres Kind",
    "beschreibung": "Manchmal melden sich alte Schutzmuster im Heute, wenn Situationen uns unerwartet berühren. Diese Meditation bietet dir einen geschützten Rahmen, um deinem inneren Kind wohlwollend zu begegnen. In 16 Minuten und 10 Sekunden hörst du deinen Bedürfnissen zu und schenkst dir ehrliche Zuwendung. So kann Schritt für Schritt wieder Vertrauen entstehen und Geborgenheit im eigenen Körper spürbar werden. Wenn du magst, begleitet dich diese Übung bei einer achtsamen Annahme deiner selbst.",
    "kategorie": "Meditation",
    "audio_path": "https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/meditation/Meditation%20inneres%20Kind.mp3",
    "created_at": "2026-08-03T09:10:13+00:00",
    "preis": 1.99,
    "waehrung": "EUR",
    "dauer": 970,
    "highlights": null,
    "audio_hinweis": "Herzenswerk: Von uns selbst geschrieben & mit warmer Stimme von Lisa Ragusa persönlich eingesprochen. Hintergrundmusik mit KI-Unterstützung komponiert.",
    "play_store_id": "fds_meditation_inneres_kind",
    "hoerprobe_url": null,
    "is_active": true
  },
  {
    "id": "meditation_herzkompass",
    "titel": "Meditation Herzkompass",
    "beschreibung": "Eine Einladung, dem eigenen Herzen mit Sanftheit zu begegnen und mehr Weite zuzulassen. Du schaffst Raum für Mitgefühl und spürbare Geborgenheit.\n\nManchmal zieht sich der Brustraum eng zusammen, wenn Schutzmuster uns vor Enttäuschungen bewahren wollen. Diese Meditation bietet dir die Möglichkeit, Anspannung im Herzbereich behutsam abzulegen. In 20 Minuten schenkst du deinen Gefühlen ehrliche Aufmerksamkeit und verbindest dich wieder mit dir selbst. So kann Schritt für Schritt ein Gefühl von wohlwollender Wärme und innerer Sicherheit wachsen. Wenn du magst, begleitet dich diese Übung bei einem behutsamen Öffnen nach innen.",
    "kategorie": "Meditation",
    "audio_path": "https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/meditation/Meditation%20Herzkompass.mp3",
    "created_at": "2026-08-05T13:00:21+00:00",
    "preis": 1.99,
    "waehrung": "EUR",
    "dauer": 1200,
    "highlights": null,
    "audio_hinweis": "Herzenswerk: Von uns selbst geschrieben & mit warmer Stimme von Lisa Ragusa persönlich eingesprochen. Hintergrundmusik mit KI-Unterstützung komponiert.",
    "play_store_id": "fds_herzkompass_meditation",
    "hoerprobe_url": null,
    "is_active": true
  },
  {
    "id": "meditation_zur_herzoeffnung",
    "titel": "Meditation zur Herzöffnung",
    "beschreibung": "Eine Einladung, dem eigenen Brustbereich mit Sanftheit zu begegnen und innere Wärme zuzulassen. Du schaffst Raum für Mitgefühl und spürbare Verbundenheit.\nManchmal fühlt sich der Brustbereich eng an, wenn Ereignisse oder Sorgen Spuren hinterlassen. Diese Meditation bietet dir die Möglichkeit, Anspannung im Herzbereich behutsam abzulegen. In 16 Minuten und 45 Sekunden schenkst du deinen Empfindungen aufrichtige Zuwendung und begegnest dir selbst mit Wohlwollen. So kann Schritt für Schritt wieder ein Gefühl von Weite und innerer Sicherheit wachsen. Wenn du magst, begleitet dich diese Übung dabei, dich sanft nach innen zu öffnen.",
    "kategorie": "Meditation",
    "audio_path": "https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/meditation/Meditation%20zur%20Herz%C3%B6ffnung.mp3",
    "created_at": "2026-08-05T14:00:46+00:00",
    "preis": 0,
    "waehrung": "EUR",
    "dauer": 1005,
    "highlights": null,
    "audio_hinweis": "Herzenswerk: Von uns selbst geschrieben & mit warmer Stimme von Lisa Ragusa persönlich eingesprochen. Hintergrundmusik mit KI-Unterstützung komponiert.",
    "play_store_id": "fds_herzoeffnung_meditation",
    "hoerprobe_url": "https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/hoerproben/Werbung(Hoerprobe)%20Herzoeffnung%20-%20%20Schutzpanzer.mp3",
    "is_active": true
  },
  {
    "id": "selbsthypnose_besser_und_erholsamer_schlaf",
    "titel": "Selbsthypnose Tiefer und erholsamer Schlaf",
    "beschreibung": "Am Abend fällt es manchmal schwer, die vielen erlebten Dinge ruhen zu lassen. Diese Selbsthypnose bietet dir einen sicheren Raum, um die Anspannung des Tages Stück für Stück abzugeben. Wenn du magst, begleitet dich die Anleitung in eine tiefe und natürliche körperliche Entspannung. Du gibst dir selbst die Erlaubnis loszulassen und ganz in deinem eigenen Tempo in einen erholsamen Schlaf zu finden.",
    "kategorie": "Selbsthypnose",
    "audio_path": "https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/Selbsthypnosen/Selbsthypnose%20Tiefer%20%26%20Erholsamer%20Schlaf.mp3",
    "created_at": "2026-08-14T08:28:15+00:00",
    "preis": 0,
    "waehrung": "EUR",
    "dauer": 774,
    "highlights": [
      "Kostenfrei"
    ],
    "audio_hinweis": "Herzenswerk: Von uns selbst geschrieben & mit warmer Stimme von Lisa Ragusa persönlich eingesprochen. Hintergrundmusik mit KI-Unterstützung komponiert.",
    "play_store_id": "fds_selbsthypnose_besserer_tieferer_schlaf",
    "hoerprobe_url": "https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/hoerproben/Werbung(hoerprobe)%20Selbsthypnose%20-%20%20Besser%20Schlafen.mp3",
    "is_active": true
  },
  {
    "id": "hoerbuch_der_tag_an_dem_der_schmetterling_erwachte",
    "titel": "Der Tag, an dem der Schmetterling erwachte",
    "beschreibung": "Hast du dich schon einmal gefragt, warum wir solche Angst vor dem Loslassen haben und was passiert, wenn wir die Schwelle überschreiten? \r\n​In diesem Hörbuch betrachten wir den Tod nicht als dunklen Abgrund, sondern als natürlichen Umzug unseres Bewusstseins: wie eine Raupe, die ihren Kokon verlässt, um als Schmetterling zu fliegen.",
    "kategorie": "Hörbuch",
    "audio_path": "https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/hoerbucher/Der%20Tag%20an%20dem%20der%20Schmetterling%20erwachte%20Final.mp3",
    "created_at": "2026-08-19T07:16:41+00:00",
    "preis": 4.99,
    "waehrung": "EUR",
    "dauer": 3523,
    "highlights": [
      "Hoerbuch"
    ],
    "audio_hinweis": "Herzenswerk: Von uns selbst geschrieben & mit warmer Stimme von Lisa Ragusa persönlich eingesprochen. Hintergrundmusik mit KI-Unterstützung komponiert.",
    "play_store_id": "fds_schmetterling",
    "hoerprobe_url": null,
    "is_active": true
  }
];

/**
 * Gibt die gecachten Produkte zurück.
 * Falls noch kein Cache im localStorage existiert, wird der gebündelte Katalog geliefert.
 */
export function getOfflineProducts(): ProductData[] {
  if (typeof window === 'undefined') return DEFAULT_PRODUCTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[OfflineProducts] Fehler beim Lesen des Caches:', e);
  }
  return DEFAULT_PRODUCTS;
}

/**
 * Speichert den aktuellen Produktstand im lokalen Cache.
 */
export function saveOfflineProducts(products: ProductData[]): void {
  if (typeof window === 'undefined' || !Array.isArray(products) || products.length === 0) return;
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.warn('[OfflineProducts] Fehler beim Speichern des Caches:', e);
  }
}

/**
 * Sucht ein Produkt offline anhand von ID oder Titelfragment.
 */
export function getOfflineProductById(idOrFragment: string): ProductData | undefined {
  if (!idOrFragment) return undefined;
  const list = getOfflineProducts();
  const lower = idOrFragment.toLowerCase();
  
  // 1. Exakte ID-Suche
  let match = list.find(p => p.id === idOrFragment || (p.play_store_id && p.play_store_id === idOrFragment));
  if (match) return match;

  // 2. Fragment-Suche
  return list.find(p => 
    p.id.toLowerCase().includes(lower) || 
    p.titel.toLowerCase().includes(lower) ||
    lower.includes(p.id.toLowerCase())
  );
}

/**
 * Gibt alle Produkte mit verfügbarer Hörprobe zurück.
 */
export function getOfflineHoerproben(): ProductData[] {
  return getOfflineProducts().filter(p => !!p.hoerprobe_url && p.hoerprobe_url.trim() !== '');
}

/**
 * Holt die gespeicherten Käufe aus dem Cache.
 */
export function getCachedPurchases(): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PURCHASES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Sichert die Käufe im Cache für den Flugmodus.
 */
export function saveCachedPurchases(purchases: any[]): void {
  if (typeof window === 'undefined' || !Array.isArray(purchases)) return;
  try {
    localStorage.setItem(STORAGE_KEY_PURCHASES, JSON.stringify(purchases));
  } catch (e) {
    console.warn('[OfflineProducts] Fehler beim Speichern der Käufe:', e);
  }
}
