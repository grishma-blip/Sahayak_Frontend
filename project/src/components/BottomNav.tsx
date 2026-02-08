import { Home, Navigation, Phone, Settings, Mic } from 'lucide-react';
import { voiceService } from '../services/voiceService';
import { useVoice } from '../contexts/VoiceContext';

type Tab = 'home' | 'navigation' | 'detection' | 'sos' | 'settings';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { isListening, toggleListening } = useVoice();

  const tabs = [
    { id: 'home' as Tab, icon: Home, label: 'Home' },
    { id: 'navigation' as Tab, icon: Navigation, label: 'Navigate' },
    { id: 'sos' as Tab, icon: Phone, label: 'SOS' },
    { id: 'settings' as Tab, icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="bg-white border-t border-gray-200 pb-safe relative z-50">
      {/* Floating Mic Indicator/Toggle */}
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
        <button
          onClick={toggleListening}
          className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${isListening
            ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-100'
            : 'bg-green-600 text-white hover:bg-green-500'
            }`}
        >
          <Mic className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-4 pt-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
                voiceService.speak(`${tab.label} tab`, 'low');
              }}
              className={`flex flex-col items-center justify-center py-3 transition-colors ${isActive ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={`mb-1 p-1 rounded-xl transition-all ${isActive ? 'bg-green-50' : ''}`}>
                <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
