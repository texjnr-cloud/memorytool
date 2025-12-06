/**
 * Mnemonic Hook Generator Service
 *
 * This is a placeholder implementation that generates creative mnemonic hooks
 * to help remember people's names. In a production version, this would integrate
 * with an LLM API (like Claude, GPT, etc.) to generate more sophisticated hooks.
 */

interface MnemonicGeneratorParams {
  name: string;
  contextNotes?: string;
}

/**
 * Generate a mnemonic hook for remembering a person's name
 *
 * PLACEHOLDER IMPLEMENTATION:
 * This function currently uses simple template-based generation.
 * Replace this with actual LLM API integration for production.
 *
 * Example LLM API integration:
 * ```typescript
 * const response = await fetch('https://api.anthropic.com/v1/messages', {
 *   method: 'POST',
 *   headers: {
 *     'x-api-key': API_KEY,
 *     'anthropic-version': '2023-06-01',
 *     'content-type': 'application/json'
 *   },
 *   body: JSON.stringify({
 *     model: 'claude-3-sonnet-20240229',
 *     max_tokens: 200,
 *     messages: [{
 *       role: 'user',
 *       content: `Create a vivid, memorable mnemonic hook...`
 *     }]
 *   })
 * });
 * ```
 */
export async function generateMnemonicHook(
  params: MnemonicGeneratorParams
): Promise<string> {
  const { name, contextNotes } = params;

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // PLACEHOLDER: Simple template-based generation
  // In production, this should call an LLM API

  const templates = [
    `Picture ${name} wearing a vibrant ${getRandomColor()} ${getRandomItem()} while ${getRandomAction()}.`,
    `Imagine ${name} standing in ${getRandomPlace()}, holding a giant ${getRandomObject()}.`,
    `${name} sounds like "${getSoundAlike(name)}" - picture them ${getRandomAction()} with a ${getRandomObject()}.`,
    `Remember ${name} by thinking: ${getFirstLetter(name)} for ${getWordStartingWith(getFirstLetter(name))}, surrounded by ${getRandomColor()} ${getRandomItem()}s.`,
  ];

  let mnemonic = templates[Math.floor(Math.random() * templates.length)];

  // Add context if provided
  if (contextNotes && contextNotes.trim()) {
    mnemonic += ` You met them ${contextNotes}.`;
  }

  return mnemonic;
}

// Helper functions for placeholder generation

function getRandomColor(): string {
  const colors = ['crimson', 'golden', 'emerald', 'sapphire', 'violet', 'silver', 'neon', 'rainbow'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getRandomItem(): string {
  const items = ['hat', 'cape', 'crown', 'glasses', 'scarf', 'umbrella', 'badge', 'balloon'];
  return items[Math.floor(Math.random() * items.length)];
}

function getRandomAction(): string {
  const actions = [
    'dancing',
    'juggling colorful balls',
    'singing loudly',
    'conducting an orchestra',
    'painting a masterpiece',
    'playing a guitar',
    'doing magic tricks',
  ];
  return actions[Math.floor(Math.random() * actions.length)];
}

function getRandomPlace(): string {
  const places = [
    'a sunny meadow',
    'a snowy mountain peak',
    'a bustling marketplace',
    'an ancient library',
    'a tropical beach',
    'a starlit observatory',
  ];
  return places[Math.floor(Math.random() * places.length)];
}

function getRandomObject(): string {
  const objects = [
    'telescope',
    'book',
    'compass',
    'lantern',
    'paintbrush',
    'crystal ball',
    'musical note',
    'butterfly net',
  ];
  return objects[Math.floor(Math.random() * objects.length)];
}

function getSoundAlike(name: string): string {
  // Very simple sound-alike generation
  // In production, use more sophisticated phonetic matching
  const soundAlikes: { [key: string]: string } = {
    john: 'gone',
    mary: 'merry',
    david: 'gave it',
    sarah: 'sahara',
    michael: 'my call',
    lisa: 'pizza',
    james: 'games',
    jennifer: 'gentle fur',
  };

  const lowerName = name.toLowerCase().split(' ')[0];
  return soundAlikes[lowerName] || name.toLowerCase();
}

function getFirstLetter(name: string): string {
  return name.charAt(0).toUpperCase();
}

function getWordStartingWith(letter: string): string {
  const words: { [key: string]: string } = {
    A: 'Adventure',
    B: 'Brilliant',
    C: 'Creative',
    D: 'Dynamic',
    E: 'Energetic',
    F: 'Friendly',
    G: 'Generous',
    H: 'Happy',
    I: 'Innovative',
    J: 'Joyful',
    K: 'Kind',
    L: 'Lively',
    M: 'Magnetic',
    N: 'Noble',
    O: 'Optimistic',
    P: 'Passionate',
    Q: 'Quick',
    R: 'Radiant',
    S: 'Spirited',
    T: 'Thoughtful',
    U: 'Unique',
    V: 'Vibrant',
    W: 'Wonderful',
    X: 'eXtraordinary',
    Y: 'Youthful',
    Z: 'Zealous',
  };

  return words[letter] || 'Amazing';
}
