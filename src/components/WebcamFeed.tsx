import React, { useRef, useEffect } from 'react';
import Webcam from 'react-webcam';

type WebcamFeedProps = {
  onResults: (video: HTMLVideoElement) => void;
};

const WebcamFeed: React.FC<WebcamFeedProps> = ({ onResults }) => {
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4
      ) {
        onResults(webcamRef.current.video);
      }
    }, 100); // approx 10 FPS
    return () => clearInterval(interval);
  }, [onResults]);

  return (
    <Webcam
      ref={webcamRef}
      mirrored
      videoConstraints={{ width: 640, height: 480 }}
      style={{ width: 640, height: 480 }}
    />
  );
};

export default WebcamFeed;
