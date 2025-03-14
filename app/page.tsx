"use client";

import { useState, useEffect } from "react";
import { morseTree, MorseSymbol, morseMap } from "@/lib/morse";
import { clearMorseAudio } from "@/lib/audio";
import { MorseTreeVisualization } from "@/components/morse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

export default function Home() {
  const [inputText, setInputText] = useState<string>("");
  const [morseCode, setMorseCode] = useState<string>("");
  const [currentLetter, setCurrentLetter] = useState<string>("");
  const [currentPath, setCurrentPath] = useState<MorseSymbol[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [lettersQueue, setLettersQueue] = useState<string[]>([]);
  const [letterCompleted, setLetterCompleted] = useState<boolean>(false);

  // Clear any existing audio on component unmount
  useEffect(() => {
    return () => {
      clearMorseAudio();
    };
  }, []);

  // Play the morse code for a letter
  const playLetter = (letter: string) => {
    if (!letter.trim()) return;

    // Get the Morse code for the current letter
    const upperLetter = letter.toUpperCase();
    const code = morseMap[upperLetter];

    if (!code) return;

    setCurrentLetter(upperLetter);
    setMorseCode(code);
    setIsPlaying(true);
    setLetterCompleted(false);
    setCurrentPath([]);

    // Parse the morse code into symbols
    const symbols = code
      .split("")
      .filter((s) => s === "." || s === "-") as MorseSymbol[];

    // Play each symbol with a delay
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < symbols.length) {
        const currentSymbols = symbols.slice(0, currentIndex + 1);
        setCurrentPath(currentSymbols);
        currentIndex++;
      } else {
        // When the letter is complete, mark it as completed for visual cue
        clearInterval(interval);
        setLetterCompleted(true);

        // Then move to the next letter or finish after a delay
        setTimeout(() => {
          setIsPlaying(false);
          setCurrentPath([]);
          setLetterCompleted(false);

          // Process the next letter in the queue
          setLettersQueue((prev) => {
            const newQueue = [...prev];
            if (newQueue.length > 0) {
              const nextLetter = newQueue.shift() || "";
              playLetter(nextLetter);
            }
            return newQueue;
          });
        }, 800); // Longer delay to see the completed path
      }
    }, 500); // Half second between symbols for demo purposes

    // Clean up interval if component unmounts
    return () => clearInterval(interval);
  };

  // Handle playing the entire text input
  const handlePlay = () => {
    if (!inputText.trim() || isPlaying) return;

    clearMorseAudio();
    setCurrentPath([]);
    setLetterCompleted(false);

    // Split the input text into individual characters
    const letters = inputText.split("");

    // Start playing the first letter, queue the rest
    if (letters.length > 0) {
      const firstLetter = letters.shift() || "";
      setLettersQueue(letters);
      playLetter(firstLetter);
    }
  };

  // Handle stopping playback
  const handleStop = () => {
    clearMorseAudio();
    setIsPlaying(false);
    setCurrentPath([]);
    setLettersQueue([]);
    setLetterCompleted(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="text-center py-8">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-400 mb-4">
            International Morse Decoding
          </h1>
          <p className="text-slate-300 text-lg">
            Enter text and watch it travel through the morse tree with sound
          </p>
        </header>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-amber-400">Input Text</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <Input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to convert to Morse code"
                className="bg-slate-900 border-slate-700 text-white"
                disabled={isPlaying}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && inputText.trim() && !isPlaying) {
                    e.preventDefault();
                    handlePlay();
                  }
                }}
              />
              {!isPlaying ? (
                <Button
                  onClick={handlePlay}
                  disabled={!inputText.trim()}
                  className="bg-amber-600 hover:bg-amber-500"
                >
                  Play
                </Button>
              ) : (
                <Button onClick={handleStop} variant="destructive">
                  Stop
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {isPlaying && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-amber-400">Now Playing</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-5xl font-bold mb-4">{currentLetter}</div>
              <div className="text-2xl font-mono tracking-wider">
                {morseCode.split("").map((symbol, idx) => (
                  <span
                    key={idx}
                    className={
                      idx < currentPath.length
                        ? "text-amber-400"
                        : "text-slate-500"
                    }
                  >
                    {symbol}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <MorseTreeVisualization
          morseTree={morseTree}
          currentPath={currentPath}
          isPlaying={isPlaying}
          letterCompleted={letterCompleted}
          onPlayLetter={playLetter}
        />

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-amber-400">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">
              The International Morse Code is visualized here as a tree
              structure. Each letter can be found by following a path of dots
              (.) and dashes (-). The top arrow is the entry point, and as each
              symbol is played, you follow either left (for dot) or right (for
              dash) down the tree until you reach the letter.
            </p>
          </CardContent>
          <CardFooter className="text-slate-400 text-sm">
            <p>Based on standard international Morse code patterns</p>
          </CardFooter>
        </Card>
      </div>
      <footer className="mt-12 py-6 border-t border-slate-700 text-center text-slate-400">
        <div className="flex justify-center items-center gap-6 flex-wrap">
          <a
            href="https://mewc.info"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-400 transition-colors"
          >
            mewc.info
          </a>
          <a
            href="https://x.com/the_mewc"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-400 transition-colors"
          >
            x.com/the_mewc
          </a>
          <span className="text-slate-500">vibed my mewc</span>
        </div>
      </footer>
    </div>
  );
}
