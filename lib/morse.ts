// Morse code mapping
export type MorseSymbol = "." | "-";
export type MorseCode = MorseSymbol[];

// The morse tree structure based on the International Morse Decoding chart
export interface MorseNode {
  letter?: string;
  dot?: MorseNode;
  dash?: MorseNode;
}

// Create a more comprehensive morse tree for English alphabet
export const morseTree: MorseNode = {
  // Starting point (root)
  dot: {
    // E branch
    letter: "E",
    dot: {
      // I branch
      letter: "I",
      dot: {
        // S branch
        letter: "S",
        dot: { letter: "H" },
        dash: { letter: "V" },
      },
      dash: {
        // U branch
        letter: "U",
        dot: { letter: "F" },
        dash: undefined,
      },
    },
    dash: {
      // A branch
      letter: "A",
      dot: {
        // R branch
        letter: "R",
        dot: { letter: "L" },
        dash: undefined,
      },
      dash: {
        // W branch
        letter: "W",
        dot: { letter: "P" },
        dash: { letter: "J" },
      },
    },
  },
  dash: {
    // T branch
    letter: "T",
    dot: {
      // N branch
      letter: "N",
      dot: {
        // D branch
        letter: "D",
        dot: { letter: "B" },
        dash: { letter: "X" },
      },
      dash: {
        // K branch
        letter: "K",
        dot: { letter: "C" },
        dash: { letter: "Y" },
      },
    },
    dash: {
      // M branch
      letter: "M",
      dot: {
        // G branch
        letter: "G",
        dot: { letter: "Z" },
        dash: { letter: "Q" },
      },
      dash: {
        // O branch
        letter: "O",
        dot: undefined,
        dash: undefined,
      },
    },
  },
};

// Debug log the morse tree structure
console.log("Morse tree structure:", JSON.stringify(morseTree, null, 2));

// Morse code map for standard English alphabet and common symbols
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

// Alias for textToMorse to match function name in MorsePlayer
export const encodeMorse = textToMorse;

// Decode morse code to text
export const decodeMorse = (morseCode: string): string => {
  const morseToLetter = Object.entries(morseMap).reduce(
    (acc, [letter, code]) => {
      acc[code] = letter;
      return acc;
    },
    {} as Record<string, string>
  );

  return morseCode
    .split(" ")
    .map((code) => morseToLetter[code] || "")
    .join("");
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
