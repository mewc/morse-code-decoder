"use client";

import { useState, useEffect } from "react";
import { morseTree, MorseSymbol, morseMap } from "@/lib/morse";
import {
  clearMorseAudio,
  generateMorseAudio,
  setMuted,
  getMuted,
} from "@/lib/audio";
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
import { Volume2, VolumeX, Play, Square } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function Home() {
  const [inputText, setInputText] = useState<string>("");
  const [morseCode, setMorseCode] = useState<string>("");
  const [currentLetter, setCurrentLetter] = useState<string>("");
  const [currentPath, setCurrentPath] = useState<MorseSymbol[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [letterCompleted, setLetterCompleted] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(getMuted());

  // Clear any existing audio on component unmount
  useEffect(() => {
    return () => {
      clearMorseAudio();
    };
  }, []);

  // Handle mute toggle
  const handleMuteToggle = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    setMuted(newMutedState);
  };

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

    // Generate audio and update visualization
    generateMorseAudio(
      code,
      (index, symbol) => {
        // This is called when each symbol plays
        const currentSymbols = code
          .slice(0, index + 1)
          .split("") as MorseSymbol[];
        setCurrentPath(currentSymbols);
      },
        () => {
          // This is called when letter is complete
          setLetterCompleted(true);

          // Move to the next letter after a delay
          setTimeout(() => {
            // Process the next letter in the queue or finish
            setIsPlaying(false);
            setCurrentPath([]);
            setLetterCompleted(false);

            // Find the index of the current letter in the input text
            const upperInputText = inputText.toUpperCase();
            const index = upperInputText.indexOf(upperLetter);

            // If there's a next letter, play it
            if (index !== -1 && index < upperInputText.length - 1) {
              const nextLetter = upperInputText.charAt(index + 1);
              playLetter(nextLetter);
            }
          }, 800);
        };
    );
  };

  // Handle playing the entire text input
  const handlePlay = () => {
    if (!inputText.trim() || isPlaying) return;

    clearMorseAudio();
    setCurrentPath([]);
    setLetterCompleted(false);

    // Start with the first letter
    if (inputText.length > 0) {
      playLetter(inputText[0]);
    }
  };

  // Handle stopping playback
  const handleStop = () => {
    clearMorseAudio();
    setIsPlaying(false);
    setCurrentPath([]);
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
            <CardTitle className="text-amber-400">
              {isPlaying ? "Now Playing" : "Controls"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[180px]">
              {!isPlaying ? (
                <div className="space-y-6">
                  <div className="flex gap-4 items-center">
                    <Input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Enter text to convert to Morse code"
                      className="bg-slate-900 border-slate-700 text-white"
                      disabled={isPlaying}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          inputText.trim() &&
                          !isPlaying
                        ) {
                          e.preventDefault();
                          handlePlay();
                        }
                      }}
                    />
                    <Button
                      onClick={handlePlay}
                      disabled={!inputText.trim()}
                      className="bg-amber-600 hover:bg-amber-500"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Play
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={!isMuted}
                        onCheckedChange={() => handleMuteToggle()}
                        id="sound-toggle"
                      />
                      <label
                        htmlFor="sound-toggle"
                        className="flex items-center cursor-pointer text-slate-300"
                      >
                        {isMuted ? (
                          <>
                            <VolumeX className="h-4 w-4 mr-2 text-slate-400" />
                            Sound Off
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-4 w-4 mr-2 text-amber-400" />
                            Sound On
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Current word with highlighted letter */}
                  <div className="flex justify-between items-center">
                    <div className="text-base text-slate-300 font-mono tracking-wider">
                      <div className="mb-2 text-xs text-slate-500 uppercase">
                        Current Word
                      </div>
                      {inputText.split("").map((char, index) => {
                        const isCurrentLetter =
                          char.toUpperCase() === currentLetter;
                        return (
                          <span
                            key={index}
                            className={
                              isCurrentLetter ? "text-amber-400 font-bold" : ""
                            }
                          >
                            {char}
                          </span>
                        );
                      })}
                    </div>
                    <Button
                      onClick={handleStop}
                      variant="destructive"
                      size="sm"
                    >
                      <Square className="mr-2 h-4 w-4" />
                      Stop
                    </Button>
                  </div>

                  {/* Current letter and morse code */}
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-4 text-amber-400">
                      {currentLetter}
                    </div>
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
                  </div>

                  {/* Sound status indicator */}
                  <div className="flex justify-center mt-2">
                    <div className="flex items-center text-xs text-slate-400">
                      {isMuted ? (
                        <>
                          <VolumeX className="h-3 w-3 mr-1" /> Muted
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3 w-3 mr-1" /> Sound On
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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