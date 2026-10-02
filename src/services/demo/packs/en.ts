import type { LangPack } from './types';

const poss = (name: string) => (/s$/i.test(name) ? `${name}’` : `${name}’s`);

export const en: LangPack = {
  heroFallback: 'Mika',
  heroVars: (hero) => ({ heroPoss: poss(hero), deHero: hero }),
  creatureVars: (name) => ({ cnamePoss: poss(name), deCname: name }),
  listJoin: (items) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`),
  lowercaseInterests: true,

  moods: {
    adventure: {
      opening: 'Some adventures begin very quietly – with a blink, a hum, or a sound you almost miss.',
      ending: 'And {hero} knew: the next adventure was already waiting. Maybe it would blink tomorrow.',
    },
    funny: {
      opening: 'There are days when even the socks giggle a little. Today was one of those days.',
      ending: 'And somewhere far, far away, {cname} went “{sound}” one more time – so loudly that even the moon had to giggle.',
    },
    calm: {
      opening: 'It was a quiet, soft evening, and the light in the room was as warm as a mug of cocoa.',
      ending: '{hero} breathed in deeply, and slowly out again. Everything was quiet. Everything was good.',
    },
    magical: {
      opening: 'If you look very closely, you sometimes notice it: the world has little doors that stay open for just a moment.',
      ending: 'And if you looked very closely, a tiny bit of magic was still sparkling on the windowsill.',
    },
    discovery: {
      opening: '{hero} had always loved asking questions. How does that work? What is behind it? And what happens if you look even closer?',
      ending: 'New questions were already bubbling up in {heroPoss} head. And that was the best part.',
    },
    bedtime: {
      opening: 'Outside it was getting dark, and the stars came out one by one, as if someone were quietly switching them on.',
      ending: 'Eyes grew heavy, the blanket was warm, and very softly, very slowly, {hero} fell asleep. Good night.',
    },
  },

  settings: {
    space: {
      title: 'the Dandelion Station',
      summary: 'A journey to the Dandelion space station',
      place: 'on the station',
      portal:
        'One evening, the window in {heroPoss} room began to hum. Outside, a small round spaceship was floating, no bigger than a wardrobe. It blinked kindly: orange, blue, orange. Then the hatch opened with a soft pffft, as if the ship were saying: hop in!',
      arrival:
        '{hero} climbed onto the soft seat, and the spaceship rose up – over the rooftops, over the clouds, until the Earth looked like a blue marble. {interestsLine}Then it appeared in front of them: the Dandelion space station. It looked like a giant dandelion made of light, and from each of its fine threads hung a small, glowing house.',
      hiding: 'In the station’s greenhouse, between moon tomatoes and giant blue pumpkins, something rustled.',
      othersNom: 'the moon-hoppers',
      OthersNom: 'The moon-hoppers',
      othersDat: 'the moon-hoppers',
      othersDesc: 'fluffy little creatures with long ears who floated a little with every step',
      activity: 'were building a marble run out of glowing stones that ran right across the whole hall',
      gift: 'a sparkling star pebble',
      ret:
        'When the station slowly hummed itself to sleep, the little spaceship brought {hero} home. It landed gently outside the window, blinked one last time – orange, blue, orange – and disappeared among the stars.',
    },
    ocean: {
      title: 'the City of Pearlshine',
      summary: 'A journey to the coral city of Pearlshine',
      place: 'in the coral city',
      portal:
        'One evening, right in the middle of teeth-brushing, a shimmering bubble rose out of the sink. It grew bigger and bigger, until it was as big as an armchair. Inside it rocked a little seashell boat, and it seemed to say: come along!',
      arrival:
        'As soon as {hero} sat inside, the bubble floated away – through the window, over the meadows, and down into the deep blue sea. Fish glided past like colourful ribbons. {interestsLine}Then something glowed beneath them: the coral city of Pearlshine, with houses made of shells and street lamps that were really friendly jellyfish.',
      hiding: 'Behind a curtain of swaying seaweed, something bubbled.',
      othersNom: 'the seahorse children',
      OthersNom: 'The seahorse children',
      othersDat: 'the seahorse children',
      othersDesc: 'little seahorses with curly tails who made bubbles whenever they laughed',
      activity: 'were building a long marble run out of sand and shells, and the current pushed shiny marbles through it',
      gift: 'a shimmering pearl',
      ret:
        'When the sea slowly grew darker, the bubble carried {hero} back up, through the window, into the warm room. With a soft plop, it was gone.',
    },
    forest: {
      title: 'the Mosslight Tree Village',
      summary: 'A journey to the tree village of Mosslight',
      place: 'in the tree village',
      portal:
        'One evening, {hero} noticed something strange in the garden: in the old apple tree there was a tiny door with a round handle made of moss. That door had never been there before. And from underneath it, a warm light was glowing.',
      arrival:
        '{hero} opened the door very carefully – and behind it was a forest where the leaves tinkled softly whenever the wind brushed through them. {interestsLine}A path of glowing mushrooms led to the tree village of Mosslight, where little rope bridges swayed from tree to tree.',
      hiding: 'Under a big fern, right at the edge of the village, something was trembling.',
      othersNom: 'the squirrel children',
      OthersNom: 'The squirrel children',
      othersDat: 'the squirrel children',
      othersDesc: 'little squirrels with bushy tails who climbed faster than you could watch',
      activity: 'were building a marble run out of twigs and bark that ran from branch to branch',
      gift: 'a shiny acorn',
      ret:
        'When the mushrooms along the path began to glow more softly, {hero} walked back to the little door in the apple tree. The garden was quiet. And when {hero} turned around one last time, the door was just a piece of bark again.',
    },
  },

  creatures: {
    dino: {
      name: 'Tiko',
      sound: 'Peep-mrrr',
      indef: 'a tiny green baby dinosaur with round eyes and a tail that swished back and forth with excitement',
      summary: 'a baby dinosaur called Tiko',
    },
    dragon: {
      name: 'Pim',
      sound: 'Pfff-pff',
      indef: 'a little dragon, no bigger than a cat, with wings like crumpled tissue paper',
      summary: 'a little dragon called Pim',
    },
    otter: {
      name: 'Lulu',
      sound: 'Kee-kee',
      indef: 'a little otter pup with shiny fur and whiskers that trembled with curiosity',
      summary: 'an otter pup called Lulu',
    },
  },

  discovery:
    '{hiding} {hero} crouched down and peeked carefully. Two big eyes looked up at {hero}. There sat {creatureIndef}. “Hello,” whispered {hero}. “I’m {hero}.” The little creature only made a tiny sound: “{sound}.” A little tag hung from its collar, and on it was written: {cname}.',

  interestsLine:
    'On the way, {hero} thought about all the things that make a heart beat faster: {interests}. And it felt as if this journey were heading right there. ',

  arcs: {
    contact: {
      paragraphs: [
        '“Are you here all alone?” asked {hero}. {cname} looked over to the side. Not far away, {othersNom} were playing – {othersDesc}. They {activity}. It looked wonderful. {cname} took a small step forward – and then, very quickly, a step back again.',
        '{hero} knew that feeling. Sometimes you really want to join in, and still your feet just stay where they are. Your tummy tingles, and all the words hide somewhere at the back of your throat. “Shall we just watch together for a bit?” asked {hero}. {cname} nodded. So they sat side by side and watched. Just watching. That was allowed.',
        'While they watched, they noticed something: the marble run had a gap. Every time, at the very same spot, the marble jumped out and rolled away, and the others sighed. {cnamePoss} eyes grew wide, and {cname} nudged {hero}. Then {cname} pulled something out from a hiding place: {gift}. Exactly the size of the gap.',
        '“Shall we take it over together?” {hero} asked quietly. {cname} hesitated. Then came a tiny nod. Step by step, they walked over. {cname} didn’t say a word, but carefully placed the little treasure into the gap and went, very softly: “{sound}?” For a moment everything was still. Then the next marble rolled off – over the little treasure, through the whole run, all the way to the bottom. Click!',
        '“Again!” shouted one of the little ones. And another one asked: “What’s your name?” {cname} looked at {hero}. {hero} just smiled and waited. Then {cname} said, for the first time a tiny bit louder: “{sound} … {cname}!” One of the little ones copied it straight away: “{sound}!” Everyone had to laugh, and {cname} laughed too. And {hero}? {hero} simply joined in the building, as if {hero} had always been part of the gang.',
      ],
      older:
        'Later, as the marble run grew longer and longer, {hero} watched {cname} closely. {cname} hadn’t suddenly become loud. {cname} still spoke softly and sometimes looked at the ground. But now {cname} knew a way: first watch, then show something small, then say a single word. And when someone asked whether {cname} would come back tomorrow, {cname} went “{sound}” twice.',
      farewell:
        'When it was time to go, {cname} snuggled up close to {hero}. “{sound},” went {cname}, and this time it sounded like: thank you. And like: see you soon.',
      tagline: 'a first quiet hello',
    },
    courage: {
      paragraphs: [
        '{cname} really wanted to get to {othersDat}, who were playing high up {place}. But the only way there led across a long, narrow bridge made of light. It swayed gently from side to side, and from below it looked endlessly long.',
        '{cname} put one paw on the first plank. It wobbled. Quickly, {cname} pulled the paw back. “{sound},” went {cname}, very small. {hero} knew that feeling well. When something is new, it often looks much bigger than it really is. “You know what?” said {hero}. “We don’t have to do the whole bridge at once. Just the first plank.”',
        'So – just the first plank. It wobbled a little, and it held. Then the second. “One,” counted {hero}. “Two.” At the fifth plank, {cname} stopped and took a deep breath in, and out. {hero} waited. Nobody had to hurry. At the sixth plank, {cname} counted along: “{sound}, {sound}!”',
        'In the middle of the bridge, something strange happened. From up here, you could see everything: the lights, the paths, and even the little spot where they had started. It didn’t look so far away anymore. The bridge was still wobbling. But now the wobbling felt a little bit like swinging.',
        'At the end waited {othersNom}, {othersDesc}. “You came across the bridge!” they called. {cname} puffed up proudly. And when the others asked who wanted a slide race, {cname} wasn’t the first one down the slide – but {cname} was there. And so was {hero}.',
      ],
      older:
        'On the way back, {cname} walked across the bridge all alone. Not fast, but without stopping. {hero} followed and quietly counted along, plank by plank, all the way to the end. Funny, thought {hero}: the same bridge as before. And yet a completely different one.',
      farewell: 'When it was time to say goodbye, {cname} gave {hero} {gift}. “{sound},” went {cname}. It sounded like: until the next first plank.',
      tagline: 'a wobbly bridge and its very first plank',
    },
    mistakes: {
      paragraphs: [
        '{cname} tugged excitedly at {heroPoss} sleeve. {OthersNom} {activity}. “Can we help?” asked {hero}, and the others nodded straight away. {cname} jumped for joy – and with that jump, {cnamePoss} tail caught a whole piece of the marble run.',
        'Clatter. Rattle. And then a big piece of the run lay on the ground. Everyone went quiet. {cname} froze and wished to become very small, as small as a speck of dust. “{sound} …” went {cname}, barely to be heard.',
        '{hero} crouched down next to {cname}. “That was an accident,” said {hero}. “It happens. Once I knocked over a whole tower. With juice on top.” One of the little ones giggled. “Me too!” it said. “Twice, actually!” And suddenly the silence didn’t feel so heavy anymore.',
        'Then everyone looked at the stones on the ground. Since they had fallen out anyway, someone had an idea: what if we put them back a little differently? With a curve. And a little jump. {cname} carefully pushed the first stone into its new place. Then the next one. And the next.',
        'The new marble run wasn’t exactly like before. It was different. Now it had a curve that everyone simply called the {cname} Curve, and a jump where the marbles flew through the air for a moment before rolling on. Everyone agreed: this way it was even more fun.',
      ],
      older:
        'Later, one of the little ones said to {cname}: “You know, without your jump we would never have built a curve.” {cname} thought about that for a long time, head tilted to one side. Then {cname} went “{sound}” – and built a second curve as well.',
      farewell: 'When it was time to go, {cname} put {gift} into {heroPoss} hand. “{sound},” went {cname}. It sounded like: thank you for staying with me.',
      tagline: 'a curve that wasn’t there before',
    },
    together: {
      paragraphs: [
        '{OthersNom} {activity}. But today nothing was working. A huge round stone lay right in the way, and everyone was trying to push it aside. Some pushed from the left, some from the right, and everyone was shouting at once. The stone didn’t move a single millimetre.',
        '{cname} watched for a while. Then {cname} nudged {hero}: “{sound}?” {hero} understood. “You mean we should ask if we can help?” {cname} nodded. {cname} didn’t dare to go alone, so they went over together. “Can we help?” asked {hero}. “Yes, please!” the others called, relieved.',
        'But now even more voices were talking at once. Everyone had an idea, and nobody could hear anyone else’s. So {cname} simply sat down and waited until it got a little quieter. Then {cname} went once, twice, three times: “{sound}. {sound}. {sound}.” As steady as a beat.',
        '“A beat!” cried {hero}. “Let’s all push at the same time – on three!” Everyone lined up on the same side. “One … two … three!” And the huge stone rolled. Slowly at first, then faster, until it landed with a deep thump in exactly the right spot. Suddenly it wasn’t in the way anymore. It was the start of the best part of the whole marble run.',
        'Of course, afterwards everyone wanted to go first. But {cname} already had another idea: everyone got one marble, and they let them roll one after another – one, then the next, then the next. And because you had to wait, you could watch every single marble on its journey. That was almost the best part.',
      ],
      older:
        '{hero} looked around and noticed how different everyone was. Some were strong, some were fast, some had wild ideas, and {cname} could keep the beat like nobody else. Nobody could have done it alone. Together it had been almost easy.',
      farewell: 'When it was time to say goodbye, the others gave {hero} {gift}. “{sound}!” went {cname} happily. It sounded like: again tomorrow?',
      tagline: 'a stone that only rolls together',
    },
    quest: {
      paragraphs: [
        '“What’s the matter?” {hero} asked gently. {cname} pointed into the distance and made a sad little “{sound}”. Bit by bit, {hero} understood: {cname} had lost something. Something very important. A little light that {cname} looked at every evening before falling asleep.',
        '“We’ll find it,” said {hero}. And so they set off to search. They looked behind big things and under small ones. They asked {othersDat}, who started helping right away. They searched high and low and everywhere in between.',
        'Just when {cname} was getting very tired, {hero} spotted it: a tiny shimmer, high up, in a place you could only reach if you helped each other. {hero} made a step with both hands, {cname} climbed up – higher, a tiny bit higher – and then: got it!',
        'The little light glowed warmly between {cnamePoss} paws. {cname} spun around with joy, once, twice, three times, until {cname} almost fell over. {OthersNom} cheered, and {hero} laughed so much that it tickled inside.',
      ],
      older:
        'On the way back, {cname} told the whole story of how the light got lost – with lots of “{sound}” and even more waving paws. {hero} didn’t understand every word. But you don’t have to understand every word to understand a story.',
      farewell: 'When it was time to go, {cname} gave {hero} {gift}. “{sound},” went {cname}. It sounded like: thank you.',
      tagline: 'a little lost light',
    },
  },

  title: (hero, cname, settingTitle) => (hero ? `${hero}, ${cname} and ${settingTitle}` : `${cname} and ${settingTitle}`),
  summary: (s, c, t) => `${s}, ${c} and ${t}.`,
};
