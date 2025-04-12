import { useEffect, useState } from 'react';
import WebcamFeed from './components/WebcamFeed';
import { loadHandDetector, detectGesture } from './components/GestureHandler';
import { playChord } from './components/SoundPlayer';

function App() {
  const [currentChord, setCurrentChord] = useState<string | null>(null);
  const [lastGesture, setLastGesture] = useState<string | null>(null);

  useEffect(() => {
    loadHandDetector();
  }, []);

  const handleVideoFrame = async (video: HTMLVideoElement) => {
    const gesture = await detectGesture(video);
    if (gesture && gesture !== lastGesture) {
      setCurrentChord(gesture);
      playChord(gesture);
      setLastGesture(gesture);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>🎹 AirChords</h1>
      <p>Show a hand gesture to play a chord</p>
      <h2>🎵 Current Chord: {currentChord || 'None'}</h2>
      <WebcamFeed onResults={handleVideoFrame} />
    </div>
  );
}

export default App;
