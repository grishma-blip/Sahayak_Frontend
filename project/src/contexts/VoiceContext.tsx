import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { voiceService } from '../services/voiceService';

interface VoiceContextType {
    isListening: boolean;
    transcript: string;
    startListening: () => void;
    stopListening: () => void;
    toggleListening: () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children, onNavigate }: { children: ReactNode, onNavigate: (tab: any) => void }) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<any>(null);
    const isDedicatedStopRef = useRef(false);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported');
            return;
        }

        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true; // Key for continuous listening
        recognition.interimResults = false;
        recognition.lang = 'en-IN';

        recognition.onstart = () => {
            console.log('VoiceContext: Listening started');
            setIsListening(true);
            isDedicatedStopRef.current = false;
        };

        recognition.onend = () => {
            console.log('VoiceContext: Listening ended');
            setIsListening(false);

            // Auto-restart if not explicitly stopped (for "always on" feel)
            if (!isDedicatedStopRef.current) {
                console.log('VoiceContext: Restarting listener...');
                try {
                    recognition.start();
                } catch (e) {
                    console.error("Failed to restart recognition:", e);
                }
            }
        };

        recognition.onresult = (event: any) => {
            const lastResultIndex = event.results.length - 1;
            const command = event.results[lastResultIndex][0].transcript.toLowerCase().trim();
            console.log('VoiceContext: Command received:', command);
            setTranscript(command);

            processCommand(command);
        };

        recognition.onerror = (event: any) => {
            console.error('VoiceContext: Recognition error', event.error);
            if (event.error === 'not-allowed') {
                isDedicatedStopRef.current = true;
                setIsListening(false);
                voiceService.speak("Microphone access denied", "high");
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [onNavigate]);

    const processCommand = (command: string) => {
        if (command.includes('navigate') || command.includes('navigation') || command.includes('map')) {
            // voiceService.speak("Opening Navigation", "normal");
            onNavigate('navigation');
        } else if (command.includes('sos') || command.includes('emergency') || command.includes('help')) {
            // voiceService.speak("Opening Emergency SOS", "emergency");
            onNavigate('sos');
        } else if (command.includes('detect') || command.includes('camera') || command.includes('vision') || command.includes('see') || command.includes('recognition')) {
            // voiceService.speak("Opening Detection Mode", "normal");
            onNavigate('detection');
        } else if (command.includes('setting') || command.includes('configure') || command.includes('options')) {
            // voiceService.speak("Opening Settings", "normal");
            onNavigate('settings');
        } else if (command.includes('home') || command.includes('dashboard') || command.includes('main')) {
            // voiceService.speak("Going Home", "normal");
            onNavigate('home');
        } else if (command.includes('stop listening') || command.includes('stop voice') || command.includes('quiet')) {
            voiceService.speak("Voice assistant paused", "normal");
            stopListening();
        }
    };

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            try {
                isDedicatedStopRef.current = false;
                recognitionRef.current.start();
                voiceService.speak("Listening started. You can give commands now.", "normal");
            } catch (e) {
                console.error("Start error:", e);
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            isDedicatedStopRef.current = true;
            recognitionRef.current.stop();
        }
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    return (
        <VoiceContext.Provider value={{ isListening, transcript, startListening, stopListening, toggleListening }}>
            {children}
        </VoiceContext.Provider>
    );
}

export function useVoice() {
    const context = useContext(VoiceContext);
    if (context === undefined) {
        throw new Error('useVoice must be used within a VoiceProvider');
    }
    return context;
}
