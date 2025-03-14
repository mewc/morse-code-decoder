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
import { Volume2, VolumeX, Play, Square, Repeat } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";

export default function Home() {
  const [inputText, setInputText] = useState<string>("");
  const [morseCode, setMorseCode] = useState<string>("");
  const [currentLetter, setCurrentLetter] = useState<string>("");
  const [currentLetterIndex, setCurrentLetterIndex] = useState<number>(-1);
  const [currentPath, setCurrentPath] = useState<MorseSymbol[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [letterCompleted, setLetterCompleted] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(getMuted());
  const [loopEnabled, setLoopEnabled] = useState<boolean>(false);

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

  // Handle loop toggle
  const handleLoopToggle = () => {
    setLoopEnabled(!loopEnabled);
  };

  // Play the morse code for a letter
  const playLetter = (letter: string, index: number) => {
    if (!letter.trim()) return;

    // Get the Morse code for the current letter
    const upperLetter = letter.toUpperCase();
    const code = morseMap[upperLetter];

    if (!code) return;

    setCurrentLetter(upperLetter);
    setCurrentLetterIndex(index);
    setMorseCode(code);
    setIsPlaying(true);
    setLetterCompleted(false);
    setCurrentPath([]);

    // Generate audio and update visualization
    generateMorseAudio(
      code,
      (index) => {
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

          // If there's a next letter, play it
          if (index < inputText.length - 1) {
            const nextLetter = inputText[index + 1];
            playLetter(nextLetter, index + 1);
          } else if (loopEnabled) {
            // If loop is enabled and we're at the end, start over
            if (inputText.length > 0) {
              playLetter(inputText[0], 0);
            }
          }
        }, 800);
      }
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
      playLetter(inputText[0], 0);
    }
  };

  // Handle stopping playback
  const handleStop = () => {
    clearMorseAudio();
    setIsPlaying(false);
    setCurrentPath([]);
    setLetterCompleted(false);
    setCurrentLetterIndex(-1);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* <header className="text-center py-8">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-400 mb-4">
            International Morse Decoding
          </h1>
          <p className="text-slate-300 text-lg">
            Enter text and watch it travel through the morse tree with sound
          </p>
        </header> */}

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-amber-400">
              Morse Code: {isPlaying ? "Now Playing" : "Controls"}
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
                    <div className="flex flex-col gap-4 items-center ">
                      {/* Sound toggle */}
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={!isMuted}
                          onCheckedChange={handleMuteToggle}
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

                      {/* Loop toggle */}
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={loopEnabled}
                          onCheckedChange={handleLoopToggle}
                          id="loop-toggle"
                        />
                        <label
                          htmlFor="loop-toggle"
                          className="flex items-center cursor-pointer text-slate-300"
                        >
                          <Repeat
                            className={`h-4 w-4 mr-2 ${
                              loopEnabled ? "text-amber-400" : "text-slate-400"
                            }`}
                          />
                          Loop {loopEnabled ? "On" : "Off"}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 py-2">
                  {/* Current word with highlighted letter */}
                  <div className="flex justify-between items-center">
                    <div className="text-base text-slate-300 font-mono tracking-wider">
                      <div className="mb-1 text-xs text-slate-500 uppercase">
                        Current Word
                      </div>
                      {inputText.split("").map((char, index) => {
                        const isCurrentLetterIndex =
                          index === currentLetterIndex;
                        return (
                          <span
                            key={index}
                            className={
                              isCurrentLetterIndex
                                ? "text-amber-400 font-bold"
                                : ""
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
                    <div className="text-4xl font-bold mb-2 text-amber-400">
                      {currentLetter}
                    </div>
                    <div className="text-xl font-mono tracking-wider">
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

                  {/* Controls indicators row */}
                  <div className="flex justify-center mt-1 space-x-4">
                    {/* Sound status indicator */}
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

                    {/* Loop status indicator */}
                    {loopEnabled && (
                      <div className="flex items-center text-xs text-slate-400">
                        <Repeat className="h-3 w-3 mr-1" /> Loop On
                      </div>
                    )}
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
          onPlayLetter={(letter) => {
            if (!isPlaying) {
              // Find the letter in the input text to get its index
              const index = inputText.toUpperCase().indexOf(letter);
              if (index !== -1) {
                playLetter(letter, index);
              } else {
                // If letter is not in the current input, just play it directly
                playLetter(letter, 0);
              }
            }
          }}
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
            <Link
              href="https://en.wikipedia.org/wiki/Morse_code"
              target="_blank"
              className="hover:text-amber-400 transition-colors"
              title="Based on standard international Morse code patterns"
            >
              Based on standard international Morse code patterns
            </Link>
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