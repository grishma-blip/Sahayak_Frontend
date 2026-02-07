import { AlertCircle, Phone, X } from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';
import { voiceService } from '../services/voiceService';

export function EmergencyScreen() {
  const { detectFall, emergencyContacts } = useNavigation();

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <Phone className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Emergency SOS</h1>
            <p className="text-xs text-gray-500">आपातकालीन SOS</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">Fall detection, SOS alerts & caregiver contact</p>
      </div>

      {/* Main SOS Action */}
      <div className="px-6 py-4">
        <button
          onClick={() => {
            detectFall();
            voiceService.speak('SOS Alert Triggered', 'high');
          }}
          className="w-full aspect-[4/3] bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border-4 border-red-500 shadow-2xl flex flex-col items-center justify-center group active:scale-95 transition-transform relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-red-600/10 animate-pulse" />
          <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
            <AlertCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-red-500 mb-2">SOS</h2>
          <p className="text-gray-400 font-medium">Tap for emergency alert</p>
          <p className="text-xs text-gray-500 mt-1">आपातकालीन अलर्ट के लिए दबाएँ</p>
        </button>
      </div>

      {/* Fall Detection Status */}
      <div className="px-6 mb-6">
        <div className="bg-gray-900 rounded-2xl p-4 flex items-center justify-between shadow-lg border border-gray-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
              <div className="relative">
                <div className="absolute -inset-1 bg-green-500/20 rounded-full animate-ping" />
                <AlertCircle className="w-6 h-6 text-green-500 relative z-10" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-white">Fall Detection</h3>
              <p className="text-xs text-gray-400">Monitoring...</p>
            </div>
          </div>
          <div className="px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-green-400">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Circle */}
      <div className="flex-1 overflow-y-auto px-6 pb-20">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Phone className="w-4 h-4" /> Emergency Circle
        </h3>
        <div className="space-y-3">
          {emergencyContacts.map((contact, idx) => (
            <div key={contact.id || idx} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-lg font-bold text-gray-700">
                  {contact.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{contact.name}</h4>
                  <p className="text-xs text-gray-500">{contact.relationship || 'Contact'} • {contact.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Live
              </div>
            </div>
          ))}
          {emergencyContacts.length === 0 && (
            <p className="text-gray-500 text-center py-4">No emergency contacts added.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function EmergencySOSOverlay() {
  const { isFallDetected, emergencyCountdown, cancelEmergency, emergencyContacts } = useNavigation();

  if (!isFallDetected) return null;

  return (
    <div className="fixed inset-0 bg-red-600 z-[60] flex items-center justify-center p-6">
      <div className="max-w-lg w-full space-y-8 text-center">
        <div className="space-y-4">
          <AlertCircle className="w-32 h-32 mx-auto text-white animate-pulse" />
          <h1 className="text-5xl font-bold text-white">FALL DETECTED</h1>
          <p className="text-3xl font-semibold text-red-100">
            Emergency alert in {emergencyCountdown} seconds
          </p>
        </div>

        <div className="bg-white bg-opacity-20 rounded-2xl p-6 backdrop-blur">
          <p className="text-xl font-medium text-white mb-4">
            If you're okay, tap the button below to cancel
          </p>
          <div className="w-48 h-48 mx-auto bg-white rounded-full flex items-center justify-center relative">
            <div
              className="absolute inset-0 rounded-full bg-red-600 opacity-30 animate-ping"
              style={{ animationDuration: '1s' }}
            />
            <span className="text-8xl font-bold text-red-600 z-10">{emergencyCountdown}</span>
          </div>
        </div>

        {emergencyContacts.length > 0 && (
          <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur">
            <div className="flex items-center gap-2 justify-center mb-2">
              <Phone className="w-5 h-5 text-white" />
              <p className="text-lg font-semibold text-white">Will alert:</p>
            </div>
            <div className="space-y-1">
              {emergencyContacts.map((contact) => (
                <p key={contact.id} className="text-white font-medium">
                  {contact.name} - {contact.phone}
                </p>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => {
            cancelEmergency();
            voiceService.speak('Emergency cancelled', 'high');
          }}
          className="w-full px-8 py-6 text-2xl font-bold text-red-600 bg-white rounded-2xl hover:bg-gray-100 active:bg-gray-200 focus:ring-8 focus:ring-white shadow-2xl flex items-center justify-center gap-3"
        >
          <X className="w-10 h-10" />
          I'M OKAY - CANCEL ALERT
        </button>

        <p className="text-sm text-red-100">
          Tap anywhere on the screen or press any button to cancel
        </p>
      </div>
    </div>
  );
}
