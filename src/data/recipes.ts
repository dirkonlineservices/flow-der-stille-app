import { Utensils, Coffee, Leaf, Droplets, Flame } from 'lucide-react';

export interface Recipe {
  id: string;
  title: string;
  desc: string;
  category: string;
  icon_type: string;
  ingredients: string[];
  instructions?: string[];
  premium?: boolean;
}

export const allRecipes: Recipe[] = [
  {
    id: 'golden_milk',
    title: 'Goldene Milch',
    desc: 'Entzündungshemmendes warmes Getränk, perfekt zum Entspannen am Abend.',
    category: 'Getränke',
    icon_type: 'Coffee',
    ingredients: ['Kurkuma', 'Ingwer', 'Schwarzer Pfeffer', 'Mandelmilch', 'Honig']
  },
  {
    id: 'salad',
    title: 'Magnesium-Reicher Salat',
    desc: 'Magnesium ist entscheidend für die Regulierung des Nervensystems.',
    category: 'Mahlzeiten',
    icon_type: 'Leaf',
    ingredients: ['Spinat', 'Kürbiskerne', 'Avocado', 'Quinoa']
  },
  {
    id: 'omega',
    title: 'Omega-3 Bowl',
    desc: 'Gesunde Fette unterstützen die Gehirngesundheit und reduzieren Cortisol.',
    category: 'Mahlzeiten',
    icon_type: 'Utensils',
    ingredients: ['Lachs', 'Walnüsse', 'Chiasamen', 'Brauner Reis']
  },
  {
    id: 'tea',
    title: 'Kamillen- & Lavendeltee',
    desc: 'Klassische beruhigende Kräuter zur Besänftigung des Nervensystems.',
    category: 'Getränke',
    icon_type: 'Coffee',
    ingredients: ['Kamille', 'Lavendel', 'Heißes Wasser']
  },
  {
    id: 'smoothie',
    title: 'Grüner Ruhe-Smoothie',
    desc: 'Vollgepackt mit Magnesium und B-Vitaminen für starke Nerven.',
    category: 'Getränke',
    icon_type: 'Leaf',
    ingredients: ['Spinat', 'Banane', 'Avocado', 'Mandelmus']
  },
  {
    id: 'soup',
    title: 'Darmfreundliche Knochenbrühe',
    desc: 'Reich an Kollagen und Aminosäuren für einen gesunden Darm.',
    category: 'Mahlzeiten',
    icon_type: 'Flame',
    ingredients: ['Knochenbrühe', 'Karotten', 'Sellerie', 'Kräuter']
  },
  {
    id: 'oats',
    title: 'Overnight Oats',
    desc: 'Stetige Energiefreisetzung für eine stabile Stimmung den ganzen Tag.',
    category: 'Mahlzeiten',
    icon_type: 'Utensils',
    ingredients: ['Haferflocken', 'Pflanzenmilch', 'Beeren', 'Leinsamen']
  },
  {
    id: 'water',
    title: 'Zitronen-Gurken-Wasser',
    desc: 'Hydratation ist der Schlüssel für die optimale Nervenfunktion.',
    category: 'Getränke',
    icon_type: 'Droplets',
    ingredients: ['Wasser', 'Zitrone', 'Gurke', 'Minze']
  },
  {
    id: 'matcha',
    title: 'Matcha Latte',
    desc: 'Sanft anregend dank L-Theanin, ohne das Nervensystem zu überreizen.',
    category: 'Getränke',
    icon_type: 'Coffee',
    ingredients: ['Matcha', 'Hafermilch', 'Ahornsirup'],
    premium: true
  },
  {
    id: 'lentils',
    title: 'Linsen-Dal mit Kokosmilch',
    desc: 'Wärmend, erdend und voller B-Vitamine für dein Wohlbefinden.',
    category: 'Mahlzeiten',
    icon_type: 'Flame',
    ingredients: ['Rote Linsen', 'Kokosmilch', 'Garam Masala', 'Koriander'],
    instructions: [
      'Linsen gründlich waschen.',
      'In einem Topf die Linsen zusammen mit der Kokosmilch und etwas Wasser köcheln lassen, bis sie weich sind.',
      'Garam Masala und Gewürze unterrühren.',
      'Mit frischem Koriander servieren.'
    ],
    premium: true
  },
  {
    id: 'berries',
    title: 'Antioxidative Beeren-Bowl',
    desc: 'Kämpft sanft gegen oxidativen Stress in deinen Zellen an.',
    category: 'Snacks',
    icon_type: 'Leaf',
    ingredients: ['Blaubeeren', 'Himbeeren', 'Hanfsamen', 'Griechischer Joghurt'],
    premium: true
  },
  {
    id: 'nuts',
    title: 'Nervennahrung Nussmix',
    desc: 'Schnelle Energiequelle und wichtiger Zink- und Magnesiumlieferant.',
    category: 'Snacks',
    icon_type: 'Utensils',
    ingredients: ['Paranüsse', 'Mandeln', 'Cashews', 'Dunkle Schokolade'],
    premium: true
  }
];

export interface WeeklyTip {
  weekId: number;
  title: string;
  tip: string;
}

export const weeklyTips: WeeklyTip[] = [
  {
    weekId: 0,
    title: "Woche 1: Hydratation als Basis",
    tip: "Achte diese Woche darauf, jeden Morgen direkt nach dem Aufstehen ein großes Glas lauwarmes Wasser zu trinken, bevor du Kaffee oder Tee zu dir nimmst. Dein Nervensystem braucht ausreichend Wasser, um Signale effizient weiterzuleiten."
  },
  {
    weekId: 1,
    title: "Woche 2: Magnesiumreiche Mahlzeiten",
    tip: "Integriere jeden Tag eine Handvoll Nüsse oder eine Portion dunkles Blattgemüse (wie Spinat) in deine Mahlzeiten. Magnesium ist das wichtigste Mineral für die schnelle Entspannung deiner Muskeln und Nerven."
  },
  {
    weekId: 2,
    title: "Woche 3: Omega-3 Fokus",
    tip: "Fisch, Walnüsse oder Leinsamenöl: Omega-3-Fettsäuren dämpfen unterschwellige Entzündungen im Körper, die oft mit Stress und chronischer Erschöpfung einhergehen."
  },
  {
    weekId: 3,
    title: "Woche 4: Achtsam essen",
    tip: "Lass dein Handy beim Essen beiseite liegen. Dein Darm ist wie ein zweites Gehirn und arbeitet am besten, wenn dein Nervensystem sich während des Essens im 'Rest and Digest' (Parasympathikus) Modus befindet."
  },
  {
    weekId: 4,
    title: "Woche 5: Zuckerpause",
    tip: "Starke Blutzuckerschwankungen fühlen sich für deinen Körper wie Stress an und schütten Cortisol aus. Versuche diese Woche, auf zugesetzten Haushaltszucker zu verzichten und achte darauf, wie sich deine Energie ausgleicht."
  },
  {
    weekId: 5,
    title: "Woche 6: Kräuter statt Koffein",
    tip: "Ersetze deine zweite oder dritte Tasse Kaffee am Tag durch einen Kräutertee (z.B. Kamille oder Pfefferminz). Koffein blockiert Rezeptoren, die uns Müdigkeit signalisieren, treibt aber den Cortisolspiegel in die Höhe."
  }
];
