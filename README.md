# International Morse Code Visualization

vibe coded w cursor agents claude 3.7


--

## Features

- Interactive 3D visualization of the Morse code tree structure
- Text-to-Morse code conversion with audio playback
- Visual path tracing through the tree as code plays
- Real-time highlighting of current symbols and nodes
- Responsive design that works on both desktop and mobile

## Technology Stack

- **Next.js** - React framework for the application
- **Three.js** - 3D visualization library
- **React Three Fiber** - React renderer for Three.js
- **Web Audio API** - For generating Morse code sounds
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Component library

## How It Works

The application visualizes Morse code as a binary tree:

- Starting at the root node (the top arrow in the diagram)
- A dot (.) moves left in the tree
- A dash (-) moves right in the tree
- Following the path of dots and dashes leads to a specific letter

For example:

- The letter 'E' is represented by a single dot (.), so it's the first node on the left path
- The letter 'T' is represented by a single dash (-), so it's the first node on the right path
- The letter 'A' is dot-dash (.-), so you go left then right

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) package manager

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/morse-code-viz.git
   ```

2. Navigate to the project directory:

   ```
   cd morse-code-viz
   ```

3. Install dependencies:

   ```
   bun install
   ```

4. Start the development server:

   ```
   bun run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Enter the text you want to convert to Morse code in the input field
2. Click the "Play" button to start the visualization
3. Watch as the application plays the Morse code for each letter and traces the path through the tree
4. Use the "Stop" button if you want to halt playback

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Based on the international Morse code standard
- Visualization inspired by classic Morse code decoding charts
