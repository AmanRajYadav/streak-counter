// ---------------------------------------------------------------------------
// Streak Counter — tuning + content
//
// Everything a teacher might want to change lives in this one file.
// ---------------------------------------------------------------------------

// Vite rewrites this to "/streak-counter/" for the GitHub Pages build and to
// "/" for `npm run dev`, so asset paths work in both places.
export const BASE = import.meta.env.BASE_URL

// The animal GIFs in public/assets/gifs, in reveal order.
// Drop a new file in that folder and add its name here — the app stretches
// automatically, no other change needed.
export const ANIMALS = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
  'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x',
]

// Shown at streak 0.
export const SAD_ANIMAL = 'sad'

// A new animal is revealed every N correct answers.
export const STREAK_PER_ANIMAL = 5

// A new world is unlocked every N correct answers.
// 20 animals x 5 = one full animal cycle per world.
export const STREAK_PER_WORLD = ANIMALS.length * STREAK_PER_ANIMAL // 100

// The journey the class is climbing. 10 worlds x 100 = 1000.
// World 1 keeps the original purple so the game still looks like itself.
export const WORLDS = [
  {
    name: 'Meadow',
    badge: '🌿',
    accent: '#bb6bd9',
    colors: ['#667eea', '#764ba2', '#8e44ad', '#9b59b6', '#bb6bd9'],
  },
  {
    name: 'Ocean',
    badge: '🌊',
    accent: '#48dbfb',
    colors: ['#1e3c72', '#2a5298', '#0083b0', '#00b4db', '#48dbfb'],
  },
  {
    name: 'Desert',
    badge: '🏜️',
    accent: '#ffd166',
    colors: ['#8d5524', '#c68642', '#e0ac69', '#f1c27d', '#ffd166'],
  },
  {
    name: 'Volcano',
    badge: '🌋',
    accent: '#ff9f43',
    colors: ['#2d0a0a', '#7f1d1d', '#c0392b', '#e74c3c', '#ff9f43'],
  },
  {
    name: 'Glacier',
    badge: '❄️',
    accent: '#e0f7ff',
    colors: ['#0b3d5c', '#1b6ca8', '#4a9fd5', '#9bd7f0', '#e0f7ff'],
  },
  {
    name: 'Jungle',
    badge: '🌴',
    accent: '#7bed9f',
    colors: ['#0b3d2e', '#146c43', '#1e8449', '#2ecc71', '#7bed9f'],
  },
  {
    name: 'Sunset',
    badge: '🌅',
    accent: '#ffd3a5',
    colors: ['#3c1053', '#8e2de2', '#d63384', '#ff6b6b', '#ffd3a5'],
  },
  {
    name: 'Thunder',
    badge: '⚡',
    accent: '#f9ca24',
    colors: ['#0f0c29', '#232526', '#302b63', '#4b3f9e', '#6c5ce7'],
  },
  {
    name: 'Aurora',
    badge: '🌌',
    accent: '#a29bfe',
    colors: ['#03001e', '#0f4c75', '#00b8a9', '#7b2ff7', '#f72585'],
  },
  {
    name: 'Cosmos',
    badge: '🌠',
    accent: '#ffd700',
    colors: ['#000014', '#12123a', '#2c1b6b', '#5b2c9e', '#ffd700'],
  },
]

// The headline target. Past this the worlds start again and a ⭐ is added
// for every extra 1000, so the counter never hits a dead end.
export const GOAL = WORLDS.length * STREAK_PER_WORLD // 1000

// Ignore repeat input that arrives faster than this (milliseconds).
// This is what stops a phone tap from counting twice and a held remote
// button from machine-gunning the counter.
export const INPUT_COOLDOWN_MS = 90

// Rotating praise so the 3rd milestone of the lesson does not read like the 1st.
export const SMALL_CHEERS = [
  'Nice one!', 'Keep going!', 'On fire!', 'Brilliant!', 'Superb!',
  'Unstoppable!', 'Sharp!', 'Well played!', 'Rolling!', 'Excellent!',
]

export const BIG_CHEERS = [
  'INCREDIBLE!', 'WHAT A RUN!', 'RECORD PACE!', 'THE CLASS IS ON FIRE!', 'LEGENDARY!',
]

// Where the best-ever streak is remembered between lessons.
export const RECORD_KEY = 'fluence-streak-record'
export const SETTINGS_KEY = 'fluence-streak-settings'

// --- derived helpers -------------------------------------------------------

// Animal, world and celebration all turn over on the same number, so hitting a
// milestone *is* the moment the new friend appears.
export const animalFor = (streak) => {
  if (streak <= 0) return SAD_ANIMAL
  return ANIMALS[Math.floor(streak / STREAK_PER_ANIMAL) % ANIMALS.length]
}

export const gifUrl = (animal) => `${BASE}assets/gifs/${animal}.gif`

export const soundUrl = (name) => `${BASE}assets/sounds/${name}.mp3`

export const worldFor = (streak) => {
  const lap = Math.floor(Math.max(0, streak) / STREAK_PER_WORLD)
  const index = lap % WORLDS.length
  return { ...WORLDS[index], index, number: index + 1 }
}

// How many complete laps of 1000 the class has banked.
export const starsFor = (streak) => Math.floor(streak / GOAL)

// 0 = not a milestone, 1 = every 5, 2 = every 25, 3 = every 100.
export const milestoneTier = (streak) => {
  if (streak <= 0) return 0
  if (streak % STREAK_PER_WORLD === 0) return 3
  if (streak % 25 === 0) return 2
  if (streak % STREAK_PER_ANIMAL === 0) return 1
  return 0
}
