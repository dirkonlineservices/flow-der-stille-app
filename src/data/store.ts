export interface Product {
  id: string;
  title: string;
  description: string;
  highlights: string[];
  priceNum: number;
  price: string;
  duration: string;
  category: 'meditation' | 'course' | 'masterclass' | 'feature';
}

export const PRODUCTS: Product[] = [
  {
    id: 'premium_chat',
    title: 'Premium Chat',
    description: 'Unbegrenzter Zugang zum KI-Assistenten für individuelle Unterstützung.',
    highlights: ['KI-Support rund um die Uhr', 'Individuelle Entspannungspläne', 'Daten innerhalb der EU gespeichert'],
    priceNum: 4.99,
    price: '4,99 € / Monat',
    duration: 'Monatliches Abo',
    category: 'feature'
  },
  {
    id: 'parasympathikus_kurs',
    title: 'Parasympathikus-Kompaktkurs',
    description: 'Aktivierung des Vagusnervs für sofortige innere Ruhe & Entspannung.',
    highlights: ['Sofort-Techniken gegen Stress', 'Fundiertes Hintergrundwissen', 'Begleitende Audio-Sessions'],
    priceNum: 49.00,
    price: '49,00 €',
    duration: '4 Wochen Kurs',
    category: 'course'
  },
  {
    id: 'darm_hirn_class',
    title: 'Darm-Hirn-Achse Masterclass',
    description: 'Ganzheitliche Wege & Ernährungstipps gegen stressbedingte Verdauungsbeschwerden.',
    highlights: ['Analyse der Darm-Hirn-Verbindung', 'Ernährung für das Nervensystem', 'Praktische Umsetzungspläne'],
    priceNum: 79.00,
    price: '79,00 €',
    duration: '6 Module Video-Content',
    category: 'masterclass'
  },
  {
    id: 'atemschule_deep',
    title: 'Tiefenentspannung & Atemschule',
    description: 'Atemtechniken zur Steigerung der Herzratenvariabilität (HRV) und Stressresistenz.',
    highlights: ['Herz-Kohärenz-Training', 'Verbesserung der Stressresistenz', 'Wissenschaftlich basierte Übungen'],
    priceNum: 35.00,
    price: '35,00 €',
    duration: '12 angeleitete Praxis-Sessions',
    category: 'course'
  },
  {
    id: 'meditation_sleep',
    title: 'Meditation: Tiefer Schlaf',
    description: 'Geführte Meditation für tiefen und erholsamen Schlaf mit sanfter Entspannung.',
    highlights: ['Schnell zur Ruhe finden', 'Gedankenkarussell stoppen', 'Sanfte Entspannung zum Loslassen'],
    priceNum: 9.99,
    price: '9,99 €',
    duration: '30 Minuten Audio',
    category: 'meditation'
  },
  {
    id: 'meditation_focus',
    title: 'Meditation: Klarer Fokus',
    description: 'Energetisierende Kurz-Meditation für neue Konzentration und klaren Verstand.',
    highlights: ['Fokus am Morgen stärken', 'Energetisierender Start', 'Mentale Klarheit gewinnen'],
    priceNum: 9.99,
    price: '9,99 €',
    duration: '15 Minuten Audio',
    category: 'meditation'
  },
  {
    id: 'meditation_anxiety',
    title: 'Meditation: Angst & Sorgen loslassen',
    description: 'Spezielle Anleitung zur Beruhigung von Angstzuständen und rasenden Gedanken.',
    highlights: ['Beruhigung bei Angst', 'Techniken gegen Grübeln', 'Sichere Anker finden'],
    priceNum: 14.99,
    price: '14,99 €',
    duration: '45 Minuten Audio',
    category: 'meditation'
  }
];
