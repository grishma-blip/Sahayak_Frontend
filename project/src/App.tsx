import { useState, useEffect } from 'react';
import { NavigationProvider } from './contexts/NavigationContext';
import { VoiceProvider } from './contexts/VoiceContext';
import { NavigationScreen } from './components/NavigationScreen';
import { DetectionScreen } from './components/DetectionScreen';
import { Settings } from './components/Settings';
import { HazardAlerts, HazardSimulator } from './components/HazardAlerts';
import { EmergencyScreen, EmergencySOSOverlay } from './components/EmergencySOS';
import { BottomNav } from './components/BottomNav';
import { FallDetector } from './components/FallDetector';
import { Home } from './components/Home';
import { healthCheck } from './services/api';
import { sendEvent } from './services/eventService';

type Tab = 'home' | 'navigation' | 'detection' | 'sos' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  useEffect(() => {
    document.title = 'DrishtiGuide - SafePath Navigator';
  }, []);

  useEffect(() => {
    void healthCheck();
    sendEvent('APP_START', { source: 'frontend' });
  }, []);

  return (
    <NavigationProvider>
      <VoiceProvider onNavigate={setActiveTab}>
        <div className="h-[100dvh] flex flex-col overflow-hidden bg-gray-50">
          <HazardAlerts />
          <EmergencySOSOverlay />


          <main className="flex-1 overflow-hidden relative">
            {activeTab === 'home' && <Home onNavigate={setActiveTab} />}
            {activeTab === 'navigation' && <NavigationScreen />}
            {activeTab === 'detection' && <DetectionScreen />}
            {activeTab === 'sos' && <EmergencyScreen />}
            {activeTab === 'settings' && <Settings onClose={() => setActiveTab('home')} />}
          </main>

          {activeTab === 'navigation' && <HazardSimulator />}
          <FallDetector />

          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </VoiceProvider>
    </NavigationProvider>
  );
}

export default App;
