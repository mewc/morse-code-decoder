"use client";

import { useState, useEffect } from "react";
import { encodeMorse, MorseNode, MorseSymbol } from "@/lib/morse";
import { Button } from "@/components/ui/button";
import { Play, Pause, RefreshCw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import MorseAudio from "../audio/MorseAudio";
import MorseTreeVisualization from "../tree/MorseTreeVisualization";

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

  // For debugging
  useEffect(() => {
    console.log("MorsePlayer morseCode:", morseCode);
  }, [morseCode]);

  // Handle playback completion
  const handleComplete = () => {
    console.log("Playback complete");
    setIsPlaying(false);
    setCurrentPath([]);
    setLetterCompleted(false);
  };

  // Handle path updates for visualization
  const handlePathUpdate = (path: MorseSymbol[]) => {
    console.log("Path update:", path);
    setCurrentPath(path);
  };

  // Handle letter completed state
  const handleLetterComplete = (completed: boolean) => {
    console.log("Letter complete:", completed);
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
