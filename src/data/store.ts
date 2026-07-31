export interface Product {
  id: string;
  title: string;
  description: string;
  highlights: string[];
  priceNum: number;
  price: string;
  duration: string;
  category: 'meditation' | 'self_hypnosis' | 'feature';
}

export const PRODUCTS: Product[] = [
  {
    id: 'premium_chat',
    title: 'Premium Chat & KI-Assistent',
    description: 'Unbegrenzter Zugang zum KI-Assistenten für individuelle Unterstützung und Achtsamkeitspläne.',
    highlights: ['KI-Support rund um die Uhr', 'Individuelle Entspannungspläne', 'Daten innerhalb der EU gespeichert'],
    priceNum: 4.99,
    price: '4,99 € / Monat',
    duration: 'Monatliches Abo',
    category: 'feature'
  },
  {
    id: 'meditation_sleep',
    title: 'Meditation: Tiefer Schlaf',
    description: 'Geführte Meditation für tiefen und erholsamen Schlaf mit sanfter Entspannung.',
    highlights: ['Schnell zur Ruhe finden', 'Gedankenkarussell stoppen', 'Sanfte Entspannung zum Loslassen'],
    priceNum: 4.99,
    price: '4,99 €',
    duration: '30 Minuten Audio',
    category: 'meditation'
  },
  {
    id: 'meditation_focus',
    title: 'Meditation: Klarer Fokus',
    description: 'Energetisierende Kurz-Meditation für neue Konzentration und klaren Verstand.',
    highlights: ['Fokus am Morgen stärken', 'Energetisierender Start', 'Mentale Klarheit gewinnen'],
    priceNum: 4.99,
    price: '4,99 €',
    duration: '15 Minuten Audio',
    category: 'meditation'
  },
  {
    id: 'meditation_anxiety',
    title: 'Meditation: Angst & Sorgen loslassen',
    description: 'Spezielle Anleitung zur Beruhigung von Angstzuständen und rasenden Gedanken.',
    highlights: ['Beruhigung bei Angst', 'Techniken gegen Grübeln', 'Sichere Anker finden'],
    priceNum: 5.99,
    price: '5,99 €',
    duration: '45 Minuten Audio',
    category: 'meditation'
  },
  {
    id: 'selbsthypnose_entspannung',
    title: 'Selbsthypnose: Tiefe Mentale Entspannung',
    description: 'Tiefenwirksame Selbsthypnose zur Auflösung von Alltagsstress und tiefem mentalen Loslassen.',
    highlights: ['Tiefenentspannung des Unterbewusstseins', 'Stress abbauen & Regeneration', 'Positive Glaubenssätze verankern'],
    priceNum: 7.99,
    price: '7,99 €',
    duration: '25 Minuten Audio',
    category: 'self_hypnosis'
  },
  {
    id: 'selbsthypnose_schlaf',
    title: 'Selbsthypnose: Einschlafen & Loslassen',
    description: 'Sanfte Hypnose-Session, die dich sicher und geborgen in den Schlaf gleiten lässt.',
    highlights: ['Gedankenstrom beruhigen', 'Einschlaf-Blockaden lösen', 'Tiefen Erholungsschlaf fördern'],
    priceNum: 7.99,
    price: '7,99 €',
    duration: '35 Minuten Audio',
    category: 'self_hypnosis'
  }
];
