"use client";

import { useRef, useEffect } from "react";
import { MorseSymbol } from "@/lib/morse";

// The MorseAudio component handles the actual sound playback
const MorseAudio = ({
  morseCode,
  isPlaying,
  playbackRate,
  onComplete,
  onPathUpdate,
  onLetterComplete,
}: {
  morseCode: string;
  isPlaying: boolean;
  playbackRate: number;
  onComplete: () => void;
  onPathUpdate: (path: MorseSymbol[]) => void;
  onLetterComplete: (completed: boolean) => void;
}) => {
  const audioContext = useRef<AudioContext | null>(null);
  const oscillator = useRef<OscillatorNode | null>(null);
  const playbackInterval = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef<number>(0);
  const currentPathRef = useRef<MorseSymbol[]>([]);
  const currentPartRef = useRef<string>("");

  // Create audio context if needed
  useEffect(() => {
    if (!audioContext.current) {
      audioContext.current = new AudioContext();
    }

    return () => {
      if (audioContext.current) {
        audioContext.current.close();
        audioContext.current = null;
      }
    };
  }, []);

  // For debugging
  useEffect(() => {
    console.log("Audio component received morse code:", morseCode);
  }, [morseCode]);

  // Handle playback logic
  useEffect(() => {
    if (!morseCode || !audioContext.current) return;

    // Clean up function for any running interval
    const cleanup = () => {
      if (playbackInterval.current) {
        clearInterval(playbackInterval.current);
        playbackInterval.current = null;
      }

      if (oscillator.current) {
        oscillator.current.stop();
        oscillator.current.disconnect();
        oscillator.current = null;
      }
    };

    // Start playback
    if (isPlaying) {
      // Calculate timing based on playback rate
      // Standard dit length (in milliseconds)
      const ditLength = 1200 / playbackRate;
      // Standard dah length (3x dit length)
      const dahLength = ditLength * 3;
      // Standard gap between elements within a character
      const elementGap = ditLength;
      // Standard gap between characters (3x dit length)
      const charGap = ditLength * 3;
      // Standard gap between words (7x dit length)
      const wordGap = ditLength * 7;

      // Start fresh
      currentIndexRef.current = 0;
      currentPathRef.current = [];

      // Parse the Morse code into parts for timing
      const parts: { type: string; duration: number }[] = [];
      let currentChar = "";

      // Process each character in the Morse code
      for (let i = 0; i < morseCode.length; i++) {
        const char = morseCode[i];

        if (char === ".") {
          parts.push({ type: "dit", duration: ditLength });
          currentChar += ".";
        } else if (char === "-") {
          parts.push({ type: "dah", duration: dahLength });
          currentChar += "-";
        } else if (char === " ") {
          // Check if it's a space between characters or words
          if (i < morseCode.length - 1 && morseCode[i + 1] === "/") {
            // Word gap (we'll handle the "/" in the next iteration)
            parts.push({ type: "letter-end", duration: 0 });
            currentChar = "";
          } else if (currentChar) {
            // Character gap
            parts.push({ type: "letter-end", duration: 0 });
            parts.push({ type: "gap", duration: charGap });
            currentChar = "";
          }
        } else if (char === "/") {
          // Word gap (already handled the space before it)
          parts.push({ type: "word-gap", duration: wordGap });
          currentChar = "";
        }

        // Add element gap between dots and dashes within a character
        if (
          (char === "." || char === "-") &&
          i < morseCode.length - 1 &&
          (morseCode[i + 1] === "." || morseCode[i + 1] === "-")
        ) {
          parts.push({ type: "element-gap", duration: elementGap });
        }
      }

      // Add final letter-end if there was a character
      if (currentChar) {
        parts.push({ type: "letter-end", duration: 0 });
      }

      // For debugging
      console.log("Parsed Morse code parts:", parts);

      // Play the Morse code
      const playNextPart = () => {
        if (currentIndexRef.current >= parts.length) {
          cleanup();
          onComplete();
          onPathUpdate([]);
          onLetterComplete(false);
          return;
        }

        const part = parts[currentIndexRef.current];
        currentPartRef.current = part.type;
        console.log(
          `Playing part: ${part.type} (index ${currentIndexRef.current})`
        );

        // Handle different part types
        if (part.type === "dit" || part.type === "dah") {
          // Start tone
          if (!oscillator.current && audioContext.current) {
            oscillator.current = audioContext.current.createOscillator();
            oscillator.current.type = "sine";
            oscillator.current.frequency.setValueAtTime(
              600,
              audioContext.current.currentTime
            );

            const gainNode = audioContext.current.createGain();
            // Apply a slight envelope to avoid clicks
            gainNode.gain.setValueAtTime(0, audioContext.current.currentTime);
            gainNode.gain.linearRampToValueAtTime(
              0.5,
              audioContext.current.currentTime + 0.01
            );

            oscillator.current.connect(gainNode);
            gainNode.connect(audioContext.current.destination);
            oscillator.current.start();
          }

          // Update visualization path
          if (part.type === "dit") {
            currentPathRef.current.push(".");
          } else if (part.type === "dah") {
            currentPathRef.current.push("-");
          }

          // Update the UI with the current path
          console.log(
            `Current path updated: ${currentPathRef.current.join("")}`
          );
          onPathUpdate([...currentPathRef.current]);
          onLetterComplete(false);

          // Schedule the next part
          setTimeout(
            () => {
              currentIndexRef.current++;
              playNextPart();
            },
            part.type === "dit" ? ditLength : dahLength
          );
        } else if (part.type === "element-gap") {
          // Stop tone during gaps between elements
          if (oscillator.current) {
            oscillator.current.stop();
            oscillator.current.disconnect();
            oscillator.current = null;
          }

          // Schedule the next part
          setTimeout(() => {
            currentIndexRef.current++;
            playNextPart();
          }, elementGap);
        } else if (part.type === "letter-end") {
          // Mark this letter as complete in visualization
          console.log(`Letter completed: ${currentPathRef.current.join("")}`);
          onLetterComplete(true);

          // The sound should already be stopped by element-gap
          if (oscillator.current) {
            oscillator.current.stop();
            oscillator.current.disconnect();
            oscillator.current = null;
          }

          // Add a slight delay to see the letter complete state
          setTimeout(() => {
            currentIndexRef.current++;
            playNextPart();
          }, 500); // Half a second to see the letter completion
        } else if (part.type === "gap" || part.type === "word-gap") {
          // Reset path for next letter
          currentPathRef.current = [];
          console.log("Path reset for next letter/word");
          onPathUpdate([]);
          onLetterComplete(false);

          // The sound should already be stopped
          if (oscillator.current) {
            oscillator.current.stop();
            oscillator.current.disconnect();
            oscillator.current = null;
          }

          // Schedule the next part
          setTimeout(
            () => {
              currentIndexRef.current++;
              playNextPart();
            },
            part.type === "gap" ? charGap : wordGap
          );
        }
      };

      // Start the playback process
      playNextPart();

      return cleanup;
    } else {
      // Stop playback if not playing
      cleanup();
    }

    return cleanup;
  }, [
    isPlaying,
    morseCode,
    playbackRate,
    onComplete,
    onPathUpdate,
    onLetterComplete,
  ]);

  return null;
};

export default MorseAudio;
