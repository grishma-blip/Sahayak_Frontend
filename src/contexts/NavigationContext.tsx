import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { voiceService, hapticService } from '../services/voiceService';

export interface Hazard {
  id: string;
  type: 'obstacle' | 'pothole' | 'drain' | 'stairs' | 'vehicle' | 'vendor';
  distance: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

interface NavigationState {
  isNavigating: boolean;
  currentLocation: { lat: number; lng: number } | null;
  destination: string;
  heading: number;
  expectedHeading: number;
  driftDetected: boolean;
  hazards: Hazard[];
  isFallDetected: boolean;
  emergencyCountdown: number;
  emergencyContacts: EmergencyContact[];
  language: 'en-IN' | 'hi-IN';
  voiceEnabled: boolean;
  hapticEnabled: boolean;
}

interface NavigationContextType extends NavigationState {
  startNavigation: (destination: string) => void;
  stopNavigation: () => void;
  updateHeading: (heading: number) => void;
  addHazard: (hazard: Omit<Hazard, 'id'>) => void;
  removeHazard: (id: string) => void;
  detectFall: () => void;
  cancelEmergency: () => void;
  triggerEmergency: () => void;
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  removeEmergencyContact: (id: string) => void;
  setLanguage: (lang: 'en-IN' | 'hi-IN') => void;
  setVoiceEnabled: (enabled: boolean) => void;
  setHapticEnabled: (enabled: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NavigationState>({
    isNavigating: false,
    currentLocation: null,
    destination: '',
    heading: 0,
    expectedHeading: 0,
    driftDetected: false,
    hazards: [],
    isFallDetected: false,
    emergencyCountdown: 0,
    emergencyContacts: [],
    language: 'en-IN',
    voiceEnabled: true,
    hapticEnabled: true,
  });

  useEffect(() => {
    if (state.driftDetected && state.isNavigating) {
      const diff = Math.abs(state.heading - state.expectedHeading);
      if (diff > 15) {
        const direction = state.heading < state.expectedHeading ? 'right' : 'left';
        voiceService.speak(`You are drifting. Turn ${direction}`, 'high');
        if (direction === 'left') {
          hapticService.vibrateLeft();
        } else {
          hapticService.vibrateRight();
        }
      }
    }
  }, [state.driftDetected, state.heading, state.expectedHeading, state.isNavigating]);

  useEffect(() => {
    if (state.isFallDetected && state.emergencyCountdown > 0) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, emergencyCountdown: prev.emergencyCountdown - 1 }));
      }, 1000);

      if (state.emergencyCountdown === 1) {
        triggerEmergency();
      }

      return () => clearTimeout(timer);
    }
  }, [state.isFallDetected, state.emergencyCountdown]);

  const startNavigation = (destination: string) => {
    setState(prev => ({
      ...prev,
      isNavigating: true,
      destination,
      currentLocation: { lat: 28.6139, lng: 77.2090 },
    }));
    voiceService.speak(`Navigation started to ${destination}`, 'normal');
    hapticService.vibrateSuccess();
  };

  const stopNavigation = () => {
    setState(prev => ({
      ...prev,
      isNavigating: false,
      destination: '',
      hazards: [],
      driftDetected: false,
    }));
    voiceService.speak('Navigation stopped', 'normal');
  };

  const updateHeading = (heading: number) => {
    setState(prev => {
      const diff = Math.abs(heading - prev.expectedHeading);
      return {
        ...prev,
        heading,
        driftDetected: diff > 15 && prev.isNavigating,
      };
    });
  };

  const addHazard = (hazard: Omit<Hazard, 'id'>) => {
    const newHazard: Hazard = {
      ...hazard,
      id: Date.now().toString(),
    };

    setState(prev => ({
      ...prev,
      hazards: [...prev.hazards, newHazard],
    }));

    const distance = hazard.distance < 5 ? 'immediately ahead' : `${hazard.distance} meters ahead`;
    voiceService.speak(
      `Warning! ${hazard.description} ${distance}`,
      hazard.severity === 'high' ? 'emergency' : 'high'
    );

    if (hazard.severity === 'high') {
      hapticService.vibrateDanger();
    }
  };

  const removeHazard = (id: string) => {
    setState(prev => ({
      ...prev,
      hazards: prev.hazards.filter(h => h.id !== id),
    }));
  };

  const detectFall = () => {
    setState(prev => ({
      ...prev,
      isFallDetected: true,
      emergencyCountdown: 10,
    }));
    voiceService.speak('Fall detected! Tap screen to cancel emergency alert', 'emergency');
    hapticService.vibrate([300, 200, 300, 200, 300]);
  };

  const cancelEmergency = () => {
    setState(prev => ({
      ...prev,
      isFallDetected: false,
      emergencyCountdown: 0,
    }));
    voiceService.speak('Emergency cancelled', 'normal');
    hapticService.vibrateSuccess();
  };

  const triggerEmergency = () => {
    voiceService.speak('Sending emergency alert to your caregivers', 'emergency');

    // Original logging
    console.log('Emergency triggered!', {
      location: state.currentLocation,
      contacts: state.emergencyContacts,
    });

    // SMS Redirection
    const phoneNumber = "9324120767";
    const message = "EMERGENCY: Sahayak user may have fallen. Immediate assistance needed";

    // Use window.location.href to trigger SMS app
    // Encode the message to ensure special characters work
    const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;

    // Slight delay to allow voice to start speaking
    setTimeout(() => {
      window.location.href = smsUrl;
    }, 1500);
  };

  const addEmergencyContact = (contact: Omit<EmergencyContact, 'id'>) => {
    const newContact: EmergencyContact = {
      ...contact,
      id: Date.now().toString(),
    };
    setState(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, newContact],
    }));
  };

  const removeEmergencyContact = (id: string) => {
    setState(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter(c => c.id !== id),
    }));
  };

  const setLanguage = (lang: 'en-IN' | 'hi-IN') => {
    setState(prev => ({ ...prev, language: lang }));
    voiceService.setLanguage(lang);
  };

  const setVoiceEnabled = (enabled: boolean) => {
    setState(prev => ({ ...prev, voiceEnabled: enabled }));
    voiceService.setEnabled(enabled);
  };

  const setHapticEnabled = (enabled: boolean) => {
    setState(prev => ({ ...prev, hapticEnabled: enabled }));
    hapticService.setEnabled(enabled);
  };

  return (
    <NavigationContext.Provider
      value={{
        ...state,
        startNavigation,
        stopNavigation,
        updateHeading,
        addHazard,
        removeHazard,
        detectFall,
        cancelEmergency,
        triggerEmergency,
        addEmergencyContact,
        removeEmergencyContact,
        setLanguage,
        setVoiceEnabled,
        setHapticEnabled,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
