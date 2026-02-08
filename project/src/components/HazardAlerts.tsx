import { useEffect } from 'react';
import { AlertTriangle, Construction, Car, ShoppingBag, X } from 'lucide-react';
import { useNavigation, Hazard } from '../contexts/NavigationContext';
import { voiceService } from '../services/voiceService';

const hazardIcons = {
  obstacle: Construction,
  pothole: AlertTriangle,
  drain: AlertTriangle,
  stairs: Construction,
  vehicle: Car,
  vendor: ShoppingBag,
};

const severityColors = {
  low: 'bg-blue-100 border-blue-500 text-blue-900',
  medium: 'bg-orange-100 border-orange-500 text-orange-900',
  high: 'bg-red-100 border-red-500 text-red-900',
};

export function HazardScreen() {
  const { hazards } = useNavigation();

  // Demo data if no actual hazards are currently detected
  const displayHazards = hazards.length > 0 ? hazards : [
    { id: 'h1', type: 'drain' as const, description: 'Open Manhole', severity: 'high' as const, distance: 5 },
    { id: 'h2', type: 'pothole' as const, description: 'Waterlogged Area', severity: 'medium' as const, distance: 15 },
    { id: 'h3', type: 'stairs' as const, description: 'Steep Step Down', severity: 'medium' as const, distance: 25 },
    { id: 'h4', type: 'vehicle' as const, description: 'Parked Vehicle', severity: 'low' as const, distance: 8 },
    { id: 'h5', type: 'vendor' as const, description: 'Crowded Area', severity: 'low' as const, distance: 30 },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Hazard Detection</h1>
            <p className="text-xs text-gray-500">खतरे की पहचान</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">Real-time obstacle and surface danger alerts</p>
      </div>

      {/* Toggles */}
      <div className="px-6 py-4 flex gap-4">
        <button className="flex-1 py-3 border-2 border-orange-100 bg-white rounded-xl flex items-center justify-center gap-2 text-orange-600 font-medium hover:bg-orange-50 active:bg-orange-100 transition-colors shadow-sm">
          <span className="text-lg">🔊</span> Audio
        </button>
        <button className="flex-1 py-3 border-2 border-orange-100 bg-white rounded-xl flex items-center justify-center gap-2 text-orange-600 font-medium hover:bg-orange-50 active:bg-orange-100 transition-colors shadow-sm">
          <span className="text-lg">📳</span> Haptic
        </button>
      </div>

      {/* Filters */}
      <div className="px-6 flex gap-3 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        <span className="flex items-center gap-2 px-4 py-2 bg-red-100 border border-red-200 rounded-full text-red-700 text-sm font-medium whitespace-nowrap">
          <span className="w-2 h-2 bg-red-500 rounded-full" /> 1 High Risk
        </span>
        <span className="flex items-center gap-2 px-4 py-2 bg-orange-100 border border-orange-200 rounded-full text-orange-700 text-sm font-medium whitespace-nowrap">
          <span className="w-2 h-2 bg-orange-500 rounded-full" /> 2 Medium
        </span>
        <span className="flex items-center gap-2 px-4 py-2 bg-blue-100 border border-blue-200 rounded-full text-blue-700 text-sm font-medium whitespace-nowrap">
          <span className="w-2 h-2 bg-blue-500 rounded-full" /> 2 Low
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-20">
        {displayHazards.map((hazard) => {
          const Icon = hazardIcons[hazard.type] || AlertTriangle;

          let cardBorderColor = '';
          let iconBg = '';
          let badgeBg = '';
          let badgeText = '';

          switch (hazard.severity) {
            case 'high':
              cardBorderColor = 'border-red-100';
              iconBg = 'bg-red-50';
              badgeBg = 'bg-red-100';
              badgeText = 'text-red-700';
              break;
            case 'medium':
              cardBorderColor = 'border-orange-100';
              iconBg = 'bg-orange-50';
              badgeBg = 'bg-orange-100';
              badgeText = 'text-orange-700';
              break;
            case 'low':
              cardBorderColor = 'border-blue-100';
              iconBg = 'bg-blue-50';
              badgeBg = 'bg-blue-100';
              badgeText = 'text-blue-700';
              break;
          }

          return (
            <div key={hazard.id} className={`bg-white border-2 rounded-2xl p-4 flex gap-4 ${cardBorderColor} shadow-sm`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                <Icon className={`w-6 h-6 ${badgeText}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 truncate">{hazard.description}</h3>
                    <p className="text-xs text-gray-500 mb-1">खुला मैनहोल (Example Hindi)</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${badgeBg} ${badgeText}`}>
                    {hazard.severity}
                  </span>
                </div>

                <div className="flex items-center gap-6 mt-2 text-sm text-gray-600">
                  <span className="font-bold">{Math.round(hazard.distance)}m ahead</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-500">Slightly to your left</span>
                </div>
              </div>
              <div className="flex flex-col justify-between items-end">
                <span className="text-[10px] text-gray-400">Just now</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HazardAlerts() {
  const { hazards, removeHazard, isNavigating } = useNavigation();

  useEffect(() => {
    if (!isNavigating) return;

    const interval = setInterval(() => {
      hazards.forEach(hazard => {
        if (hazard.distance <= 1) {
          removeHazard(hazard.id);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hazards, isNavigating, removeHazard]);

  if (hazards.length === 0) return null;

  // Visual alerts disabled as per user request, only voice feedback remains
  return null;
}

function HazardCard({ hazard, onDismiss }: { hazard: Hazard; onDismiss: () => void }) {
  const Icon = hazardIcons[hazard.type];
  const colorClass = severityColors[hazard.severity];

  return (
    <div
      className={`${colorClass} border-4 rounded-xl p-4 shadow-2xl animate-pulse`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <Icon className="w-8 h-8 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xl font-bold uppercase tracking-wide">
                {hazard.severity === 'high' ? '⚠️ DANGER!' : 'Warning'}
              </p>
              <p className="text-2xl font-bold mt-1">{hazard.description}</p>
              <p className="text-lg font-semibold mt-2">
                {hazard.distance < 5
                  ? 'Immediately ahead'
                  : `${Math.round(hazard.distance)} meters ahead`}
              </p>
            </div>
            <button
              onClick={onDismiss}
              onFocus={() => voiceService.speak('Dismiss hazard alert', 'low')}
              className="p-2 rounded-lg hover:bg-black hover:bg-opacity-10 active:bg-opacity-20 focus:ring-4 focus:ring-black focus:ring-opacity-30"
              aria-label="Dismiss alert"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HazardSimulator() {
  const { addHazard, isNavigating } = useNavigation();

  const simulateHazards = [
    { type: 'pothole' as const, description: 'Deep pothole', severity: 'high' as const, distance: 8 },
    { type: 'drain' as const, description: 'Open drain', severity: 'high' as const, distance: 15 },
    { type: 'vehicle' as const, description: 'Parked vehicle', severity: 'medium' as const, distance: 5 },
    { type: 'vendor' as const, description: 'Street vendor ahead', severity: 'low' as const, distance: 20 },
    { type: 'obstacle' as const, description: 'Construction work', severity: 'medium' as const, distance: 12 },
    { type: 'stairs' as const, description: 'Stairs ahead', severity: 'high' as const, distance: 10 },
  ];

  if (!isNavigating) return null;

  return (
    <div className="bg-white border-t-4 border-gray-200 p-4">
      <p className="text-sm font-semibold text-gray-600 mb-3">Simulate Hazards (Demo)</p>
      <div className="grid grid-cols-2 gap-2">
        {simulateHazards.map((hazard, index) => (
          <button
            key={index}
            onClick={() => addHazard(hazard)}
            className="px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200 active:bg-gray-300 border-2 border-gray-300"
          >
            {hazard.description}
          </button>
        ))}
      </div>
    </div>
  );
}
