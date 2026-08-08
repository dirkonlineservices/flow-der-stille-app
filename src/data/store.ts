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
    id: 'fds_herzoeffnung_meditation',
    title: 'Herzöffnung Meditation',
    description: 'Eine tiefgehende geführte Meditation zur Öffnung deines Herzens und innerem Frieden.',
    highlights: ['Emotionale Blockaden lösen', 'Herz-Kohärenz stärken', 'Gefühl von Liebe & Dankbarkeit'],
    priceNum: 1.99,
    price: '1,99 €',
    duration: '20 Minuten Audio',
    category: 'meditation'
  },
  {
    id: 'fds_meditation_loslassen',
    title: 'Meditation Loslassen',
    description: 'Geführte Meditation zum Loslassen von Sorgen, Stress und alten Gedankenmustern.',
    highlights: ['Gedankenkarussell stoppen', 'Innere Leichtigkeit finden', 'Tiefenentspannung'],
    priceNum: 1.99,
    price: '1,99 €',
    duration: '25 Minuten Audio',
    category: 'meditation'
  },
  {
    id: 'fds_herzkompass_meditation',
    title: 'Herzkompass Meditation',
    description: 'Verbinde dich mit deiner inneren Führung und finde Klarheit für deine Lebensentscheidungen.',
    highlights: ['Innere Klarheit gewinnen', 'Verbindung zur eigenen Intuition', 'Sanfte Entspannung'],
    priceNum: 1.99,
    price: '1,99 €',
    duration: '20 Minuten Audio',
    category: 'meditation'
  },
  {
    id: 'fds_hypnose_selbstbewusstsein',
    title: 'Mehr Selbstbewusstsein & Inneres Vertrauen',
    description: 'Tiefenwirksame Selbsthypnose zur Stärkung deines Selbstwerts und Selbstvertrauens.',
    highlights: ['Positive Glaubenssätze verankern', 'Innere Stärke aktivieren', 'Selbstzweifel überwinden'],
    priceNum: 1.99,
    price: '1,99 €',
    duration: '30 Minuten Audio',
    category: 'self_hypnosis'
  },
  {
    id: 'fds_hypnose_fokus',
    title: 'Selbsthypnose: Fokus & Absolute Klarheit',
    description: 'Geführte Hypnose-Session zur Steigerung der Konzentration und ultimativen mentalen Schärfe.',
    highlights: ['Fokus & Produktivität steigern', 'Mentale Klarheit gewinnen', 'Ablenkungen ausblenden'],
    priceNum: 1.99,
    price: '1,99 €',
    duration: '25 Minuten Audio',
    category: 'self_hypnosis'
  },
  {
    id: 'fds_hypnose_gesunde_ernaehrung',
    title: 'Gesunde Ernährung & Aktiver Lebensstil',
    description: 'Programmierung deines Unterbewusstseins auf natürliche, gesunde Entscheidungen im Alltag.',
    highlights: ['Gesunde Gewohnheiten etablieren', 'Heißhunger natürlich reduzieren', 'Körpergefühl stärken'],
    priceNum: 1.99,
    price: '1,99 €',
    duration: '35 Minuten Audio',
    category: 'self_hypnosis'
  }
];
