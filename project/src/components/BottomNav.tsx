import { Home, Navigation, Phone, Settings } from 'lucide-react';
import { voiceService } from '../services/voiceService';

type Tab = 'home' | 'navigation' | 'sos' | 'settings';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home' as Tab, icon: Home, label: 'Home' },
    { id: 'navigation' as Tab, icon: Navigation, label: 'Navigate' },
    { id: 'sos' as Tab, icon: Phone, label: 'SOS' },
    { id: 'settings' as Tab, icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="bg-white border-t border-gray-200 pb-safe">
      <div className="grid grid-cols-4">
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
