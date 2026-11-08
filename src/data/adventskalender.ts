export type AdventCategory = 'meditation' | 'altes_wissen' | 'achtsamkeit' | 'gewinnspiel';

export interface AdventDay {
  day: number;
  dateLabel: string;
  part: 1 | 2;
  category: AdventCategory;
  categoryLabel: string;
  emoji: string;
  title: string;
  coreImpulse: string;
  deepText: string;
  practiceOrQuestion: string;
  practiceTitle: string;
  durationOrInfo: string;
}

export const ADVENT_PILLARS = [
  {
    count: '5 ×',
    title: 'MEDITATIONEN',
    category: 'meditation' as AdventCategory,
    emoji: '🧘',
    description: 'Je ca. 10 Min. an den Sonntagen & Heiligabend zur tiefen Entlastung.'
  },
  {
    count: '3 ×',
    title: 'GEWINNSPIELE',
    category: 'gewinnspiel' as AdventCategory,
    emoji: '🎁',
    description: 'Rauhnacht-Hörbuch Verlosungen zu Nikolaus, Halbzeit & Sonnenwende.'
  },
  {
    count: '8 ×',
    title: 'ALTES WISSEN',
    category: 'altes_wissen' as AdventCategory,
    emoji: '📜',
    description: 'Mythen, Wintersonnenwende, Julzeit & die Zyklen der Natur.'
  },
  {
    count: '8 ×',
    title: 'ACHTSAMKEIT',
    category: 'achtsamkeit' as AdventCategory,
    emoji: '🌿',
    description: 'Praktische Mini-Rituale, Atemimpulse & somatische Erdung.'
  }
];

export const ADVENT_DAYS: AdventDay[] = [
  // ─── TEIL 1: TAGE 1 BIS 12 (VERLANGSAMUNG & LOSLASSEN) ────────────────────
  {
    day: 1,
    dateLabel: '01. Dez',
    part: 1,
    category: 'meditation',
    categoryLabel: 'Meditation 1',
    emoji: '🧘',
    title: 'Ankommen im Raum der Stille',
    coreImpulse: 'Das Außen leiser drehen, Raum öffnen, Herzschlag spüren.',
    deepText:
      'Der erste Dezembertag lädt dich ein, bewusst eine Schwelle zu überschreiten. Während im Außen oft die Hektik der Vorweihnachtszeit beginnt, öffnest du heute deinen ganz persönlichen Raum der Stille. Du musst nichts leisten und nirgendwo anders sein als genau hier.',
    practiceTitle: 'Geführter 10-Minuten-Impuls',
    practiceOrQuestion:
      'Lege eine Hand sanft auf dein Brustbein. Atme vier Sekunden lang ruhig durch die Nase ein und sechs Sekunden lang durch den leicht geöffneten Mund aus. Spüre unter deiner Handfläche den ruhigen Schlag deines Herzens und sage dir innerlich: „Ich drehe das Außen leiser. Ich bin hier.“',
    durationOrInfo: 'Ca. 10 Min. • Geführte Meditation zum Ankommen'
  },
  {
    day: 2,
    dateLabel: '02. Dez',
    part: 1,
    category: 'altes_wissen',
    categoryLabel: 'Altes Wissen',
    emoji: '📜',
    title: 'Die Weisheit der Wurzeln',
    coreImpulse: 'Wie Bäume im Frost Kraft bündeln; Rückzug ehren.',
    deepText:
      'Im Winter wirken die Laubbäume kahl und leblos – doch der Schein trügt. In Wahrheit haben sie ihre Säfte und ihre gesamte Lebenskraft tief in das Wurzelwerk unter der frostigen Erde zurückgezogen. Die Natur lehrt uns: Niemand kann das ganze Jahr über blühen und Früchte tragen. Rückzug ist kein Stillstand, sondern tiefe Regeneration.',
    practiceTitle: 'Reflexion aus dem alten Naturwissen',
    practiceOrQuestion:
      'Wo im Alltag versuchst du gerade noch „grüne Blätter“ aufrechtzuerhalten, obwohl deine Energie sich eigentlich nach Rückzug sehnt? Erlaube dir heute bewusst, einen Termin oder Anspruch innerlich abzusenken.',
    durationOrInfo: 'Naturzyklus & Wurzelkraft'
  },
  {
    day: 3,
    dateLabel: '03. Dez',
    part: 1,
    category: 'achtsamkeit',
    categoryLabel: 'Achtsamkeit',
    emoji: '🌿',
    title: 'Der Atem des Winters',
    coreImpulse: 'Kältereiz an der Nase und innere Herzwärme spüren.',
    deepText:
      'Die klare Winterluft ist ein wunderbarer Anker für das vegetative Nervensystem. Der Kontrast zwischen der kühlen Luft beim Einatmen und der körperwarmen Luft beim Ausatmen holt deinen Geist augenblicklich aus dem Gedankenkarussell zurück in den Körper.',
    practiceTitle: 'Somatisches Mini-Ritual (2 Minuten)',
    practiceOrQuestion:
      'Öffne ein Fenster oder tritt kurz ins Freie. Nimm fünf tiefe Atemzüge. Spüre beim Einatmen ganz präzise das kühle Prickeln an den Nasenflügeln – und verfolge beim Ausatmen, wie sich wohlige Wärme in deinem Brustkorb ausbreitet.',
    durationOrInfo: '2 Min. • Atemimpuls & Vagusnerv-Regulation'
  },
  {
    day: 4,
    dateLabel: '04. Dez',
    part: 1,
    category: 'altes_wissen',
    categoryLabel: 'Altes Wissen',
    emoji: '📜',
    title: 'Barbarazweige: Verborgene Knospen',
    coreImpulse: 'Der Kälteimpuls als Voraussetzung für das spätere Aufblühen.',
    deepText:
      'Nach altem Brauch werden am 4. Dezember Zweige von Kirsch- oder Obstbäumen geschnitten und ins warme Wasser gestellt, damit sie exakt zur Heiligen Nacht erblühen. Das Geheimnis dahinter: Die Knospen sind längst angelegt, doch sie benötigen zuvor zwingend den ersten Frostimpuls (Vernalisation), um überhaupt aus ihrer Winterruhe erwachen zu können.',
    practiceTitle: 'Impuls für deinen Dezember',
    practiceOrQuestion:
      'Manchmal braucht auch unsere Seele eine Phase der kühlen Stille und des Nicht-Wissens, bevor ein neuer Lebenswunsch aufblühen kann. Welche verborgene Knospe trägst du bereits still in dir?',
    durationOrInfo: 'Brauchtum am Barbaratag (04. Dezember)'
  },
  {
    day: 5,
    dateLabel: '05. Dez',
    part: 1,
    category: 'achtsamkeit',
    categoryLabel: 'Achtsamkeit',
    emoji: '🌿',
    title: 'Raum für Loslassen',
    coreImpulse: 'Ballast aufschreiben & verbrennen; leere Schale werden.',
    deepText:
      'Bevor Neues in unser Leben treten kann, braucht es Raum. Unser Unterbewusstsein liebt sichtbare, greifbare Symbole: Wenn wir eine Sorge auf Papier bannen und dem Element Feuer oder der Natur übergeben, versteht das Nervensystem, dass die Last nicht länger festgehalten werden muss.',
    practiceTitle: 'Kleines Loslass-Ritual am Abend',
    practiceOrQuestion:
      'Nimm dir einen kleinen Zettel. Schreibe einen Gedanken, eine Sorge oder eine alte Pflicht auf, die du nicht mit in die Rauhnächte nehmen möchtest. Übergib den Zettel achtsam einer feuerfesten Schale (oder zerreiße ihn bewusst in kleinste Stücke) und atme tief durch.',
    durationOrInfo: '5 Min. • Befreiendes Abendritual'
  },
  {
    day: 6,
    dateLabel: '06. Dez',
    part: 1,
    category: 'gewinnspiel',
    categoryLabel: 'Gewinnspiel 1',
    emoji: '🎁',
    title: 'Nikolaus-Gabe: Hörbuch-Verlosung',
    coreImpulse: 'Community-Frage: Welche Qualität wünschst du dir?',
    deepText:
      'Zum Nikolaustag öffnen wir die erste große Verlosung unseres Adventskalenders! Wir verlosen das ganzheitliche Hörbuch & den Meditationszyklus „Yggdrasils Atem – 12 Rauhnächte auf der Schwelle“ (13 geführte schamanische Seelenreisen, gesprochen von Lisa Ragusa), damit du es rechtzeitig vor dem 21./24. Dezember in deiner Mediathek genießen kannst. Die Auslosung findet am Tag danach (07. Dezember) statt – jede(r) bis dahin Angemeldete nimmt teil!',
    practiceTitle: 'Deine Gewinnspiel-Frage zum 06. Dezember',
    practiceOrQuestion:
      'Welche innere Qualität (z. B. Urvertrauen, Sanftmut, Klarheit, Mut oder Stille) wünschst du dir für die kommenden Wochen am allermeisten?',
    durationOrInfo: '1. Verlosung • Auslosung am 07. Dez • Wert 9,99 €'
  },
  {
    day: 7,
    dateLabel: '07. Dez',
    part: 1,
    category: 'meditation',
    categoryLabel: 'Meditation 2',
    emoji: '🧘',
    title: '2. Advent: Flamme der Geborgenheit',
    coreImpulse: 'Das innere goldene Licht fächeln; tiefe Sicherheit im Körper.',
    deepText:
      'Am zweiten Adventswochenende wenden wir uns dem Gefühl tiefer innerer Geborgenheit zu. Egal wie stürmisch oder dunkel die Tage im Dezember sein mögen: In deiner Körpermitte brennt ein ruhiges, warmes Licht, das von äußeren Umständen unberührt bleibt.',
    practiceTitle: 'Geführte Licht-Meditation (ca. 10 Min.)',
    practiceOrQuestion:
      'Schließe die Augen und stelle dir im Bereich deines Solarplexus eine sanfte, goldene Kerzenflamme vor. Mit jedem ruhigen Atemzug wird dieses Leuchten wärmer und hüllt deinen gesamten Brust- und Bauchraum in einen schützenden goldenen Mantel.',
    durationOrInfo: 'Ca. 10 Min. • Geführte Meditation zum 2. Advent'
  },
  {
    day: 8,
    dateLabel: '08. Dez',
    part: 1,
    category: 'altes_wissen',
    categoryLabel: 'Altes Wissen',
    emoji: '📜',
    title: 'Frau Holle & das Spinnrad der Zeit',
    coreImpulse: 'Die Erdmutter, der schützende Schnee & das Ruhen des Rades.',
    deepText:
      'Hinter der bekannten Märchenfigur der Frau Holle verbirgt sich die uralte mitteleuropäische Erdgöttin Holda / Perchta. Wenn sie ihre Betten ausschüttelt, legt sich der Schnee wie eine wärmende, schützende Decke über die schlafende Saat. In den alten Überlieferungen mahnt sie, im tiefen Winter das „Spinnrad der Arbeit“ ruhen zu lassen.',
    practiceTitle: 'Altes Wissen für die heutige Zeit',
    practiceOrQuestion:
      'Wo dreht sich dein inneres „Spinnrad“ der ständigen Produktivität noch auf Hochtouren? Schenke dir heute Abend eine Stunde, in der absolut nichts erledigt oder optimiert werden muss.',
    durationOrInfo: 'Mythologie der Erdmutter & Winterruhe'
  },
  {
    day: 9,
    dateLabel: '09. Dez',
    part: 1,
    category: 'achtsamkeit',
    categoryLabel: 'Achtsamkeit',
    emoji: '🌿',
    title: 'Sinnesreise: Ein Tee in Stille',
    coreImpulse: 'Wärme, Duft und drei achtsame Schlucke ohne Ablenkung.',
    deepText:
      'Wie oft trinken wir unseren Tee oder Kaffee nebenbei vor dem Bildschirm oder mit dem Smartphone in der Hand? Wenn wir unsere Sinne – Tastsinn, Geruchssinn und Geschmack – für nur drei Minuten vollständig bündeln, schaltet das Gehirn vom Alarm- in den Gegenwartsmodus.',
    practiceTitle: 'Das 3-Schlucke-Ritual',
    practiceOrQuestion:
      'Bereite dir heute eine Tasse warmen Kräutertee zu. Lege das Smartphone in ein anderes Zimmer. Umschließe die warme Tasse mit beiden Händen, nimm den aufsteigenden Duft tief wahr und trinke die ersten drei Schlucke in vollkommener Stille.',
    durationOrInfo: '3 Min. • Sensorische Achtsamkeit'
  },
  {
    day: 10,
    dateLabel: '10. Dez',
    part: 1,
    category: 'altes_wissen',
    categoryLabel: 'Altes Wissen',
    emoji: '📜',
    title: 'Die Lehrmeisterin der Kälte',
    coreImpulse: 'Klarheit, Kristallisation & das Wesentliche erkennen.',
    deepText:
      'In der Naturphilosophie des Nordens gilt die Kälte nicht als Feind, sondern als weise Lehrmeisterin. Kälte formt aus formlosem Wasser kunstvolle, symmetrische Eiskristalle. Sie klärt die Luft, lässt den Nebel sinken und legt die klare Struktur der Landschaft frei.',
    practiceTitle: 'Kristallklare Ausrichtung',
    practiceOrQuestion:
      'Wenn du heute auf dein Jahr zurückblickst: Was ist wirklich wesentlich für dein Herz – und was war nur schmückendes Beiwerk, das im klaren Winterlicht verblasst?',
    durationOrInfo: 'Naturphilosophie & geistige Klarheit'
  },
  {
    day: 11,
    dateLabel: '11. Dez',
    part: 1,
    category: 'achtsamkeit',
    categoryLabel: 'Achtsamkeit',
    emoji: '🌿',
    title: 'Erdung im Schritt',
    coreImpulse: 'Gehmeditation: 50 Schritte bewusst von der Erde tragen lassen.',
    deepText:
      'Wenn wir viel grübeln, staut sich unsere Aufmerksamkeit im Kopf. Unsere Füße berühren zwar den Boden, doch wir spüren ihn kaum. Eine kurze Gehmeditation leitet überschüssige mentale Spannung direkt über die Fußsohlen nach unten ab.',
    practiceTitle: 'Somatische 50-Schritte-Übung',
    practiceOrQuestion:
      'Gehe heute – drinnen auf Socken oder draußen beim Spaziergang – genau 50 Schritte in halber Geschwindigkeit. Spüre jedes Abrollen von der Ferse bis zu den Zehenspitzen und nimm wahr, wie verlässlich dich die Erde bei jedem Schritt trägt.',
    durationOrInfo: '3 Min. • Somatische Erdung & Körpergefühl'
  },
  {
    day: 12,
    dateLabel: '12. Dez',
    part: 1,
    category: 'altes_wissen',
    categoryLabel: 'Altes Wissen',
    emoji: '📜',
    title: 'Luzia: Licht in dunkelster Nacht',
    coreImpulse: 'Das Entzünden einer Kerze, wo Schatten am längsten sind.',
    deepText:
      'Vor der gregorianischen Kalenderreform fiel die Wintersonnenwende auf den 13. Dezember – das Fest der Lichtträgerin Luzia (von lat. „lux“ = Licht). Zum Abschluss der ersten zwölf Dezembertage erinnert uns dieser Brauch daran, dass das erste kleine Licht immer genau dort geboren wird, wo die Schatten am längsten scheinen.',
    practiceTitle: 'Abschluss von Teil 1 des Adventskalenders',
    practiceOrQuestion:
      'Entzünde heute Abend bewusst eine einzelne Kerze im abgedunkelten Raum. Betrachte für eine Minute ruhig die Flamme als Zeichen deiner eigenen inneren Zuversicht.',
    durationOrInfo: 'Übergang in die zweite Dezemberhälfte'
  },

  // ─── TEIL 2: TAGE 13 BIS 24 (WENDEPUNKT & WEIHEZEIT) ──────────────────────
  {
    day: 13,
    dateLabel: '13. Dez',
    part: 2,
    category: 'gewinnspiel',
    categoryLabel: 'Gewinnspiel 2',
    emoji: '🎁',
    title: 'Halbzeit: 2. Hörbuch-Verlosung',
    coreImpulse: 'Austausch: Welcher Kraftort schenkt dir Zuflucht?',
    deepText:
      'Zur Halbzeit auf dem Weg zu den heiligen Nächten öffnen wir unsere zweite Verlosung! Gewinne das große Rauhnacht-Hörbuch „Yggdrasils Atem – 12 Rauhnächte auf der Schwelle“ (2 Std. 59 Min. Spielzeit) als treuen Begleiter für deine Schwellenzeit zwischen den Jahren. Die Auslosung findet am Folgetag (14. Dezember) statt – alle bis dahin Eingetragenen sind im Lostopf!',
    practiceTitle: 'Deine Gewinnspiel-Frage zum 13. Dezember',
    practiceOrQuestion:
      'Welcher Ort in der Natur (z. B. ein alter Wald, das Meer, ein Bergsee oder eine stille Lichtung) schenkt deiner Seele am schnellsten Zuflucht und tiefen Frieden?',
    durationOrInfo: '2. Verlosung • Auslosung am 14. Dez • Wert 9,99 €'
  },
  {
    day: 14,
    dateLabel: '14. Dez',
    part: 2,
    category: 'meditation',
    categoryLabel: 'Meditation 3',
    emoji: '🧘',
    title: '3. Advent: Frieden mit dem Gewordenen',
    coreImpulse: 'Alte Schwere in den Schnee ablegen; Selbstresilienz ehren.',
    deepText:
      'Am dritten Advent blicken wir mit mildem Herzen auf das zu Ende gehende Jahr. Nicht alles ist so verlaufen, wie wir es geplant hatten – und doch hast du jede Herausforderung bis heute gemeistert. Frieden entsteht, wenn wir aufhören, gegen das Vergangene zu kämpfen.',
    practiceTitle: 'Geführte Meditation zur Versöhnung (ca. 10 Min.)',
    practiceOrQuestion:
      'Stelle dir vor, du legst einen schweren Rucksack sanft in den weichen, unberührten Neuschnee. Verneige dich innerlich vor deiner eigenen Kraft und Resilienz, die dich durch dieses Jahr getragen hat.',
    durationOrInfo: 'Ca. 10 Min. • Geführte Meditation zum 3. Advent'
  },
  {
    day: 15,
    dateLabel: '15. Dez',
    part: 2,
    category: 'achtsamkeit',
    categoryLabel: 'Achtsamkeit',
    emoji: '🌿',
    title: 'Die Berührung der Hände',
    coreImpulse: 'Hände auf Herz & Bauch; Beruhigung des Vagusnervs.',
    deepText:
      'Unsere eigenen Hände sind eines der wirksamsten Instrumente zur Selbstregulation. Durch sanften Druck und Körperwärme auf Brustkorb und Bauchraum wird das Bindungshormon Oxytocin ausgeschüttet und der ventrale Vagusnerv erhält das unmittelbare Signal: „Du bist in Sicherheit.“',
    practiceTitle: 'Somatische Selbstberührung (3 Minuten)',
    practiceOrQuestion:
      'Lege im Sitzen oder Liegen deine rechte Hand auf dein Herz und deine linke Hand auf deinen Unterbauch. Lass deine Schultern schwer sinken und spüre, wie dein Atem beide Hände sanft wie Meereswellen hebt und senkt.',
    durationOrInfo: '3 Min. • Vagusnerv & Selbstmitgefühl'
  },
  {
    day: 16,
    dateLabel: '16. Dez',
    part: 2,
    category: 'altes_wissen',
    categoryLabel: 'Altes Wissen',
    emoji: '📜',
    title: 'Yggdrasil im Nebel',
    coreImpulse: 'Der Weltenbaum: Eigene Wirbelsäule als standfester Stamm.',
    deepText:
      'In der nordischen Überlieferung bildet die immergrüne Weltenesche Yggdrasil die Achse des Kosmos: Ihre Wurzeln reichen tief in die Quellen der Urweisheit, während ihre Krone den Himmel trägt. Im menschlichen Körper entspricht dieser Weltenbaum unserer eigenen Wirbelsäule – aufrecht zwischen Erde und Himmel.',
    practiceTitle: 'Verkörperung des Weltenbaums',
    practiceOrQuestion:
      'Richte dich im Sitzen oder Stehen einmal ganz bewusst Wirbel für Wirbel auf. Spüre dein Becken als starke Wurzel und deinen Scheitel als freie Baumkrone. Du bist der ruhige Stamm inmitten des Winternebels.',
    durationOrInfo: 'Symbolik von Yggdrasil & innere Aufrichtung'
  },
  {
    day: 17,
    dateLabel: '17. Dez',
    part: 2,
    category: 'achtsamkeit',
    categoryLabel: 'Achtsamkeit',
    emoji: '🌿',
    title: 'Der Klang der Stille',
    coreImpulse: '10 Minuten Digital-Detox; den Raum hinter den Geräuschen hören.',
    deepText:
      'Unser Gehörsinn ist selbst im Schlaf ununterbrochen wach. Ständige Benachrichtigungen, Nachrichten und Hintergrundgeräusche halten das Nervensystem in subtiler Habachtstellung. Wahre Stille ist nicht die Abwesenheit von Geräuschen, sondern das Lauschen auf den weiten Raum dahinter.',
    practiceTitle: '10 Minuten Akustik-Fasten',
    practiceOrQuestion:
      'Schalte heute für genau 10 Minuten alle Bildschirme, Musik und Benachrichtigungen aus. Setze dich ruhig hin und lausche ohne Bewertung auf die feinsten Geräusche im Raum – und auf die Stille zwischen ihnen.',
    durationOrInfo: '10 Min. • Digital-Detox & Tiefenlauschen'
  },
  {
    day: 18,
    dateLabel: '18. Dez',
    part: 2,
    category: 'altes_wissen',
    categoryLabel: 'Altes Wissen',
    emoji: '📜',
    title: 'Die Schwellenzeit (Tote Tage)',
    coreImpulse: 'Außerhalb der Zeit stehen; Mond- & Sonnenjahr-Ausgleich.',
    deepText:
      'Ab dem 18. Dezember beginnt spürbar das Hinübergleiten in die Schwellenzeit. Das alte Mondjahr (354 Tage) und das Sonnenjahr (365 Tage) klaffen um genau elf bis zwölf Nächte auseinander. Unsere Vorfahren nannten diese Tage die Zeit „zwischen den Jahren“ – Tage außerhalb der linearen Uhrzeit, in denen die Schleier zur Intuition besonders durchlässig sind.',
    practiceTitle: 'Ausstieg aus der linearen Eile',
    practiceOrQuestion:
      'Ab heute weicht der Druck der Uhrzeit. Frage dich heute nicht „Wie viel habe ich geschafft?“, sondern „Wie tief war ich mit mir selbst verbunden?“',
    durationOrInfo: 'Astronomie & Mythos der Schwellenzeit'
  },
  {
    day: 19,
    dateLabel: '19. Dez',
    part: 2,
    category: 'achtsamkeit',
    categoryLabel: 'Achtsamkeit',
    emoji: '🌿',
    title: 'Dankbarkeit für das Kleine',
    coreImpulse: 'Drei unscheinbare Mikromomente des Tages körperlich spüren.',
    deepText:
      'Dankbarkeit ist kein bloßes Gedankenkonzept, sondern eine fühlbare Körperempfindung. Wenn wir uns nicht auf große Meilensteine, sondern auf winzige, unscheinbare Kostbarkeiten des Alltags konzentrieren, weitet sich unser Herzraum ganz von selbst.',
    practiceTitle: '3 Mikromomente im Körper verankern',
    practiceOrQuestion:
      'Erinnere dich heute Abend an drei ganz kleine, schöne Momente des Tages (ein warmes Licht, ein freundlicher Blick, das Gefühl der Bettdecke) und spüre jedem Moment zehn Sekunden lang im Brustraum nach.',
    durationOrInfo: '3 Min. • Herz-Kohärenz & Dankbarkeit'
  },
  {
    day: 20,
    dateLabel: '20. Dez',
    part: 2,
    category: 'meditation',
    categoryLabel: 'Meditation 4',
    emoji: '🧘',
    title: '4. Advent: Reise zum inneren Ruhepol',
    coreImpulse: 'Die Zirbenhütte am Bergsee; vollkommene Entspannung.',
    deepText:
      'Am Vorabend der Wintersonnenwende führt dich unsere vierte Adventsmeditation an einen geschützten Rückzugsort tief in den verschneiten Bergen: Eine wohlige Hütte aus duftendem Zirbenholz an einem stillen, spiegelglatten Bergsee, in der das Kaminfeuer knistert.',
    practiceTitle: 'Geführte Traumreise (ca. 10 Min.)',
    practiceOrQuestion:
      'Lass dich mit jedem Ausatmen tiefer in deinen Sessel vor dem geistigen Kaminfeuer sinken. Draußen fällt lautlos der Schnee, während du im Inneren vollkommen geborgen und schwerelos ruhst.',
    durationOrInfo: 'Ca. 10 Min. • Geführte Meditation zum 4. Advent'
  },
  {
    day: 21,
    dateLabel: '21. Dez',
    part: 2,
    category: 'gewinnspiel',
    categoryLabel: 'Gewinnspiel 3',
    emoji: '🎁',
    title: 'Sonnenwende: 3. Hörbuch-Verlosung',
    coreImpulse: 'Frage zur Julnacht: Welcher Same darf für dich keimen?',
    deepText:
      'Heute ist der 21. Dezember – die heilige Wintersonnenwende (Julnacht) und zugleich der feierliche Auftakt unseres Hörbuchs „Yggdrasils Atem“! Zu diesem besonderen Wendepunkt verlosen wir zum dritten Mal das komplette Rauhnacht-Hörbuch. Achtung: Die Teilnahme für dieses Finale läuft direkt am 21. Dezember bis 18:00 Uhr! Jede(r), der sich bis 18:00 Uhr angemeldet hat, nimmt an der Ziehung teil.',
    practiceTitle: 'Deine Gewinnspiel-Frage zur Wintersonnenwende',
    practiceOrQuestion:
      'In der dunkelsten Nacht des Jahres wird das neue Licht geboren: Welcher Herzenswunsch oder „Same“ darf im kommenden Jahr sanft in deinem Leben keimen?',
    durationOrInfo: '3. Verlosung • Teilnahmeschluss: 21. Dez, 18:00 Uhr'
  },
  {
    day: 22,
    dateLabel: '22. Dez',
    part: 2,
    category: 'altes_wissen',
    categoryLabel: 'Altes Wissen',
    emoji: '📜',
    title: 'Wiedergeburt des Lichts (Jul)',
    coreImpulse: 'Der Wendepunkt im Mutterschoß der dunkelsten Nacht.',
    deepText:
      'Nach dem kosmischen Tiefpunkt der längsten Nacht kehrt das Sonnenlicht ab heute jeden Tag um ein winziges Stück zurück. Im alten Wissen galt diese Zeit als der ruhige Mutterschoß der Erde: Das neue Licht ist noch zart und schutzbedürftig wie ein Neugeborenes – es verlangt nach Sanftheit, Stille und Achtsamkeit.',
    practiceTitle: 'Das zarte neue Licht hüten',
    practiceOrQuestion:
      'Behandle dich und deine Vorsätze heute mit größter Behutsamkeit. Du musst noch nichts im Außen umsetzen – hüte den neuen Funken still in deinem Herzen.',
    durationOrInfo: 'Mysterium der Julzeit & Lichtgeburt'
  },
  {
    day: 23,
    dateLabel: '23. Dez',
    part: 2,
    category: 'achtsamkeit',
    categoryLabel: 'Achtsamkeit',
    emoji: '🌿',
    title: 'Den Raum vorbereiten',
    coreImpulse: 'Räuchern/Lüften & den persönlichen Kraftplatz segnen.',
    deepText:
      'Morgen Abend öffnen sich die Tore zur Heiligen Nacht und zur ersten Rauhnacht. So wie wir ein Zimmer lüften und schmücken, bevor ein geschätzter Gast eintritt, bereiten wir heute äußerlich und innerlich unseren persönlichen Ruhe- und Meditationsplatz vor.',
    practiceTitle: 'Vorbereitungs-Ritual für die Rauhnächte',
    practiceOrQuestion:
      'Öffne heute weit die Fenster, lass frische Winterluft durch deine Räume strömen, entzünde etwas Räucherwerk (z. B. Fichtenharz, Wacholder oder Salbei) oder ein Teelicht und richte dir deinen gemütlichen Platz für die kommenden zwölf Nächte ein.',
    durationOrInfo: '5 Min. • Raumklärung & Kraftplatz'
  },
  {
    day: 24,
    dateLabel: '24. Dez',
    part: 2,
    category: 'meditation',
    categoryLabel: 'Meditation 5',
    emoji: '🧘',
    title: 'Heilige Nacht: Das Geschenk des Seins',
    coreImpulse: 'Verbundenheit mit allem Leben; Segnung der Rauhnächte.',
    deepText:
      'Am 24. Dezember schließt sich der Kreis unseres Adventskalenders – und gleichzeitig öffnet sich heute Nacht das Tor zur 1. Rauhnacht (24./25. Dezember). Das größte Geschenk dieser Nacht liegt in der tiefen Erkenntnis deiner Verbundenheit mit dir selbst, deinen Liebsten und dem großen Kreislauf des Lebens.',
    practiceTitle: 'Abschluss-Meditation & Übergang in die 1. Rauhnacht',
    practiceOrQuestion:
      'Atme tief in dein Herz ein und spüre Dankbarkeit für diesen 24-tägigen Weg. Du bist nun innerlich und äußerlich bereit, heute Abend mit der ersten geweihten Rauhnacht („Basis & Urvertrauen“) an den Wurzeln von Yggdrasil zu beginnen.',
    durationOrInfo: 'Ca. 10 Min. • Heiligabend & Schwelle zur 1. Rauhnacht'
  }
];

