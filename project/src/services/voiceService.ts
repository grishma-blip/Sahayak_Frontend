export class VoiceService {
  private synth: SpeechSynthesis;
  private enabled: boolean = true;
  private language: string = 'en-IN';

  private audioQueue: HTMLAudioElement[] = [];

  constructor() {
    this.synth = window.speechSynthesis;
  }

  setLanguage(lang: 'en-IN' | 'hi-IN') {
    this.language = lang;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.synth.cancel();
      this.stopAudio();
    }
  }

  stopAudio() {
    this.audioQueue.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.audioQueue = [];
  }

  private audioCache: Map<string, string> = new Map();

  async speak(text: string, priority: 'low' | 'normal' | 'high' | 'emergency' = 'normal') {
    if (!this.enabled) return;

    if (priority === 'emergency' || priority === 'high') {
      this.synth.cancel();
      this.stopAudio();
    }

    // Check cache first
    const cacheKey = `${text}-${this.language}`;
    if (this.audioCache.has(cacheKey)) {
      const audioContent = this.audioCache.get(cacheKey);
      this.playAudio(audioContent!);
      return;
    }

    try {
      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
      if (!apiKey) {
        this.speakWithBrowserTts(text, priority);
        return;
      }

      const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: this.language,
            name: this.language === 'en-IN' ? 'en-IN-Wavenet-D' : 'hi-IN-Wavenet-A',
            ssmlGender: 'FEMALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            pitch: priority === 'emergency' ? 2.0 : 0.0,
            speakingRate: priority === 'emergency' ? 1.2 : 1.0
          }
        }),
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      const audioContent = data.audioContent;

      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
      this.audioQueue.push(audio);

      audio.onended = () => {
        this.audioQueue = this.audioQueue.filter(a => a !== audio);
      };

      await audio.play();

    } catch (error) {
      this.speakWithBrowserTts(text, priority);
    }
  }

  private speakWithBrowserTts(text: string, priority: 'low' | 'normal' | 'high' | 'emergency') {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.language;
    utterance.rate = priority === 'emergency' ? 1.2 : 1.0;
    utterance.volume = priority === 'emergency' ? 1.0 : 0.8;
    utterance.pitch = priority === 'emergency' ? 1.2 : 1.0;
    this.synth.speak(utterance);
  }

  private playAudio(audioContent: string) {
    const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
    this.audioQueue.push(audio);

    audio.onended = () => {
      this.audioQueue = this.audioQueue.filter(a => a !== audio);
    };

    audio.play().catch(() => {
      // Fail silently
    });
  }

  cancel() {
    this.synth.cancel();
    this.stopAudio();
  }
}

export class HapticService {
  private enabled: boolean = true;

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  vibrate(pattern: number | number[]) {
    if (!this.enabled || !navigator.vibrate) return;
    navigator.vibrate(pattern);
  }

  vibrateLeft() {
    this.vibrate([100, 50, 100]);
  }

  vibrateRight() {
    this.vibrate([100, 50, 100, 50, 100]);
  }

  vibrateDanger() {
    this.vibrate([200, 100, 200, 100, 200]);
  }

  vibrateSuccess() {
    this.vibrate([50, 50, 50]);
  }
}

export const voiceService = new VoiceService();
export const hapticService = new HapticService();
