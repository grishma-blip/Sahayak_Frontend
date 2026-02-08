import { useState, useRef, useEffect } from 'react';
import { Camera, X, Loader, AlertCircle, Eye } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { voiceService } from '../services/voiceService';

export function DetectionScreen() {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [currentDetections, setCurrentDetections] = useState<cocoSsd.DetectedObject[]>([]);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastSpokenRef = useRef<{ [key: string]: number }>({});
  const isRunningRef = useRef(false);

  // Load model on mount
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log('Loading COCO-SSD model...');
        await tf.ready();
        const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
        console.log('COCO-SSD model loaded successfully');
      } catch (err) {
        console.error('Failed to load model:', err);
        setError('Failed to load detection model. Please check internet connection.');
      }
    };
    loadModel();
  }, []);

  const detectFrame = async () => {
    if (
      !model ||
      !videoRef.current ||
      !canvasRef.current ||
      !isRunningRef.current
    ) return;

    const video = videoRef.current;
    if (video.readyState !== 4) {
      requestRef.current = requestAnimationFrame(detectFrame);
      return;
    }

    try {
      const predictions = await model.detect(video);
      setCurrentDetections(predictions);
      drawPredictions(predictions);
      speakDetections(predictions);

      if (isRunningRef.current) {
        requestRef.current = requestAnimationFrame(detectFrame);
      }
    } catch (err) {
      console.error('Detection error:', err);
      // Continue loop even on error to retry
      if (isRunningRef.current) {
        requestRef.current = requestAnimationFrame(detectFrame);
      }
    }
  };

  const getEstimatedDistance = (className: string, bboxHeight: number, frameHeight: number) => {
    // Approximate real-world heights in meters
    const REAL_HEIGHTS: { [key: string]: number } = {
      person: 1.7,
      bicycle: 1.0,
      car: 1.5,
      motorcycle: 1.0,
      bus: 3.0,
      truck: 2.5,
      cat: 0.3,
      dog: 0.5,
      chair: 0.9,
      bottle: 0.3,
      cup: 0.15,
      laptop: 0.3,
      cell: 0.15,
      default: 1.0
    };

    const realHeight = REAL_HEIGHTS[className] || REAL_HEIGHTS.default;
    const screenRatio = bboxHeight / frameHeight;
    // Heuristic: Using a slightly adjusted focal factor for mobile devices
    // Lower factor to account for wider FOV on typical cameras
    return (0.9 * realHeight / screenRatio).toFixed(1);
  };

  const drawPredictions = (predictions: cocoSsd.DetectedObject[]) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 16px sans-serif';
    ctx.textBaseline = 'top';

    predictions.forEach(prediction => {
      const [x, y, width, height] = prediction.bbox;
      const isPerson = prediction.class === 'person';

      const distance = getEstimatedDistance(prediction.class, height, canvas.height);
      const label = `${prediction.class} (${distance}m)`;

      // Draw box
      ctx.strokeStyle = isPerson ? '#00FFFF' : '#00FF00';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // Draw label background
      ctx.fillStyle = isPerson ? 'rgba(0, 255, 255, 0.7)' : 'rgba(0, 255, 0, 0.7)';
      const textWidth = ctx.measureText(label).width;
      ctx.fillRect(x, y, textWidth + 8, 24);

      // Draw label text
      ctx.fillStyle = '#000000';
      ctx.fillText(label, x + 4, y + 4);
    });
  };

  const speakDetections = (predictions: cocoSsd.DetectedObject[]) => {
    const video = videoRef.current;
    if (!video) return;

    const now = Date.now();
    const cooldown = 4000; // Slightly faster updates

    predictions.forEach(prediction => {
      // Only speak new or high confidence detections
      if (prediction.score > 0.6) {
        const lastSpokenTime = lastSpokenRef.current[prediction.class] || 0;

        if (now - lastSpokenTime > cooldown) {
          const [, , , height] = prediction.bbox;
          const distance = getEstimatedDistance(prediction.class, height, video.videoHeight);

          voiceService.speak(`${prediction.class}, ${distance} meters away`, 'normal');
          lastSpokenRef.current[prediction.class] = now;
        }
      }
    });
  };

  const startCamera = async () => {
    if (!model) {
      voiceService.speak('Please wait, model is still loading', 'normal');
      return;
    }

    try {
      setError(null);
      setIsStartingCamera(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 640 }, // Lower resolution for better performance
          height: { ideal: 480 }
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraActive(true);
          isRunningRef.current = true;
          detectFrame();
          voiceService.speak('Camera started. Detecting objects.', 'normal');
        };
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setError('Unable to access camera.');
      voiceService.speak('Camera access denied', 'normal');
    } finally {
      setIsStartingCamera(false);
    }
  };

  const stopCamera = () => {
    isRunningRef.current = false;
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    setIsCameraActive(false);
    setCurrentDetections([]);
    lastSpokenRef.current = {};
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="p-4 bg-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Eye className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="text-lg font-bold text-white">Object Detection</h2>
            <p className="text-xs text-gray-400">वस्तु पहचान (Real-time)</p>
          </div>
        </div>
        {isCameraActive && (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-red-400">Live</span>
          </div>
        )}
      </div>

      <div className="flex-1 relative bg-black overflow-hidden relative">
        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}
        />
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}
        />

        {!isCameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black z-10">
            <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
              <Camera className="w-12 h-12 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {model ? 'Ready to Detect' : 'Loading Model...'}
            </h3>
            <p className="text-gray-400 text-sm mb-8 max-w-xs">
              {model
                ? 'Camera will analyze objects in real-time and announce them.'
                : 'Please wait while we prepare the detection engine.'}
            </p>
            <button
              onClick={startCamera}
              disabled={!model || isStartingCamera}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {!model || isStartingCamera ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>{isStartingCamera ? 'Starting...' : 'Loading...'}</span>
                </>
              ) : (
                <span>Start Camera</span>
              )}
            </button>
            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl max-w-xs">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>
        )}

        {isCameraActive && (
          <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20">
            <button
              onClick={stopCamera}
              className="px-6 py-3 bg-red-600 text-white rounded-full font-semibold flex items-center gap-2 hover:bg-red-500 active:scale-95 transition-all shadow-lg"
            >
              <X className="w-5 h-5" />
              <span>Stop Camera</span>
            </button>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <AlertCircle className="w-4 h-4" />
          <span>Point camera at objects. Voice will announce what it sees.</span>
        </div>
        {currentDetections.length > 0 && (
          <div className="mt-2 text-xs text-blue-300">
            Seeing: {currentDetections.map(d => d.class).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}
