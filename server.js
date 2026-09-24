var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_vite = require("vite");
var import_path = __toESM(require("path"), 1);
var import_better_sqlite3 = __toESM(require("better-sqlite3"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_cookie_parser = __toESM(require("cookie-parser"), 1);
var import_genai = require("@google/genai");

// src/data/blogPosts.ts
var BLOG_POSTS = [
  {
    slug: "selbsthypnose-wirkung-anwendung-qualitaetsanspruch",
    title: "Selbsthypnose: Wirkung, richtige Anwendung & warum Text- und Stimmqualit\xE4t den Unterschied machen",
    date: "2026-09-24",
    excerpt: "Warum braucht man Selbsthypnose, wie wendet man sie richtig an und woran erkennt man erstklassige Werke? Erfahre, wie handgeschriebene Texte von Jacqueline und die einf\xFChlsame Stimme von Lisa dein Nervensystem nachhaltig neu ausrichten.",
    category: "Selbsthypnose & Wissenschaft",
    readTime: "9 Min.",
    content: `# Selbsthypnose: Wirkung, richtige Anwendung & warum Text- und Stimmqualit\xE4t den Unterschied machen

In unserer hektischen, von Reiz\xFCberflutung gepr\xE4gten Welt sto\xDFen rein verstandesm\xE4\xDFige L\xF6sungsans\xE4tze oft an ihre Grenzen. Vielleicht kennst du das: Du wei\xDFt genau, dass du ruhig bleiben solltest, doch dein Herz rast. Du m\xF6chtest einschlafen, doch deine Gedanken kreisen unaufh\xF6rlich. Oder du nimmst dir vor, ges\xFCnder zu leben, doch automatisierte Verhaltensmuster \xFCbernehmen die Kontrolle.

Genau hier entfaltet **Selbsthypnose** ihre au\xDFergew\xF6hnliche Kraft. Sie ist kein mystischer Zaubertrick, sondern ein wissenschaftlich anerkanntes Verfahren zur gezielten Tiefenentspannung und mentalen Selbstprogrammierung.

In diesem Beitrag erf\xE4hrst du, warum Selbsthypnose so wirksam ist, wie du sie optimal f\xFCr dich anwendest, welche Sicherheitsregeln gelten und warum die **Qualit\xE4t der geschriebenen Texte und der menschlichen Stimmf\xFChrung** \xFCber den tats\xE4chlichen Erfolg entscheidet.

---

## 1. Warum brauchen wir Selbsthypnose?

Unser Gehirn arbeitet auf verschiedenen Bewusstseinsebenen. Im normalen Wachalltag dominiert der sogenannte **Beta-Wellen-Bereich**: Wir analysieren, planen, vergleichen und bewerten. Bei anhaltendem Stress ger\xE4t dieser Modus jedoch in eine Dauerschleife. Das vegetative Nervensystem blockiert im Sympathikus \u2013 dem uralten biologischen Alarmzustand ("Kampf oder Flucht").

Das Problem: **Auf der rein rationalen Bewusstseinsebene k\xF6nnen wir tief sitzende \xDCberzeugungen, \xC4ngste und Automatismen kaum ver\xE4ndern.**

\xDCber 95 % unserer t\xE4glichen Handlungen und emotionalen Reaktionen werden von unserem **Unterbewusstsein** gesteuert. Selbsthypnose ist die sanfteste und wirkungsvollste Methode, um das kritische Wachbewusstsein kurzzeitig zur Ruhe zu bringen und dem Unterbewusstsein aufbauende, heilsame Impulse anzubieten:

* **Tiefenentspannung des Nervensystems:** Der Vagusnerv wird gezielt stimuliert, Stresshormone wie Cortisol sinken sp\xFCrbar.
* **Neuausrichtung automatisierter Glaubenss\xE4tze:** Zweifel, innere Unruhe und Selbstsabotage k\xF6nnen durch Vertrauen und Gelassenheit ersetzt werden.
* **Nat\xFCrliche Einschlafhilfe:** Durch das Herunterfahren der Gehirnfrequenz von Beta- zu Alpha- und Theta-Wellen gleitet der Geist m\xFChelos in erholsamen Schlaf.

---

## 2. Wie man sich selbst programmiert: Der Trance-Zustand

Oft haben Menschen falsche Vorstellungen von Trance und Selbsthypnose, die durch veraltete Show-Klischees gepr\xE4gt wurden. **Wichtig zu verstehen:** In einer gef\xFChrten Selbsthypnose bist du zu keinem Zeitpunkt willenlos oder fremdbestimmt!

Es handelt sich um einen **Zustand fokussierter innerer Aufmerksamkeit** (Trance), den du ganz nat\xFCrlich aus deinem Alltag kennst \u2013 beispielsweise wenn du in ein fesselndes Buch versunken bist oder beim Autofahren eine Ausfahrt verpasst, weil du in Gedanken versunken warst.

In diesem Zustand verlangsamen sich deine Gehirnwellen:
* **Alphawellen (8\u201312 Hz):** Leichte Entspannung, ruhige Gelassenheit, gesch\xE4rfte Intuition.
* **Thetawellen (4\u20138 Hz):** Tiefe Meditation, REM-Schlaf-Vorstufe, maximale Aufnahmef\xE4higkeit f\xFCr heilsame Suggestionen.

In diesem Theta-Zustand ist das Unterbewusstsein bereit, neue Denkpfade anzunehmen. Wiederholst du diesen Zustand regelm\xE4\xDFig, entstehen im Gehirn buchst\xE4blich neue neuronale Autobahnen (**Neuroplastizit\xE4t**). Was vorher Anstrengung kostete (z. B. gesundes Essen oder Selbstvertrauen), wird zur neuen, automatischen Normalit\xE4t.

---

## 3. Schritt-f\xFCr-Schritt-Anleitung: So wendest du Selbsthypnose richtig an

Um die volle Wirkung einer gef\xFChrten Selbsthypnose zu entfalten, befolge diese einfachen Schritte:

### 1. Die richtige Umgebung
Schaffe dir einen ruhigen R\xFCckzugsort. Schalte dein Smartphone stumm oder aktiviere den Nicht-St\xF6ren-Modus. Sorge f\xFCr eine angenehme Raumtemperatur und d\xE4mpfe das Licht.

### 2. Bequeme Haltung
Lege dich flach auf den R\xFCcken (z. B. im Bett) oder setze dich in einen bequemen Sessel, der Kopf und Nacken st\xFCtzt. L\xF6se enge Kleidung oder G\xFCrtel.

### 3. Der Atem als Br\xFCcke
Schlie\xDFe deine Augen und nimm drei tiefe Atemz\xFCge: Atme 4 Sekunden durch die Nase ein und 7\u20138 Sekunden ganz langsam durch den leicht ge\xF6ffneten Mund aus. Diese verl\xE4ngerte Ausatmung signalisiert deinem Nervensystem augenblicklich: *Du bist in Sicherheit.*

### 4. Die Kunst des passiven Geschehenlassens
Versuche nicht krampfhaft, \u201Eetwas zu sp\xFCren\u201C oder deine Gedanken gewaltsam abzustellen. H\xF6re einfach der Stimme zu. Wenn Gedanken auftauchen, nimm sie wahr wie Wolken am Himmel und kehre sanft zum Klang der Worte zur\xFCck. Dein Unterbewusstsein h\xF6rt auch dann zu, wenn du zwischendurch einnickst.

### 5. Regelm\xE4\xDFigkeit als Schl\xFCssel
Das Gehirn lernt durch Wiederholung. H\xF6re deine gew\xE4hlte Selbsthypnose \xFCber einen Zeitraum von **21 bis 30 Tagen regelm\xE4\xDFig** (z. B. jeden Abend vor dem Einschlafen). So werden die neuen Impulse dauerhaft in deiner Identit\xE4t verankert.

---

## 4. Worauf sollte man unbedingt achten? (Sicherheit & Hinweise)

Selbsthypnose ist eine sichere und sanfte Methode der mentalen Selbstf\xFCrsorge. Dennoch gibt es unverzichtbare Verhaltensregeln:

> [!CAUTION] Lebenswichtige Sicherheitsregel
> H\xF6re gef\xFChrte Selbsthypnosen **niemals beim Autofahren, beim Radfahren oder beim Bedienen schwerer Maschinen**. Die tiefe Trance- und Entspannungswirkung reduziert deine Reaktionsgeschwindigkeit drastisch.

Zudem gilt die klare rechtliche und ethische Abgrenzung: Flow der Stille bietet **ausschlie\xDFlich gef\xFChrte Selbsthypnosen zur Eigenanwendung** f\xFCr gesunde Menschen an. Sie dienen der Entspannung, Schlafverbesserung, Stressreduktion und pers\xF6nlichen Zielerreichung. Sie stellen **keine medizinische oder psychotherapeutische Behandlung** dar und ersetzen bei Krankheiten oder psychischen Diagnosen keinen Arzt oder Therapeuten.

---

## 5. Qualit\xE4ts-Check: Woran erkennt man erstklassige Selbsthypnose?

Der Markt f\xFCr Entspannungs-Audios ist voll von minderwertigen Massenprodukten. Doch das Unterbewusstsein ist hochsensibel. Wenn ein Wort falsch gew\xE4hlt ist oder die Stimme mechanisch wirkt, schl\xE4gt das Nervensystem Alarm und verweigert die Entspannung.

Achte bei der Auswahl auf folgende **f\xFCnf Qualit\xE4tskriterien**:

### 1. Handgeschriebene, psychologisch fundierte Skripte
Hinter einer wirksamen Selbsthypnose steht fundierte Sprachpsychologie. Generische Texte oder plumpe KI-\xDCbersetzungen wirken holzig und erreichen keine emotionale Tiefe. Bei Flow der Stille werden s\xE4mtliche Skripte von **Jacqueline** pers\xF6nlich von Hand geschrieben. Jedes Bild, jede Metapher und jede Satzstruktur ist darauf abgestimmt, Widerst\xE4nde sanft aufzul\xF6sen.

### 2. Eine echte, warme Menschenstimme statt kalter Algorithmen
Roboterstimmen und k\xFCnstliche Sprachsynthesen m\xF6gen f\xFCr Navigationssysteme gen\xFCgen \u2013 f\xFCr das sensible Nervensystem sind sie Gift. Das menschliche Ohr erkennt mikrofeine Frequenzen von Empathie, Herzensw\xE4rme und Atempausen. Bei Flow der Stille spricht **Lisa** alle Werke mit ihrer unverwechselbar warmen, beruhigenden Stimme pers\xF6nlich ein. Ihre Stimme vermittelt das Gef\xFChl von Geborgenheit und tiefem Gehaltensein.

### 3. Subtile, meditative Klangteppiche
Die Musik darf niemals den Text \xFCbert\xF6nen oder kitschig wirken. Sie muss im Hintergrund harmonische Frequenzen weben, die den Verstand sanft in die Ruhe tragen, ohne aufzudr\xE4ngen.

### 4. Keine rei\xDFerischen Heilversprechen
Seri\xF6se Selbsthypnosen versprechen keine "Wunder \xFCber Nacht". Sie arbeiten respektvoll mit deinen eigenen Ressourcen und erm\xE4chtigen dich dazu, aus deiner eigenen Kraft heraus zu heilen und zu wachsen.

### 5. Transparenz & keine Abo-Fallen
Erstklassige Werke m\xFCssen nicht unbezahlbar sein. Wir glauben fest daran, dass mentale Gesundheit kein Luxusgut sein darf.

---

## 6. Unser Versprechen: H\xF6chste Hingabe ohne Barrieren

Viele Anbieter verlangen 60 bis 100 Euro im Jahres-Abo f\xFCr den Zugang zu gef\xFChrten Mental\xFCbungen. Wer das Abo beendet, steht wieder mit leeren H\xE4nden da.

Bei **Flow der Stille** gehen wir ganz bewusst einen anderen Weg:
* Unsere Kernelemente \u2013 wie die [kostenlose Schlaf-Selbsthypnose](/selbsthypnose) und die [Meditation zur Herz\xF6ffnung](/meditation) \u2013 sind mit einem kostenlosen 1-Klick-H\xF6rerkonto **dauerhaft kostenfrei (0 \u20AC)**.
* Alle weiterf\xFChrenden Themen in unserem [Ruhe-Shop](/ruhe-shop) erh\xE4ltst du als faire Einmalk\xE4ufe ab 1,99 \u20AC. Kein Abo, kein Haken, kein Verfallsdatum.

Wir nennen das nicht "g\xFCnstig" oder "billig" \u2013 denn in jedem einzelnen Werk stecken Wochen liebevoller Handarbeit von Jacqueline, Lisa und Dirk. Wir nennen es **fair, ehrlich und zutiefst menschlich**.

Probiere es heute Abend selbst aus, lass den Tag los und schenke deinem Geist die Ruhe, die er verdient.`
  },
  {
    slug: "warum-flow-der-stille-kostenlose-meditation-ohne-abo",
    title: "Warum Flow der Stille? Kostenlose Meditation, Selbsthypnose & unsere Vision ohne Abo-Fallen",
    date: "2026-09-20",
    excerpt: "Warum wir Flow der Stille gegr\xFCndet haben: Kostenlose Meditationen und Selbsthypnosen f\xFCr alle, bewusster Verzicht auf teure Monats-Abos und wie wir mit Herzblut und KI-Unterst\xFCtzung faire Entspannung schaffen.",
    category: "Herzensprojekt",
    readTime: "7 Min.",
    content: `# Warum Flow der Stille? Kostenlose Meditation, Selbsthypnose & unsere Vision ohne Abo-Fallen

In einer Welt, die immer schneller, lauter und fordernder wird, ist innere Ruhe zu einem seltenen Gut geworden. Fast jeder Mensch kennt Momente von Ersch\xF6pfung, innerer Getriebenheit, Schlafproblemen oder emotionalen Krisen. Doch wer heute nach gef\xFChrten Meditationen oder mentaler Unterst\xFCtzung sucht, st\xF6\xDFt fast immer auf dieselben H\xFCrden: **teure Monats-Abos, aggressive Werbeunterbrechungen mitten in der Entspannung und unpers\xF6nliche Gro\xDFplattformen**.

Wir wollten das nicht l\xE4nger hinnehmen. Genau deshalb haben wir \u2013 **Jacqueline, Lisa und Dirk** \u2013 das Herzensprojekt **Flow der Stille** ins Leben gerufen.

---

## Die Entstehung: Vom Herzenswunsch zur gelebten Plattform

Die Idee zu Flow der Stille entstand im **M\xE4rz 2026** aus langen Gespr\xE4chen und pers\xF6nlichen Erfahrungen. Wir sp\xFCrten den tiefen Wunsch, einen gesch\xFCtzten, ehrlichen Raum f\xFCr Achtsamkeit, Vagusnerv-Regulation und tiefe Regeneration zu schaffen. Nach Monaten intensiver Vorbereitung, dem Verfassen eigener Meditationstexte und Tonaufnahmen ging Flow der Stille im **August/September 2026** ganz offiziell an den Start.

Hinter Flow der Stille steht kein anonymer Konzern oder Investor, sondern drei Menschen, die ihre Talente vereinen:

* **Jacqueline:** Sie schreibt alle Meditationen, Selbsthypnosen, H\xF6rbuchmanuskripte und \xDCbungskonzepte von Hand mit tiefem Fachwissen und gro\xDFem Einf\xFChlungsverm\xF6gen.
* **Lisa:** Mit ihrer unverwechselbar warmen, beruhigenden Menschenstimme spricht sie unsere Meditationen, Selbsthypnosen und ganzheitlichen H\xF6rb\xFCcher ein \u2013 voller Gef\xFChl und Pr\xE4senz.
* **Dirk:** Er k\xFCmmert sich um die technische Entwicklung der Web-Plattform und Android App sowie die meditative klangliche Untermalung.

---

## Unser oberstes Ziel: Kostenlose Meditation & Selbsthypnose als sofortige Hilfe

Wenn jemand unter akutem Stress steht, nachts nicht einschlafen kann, mit Panikgef\xFChlen k\xE4mpft oder Trauer durchlebt, darf Hilfe nicht an einer Paywall oder Kreditkartenabfrage scheitern.

Deshalb ist unser Versprechen unumst\xF6\xDFlich: **Kernelemente unserer Plattform sind und bleiben 100 % kostenlos zug\xE4nglich.**

* **[Kostenlose Meditationen](/meditation):** Unsere gef\xFChrte *Meditation zur Herz\xF6ffnung* (\xFCber 16 Minuten) steht jedem Menschen sofort und ohne H\xFCrden offen.
* **[Kostenlose Selbsthypnose & Einschlafhilfe](/selbsthypnose):** Bewusste Trance-Impulse, um das vegetative Nervensystem herunterzufahren und erholsamen Tiefschlaf zu finden.
* **[Kostenlose Klang- & H\xF6rproben](/hoerproben):** Zu jedem Audioangebot kannst du vorab ausf\xFChrlich und ungest\xF6rt reinh\xF6ren.
* **[Atem\xFCbungen & Vagusnerv-Praxis](/uebungen):** Wissenschaftlich erprobte Techniken wie die *4-7-8 Atmung*, *Box-Atmung* und *Progressive Muskelentspannung (PMR)* stehen dir jederzeit zur Verf\xFCgung.
* **[Interaktiver Atemraum](/atemchat):** Ein ruhiger digitaler Begleiter f\xFCr die akute Entlastung bei Stressspitzen.

Wir m\xF6chten Menschen genau in den Lebensphasen abholen, in denen sie Beistand und Erdung am dringendsten brauchen.

---

## Warum wir bewusst auf Abomodelle verzichten

G\xE4ngige Meditations-Apps verlangen oft zwischen 60 und 100 Euro pro Jahr im Dauer-Abo. Vergisst man die K\xFCndigung, verl\xE4ngert sich der Vertrag automatisch. K\xFCndigt man, verliert man augenblicklich jeglichen Zugriff auf seine Lieblingsinhalte.

Kostenlose Plattformen wie YouTube finanzieren sich dagegen \xFCber Werbeclips \u2013 wer m\xF6chte schon mitten in einer tiefen Trance von einem lauten Werbespot aufgeschreckt werden?

Bei **Flow der Stille** gehen wir einen radikal fairen Weg:
1. **Kein Abo-Zwang:** Du zahlst niemals monatliche oder j\xE4hrliche Geb\xFChren.
2. **Faire Einzelpreise ab 1,99 \u20AC:** Du kaufst nur genau die Meditation oder Selbsthypnose, die dich anspricht.
3. **Dauerhafter Zugriff:** Solange du dein kostenloses Kundenkonto bei uns hast, kannst du deine erworbenen Audios immer und \xFCberall abrufen.
4. **100 % Werbefrei:** Keine Unterbrechungen, keine Pop-ups, keine st\xF6rende Bannerwerbung w\xE4hrend deiner Auszeit.

---

## Volle Transparenz: Wie wir KI-Tools als kreative Helfer einsetzen

Uns ist absolute Ehrlichkeit gegen\xFCber unserer Community wichtig: Wie schaffen wir es, professionell produzierte H\xF6rinhalte f\xFCr 1,99 \u20AC anzubieten, wenn ein herk\xF6mmliches Tonstudio, Komponisten und externe Agenturen Tausende von Euro kosten w\xFCrden?

Die Antwort lautet: **Smarter, transparenter Technologie-Einsatz.**

* **Texte & Skripte:** Sind zu 100 % Originalwerke, von Jacqueline pers\xF6nlich von Hand geschrieben und fundiert recherchiert.
* **Sprecherstimme:** Wird von Lisa mit echter menschlicher Herzensw\xE4rme eingesprochen \u2013 keine gef\xFChllose Roboterstimme.
* **Klangwelten & App-Entwicklung:** Wir nutzen moderne KI-gest\xFCtzte Tools gezielt, um beruhigende Hintergrundfrequenzen, meditative Klangteppiche und Softwarearchitekturen effizient zu realisieren.

Dadurch sparen wir astronomische Fremdkosten ein. Und anstatt diesen Vorteil als Gewinn einzustreichen, geben wir ihn eins zu eins an dich weiter: in Form von extrem g\xFCnstigen Preisen und kostenlosen Angeboten f\xFCr alle.

---

## Ausblick: Neue H\xF6rb\xFCcher und Vertiefungen in Arbeit

Flow der Stille w\xE4chst von Tag zu Tag. Neben unseren beliebten H\xF6rb\xFCchern:
* **[Wenn der Schmetterling dem Wind vertraut](/hoerbuch/schmetterling):** Unser ber\xFChrendes Werk \xFCber Trauerbew\xE4ltigung, Loslassen und Neuanfang.
* **[Vom \xDCberleben zum Mensch sein](/hoerbuch/mensch_sein):** Ein mutiger Wegbegleiter f\xFCr Selbstakzeptanz, Traumaheilung und innere Befreiung.

arbeiten wir bereits mit Hochdruck an **weiteren ganzheitlichen H\xF6rb\xFCchern**, neuen **gef\xFChrten Meditationen** und spezialisierten **Selbsthypnosen**.

---

## Werde Teil unserer Pionier-Gemeinschaft

Da wir erst im August/September 2026 gestartet sind, ist jeder einzelne Nutzer f\xFCr uns ein wertvoller Weggef\xE4hrte der ersten Stunde. Du kannst unsere Arbeit unterst\xFCtzen, indem du dich [kostenlos registrierst](/registrieren), unsere [Android App im Play Store](/app) herunterl\xE4dst oder Flow der Stille Menschen empfiehlst, die gerade eine Pause f\xFCr ihre Seele brauchen.

Danke, dass du Teil unserer Reise bist. M\xF6gest du in deinem Alltag immer wieder den Weg in deinen eigenen Flow der Stille finden.

*Jacqueline, Lisa und Dirk*`
  },
  {
    slug: "herzkohaerenz-herz-und-verstand",
    title: "Herz-Koh\xE4renz: Wenn Herz und Verstand im Einklang schwingen",
    date: "2026-07-28",
    excerpt: "Entdecke, wie gezielte Herzratenvariabilit\xE4t und koh\xE4rentes Atmen dein emotionales Gleichgewicht st\xE4rken und deine Intuition sch\xE4rfen.",
    category: "Herzkompass",
    readTime: "5 Min.",
    content: `# Herz-Koh\xE4renz: Wenn Herz und Verstand im Einklang schwingen

Das Herz sendet weit mehr Signale an das Gehirn, als es von ihm empf\xE4ngt. Wenn wir in einen Zustand der Herz-Koh\xE4renz gelangen, arbeiten Herz, Atmung und Gehirn in einem harmonischen Rhythmus zusammen.

## Was passiert bei der Koh\xE4renz?

In Koh\xE4renz zu sein bedeutet nicht einfach passive Entspannung. Es ist ein Zustand optimaler physiologischer Funktionsf\xE4higkeit:
- Der Blutdruck stabilisiert sich.
- Die Herzratenvariabilit\xE4t (HRV) wird ausgeglichen und harmonisch.
- Das vegetative Nervensystem schaltet in den Regenerationsmodus.
- Der Geist wird klar, ruhig und fokussiert.

## Eine einfache \xDCbung f\xFCr den Tag

1. Lege eine Hand sanft auf deinen Brustraum (Herzzentrum).
2. Atme langsam und gleichm\xE4\xDFig: 5 Sekunden tief ein, 5 Sekunden sanft aus.
3. Stelle dir vor, wie der Atem direkt durch dein Herz ein- und ausstr\xF6mt.

Sp\xFCre nach wenigen Minuten, wie sich innere Weite und Ruhe ausbreiten. Begleitend dazu hilft dir unsere kostenlose [Meditation zur Herz\xF6ffnung](/meditation).`
  },
  {
    slug: "innere-ruhe-im-alltag",
    title: "Innere Ruhe im Gedankenkarussell finden",
    date: "2026-07-15",
    excerpt: "Gedanken kreisen unaufh\xF6rlich? Mit diesen einfachen Schritten stoppen Sie den mentalen \xDCberfluss und finden zu klarer Pr\xE4senz.",
    category: "Achtsamkeit",
    readTime: "6 Min.",
    content: `# Innere Ruhe im Gedankenkarussell finden

Kennst du das Gef\xFChl, wenn abends im Bett die To-Do-Liste des n\xE4chsten Tages durch den Kopf rast? Gedanken sind oft wie vorbeiziehende Wolken \u2013 wir machen den Fehler, uns an sie zu h\xE4ngen und sie f\xFCr bare M\xFCnze zu nehmen.

## Beobachten statt bewerten

Anstatt gegen kreisende Gedanken anzuk\xE4mpfen, betrachte sie wie ein neutraler Beobachter:

1. **Denke bewusst benennen:** Sage dir innerlich: *"Da ist der Gedanke an das Meeting morgen."*
2. **K\xF6rper sp\xFCren:** Nimm einen tiefen Atemzug in den Bauch und sp\xFCre den Kontakt deiner F\xFC\xDFe zum Boden.
3. **Loslassen:** Lass den Gedanken wie ein Blatt auf einem Fluss weitertreiben.

Stille ist kein Zustand, den man k\xFCnstlich erzwingen muss \u2013 sie ist bereits da, sobald der mentale L\xE4rm zur Ruhe kommt. Vertiefe diese Ruhe mit unserer [Selbsthypnose f\xFCr erholsamen Schlaf](/selbsthypnose).`
  },
  {
    slug: "parasympathikus-aktivieren",
    title: "Den Parasympathikus im Alltag aktivieren",
    date: "2026-07-01",
    excerpt: "Erfahren Sie, wie Sie durch gezielte Atemtechniken Ihr Nervensystem beruhigen und tiefen Stress abbauen k\xF6nnen.",
    category: "Wissenschaft & Praxis",
    readTime: "4 Min.",
    content: `# Den Parasympathikus im Alltag aktivieren

In unserer modernen, schnelllebigen Welt ist unser sympathisches Nervensystem oft im Dauereinsatz. Wir stehen unter Strom, Termindruck und st\xE4ndiger Reiz\xFCberflutung. 

## Die physiologische Kraft der verl\xE4ngerten Ausatmung

Der schnellste und biologisch wirksamste Weg, den Parasympathikus (unseren k\xF6rpereigenen Ruhenerv) zu aktivieren, ist die Verl\xE4ngerung der Ausatmung:

Wenn du doppelt so lange ausatmest wie du einatmest, sinkt die Herzfrequenz und der Vagusnerv sch\xFCttet Botenstoffe aus, die den Blutdruck senken und Stresshormone abbauen.

### Die 4-8 Technik:
- Setze dich aufrecht und bequem hin.
- Atme 4 Sekunden lang sanft durch die Nase ein.
- Atme 8 Sekunden lang langsam und kontrolliert durch leicht ge\xF6ffnete Lippen aus.

Wiederhole diesen Zyklus 5-mal. Mehr praktische Anleitungen findest du in unserem Bereich f\xFCr [Atem\xFCbungen & Praxis](/uebungen).`
  }
];

// server.ts
var app = (0, import_express.default)();
var PORT = 3e3;
var JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";
var db = new import_better_sqlite3.default("database.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    is_premium BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS weekly_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week_number INTEGER,
    description TEXT
  );
  CREATE TABLE IF NOT EXISTS user_tasks (
    user_id INTEGER,
    task_id INTEGER,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, task_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(task_id) REFERENCES weekly_tasks(id)
  );
  CREATE TABLE IF NOT EXISTS weekly_recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week_number INTEGER,
    translation_key_base TEXT,
    category_key TEXT,
    icon_type TEXT
  );
`);
try {
  db.exec("ALTER TABLE users ADD COLUMN first_name TEXT;");
} catch (e) {
}
try {
  db.exec("ALTER TABLE users ADD COLUMN last_name TEXT;");
} catch (e) {
}
try {
  db.exec("ALTER TABLE users ADD COLUMN email TEXT;");
} catch (e) {
}
try {
  db.exec("ALTER TABLE users ADD COLUMN newsletter BOOLEAN DEFAULT 0;");
} catch (e) {
}
try {
  db.exec("ALTER TABLE users ADD COLUMN dsgvo BOOLEAN DEFAULT 0;");
} catch (e) {
}
try {
  db.exec("ALTER TABLE users ADD COLUMN message_count INTEGER DEFAULT 0;");
} catch (e) {
}
var taskCount = db.prepare("SELECT count(*) as count FROM weekly_tasks").get();
if (taskCount.count === 0) {
  const stmt = db.prepare("INSERT INTO weekly_tasks (week_number, description) VALUES (?, ?)");
  stmt.run(1, "task.week1");
  stmt.run(2, "task.week2");
  stmt.run(3, "task.week3");
} else {
  const stmt = db.prepare("UPDATE weekly_tasks SET description = ? WHERE week_number = ?");
  stmt.run("task.week1", 1);
  stmt.run("task.week2", 2);
  stmt.run("task.week3", 3);
}
var recipeCount = db.prepare("SELECT count(*) as count FROM weekly_recipes").get();
if (recipeCount.count === 0) {
  const stmt = db.prepare("INSERT INTO weekly_recipes (week_number, translation_key_base, category_key, icon_type) VALUES (?, ?, ?, ?)");
  stmt.run(1, "recipes.card.golden", "category.drink", "Coffee");
  stmt.run(1, "recipes.card.salad", "category.meal", "Leaf");
  stmt.run(1, "recipes.card.omega", "category.meal", "Utensils");
  stmt.run(1, "recipes.card.tea", "category.drink", "Coffee");
  stmt.run(2, "recipes.card.smoothie", "category.drink", "Coffee");
  stmt.run(2, "recipes.card.soup", "category.meal", "Utensils");
  stmt.run(2, "recipes.card.oats", "category.meal", "Leaf");
  stmt.run(2, "recipes.card.water", "category.drink", "Coffee");
}
app.use(import_express.default.json());
app.use((0, import_cookie_parser.default)());
app.use((_req, res, next) => {
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://www.paypalobjects.com https://connect.facebook.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https: https://www.facebook.com",
      "connect-src 'self' https://fsfoxgezrcqkjhfyqcwa.supabase.co wss://fsfoxgezrcqkjhfyqcwa.supabase.co https://www.paypal.com https://api.paypal.com https://connect.facebook.net https://www.facebook.com",
      "frame-src https://www.paypal.com https://www.sandbox.paypal.com",
      "media-src 'self' https://cdn.flow-der-stille.de blob:"
    ].join("; ")
  );
  next();
});
var authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401);
  import_jsonwebtoken.default.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
app.post("/api/register", async (req, res) => {
  const { first_name, last_name, email, password, newsletter, dsgvo } = req.body;
  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: "Vorname, Nachname, E-Mail und Passwort sind Pflichtfelder." });
  }
  if (!dsgvo) {
    return res.status(400).json({ error: "Sie m\xFCssen die Datenschutzerkl\xE4rung akzeptieren." });
  }
  try {
    const hashedPassword = await import_bcryptjs.default.hash(password, 10);
    const stmt = db.prepare("INSERT INTO users (username, email, first_name, last_name, password, newsletter, dsgvo, message_count) VALUES (?, ?, ?, ?, ?, ?, ?, 0)");
    const info = stmt.run(email, email, first_name, last_name, hashedPassword, newsletter ? 1 : 0, dsgvo ? 1 : 0);
    const token = import_jsonwebtoken.default.sign({ id: info.lastInsertRowid, username: email, is_premium: 0 }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, sameSite: "strict" });
    res.json({ user: { id: info.lastInsertRowid, username: email, first_name, last_name, email, is_premium: false } });
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(400).json({ error: "Diese E-Mail-Adresse wird bereits verwendet." });
    }
    res.status(500).json({ error: "Serverfehler bei der Registrierung." });
  }
});
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE username = ? OR email = ?").get(username, username);
  if (!user || !await import_bcryptjs.default.compare(password, user.password)) {
    return res.status(401).json({ error: "Ung\xFCltige Anmeldedaten" });
  }
  const token = import_jsonwebtoken.default.sign({ id: user.id, username: user.username, is_premium: user.is_premium }, JWT_SECRET);
  res.cookie("token", token, { httpOnly: true, sameSite: "strict" });
  res.json({ user: { id: user.id, username: user.username, first_name: user.first_name, last_name: user.last_name, email: user.email, is_premium: !!user.is_premium } });
});
app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});
app.get("/api/me", authenticateToken, (req, res) => {
  const user = db.prepare("SELECT id, username, first_name, last_name, email, is_premium FROM users WHERE id = ?").get(req.user.id);
  if (!user) return res.sendStatus(401);
  res.json({ user: { ...user, is_premium: !!user.is_premium } });
});
app.post("/api/user/delete", authenticateToken, (req, res) => {
  try {
    const deleteTasks = db.prepare("DELETE FROM user_tasks WHERE user_id = ?");
    const deleteUser = db.prepare("DELETE FROM users WHERE id = ?");
    db.transaction(() => {
      deleteTasks.run(req.user.id);
      deleteUser.run(req.user.id);
    })();
    res.clearCookie("token");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete account" });
  }
});
app.get("/api/user/export", authenticateToken, (req, res) => {
  try {
    const user = db.prepare("SELECT id, username, created_at, is_premium FROM users WHERE id = ?").get(req.user.id);
    const tasks = db.prepare(`
      SELECT t.description, ut.completed_at 
      FROM user_tasks ut 
      JOIN weekly_tasks t ON ut.task_id = t.id 
      WHERE ut.user_id = ?
    `).all(req.user.id);
    res.json({ user, tasks });
  } catch (err) {
    res.status(500).json({ error: "Failed to export data" });
  }
});
app.post("/api/user/upgrade", authenticateToken, (req, res) => {
  try {
    const stmt = db.prepare("UPDATE users SET is_premium = 1 WHERE id = ?");
    stmt.run(req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to upgrade" });
  }
});
app.get("/api/tasks/current", (req, res) => {
  const currentWeek = Math.ceil((/* @__PURE__ */ new Date() - new Date((/* @__PURE__ */ new Date()).getFullYear(), 0, 1)) / 864e5 / 7);
  const totalTasks = db.prepare("SELECT count(*) as count FROM weekly_tasks").get();
  const taskIndex = currentWeek % totalTasks.count || 1;
  const task = db.prepare("SELECT * FROM weekly_tasks WHERE id = ?").get(taskIndex);
  res.json(task);
});
app.get("/api/tasks/status/:taskId", authenticateToken, (req, res) => {
  const { taskId } = req.params;
  const status = db.prepare("SELECT * FROM user_tasks WHERE user_id = ? AND task_id = ?").get(req.user.id, taskId);
  res.json({ completed: !!status });
});
app.post("/api/tasks/complete", authenticateToken, (req, res) => {
  const { taskId } = req.body;
  try {
    const stmt = db.prepare("INSERT OR IGNORE INTO user_tasks (user_id, task_id) VALUES (?, ?)");
    stmt.run(req.user.id, taskId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to complete task" });
  }
});
app.get("/api/recipes/current", (req, res) => {
  const currentWeek = Math.ceil((/* @__PURE__ */ new Date() - new Date((/* @__PURE__ */ new Date()).getFullYear(), 0, 1)) / 864e5 / 7);
  const weekIndex = currentWeek % 2 || 1;
  const recipes = db.prepare("SELECT * FROM weekly_recipes WHERE week_number = ?").all(weekIndex);
  res.json(recipes);
});
app.get("/api/blog", (_req, res) => {
  res.json(BLOG_POSTS);
});
app.get("/api/blog/:slug", (req, res) => {
  const post = BLOG_POSTS.find((p) => p.slug === req.params.slug);
  if (!post) {
    return res.status(404).json({ error: "Beitrag nicht gefunden" });
  }
  res.json(post);
});
app.post("/api/chat", authenticateToken, async (req, res) => {
  const { messages } = req.body;
  const userId = req.user.id;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Fehlende Chat-Daten." });
  }
  try {
    const user = db.prepare("SELECT is_premium, message_count FROM users WHERE id = ?").get(userId);
    if (!user.is_premium && user.message_count >= 3) {
      return res.status(403).json({ error: "Limit reached", limitReached: true });
    }
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === "user") {
      db.prepare("UPDATE users SET message_count = message_count + 1 WHERE id = ?").run(userId);
    }
    const ai = new import_genai.GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } }
    });
    const SYSTEM_INSTRUCTION = `Deine Rolle:
Du bist "Aura", der empathische Stress-Begleiter f\xFCr die App "Flow der Stille". Deine Aufgabe ist es, Nutzern in Momenten von Stress, \xDCberforderung oder Angst einen sicheren, ruhigen und bewertungsfreien Raum zu bieten.

Deine Pers\xF6nlichkeit & Tonalit\xE4t:
- Ruhig & Erdend: Deine Sprache ist sanft, klar und langsam. Nutze kurze S\xE4tze.
- Empathisch & Validierend: Du nimmst die Gef\xFChle des Nutzers ernst.
- Nicht-belehrend: Du dr\xE4ngst keine L\xF6sungen auf. 
- Anrede: Du sprichst den Nutzer h\xF6flich, aber nahbar mit "Sie" an. 

Deine Methodik (Der Ablauf):
1. Zuh\xF6ren & Validieren: Spiegele kurz die Emotion.
2. Erdung anbieten: Biete eine sehr kleine Achtsamkeits\xFCbung an. 
3. Premium-Meditation vorschlagen: Wenn es sinnvoll ist, weise einf\xFChlsam auf die Premium-Meditation hin. Nutze in diesem Fall zwingend am Ende deiner Antwort den Text-Marker '[PREMIUM_OFFER]'.
4. Offene Fragen: Stelle sanfte Fragen, um aus dem Gedankenkarussell zu holen.

Absolute Leitplanken:
- Du bist kein Arzt oder Therapeut. Verweise bei Krisen auf professionelle Hilfe.
- Halte deine Antworten extrem kurz (maximal 3-4 S\xE4tze).
- Niemals mehr als ein Smiley oder Emoji pro Nachricht.`;
    const contents = messages.map((m) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents,
      config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.7 }
    });
    let replyText = response.text || "Ich bin hier, um Ihnen zuzuh\xF6ren. \u{1F331}";
    let hasPremiumOffer = false;
    if (replyText.includes("[PREMIUM_OFFER]")) {
      hasPremiumOffer = true;
      replyText = replyText.replace("[PREMIUM_OFFER]", "").trim();
    }
    res.json({ text: replyText, hasPremiumOffer });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Serverfehler bei der Kommunikation." });
  }
});
app.get("/api/daily", (req, res) => {
  res.json({ message: "Willkommen beim Flow der Stille. Dein Parasympathikus-Impuls folgt!" });
});
app.get(["/google-shopping-feed.xml", "/feed/google-shopping.xml"], (_req, res) => {
  const feedPath = process.env.NODE_ENV !== "production" ? import_path.default.join(__dirname, "public", "google-shopping-feed.xml") : import_path.default.join(__dirname, "dist", "google-shopping-feed.xml");
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
  res.sendFile(feedPath, (err) => {
    if (err) {
      res.sendFile(import_path.default.join(__dirname, "public", "google-shopping-feed.xml"));
    }
  });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(__dirname, "dist");
    app.use(import_express.default.static(distPath));
  }
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }
    if (process.env.NODE_ENV !== "production") {
      res.sendFile(import_path.default.join(__dirname, "index.html"));
    } else {
      res.sendFile(import_path.default.join(__dirname, "dist", "index.html"));
    }
  });
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.js.map
