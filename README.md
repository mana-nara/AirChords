# AirChords

Air Chords is a browser-based music tool that turns your webcam into a chord-playing companion. Use simple hand gestures to trigger natural-sounding instrument chords in real time — no instruments needed. Whether you're singing, jamming, or just experimenting, Air Chords lets you bring harmony to your voice with just a wave of your hand.

## Collaborators
1. Anirudh Venkatachalam - [GitHub](https://github.com/anirudhvee)
2. Manasvini Narayanan - [GitHub](https://github.com/mana-nara)

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)
- Google Chrome (v88 or higher) or a Chromium browser
- Webcam access

### Installation

1. Clone the repository
```bash
git clone https://github.com/mana-nara/AirChords.git
cd AirChords
```

2. Install dependencies

First, install the base dependencies:
```bash
npm install
```

Then, install the required TensorFlow.js and MediaPipe packages:
```bash
npm install @tensorflow/tfjs @tensorflow/tfjs-backend-webgl @tensorflow/tfjs-core @tensorflow-models/hand-pose-detection @mediapipe/hands
```

Install React and related packages:
```bash
npm install react react-dom react-webcam
```

Install audio handling packages:
```bash
npm install howler @types/howler
```

3. Start the development server
```bash
npm run dev
```

4. Open Google Chrome or a Chromium browser and navigate to `http://localhost:5173`

### Hand Gestures

AirChords recognizes the following hand gestures for different chords:
- Fist (all fingers closed) → F Major
- Index finger only → A Major
- Peace sign (index and middle fingers) → A Minor
- Three fingers (index, middle, ring) → C Major
- Four fingers (all except thumb) → D Major
- Open hand (all fingers extended) → G Major

### Tech Stack
- React + TypeScript
- TensorFlow.js
- MediaPipe Hands
- Web Audio API (via Howler.js)

### Development

To run the project in development mode:
```bash
npm run dev
```

To build for production:
```bash
npm run build
```
