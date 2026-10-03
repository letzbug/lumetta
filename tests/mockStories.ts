// Test data only. A hand-written stand-in for what a live model returns for
// "George / 6 / red car / English" – used to verify the pipeline and the
// critic. It is NOT used by the app.
export const RED_CAR_STORY = `Every Saturday, {{HERO}} helped Grandpa wash the red car. It was an old car, round like a beetle, and Grandpa called it Tomato. Tomato had one strange habit: its horn did not go BEEP. It went "Ba-doo-ba".

"Why does the red car sing?" {{HERO}} asked once.
"It doesn't sing," said Grandpa. "It hums. Very different."

This Saturday, the red car would not hum at all. {{HERO}} pressed the horn. Nothing. He pressed it again. Only a tiny scratching sound came from somewhere behind the shiny front grille of the red car.

"Maybe Tomato has a cold," said {{HERO}}.
Grandpa frowned. "Cars don't get colds."
"Then why is the red car scratching?"

They knelt down on the wet driveway. {{HERO}} pressed his ear against the warm red metal. Scratch. Scratch. Then, very small: "Cheep."
Behind the grille, tucked between two pipes, sat a nest. In the nest sat a sparrow, puffed up and furious, staring at {{HERO}} as if the red car were her house and he was the visitor without an invitation.

"Well," said Grandpa slowly. "That explains the hum."
"We have to get her out," said {{HERO}}.
"We can't. There are eggs." Grandpa scratched his chin. "And I need the car on Monday."

{{HERO}} looked at the red car. He looked at the sparrow. Then he had an idea. He ran to the garage and came back with the old shoebox, the soft cloth from the car washing bucket, and a roll of tape.

They built a new nest box and fixed it to the fence right next to the red car, where the sparrow could still see her old home. Grandpa lifted the nest out, slowly, slowly, and set it inside the box. The sparrow fluttered, complained, landed on the side mirror of the red car, and glared. Then she hopped into the box.

On Monday, Grandpa started the red car. He pressed the horn.
"Ba-doo-ba!"
And from the fence came an answer: "Cheep!"

Since then, whenever the red car leaves the driveway, it hums twice. Grandpa says that is just the horn. {{HERO}} knows it is saying goodbye.`;

/** Reconstruction of the faulty V1 output George received – must be rejected. */
export const OLD_V1_GEORGE = `One evening, george noticed something strange in the garden: in the old apple tree there was a tiny door with a round handle made of moss. That door had never been there before. And from underneath it, a warm light was glowing.

george opened the door very carefully – and behind it was a forest where the leaves tinkled softly. On the way, george thought about all the things that make a heart beat faster: red car. And it felt as if this journey were heading right there. A path of glowing mushrooms led to the tree village of Mosslight.

Under a big fern something was trembling. There sat a little otter pup with shiny fur. On its collar was written: Lulu.

“What’s the matter?” george asked gently. Lulu had lost something. A little light. They searched high and low and found it at last.

When the mushrooms along the path began to glow more softly, george walked back to the little door in the apple tree.`;
