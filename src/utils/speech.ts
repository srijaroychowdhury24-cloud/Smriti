import { Language } from '../types';

let synth: SpeechSynthesis | null = null;
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  synth = window.speechSynthesis;
}

// Global echo suppression state: prevents system TTS from ever triggering voice recognition on itself
let isSyntheticSpeechPlaying = false;
let lastSpeechEndTime = 0;

export function isSpeakingOrInCooldown(): boolean {
  if (isSyntheticSpeechPlaying) return true;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    if (window.speechSynthesis && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
      return true;
    }
  }
  // Cooldown buffer of 2000ms after speech ends to absorb microphone echo, room acoustics, and OS audio buffers
  if (Date.now() - lastSpeechEndTime < 2000) return true;
  return false;
}

export function playSoothingWelcome(
  onStart?: () => void,
  onEnd?: () => void,
  lang: Language = 'en'
) {
  if (!synth) {
    if (onStart) onStart();
    if (onEnd) setTimeout(onEnd, 600);
    return;
  }

  try {
    synth.cancel();
    // Warm welcoming greeting - phrased naturally in each native language
    const welcomeText =
      lang === 'bn'
        ? "স্মৃতিতে আপনাকে স্বাগতম। খেলতে চাইলে বলুন, খেলা শুরু।"
        : lang === 'as'
        ? "স্মৃতিলৈ আপোনাক স্বাগতম। খেলিবলৈ কওক, খেল আৰম্ভ।"
        : lang === 'hi'
        ? "स्मृति में आपका स्वागत है। खेलने के लिए कहिए, खेल शुरू करें।"
        : "Welcome to Smriti. Say, go to the games, to begin.";

    const utterance = new SpeechSynthesisUtterance(welcomeText);

    // Language code mapping
    const langCode = lang === 'as' ? 'as-IN' : lang === 'bn' ? 'bn-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.lang = langCode;

    const voices = synth.getVoices();
    const matchingVoice = voices.find(v => v.lang.toLowerCase().startsWith(lang)) ||
      (lang === 'as' ? voices.find(v => v.lang.toLowerCase().startsWith('bn')) : undefined) ||
      voices.find(v => 
        (v.lang.startsWith('en') || v.lang.startsWith('hi') || v.lang.startsWith('bn')) &&
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Serena') || v.name.includes('Karen'))
      ) || voices[0];

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.pitch = 0.98;
    utterance.rate = 0.88; // gentle, comforting pace
    utterance.volume = 1.0;

    let callbackFired = false;
    let watchdogTimer: any = null;

    const triggerEnd = () => {
      if (!callbackFired) {
        callbackFired = true;
        isSyntheticSpeechPlaying = false;
        lastSpeechEndTime = Date.now();
        if (watchdogTimer) clearTimeout(watchdogTimer);
        if (onEnd) onEnd();
      }
    };

    utterance.onstart = () => {
      isSyntheticSpeechPlaying = true;
      if (onStart) onStart();
    };

    utterance.onend = triggerEnd;
    utterance.onerror = triggerEnd;

    // Safety watchdog: DO NOT cut off early while speaking!
    // 10s timeout, verifies synth is not speaking before firing
    watchdogTimer = setTimeout(() => {
      if (!callbackFired) {
        if (synth && (synth.speaking || synth.pending)) {
          setTimeout(() => {
            if (!callbackFired) triggerEnd();
          }, 3500);
        } else {
          triggerEnd();
        }
      }
    }, 10000);

    synth.speak(utterance);
  } catch (err) {
    console.error("Speech error:", err);
    isSyntheticSpeechPlaying = false;
    lastSpeechEndTime = Date.now();
    if (onEnd) onEnd();
  }
}

export function speakMessage(text: string, lang: Language = 'en', onEnd?: () => void) {
  if (!synth) {
    if (onEnd) onEnd();
    return;
  }

  try {
    synth.cancel();
    if (synth.paused) {
      synth.resume();
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Language code mapping
    const langCode = lang === 'as' ? 'as-IN' : lang === 'bn' ? 'bn-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.lang = langCode;

    const voices = synth.getVoices();
    const matchingVoice = voices.find(v => v.lang.toLowerCase().startsWith(lang)) ||
      (lang === 'as' ? voices.find(v => v.lang.toLowerCase().startsWith('bn')) : undefined) ||
      voices.find(v => v.lang.toLowerCase().includes(lang === 'as' ? 'bn' : lang));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.pitch = 1.0;
    utterance.rate = 0.88; // gentle, comforting, natural pace
    utterance.volume = 1.0;

    let finished = false;
    let watchdogTimer: any = null;
    const finish = () => {
      if (!finished) {
        finished = true;
        isSyntheticSpeechPlaying = false;
        lastSpeechEndTime = Date.now();
        if (watchdogTimer) clearTimeout(watchdogTimer);
        if (onEnd) onEnd();
      }
    };

    utterance.onstart = () => {
      isSyntheticSpeechPlaying = true;
    };
    utterance.onend = finish;
    utterance.onerror = finish;

    // Safety watchdog: ensure callback finishes even if speech synthesis stalls
    const estimatedSec = Math.max(4, Math.ceil(text.length / 7));
    watchdogTimer = setTimeout(finish, estimatedSec * 1000);

    synth.speak(utterance);
  } catch (err) {
    console.error("Speech error", err);
    isSyntheticSpeechPlaying = false;
    lastSpeechEndTime = Date.now();
    if (onEnd) onEnd();
  }
}

export function stopAllSpeech() {
  isSyntheticSpeechPlaying = false;
  lastSpeechEndTime = Date.now();
  if (synth) {
    synth.cancel();
  }
}

// ----------------------------------------------------
// FULL SPEECH RECOGNITION (STT) & VOICE COMMAND ENGINE
// ----------------------------------------------------

export type VoiceCommandIntent =
  | 'home'
  | 'games'
  | 'dashboard'
  | 'reminders'
  | 'garden'
  | 'breathing'
  | 'replay'
  | 'next'
  | 'hint'
  | 'stop'
  | 'read_aloud'
  | 'game_match'
  | 'game_harmony'
  | 'game_association'
  | 'game_my_home'
  | 'game_sort_it_out'
  | 'game_who_is_this'
  | 'unknown';

export interface VoiceRecognitionResult {
  transcript: string;
  intent: VoiceCommandIntent;
  confidence: number;
}

type SpeechRecognitionType = any;

let activeRecognition: SpeechRecognitionType = null;

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

export function parseVoiceCommandIntent(text: string): VoiceCommandIntent {
  const t = text.toLowerCase().trim();

  // 1. SPECIFIC GAME RECOGNITION (Evaluated first to accurately capture which game the user wants to play)
  // Game 1: Cultural Memory Match
  if (
    t === '1' ||
    t === '১' ||
    t === '१' ||
    t === 'one' ||
    t === 'first' ||
    t.includes('game 1') ||
    t.includes('game one') ||
    t.includes('1st') ||
    t.includes('এক নম্বর') ||
    t.includes('প্রথম খেলা') ||
    t.includes('১ম খেলা') ||
    t.includes('पहला खेल') ||
    t.includes('एक नंबर') ||
    t.includes('cultural match') ||
    t.includes('match') ||
    t.includes('cultural') ||
    t.includes('memory') ||
    t.includes('cards') ||
    t.includes('card') ||
    t.includes('সাংস্কৃতিক মিল') ||
    t.includes('সাংস্কৃতিক খেল') ||
    t.includes('সাংস্কৃতিক') ||
    t.includes('কার্ড') ||
    t.includes('কার্ডের') ||
    t.includes('মিল') ||
    t.includes('জোড়া') ||
    t.includes('জোড়া') ||
    t.includes('सांस्कृतिक मिलान') ||
    t.includes('सांस्कृतिक') ||
    t.includes('कार्ड') ||
    t.includes('जोड़ा') ||
    t.includes('जोड़ी') ||
    t.includes('मैच')
  ) {
    return 'game_match';
  }

  // Game 2: Sound Harmony / Musical Pattern
  if (
    t === '2' ||
    t === '২' ||
    t === '२' ||
    t === 'two' ||
    t === 'second' ||
    t.includes('game 2') ||
    t.includes('game two') ||
    t.includes('2nd') ||
    t.includes('দুই নম্বর') ||
    t.includes('দ্বিতীয় খেলা') ||
    t.includes('২য় খেলা') ||
    t.includes('दूसरा खेल') ||
    t.includes('दो नंबर') ||
    t.includes('sound harmony') ||
    t.includes('harmony') ||
    t.includes('sound') ||
    t.includes('music') ||
    t.includes('musical') ||
    t.includes('instrument') ||
    t.includes('instruments') ||
    t.includes('pattern') ||
    t.includes('rhythm') ||
    t.includes('dhol') ||
    t.includes('bell') ||
    t.includes('flute') ||
    t.includes('সুর ও ছন্দ') ||
    t.includes('সুৰ আৰু ছন্দ') ||
    t.includes('সুর') ||
    t.includes('সুৰ') ||
    t.includes('ছন্দ') ||
    t.includes('গান') ||
    t.includes('বাদ্যযন্ত্র') ||
    t.includes('ঢোল') ||
    t.includes('সুর ও লয়') ||
    t.includes('सुर व लय') ||
    t.includes('सुर और लय') ||
    t.includes('सुर') ||
    t.includes('लय') ||
    t.includes('संगीत') ||
    t.includes('धुन') ||
    t.includes('ढोल')
  ) {
    return 'game_harmony';
  }

  // Game 3: Daily Routine / Chai Recipe / Association
  if (
    t === '3' ||
    t === '৩' ||
    t === '३' ||
    t === 'three' ||
    t === 'third' ||
    t.includes('game 3') ||
    t.includes('game three') ||
    t.includes('3rd') ||
    t.includes('তিন নম্বর') ||
    t.includes('তৃতীয় খেলা') ||
    t.includes('৩য় খেলা') ||
    t.includes('तीसरा खेल') ||
    t.includes('तीन नंबर') ||
    t.includes('daily routine') ||
    t.includes('routine') ||
    t.includes('association') ||
    t.includes('daily') ||
    t.includes('chai') ||
    t.includes('tea') ||
    t.includes('recipe') ||
    t.includes('morning') ||
    t.includes('দৈনন্দিন অনুষঙ্গ') ||
    t.includes('দৈনন্দিন সংগ') ||
    t.includes('দৈনন্দিন') ||
    t.includes('অনুষঙ্গ') ||
    t.includes('চা') ||
    t.includes('চাহ') ||
    t.includes('दैनिक साहचर्य') ||
    t.includes('दैनिक') ||
    t.includes('साहचर्य') ||
    t.includes('चाय') ||
    t.includes('दिनचर्या') ||
    t.includes('रूटीन')
  ) {
    return 'game_association';
  }

  // Game 4: My Home - Room Sorting
  if (
    t === '4' ||
    t === '৪' ||
    t === '४' ||
    t === 'four' ||
    t === 'fourth' ||
    t.includes('game 4') ||
    t.includes('game four') ||
    t.includes('4th') ||
    t.includes('চার নম্বর') ||
    t.includes('চতুর্থ খেলা') ||
    t.includes('৪র্থ খেলা') ||
    t.includes('चौथा खेल') ||
    t.includes('चार नंबर') ||
    t.includes('my home') ||
    t.includes('room') ||
    t.includes('house') ||
    t.includes('bedroom') ||
    t.includes('kitchen') ||
    t.includes('living room') ||
    t.includes('আমার ঘর') ||
    t.includes('মোৰ ঘৰ') ||
    t.includes('ঘর') ||
    t.includes('ঘৰ') ||
    t.includes('বাড়ি') ||
    t.includes('রান্নাঘর') ||
    t.includes('শোবার ঘর') ||
    t.includes('ঠাকুরঘর') ||
    t.includes('मेरा घर') ||
    t.includes('घर') ||
    t.includes('कमरा') ||
    t.includes('रसोई') ||
    t.includes('पूजा घर') ||
    (t.includes('home') && !t.includes('go home') && !t.includes('home screen'))
  ) {
    return 'game_my_home';
  }

  // Game 5: Sort It Out - Object Categories
  if (
    t === '5' ||
    t === '৫' ||
    t === '५' ||
    t === 'five' ||
    t === 'fifth' ||
    t.includes('game 5') ||
    t.includes('game five') ||
    t.includes('5th') ||
    t.includes('পাঁচ নম্বর') ||
    t.includes('পঞ্চম খেলা') ||
    t.includes('৫ম খেলা') ||
    t.includes('पांचवां खेल') ||
    t.includes('पांच नंबर') ||
    t.includes('sort it out') ||
    t.includes('sort') ||
    t.includes('sorting') ||
    t.includes('category') ||
    t.includes('categorize') ||
    t.includes('basket') ||
    t.includes('baskets') ||
    t.includes('শ্রেণী বিন্যাস') ||
    t.includes('শ্ৰেণী বিভাজন') ||
    t.includes('শ্রেণী') ||
    t.includes('বিন্যাস') ||
    t.includes('বস্তু ছাঁটাই') ||
    t.includes('বস্তু') ||
    t.includes('বস্তু বাচনি') ||
    t.includes('বস্তু বাছাই') ||
    t.includes('ছাঁটাই') ||
    t.includes('ভাগ করা') ||
    t.includes('বস্তু সাজানো') ||
    t.includes('वस्तु छंटाई') ||
    t.includes('वस्तु') ||
    t.includes('छंटाई') ||
    t.includes('अलग करना') ||
    t.includes('टोकरी') ||
    t.includes('सॉर्ट')
  ) {
    return 'game_sort_it_out';
  }

  // Game 6: Who Is This? - Familiar Relationships
  if (
    t === '6' ||
    t === '৬' ||
    t === '६' ||
    t === 'six' ||
    t === 'sixth' ||
    t.includes('game 6') ||
    t.includes('game six') ||
    t.includes('6th') ||
    t.includes('ছয় নম্বর') ||
    t.includes('ছয় নম্বর') ||
    t.includes('ষষ্ঠ খেলা') ||
    t.includes('৬ষ্ঠ খেলা') ||
    t.includes('छठा खेल') ||
    t.includes('छह नंबर') ||
    t.includes('who is this') ||
    t.includes('who') ||
    t.includes('family') ||
    t.includes('relative') ||
    t.includes('relatives') ||
    t.includes('person') ||
    t.includes('people') ||
    t.includes('relation') ||
    t.includes('loved one') ||
    t.includes('grandmother') ||
    t.includes('grandfather') ||
    t.includes('কে এই প্রিয়জন') ||
    t.includes('এইজন কোন আপোনজন') ||
    t.includes('কে এই') ||
    t.includes('এইজন কোন') ||
    t.includes('প্রিয়জন') ||
    t.includes('আপোনজন') ||
    t.includes('পরিবার') ||
    t.includes('আত্মীয়') ||
    t.includes('দাদু') ||
    t.includes('দিদিমা') ||
    t.includes('বাবা') ||
    t.includes('মা') ||
    t.includes('বউমা') ||
    t.includes('দাদা') ||
    t.includes('यह कौन हैं') ||
    t.includes('यह कौन है') ||
    t.includes('कौन है') ||
    t.includes('रिश्ते') ||
    t.includes('परिवार') ||
    t.includes('पहचान') ||
    t.includes('दादी') ||
    t.includes('दादा') ||
    t.includes('नाना') ||
    t.includes('नानी')
  ) {
    return 'game_who_is_this';
  }

  // Navigation: Home
  if (
    t.includes('home') ||
    t.includes('main') ||
    t.includes('বাড়ি') ||
    t.includes('বাড়ি') ||
    t.includes('ঘর') ||
    t.includes('ঘৰ')
  ) {
    return 'home';
  }

  // Navigation: Games (Generic)
  if (
    t.includes('game') ||
    t.includes('games') ||
    t.includes('play') ||
    t.includes('go to') ||
    t.includes('to the') ||
    t.includes('start') ||
    t.includes('open') ||
    t.includes('खेला') ||
    t.includes('খেল') ||
    t.includes('খেলনা') ||
    t.includes('খেলবো') ||
    t.includes('খেলব') ||
    t.includes('খেলিম') ||
    t.includes('খেলিবলৈ') ||
    t.includes('গেম') ||
    t.includes('গেমে') ||
    t.includes('खेल') ||
    t.includes('गेम') ||
    t.includes('गेम्स') ||
    t.includes('चलो खेलें')
  ) {
    return 'games';
  }

  // Navigation: Garden
  if (
    t.includes('garden') ||
    t.includes('flower') ||
    t.includes('বাগান') ||
    t.includes('বাগিচা') ||
    t.includes('फूल') ||
    t.includes('वाटिका')
  ) {
    return 'garden';
  }

  // Navigation: Reminders
  if (
    t.includes('reminder') ||
    t.includes('medicine') ||
    t.includes('water') ||
    t.includes('ওষুধ') ||
    t.includes('ঔষধ') ||
    t.includes('दवा') ||
    t.includes('জল') ||
    t.includes('पानी')
  ) {
    return 'reminders';
  }

  // Navigation: Dashboard
  if (
    t.includes('dashboard') ||
    t.includes('report') ||
    t.includes('score') ||
    t.includes('ড্যাশবোর্ড') ||
    t.includes('ডেশ্ববৰ্ড') ||
    t.includes('স্কোর')
  ) {
    return 'dashboard';
  }

  // Navigation: Breathing
  if (
    t.includes('breath') ||
    t.includes('calm') ||
    t.includes('relax') ||
    t.includes('শ্বাস') ||
    t.includes('উশাহ') ||
    t.includes('प्राणायाम')
  ) {
    return 'breathing';
  }

  // In-Game Actions
  if (t.includes('replay') || t.includes('again') || t.includes('আবার') || t.includes('পুনৰ') || t.includes('फिर से')) {
    return 'replay';
  }
  if (t.includes('next') || t.includes('forward') || t.includes('পরের') || t.includes('পৰৱৰ্তী') || t.includes('आगे')) {
    return 'next';
  }
  if (t.includes('hint') || t.includes('help') || t.includes('সাহায্য') || t.includes('সহায়') || t.includes('मदद')) {
    return 'hint';
  }
  if (t.includes('stop') || t.includes('exit') || t.includes('থামো') || t.includes('বন্ধ') || t.includes('रुकें')) {
    return 'stop';
  }
  if (t.includes('read') || t.includes('speak') || t.includes('বলুন') || t.includes('পড়ুন') || t.includes('बोलो')) {
    return 'read_aloud';
  }

  return 'unknown';
}

export function startVoiceListening({
  language,
  onResult,
  onError,
  onEnd,
  continuous = true,
}: {
  language: Language;
  onResult: (result: VoiceRecognitionResult) => void;
  onError?: (err: any) => void;
  onEnd?: () => void;
  continuous?: boolean;
}): (() => void) {
  if (!isSpeechRecognitionSupported()) {
    if (onError) onError(new Error('Speech recognition not supported in this browser.'));
    return () => {};
  }

  try {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();
    activeRecognition = recognition;

    let isManuallyAborted = false;

    // Language code
    const langCode =
      language === 'as'
        ? 'as-IN'
        : language === 'bn'
        ? 'bn-IN'
        : language === 'hi'
        ? 'hi-IN'
        : 'en-IN';
    recognition.lang = langCode;
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event: any) => {
      // Echo cancellation guard: if synthetic speech is active or ended within cooldown,
      // completely ignore speaker feedback to prevent system from taking input on itself!
      if (isSpeakingOrInCooldown()) {
        return;
      }

      let combined = '';
      for (let i = 0; i < event.results.length; ++i) {
        const item = event.results[i][0];
        if (item && item.transcript) {
          combined += ' ' + item.transcript;
        }
      }
      const transcript = (combined || event.results[event.results.length - 1][0]?.transcript || '').trim();
      if (!transcript) return;

      const lastResult = event.results[event.results.length - 1][0];
      const confidence = lastResult ? (lastResult.confidence || 0.95) : 0.95;
      const intent = parseVoiceCommandIntent(transcript);
      onResult({ transcript, intent, confidence });
    };

    recognition.onerror = (event: any) => {
      // 'no-speech' is a common benign event when user pauses
      if (event.error === 'no-speech') {
        return;
      }
      if (onError) onError(event.error);
    };

    recognition.onend = () => {
      if (!isManuallyAborted && continuous && activeRecognition === recognition) {
        // Try gentle restart if continuous listening desired and not aborted
        try {
          recognition.start();
          return;
        } catch {
          // ignore if cannot restart
        }
      }
      activeRecognition = null;
      if (onEnd) onEnd();
    };

    recognition.start();

    return () => {
      isManuallyAborted = true;
      try {
        recognition.abort();
      } catch {
        // ignore abort error
      }
      activeRecognition = null;
    };
  } catch (err) {
    if (onError) onError(err);
    return () => {};
  }
}

export function stopVoiceListening() {
  if (activeRecognition) {
    try {
      activeRecognition.abort();
    } catch {
      // ignore
    }
    activeRecognition = null;
  }
}
