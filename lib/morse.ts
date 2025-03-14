// Morse code mapping
export type MorseSymbol = "." | "-";
export type MorseCode = MorseSymbol[];

// The morse tree structure based on the International Morse Decoding chart
export interface MorseNode {
  letter?: string;
  dot?: MorseNode;
  dash?: MorseNode;
}

// Create the morse tree according to the image provided
export const morseTree: MorseNode = {
  // Starting point (top arrow)
  dot: {
    // E branch
    letter: "E",
    dot: {
      // I branch
      letter: "I",
      dot: { letter: "S" },
      dash: { letter: "U" },
    },
    dash: {
      // A branch
      letter: "A",
      dot: { letter: "R" },
      dash: { letter: "W" },
    },
  },
  dash: {
    // T branch
    letter: "T",
    dot: {
      // N branch
      letter: "N",
      dot: { letter: "D" },
      dash: { letter: "K" },
    },
    dash: {
      // M branch
      letter: "M",
      dot: { letter: "G" },
      dash: { letter: "O" },
    },
  },
};

// Additional letters not in the tree (these would need their own paths in a complete implementation)
export const morseMap: Record<string, string> = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "'": ".----.",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "&": ".-...",
  ":": "---...",
  ";": "-.-.-.",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  _: "..-.-",
  '"': ".-..-.",
  $: "...-..-",
  "!": "-.-.--",
  "@": ".--.-.",
  " ": "/",
};

// Convert a string to morse code
export const textToMorse = (text: string): string => {
  return text
    .toUpperCase()
    .split("")
    .map((char) => morseMap[char] || "")
    .filter(Boolean)
    .join(" ");
};

// Traverse the morse tree to find a letter
export const traverseMorseTree = (code: MorseSymbol[]): string | null => {
  let node = morseTree;

  for (const symbol of code) {
    if (symbol === ".") {
      node = node.dot || {};
    } else if (symbol === "-") {
      node = node.dash || {};
    }

    if (!node.dot && !node.dash && !node.letter) {
      return null; // Invalid path
    }
  }

  return node.letter || null;
};

// Get the path through the tree for a specific letter
export const getLetterPath = (letter: string): MorseSymbol[] | null => {
  const morseCode = morseMap[letter.toUpperCase()];

  if (!morseCode) return null;

  return morseCode
    .split("")
    .map((symbol) => (symbol === "." ? "." : "-")) as MorseSymbol[];
};

// Calculate timing for morse code playback (in milliseconds)
export const timings = {
  dot: 100, // Duration of a dot
  dash: 300, // Duration of a dash (3x dot)
  symbolGap: 100, // Gap between symbols within a character (same as dot duration)
  letterGap: 300, // Gap between letters (3x dot)
  wordGap: 700, // Gap between words (7x dot)
};
