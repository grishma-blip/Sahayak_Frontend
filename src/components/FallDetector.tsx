import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';
import { voiceService } from '../services/voiceService';

export function FallDetector() {
  const { detectFall, isFallDetected } = useNavigation();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check if DeviceMotion is supported
    if (typeof window !== 'undefined' && !window.DeviceMotionEvent) {
      setIsSupported(false);
    }
  }, []);

  const requestPermission = async () => {
    if (
      typeof (DeviceMotionEvent as any).requestPermission === 'function'
    ) {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
          voiceService.speak('Fall detection enabled', 'normal');
        }
      } catch (error) {
        console.error('Error requesting device motion permission:', error);
      }
    } else {
      // Non-iOS 13+ devices don't need permission
      setPermissionGranted(true);
      voiceService.speak('Fall detection enabled', 'normal');
    }
  };


  useEffect(() => {
    if (!permissionGranted || isFallDetected) return;

    let freeFallDetected = false;
    let freeFallStartTime = 0;

    const handleMotion = (event: DeviceMotionEvent) => {
      if (!event.accelerationIncludingGravity) return;

      const { x, y, z } = event.accelerationIncludingGravity;
      const acceleration = Math.sqrt(
        (x || 0) ** 2 + (y || 0) ** 2 + (z || 0) ** 2
      );

      // Detect Free Fall (Low G)
      // Normal gravity is ~9.8 m/s^2. A significant drop indicates free fall.
      if (acceleration < 2.5) {
        if (!freeFallDetected) {
          freeFallDetected = true;
          freeFallStartTime = Date.now();
        }
      }
      
      // Check for impact if free fall was detected
      if (freeFallDetected) {
        const timeSinceFreeFall = Date.now() - freeFallStartTime;
        
        // Impact window: 1 second after free fall start
        if (timeSinceFreeFall < 1000) {
            // Detect Impact (High G)
            if (acceleration > 20) {
                detectFall();
                freeFallDetected = false; 
            }
        } else {
             // Reset if too much time has passed without impact
            freeFallDetected = false;
        }
      }
    };

    window.addEventListener('devicemotion', handleMotion);

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [permissionGranted, isFallDetected, detectFall]);

  if (!isSupported) return null;

  if (!permissionGranted && !isFallDetected) {
    return (
      <button
        onClick={requestPermission}
        className="fixed bottom-24 right-6 p-4 text-sm font-medium text-white bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 active:bg-blue-800 focus:ring-4 focus:ring-blue-300 z-40 flex items-center gap-2"
        aria-label="Enable fall detection"
      >
        <Activity className="w-6 h-6" />
        <span className="hidden sm:inline">Enable Fall Detection</span>
      </button>
    );
  }

  return null;
}
