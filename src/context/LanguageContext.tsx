import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'de';

type Translations = {
  [key in Language]: {
    [key: string]: string | string[];
  };
};

const translations: Translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.breathe': 'Breathe',
    'nav.nourish': 'Nourish',
    'nav.learn': 'Learn',
    'nav.settings': 'Settings',

    // Home
    'home.greeting.morning': 'Good Morning',
    'home.greeting.afternoon': 'Good Afternoon',
    'home.greeting.evening': 'Good Evening',
    'home.subtitle': 'Your nervous system is ready to rest and digest.',
    'home.card.morning.title': 'Morning Reset',
    'home.card.morning.desc': 'Start your day with a calm nervous system.',
    'home.card.breathing.title': 'Deep Breathing',
    'home.card.breathing.desc': '4-7-8 breathing to activate the vagus nerve.',
    'home.card.meal.title': 'Nourishing Meal',
    'home.card.meal.desc': 'Recipes to support your gut-brain axis.',
    'home.card.evening.title': 'Evening Wind Down',
    'home.card.evening.desc': 'Prepare for a restorative sleep.',
    'home.wisdom.title': 'Daily Wisdom',
    'home.wisdom.text': '"The nervous system doesn\'t know the difference between a real tiger and a thought tiger. Treat your thoughts with kindness."',

    // Exercises
    'exercises.title': 'Exercises',
    'exercises.subtitle': 'Gentle movements and breathing patterns to signal safety to your body.',
    'exercises.card.478.title': '4-7-8 Breathing',
    'exercises.card.478.desc': 'Inhale for 4, hold for 7, exhale for 8. This pattern directly stimulates the vagus nerve.',
    'exercises.card.box.title': 'Box Breathing',
    'exercises.card.box.desc': 'Inhale 4, hold 4, exhale 4, hold 4. Used by Navy SEALs to stay calm under pressure.',
    'exercises.card.pmr.title': 'Progressive Muscle Relaxation',
    'exercises.card.pmr.desc': 'Tense and release muscle groups to release physical tension.',
    'exercises.card.neck.title': 'Gentle Neck Stretches',
    'exercises.card.neck.desc': 'Release tension in the neck and shoulders where stress often accumulates.',
    'exercises.card.audio-breath.title': 'Guided Breathing Exercise',
    'exercises.card.audio-breath.desc': 'Listen to a guided breathing session to calm your nervous system.',
    'exercises.card.audio-breath.overview': 'Follow along with this guided audio session to help ground yourself and bring your nervous system back into equilibrium.',

    'category.breathwork': 'Breathwork',
    'category.somatic': 'Somatic',
    'category.movement': 'Movement',

    // Recipes
    'recipes.title': 'Nourish',
    'recipes.subtitle': 'Foods that support the gut-brain axis and reduce inflammation.',
    'recipes.card.golden.title': 'Golden Milk Latte',
    'recipes.card.golden.desc': 'Anti-inflammatory warm drink perfect for evening wind-down.',
    'recipes.card.salad.title': 'Magnesium-Rich Salad',
    'recipes.card.salad.desc': 'Magnesium is crucial for nervous system regulation.',
    'recipes.card.omega.title': 'Omega-3 Bowl',
    'recipes.card.omega.desc': 'Healthy fats support brain health and reduce cortisol.',
    'recipes.card.tea.title': 'Chamomile & Lavender Tea',
    'recipes.card.tea.desc': 'Classic calming herbs to soothe the nervous system.',
    'recipes.card.smoothie.title': 'Green Calm Smoothie',
    'recipes.card.smoothie.desc': 'Packed with magnesium and B vitamins.',
    'recipes.card.soup.title': 'Gut-Healing Bone Broth',
    'recipes.card.soup.desc': 'Rich in collagen and amino acids.',
    'recipes.card.oats.title': 'Overnight Oats',
    'recipes.card.oats.desc': 'Steady energy release for stable mood.',
    'recipes.card.water.title': 'Lemon & Cucumber Water',
    'recipes.card.water.desc': 'Hydration is key for nervous system function.',

    'ingredient.smoothie.spinach': 'Spinach',
    'ingredient.smoothie.banana': 'Banana',
    'ingredient.smoothie.avocado': 'Avocado',
    'ingredient.soup.bones': 'Beef Bones',
    'ingredient.soup.carrots': 'Carrots',
    'ingredient.soup.celery': 'Celery',
    'ingredient.oats.oats': 'Rolled Oats',
    'ingredient.oats.milk': 'Oat Milk',
    'ingredient.oats.berries': 'Berries',
    'ingredient.water.lemon': 'Lemon',
    'ingredient.water.cucumber': 'Cucumber',
    'ingredient.water.mint': 'Mint',

    'category.drink': 'Drink',
    'category.meal': 'Meal',
    'ingredient.turmeric': 'Turmeric',
    'ingredient.ginger': 'Ginger',
    'ingredient.pepper': 'Black Pepper',
    'ingredient.almondmilk': 'Almond Milk',
    'ingredient.honey': 'Honey',
    'ingredient.spinach': 'Spinach',
    'ingredient.pumpkinseeds': 'Pumpkin Seeds',
    'ingredient.avocado': 'Avocado',
    'ingredient.quinoa': 'Quinoa',
    'ingredient.salmon': 'Salmon',
    'ingredient.walnuts': 'Walnuts',
    'ingredient.chiaseeds': 'Chia Seeds',
    'ingredient.brownrice': 'Brown Rice',
    'ingredient.chamomile': 'Dried Chamomile',
    'ingredient.lavender': 'Lavender Buds',
    'ingredient.hotwater': 'Hot Water',

    // Learn
    'learn.title': 'The Nervous System',
    'learn.subtitle': 'Understanding the balance between "Fight or Flight" and "Rest and Digest".',
    'learn.sympathetic.title': 'Sympathetic Nervous System',
    'learn.sympathetic.subtitle': 'Fight or Flight',
    'learn.sympathetic.content': 'This system prepares your body for action. It releases adrenaline and cortisol, increases heart rate, and diverts blood to muscles. It\'s essential for survival but harmful when chronically activated by modern stressors.',
    'learn.parasympathetic.title': 'Parasympathetic Nervous System',
    'learn.parasympathetic.subtitle': 'Rest and Digest',
    'learn.parasympathetic.content': 'This is the state we want to cultivate. It promotes relaxation, digestion, and recovery. Activating this system lowers heart rate, reduces inflammation, and signals safety to the brain.',
    'learn.switch.title': 'How to Switch Modes',
    'learn.tip.breathing.title': 'Breathing',
    'learn.tip.breathing.text': 'Long exhales stimulate the vagus nerve, the main controller of the parasympathetic system.',
    'learn.tip.movement.title': 'Movement',
    'learn.tip.movement.text': 'Gentle, rhythmic movement (like walking or swaying) can discharge excess sympathetic energy.',
    'learn.tip.safety.title': 'Safety Signals',
    'learn.tip.safety.text': 'Social connection, soothing sounds, and nature views tell your amygdala that you are safe.',

    // Settings
    'settings.title': 'Routine & Settings',
    'settings.subtitle': 'Create a secure environment through consistency.',
    'settings.sleep.title': 'Sleep Schedule',
    'settings.sleep.bedtime': 'Bedtime',
    'settings.sleep.wakeup': 'Wake Up',
    'settings.sleep.desc': 'Consistent sleep times regulate your circadian rhythm and lower cortisol.',
    'settings.notifications.title': 'Notifications',
    'settings.notifications.daily': 'Daily Reminders',
    'settings.notifications.breathing': 'Breathing Prompts',
    'settings.notifications.winddown': 'Bedtime Wind Down',
    'settings.environment.title': 'Environment',
    'settings.environment.darkmode': 'Dark Mode',
    'settings.environment.nature': 'Nature Sounds',

    // Weekly Challenge
    'challenge.title': 'Weekly Challenge',
    'challenge.complete': 'Mark as Complete',
    'challenge.completed': 'Completed',
    'challenge.login': 'Log in to track your progress.',

    // Chat
    'chat.title': 'Ask the Expert',
    'chat.subtitle': 'Get factual answers about your nervous system.',
    'chat.placeholder': 'Ask a question...',
    'chat.send': 'Send',
    'chat.disclaimer': 'Answers are based on scientific facts. Consult a doctor for medical advice.',

    // Tasks
    'task.week1': 'Practice 4-7-8 breathing for 5 minutes every day this week.',
    'task.week2': 'Take a 15-minute walk in nature without your phone.',
    'task.week3': 'Write down 3 things you are grateful for each evening.',

    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.username': 'Username',
    'auth.password': 'Password',
    'auth.submit': 'Submit',
    'auth.logout': 'Logout',
    'auth.account': 'Account',
    // Music Player
    'music.title': 'Relaxing Music',
    'music.credit': 'Music from Raindancer music',

    // Exercise Detail
    'exercise.back': 'Back to Exercises',
    'exercise.instructions': 'Instructions',
    'exercise.ready': 'Ready to start?',
    'exercise.begin': 'Find a quiet space and begin.',
    'exercise.view': 'View Instructions',
    'exercise.notfound': 'Exercise not found',
    'exercise.478.overview': 'Focus on the gentle rhythm of your breath. This technique is designed to initiate a calming response in your nervous system by balancing your inhalation and exhalation.',
    'exercise.box.overview': 'Clear your mind and prepare to focus solely on your breath. Follow the structured pattern to ground yourself and bring your nervous system back into equilibrium.',

    // Exercise Instructions (Keys)
    'instruction.478.1': 'Sit comfortably with your back straight.',
    'instruction.478.2': 'Place the tip of your tongue against the ridge of tissue just behind your upper front teeth.',
    'instruction.478.3': 'Exhale completely through your mouth, making a whoosh sound.',
    'instruction.478.4': 'Close your mouth and inhale quietly through your nose to a mental count of 4.',
    'instruction.478.5': 'Hold your breath for a count of 7.',
    'instruction.478.6': 'Exhale completely through your mouth, making a whoosh sound to a count of 8.',
    'instruction.478.7': 'This is one breath. Now inhale again and repeat the cycle three more times for a total of four breaths.',

    'instruction.box.1': 'Sit upright in a comfortable chair.',
    'instruction.box.2': 'Inhale slowly through your nose for a count of 4.',
    'instruction.box.3': 'Hold your breath for a count of 4.',
    'instruction.box.4': 'Exhale slowly through your mouth for a count of 4.',
    'instruction.box.5': 'Hold your breath for a count of 4 before inhaling again.',
    'instruction.box.6': 'Repeat this cycle for at least 3 minutes.',

    'instruction.pmr.1': 'Lie down on your back in a comfortable position.',
    'instruction.pmr.2': 'Start with your feet. Tense the muscles in your toes and feet tightly for 5 seconds.',
    'instruction.pmr.3': 'Release the tension suddenly and feel the relaxation for 10 seconds.',
    'instruction.pmr.4': 'Move up to your calves, tense for 5 seconds, then release.',
    'instruction.pmr.5': 'Continue this pattern up through your thighs, hips, stomach, chest, hands, arms, shoulders, neck, and face.',
    'instruction.pmr.6': 'Finish by tensing your whole body at once, then releasing everything into deep relaxation.',

    'instruction.neck.1': 'Sit or stand with a straight spine.',
    'instruction.neck.2': 'Slowly drop your right ear towards your right shoulder. Hold for 5 breaths.',
    'instruction.neck.3': 'Return to center, then drop your left ear to your left shoulder. Hold for 5 breaths.',
    'instruction.neck.4': 'Return to center. Turn your head to look over your right shoulder. Hold.',
    'instruction.neck.5': 'Turn your head to look over your left shoulder. Hold.',
    'instruction.neck.6': 'Gently drop your chin to your chest to stretch the back of your neck.',
  },
  de: {
    // Navigation
    'nav.home': 'Start',
    'nav.breathe': 'Atmen',
    'nav.nourish': 'Ernährung',
    'nav.learn': 'Lernen',
    'nav.settings': 'Einstellungen',

    // Home
    'home.greeting.morning': 'Guten Morgen',
    'home.greeting.afternoon': 'Guten Tag',
    'home.greeting.evening': 'Guten Abend',
    'home.subtitle': 'Dein Nervensystem ist bereit für Ruhe und Erholung.',
    'home.card.morning.title': 'Morgen-Reset',
    'home.card.morning.desc': 'Starte den Tag mit einem entspannten Nervensystem.',
    'home.card.breathing.title': 'Tiefenatmung',
    'home.card.breathing.desc': '4-7-8 Atmung zur Aktivierung des Vagusnervs.',
    'home.card.meal.title': 'Nahrhafte Mahlzeit',
    'home.card.meal.desc': 'Rezepte zur Unterstützung der Darm-Hirn-Achse.',
    'home.card.evening.title': 'Abend-Entspannung',
    'home.card.evening.desc': 'Bereite dich auf einen erholsamen Schlaf vor.',
    'home.wisdom.title': 'Tägliche Weisheit',
    'home.wisdom.text': '"Das Nervensystem kennt keinen Unterschied zwischen einem echten Tiger und einem Gedanken-Tiger. Behandle deine Gedanken mit Freundlichkeit."',

    // Exercises
    'exercises.title': 'Übungen',
    'exercises.subtitle': 'Sanfte Bewegungen und Atemmuster, um deinem Körper Sicherheit zu signalisieren.',
    'exercises.card.478.title': '4-7-8 Atmung',
    'exercises.card.478.desc': '4 Einatmen, 7 Halten, 8 Ausatmen. Dieses Muster stimuliert direkt den Vagusnerv.',
    'exercises.card.box.title': 'Box-Atmung',
    'exercises.card.box.desc': '4 Ein, 4 Halten, 4 Aus, 4 Halten. Wird von Navy SEALs genutzt, um unter Druck ruhig zu bleiben.',
    'exercises.card.pmr.title': 'Progressive Muskelentspannung',
    'exercises.card.pmr.desc': 'Muskelgruppen anspannen und loslassen, um körperliche Anspannung zu lösen.',
    'exercises.card.neck.title': 'Sanfte Nackendehnungen',
    'exercises.card.neck.desc': 'Löse Spannungen in Nacken und Schultern, wo sich Stress oft ansammelt.',
    'exercises.card.audio-breath.title': 'Geführte Atemübung',
    'exercises.card.audio-breath.desc': 'Höre eine geführte Atemübung zur Beruhigung deines Nervensystems.',
    'exercises.card.audio-breath.overview': 'Folge dieser geführten Audio-Sitzung, um dich zu erden und dein Nervensystem wieder ins Gleichgewicht zu bringen.',
    'category.breathwork': 'Atemarbeit',
    'category.somatic': 'Somatisch',
    'category.movement': 'Bewegung',

    // Recipes
    'recipes.title': 'Ernährung',
    'recipes.subtitle': 'Lebensmittel, die die Darm-Hirn-Achse unterstützen und Entzündungen reduzieren.',
    'recipes.card.golden.title': 'Goldene Milch',
    'recipes.card.golden.desc': 'Entzündungshemmendes warmes Getränk, perfekt zum Entspannen am Abend.',
    'recipes.card.salad.title': 'Magnesium-Reicher Salat',
    'recipes.card.salad.desc': 'Magnesium ist entscheidend für die Regulierung des Nervensystems.',
    'recipes.card.omega.title': 'Omega-3 Bowl',
    'recipes.card.omega.desc': 'Gesunde Fette unterstützen die Gehirngesundheit und reduzieren Cortisol.',
    'recipes.card.tea.title': 'Kamillen- & Lavendeltee',
    'recipes.card.tea.desc': 'Klassische beruhigende Kräuter zur Besänftigung des Nervensystems.',
    'recipes.card.smoothie.title': 'Grüner Ruhe-Smoothie',
    'recipes.card.smoothie.desc': 'Vollgepackt mit Magnesium und B-Vitaminen.',
    'recipes.card.soup.title': 'Darmfreundliche Knochenbrühe',
    'recipes.card.soup.desc': 'Reich an Kollagen und Aminosäuren.',
    'recipes.card.oats.title': 'Overnight Oats',
    'recipes.card.oats.desc': 'Stetige Energiefreisetzung für stabile Stimmung.',
    'recipes.card.water.title': 'Zitronen-Gurken-Wasser',
    'recipes.card.water.desc': 'Hydratation ist der Schlüssel für die Nervenfunktion.',

    'ingredient.smoothie.spinach': 'Spinat',
    'ingredient.smoothie.banana': 'Banane',
    'ingredient.smoothie.avocado': 'Avocado',
    'ingredient.soup.bones': 'Rinderknochen',
    'ingredient.soup.carrots': 'Karotten',
    'ingredient.soup.celery': 'Sellerie',
    'ingredient.oats.oats': 'Haferflocken',
    'ingredient.oats.milk': 'Hafermilch',
    'ingredient.oats.berries': 'Beeren',
    'ingredient.water.lemon': 'Zitrone',
    'ingredient.water.cucumber': 'Gurke',
    'ingredient.water.mint': 'Minze',

    'category.drink': 'Getränk',
    'category.meal': 'Mahlzeit',
    'ingredient.turmeric': 'Kurkuma',
    'ingredient.ginger': 'Ingwer',
    'ingredient.pepper': 'Schwarzer Pfeffer',
    'ingredient.almondmilk': 'Mandelmilch',
    'ingredient.honey': 'Honig',
    'ingredient.spinach': 'Spinat',
    'ingredient.pumpkinseeds': 'Kürbiskerne',
    'ingredient.avocado': 'Avocado',
    'ingredient.quinoa': 'Quinoa',
    'ingredient.salmon': 'Lachs',
    'ingredient.walnuts': 'Walnüsse',
    'ingredient.chiaseeds': 'Chiasamen',
    'ingredient.brownrice': 'Naturreis',
    'ingredient.chamomile': 'Getrocknete Kamille',
    'ingredient.lavender': 'Lavendelblüten',
    'ingredient.hotwater': 'Heißes Wasser',

    // Learn
    'learn.title': 'Das Nervensystem',
    'learn.subtitle': 'Das Gleichgewicht zwischen "Kampf oder Flucht" und "Ruhen und Verdauen" verstehen.',
    'learn.sympathetic.title': 'Sympathisches Nervensystem',
    'learn.sympathetic.subtitle': 'Kampf oder Flucht',
    'learn.sympathetic.content': 'Dieses System bereitet deinen Körper auf Aktion vor. Es schüttet Adrenalin und Cortisol aus, erhöht die Herzfrequenz und leitet Blut in die Muskeln. Es ist überlebenswichtig, aber schädlich, wenn es durch moderne Stressoren chronisch aktiviert ist.',
    'learn.parasympathetic.title': 'Parasympathisches Nervensystem',
    'learn.parasympathetic.subtitle': 'Ruhen und Verdauen',
    'learn.parasympathetic.content': 'Diesen Zustand wollen wir kultivieren. Er fördert Entspannung, Verdauung und Erholung. Die Aktivierung dieses Systems senkt die Herzfrequenz, reduziert Entzündungen und signalisiert dem Gehirn Sicherheit.',
    'learn.switch.title': 'Wie man umschaltet',
    'learn.tip.breathing.title': 'Atmen',
    'learn.tip.breathing.text': 'Langes Ausatmen stimuliert den Vagusnerv, den Hauptsteuerer des parasympathischen Systems.',
    'learn.tip.movement.title': 'Bewegung',
    'learn.tip.movement.text': 'Sanfte, rhythmische Bewegung (wie Gehen oder Schaukeln) kann überschüssige sympathische Energie abbauen.',
    'learn.tip.safety.title': 'Sicherheitssignale',
    'learn.tip.safety.text': 'Soziale Verbindung, beruhigende Klänge und Naturansichten sagen deiner Amygdala, dass du sicher bist.',

    // Settings
    'settings.title': 'Routine & Einstellungen',
    'settings.subtitle': 'Schaffe Sicherheit durch Beständigkeit.',
    'settings.sleep.title': 'Schlafplan',
    'settings.sleep.bedtime': 'Schlafenszeit',
    'settings.sleep.wakeup': 'Aufwachen',
    'settings.sleep.desc': 'Konsistente Schlafzeiten regulieren deinen zirkadianen Rhythmus und senken Cortisol.',
    'settings.notifications.title': 'Benachrichtigungen',
    'settings.notifications.daily': 'Tägliche Erinnerungen',
    'settings.notifications.breathing': 'Atem-Impulse',
    'settings.notifications.winddown': 'Abend-Entspannung',
    'settings.environment.title': 'Umgebung',
    'settings.environment.darkmode': 'Dunkelmodus',
    'settings.environment.nature': 'Naturklänge',

    // Weekly Challenge
    'challenge.title': 'Wochenaufgabe',
    'challenge.complete': 'Als erledigt markieren',
    'challenge.completed': 'Erledigt',
    'challenge.login': 'Melde dich an, um deinen Fortschritt zu speichern.',

    // Chat
    'chat.title': 'Frag den Experten',
    'chat.subtitle': 'Erhalte faktenbasierte Antworten über dein Nervensystem.',
    'chat.placeholder': 'Stelle eine Frage...',
    'chat.send': 'Senden',
    'chat.disclaimer': 'Antworten basieren auf wissenschaftlichen Fakten. Konsultiere bei medizinischen Fragen einen Arzt.',

    // Tasks
    'task.week1': 'Übe diese Woche jeden Tag 5 Minuten lang die 4-7-8-Atmung.',
    'task.week2': 'Mache einen 15-minütigen Spaziergang in der Natur ohne dein Handy.',
    'task.week3': 'Schreibe jeden Abend 3 Dinge auf, für die du dankbar bist.',

    // Auth
    'auth.login': 'Anmelden',
    'auth.register': 'Registrieren',
    'auth.username': 'Benutzername',
    'auth.password': 'Passwort',
    'auth.submit': 'Absenden',
    'auth.logout': 'Abmelden',
    'auth.account': 'Konto',
    // Music Player
    'music.title': 'Entspannungsmusik',
    'music.credit': 'Musik von Raindancer music',

    // Exercise Detail
    'exercise.back': 'Zurück zu den Übungen',
    'exercise.instructions': 'Anleitung',
    'exercise.ready': 'Bereit anzufangen?',
    'exercise.begin': 'Finde einen ruhigen Ort und beginne.',
    'exercise.view': 'Anleitung ansehen',
    'exercise.notfound': 'Übung nicht gefunden',
    'exercise.478.overview': 'Konzentriere dich auf den sanften Rhythmus deines Atems. Diese Technik soll eine beruhigende Reaktion in deinem Nervensystem auslösen, indem sie Ein- und Ausatmung ausbalanciert.',
    'exercise.box.overview': 'Mache deinen Kopf frei und bereite dich darauf vor, dich ausschließlich auf deinen Atem zu konzentrieren. Folge dem strukturierten Muster, um dich zu erden und dein Nervensystem wieder ins Gleichgewicht zu bringen.',

    // Exercise Instructions (Keys)
    'instruction.478.1': 'Finde einen ruhigen Ort, an dem du ungestört sitzen oder liegen kannst. Schließe sanft deine Augen und atme tief durch.',
    'instruction.478.2': 'Beginne mit dem Einatmen durch die Nase für 4 Zählzeiten.',
    'instruction.478.3': 'Halte deinen Atem nun für 7 Sekunden lang sanft an.',
    'instruction.478.4': 'Atme jetzt langsam und vollständig durch den Mund aus, für 8 Zählzeiten.',
    'instruction.478.5': 'Spüre, wie dein Körper beim Ausatmen tiefer in die Entspannung sinkt.',
    'instruction.478.6': 'Wiederhole diesen Zyklus für weitere Atemzüge und fokussiere dich auf die Ruhe.',
    'instruction.478.7': 'Kehre nach Abschluss der Übung langsam wieder in deinen Alltag zurück.',

    'instruction.box.1': 'Setze dich aufrecht hin, finde eine bequeme Haltung und schließe sanft die Augen.',
    'instruction.box.2': 'Atme langsam durch die Nase ein und zähle dabei bis 4.',
    'instruction.box.3': 'Halte deinen Atem für 4 Sekunden lang an.',
    'instruction.box.4': 'Atme langsam durch den Mund aus und zähle mental bis 4.',
    'instruction.box.5': 'Halte den Atem wieder für 4 Sekunden an, bevor du erneut einatmest.',
    'instruction.box.6': 'Wiederhole diesen beruhigenden Zyklus für mindestens 3 Minuten.',

    'instruction.pmr.1': 'Lege dich in einer bequemen Position auf den Rücken.',
    'instruction.pmr.2': 'Beginne mit den Füßen. Spanne die Muskeln in Zehen und Füßen 5 Sekunden lang fest an.',
    'instruction.pmr.3': 'Lasse die Spannung plötzlich los und spüre die Entspannung für 10 Sekunden.',
    'instruction.pmr.4': 'Gehe zu den Waden über, spanne 5 Sekunden an und lasse dann los.',
    'instruction.pmr.5': 'Setze dieses Muster fort durch Oberschenkel, Hüften, Bauch, Brust, Hände, Arme, Schultern, Nacken und Gesicht.',
    'instruction.pmr.6': 'Beende die Übung, indem du den ganzen Körper auf einmal anspannst und dann alles in tiefe Entspannung loslässt.',
    
    'instruction.neck.1': 'Sitze oder stehe mit gerader Wirbelsäule.',
    'instruction.neck.2': 'Neige langsam dein rechtes Ohr zur rechten Schulter. Halte für 5 Atemzüge.',
    'instruction.neck.3': 'Komme zur Mitte zurück und neige dann dein linkes Ohr zur linken Schulter. Halte für 5 Atemzüge.',
    'instruction.neck.4': 'Komme zur Mitte zurück. Drehe den Kopf und schaue über deine rechte Schulter. Halte.',
    'instruction.neck.5': 'Drehe den Kopf und schaue über deine linke Schulter. Halte.',
    'instruction.neck.6': 'Senke sanft dein Kinn zur Brust, um den Nacken zu dehnen.',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('de'); // Default to German as requested

  const t = (key: string): string => {
    const text = translations[language][key];
    if (Array.isArray(text)) return text.join(', ');
    return text || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
