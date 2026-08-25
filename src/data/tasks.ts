export interface Task {
  id: number;
  title: string;
  description: string;
  tips: string[];
}

export const progressiveTasks: Task[] = [
  // ============================================================================
  // PHASE 1: FUNDAMENT DER RUHE & WAHRNEHMUNG (Woche 1 – 13)
  // ============================================================================
  {
    id: 0,
    title: "Der bewusste Atem",
    description: "Nimm dir diese Woche Zeit, um deinen natürlichen Atem zu spüren, ohne ihn kontrollieren zu wollen. Beobachte einfach, wie er von selbst ein- und ausströmt.",
    tips: [
      "Setze dich aufrecht hin und entspanne deine Schultern.",
      "Beobachte das sanfte Heben und Senken deiner Bauchdecke.",
      "Wenn Gedanken kommen, nimm sie wahr und lass sie wie Wolken weiterziehen."
    ]
  },
  {
    id: 1,
    title: "Die 5-Sinne-Pause",
    description: "Pausiere am Tag und verbinde dich mit deiner Umgebung. Eine sanfte Erdungsübung, wenn der Kopf zu voll ist.",
    tips: [
      "Zähle 5 Dinge auf, die du siehst.",
      "Finde 4 Dinge, die du körperlich spürst (z. B. den Boden unter deinen Füßen).",
      "Lausche auf 3 verschiedene Geräusche in deiner Nähe."
    ]
  },
  {
    id: 2,
    title: "Bewusstes Essen",
    description: "Nimm mindestens eine Mahlzeit am Tag völlig ohne Ablenkung ein – kein Smartphone, kein Fernseher, kein Multitasking.",
    tips: [
      "Betrachte dein Essen vor dem ersten Bissen und rieche das Aroma.",
      "Kaue jeden Bissen deutlich langsamer als gewohnt.",
      "Achte auf das einsetzende Sättigungsgefühl deines Körpers."
    ]
  },
  {
    id: 3,
    title: "Digitaler Sonnenuntergang",
    description: "Lege dein Smartphone und alle Bildschirme eine Stunde vor dem Schlafengehen beiseite.",
    tips: [
      "Schalte das Smartphone abends in den Flugmodus oder lade es außerhalb des Schlafzimmers.",
      "Lies stattdessen in einem Buch oder höre eine ruhige Entspannungsmusik.",
      "Lass den Tag bei gedimmtem Licht und warmem Tee ausklingen."
    ]
  },
  {
    id: 4,
    title: "Der innere Körperscan",
    description: "Führe morgens oder abends einen achtsamen Scan deines Körpers durch – von den Fußspitzen bis zum Scheitel.",
    tips: [
      "Lege dich entspannt auf den Rücken und schließe die Augen.",
      "Wandere mit deiner Aufmerksamkeit langsam durch jedes Körperteil.",
      "Löse beim Ausatmen bewusst kleine Verspannungen in Kiefer und Schultern."
    ]
  },
  {
    id: 5,
    title: "Radikale Akzeptanz",
    description: "Beobachte deine Reaktionen auf Stress. Erlaube dem Gefühl da zu sein, ohne direkt innerlich dagegen anzukämpfen.",
    tips: [
      "Sag dir in herausfordernden Momenten: 'Es ist okay, dass ich mich gerade so fühle.'",
      "Beobachte, wo im Körper das Gefühl spürbar ist (z. B. Enge in der Brust).",
      "Atme sanft und tief in diesen Bereich hinein."
    ]
  },
  {
    id: 6,
    title: "Achtsames Gehen (Gehmeditation)",
    description: "Verwandle alltägliche Wege in eine Meditation. Spüre den direkten Kontakt deiner Füße mit der Erde.",
    tips: [
      "Gehe bewusst ein kleines Stück langsamer als gewohnt.",
      "Spüre das Abrollen von der Ferse über den Ballen bis zu den Zehen.",
      "Halte den Blick sanft nach vorne gerichtet und atme im Takt deiner Schritte."
    ]
  },
  {
    id: 7,
    title: "Die Mikro-Pause für den Vagusnerv",
    description: "Aktiviere deinen Entspannungsnerv mehrmals täglich durch verlängertes Ausatmen.",
    tips: [
      "Atme 4 Sekunden durch die Nase ein.",
      "Atme 7 bis 8 Sekunden sanft und vollständig durch den leicht geöffneten Mund aus.",
      "Wiederhole diesen Rhythmus 4 Mal hintereinander bei stressigen Übergängen."
    ]
  },
  {
    id: 8,
    title: "Beobachter deiner Gedanken",
    description: "Betrachte deine Gedanken wie vorbeifahrende Züge am Bahnhof, ohne in jeden Zug einzusteigen.",
    tips: [
      "Schließe für 3 Minuten die Augen und beobachte das Entstehen von Gedanken.",
      "Gib Gedanken neutrale Etiketten wie 'Planung', 'Erinnerung' oder 'Sorge'.",
      "Kehre immer wieder liebevoll zum Spüren deines Atems zurück."
    ]
  },
  {
    id: 9,
    title: "Achtsames Händewaschen",
    description: "Nutze eine alltägliche Routinehandlung als Anker für absolute Gegenwärtigkeit.",
    tips: [
      "Spüre die Temperatur und das Fließen des Wassers auf deiner Haut.",
      "Nimm den Duft der Seife und die Textur des Schaums bewusst wahr.",
      "Trockne deine Hände achtsam ab und atme einmal tief durch."
    ]
  },
  {
    id: 10,
    title: "Die 3-Minuten-Stille",
    description: "Schenke dir täglich 3 Minuten vollkommene Stille – ohne Musik, ohne Stimmen, ohne Beschäftigung.",
    tips: [
      "Setze dich an einen ruhigen Ort und schließe die Augen.",
      "Richte deine Aufmerksamkeit nur auf die Geräusche der Stille.",
      "Genieße das Nicht-Tun als wertvolle Tankstelle für deinen Geist."
    ]
  },
  {
    id: 11,
    title: "Körperliche Haltungs-Korrektur",
    description: "Nimm tagsüber deine Körperhaltung wahr und schenke deinem Körper mehr Raum und Aufrichtung.",
    tips: [
      "Achte darauf, ob deine Schultern hochgezogen oder nach vorne gebeugt sind.",
      "Richte deine Wirbelsäule auf, ziehe die Schultern sanft nach hinten unten.",
      "Löse die Zunge vom Gaumen und entspanne die Stirnmuskeln."
    ]
  },
  {
    id: 12,
    title: "Vierteljahres-Reflexion 🌱",
    description: "Blicke auf deine ersten 12 Wochen zurück und würdige deinen Fortschritt in der Wahrnehmung.",
    tips: [
      "Schreibe 3 Situationen auf, in denen du gelassener reagiert hast als früher.",
      "Bedanke dich bei dir selbst für deine tägliche Zeit und Übung.",
      "Setze eine klare Intention für das nächste Quartal der emotionalen Balance."
    ]
  },

  // ============================================================================
  // PHASE 2: EMOTIONALE BALANCE & LOSLASSEN (Woche 14 – 26)
  // ============================================================================
  {
    id: 13,
    title: "Der innere Wohlfühlort",
    description: "Erschaffe vor deinem inneren Auge einen Zufluchtsort des Friedens und der Geborgenheit.",
    tips: [
      "Visualisiere einen Ort in der Natur (z. B. Strand, Waldlichtung, Bergwiese).",
      "Male dir alle Details aus: Farben, Lichtstimmung, Düfte und Klänge.",
      "Verankere das Gefühl von Sicherheit mit einer Hand auf deinem Herzen."
    ]
  },
  {
    id: 14,
    title: "Achtsames Zuhören",
    description: "Schenke deinen Mitmenschen ungeteilte Aufmerksamkeit, ohne im Kopf schon die Antwort vorzubereiten.",
    tips: [
      "Schaue deinem Gegenüber freundlich in die Augen und höre aktiv zu.",
      "Verzichte darauf zu unterbrechen oder ungefragt Ratschläge zu erteilen.",
      "Nimm auch Tonfall und Körpersprache des anderen wahr."
    ]
  },
  {
    id: 15,
    title: "Die Stopp-Methode (S-T-O-P)",
    description: "Ein Notfall-Anker bei plötzlichem Ärger, Reizüberflutung oder Hektik.",
    tips: [
      "S = Stopp: Halte für einen Moment inne.",
      "T = Take a breath: Nimm 2 tiefe Atemzüge.",
      "O = Observe: Beobachte Gefühle und Gedanken ohne Urteil. P = Proceed: Handle mit Klarheit weiter."
    ]
  },
  {
    id: 16,
    title: "Selbstmitgefühl statt Selbstkritik",
    description: "Begegne deinen Fehlern und Unvollkommenheiten mit derselben Wärme wie einem guten Freund.",
    tips: [
      "Ertappe deine innere Kritikerstimme und unterbrich sie sanft.",
      "Sprich dir selbst beruhigende Worte zu: 'Ich gebe mein Bestes und das reicht.'",
      "Lege eine Hand sanft auf deine Wange oder dein Herz."
    ]
  },
  {
    id: 17,
    title: "Entschleunigtes Sprechen",
    description: "Achte auf dein Sprechtempo und nutze bewusste Pausen zwischen Sätzen.",
    tips: [
      "Atme aus, bevor du auf eine Frage antwortest.",
      "Reduziere dein normales Sprechtempo um 10 %.",
      "Lass Raum für Stille in Gesprächen – sie schafft Klarheit und Tiefe."
    ]
  },
  {
    id: 18,
    title: "Das Geschenk des Nein-Sagens",
    description: "Setze achtsame Grenzen, um dein inneres Wohlbefinden und deine Energie zu schützen.",
    tips: [
      "Spüre bei Anfragen zuerst in deinen Bauch: Fühlt es sich leicht oder schwer an?",
      "Antworte bei Unsicherheit: 'Ich schaue in meinen Kalender und gebe dir morgen Bescheid.'",
      "Ein liebevolles Nein zu anderen ist ein klares Ja zu dir selbst."
    ]
  },
  {
    id: 19,
    title: "Loslassen von mentalem Ballast",
    description: "Trenne dich von Gedanken an Dinge, die du aktuell nicht kontrollieren oder ändern kannst.",
    tips: [
      "Schreibe auf, was dir Sorgen bereitet, und trenne in 'Kontrollierbar' und 'Nicht kontrollierbar'.",
      "Visualisiere, wie du die unkontrollierbaren Dinge in einen Fluss legst und davontreiben lässt.",
      "Richte deine Energie zu 100 % auf deinen heutigen Handlungsspielraum."
    ]
  },
  {
    id: 20,
    title: "Achtsames Aufwachen",
    description: "Beginne den Tag in Ruhe, bevor du nach dem Smartphone greifst oder To-Do-Listen wälzt.",
    tips: [
      "Bleibe nach dem Aufwachen 2 Minuten ruhig liegen und spüre deinen Körper.",
      "Dehne und strecke dich genüsslich wie eine Katze.",
      "Formuliere einen positiven Gedanken für den Tag: 'Ich begrüße diesen Tag mit Gelassenheit.'"
    ]
  },
  {
    id: 21,
    title: "Das Lächeln der Achtsamkeit",
    description: "Schenke dir und deiner Umwelt ein bewusstes, sanftes Lächeln (Half-Smile-Technik).",
    tips: [
      "Entspanne deine Kiefermuskeln und hebe die Mundwinkel ganz leicht an.",
      "Spüre, wie das Lächeln sofort Signale der Entspannung an dein Nervensystem sendet.",
      "Schenke heute mindestens drei Menschen ein freundliches Lächeln."
    ]
  },
  {
    id: 22,
    title: "Geruchs-Achtsamkeit",
    description: "Erforsche deine Umwelt über den oft vernachlässigten Geruchssinn.",
    tips: [
      "Nimm den Duft von Kaffee, Tee, Blumen oder frischem Regen bewusst wahr.",
      "Schließe beim Riechen die Augen, um die Wahrnehmung zu vertiefen.",
      "Beobachte, welche Erinnerungen oder Gefühle die Düfte in dir wecken."
    ]
  },
  {
    id: 23,
    title: "Akzeptanz des Wetters & der Umstände",
    description: "Übe dich im Nicht-Bewerten von äußeren Bedingungen (Regen, Kälte, Stau).",
    tips: [
      "Verzichte eine Woche lang auf Klagen über das Wetter oder Hindernisse.",
      "Nimm Regen einfach als nass und Wind als bewegend wahr – ohne 'gut' oder 'schlecht'.",
      "Finde das Schöne in der jeweiligen Situation (z. B. Gemütlichkeit bei Regen)."
    ]
  },
  {
    id: 24,
    title: "Die Herzenspause",
    description: "Verbinde dich mehrmals am Tag bewusst mit deinem Herzraum und spüre den Herzschlag.",
    tips: [
      "Lege beide Hände übereinander auf die Mitte deiner Brust.",
      "Atme tief ein und stelle dir vor, wie dein Atem direkt durch dein Herz fließt.",
      "Spüre die wohlige Wärme unter deinen Händen."
    ]
  },
  {
    id: 25,
    title: "Halbjahres-Balance 🌊",
    description: "Feiere 6 Monate kontinuierliche Achtsamkeitspraxis und innere Reife.",
    tips: [
      "Nimm dir 15 Minuten Zeit für einen achtsamen Spaziergang in der Natur.",
      "Notiere, wie sich dein Umgang mit Stress und Emotionen verändert hat.",
      "Gönne dir eine wohlverdiente Belohnung für dein Durchhaltevermögen."
    ]
  },

  // ============================================================================
  // PHASE 3: TIEFE VERBINDUNG & ACHTSAMKEIT IM ALLTAG (Woche 27 – 39)
  // ============================================================================
  {
    id: 26,
    title: "Das 3-Dankbarkeiten-Ritual",
    description: "Trainiere dein Gehirn darauf, das Gute und Erfüllende im Alltag wahrzunehmen.",
    tips: [
      "Notiere jeden Abend vor dem Schlafen 3 konkrete Dinge, für die du heute dankbar bist.",
      "Wähle auch kleine Dinge (z. B. ein warmes Sonnenbad, ein liebes Wort).",
      "Spüre das Gefühl der Dankbarkeit für 20 Sekunden intensiv in deinem Körper nach."
    ]
  },
  {
    id: 27,
    title: "Waldbaden & Naturverbindung",
    description: "Tauche mit allen Sinnen in die beruhigende Atmosphäre von Bäumen und Pflanzen ein.",
    tips: [
      "Spaziere für 20 Minuten im Wald oder Park – ohne Musik und ohne Kopfhörer.",
      "Berühre die Rinde eines Baumes oder das Moos am Boden.",
      "Atme die ätherischen Düfte der Natur tief ein."
    ]
  },
  {
    id: 28,
    title: "Die Kunst des Mono-Taskings",
    description: "Tue immer nur eine einzige Sache zur selben Zeit – aber diese mit voller Hingabe.",
    tips: [
      "Schließe alle überflüssigen Browser-Tabs und Apps bei der Arbeit.",
      "Wenn du telefonierst, telefoniere nur. Wenn du aufräumst, räume nur auf.",
      "Spüre die Entlastung, die entsteht, wenn du dich nicht mehr zerstreust."
    ]
  },
  {
    id: 29,
    title: "Warmherzigkeit für Fremde (Metta)",
    description: "Sende fremden Menschen auf der Straße im Stillen gute Wünsche.",
    tips: [
      "Blicke auf eine Person im Bus, Supermarkt oder auf der Straße.",
      "Denke im Stillen: 'Mögest du glücklich sein. Mögest du gesund sein. Mögest du in Frieden leben.'",
      "Beobachte, wie sich dein eigenes Herz dabei weitet und erwärmt."
    ]
  },
  {
    id: 30,
    title: "Achtsames Trinken",
    description: "Verwandle das Trinken von Wasser oder Tee in ein entschleunigendes Ritual.",
    tips: [
      "Halte die Tasse mit beiden Händen und spüre die Temperatur.",
      "Nimm den ersten Schluck bewusst und spüre, wie die Flüssigkeit deine Kehle hinabfließt.",
      "Sei dankbar für den Zugang zu sauberem, erfrischendem Wasser."
    ]
  },
  {
    id: 31,
    title: "Geräuschkulisse ohne Filter",
    description: "Lausche der Geräuschkulisse deiner Umgebung, ohne die Geräusche zu benennen oder zu bewerten.",
    tips: [
      "Setze dich für 5 Minuten ans offene Fenster oder auf eine Bank.",
      "Höre alle Töne als reine Klangwellen (wie ein Orchester der Umwelt).",
      "Achte besonders auf die leisen Zwischenräume zwischen den Geräuschen."
    ]
  },
  {
    id: 32,
    title: "Die Kraft des bewussten Seufzens",
    description: "Nutze das physiologische Seufzen, um akute Anspannung in Sekunden abzubauen.",
    tips: [
      "Atme zweimal kurz hintereinander durch die Nase tief ein (doppelter Lungenzug).",
      "Atme dann lang und entspannt durch den Mund mit einem leisen Seufzen aus.",
      "Wiederhole das 3 Mal – spüre die sofortige Entlastung im Brustkorb."
    ]
  },
  {
    id: 33,
    title: "Blick in den weiten Himmel",
    description: "Erweitere dein Blickfeld und löse den ständigen Tunnelblick auf Bildschirme.",
    tips: [
      "Schau für 3 Minuten in den offenen Himmel oder auf den weiten Horizont.",
      "Nutze dein peripheres Sehen (nimm auch die Ränder deines Sichtfeldes wahr).",
      "Spüre, wie die Weite des Himmels deinen Gedanken Weite schenkt."
    ]
  },
  {
    id: 34,
    title: "Achtsames Warten",
    description: "Verwandle Wartezeiten (an der Kasse, roten Ampel, im Wartezimmer) in wertvolle Meditationen.",
    tips: [
      "Wenn du warten musst: Greife nicht automatisch zum Smartphone.",
      "Nutze die Zeit für 3 tiefe, bewusste Atemzüge.",
      "Entspanne Schultern und Kiefer und freue dich über die unverhoffte Pause."
    ]
  },
  {
    id: 35,
    title: "Loslassen des Besserwissens",
    description: "Übe dich darin, Meinungen anderer stehen zu lassen, ohne Recht haben zu müssen.",
    tips: [
      "Beobachte den Impuls, andere korrigieren oder belehren zu wollen.",
      "Frage dich: 'Muss ich jetzt wirklich recht haben, oder ist innerer Frieden wertvoller?'",
      "Antworte stattdessen mit: 'Interessante Perspektive, danke fürs Teilen.'"
    ]
  },
  {
    id: 36,
    title: "Berührung & Hautkontakt",
    description: "Schenke deinen Berührungen – ob bei dir selbst, Partnern oder Haustieren – volle Präsenz.",
    tips: [
      "Creme deine Hände oder dein Gesicht langsam und mit liebevoller Aufmerksamkeit ein.",
      "Umarme deine Liebsten für mindestens 20 Sekunden (schüttet Oxytocin aus).",
      "Streichle ein Haustier mit ungeteilter Aufmerksamkeit."
    ]
  },
  {
    id: 37,
    title: "Achtsames Aufräumen (Zen-Praxis)",
    description: "Betrachte Ordnung und Aufräumen nicht als lästige Pflicht, sondern als Klärung des Geistes.",
    tips: [
      "Wähle eine Schublade, einen Schreibtisch oder eine Ecke im Raum.",
      "Bewege jeden Gegenstand achtsam und finde einen festen Platz dafür.",
      "Spüre, wie äußere Ordnung sofort innere Ruhe und Leichtigkeit erzeugt."
    ]
  },
  {
    id: 38,
    title: "Dreivierteljahr der Transformation ☀️",
    description: "Reflektiere deine wachsende Verbundenheit mit dir selbst und deiner Umwelt.",
    tips: [
      "Zünde eine Kerze an und schenke dir 10 Minuten stille Einkehr.",
      "Notiere, welche Beziehungen in deinem Leben harmonischer geworden sind.",
      "Bereite dich mental auf das finale Quartal der Meisterschaft vor."
    ]
  },

  // ============================================================================
  // PHASE 4: MEISTERSCHAFT & FLOW DER STILLE (Woche 40 – 52)
  // ============================================================================
  {
    id: 39,
    title: "Der Zeugen-Zustand (Reine Präsenz)",
    description: "Erfahre dich selbst als den stillen Raum, in dem alle Erfahrungen stattfinden.",
    tips: [
      "Frage dich tagsüber: 'Wer ist es, der diese Gedanken und Gefühle gerade wahrnimmt?'",
      "Ruhe in dem Bewusstsein, das hinter allen Gedanken liegt.",
      "Spüre den unveränderlichen Frieden deines inneren Kerns."
    ]
  },
  {
    id: 40,
    title: "Achtsamkeit im Konflikt",
    description: "Bleibe zentriert und verankert, selbst wenn es im Außen stürmisch oder emotional wird.",
    tips: [
      "Verankere deine Füße fest auf dem Boden und atme in den Bauch.",
      "Reagiere nicht sofort, sondern nimm dir eine bewusste Pause von 3 Sekunden.",
      "Höre zu, um zu verstehen, statt um dich zu verteidigen."
    ]
  },
  {
    id: 41,
    title: "Die Schönheit des Unvollkommenen (Wabi-Sabi)",
    description: "Verabschiede dich vom Perfektionismus und erkenne den Zauber des Unvollkommenen.",
    tips: [
      "Erlaube dir bewusst, eine Aufgabe mit 90 % statt 100 % Perfektion abzuschließen.",
      "Betrachte Risse, Narben oder Unebenheiten als Zeichen von Charakter und Leben.",
      "Sei gütig mit dir selbst, wenn Dinge einmal nicht nach Plan laufen."
    ]
  },
  {
    id: 42,
    title: "Entschleunigtes Einkaufen",
    description: "Verwandle den Wocheneinkauf in eine Entdeckungsreise der Sinne und der Wertschätzung.",
    tips: [
      "Gehe ohne Hast durch die Gänge und betrachte die Farben von Obst und Gemüse.",
      "Bedanke dich an der Kasse mit echtem Augenkontakt und einem Lächeln.",
      "Trage deine Einkäufe mit aufrechter Haltung und Ruhe nach Hause."
    ]
  },
  {
    id: 43,
    title: "Der Herzkompass (Intuition stärken)",
    description: "Lerne, wichtige Entscheidungen nicht nur mit dem Kopf, sondern mit deinem Herzen zu treffen.",
    tips: [
      "Schließe die Augen, lege die Hand aufs Herz und denke an eine Option.",
      "Fühlt sich dein Herzraum weit und warm an (Ja) oder eng und schwer (Nein)?",
      "Vertraue den leisen Impulsen deiner inneren Stimme."
    ]
  },
  {
    id: 44,
    title: "Licht- & Schatten-Wahrnehmung",
    description: "Beobachte das faszinierende Spiel von Licht, Schatten und Farben um dich herum.",
    tips: [
      "Achte darauf, wie das Sonnenlicht durch Fenster oder Baumkronen fällt.",
      "Beobachte tanzende Schatten an Wänden.",
      "Lass dich von der Poesie des Augenblicks berühren."
    ]
  },
  {
    id: 45,
    title: "Achtsames Ausklingen des Tages",
    description: "Schließe jeden Tag mit einem bewussten Übergang in den wohlverdienten Feierabend ab.",
    tips: [
      "Beende deine Arbeit mit einem bewussten Signal (z. B. Laptop zuklappen, tief durchatmen).",
      "Verabschiede dich gedanklich von allen ungelösten Aufgaben bis zum nächsten Tag.",
      "Wechsle in bequeme Kleidung und spüre die Leichtigkeit des Feierabends."
    ]
  },
  {
    id: 46,
    title: "Vergebung & innerer Frieden",
    description: "Befreie dich von alter Groll-Energie, um Raum für neuen Lebensmut zu schaffen.",
    tips: [
      "Denke an jemanden, über den du dich geärgert hast, und nimm den Schmerz wahr.",
      "Sprich im Stillen: 'Ich vergebe dir nicht, um dein Verhalten gutzuheißen, sondern um meinen Frieden zu finden.'",
      "Atme tief aus und spüre die Befreiung im Brustraum."
    ]
  },
  {
    id: 47,
    title: "Die Stille zwischen den Worten",
    description: "Achte in Gesprächen und Medien auf die wertvollen Pausen und Zwischentöne.",
    tips: [
      "Beobachte, wie nach jedem Wort ein winziger Moment der Stille entsteht.",
      "Halte den Fokus nicht nur auf den Tönen, sondern auf der Stille, die sie umgibt.",
      "Finde Ruhe in dieser allgegenwärtigen Stille."
    ]
  },
  {
    id: 48,
    title: "Vertrauen in den Fluss des Lebens",
    description: "Gib den ständigen Kontrollzwang auf und vertraue darauf, dass sich die Dinge zum Guten fügen.",
    tips: [
      "Erinnere dich an vergangene Krisen, die rückblickend zu wertvollen Wendepunkten wurden.",
      "Sprich das Mantra: 'Ich vertraue dem Fluss des Lebens. Alles geschieht zur richtigen Zeit.'",
      "Lass deine Muskeln weich werden und gib dich dem Moment hin."
    ]
  },
  {
    id: 49,
    title: "Die Magie der Gegenwärtigkeit",
    description: "Erlebe den heutigen Tag, als würdest du diese Welt zum allerersten Mal sehen (Shoshin / Anfängergeist).",
    tips: [
      "Betrachte alltägliche Dinge mit kindlicher Neugier und Staunen.",
      "Löse dich von Vorurteilen und vorgefassten Meinungen.",
      "Jeder Augenblick ist einzigartig und kehrt nie wieder."
    ]
  },
  {
    id: 50,
    title: "Schenken ohne Erwartung",
    description: "Tue jemandem etwas Gutes, vollkommen ohne Gegenleistung oder Anerkennung zu erwarten.",
    tips: [
      "Hinterlasse ein nettes Post-it, zahle den Kaffee für jemanden oder spende anonym.",
      "Beobachte die Freude, die allein durch das Geben in dir aufsteigt.",
      "Wahre Großzügigkeit nährt dein eigenes Herz."
    ]
  },
  {
    id: 51,
    title: "Meister der Stille 🦅",
    description: "Du hast ein ganzes Jahr der Achtsamkeit vollendet. Feiere deine Transformation zu wahrer innerer Ruhe.",
    tips: [
      "Schau dir deinen Weg von Woche 1 bis Woche 52 an und ehre deine Reise.",
      "Spüre, wie Achtsamkeit von einer bloßen Übung zu deinem natürlichen Seinszustand geworden ist.",
      "Trage diesen inneren Flow der Stille als Leuchtturm in deine Welt."
    ]
  }
];
