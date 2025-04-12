import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';

let detector: handPoseDetection.HandDetector | null = null;

// Keypoint indices for each finger
const FINGER_INDICES = {
  THUMB: [1, 2, 3, 4],
  INDEX: [5, 6, 7, 8],
  MIDDLE: [9, 10, 11, 12],
  RING: [13, 14, 15, 16],
  PINKY: [17, 18, 19, 20]
};

export async function loadHandDetector() {
  try {
    // Initialize TensorFlow.js backend
    await tf.ready();
    await tf.setBackend('webgl');
    
    const model = handPoseDetection.SupportedModels.MediaPipeHands;
    const detectorConfig: handPoseDetection.MediaPipeHandsTfjsModelConfig = {
      runtime: 'tfjs' as const,
      modelType: 'full',
      maxHands: 1,
    };

    detector = await handPoseDetection.createDetector(model, detectorConfig);
    console.log('Hand detector loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading hand detector:', error);
    return false;
  }
}

function isFingerExtended(keypoints: handPoseDetection.Keypoint[], fingerIndices: number[]): boolean {
  // Get the y-coordinates of the finger joints
  const joints = fingerIndices.map(i => keypoints[i].y);
  
  // For fingers (not thumb), check if tip is higher than base
  if (fingerIndices !== FINGER_INDICES.THUMB) {
    return joints[3] < joints[1]; // tip is higher than base
  }
  
  // For thumb, check if it's extended to the side
  const xCoords = fingerIndices.map(i => keypoints[i].x);
  return Math.abs(xCoords[3] - xCoords[0]) > 30; // thumb is extended if tip is far from base
}

export async function detectGesture(video: HTMLVideoElement): Promise<string | null> {
  if (!detector) return null;
  
  try {
    const hands = await detector.estimateHands(video);
    if (!hands.length) return null;

    const keypoints = hands[0].keypoints;
    const extendedFingers = {
      thumb: isFingerExtended(keypoints, FINGER_INDICES.THUMB),
      index: isFingerExtended(keypoints, FINGER_INDICES.INDEX),
      middle: isFingerExtended(keypoints, FINGER_INDICES.MIDDLE),
      ring: isFingerExtended(keypoints, FINGER_INDICES.RING),
      pinky: isFingerExtended(keypoints, FINGER_INDICES.PINKY)
    };

    // Debug logging
    console.log('Extended fingers:', extendedFingers);

    // Count extended fingers
    const count = Object.values(extendedFingers).filter(Boolean).length;
    console.log('Extended finger count:', count);

    // Determine chord based on finger pattern
    if (!extendedFingers.thumb && !extendedFingers.index && !extendedFingers.middle && 
        !extendedFingers.ring && !extendedFingers.pinky) {
      return 'F_major'; // Fist - all fingers closed
    }
    
    if (extendedFingers.index && !extendedFingers.middle && !extendedFingers.ring && 
        !extendedFingers.pinky) {
      return 'A_major'; // Only index finger
    }
    
    if (extendedFingers.index && extendedFingers.middle && !extendedFingers.ring && 
        !extendedFingers.pinky) {
      return 'A_minor'; // Peace sign - index and middle
    }
    
    if (extendedFingers.index && extendedFingers.middle && extendedFingers.ring && 
        !extendedFingers.pinky) {
      return 'C_major'; // First three fingers
    }
    
    if (extendedFingers.index && extendedFingers.middle && extendedFingers.ring && 
        extendedFingers.pinky) {
      return 'D_major'; // All fingers except thumb
    }
    
    if (extendedFingers.thumb && extendedFingers.index && extendedFingers.middle && 
        extendedFingers.ring && extendedFingers.pinky) {
      return 'G_major'; // All fingers extended
    }

    return null;
  } catch (error) {
    console.error('Error detecting gesture:', error);
    return null;
  }
}
