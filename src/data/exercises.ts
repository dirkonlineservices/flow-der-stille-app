export interface PatternStep {
  label: string;
  duration: number;
}

export interface Exercise {
  id: string;
  translationKeyTitle: string;
  translationKeyDesc: string;
  translationKeyOverview?: string; // New field for brief overview
  translationKeyCategory: string;
  duration: string;
  image: string;
  instructionKeys: string[];
  pattern?: PatternStep[]; // Structured pattern with label and duration for timer and display
}

export const exercises: Exercise[] = [
  {
    id: 'guided-breathing',
    translationKeyTitle: 'exercises.card.audio-breath.title',
    translationKeyDesc: 'exercises.card.audio-breath.desc',
    translationKeyOverview: 'exercises.card.audio-breath.overview',
    translationKeyCategory: 'category.breathwork',
    duration: '10 min',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format&fit=crop',
    instructionKeys: []
  },
  {
    id: '478-breathing',
    translationKeyTitle: 'exercises.card.478.title',
    translationKeyDesc: 'exercises.card.478.desc',
    translationKeyOverview: 'exercise.478.overview',
    translationKeyCategory: 'category.breathwork',
    duration: '5 min',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
    instructionKeys: [
      'instruction.478.1',
      'instruction.478.2',
      'instruction.478.3',
      'instruction.478.4',
      'instruction.478.5',
      'instruction.478.6',
      'instruction.478.7'
    ],
    pattern: [
      { label: 'Vorbereitung', duration: 10 },
      { label: 'Inhaliere', duration: 4 },
      { label: 'Halte', duration: 7 },
      { label: 'Exhaliere', duration: 8 },
      { label: 'Entspanne', duration: 4 },
      { label: 'Wiederhole', duration: 4 },
      { label: 'Abschluss', duration: 2 }
    ]
  },
  {
    id: 'box-breathing',
    translationKeyTitle: 'exercises.card.box.title',
    translationKeyDesc: 'exercises.card.box.desc',
    translationKeyOverview: 'exercise.box.overview',
    translationKeyCategory: 'category.breathwork',
    duration: '3 min',
    image: 'https://images.unsplash.com/photo-1549421263-5045437754f9?q=80&w=800&auto=format&fit=crop',
    instructionKeys: [
      'instruction.box.1',
      'instruction.box.2',
      'instruction.box.3',
      'instruction.box.4',
      'instruction.box.5',
      'instruction.box.6'
    ],
    pattern: [
      { label: 'Vorbereitung', duration: 10 },
      { label: 'Inhaliere', duration: 4 },
      { label: 'Halte', duration: 4 },
      { label: 'Exhaliere', duration: 4 },
      { label: 'Halte', duration: 4 },
      { label: 'Wiederhole', duration: 4 }
    ]
  },
  {
    id: 'pmr',
    translationKeyTitle: 'exercises.card.pmr.title',
    translationKeyDesc: 'exercises.card.pmr.desc',
    translationKeyCategory: 'category.somatic',
    duration: '10 min',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop',
    instructionKeys: [
      'instruction.pmr.1',
      'instruction.pmr.2',
      'instruction.pmr.3',
      'instruction.pmr.4',
      'instruction.pmr.5',
      'instruction.pmr.6'
    ]
  },
  {
    id: 'neck-stretches',
    translationKeyTitle: 'exercises.card.neck.title',
    translationKeyDesc: 'exercises.card.neck.desc',
    translationKeyCategory: 'category.movement',
    duration: '2 min',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
    instructionKeys: [
      'instruction.neck.1',
      'instruction.neck.2',
      'instruction.neck.3',
      'instruction.neck.4',
      'instruction.neck.5',
      'instruction.neck.6'
    ]
  }
];
