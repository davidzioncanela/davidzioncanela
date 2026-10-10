export const npcFirstNames = [
  'Goomba',
  'Koopa',
  'Shy',
  'Dry',
  'Boo',
  'Piranha',
  'Hammer',
  'Lakitu',
  'Chomp',
  'Thwomp',
  'Spike',
  'Wiggler',
  'Blooper',
  'Cheep',
  'Magikoopa',
  'Monty',
  'Kamek',
  'Rex',
  'Chain',
  'Boom',
];

export const npcLastNames = [
  'Malandro',
  'Traiçoeiro',
  'Furioso',
  'Malvado',
  'Ágil',
  'Gigante',
  'Veloz',
  'Terrível',
  'Sorrateiro',
  'Implacável',
  'Poderoso',
  'Astuto',
  'Cruel',
  'Perigoso',
  'Sinistro',
];

export function generateRandomNPCName(): string {
  const first = npcFirstNames[Math.floor(Math.random() * npcFirstNames.length)];
  const last = npcLastNames[Math.floor(Math.random() * npcLastNames.length)];
  return `${first} ${last}`;
}
