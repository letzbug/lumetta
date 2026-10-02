import type { LangPack } from './types';

const genitive = (name: string) => (/[sßxz]$/i.test(name) ? `${name}’` : `${name}s`);

export const de: LangPack = {
  heroFallback: 'Mika',
  heroVars: (hero) => ({ heroPoss: genitive(hero), deHero: hero }),
  creatureVars: (name) => ({ cnamePoss: genitive(name), deCname: name }),
  listJoin: (items) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} und ${items[items.length - 1]}`),
  lowercaseInterests: false,

  moods: {
    adventure: {
      opening: 'Manche Abenteuer beginnen ganz leise – mit einem Blinken, einem Summen oder einem Geräusch, das man fast überhört.',
      ending: 'Und {hero} wusste: Das nächste Abenteuer wartet schon. Vielleicht blinkt es morgen.',
    },
    funny: {
      opening: 'Es gibt Tage, an denen sogar die Socken ein bisschen kichern. Heute war so ein Tag.',
      ending: 'Und irgendwo, ganz weit weg, machte {cname} noch einmal „{sound}“ – so laut, dass sogar der Mond kichern musste.',
    },
    calm: {
      opening: 'Es war ein stiller, weicher Abend, und das Licht im Zimmer war so warm wie ein Becher Kakao.',
      ending: '{hero} atmete tief ein und langsam wieder aus. Alles war ruhig. Alles war gut.',
    },
    magical: {
      opening: 'Wer ganz genau hinsieht, merkt es manchmal: Die Welt hat kleine Türen, die nur für einen Moment offen stehen.',
      ending: 'Und wenn man ganz genau hinsah, glitzerte auf dem Fensterbrett noch ein winziges bisschen Zauber.',
    },
    discovery: {
      opening: '{hero} hatte schon immer gern Fragen gestellt. Wie funktioniert das? Was ist dahinter? Und was passiert, wenn man noch genauer hinschaut?',
      ending: 'In {heroPoss} Kopf sprudelten schon neue Fragen. Und das war das Schönste daran.',
    },
    bedtime: {
      opening: 'Draußen wurde es dunkel, und die Sterne kamen einer nach dem anderen heraus, als hätte jemand sie leise angeknipst.',
      ending: 'Die Augen wurden schwer, die Decke war warm, und ganz leise, ganz langsam schlief {hero} ein. Gute Nacht.',
    },
  },

  settings: {
    space: {
      title: 'die Pusteblumen-Station',
      summary: 'Eine Reise zur Raumstation Pusteblume',
      place: 'auf der Raumstation',
      portal:
        'Eines Abends summte das Fenster in {heroPoss} Zimmer. Draußen schwebte ein kleines, rundes Raumschiff, nicht größer als ein Kleiderschrank. Es blinkte freundlich: orange, blau, orange. Dann öffnete sich die Luke mit einem leisen Pffft, als wollte das Schiff sagen: Steig ein!',
      arrival:
        '{hero} kletterte auf den weichen Sitz, und das Raumschiff stieg hinauf – über die Dächer, über die Wolken, bis die Erde aussah wie eine blaue Murmel. {interestsLine}Dann tauchte sie vor ihnen auf: die Raumstation Pusteblume. Sie sah aus wie eine riesige Löwenzahnblüte aus Licht, und an jedem ihrer feinen Fäden hing ein kleines, leuchtendes Haus.',
      hiding: 'Im Gewächshaus der Station, zwischen Mondtomaten und blauen Riesenkürbissen, raschelte etwas.',
      othersNom: 'die Mondhüpfer',
      OthersNom: 'Die Mondhüpfer',
      othersDat: 'den Mondhüpfern',
      othersDesc: 'kleine, flauschige Wesen mit langen Ohren, die bei jedem Schritt ein bisschen schwebten',
      activity: 'bauten aus leuchtenden Steinen eine Kugelbahn, die quer durch die ganze Halle lief',
      gift: 'einen glitzernden Sternenkiesel',
      ret:
        'Als die Station langsam in den Nachtschlaf summte, brachte das kleine Raumschiff {hero} nach Hause. Es landete sanft vor dem Fenster, blinkte noch einmal – orange, blau, orange – und verschwand zwischen den Sternen.',
    },
    ocean: {
      title: 'die Perlmutt-Stadt',
      summary: 'Eine Reise in die Korallenstadt Perlmutt',
      place: 'in der Korallenstadt',
      portal:
        'Eines Abends, als {hero} gerade die Zähne putzte, stieg aus dem Waschbecken eine schimmernde Blase auf. Sie wurde größer und größer, bis sie so groß war wie ein Sessel. Darin schaukelte ein kleines Muschelboot, und es schien zu sagen: Komm mit!',
      arrival:
        'Kaum saß {hero} darin, schwebte die Blase davon – durch das Fenster, über die Wiesen, bis hinunter ins tiefe, blaue Meer. Fische glitten vorbei wie bunte Bänder. {interestsLine}Dann leuchtete es unter ihnen: die Korallenstadt Perlmutt, mit Häusern aus Muscheln und Laternen, die in Wahrheit freundliche Quallen waren.',
      hiding: 'Hinter einem Vorhang aus wogendem Seegras blubberte etwas.',
      othersNom: 'die Seepferdchenkinder',
      OthersNom: 'Die Seepferdchenkinder',
      othersDat: 'den Seepferdchenkindern',
      othersDesc: 'kleine Seepferdchen mit geringelten Schwänzen, die vor Lachen ständig Blasen machten',
      activity: 'bauten aus Sand und Muscheln eine lange Kugelbahn, durch die die Strömung glänzende Kugeln trieb',
      gift: 'eine schimmernde Perle',
      ret:
        'Als das Meer langsam dunkler wurde, trug die Blase {hero} wieder nach oben, durch das Fenster, bis ins warme Zimmer. Mit einem leisen Plopp war sie verschwunden.',
    },
    forest: {
      title: 'das Baumdorf Mooslicht',
      summary: 'Eine Reise ins Baumdorf Mooslicht',
      place: 'im Baumdorf',
      portal:
        'Eines Abends entdeckte {hero} im Garten etwas Seltsames: Im alten Apfelbaum war eine kleine Tür mit einem runden Knauf aus Moos. Diese Tür war vorher nie da gewesen. Und unter ihr schimmerte warmes Licht hervor.',
      arrival:
        '{hero} öffnete die Tür ganz vorsichtig – und dahinter lag ein Wald, in dem die Blätter leise klingelten, wenn der Wind durch sie strich. {interestsLine}Ein Pfad aus leuchtenden Pilzen führte zum Baumdorf Mooslicht, wo kleine Hängebrücken von Baum zu Baum schaukelten.',
      hiding: 'Unter einem großen Farn, ganz am Rand des Dorfes, zitterte etwas.',
      othersNom: 'die Eichhörnchenkinder',
      OthersNom: 'Die Eichhörnchenkinder',
      othersDat: 'den Eichhörnchenkindern',
      othersDesc: 'kleine Eichhörnchen mit buschigen Schwänzen, die schneller kletterten, als man gucken konnte',
      activity: 'bauten aus Zweigen und Rinde eine Kugelbahn, die von Ast zu Ast lief',
      gift: 'eine glänzende Eichel',
      ret:
        'Als die Pilze am Pfad schwächer leuchteten, ging {hero} zurück zur kleinen Tür im Apfelbaum. Im Garten war es still. Und als {hero} sich noch einmal umdrehte, war die Tür nur noch ein Stück Rinde.',
    },
  },

  creatures: {
    dino: {
      name: 'Tiko',
      sound: 'Piep-mrrr',
      indef: 'ein winziges grünes Dinosaurierbaby mit runden Augen und einem Schwanz, der vor Aufregung hin und her wischte',
      summary: 'ein kleines Dinosaurierbaby namens Tiko',
    },
    dragon: {
      name: 'Pim',
      sound: 'Pfff-pff',
      indef: 'ein kleiner Drache, nicht größer als eine Katze, mit Flügeln wie zerknittertes Seidenpapier',
      summary: 'ein kleiner Drache namens Pim',
    },
    otter: {
      name: 'Lulu',
      sound: 'Kiek-kiek',
      indef: 'ein kleines Otterkind mit glänzendem Fell und Schnurrhaaren, die neugierig zitterten',
      summary: 'ein Otterkind namens Lulu',
    },
  },

  discovery:
    '{hiding} {hero} ging in die Hocke und schaute vorsichtig nach. Zwei große Augen blickten zu {hero} hoch. Dort saß {creatureIndef}. „Hallo“, flüsterte {hero}. „Ich bin {hero}.“ Das kleine Wesen machte nur ganz leise: „{sound}.“ An seinem Halsband hing ein Schildchen, und darauf stand: {cname}.',

  interestsLine:
    'Unterwegs dachte {hero} an all die Dinge, die das Herz schneller schlagen lassen: {interests}. Und es fühlte sich an, als würde diese Reise genau dorthin führen. ',

  arcs: {
    contact: {
      paragraphs: [
        '„Bist du ganz allein hier?“, fragte {hero}. {cname} schaute zur Seite. Nicht weit entfernt spielten {othersNom}, {othersDesc}. Sie {activity}. Es sah wunderbar aus. {cname} machte einen kleinen Schritt nach vorn – und dann ganz schnell wieder einen zurück.',
        '{hero} kannte dieses Gefühl. Manchmal möchte man so gern mitmachen, und trotzdem bleiben die Füße einfach stehen. Im Bauch kribbelt es, und alle Wörter verstecken sich irgendwo hinten im Hals. „Wollen wir erst mal zusammen zuschauen?“, fragte {hero}. {cname} nickte. Also setzten sie sich nebeneinander und schauten. Nur schauen. Das war erlaubt.',
        'Beim Zuschauen bemerkten sie etwas: Die Bahn hatte eine Lücke. Immer an derselben Stelle sprang die Kugel heraus und kullerte davon, und die anderen seufzten jedes Mal. {cname} bekam große Augen und stupste {hero} an. Dann holte {cname} etwas aus dem Versteck hervor: {gift}. Genau so groß wie die Lücke.',
        '„Sollen wir das zusammen hinbringen?“, fragte {hero} leise. {cname} zögerte. Dann kam ein kleines Nicken. Schritt für Schritt gingen sie hinüber. {cname} sagte kein Wort, aber {cname} legte den kleinen Schatz vorsichtig in die Lücke und machte ganz leise: „{sound}?“ Einen Moment war alles still. Dann rollte die nächste Kugel los, über den kleinen Schatz hinweg, durch die ganze Bahn, bis ganz nach unten. Klick!',
        '„Noch mal!“, rief eines der Kleinen. Und ein anderes fragte: „Wie heißt du?“ {cname} schaute zu {hero}. {hero} lächelte nur und wartete. Da sagte {cname}, zum ersten Mal ein kleines bisschen lauter: „{sound} … {cname}!“ Eines der Kleinen machte es sofort nach: „{sound}!“ Alle mussten lachen, und {cname} lachte mit. Und {hero}? {hero} baute einfach mit, als wäre {hero} schon immer dabei gewesen.',
      ],
      older:
        'Später, als die Bahn immer länger wurde, beobachtete {hero} {cname} genau. {cname} war nicht plötzlich laut geworden. {cname} redete immer noch leise und schaute manchmal zu Boden. Aber jetzt kannte {cname} einen Weg: erst zuschauen, dann etwas Kleines zeigen, dann ein einziges Wort. Und als jemand fragte, ob {cname} morgen wiederkommt, machte {cname} gleich zweimal „{sound}“.',
      farewell:
        'Zum Abschied drückte sich {cname} ganz fest an {hero}. „{sound}“, machte {cname}, und diesmal klang es wie: Danke. Und wie: Bis bald.',
      tagline: 'ein erstes leises Hallo',
    },
    courage: {
      paragraphs: [
        '{cname} wollte so gern zu {othersDat}, die ganz oben {place} spielten. Aber der einzige Weg dorthin führte über eine lange, schmale Brücke aus Licht. Sie schaukelte sanft hin und her, und von unten sah sie unendlich lang aus.',
        '{cname} stellte eine Pfote auf das erste Brett. Es wackelte. Schnell zog {cname} die Pfote zurück. „{sound}“, machte {cname}, ganz klein. {hero} kannte dieses Gefühl gut. Wenn etwas neu ist, sieht es oft viel größer aus, als es ist. „Weißt du was?“, sagte {hero}. „Wir müssen nicht die ganze Brücke auf einmal schaffen. Nur das erste Brett.“',
        'Also nur das erste Brett. Es wackelte ein bisschen – und hielt. Dann das zweite. „Eins“, zählte {hero}. „Zwei.“ Beim fünften Brett blieb {cname} stehen und atmete tief ein und aus. {hero} wartete. Niemand musste sich beeilen. Beim sechsten Brett zählte {cname} selbst mit: „{sound}, {sound}!“',
        'In der Mitte der Brücke passierte etwas Seltsames. Von hier aus konnte man alles sehen: die Lichter, die Wege und sogar das kleine Fleckchen, wo sie losgegangen waren. Es sah gar nicht mehr so weit weg aus. Die Brücke wackelte immer noch. Aber jetzt fühlte sich das Wackeln ein bisschen an wie Schaukeln.',
        'Am Ende warteten {othersNom}, {othersDesc}. „Ihr seid über die Brücke gekommen!“, riefen sie. {cname} plusterte sich stolz auf. Und als die anderen fragten, wer Lust auf ein Wettrutschen hatte, war {cname} zwar nicht als Erstes auf der Rutsche – aber {cname} war dabei. Und {hero} auch.',
      ],
      older:
        'Auf dem Rückweg ging {cname} ganz allein über die Brücke. Nicht schnell, aber ohne anzuhalten. {hero} lief hinterher und zählte leise mit, Brett für Brett, bis zum Ende. Komisch, dachte {hero}: dieselbe Brücke wie vorhin. Und trotzdem eine ganz andere.',
      farewell: 'Zum Abschied schenkte {cname} {hero} {gift}. „{sound}“, machte {cname}. Es klang wie: Bis zum nächsten ersten Brett.',
      tagline: 'eine wackelige Brücke und ihr erstes Brett',
    },
    mistakes: {
      paragraphs: [
        '{cname} zog {hero} aufgeregt am Ärmel. {OthersNom} {activity}. „Dürfen wir mithelfen?“, fragte {hero}, und die anderen nickten sofort. {cname} hüpfte vor Freude in die Luft – und bei diesem Hüpfer erwischte {cnamePoss} Schwanz ein ganzes Stück der Bahn.',
        'Es klapperte. Es kullerte. Und dann lag ein großes Stück der Bahn auf dem Boden. Alle wurden still. {cname} erstarrte und wäre am liebsten ganz klein geworden, so klein wie ein Staubkorn. „{sound} …“, machte {cname}, kaum hörbar.',
        '{hero} hockte sich neben {cname}. „Das war ein Versehen“, sagte {hero}. „Das passiert. Mir ist auch schon mal ein ganzer Turm umgefallen. Mit Saft obendrauf.“ Eines der Kleinen kicherte. „Mir auch!“, sagte es. „Sogar zweimal!“ Und plötzlich fühlte sich die Stille gar nicht mehr so schwer an.',
        'Dann schauten alle auf die Steine am Boden. Weil sie nun sowieso herausgefallen waren, hatte jemand eine Idee: Was wäre, wenn man sie ein bisschen anders wieder einbaut? Mit einer Kurve. Und einem kleinen Sprung. {cname} schob vorsichtig den ersten Stein an seinen neuen Platz. Dann den nächsten. Und den nächsten.',
        'Die neue Bahn war nicht mehr genau wie vorher. Sie war anders. Sie hatte jetzt eine Kurve, die alle nur noch die {cname}-Kurve nannten, und einen Sprung, bei dem die Kugeln kurz durch die Luft flogen, bevor sie weiterrollten. Alle waren sich einig: So war sie sogar noch lustiger.',
      ],
      older:
        'Später sagte eines der Kleinen zu {cname}: „Weißt du, ohne deinen Hüpfer hätten wir nie eine Kurve gebaut.“ {cname} dachte lange darüber nach, mit schief gelegtem Kopf. Dann machte {cname} „{sound}“ – und baute gleich noch eine zweite Kurve dazu.',
      farewell: 'Zum Abschied legte {cname} {hero} {gift} in die Hand. „{sound}“, machte {cname}. Es klang wie: Danke, dass du bei mir geblieben bist.',
      tagline: 'eine Kurve, die es vorher nicht gab',
    },
    together: {
      paragraphs: [
        '{OthersNom} {activity}. Doch heute klappte gar nichts. Ein riesiger runder Stein lag mitten im Weg, und alle versuchten, ihn wegzuschieben. Die einen schoben von links, die anderen von rechts, und alle riefen durcheinander. Der Stein bewegte sich keinen Millimeter.',
        '{cname} schaute eine Weile zu. Dann stupste {cname} {hero} an: „{sound}?“ {hero} verstand. „Du meinst, wir fragen, ob wir helfen dürfen?“ {cname} nickte. Allein traute sich {cname} nicht, also gingen sie zusammen hin. „Können wir mithelfen?“, fragte {hero}. „Ja, bitte!“, riefen die anderen erleichtert.',
        'Aber jetzt redeten noch mehr durcheinander. Jeder hatte eine Idee, und keiner hörte die der anderen. Da setzte sich {cname} einfach hin und wartete, bis es ein bisschen ruhiger wurde. Dann machte {cname} einmal, zweimal, dreimal: „{sound}. {sound}. {sound}.“ Gleichmäßig wie ein Takt.',
        '„Ein Takt!“, rief {hero}. „Wir schieben alle gleichzeitig – auf drei!“ Alle stellten sich auf dieselbe Seite. „Eins … zwei … drei!“ Und der riesige Stein rollte. Erst langsam, dann schneller, bis er mit einem dumpfen Bumm genau an der richtigen Stelle lag. Plötzlich war er kein Hindernis mehr. Er war der Anfang für den schönsten Teil der ganzen Bahn.',
        'Natürlich wollten danach alle zuerst ausprobieren. Doch {cname} hatte schon wieder eine Idee: Jeder bekam eine Kugel, und sie ließen sie nacheinander rollen – eine, dann die nächste, dann die nächste. Und weil man warten musste, konnte man jeder einzelnen Kugel bei ihrer Reise zuschauen. Das war fast das Beste daran.',
      ],
      older:
        '{hero} schaute sich um und merkte, wie verschieden alle waren. Manche waren stark, manche schnell, manche hatten verrückte Ideen, und {cname} konnte den Takt halten wie niemand sonst. Allein hätte es keiner geschafft. Zusammen war es beinahe leicht gewesen.',
      farewell: 'Zum Abschied schenkten die anderen {hero} {gift}. „{sound}!“, machte {cname} fröhlich. Es klang wie: Morgen wieder?',
      tagline: 'ein Stein, der nur gemeinsam rollt',
    },
    quest: {
      paragraphs: [
        '„Was ist denn los?“, fragte {hero} sanft. {cname} zeigte in die Ferne und machte ein trauriges „{sound}“. Nach und nach verstand {hero}: {cname} hatte etwas verloren. Etwas sehr Wichtiges. Ein kleines Licht, das {cname} jeden Abend vor dem Einschlafen anschaute.',
        '„Das finden wir“, sagte {hero}. Und so machten sie sich auf die Suche. Sie schauten hinter große Dinge und unter kleine. Sie fragten {othersDat}, und die halfen sofort mit. Sie suchten oben und unten und überall dazwischen.',
        'Gerade als {cname} ganz müde wurde, entdeckte {hero} es: ein winziges Schimmern, ganz weit oben, wo man nur hinkam, wenn man sich gegenseitig half. {hero} machte eine Räuberleiter, {cname} kletterte hinauf – höher, noch ein kleines bisschen höher – und dann: geschafft!',
        'Das kleine Licht leuchtete warm zwischen {cnamePoss} Pfoten. {cname} drehte sich vor Freude im Kreis, einmal, zweimal, dreimal, bis {cname} beinahe umgefallen wäre. {OthersNom} jubelten, und {hero} lachte so sehr, dass es im Bauch kitzelte.',
      ],
      older:
        'Auf dem Rückweg erzählte {cname} mit vielen „{sound}“ und noch mehr Händen und Füßen, wie das Licht verloren gegangen war. {hero} verstand nicht jedes Wort. Aber man muss nicht jedes Wort verstehen, um eine Geschichte zu verstehen.',
      farewell: 'Zum Abschied schenkte {cname} {hero} {gift}. „{sound}“, machte {cname}. Es klang wie: Danke.',
      tagline: 'ein verlorenes kleines Licht',
    },
  },

  title: (hero, cname, settingTitle) => (hero ? `${hero}, ${cname} und ${settingTitle}` : `${cname} und ${settingTitle}`),
  summary: (s, c, t) => `${s}, ${c} und ${t}.`,
};
