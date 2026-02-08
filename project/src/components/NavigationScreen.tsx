import { useState } from 'react';
import { Navigation2, Mic, Search } from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';
import { voiceService } from '../services/voiceService';
import { SimpleMap } from './SimpleMap';

export function NavigationScreen() {
  const {
    isNavigating,
    destination,
    startNavigation,
    stopNavigation,
  } = useNavigation();

  const [destinationInput, setDestinationInput] = useState('');

  const handleStartNavigation = () => {
    if (destinationInput.trim()) {
      startNavigation(destinationInput);
      setDestinationInput('');
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        voiceService.speak('Listening for destination', 'normal');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setDestinationInput(transcript);
        voiceService.speak(`Destination set to ${transcript}`, 'normal');
      };

      recognition.onerror = () => {
        voiceService.speak('Could not understand. Please try again', 'normal');
      };

      recognition.start();
    } else {
      alert('Voice recognition not supported in this browser');
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 relative">
      {/* Map Layer - Always Visible */}
      <div className="absolute inset-0 z-0">
        <SimpleMap destination={isNavigating ? destination : undefined} />
      </div>

      {/* UI Overlays */}
      {!isNavigating ? (
        <div className="flex-1 flex flex-col relative h-full pointer-events-none">
          {/* GPS Badge */}
          <div className="absolute top-6 left-6 z-20 pointer-events-auto">
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-gray-100 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">GPS Active</span>
            </div>
          </div>

          {/* Floating UI Layer */}
          <div className="z-10 flex flex-col justify-end h-full p-6 pb-safe">
            {/* Search & Action Card */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-6 space-y-6 pointer-events-auto border border-white/20">
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold text-gray-900">Where to?</h1>
                <p className="text-sm text-gray-500">Enter destination to start guidance</p>
              </div>

              {/* Search Bar */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={destinationInput}
                  onChange={(e) => setDestinationInput(e.target.value)}
                  placeholder="Search destination..."
                  className="w-full bg-gray-50/80 border border-gray-200 text-gray-900 text-lg rounded-2xl py-4 pl-12 pr-14 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
                />
                <button
                  onClick={handleVoiceInput}
                  className="absolute inset-y-0 right-2 p-2 flex items-center justify-center my-auto"
                >
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all text-blue-600">
                    <Mic className="w-5 h-5" />
                  </div>
                </button>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-100 w-full"></div>

              {/* Start Navigation Button */}
              <button
                onClick={() => {
                  handleStartNavigation();
                  voiceService.speak('Starting walking navigation', 'normal');
                }}
                disabled={!destinationInput.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl py-5 text-lg font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100 flex items-center justify-center gap-3"
              >
                <Navigation2 className="w-6 h-6 fill-current" />
                <span>Start Navigation</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col relative h-full pointer-events-none">
          {/* Header Overlay */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-6 pt-safe pointer-events-auto">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                <Navigation2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium opacity-80">Navigating to</p>
                <p className="text-lg font-bold leading-tight line-clamp-1">{destination}</p>
              </div>
            </div>
          </div>

          {/* End Navigation Floating Button */}
          <div className="absolute bottom-0 left-0 right-0 p-6 pb-safe z-20 bg-gradient-to-t from-white/90 via-white/50 to-transparent pointer-events-auto">
            <button
              onClick={() => {
                stopNavigation();
                voiceService.speak('Ending navigation', 'low');
              }}
              className="w-full bg-white text-red-600 border border-red-100 rounded-2xl py-4 text-lg font-bold shadow-[0_8px_25px_rgba(0,0,0,0.1)] hover:bg-red-50 active:scale-[0.98] transition-all flex items-center justify-center gap-3 backdrop-blur-sm"
            >
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-red-600 rounded-sm" />
              </div>
              <span>End Navigation</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function EndNavigationButton() {
  const { isNavigating, stopNavigation } = useNavigation();

  if (!isNavigating) return null;

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      <button
        onClick={() => {
          stopNavigation();
          voiceService.speak('Ending navigation', 'low');
        }}
        className="w-full bg-red-50 text-red-600 border border-red-200 rounded-xl py-3 text-lg font-bold shadow-sm hover:bg-red-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <div className="w-2 h-2 bg-red-600 rounded-sm" />
        <span>End Navigation</span>
      </button>
    </div>
  );
}
