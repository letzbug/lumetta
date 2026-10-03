// ─────────────────────────────────────────────────────────────
// DEMO / DEVELOPMENT FIXTURES – quality benchmarks, not templates.
// Five very different story forms for the five benchmark requests.
// Each is hand-written natively in German for listening, and keeps
// the pipeline's intermediate artefacts so the engine stays
// inspectable without a live model.
// ─────────────────────────────────────────────────────────────
import type { CoverScene, LanguageCode } from '../../../types/story';
import type { GuidanceFamily } from '../../../config/catalog';
import type { Architecture, Candidate, CharacterSheet, Interpretation, StoryFingerprint } from '../schemas';

export interface DemoFixture {
  id: string;
  benchmark: string;
  language: LanguageCode;
  age: number;
  /** all patterns must match the normalised request */
  match: RegExp[];
  defaultHero: string;
  title: string;
  summary: string;
  text: string;
  storyForm: string;
  mood: string[];
  cover: Omit<CoverScene, 'seed'>;
  /** guidance families this story offers a natural, unforced moment for */
  naturalGuidance: Partial<Record<GuidanceFamily, string>>;
  interpretation: Interpretation;
  candidates: Candidate[];
  chosen: string;
  architecture: Pick<Architecture, 'corePremise' | 'storyForm' | 'curiosityMechanism' | 'endingDirection'>;
  characters: Array<Pick<CharacterSheet, 'name' | 'personality' | 'speechStyle' | 'unexpectedTrait'>>;
  fingerprint: StoryFingerprint;
}

const c = (id: string, premise: string, centralDevice: string, scale: Candidate['scale'], storyEnergy: string[]): Candidate => ({
  id, premise, centralDevice, scale, storyEnergy, whyInteresting: '', characterPotential: '', distinctiveElement: '', possibleWeakness: '',
});

const interp = (p: Partial<Interpretation> & Pick<Interpretation, 'explicitRequest' | 'mostInterestingPotential' | 'naturalScale'>): Interpretation => ({
  coreElements: [], requestedCharacters: [], requestedSetting: null, requestedEvents: [], nonNegotiables: [], creativeFreedom: [], specialRules: [], possibleStoryEnergy: [], constraints: [], ...p,
});

export const FIXTURES: DemoFixture[] = [
  // ── A · age 5 · "Bagger" · realistic everyday story with a refrain ──
  {
    id: 'bagger',
    benchmark: 'A – Alter 5 – „Bagger“',
    language: 'de',
    age: 5,
    match: [/\b(bagger|digger|excavat|pelleteuse|baustelle|baufahrzeug)/],
    defaultHero: 'Mika',
    title: 'Was wird das wohl?',
    summary: 'Eine Woche am Fenster, ein gelber Bagger, ein immer größeres Loch – und endlich die Antwort.',
    storyForm: 'realistische Alltagsgeschichte mit Refrain',
    mood: ['neugierig', 'gemütlich', 'lustig'],
    cover: { setting: 'forest', creature: 'otter', mood: 'discovery', subject: 'digger' },
    naturalGuidance: { together: 'Mika fasst sich am Bauzaun ein Herz und fragt den Baggerfahrer selbst.', contact: 'Ein erstes Gespräch mit dem Mann, der jeden Morgen winkt.' },
    interpretation: interp({
      explicitRequest: 'Bagger',
      coreElements: ['Bagger'],
      nonNegotiables: ['Bagger'],
      creativeFreedom: ['alles andere'],
      mostInterestingPotential: 'Für ein fünfjähriges Kind ist ein echter Bagger schon Wunder genug: graben, heben, das Geräusch, die Frage, was entsteht.',
      naturalScale: 'intimate',
      possibleStoryEnergy: ['neugierig', 'lustig'],
    }),
    candidates: [
      c('c1', 'Ein Kind beobachtet eine Woche lang vom Fenster aus einen Bagger und rät jeden Tag, was das Loch wird.', 'Tägliche Wiederholung mit wachsender Frage', 'intimate', ['neugierig', 'lustig']),
      c('c2', 'Ein kleiner Bagger auf dem Spielplatz verliert seine Schaufel im Sandkasten.', 'Spielzeug-Missgeschick', 'small', ['lustig']),
      c('c3', 'Der Bagger muss nach einem Sturm einen umgestürzten Baum von der Straße holen.', 'Alltagsrettung', 'small', ['spannend']),
      c('c4', 'Ein Bagger, der lieber tanzt als gräbt.', 'Absurde Vermenschlichung', 'small', ['albern']),
    ],
    chosen: 'c1',
    architecture: {
      corePremise: 'Was entsteht in dem Loch gegenüber?',
      storyForm: 'realistische Alltagsgeschichte mit Refrain',
      curiosityMechanism: 'Die wiederkehrende Frage „Was wird das wohl?“ und immer verrücktere Vermutungen; dann ein stiller Morgen ohne BRRRMMM.',
      endingDirection: 'Die Antwort ist klein und echt (ein Haus mit Wasserrohren) – und ein neues gemeinsames Hup-Zeichen.',
    },
    characters: [{ name: 'Der Mann mit der orangen Mütze', personality: 'ruhig, freundlich, trocken humorvoll', speechStyle: 'kurze Sätze, denkt erst nach', unexpectedTrait: 'nimmt die Elefanten-Frage völlig ernst' }],
    fingerprint: { genre: 'realistische Alltagsgeschichte', scale: 'intimate', settingType: 'Baustelle vor dem Fenster', centralDevice: 'Refrain-Frage über eine Woche', characterTypes: ['Baggerfahrer'], structureType: 'Wochentage-Wiederholung', endingStyle: 'kleine echte Antwort + Ritual', majorMotifs: ['Bagger', 'Loch', 'Hupe'] },
    text: `Jeden Morgen um sieben Uhr macht es draußen: BRRRMMM.

{{HERO}} rennt zum Fenster. Auf der Baustelle gegenüber steht der Bagger. Er ist gelb, er ist riesig, und seine Schaufel hat Zähne. Die Schaufel geht hoch. Und runter. Und wieder hoch.

Im Bagger sitzt ein Mann mit einer orangen Mütze. Er trinkt aus einem großen Becher. Und wenn er {{HERO}} am Fenster sieht, hebt er den Becher hoch. Wie zum Anstoßen.

Am Montag gräbt der Bagger ein Loch.
„Was wird das wohl?“, fragt {{HERO}}.
Vielleicht ein Schwimmbad. Für Elefanten.

Am Dienstag ist das Loch größer.
„Was wird das wohl?“
Vielleicht ein Tunnel. Ganz tief nach unten, wo die Regenwürmer wohnen.

Am Mittwoch ist das Loch so groß, dass ein ganzer Bus hineinpassen würde.
„Was wird das wohl?“
Vielleicht ein Versteck für Riesen. Riesen müssen sich ja auch mal verstecken. Zum Beispiel vor dem Haarewaschen.

Am Donnerstag passiert etwas Komisches. Es ist sieben Uhr. Und draußen ist es still.
Kein Brummen. Gar nichts.
{{HERO}} drückt die Nase an die Scheibe. Der Bagger steht da. Die Schaufel liegt auf dem Boden. Und der Mann mit der orangen Mütze ist nicht da.
Ist der Bagger kaputt? Ist er müde? Hat er Bauchweh vom vielen Erde-Essen?

{{HERO}} wartet. Und wartet. Fünf Minuten sind sehr lang, wenn man wartet.

Dann biegt ein Lastwagen um die Ecke. Hinten drauf liegen lange graue Rohre, so dick wie Baumstämme. Und hinter dem Lastwagen kommt die orange Mütze. Mit Becher.
Der Mann klettert in den Bagger. BRRRMMM!
Der Bagger hebt die Rohre hoch, eins nach dem anderen, ganz langsam, ganz vorsichtig. Und legt sie ins Loch. Wie jemand, der Spaghetti in einen Topf legt. Nur viel, viel größer.

Am Nachmittag bleibt {{HERO}} am Bauzaun stehen. Der Mann mit der orangen Mütze kommt herüber und lehnt sich an den Zaun.
„Du bist doch das Fenster-Kind“, sagt er. „Das jeden Morgen zuschaut.“
{{HERO}} nickt. Und dann fragt {{HERO}} endlich das, was die ganze Woche im Bauch gekribbelt hat.
„Was wird das?“
„Ein Haus“, sagt der Mann. „Und die Rohre bringen später das Wasser hinein. Damit die Kinder, die hier mal wohnen, baden können.“
„Nicht die Elefanten?“
Der Mann denkt lange nach. „Nein“, sagt er dann. „Aber vielleicht eine Badeente.“

Am nächsten Morgen um sieben Uhr macht es draußen: BRRRMMM.
{{HERO}} rennt zum Fenster. Die orange Mütze winkt. Und dann drückt der Mann auf die Hupe. Zweimal.
HUP. HUP.
Das ist jetzt ihr Zeichen.

„Was wird das wohl?“, flüstert {{HERO}} und muss lachen. Denn diesmal weiß {{HERO}} es schon.
Ein Haus. Mit Badewanne. Und vielleicht mit einer Ente.`,
  },

  // ── B · age 7 · "Fantasialand + Magie" · magical comedy with a rule ──
  {
    id: 'park-magic',
    benchmark: 'B – Alter 7 – „Fantasialand + Magie“',
    language: 'de',
    age: 7,
    match: [/(fantasialand|freizeitpark|themenpark|theme ?park|parc d.?attraction|achterbahn|karussell|kirmes)/],
    defaultHero: 'Juna',
    title: 'Lotti zaubert rückwärts',
    summary: 'Eine Zauberlehrling-Vorstellung im Freizeitpark geht schief – und nur einer im Publikum hat genau zugehört.',
    storyForm: 'magische Situationskomik mit Regel-Rätsel',
    mood: ['lustig', 'magisch', 'turbulent'],
    cover: { setting: 'forest', creature: 'otter', mood: 'magical', subject: 'park' },
    naturalGuidance: { mistakes: 'Lottis verpatzter Zauber wird gemeinsam repariert – niemand schimpft.', together: 'Den Rückwärts-Spruch schaffen Lotti und das Kind nur zusammen.' },
    interpretation: interp({
      explicitRequest: 'Fantasialand + Magie',
      coreElements: ['Freizeitpark', 'Magie'],
      nonNegotiables: ['Freizeitpark mit Fahrgeschäften', 'Zauberei'],
      creativeFreedom: ['Figuren', 'Art der Magie'],
      mostInterestingPotential: 'In einem Freizeitpark ist schon alles „wie Zauberei“ – was passiert, wenn echte Magie die Fahrgeschäfte durcheinanderbringt?',
      naturalScale: 'medium',
      possibleStoryEnergy: ['lustig', 'turbulent'],
      constraints: ['Echter Parkname als Wunsch des Kindes: keine geschützten Figuren oder Fahrgeschäfte nachbilden – der Park bleibt namenlos.'],
    }),
    candidates: [
      c('c1', 'Eine Zauberlehrling-Show geht schief und vertauscht alle Fahrgeschäfte; das Kind entschlüsselt die Regel, wie man Zauber rückgängig macht.', 'Regel-Rätsel: Zauber rückwärts aufknoten', 'medium', ['lustig', 'turbulent']),
      c('c2', 'Nach Parkschluss erwachen die Karussellpferde und wollen einmal selbst Fahrgäste sein.', 'Rollentausch', 'small', ['magisch', 'ruhig']),
      c('c3', 'Ein Kind gewinnt an einer Losbude einen Zauberstab, der nur in der Warteschlange funktioniert.', 'Absurde Einschränkung', 'small', ['albern']),
      c('c4', 'Ein Geist aus der Geisterbahn hat Angst vor Menschen und sucht einen Job, bei dem niemand erschrickt.', 'Figur gegen ihre Rolle', 'small', ['warm', 'lustig']),
    ],
    chosen: 'c1',
    architecture: {
      corePremise: 'Ein Zauber ist wie ein Schnürsenkel – was man zubindet, kann man aufziehen, wenn man weiß, wie herum.',
      storyForm: 'magische Situationskomik mit Regel-Rätsel',
      curiosityMechanism: 'Die Regel wird früh beiläufig genannt; das Chaos eskaliert; das Kind erinnert sich.',
      endingDirection: 'Der ursprüngliche Papiervogel-Zauber gelingt am Ende dem Kind – leicht schief, sehr konkret.',
    },
    characters: [{ name: 'Lotti', personality: 'übermütig, dann panisch, nie wirklich verzweifelt', speechStyle: 'große Worte, verbessert sich selbst („Na gut. Ein kleiner Grund.“)', unexpectedTrait: 'kann schwierige Wörter nicht aussprechen, obwohl sie Zauberin ist' }],
    fingerprint: { genre: 'magische Situationskomik', scale: 'medium', settingType: 'Freizeitpark', centralDevice: 'Zauber rückwärts aufheben', characterTypes: ['Zauberlehrling', 'Publikum'], structureType: 'Eskalation + Regelrätsel', endingStyle: 'gelungener Ur-Zauber', majorMotifs: ['Papiervogel', 'Achterbahn', 'Rückwärts-Spruch'] },
    text: `Die letzte Vorstellung im Zaubertheater des Freizeitparks begann um fünf Uhr, und {{HERO}} saß in der ersten Reihe. So nah an der Bühne, dass man den Staub auf dem roten Vorhang sehen konnte.

Der Vorhang ging auf. Aber statt des großen Zauberers Balduin stand da ein Mädchen, vielleicht zwölf Jahre alt, in einem Umhang, der ihr mindestens drei Nummern zu groß war.
„Meine Damen und Herren“, sagte sie und räusperte sich. „Der große Balduin hat leider Schnupfen. Ich bin Lotti, seine Lehrlingin. Die Vorstellung findet trotzdem statt. Höchstwahrscheinlich.“

Auf dem Tisch neben ihr lag ein Vogel aus Papier.
„Zaubersprüche“, erklärte Lotti, „sind wie Schnürsenkel. Was man zubindet, kann man auch wieder aufziehen. Man muss nur wissen, wie herum.“
Dann drehte sie den Zauberstab dreimal nach links und rief: „Flatter-Flitter-Fliegewind!“

Der Papiervogel blieb liegen.
Dafür hörte man von draußen ein Kreischen. Kein ängstliches Kreischen. Eher ein sehr, sehr verwundertes.

Alle liefen hinaus. Die große Achterbahn, die schnellste im ganzen Park, kroch so langsam über die Schienen, dass die Leute im Wagen Zeit hatten, sich gegenseitig Kekse anzubieten. Das gemütliche Kinderkarussell dagegen drehte sich so schnell, dass die Holzpferde wieherten. Und die Teetassen drehten sich rückwärts und spielten dabei Musik. Ebenfalls rückwärts.

„Okay“, sagte Lotti. „Kein Grund zur Panik.“ Sie schaute zur Achterbahn hinauf. „Na gut. Ein kleiner Grund.“

Sie versuchte es mit „Flitter-Flatter-Fliegewind“. Da fingen alle Mülleimer an zu singen.
Sie versuchte es mit „Fliegewind-Flatter-Flitter“. Da wuchs dem Eisverkäufer ein Schnurrbart aus Sahne.

{{HERO}} hatte die ganze Zeit nachgedacht. Über Schnürsenkel. Was man zubindet, kann man wieder aufziehen. Man muss nur wissen, wie herum.
„Lotti“, sagte {{HERO}}. „Du hast den Stab nach links gedreht. Dreimal.“
Lotti blinzelte. „Ja. Und?“
„Dann musst du ihn jetzt nach rechts drehen. Und den Spruch rückwärts sagen. Nicht die Wörter vertauschen. Richtig rückwärts. Buchstabe für Buchstabe.“

Lotti wurde blass. „Rückwärts? Weißt du, wie schwer das ist? Ich kann ja nicht mal vorwärts Fliegewind sagen, ohne zu stolpern.“

Also nahm {{HERO}} das Programmheft und einen Stift und schrieb den Zauberspruch auf. Und darunter, Buchstabe für Buchstabe, das Ganze rückwärts. Es sah aus wie eine Sprache von einem anderen Stern.
„Dniwegeilf-rettilf-rettalf“, las Lotti und verzog das Gesicht. „Das klingt wie Niesen.“
„Dann niesen wir eben“, sagte {{HERO}}. „Zusammen?“

Sie stellten sich nebeneinander vor das Theater. Lotti drehte den Stab nach rechts, einmal, zweimal, dreimal, und beide riefen, so laut sie konnten: „Dniwegeilf-rettilf-rettalf!“

Es machte kein Puff und kein Peng. Es wurde nur ganz kurz still. Dann sauste die Achterbahn wieder los, und die Leute kreischten, diesmal richtig. Die Holzpferde drehten wieder gemütlich ihre Runden, und die Teetassen spielten ihre Musik vorwärts.
Die Mülleimer allerdings sangen weiter, und der Eisverkäufer behielt seinen Sahne-Schnurrbart. Das waren ja auch andere Sprüche gewesen. Lotti versprach, sich morgen darum zu kümmern. Vielleicht.

Als der Park schloss, gingen die beiden noch einmal zurück auf die leere Bühne. Der Papiervogel lag immer noch da. Lotti hielt {{HERO}} den Zauberstab hin. „Willst du?“
{{HERO}} drehte den Stab dreimal nach links. „Flatter-Flitter-Fliegewind.“
Der Papiervogel zuckte. Hob einen Flügel. Dann den anderen. Und flog, ziemlich schief, aber er flog, über die Sitzreihen, zur Tür hinaus und hinauf bis auf die allerhöchste Spitze der Achterbahn.
„Nicht schlecht“, sagte Lotti. „Für den ersten Tag.“

Dort oben sitzt er immer noch. Falls jemand nachsehen möchte.`,
  },

  // ── C · age 8 · "Dinosaurier im Weltraum" · science-fiction adventure ──
  {
    id: 'dino-space',
    benchmark: 'C – Alter 8 – „Dinosaurier im Weltraum“',
    language: 'de',
    age: 8,
    match: [/(dino|saurier|t-?rex|dinosaure)/, /(weltraum|weltall|space|espace|raumschiff|rakete|planet|stern|astronaut|mond|moon|fusee|vaisseau)/],
    defaultHero: 'Noa',
    title: 'Funkspruch aus der Kreidezeit',
    summary: 'Ein Raumschiff voller Dinosaurier kehrt nach 66 Millionen Jahren zurück – und braucht jemanden, der ihm am Funkgerät den Weg zeigt.',
    storyForm: 'Science-Fiction-Abenteuer mit Funk-Dialog',
    mood: ['spannend', 'lustig', 'staunend'],
    cover: { setting: 'space', creature: 'dino', mood: 'adventure' },
    naturalGuidance: {
      contact: 'Das Kind zögert, einem Fremden am Funkgerät zu antworten – und drückt dann doch den Knopf. Danach trägt das Gespräch die ganze Landung.',
      courage: 'Die Landung gelingt nur, weil das Kind sich traut, Anweisungen zu geben.',
      together: 'Die Crew landet nur mit den Beschreibungen vom Boden.',
    },
    interpretation: interp({
      explicitRequest: 'Dinosaurier im Weltraum',
      coreElements: ['Dinosaurier', 'Weltraum'],
      nonNegotiables: ['Dinosaurier', 'Weltraum'],
      creativeFreedom: ['warum Dinosaurier im All sind', 'Rolle des Kindes'],
      mostInterestingPotential: 'Dinosaurier sind ausgestorben – außer, einige sind rechtzeitig ins All entkommen. Was finden sie bei der Rückkehr vor?',
      naturalScale: 'expansive',
      possibleStoryEnergy: ['spannend', 'lustig', 'staunend'],
    }),
    candidates: [
      c('c1', 'Dinosaurier flohen vor dem Asteroiden ins All; nach 66 Millionen Jahren kehren sie zurück, ihre Karte stimmt nicht mehr, ein Kind lotst sie per Funk zur Landung.', 'Veraltete Karte + Funkdialog', 'expansive', ['spannend', 'lustig']),
      c('c2', 'Ein Kind findet heraus, dass Vögel Dinosaurier sind, und plant eine Weltraummission für Hühner.', 'Wissenschaftliche Pointe als Komödie', 'medium', ['albern', 'neugierig']),
      c('c3', 'Auf einer Raumstation schlüpft ein Dinosaurierei, das niemand bestellt hat.', 'Unerwarteter Passagier', 'medium', ['lustig']),
      c('c4', 'Ein Paläontologen-Roboter gräbt auf dem Mars Knochen aus, die eindeutig von einem Stegosaurus stammen.', 'Rätsel aus Indizien', 'expansive', ['geheimnisvoll']),
    ],
    chosen: 'c1',
    architecture: {
      corePremise: 'Die Dinosaurier sind nicht ausgestorben, sie waren nur weg. Jetzt kommen sie mit einer 66 Millionen Jahre alten Karte zurück.',
      storyForm: 'Science-Fiction-Abenteuer mit Funk-Dialog',
      curiosityMechanism: 'Ein rauschendes Flohmarkt-Funkgerät spricht plötzlich; Missverständnisse beim Lotsen; die Amsel am Morgen.',
      endingDirection: 'Die Crew erkennt in der Amsel ihre Verwandten (Vögel sind Dinosaurier) – sie bleiben nicht, aber sie hören zu.',
    },
    characters: [
      { name: 'Kapitänin Raxa (Triceratops)', personality: 'streng, würdevoll, heimlich gerührt', speechStyle: 'betont jedes Wort, als hätte es drei Hörner', unexpectedTrait: 'sagt am Ende den leisesten Satz der Geschichte' },
      { name: 'Bolt (Velociraptor, Navigator)', personality: 'nervös, schnell, aufmerksam', speechStyle: 'sagt alles zweimal', unexpectedTrait: 'erkennt als Erster die Amsel – und sagt es nur einmal' },
      { name: 'Gunda (T-Rex, Pilotin)', personality: 'gelassen, hungrig, pragmatisch', speechStyle: 'tief, knapp, fragt, ob Dinge essbar sind', unexpectedTrait: 'steuert mit der Nase, weil die Arme zu kurz sind' },
    ],
    fingerprint: { genre: 'Science-Fiction-Abenteuer', scale: 'expansive', settingType: 'Kinderzimmer + Stoppelfeld + Raumschiff', centralDevice: 'Funk-Lotsen mit veralteter Karte', characterTypes: ['Dinosaurier-Crew'], structureType: 'Kontakt → Navigation → Landung → Erkenntnis', endingStyle: 'stille wissenschaftliche Pointe', majorMotifs: ['Funkgerät', 'Amsel', 'Kontinentaldrift'] },
    text: `Das alte Funkgerät hatte {{HERO}} auf dem Flohmarkt gekauft, für zwei Euro, weil es so schön rauschte. Meistens tat es auch nichts anderes. Bis zu dem Abend, an dem es plötzlich sprach.

„Hier spricht Kapitänin Raxa vom Raumschiff Großer Farn. Erde, bitte melden. Wir sind …“ Ein Rascheln. „Wir sind sechsundsechzig Millionen Jahre zu spät. Erde, bitte melden.“

{{HERO}} starrte das Funkgerät an. Neben dem Lautsprecher gab es einen roten Knopf. Wer antworten wollte, musste ihn drücken. Aber wer antwortet schon jemandem, der sechsundsechzig Millionen Jahre zu spät ist?
„Erde?“, fragte die Stimme noch einmal, jetzt etwas leiser. Fast unsicher.
{{HERO}} drückte den Knopf. „Hallo? Hier ist {{HERO}}. Aus dem Kinderzimmer.“

Am anderen Ende brach Jubel aus. Ein Brüllen, ein Kreischen und ein dumpfes Klopfen, als würde jemand mit dem Schwanz gegen eine Metallwand schlagen.

So erfuhr {{HERO}} die Geschichte. Damals, kurz bevor der große Asteroid kam, hatten ein paar besonders kluge Dinosaurier ihn am Himmel entdeckt. Sie hatten ein Schiff gebaut und waren losgeflogen. Und jetzt kamen sie zurück, um zu Hause zu landen.
„Es gibt nur ein Problem“, sagte Kapitänin Raxa. Sie war ein Triceratops, das hörte man daran, wie sie jedes Wort betonte. Als hätte es drei Hörner. „Unsere Karte stimmt nicht mehr.“

„Wo der große Sumpf sein sollte, ist jetzt etwas Graues mit Lichtern!“, rief eine schnelle, hohe Stimme. Das war Bolt, der Navigator, ein kleiner Velociraptor, der grundsätzlich alles zweimal sagte. „Etwas Graues mit Lichtern! Und die Kontinente sind verrutscht. Verrutscht!“
„Kontinente verrutschen eben“, brummte eine tiefe Stimme. „Das tun sie gern, wenn man nicht hinsieht.“ Das war Gunda, die Pilotin, ein Tyrannosaurus. Sie steuerte mit der Nase, weil ihre Arme zu kurz für die Knöpfe waren.

Sie brauchten einen Landeplatz. Groß, flach, leer, und am besten ohne Menschen, die schreiend davonrennen.
{{HERO}} lief zum Fenster. Hinter den Gärten lag das Stoppelfeld von Bauer Kremer. Riesig. Flach. Nachts völlig leer.
„Ich weiß einen Platz“, sagte {{HERO}} ins Funkgerät. „Aber ihr müsst genau zuhören.“

Das war schwieriger als gedacht.
„Seht ihr einen spitzen Turm mit einer Uhr?“
„Ist der essbar?“, fragte Gunda.
„Nein! Fliegt daran vorbei. Dann kommt eine Straße mit orangen Lampen.“
„Orange Lampen! Orange Lampen!“, rief Bolt. „Hunderte! Welche?“
„Die, die zu einem großen dunklen Viereck führen. Das ist das Feld.“
Eine Pause. Dann Raxa: „Gunda. Nase nach unten. Vorsichtig.“

Zuerst sah {{HERO}} nur einen Stern, der zu tief flog. Dann einen riesigen Schatten, der die anderen Sterne verdeckte. Das Schiff setzte so sanft auf dem Stoppelfeld auf wie ein fallendes Blatt. Nur dass dieses Blatt so groß war wie eine Turnhalle.

{{HERO}} schlich im Schlafanzug durch den Garten, durch das Loch in der Hecke, bis zum Feld. Eine Luke öffnete sich. Heraus kamen Raxa, Bolt und Gunda und schnupperten an der Nachtluft.
„Es riecht anders“, sagte Raxa.
„Anders! Anders!“, sagte Bolt.

Sie standen da, bis der Himmel hell wurde. Und dann, in der Hecke hinter {{HERO}}, fing eine Amsel an zu singen.
Bolt erstarrte. Er legte den Kopf schief. Er sah sich die Amsel genau an: ihre Füße, ihre Augen, die Art, wie sie ruckartig den Kopf drehte.
„Kapitänin“, sagte er, und diesmal sagte er es nur einmal. „Das ist eine von uns.“

Raxa trat ganz nah an die Hecke. Die Amsel sang einfach weiter, als hätte sie auf genau diesen Morgen gewartet.
„Sie sind nicht alle verschwunden“, sagte Raxa leise. „Sie haben nur angefangen zu fliegen.“

Die Dinosaurier blieben nicht. Die Erde sei inzwischen ziemlich voll, sagte Raxa, und das sei auch gut so. Aber sie wollten wiederkommen. Ab und zu. Um zuzuhören.

Seitdem rauscht das Funkgerät wieder nur. Doch jeden Morgen, wenn die Amsel in der Hecke singt, macht {{HERO}} das Fenster auf. Für den Fall, dass da oben jemand mithört.`,
  },

  // ── D · age 9 · "Meine Katze kann nur dienstags sprechen" · character comedy on a rule ──
  {
    id: 'tuesday-cat',
    benchmark: 'D – Alter 9 – „Meine Katze kann nur dienstags sprechen“',
    language: 'de',
    age: 9,
    match: [/(katze|kater|\bcat\b|\bchat\b|mieze)/, /(dienstag|tuesday|mardi|sprech|spricht|reden|redet|talk|parl)/],
    defaultHero: 'Ida',
    title: 'Mathilda hat bis Mitternacht',
    summary: 'Die Katze spricht nur dienstags – und ausgerechnet heute hat sie keine Beschwerden, sondern ein Geheimnis.',
    storyForm: 'figurengetriebene Komödie mit Zeitlimit und Informationsrätsel',
    mood: ['witzig', 'geheimnisvoll', 'warm'],
    cover: { setting: 'forest', creature: 'otter', mood: 'calm', subject: 'cat' },
    naturalGuidance: { together: 'Das Kind muss einen Erwachsenen überzeugen, ohne „die Katze hat es gesagt“ sagen zu können.', courage: 'Das Kind klopft kurz vor Mitternacht an die Schlafzimmertür.' },
    interpretation: interp({
      explicitRequest: 'Meine Katze kann nur dienstags sprechen',
      coreElements: ['eigene Katze', 'spricht nur dienstags'],
      requestedCharacters: ['die Katze des Kindes'],
      nonNegotiables: ['Katze', 'nur dienstags sprechen'],
      specialRules: ['Die Katze kann ausschließlich dienstags sprechen – die Regel ist wichtiger als die Tierart.'],
      creativeFreedom: ['Persönlichkeit der Katze', 'was sie sagen will'],
      mostInterestingPotential: 'Ein Tag Sprechzeit pro Woche macht jedes Wort kostbar – was, wenn die Katze diesmal etwas Wichtiges sagen muss, bevor Mitternacht kommt?',
      naturalScale: 'small',
      possibleStoryEnergy: ['witzig', 'geheimnisvoll'],
    }),
    candidates: [
      c('c1', 'Die Katze nutzt ihre Dienstage sonst für Beschwerden – heute hat sie ein Geheimnis, das vor Mittwoch gesagt werden muss, zögert es aber dramatisch hinaus.', 'Zeitlimit Mitternacht + Informationsmanagement', 'small', ['witzig', 'geheimnisvoll']),
      c('c2', 'Ein Feiertag fällt auf Dienstag, und die Katze verlangt, dass er verschoben wird.', 'Absurde Bürokratie', 'small', ['albern']),
      c('c3', 'Das Kind will der Katze an einem Dienstag eine Frage stellen, die es schon lange beschäftigt.', 'Leises Gespräch', 'intimate', ['nachdenklich']),
      c('c4', 'Die Katze verschläft ihren Dienstag und muss am Mittwoch ohne Worte etwas mitteilen.', 'Kommunikation ohne Sprache', 'small', ['lustig']),
    ],
    chosen: 'c1',
    architecture: {
      corePremise: 'Heute keine Beschwerden. Heute ein Anliegen. Zum richtigen Zeitpunkt.',
      storyForm: 'figurengetriebene Komödie mit Zeitlimit und Informationsrätsel',
      curiosityMechanism: 'Die Katze bricht ihre eigene Routine und hält die Information zurück; Papa plant für Mittwoch das Schuppen-Ausräumen.',
      endingDirection: 'Um 23:59 ein Lob – und sofort wieder die alte Beschwerde (Callback).',
    },
    characters: [{ name: 'Mathilda', personality: 'präzise, dramatisch, sarkastisch, insgeheim fürsorglich', speechStyle: 'nummerierte Listen, kurze spitze Sätze', unexpectedTrait: 'beschützt heimlich eine Igelfamilie und findet das peinlich' }],
    fingerprint: { genre: 'Komödie mit Informationsrätsel', scale: 'small', settingType: 'Zuhause + Gartenschuppen', centralDevice: 'Sprechregel + Mitternachts-Frist', characterTypes: ['sprechende Katze', 'Elternteil', 'Igel'], structureType: 'Routine gebrochen → Hinhalten → Enthüllung → Plan', endingStyle: 'komischer Callback', majorMotifs: ['Liste', 'Uhr', 'Schuppen'] },
    text: `Mathilda spricht nur dienstags.
Von null Uhr bis Mitternacht, keine Minute länger. Und nur mit {{HERO}}. Für alle anderen ist sie eine ganz normale graue Katze mit einem weißen Fleck auf der Nase, die sich gern auf Zeitungen legt, während man sie liest.

Die Dienstage liefen normalerweise so ab: Mathilda wachte auf, streckte sich, setzte sich {{HERO}} auf den Bauch und begann mit der Liste.
„Erstens: Das Trockenfutter ist trocken.“
„Das ist der Sinn von Trockenfutter.“
„Zweitens: der Staubsauger. Wir müssen über den Staubsauger reden.“

Es gab immer eine Liste. Meistens hatte sie elf Punkte. Einmal waren es dreiundzwanzig, weil in der Woche davor die Großeltern zu Besuch gewesen waren. Mit einem Hund.

Aber an diesem Dienstag war alles anders.
Mathilda saß auf der Fensterbank und schwieg. Um sieben Uhr schwieg sie immer noch. Erst als {{HERO}} schon die Schultasche packte, sagte sie: „Ich habe heute keine Beschwerden.“
{{HERO}} ließ die Federmappe fallen.
„Ich habe ein Anliegen“, sagte Mathilda. „Ein wichtiges. Ich werde es dir sagen. Zum richtigen Zeitpunkt.“
„Und wann ist der richtige Zeitpunkt?“
„Wenn ich es dir sage.“

Den ganzen Tag dachte {{HERO}} an nichts anderes. Nach der Schule lag Mathilda im Flur und tat, als würde sie schlafen. Beim Abendessen erzählte Papa, dass er morgen endlich den alten Gartenschuppen ausräumen wollte. „Das ganze Gerümpel. Die alten Decken, die Kisten, alles kommt weg.“
Unter dem Tisch hörte {{HERO}} ein Geräusch. Es klang wie eine Katze, die sehr, sehr bedeutungsvoll hustet.

Um neun Uhr abends verlor {{HERO}} die Geduld. „Mathilda. Es ist neun. Du hast noch drei Stunden.“
„Ich weiß, wie spät es ist. Ich bin eine Katze, keine Kartoffel.“
„Dann sag es doch einfach!“
Mathilda leckte sich ausführlich die Pfote. Dann sagte sie, ohne {{HERO}} anzusehen: „Wer am Mittwoch den Schuppen ausräumt, macht einen Fehler.“
„Was für einen Fehler?“
„Einen großen. Mit Stacheln.“

Es dauerte bis zehn nach elf, bis {{HERO}} alles aus ihr herausbekommen hatte. Mathilda hatte es letzten Mittwoch entdeckt, unter den alten Decken im Schuppen: eine Igelmutter. Mit vier Jungen, so klein wie Walnüsse. Und Mathilda, die strengste Katze der Welt, war seitdem jede Nacht hingegangen, um nachzusehen, ob alles in Ordnung war.
„Du hast auf sie aufgepasst?“
„Ich habe sie beobachtet. Aus wissenschaftlichen Gründen.“
„Und warum hast du es nicht gleich heute Morgen gesagt?“
Mathilda drehte die Ohren weg. „Weil es peinlich ist. Eine Katze, die Igel bewacht. Erzähl das bloß niemandem.“

Jetzt hatte {{HERO}} ein Problem. Papa würde morgen früh den Schuppen ausräumen. Und den Satz „Die Katze hat es mir erzählt“ würde ihm niemand glauben. {{HERO}} blieben genau fünfzig Minuten, um sich etwas Besseres auszudenken.

Um zwanzig vor zwölf klopfte {{HERO}} an die Schlafzimmertür. „Papa? Ich glaube, ich habe meinen Ball im Schuppen liegen lassen. Können wir ihn holen? Jetzt?“
Papa seufzte so laut, dass es bestimmt die Nachbarn hörten. Aber er nahm die Taschenlampe.
Im Schuppen hob {{HERO}} ganz vorsichtig eine Ecke der alten Decke an. Papa leuchtete hin. Fünf kleine Nasen schnupperten im Licht.
Papa sagte lange gar nichts. Dann flüsterte er: „Na, dann räume ich wohl erst im Frühling auf.“

Als {{HERO}} wieder im Bett lag, sprang Mathilda auf das Kopfkissen. Der Wecker zeigte dreiundzwanzig Uhr neunundfünfzig.
„Gut gemacht“, sagte sie. Dann, nach einer kleinen Pause: „Und das Trockenfutter ist trotzdem zu trocken.“
Der Wecker sprang auf null Uhr. Mathilda schnurrte nur noch.`,
  },

  // ── E · age 6 · crocodile, pink Porsche, dentist · small situational comedy ──
  {
    id: 'croc-dentist',
    benchmark: 'E – Alter 6 – „Ein Krokodil fährt mit einem rosa Porsche zum Zahnarzt“',
    language: 'de',
    age: 6,
    match: [/(krokodil|crocodil|alligator)/],
    defaultHero: 'Sami',
    title: 'Herr Knurr muss zum Zahnarzt',
    summary: 'Ein Krokodil im rosa Porsche, eine Zahnärztin mit einem kleinen Geheimnis – und ein Kind, das genau weiß, wie man so etwas macht.',
    storyForm: 'kleine Situationskomödie mit gegenseitiger heimlicher Angst',
    mood: ['lustig', 'warm'],
    cover: { setting: 'forest', creature: 'otter', mood: 'funny', subject: 'crocodile' },
    naturalGuidance: { courage: 'Das Kind zeigt den beiden Erwachsenen, wie es selbst den Zahnarztbesuch schafft: erst nur zählen.', contact: 'Zwei Figuren gestehen ihre Angst – niemand lacht darüber.' },
    interpretation: interp({
      explicitRequest: 'Ein Krokodil fährt mit einem rosa Porsche zum Zahnarzt',
      coreElements: ['Krokodil', 'rosa Porsche', 'Zahnarzt'],
      requestedCharacters: ['Krokodil'],
      requestedEvents: ['fährt zum Zahnarzt'],
      nonNegotiables: ['Krokodil', 'rosa Porsche', 'Zahnarztbesuch'],
      creativeFreedom: ['warum rosa', 'was beim Zahnarzt passiert'],
      mostInterestingPotential: 'Das Komische liegt im Kontrast: ein Tier mit den meisten Zähnen der Welt, das Angst vor dem Zahnarzt hat – und ein Auto, das gar nicht zu ihm passt.',
      naturalScale: 'small',
      possibleStoryEnergy: ['lustig', 'warm'],
      constraints: ['Automarke als Wunsch des Kindes nennen, aber keine Werbung'],
    }),
    candidates: [
      c('c1', 'Ein nervöses Krokodil kommt im geliehenen rosa Porsche zum Zahnarzt; die Zahnärztin hat heimlich Angst vor Krokodilen; das Kind im Wartezimmer vermittelt.', 'Gegenseitige heimliche Angst', 'small', ['lustig', 'warm']),
      c('c2', 'Das Krokodil fährt viel zu schnell, wird geblitzt und muss dem Polizisten erklären, warum es solche Zahnschmerzen hat.', 'Ausrede-Eskalation', 'small', ['albern']),
      c('c3', 'Der rosa Porsche passt in keine Parklücke, weil der Schwanz des Krokodils hinten heraushängt.', 'Körperkomik-Kette', 'intimate', ['albern']),
      c('c4', 'Das Krokodil ist selbst Zahnarzt und fährt zu einem Hausbesuch bei einem Kind.', 'Rollentausch', 'small', ['lustig']),
    ],
    chosen: 'c1',
    architecture: {
      corePremise: 'Wer hat hier eigentlich Angst vor wem?',
      storyForm: 'kleine Situationskomödie',
      curiosityMechanism: 'Ein rosa Sportwagen parkt fünfmal ein; ein Krokodil mit Hut hält sich die Backe.',
      endingDirection: 'Kein Loch, nur ein Lolli – und ein Kalendereintrag, der zeigt, wer der eigentliche Held war.',
    },
    characters: [
      { name: 'Herr Knurr (Krokodil)', personality: 'höflich, ängstlich, sehr ordentlich', speechStyle: 'förmlich, mit kleinen Seufzern („Leider.“)', unexpectedTrait: 'fährt aus Angst so vorsichtig wie auf Pudding' },
      { name: 'Doktor Mehring', personality: 'fröhlich, kompetent', speechStyle: 'munter, wird bei Krokodilen leise', unexpectedTrait: 'hat seit ihrer Kindheit Angst vor Krokodilen' },
    ],
    fingerprint: { genre: 'Situationskomödie', scale: 'small', settingType: 'Zahnarztpraxis', centralDevice: 'gegenseitige heimliche Angst', characterTypes: ['Krokodil', 'Zahnärztin'], structureType: 'eskalierende Alltagssituation', endingStyle: 'komischer Callback', majorMotifs: ['rosa Auto', 'Zählen', 'Lolli'] },
    text: `Im Wartezimmer von Doktor Mehring war es so still, dass man das Aquarium blubbern hörte. {{HERO}} saß auf dem grünen Stuhl neben der Tür und wartete. Nur zum Nachschauen, hatte die Frau am Empfang gesagt. Nachschauen tut nicht weh.

Da hörte {{HERO}} draußen ein Auto. Ein sehr leises Auto, das sehr, sehr langsam fuhr.
{{HERO}} kniete sich auf den Stuhl und schaute aus dem Fenster. Auf den Parkplatz rollte ein Sportwagen. Ein rosa Porsche. Er fuhr so vorsichtig, als wäre die Straße aus Pudding. Er brauchte drei Versuche, um einzuparken. Und noch zwei, um gerade zu stehen.
Dann ging die Tür auf. Und heraus stieg ein Krokodil.

Es trug einen karierten Hut und hielt sich mit einer Pfote die Backe. Es kam herein, nahm den Hut ab und sagte zur Frau am Empfang: „Knurr. Ich habe einen Termin. Leider.“
Dann setzte es sich neben {{HERO}}. Sein Schwanz passte nicht unter den Stuhl, also legte es ihn ordentlich quer durch das ganze Wartezimmer.

„Schönes Auto“, sagte {{HERO}}.
„Es gehört meiner Tante“, sagte Herr Knurr. „Ich habe es mir geliehen. Rosa ist eine beruhigende Farbe. Habe ich gelesen.“ Er betrachtete seine Krallen. „Es wirkt nicht.“
„Sind Sie deshalb so langsam gefahren?“
„Man soll nicht schnell zum Zahnarzt fahren“, sagte Herr Knurr ernst. „Man soll am besten überhaupt nicht zum Zahnarzt fahren.“

Die Tür zum Behandlungszimmer ging auf. „{{HERO}}, bitte!“
Herr Knurr atmete erleichtert aus. „Kinder zuerst. Unbedingt. Lass dir Zeit. Ganz viel Zeit.“

Doktor Mehring hatte eine Brille mit einer kleinen Lampe dran und zählte die Zähne von {{HERO}}. Zwanzig Stück, alle in Ordnung.
„Wer ist denn als Nächstes dran?“, fragte sie fröhlich und schaute auf ihren Zettel. „Knurr … Herr Knurr?“
„Das ist das Krokodil“, sagte {{HERO}}.
Doktor Mehring hörte auf zu lächeln. Die kleine Lampe an ihrer Brille zitterte. „Ein echtes Krokodil?“
„Mit Hut“, sagte {{HERO}}.
Doktor Mehring setzte sich hin. „Weißt du“, flüsterte sie, „ich habe ein ganz kleines bisschen Angst vor Krokodilen. Schon seit ich klein war.“
„Er hat Angst vor Zahnärzten“, flüsterte {{HERO}} zurück. „Seit er klein war. Glaube ich.“

Die beiden sahen sich an. Und {{HERO}} hatte eine Idee.

Fünf Minuten später lag Herr Knurr auf dem Behandlungsstuhl. Seine Hinterbeine reichten bis zum Fenster. Doktor Mehring stand ziemlich weit weg, mit ihrer Lampe. Und {{HERO}} stand in der Mitte und hielt den kleinen Spiegel.
„Wir machen es wie bei mir“, sagte {{HERO}}. „Erst nur zählen. Zählen tut nicht weh.“
Herr Knurr öffnete das Maul. Sehr, sehr weit. Doktor Mehring machte einen Schritt zurück. Und dann einen kleinen Schritt nach vorn.
„Eins“, zählte {{HERO}}. „Zwei. Drei.“
Bei zwanzig zitterte die Lampe nicht mehr. Bei vierzig beugte sich Doktor Mehring vor. Und bei dreiundfünfzig sagte sie: „Halt. Da. Was ist das denn?“
Zwischen zwei Zähnen steckte etwas Rosafarbenes.
„Mein Lolli“, sagte Herr Knurr, so gut das mit offenem Maul ging. „Seit Sonntag.“
Doktor Mehring holte Zahnseide. Ein kleiner Ruck. PLOPP. Und der Lolli war draußen.

Herr Knurr klappte das Maul zu und tastete nach seiner Backe. „Das war alles?“
„Das war alles“, sagte Doktor Mehring. Sie klang selbst ein bisschen überrascht.

Draußen stieg Herr Knurr in den rosa Porsche. Diesmal schaffte er das Ausparken beim ersten Versuch. Und dann hupte er, ganz kurz. Die Hupe spielte eine kleine Melodie.
Doktor Mehring winkte vom Fenster aus. Dann schrieb sie in ihren Kalender: „Herr Knurr, nächstes Jahr. Unbedingt zusammen mit {{HERO}}.“`,
  },
];
