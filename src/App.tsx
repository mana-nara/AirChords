import React, { useEffect, useState } from 'react';
import WebcamFeed from './components/WebcamFeed';
import { loadHandDetector, detectGesture } from './components/GestureHandler';
import { playChord } from './components/SoundPlayer';

const App: React.FC = () => {
  const [currentChord, setCurrentChord] = useState<string | null>(null);
  const [lastGesture, setLastGesture] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const success = await loadHandDetector();
      if (!success) {
        console.error('Failed to load hand detector');
      }
    })();
  }, []);

  const handleVideoFrame = async (video: HTMLVideoElement) => {
    console.log('Video dimensions:', video.videoWidth, video.videoHeight);

    const gesture = await detectGesture(video);

    if (gesture) {
      console.log('Detected gesture:', gesture);

      if (gesture !== lastGesture) {
        setCurrentChord(gesture);
        playChord(gesture);
        setLastGesture(gesture);
      }
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>🎹 AirChords</h1>
      <p>Show hand gestures to play piano chords</p>
      <h2>🎵 Current Chord: <strong>{currentChord || 'None'}</strong></h2>

      <WebcamFeed onResults={handleVideoFrame} />
    </div>
  );
};

export default App;