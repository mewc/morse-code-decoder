import { MorseSymbol, timings } from "./morse";

// Create audio context
let audioContext: AudioContext | null = null;

// Track mute state
let isMuted: boolean = false;

// Set mute state
export const setMuted = (muted: boolean): void => {
  isMuted = muted;
};

// Get current mute state
export const getMuted = (): boolean => {
  return isMuted;
};

// Initialize audio context on first user interaction
const initAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Create a beep sound
const createBeep = (
  duration: number,
  frequency: number = 700,
  volume: number = 0.7
): Promise<void> => {
  return new Promise((resolve) => {
    // If muted, just resolve without playing sound
    if (isMuted) {
      setTimeout(resolve, duration);
      return;
    }

    const context = initAudioContext();

    // Create oscillator
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    // Create gain node for volume control
    const gainNode = context.createGain();
    gainNode.gain.value = volume;

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    // Schedule the beep
    oscillator.start();

    // Stop after the duration
    setTimeout(() => {
      oscillator.stop();
      resolve();
    }, duration);
  });
};

// Store the active timeout IDs to allow cancellation
let activeTimeouts: NodeJS.Timeout[] = [];

// Generate Morse code audio
export const generateMorseAudio = (
  morseCode: string,
  onSymbolPlay: (index: number, symbol: MorseSymbol) => void,
  onComplete: () => void
): void => {
  // Clear any currently playing sounds
  clearMorseAudio();

  const symbols = morseCode.replace(/\s/g, "").split("") as MorseSymbol[];
  let currentTime = 0;

  symbols.forEach((symbol, index) => {
    // Schedule each symbol to play at the right time
    const timeout = setTimeout(async () => {
      const duration = symbol === "." ? timings.dot : timings.dash;
      await createBeep(duration);
      onSymbolPlay(index, symbol);
    }, currentTime);

    activeTimeouts.push(timeout);

    // Update the timing for the next symbol
    currentTime += symbol === "." ? timings.dot : timings.dash;
    currentTime += timings.symbolGap;
  });

  // Schedule the completion callback
  const completeTimeout = setTimeout(() => {
    onComplete();
  }, currentTime);

  activeTimeouts.push(completeTimeout);
};

// Clear all active timeouts to stop audio playback
export const clearMorseAudio = (): void => {
  activeTimeouts.forEach((timeout) => clearTimeout(timeout));
  activeTimeouts = [];

  // Stop any active audio context
  if (audioContext) {
    const context = audioContext;
    // Create a new empty oscillator and stop it immediately to stop any ongoing sounds
    const emptyOscillator = context.createOscillator();
    emptyOscillator.connect(context.destination);
    emptyOscillator.start();
    emptyOscillator.stop();
  }
};
