export class VoiceService {
  private synth: SpeechSynthesis;
  private enabled: boolean = true;
  private language: string = 'en-IN';
  private audioQueue: HTMLAudioElement[] = [];
  private audioCache: Map<string, string> = new Map(); // Cache for Google TTS audio

  // Keep reference to prevent garbage collection before speech starts/finishes
  private utteranceRef: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.synth = window.speechSynthesis;

    // Force voice loading
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => {
        console.log("VoiceService: Voices loaded:", this.synth.getVoices().length);
      };
    }
    console.log("VoiceService initialized");
  }

  setLanguage(lang: 'en-IN' | 'hi-IN') {
    this.language = lang;
    console.log("VoiceService: Language set to", lang);
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.cancel();
    }
    console.log("VoiceService: Enabled set to", enabled);
  }

  stopAudio() {
    this.audioQueue.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.audioQueue = [];
  }

  cancel() {
    this.synth.cancel();
    this.stopAudio();
    if (this.utteranceRef) {
      this.utteranceRef = null;
    }
    console.log("VoiceService: Cancelled all audio");
  }

  // Public test method
  testVoice() {
    this.speak("Testing voice feedback. One, two, three.", "high");
  }

  async speak(text: string, priority: 'low' | 'normal' | 'high' | 'emergency' = 'normal') {
    if (!this.enabled) {
      console.log("VoiceService: Speak called but disabled");
      return;
    }

    console.log(`VoiceService: Speaking "${text}" with priority ${priority}`);

    // Cancel current speech for high priority instructions
    if (priority === 'emergency' || priority === 'high') {
      this.cancel();
    }

    // Check cache first
    const cacheKey = `${text}-${this.language}`;
    if (this.audioCache.has(cacheKey)) {
      console.log("VoiceService: Playing from cache");
      this.playAudio(this.audioCache.get(cacheKey)!);
      return;
    }

    try {
      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

      // 1. Check if API Key exists. If not, FALLBACK to Browser immediately.
      if (!apiKey) {
        console.warn("VoiceService: No Google API Key found, falling back to browser TTS");
        this.speakWithBrowserTts(text, priority);
        return;
      }

      // 2. Try Google Cloud Text-to-Speech API
      // Use Wavenet voices for better quality
      const voiceName = this.language === 'en-IN' ? 'en-IN-Wavenet-B' : 'hi-IN-Wavenet-B';

      const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: this.language, name: voiceName },
          audioConfig: { audioEncoding: 'MP3' },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();

      if (data.audioContent) {
        // Cache the audio content
        this.audioCache.set(cacheKey, data.audioContent);
        this.playAudio(data.audioContent);
      } else {
        throw new Error("No audio content received from Google TTS");
      }

    } catch (error) {
      // 3. FALLBACK: If catch any error (Network, API, etc.), use Browser TTS
      console.warn("VoiceService: Google TTS failed, falling back to browser:", error);
      this.speakWithBrowserTts(text, priority);
    }
  }

  private playAudio(base64Audio: string) {
    const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
    this.audioQueue.push(audio);

    audio.onended = () => {
      this.audioQueue = this.audioQueue.filter(a => a !== audio);
    };

    audio.onerror = (e) => {
      console.error("VoiceService: Audio playback error", e);
      this.audioQueue = this.audioQueue.filter(a => a !== audio);
    };

    try {
      audio.play().catch(e => console.error("VoiceService: Play failed (likely autoplay policy)", e));
    } catch (e) {
      console.error("VoiceService: Playback exception", e);
    }
  }

  private speakWithBrowserTts(text: string, priority: 'low' | 'normal' | 'high' | 'emergency') {
    // 1. Cancel previous if still pending (optional, depending on queue preference)
    // this.synth.cancel(); 

    // 2. Create Utterance
    const utterance = new SpeechSynthesisUtterance(text);

    // 3. Store reference to prevent GC
    this.utteranceRef = utterance;

    // 4. Select Voice
    const voices = this.synth.getVoices();
    let preferredVoice = voices.find(v => v.lang === this.language);

    // Fallback 1: Any English voice
    if (!preferredVoice && this.language.startsWith('en')) {
      preferredVoice = voices.find(v => v.lang.startsWith('en'));
    }

    // Fallback 2: First available voice (better than silence)
    if (!preferredVoice && voices.length > 0) {
      preferredVoice = voices[0];
      console.warn("VoiceService: Fallback to first available voice:", preferredVoice.name);
    }

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      console.log("VoiceService: Using browser voice", preferredVoice.name);
    } else {
      console.warn("VoiceService: No specific voice found, using system default");
    }

    utterance.lang = this.language;
    utterance.rate = priority === 'emergency' ? 1.1 : 1.0;
    utterance.volume = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => console.log("VoiceService: Browser speech started");
    utterance.onend = () => {
      console.log("VoiceService: Browser speech ended");
      // Clear reference only when done
      if (this.utteranceRef === utterance) {
        this.utteranceRef = null;
      }
    };
    utterance.onerror = (e) => {
      console.error("VoiceService: Browser speech error", e);
      if (this.utteranceRef === utterance) {
        this.utteranceRef = null;
      }
    };

    // 5. Speak
    this.synth.speak(utterance);

    // 6. Chrome bug fix: resume if paused
    if (this.synth.paused) {
      console.log("VoiceService: Resuming paused synthesis");
      this.synth.resume();
    }
  }
}

export class HapticService {
  private enabled: boolean = true;

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  vibrate(pattern: number | number[]) {
    if (!this.enabled || !navigator.vibrate) return;
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.error("HapticService error:", e);
    }
  }

  vibrateLeft() { this.vibrate([100, 50, 100]); }
  vibrateRight() { this.vibrate([100, 50, 100, 50, 100]); }
  vibrateDanger() { this.vibrate([200, 100, 200, 100, 200]); }
  vibrateSuccess() { this.vibrate([50, 50, 50]); }
}

export const voiceService = new VoiceService();
export const hapticService = new HapticService();
