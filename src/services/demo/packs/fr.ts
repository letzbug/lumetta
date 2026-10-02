import type { LangPack } from './types';

/** "de Léo" / "d’Anna" */
const de = (name: string) => (/^[aeiouyàâäéèêëîïôöûüh]/i.test(name) ? `d’${name}` : `de ${name}`);

export const fr: LangPack = {
  heroFallback: 'Mika',
  heroVars: (hero) => ({ heroPoss: hero, deHero: de(hero) }),
  creatureVars: (name) => ({ cnamePoss: name, deCname: de(name) }),
  listJoin: (items) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} et ${items[items.length - 1]}`),
  lowercaseInterests: true,

  moods: {
    adventure: {
      opening: 'Certaines aventures commencent tout doucement : par un clignement, un bourdonnement ou un bruit qu’on entend à peine.',
      ending: 'Et {hero} le savait : la prochaine aventure attendait déjà. Peut-être qu’elle clignoterait demain.',
    },
    funny: {
      opening: 'Il y a des jours où même les chaussettes gloussent un peu. Aujourd’hui était un de ces jours.',
      ending: 'Et quelque part, très loin, {cname} fit encore une fois « {sound} », si fort que même la lune dut pouffer de rire.',
    },
    calm: {
      opening: 'C’était une soirée calme et douce, et la lumière dans la chambre était aussi chaude qu’une tasse de chocolat.',
      ending: '{hero} respira profondément, puis souffla tout doucement. Tout était calme. Tout allait bien.',
    },
    magical: {
      opening: 'Quand on regarde très attentivement, on le remarque parfois : le monde a de petites portes qui ne restent ouvertes qu’un instant.',
      ending: 'Et si l’on regardait de très près, un tout petit peu de magie scintillait encore sur le rebord de la fenêtre.',
    },
    discovery: {
      opening: '{hero} avait toujours adoré poser des questions. Comment ça marche ? Qu’y a-t-il derrière ? Et que se passe-t-il si l’on regarde encore de plus près ?',
      ending: 'Dans la tête {deHero}, de nouvelles questions pétillaient déjà. Et c’était ça, le plus beau.',
    },
    bedtime: {
      opening: 'Dehors, la nuit tombait, et les étoiles apparaissaient une à une, comme si quelqu’un les allumait tout doucement.',
      ending: 'Les paupières devinrent lourdes, la couverture était chaude, et tout doucement, tout lentement, {hero} s’endormit. Bonne nuit.',
    },
  },

  settings: {
    space: {
      title: 'la station Pissenlit',
      summary: 'Un voyage vers la station spatiale Pissenlit',
      place: 'sur la station',
      portal:
        'Un soir, la fenêtre de la chambre {deHero} se mit à bourdonner. Dehors flottait un petit vaisseau spatial tout rond, pas plus grand qu’une armoire. Il clignotait gentiment : orange, bleu, orange. Puis la trappe s’ouvrit avec un petit pfffft, comme si le vaisseau disait : monte !',
      arrival:
        '{hero} grimpa sur le siège moelleux, et le vaisseau s’éleva : au-dessus des toits, au-dessus des nuages, jusqu’à ce que la Terre ressemble à une bille bleue. {interestsLine}Puis elle apparut devant eux : la station spatiale Pissenlit. On aurait dit une immense fleur de pissenlit faite de lumière, et à chacun de ses fins filaments pendait une petite maison lumineuse.',
      hiding: 'Dans la serre de la station, entre les tomates lunaires et les citrouilles bleues géantes, quelque chose bruissait.',
      othersNom: 'les sauteurs de lune',
      OthersNom: 'Les sauteurs de lune',
      othersDat: 'aux sauteurs de lune',
      othersDesc: 'de petits êtres duveteux aux longues oreilles qui flottaient un peu à chaque pas',
      activity: 'construisaient avec des pierres lumineuses un circuit à billes qui traversait toute la grande salle',
      gift: 'un caillou d’étoile scintillant',
      ret:
        'Quand la station commença doucement à ronronner pour la nuit, le petit vaisseau ramena {hero} à la maison. Il se posa délicatement devant la fenêtre, clignota une dernière fois, orange, bleu, orange, puis disparut parmi les étoiles.',
    },
    ocean: {
      title: 'la cité de Nacre',
      summary: 'Un voyage vers la cité de corail de Nacre',
      place: 'dans la cité de corail',
      portal:
        'Un soir, au beau milieu du brossage de dents, une bulle chatoyante sortit du lavabo. Elle grandit, grandit, jusqu’à devenir aussi grande qu’un fauteuil. À l’intérieur se balançait un petit bateau-coquillage, qui semblait dire : viens !',
      arrival:
        '{hero} s’assit dedans, et aussitôt la bulle s’envola : par la fenêtre, au-dessus des prés, jusqu’au fond de la mer bleue et profonde. Des poissons glissaient comme des rubans colorés. {interestsLine}Puis quelque chose brilla sous eux : la cité de corail de Nacre, avec des maisons en coquillages et des lampadaires qui étaient en réalité de gentilles méduses.',
      hiding: 'Derrière un rideau d’algues ondulantes, quelque chose faisait des bulles.',
      othersNom: 'les bébés hippocampes',
      OthersNom: 'Les bébés hippocampes',
      othersDat: 'aux bébés hippocampes',
      othersDesc: 'de petits hippocampes à la queue enroulée qui faisaient des bulles chaque fois qu’ils riaient',
      activity: 'construisaient avec du sable et des coquillages un long circuit à billes, où le courant poussait des billes brillantes',
      gift: 'une perle chatoyante',
      ret:
        'Quand la mer devint peu à peu plus sombre, la bulle ramena {hero} vers le haut, par la fenêtre, jusque dans la chambre bien chaude. Avec un petit plop, elle disparut.',
    },
    forest: {
      title: 'le village-arbre de Mousselune',
      summary: 'Un voyage vers le village-arbre de Mousselune',
      place: 'dans le village-arbre',
      portal:
        'Un soir, {hero} remarqua quelque chose d’étrange dans le jardin : dans le vieux pommier, il y avait une toute petite porte avec une poignée ronde en mousse. Cette porte n’avait jamais été là. Et par-dessous brillait une lumière chaude.',
      arrival:
        '{hero} ouvrit la porte très doucement, et derrière se trouvait une forêt où les feuilles tintaient quand le vent les caressait. {interestsLine}Un chemin de champignons lumineux menait au village-arbre de Mousselune, où de petits ponts suspendus se balançaient d’arbre en arbre.',
      hiding: 'Sous une grande fougère, tout au bord du village, quelque chose tremblait.',
      othersNom: 'les petits écureuils',
      OthersNom: 'Les petits écureuils',
      othersDat: 'aux petits écureuils',
      othersDesc: 'de petits écureuils à la queue touffue qui grimpaient plus vite qu’on ne pouvait les suivre des yeux',
      activity: 'construisaient avec des brindilles et de l’écorce un circuit à billes qui allait de branche en branche',
      gift: 'un gland brillant',
      ret:
        'Quand les champignons du chemin se mirent à briller plus faiblement, {hero} retourna vers la petite porte du pommier. Le jardin était silencieux. Et quand {hero} se retourna une dernière fois, la porte n’était plus qu’un morceau d’écorce.',
    },
  },

  creatures: {
    dino: {
      name: 'Tiko',
      sound: 'Pip-mrrr',
      indef: 'un tout petit bébé dinosaure vert aux yeux ronds, dont la queue s’agitait d’excitation',
      summary: 'un bébé dinosaure nommé Tiko',
    },
    dragon: {
      name: 'Pim',
      sound: 'Pfff-pff',
      indef: 'un petit dragon, pas plus grand qu’un chat, aux ailes comme du papier de soie froissé',
      summary: 'un petit dragon nommé Pim',
    },
    otter: {
      name: 'Lulu',
      sound: 'Kik-kik',
      indef: 'un bébé loutre au pelage brillant et aux moustaches qui frémissaient de curiosité',
      summary: 'un bébé loutre nommé Lulu',
    },
  },

  discovery:
    '{hiding} {hero} s’accroupit et regarda prudemment. Deux grands yeux se levèrent vers {hero}. Là se trouvait {creatureIndef}. « Bonjour », chuchota {hero}. « Je m’appelle {hero}. » La petite créature fit seulement, tout bas : « {sound}. » À son collier pendait une petite étiquette, sur laquelle était écrit : {cname}.',

  interestsLine:
    'En chemin, {hero} pensa à tout ce qui fait battre le cœur plus vite : {interests}. Et c’était comme si ce voyage menait tout droit là-bas. ',

  arcs: {
    contact: {
      paragraphs: [
        '« Tu es tout seul ici ? » demanda {hero}. {cname} regarda sur le côté. Pas très loin jouaient {othersNom} : {othersDesc}. Ils {activity}. C’était merveilleux à voir. {cname} fit un petit pas en avant… puis, très vite, un pas en arrière.',
        '{hero} connaissait bien ce sentiment. Parfois, on a tellement envie de jouer avec les autres, et pourtant les pieds restent plantés là. Le ventre picote, et tous les mots se cachent quelque part au fond de la gorge. « Et si on regardait d’abord ensemble ? » demanda {hero}. {cname} hocha la tête. Alors ils s’assirent côte à côte et regardèrent. Juste regarder. C’était permis.',
        'En regardant, ils remarquèrent quelque chose : le circuit avait un trou. À chaque fois, exactement au même endroit, la bille sautait dehors et roulait plus loin, et les autres soupiraient. Les yeux {deCname} s’agrandirent, et {cname} donna un petit coup de coude à {hero}. Puis {cname} sortit quelque chose de sa cachette : {gift}. Juste de la taille du trou.',
        '« On l’apporte ensemble ? » demanda doucement {hero}. {cname} hésita. Puis il y eut un tout petit hochement de tête. Pas à pas, ils s’approchèrent. {cname} ne dit pas un mot, mais posa délicatement le petit trésor dans le trou et fit, tout bas : « {sound} ? » Pendant un instant, tout fut silencieux. Puis la bille suivante partit, passa sur le petit trésor, traversa tout le circuit et arriva tout en bas. Clic !',
        '« Encore ! » cria l’un des petits. Et un autre demanda : « Comment tu t’appelles ? » {cname} regarda {hero}. {hero} sourit simplement et attendit. Alors {cname} dit, pour la première fois un tout petit peu plus fort : « {sound}… {cname} ! » L’un des petits l’imita aussitôt : « {sound} ! » Tout le monde éclata de rire, et {cname} rit avec eux. Et {hero} ? {hero} se mit à construire avec eux, comme si {hero} avait toujours fait partie de la bande.',
      ],
      older:
        'Plus tard, pendant que le circuit devenait de plus en plus long, {hero} observa {cname} attentivement. {cname} n’était pas devenu bruyant d’un coup. Il parlait toujours doucement et regardait parfois par terre. Mais maintenant, {cname} connaissait un chemin : d’abord regarder, puis montrer quelque chose de petit, puis dire un seul mot. Et quand quelqu’un demanda si {cname} reviendrait demain, {cname} fit deux fois « {sound} ».',
      farewell:
        'Au moment de se dire au revoir, {cname} se blottit tout contre {hero}. « {sound} », fit {cname}, et cette fois, cela voulait dire : merci. Et aussi : à bientôt.',
      tagline: 'un premier bonjour tout doux',
    },
    courage: {
      paragraphs: [
        '{cname} avait très envie de rejoindre {othersNom}, qui jouaient tout en haut, {place}. Mais le seul chemin pour y arriver passait par un long pont étroit fait de lumière. Il se balançait doucement de gauche à droite, et d’en bas, il paraissait interminable.',
        '{cname} posa une patte sur la première planche. Elle bougea. Vite, {cname} retira sa patte. « {sound} », fit {cname}, tout petit. {hero} connaissait bien ce sentiment. Quand quelque chose est nouveau, cela paraît souvent bien plus grand que ce n’est vraiment. « Tu sais quoi ? » dit {hero}. « On n’est pas obligés de traverser tout le pont d’un coup. Juste la première planche. »',
        'Alors, juste la première planche. Elle bougea un peu… et elle tint bon. Puis la deuxième. « Un », compta {hero}. « Deux. » À la cinquième planche, {cname} s’arrêta et respira profondément. {hero} attendit. Personne n’avait besoin de se dépêcher. À la sixième planche, {cname} compta tout seul : « {sound}, {sound} ! »',
        'Au milieu du pont, il se passa quelque chose d’étrange. D’ici, on voyait tout : les lumières, les chemins et même le petit endroit d’où ils étaient partis. Ça ne paraissait plus si loin. Le pont bougeait toujours. Mais maintenant, ça ressemblait un peu à une balançoire.',
        'Au bout du pont attendaient {othersNom} : {othersDesc}. « Vous avez traversé le pont ! » crièrent-ils. {cname} se gonfla de fierté. Et quand les autres demandèrent qui voulait faire une course de toboggan, {cname} ne fut pas le premier en bas, mais {cname} était de la partie. Et {hero} aussi.',
      ],
      older:
        'Sur le chemin du retour, {cname} traversa le pont tout seul. Pas vite, mais sans s’arrêter. {hero} suivait en comptant tout bas, planche après planche, jusqu’au bout. C’est drôle, pensa {hero} : c’est le même pont que tout à l’heure. Et pourtant, c’est un tout autre pont.',
      farewell: 'Au moment de partir, {cname} offrit {gift} à {hero}. « {sound} », fit {cname}. Cela voulait dire : à la prochaine première planche.',
      tagline: 'un pont qui bouge et sa toute première planche',
    },
    mistakes: {
      paragraphs: [
        '{cname} tira {hero} par la manche, tout excité. {OthersNom} {activity}. « On peut vous aider ? » demanda {hero}, et les autres hochèrent aussitôt la tête. {cname} sauta de joie… et dans ce saut, la queue {deCname} accrocha tout un morceau du circuit.',
        'Ça cliqueta. Ça roula. Et un grand morceau du circuit se retrouva par terre. Tout le monde se tut. {cname} se figea et aurait voulu devenir minuscule, aussi petit qu’un grain de poussière. « {sound}… », fit {cname}, à peine audible.',
        '{hero} s’accroupit à côté {deCname}. « C’était un accident », dit {hero}. « Ça arrive. Une fois, j’ai fait tomber toute une tour. Avec du jus de pomme dessus. » L’un des petits pouffa de rire. « Moi aussi ! » dit-il. « Et même deux fois ! » Et soudain, le silence ne paraissait plus si lourd.',
        'Puis tout le monde regarda les pierres par terre. Puisqu’elles étaient tombées de toute façon, quelqu’un eut une idée : et si on les remettait un peu autrement ? Avec un virage. Et un petit saut. {cname} poussa délicatement la première pierre à sa nouvelle place. Puis la suivante. Et encore la suivante.',
        'Le nouveau circuit n’était plus exactement comme avant. Il était différent. Il avait maintenant un virage que tout le monde appelait le virage {deCname}, et un saut où les billes volaient un instant dans les airs avant de continuer à rouler. Tout le monde était d’accord : comme ça, c’était encore plus amusant.',
      ],
      older:
        'Plus tard, l’un des petits dit à {cname} : « Tu sais, sans ton saut, on n’aurait jamais construit de virage. » {cname} y réfléchit longtemps, la tête penchée sur le côté. Puis {cname} fit « {sound} » et construisit encore un deuxième virage.',
      farewell: 'Au moment de partir, {cname} déposa {gift} dans la main {deHero}. « {sound} », fit {cname}. Cela voulait dire : merci de ne pas m’avoir laissé tout seul.',
      tagline: 'un virage qui n’existait pas avant',
    },
    together: {
      paragraphs: [
        '{OthersNom} {activity}. Mais aujourd’hui, rien ne marchait. Une énorme pierre ronde bloquait le passage, et tout le monde essayait de la pousser. Les uns poussaient par la gauche, les autres par la droite, et tout le monde criait en même temps. La pierre ne bougeait pas d’un millimètre.',
        '{cname} regarda un moment. Puis {cname} donna un petit coup de coude à {hero} : « {sound} ? » {hero} comprit. « Tu veux dire qu’on demande si on peut aider ? » {cname} hocha la tête. Tout seul, {cname} n’osait pas, alors ils y allèrent ensemble. « On peut vous aider ? » demanda {hero}. « Oh oui, s’il vous plaît ! » répondirent les autres, soulagés.',
        'Mais maintenant, encore plus de voix parlaient en même temps. Chacun avait une idée, et personne n’entendait celle des autres. Alors {cname} s’assit tout simplement et attendit que ce soit un peu plus calme. Puis {cname} fit une fois, deux fois, trois fois : « {sound}. {sound}. {sound}. » Régulier comme un rythme.',
        '« Un rythme ! » s’écria {hero}. « On pousse tous en même temps, à trois ! » Tout le monde se plaça du même côté. « Un… deux… trois ! » Et l’énorme pierre roula. D’abord lentement, puis plus vite, jusqu’à s’arrêter avec un gros boum exactement au bon endroit. Soudain, elle ne gênait plus du tout. Elle devint le début de la plus belle partie du circuit.',
        'Bien sûr, ensuite, tout le monde voulait essayer en premier. Mais {cname} avait déjà une autre idée : chacun reçut une bille, et ils les lancèrent l’une après l’autre. Une, puis la suivante, puis la suivante. Et comme il fallait attendre, on pouvait regarder chaque bille faire tout son voyage. C’était presque le meilleur moment.',
      ],
      older:
        '{hero} regarda autour et remarqua à quel point tout le monde était différent. Certains étaient forts, d’autres rapides, d’autres avaient des idées folles, et {cname} savait garder le rythme comme personne. Personne n’aurait réussi seul. Ensemble, cela avait été presque facile.',
      farewell: 'Au moment de se dire au revoir, les autres offrirent {gift} à {hero}. « {sound} ! » fit {cname}, tout joyeux. Cela voulait dire : on recommence demain ?',
      tagline: 'une pierre qui ne roule qu’ensemble',
    },
    quest: {
      paragraphs: [
        '« Qu’est-ce qui ne va pas ? » demanda doucement {hero}. {cname} montra le lointain et fit un petit « {sound} » tout triste. Peu à peu, {hero} comprit : {cname} avait perdu quelque chose. Quelque chose de très important. Une petite lumière que {cname} regardait chaque soir avant de s’endormir.',
        '« On va la retrouver », dit {hero}. Et les voilà partis à sa recherche. Ils regardèrent derrière les grandes choses et sous les petites. Ils demandèrent de l’aide {othersDat}, qui se mirent aussitôt à chercher eux aussi. Ils cherchèrent en haut, en bas et partout entre les deux.',
        'Juste au moment où {cname} commençait à être très fatigué, {hero} l’aperçut : une minuscule lueur, tout là-haut, à un endroit qu’on ne pouvait atteindre qu’en s’aidant les uns les autres. {hero} fit la courte échelle, {cname} grimpa, plus haut, encore un tout petit peu plus haut… et voilà : réussi !',
        'La petite lumière brillait chaudement entre les pattes {deCname}. {cname} tourna sur lui-même de joie, une fois, deux fois, trois fois, jusqu’à presque tomber. {OthersNom} applaudirent, et {hero} rit tellement que ça chatouillait dans le ventre.',
      ],
      older:
        'Sur le chemin du retour, {cname} raconta comment la lumière s’était perdue, avec beaucoup de « {sound} » et encore plus de gestes. {hero} ne comprenait pas chaque mot. Mais on n’a pas besoin de comprendre chaque mot pour comprendre une histoire.',
      farewell: 'Au moment de partir, {cname} offrit {gift} à {hero}. « {sound} », fit {cname}. Cela voulait dire : merci.',
      tagline: 'une petite lumière perdue',
    },
  },

  title: (hero, cname, settingTitle) => (hero ? `${hero}, ${cname} et ${settingTitle}` : `${cname} et ${settingTitle}`),
  summary: (s, c, t) => `${s}, ${c} et ${t}.`,
};
