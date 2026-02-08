import { Mic, Phone, Navigation, Eye, MicOff } from 'lucide-react';
import { voiceService } from '../services/voiceService';
import { useVoice } from '../contexts/VoiceContext';

interface HomeProps {
    onNavigate: (tab: 'navigation' | 'detection' | 'sos' | 'settings') => void;
}

export function Home({ onNavigate }: HomeProps) {
    const { isListening, toggleListening } = useVoice();

    return (
        <div className="h-full flex flex-col bg-gray-50 overflow-y-auto pb-20">
            {/* Header */}
            <header className="p-6 flex justify-between items-center bg-white shadow-sm sticky top-0 z-10">
                <div>
                    <div className="flex items-center gap-2">
                        <Eye className="w-8 h-8 text-green-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Sahayak</h1>
                    </div>
                    <p className="text-sm text-gray-500">सहायक — आपका सुरक्षित साथी</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => voiceService.testVoice()}
                        className="p-2 bg-gray-200 rounded-full text-xs font-bold text-gray-700 active:bg-gray-300"
                        title="Test Voice Output"
                    >
                        Test Voice
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                        <div className={`w-2 h-2 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-500'} rounded-full`} />
                        <span className={`text-xs font-semibold ${isListening ? 'text-red-700' : 'text-green-700'}`}>
                            {isListening ? 'Listening' : 'Active'}
                        </span>
                    </div>
                </div>
            </header>

            <div className="p-6 space-y-6">
                {/* Voice Assistant Card */}
                <div className={`bg-gradient-to-r ${isListening ? 'from-red-900 to-red-800' : 'from-gray-900 to-gray-800'} rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-colors duration-300`}>
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold mb-1">
                                {isListening ? 'Listening...' : 'Voice Assistant Ready'}
                            </h2>
                            <p className="text-gray-300 text-sm">
                                {isListening ? 'Say a command like "Navigate"' : 'Tap or say "Hey Sahayak"'}
                            </p>
                            <p className="text-gray-400 text-xs">
                                {isListening ? 'सुन रहा हूँ...' : '"हे सहायक" बोलें'}
                            </p>
                        </div>
                        <button
                            onClick={toggleListening}
                            className={`w-12 h-12 ${isListening ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'} rounded-full flex items-center justify-center transition-colors shadow-lg active:scale-95`}
                        >
                            {isListening ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
                        </button>
                    </div>
                    {/* Decorative circles */}
                    <div className={`absolute top-0 right-0 w-32 h-32 ${isListening ? 'bg-red-500' : 'bg-green-500'} opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 transition-colors duration-300`} />
                </div>


                {/* Feature Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => onNavigate('navigation')}
                        className="group bg-gradient-to-br from-green-900 to-green-800 p-6 rounded-2xl shadow-md flex flex-col items-center text-center hover:scale-[1.02] transition-transform active:scale-95"
                    >
                        <div className="w-14 h-14 bg-green-700/50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
                            <Navigation className="w-7 h-7 text-green-100" />
                        </div>
                        <span className="text-lg font-bold text-white">Navigate</span>
                        <span className="text-xs text-green-200 mt-1">नेविगेट करें</span>
                        <span className="text-[10px] text-green-300/60 mt-2">Voice-guided walking</span>
                    </button>

                    <button
                        onClick={() => onNavigate('sos')}
                        className="group bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex flex-col items-center text-center hover:border-red-200 hover:bg-red-50 transition-all active:scale-95"
                    >
                        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
                            <Phone className="w-7 h-7 text-red-600" />
                        </div>
                        <span className="text-lg font-bold text-gray-900">Emergency</span>
                        <span className="text-xs text-gray-500 mt-1">आपातकाल</span>
                        <span className="text-[10px] text-gray-400 mt-2">SOS alert & contact</span>
                    </button>

                    <button
                        onClick={() => {
                            onNavigate('detection');
                            voiceService.speak("Opening detection mode", "normal");
                        }}
                        className="group bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex flex-col items-center text-center hover:border-blue-200 hover:bg-blue-50 transition-all active:scale-95"
                    >
                        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                            <Eye className="w-7 h-7 text-blue-600" />
                        </div>
                        <span className="text-lg font-bold text-gray-900">Detect</span>
                        <span className="text-xs text-gray-500 mt-1">पहचानें</span>
                        <span className="text-[10px] text-gray-400 mt-2">Scene recognition</span>
                    </button>
                </div>

            </div>
        </div>
    );
}
