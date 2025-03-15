"use client";

import { useState, useEffect, useRef } from "react";
import { encodeMorse, MorseNode, MorseSymbol } from "@/lib/morse";
import MorseTreeVisualization from "./MorseTreeVisualization";
import { Button } from "./ui/button";
import { Play, Pause, RefreshCw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

      // Play the Morse code
      const timeAccumulator = 0;
      playbackInterval.current = setInterval(() => {
        if (currentIndexRef.current >= parts.length) {
          cleanup();
          onComplete();
          onPathUpdate([]);
          onLetterComplete(false);
          return;
        }

        const part = parts[currentIndexRef.current];
        currentPartRef.current = part.type;

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
          onPathUpdate(currentPathRef.current);
          onLetterComplete(false);
        } else if (part.type === "element-gap") {
          // Stop tone during gaps between elements
          if (oscillator.current) {
            oscillator.current.stop();
            oscillator.current.disconnect();
            oscillator.current = null;
          }
        } else if (part.type === "letter-end") {
          // Mark this letter as complete in visualization
          onLetterComplete(true);

          // The sound should already be stopped by element-gap
          if (oscillator.current) {
            oscillator.current.stop();
            oscillator.current.disconnect();
            oscillator.current = null;
          }
        } else if (part.type === "gap" || part.type === "word-gap") {
          // Reset path for next letter
          currentPathRef.current = [];
          onPathUpdate([]);
          onLetterComplete(false);

          // The sound should already be stopped
          if (oscillator.current) {
            oscillator.current.stop();
            oscillator.current.disconnect();
            oscillator.current = null;
          }
        }

        // Move to next part
        currentIndexRef.current++;
      }, timeAccumulator);

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

// Main component for playing Morse code
const MorsePlayer = ({
  text,
  morseTree,
}: {
  text: string;
  morseTree: MorseNode;
}) => {
  const [morseCode, setMorseCode] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [currentPath, setCurrentPath] = useState<MorseSymbol[]>([]);
  const [letterCompleted, setLetterCompleted] = useState<boolean>(false);

  // Convert text to Morse code
  useEffect(() => {
    if (text) {
      setMorseCode(encodeMorse(text));
    } else {
      setMorseCode("");
    }
  }, [text]);

  // Handle playback completion
  const handleComplete = () => {
    setIsPlaying(false);
    setCurrentPath([]);
    setLetterCompleted(false);
  };

  // Handle path updates for visualization
  const handlePathUpdate = (path: MorseSymbol[]) => {
    setCurrentPath(path);
  };

  // Handle letter completed state
  const handleLetterComplete = (completed: boolean) => {
    setLetterCompleted(completed);
  };

  // Toggle play/pause
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setCurrentPath([]);
      setLetterCompleted(false);
    }
  };

  // Reset playback
  const resetPlayback = () => {
    setIsPlaying(false);
    setCurrentPath([]);
    setLetterCompleted(false);
  };

  return (
    <div className="space-y-4">
      <Card className="border-neutral-800 bg-neutral-900">
        <CardHeader>
          <CardTitle className="text-neutral-200">Morse Code Player</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-neutral-400 mb-1">Text</p>
              <p className="text-lg text-neutral-200 font-mono">
                {text || "..."}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-400 mb-1">Morse Code</p>
              <p className="text-lg text-neutral-300 font-mono break-all">
                {morseCode || "..."}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-400 mb-1">Speed</p>
              <Slider
                defaultValue={[1]}
                min={0.5}
                max={2}
                step={0.1}
                value={[playbackRate]}
                onValueChange={(value) => setPlaybackRate(value[0])}
                disabled={isPlaying}
                className="my-2"
              />
              <div className="flex justify-between text-xs text-neutral-500">
                <span>Slow</span>
                <span>{playbackRate.toFixed(1)}x</span>
                <span>Fast</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={resetPlayback}
            disabled={isPlaying}
            className="bg-neutral-800 hover:bg-neutral-700"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={togglePlayback}
            className={`flex-1 ${
              isPlaying
                ? "bg-red-600 hover:bg-red-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 mr-2" /> Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" /> Play
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <MorseTreeVisualization
        morseTree={morseTree}
        currentPath={currentPath}
        isPlaying={isPlaying}
        letterCompleted={letterCompleted}
      />

      <MorseAudio
        morseCode={morseCode}
        isPlaying={isPlaying}
        playbackRate={playbackRate}
        onComplete={handleComplete}
        onPathUpdate={handlePathUpdate}
        onLetterComplete={handleLetterComplete}
      />
    </div>
  );
};

export default MorsePlayer;
