import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';

let detector: handPoseDetection.HandDetector | null = null;
let isModelLoading = false;

// Keypoint indices for each finger
const FINGER_INDICES = {
  THUMB: [1, 2, 3, 4],
  INDEX: [5, 6, 7, 8],
  MIDDLE: [9, 10, 11, 12],
  RING: [13, 14, 15, 16],
  PINKY: [17, 18, 19, 20]
};

export async function loadHandDetector() {
  if (isModelLoading) {
    console.log('Model is already loading...');
    return false;
  }

  if (detector) {
    console.log('Model is already loaded');
    return true;
  }

  try {
    isModelLoading = true;
    console.log('Loading TensorFlow backend...');
    
    // Initialize TensorFlow.js backend
    await tf.ready();
    await tf.setBackend('webgl');
    console.log('TensorFlow backend initialized:', tf.getBackend());

    console.log('Creating hand detector...');
    const model = handPoseDetection.SupportedModels.MediaPipeHands;
    const detectorConfig = {
      runtime: 'tfjs' as const,
      modelType: 'full' as const,
      maxHands: 1
    };

    detector = await handPoseDetection.createDetector(model, detectorConfig);
    console.log('Hand detector loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading hand detector:', error);
    return false;
  } finally {
    isModelLoading = false;
  }
}

function isValidKeypoint(keypoint: handPoseDetection.Keypoint): boolean {
  return keypoint && 
         typeof keypoint.x === 'number' && 
         typeof keypoint.y === 'number' && 
         !isNaN(keypoint.x) && 
         !isNaN(keypoint.y) &&
         typeof keypoint.score === 'number' && 
         keypoint.score > 0.5; // Only consider keypoints with confidence > 50%
}

function isFingerExtended(keypoints: handPoseDetection.Keypoint[], fingerIndices: number[]): boolean {
  // Validate all required keypoints
  for (const index of fingerIndices) {
    if (!isValidKeypoint(keypoints[index])) {
      console.log(`Invalid or low confidence keypoint at index ${index}`);
      return false;
    }
  }

  // For fingers (not thumb), check if tip is higher than base
  if (fingerIndices !== FINGER_INDICES.THUMB) {
    const base = keypoints[fingerIndices[0]];
    const middle = keypoints[fingerIndices[1]];
    const tip = keypoints[fingerIndices[3]];

    // Calculate vectors
    const baseToMiddle = {
      x: middle.x - base.x,
      y: middle.y - base.y
    };

    const middleToTip = {
      x: tip.x - middle.x,
      y: tip.y - middle.y
    };

    // Calculate dot product
    const dotProduct = (baseToMiddle.x * middleToTip.x) + (baseToMiddle.y * middleToTip.y);
    const magnitudeProduct = Math.sqrt(
      (baseToMiddle.x * baseToMiddle.x + baseToMiddle.y * baseToMiddle.y) *
      (middleToTip.x * middleToTip.x + middleToTip.y * middleToTip.y)
    );

    if (magnitudeProduct === 0) return false;

    // Calculate angle in radians
    const angle = Math.acos(dotProduct / magnitudeProduct);
    console.log(`Finger angle: ${angle * 180 / Math.PI} degrees`);

    // Finger is extended if the angle is greater than 160 degrees
    return angle > 2.79;
  }

  // For thumb
  const base = keypoints[fingerIndices[0]];
  const tip = keypoints[fingerIndices[3]];

  // Calculate angle relative to vertical
  const dx = tip.x - base.x;
  const dy = tip.y - base.y;
  const angle = Math.atan2(dy, dx);
  console.log(`Thumb angle: ${angle * 180 / Math.PI} degrees`);

  // Thumb is extended if it's pointing outward
  return Math.abs(angle) > 0.785; // ~45 degrees
}

export async function detectGesture(video: HTMLVideoElement): Promise<string | null> {
  if (!detector) {
    console.log('Detector not initialized');
    return null;
  }

  if (!video.readyState) {
    console.log('Video not ready');
    return null;
  }

  try {
    const hands = await detector.estimateHands(video, {
      flipHorizontal: false
    });

    if (!hands || !hands.length) {
      console.log('No hands detected');
      return null;
    }

    const keypoints = hands[0].keypoints;
    if (!keypoints || keypoints.length < 21) {
      console.log('Invalid keypoints data');
      return null;
    }

    // Log keypoints with scores
    console.log('Keypoints with scores:', 
      keypoints.map(kp => ({
        name: kp.name,
        score: kp.score,
        x: Math.round(kp.x),
        y: Math.round(kp.y)
      }))
    );

    const extendedFingers = {
      thumb: isFingerExtended(keypoints, FINGER_INDICES.THUMB),
      index: isFingerExtended(keypoints, FINGER_INDICES.INDEX),
      middle: isFingerExtended(keypoints, FINGER_INDICES.MIDDLE),
      ring: isFingerExtended(keypoints, FINGER_INDICES.RING),
      pinky: isFingerExtended(keypoints, FINGER_INDICES.PINKY)
    };

    console.log('Extended fingers:', extendedFingers);

    // Count extended fingers
    const count = Object.values(extendedFingers).filter(Boolean).length;
    console.log('Extended finger count:', count);

    // Only detect chords when fingers are extended (not for closed fist)
    if (count === 0) {
      console.log('No fingers extended (closed fist) - no chord');
      return null;
    }
    
    if (extendedFingers.index && !extendedFingers.middle && !extendedFingers.ring && 
        !extendedFingers.pinky && !extendedFingers.thumb) {
      console.log('Detected A_major (only index finger)');
      return 'A_major';
    }
    
    if (extendedFingers.index && extendedFingers.middle && !extendedFingers.ring && 
        !extendedFingers.pinky && !extendedFingers.thumb) {
      console.log('Detected A_minor (peace sign)');
      return 'A_minor';
    }
    
    if (extendedFingers.index && extendedFingers.middle && extendedFingers.ring && 
        !extendedFingers.pinky && !extendedFingers.thumb) {
      console.log('Detected C_major (first three fingers)');
      return 'C_major';
    }
    
    if (extendedFingers.index && extendedFingers.middle && extendedFingers.ring && 
        extendedFingers.pinky && !extendedFingers.thumb) {
      console.log('Detected D_major (all fingers except thumb)');
      return 'D_major';
    }
    
    if (extendedFingers.thumb && extendedFingers.index && extendedFingers.middle && 
        extendedFingers.ring && extendedFingers.pinky) {
      console.log('Detected G_major (all fingers extended)');
      return 'G_major';
    }

    console.log('No matching chord pattern detected');
    return null;
  } catch (error) {
    console.error('Error detecting gesture:', error);
    return null;
  }
}
