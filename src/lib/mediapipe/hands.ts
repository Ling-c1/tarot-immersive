import { FilesetResolver, HandLandmarker, HandLandmarkerResult } from '@mediapipe/tasks-vision';

let handLandmarker: HandLandmarker | null = null;
let isInitialized = false;

export async function initHandLandmarker(): Promise<HandLandmarker> {
  if (handLandmarker && isInitialized) return handLandmarker;

  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm',
  );

  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task',
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numHands: 2,
    minHandDetectionConfidence: 0.6,
    minTrackingConfidence: 0.5,
  });

  isInitialized = true;
  return handLandmarker;
}

export function detectHands(
  landmarker: HandLandmarker,
  video: HTMLVideoElement,
  timestamp: number,
): HandLandmarkerResult | null {
  if (!isInitialized) return null;
  try {
    return landmarker.detectForVideo(video, timestamp);
  } catch {
    return null;
  }
}

export function closeHandLandmarker() {
  if (handLandmarker) {
    handLandmarker.close();
    handLandmarker = null;
    isInitialized = false;
  }
}
