export interface Task {
  id: number;
  title: string;
  description: string;
  tips: string[];
}

export const progressiveTasks: Task[] = [
  {
    id: 0,
    title: "Der bewusste Atem",
    description: "Nimm dir diese Woche Zeit, um deinen Atem zu spüren, ohne ihn zu verändern. Beobachte einfach, wie er ein- und ausströmt.",
    tips: [
      "Setze dich aufrecht hin, entspanne die Schultern.",
      "Beobachte das Heben und Senken deiner Brust.",
      "Wenn Gedanken kommen, lass sie wie Wolken weiterziehen."
    ]
  },
  {
    id: 1,
    title: "Die 5-Sinne-Pause",
    description: "Pausiere am Tag und verbinde dich mit deiner Umgebung. Eine sanfte Erdungsübung, wenn der Kopf zu voll ist.",
    tips: [
      "Zähle 5 Dinge, die du siehst.",
      "Finde 4 Dinge, die du körperlich spürst (z.B. den Stuhl).",
      "Lausche auf 3 Geräusche in deiner Nähe."
    ]
  },
  {
    id: 2,
    title: "Bewusstes Essen",
    description: "Iss mindestens eine Mahlzeit am Tag völlig ohne Ablenkung – kein Smartphone, kein Fernseher, kein Lesen.",
    tips: [
      "Spüre die Textur und Temperatur deiner Nahrung.",
      "Kaue jeden Bissen langsamer als gewohnt.",
      "Richte deine Aufmerksamkeit auf den feinen Geschmack."
    ]
  },
  {
    id: 3,
    title: "Digitaler Sonnenuntergang",
    description: "Lege diese Woche dein Smartphone und alle Bildschirme eine Stunde vor dem Schlafen beiseite.",
    tips: [
      "Lege stattdessen ein Buch auf den Nachttisch.",
      "Schalte das WLAN oder die mobilen Daten aus.",
      "Lass den Tag mit einem warmen Tee ausklingen."
    ]
  },
  {
    id: 4,
    title: "Der innere Körperscan",
    description: "Führe morgens oder abends einen mentalen Scan deines Körpers durch, von den Zehen bis zur Kopfhaut.",
    tips: [
      "Fühle in jeden Bereich deines Körpers hinein.",
      "Bewerte nicht, nimm nur wahr (z.B. 'Druck', 'Wärme').",
      "Löse beim Ausatmen bewusst kleine Verspannungen."
    ]
  },
  {
    id: 5,
    title: "Radikale Akzeptanz",
    description: "Beobachte emotionale Reaktionen auf Stress. Erlaube dem Gefühl, da zu sein, ohne direkt dagegen anzukämpfen.",
    tips: [
      "Sag dir: 'Es ist okay, dass ich mich gerade gestresst fühle.'",
      "Beobachte, wo im Körper du das Gefühl wahrnimmst.",
      "Atme sanft in dieses Gefühl hinein."
    ]
  }
];
