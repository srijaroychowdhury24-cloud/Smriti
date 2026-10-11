import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { UI_STRINGS, HERO_CONTENT, PROMPT_CARDS, HOME_CARDS, QUOTES } from '../data/translations';
import { LanguageSelector } from './LanguageSelector';
import {
  playSoothingWelcome,
  stopAllSpeech,
  speakMessage,
  isSpeechRecognitionSupported,
  startVoiceListening,
  stopVoiceListening,
  VoiceCommandIntent,
  isSpeakingOrInCooldown,
} from '../utils/speech';
import { soundFx } from '../utils/audio';
import { CompanionMimi, CompanionMood } from './CompanionMimi';
import { Activity, Play, Sparkles, Quote as QuoteIcon, Mic, Pill } from 'lucide-react';

interface Props {
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  onStartOption2: () => void;
  onStartPatientGame: () => void;
  onStop: () => void;
}

export const SmritiHome: React.FC<Props> = ({
  language,
  onSelectLanguage,
  onStartOption2,
  onStartPatientGame,
  onStop,
}) => {
  const strings = UI_STRINGS[language];
  const hero = HERO_CONTENT[language];
  const cards = PROMPT_CARDS[language];
  const featureCards = HOME_CARDS[language];
  const quotes = QUOTES[language];
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [heardTranscript, setHeardTranscript] = useState<string | null>(null);
  const [mimiMood, setMimiMood] = useState<CompanionMood>('happy');
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const welcomeFiredRef = useRef(false);
  const isNavigatingRef = useRef(false);

  // Helper to start voice recognition session
  const startListeningSession = () => {
    if (!isSpeechRecognitionSupported() || isNavigatingRef.current) return;

    setIsListening(true);
    setVoiceNotice(null);

    startVoiceListening({
      language,
      continuous: true,
      onResult: ({ transcript, intent }) => {
        if (isNavigatingRef.current) return;
        // Strict echo filter: discard if computer audio was speaking
        if (isSpeakingOrInCooldown()) return;

        setHeardTranscript(transcript);

        const lower = transcript.toLowerCase().trim();
        // Check for "go to the games", "go the games", "games", "play", or regional equivalents
        const isGamesCommand =
          intent === 'games' ||
          lower.includes('game') ||
          lower.includes('play') ||
          lower.includes('start') ||
          lower.includes('go to') ||
          lower.includes('go the') ||
          lower.includes('খেলা শুরু') ||
          lower.includes('খেল আৰম্ভ') ||
          lower.includes('খেলিবলৈ') ||
          lower.includes('খেলা') ||
          lower.includes('খেল') ||
          lower.includes('খেলব') ||
          lower.includes('খেলবো') ||
          lower.includes('খেলিম') ||
          lower.includes('গেম') ||
          lower.includes('खेल शुरू') ||
          lower.includes('खेल') ||
          lower.includes('गेम') ||
          lower.includes('चलो खेलें');

        if (isGamesCommand) {
          isNavigatingRef.current = true;
          setMimiMood('cheering');
          setVoiceNotice(
            language === 'bn'
              ? 'খেলার জগতে চলুন! 🎯'
              : language === 'as'
              ? 'খেললৈ যাওঁ ব’লা! 🎯'
              : language === 'hi'
              ? 'खेलों में जा रहे हैं! 🎯'
              : 'Taking you to the games! 🎯'
          );
          soundFx.playCelebration();
          stopVoiceListening();
          setIsListening(false);

          setTimeout(() => {
            onStartPatientGame();
          }, 650);
          return;
        }

        if (intent === 'dashboard' || lower.includes('care') || lower.includes('option 2') || lower.includes('option two')) {
          isNavigatingRef.current = true;
          soundFx.playCardFlip();
          stopVoiceListening();
          setIsListening(false);
          onStartOption2();
          return;
        }

        if (intent === 'stop' || lower.includes('stop') || lower.includes('exit')) {
          stopVoiceListening();
          setIsListening(false);
          onStop();
          return;
        }
      },
      onError: () => {
        setIsListening(false);
      },
      onEnd: () => {
        // If not actively navigating, stay graceful
      },
    });
  };

  // Automatic welcome greeting & voice activation on landing
  useEffect(() => {
    isNavigatingRef.current = false;
    let unmounted = false;

    const triggerWelcomeAndVoice = () => {
      if (welcomeFiredRef.current || unmounted) return;
      welcomeFiredRef.current = true;

      playSoothingWelcome(
        () => {
          // Welcome greeting starts
        },
        () => {
          // Add a calm 1.2s buffer after greeting finishes so microphone only listens to the human user
          if (!unmounted && !isNavigatingRef.current) {
            setTimeout(() => {
              if (!unmounted && !isNavigatingRef.current && !isSpeakingOrInCooldown()) {
                startListeningSession();
              }
            }, 1200);
          }
        },
        language
      );
    };

    // Auto-trigger welcome with slight mounting breath
    const timer = setTimeout(() => {
      triggerWelcomeAndVoice();
    }, 450);

    // One-time user gesture fallback for strict browser autoplay permissions
    const handleFirstGesture = () => {
      triggerWelcomeAndVoice();
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };

    window.addEventListener('pointerdown', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });

    return () => {
      unmounted = true;
      clearTimeout(timer);
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      stopVoiceListening();
      stopAllSpeech();
    };
  }, [language, onStartPatientGame, onStartOption2, onStop]);

  const handleToggleListening = () => {
    if (isListening) {
      stopVoiceListening();
      setIsListening(false);
      setVoiceNotice(null);
    } else {
      if (!isSpeechRecognitionSupported()) {
        alert(
          language === 'bn'
            ? 'আপনার ব্রাউজারে ভয়েস রিকগনিশন সক্রিয় নয়।'
            : language === 'hi'
            ? 'आपके ब्राउज़र में वॉइस कमांड समर्थित नहीं है।'
            : 'Voice recognition is not supported in this browser window.'
        );
        return;
      }
      soundFx.playCardFlip();
      setHeardTranscript(null);
      startListeningSession();
    }
  };

  const handleStartOption2 = () => {
    stopVoiceListening();
    playSoothingWelcome();
    onStartOption2();
  };

  const handleStartPatientGame = () => {
    stopVoiceListening();
    playSoothingWelcome();
    onStartPatientGame();
  };

  const handleStop = () => {
    stopVoiceListening();
    stopAllSpeech();
    onStop();
  };

  return (
    <main className="min-h-screen w-full relative overflow-hidden bg-gradient-to-b from-[#fbf4ee] via-[#f7e9f0] to-[#faeff5] text-[#3d1f30] py-6 px-4 sm:px-6 flex flex-col items-center justify-between font-fun">
      {/* Soft Ambient Pastel Glow Orbs */}
      <div className="absolute -top-32 -left-28 w-[520px] h-[520px] rounded-full bg-[#fed7aa]/35 blur-[110px] pointer-events-none" />
      <div className="absolute top-1/4 -right-32 w-[480px] h-[480px] rounded-full bg-[#fbcfe8]/35 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-28 left-1/5 w-[520px] h-[520px] rounded-full bg-[#dcfce7]/35 blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[420px] h-[420px] rounded-full bg-[#f5d0fe]/30 blur-[110px] pointer-events-none" />

      {/* SCATTERED BLURRED EMOJI ELEMENTS IN THE BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        {/* Top Region */}
        <div className="absolute top-8 left-[7%] text-4xl animate-float-1 opacity-65 filter blur-[1.5px] select-none">🌸</div>
        <div className="absolute top-6 right-[10%] text-4xl animate-float-2 opacity-60 filter blur-[1.2px] select-none">🌸</div>
        <div className="absolute top-20 left-[18%] text-2xl animate-float-3 opacity-55 filter blur-[1.8px] select-none">🌱</div>
        <div className="absolute top-16 right-[22%] text-3xl animate-float-1 opacity-60 filter blur-[1.4px] select-none">🌈</div>
        <div className="absolute top-28 left-[3%] text-3xl animate-float-2 opacity-50 filter blur-[2px] select-none">☁️</div>
        <div className="absolute top-24 right-[4%] text-3xl animate-float-3 opacity-55 filter blur-[1.5px] select-none">✨</div>

        {/* Mid-Left Region */}
        <div className="absolute top-1/3 left-[4%] text-3xl animate-float-2 opacity-60 filter blur-[1.3px] select-none">🐦</div>
        <div className="absolute top-[44%] left-[10%] text-2xl animate-float-1 opacity-50 filter blur-[2px] select-none">🌾</div>
        <div className="absolute top-[56%] left-[6%] text-3xl animate-float-3 opacity-55 filter blur-[1.6px] select-none">🍃</div>
        <div className="absolute top-[68%] left-[12%] text-2xl animate-float-2 opacity-45 filter blur-[1.8px] select-none">🦋</div>

        {/* Mid-Right Region */}
        <div className="absolute top-1/3 right-[5%] text-3xl animate-float-3 opacity-60 filter blur-[1.4px] select-none">🪷</div>
        <div className="absolute top-[45%] right-[11%] text-3xl animate-float-1 opacity-55 filter blur-[1.7px] select-none">🦋</div>
        <div className="absolute top-[58%] right-[4%] text-2xl animate-float-2 opacity-50 filter blur-[2px] select-none">🎈</div>
        <div className="absolute top-[70%] right-[9%] text-3xl animate-float-3 opacity-60 filter blur-[1.5px] select-none">💛</div>

        {/* Bottom Region */}
        <div className="absolute bottom-16 left-[8%] text-4xl animate-float-1 opacity-60 filter blur-[1.4px] select-none">🌿</div>
        <div className="absolute bottom-8 left-[22%] text-3xl animate-float-2 opacity-55 filter blur-[1.6px] select-none">☁️</div>
        <div className="absolute bottom-12 right-[18%] text-3xl animate-float-3 opacity-60 filter blur-[1.3px] select-none">🪔</div>
        <div className="absolute bottom-20 right-[6%] text-4xl animate-float-1 opacity-65 filter blur-[1.5px] select-none">🌸</div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-2xl animate-float-2 opacity-45 filter blur-[2px] select-none">✨</div>
      </div>

      {/* TOP HEADER BADGE */}
      <div className="w-full flex justify-center items-center z-10 pt-1 pb-2">
        <span className="text-xs sm:text-sm font-bold tracking-widest text-[#9c5240] uppercase font-fun bg-white/75 backdrop-blur-md px-5 py-1.5 rounded-full border border-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)]">
          {strings.topBadge}
        </span>
      </div>

      {/* REALISTIC SKEUO-GLASS MAIN CONTAINER */}
      <section
        aria-labelledby="smriti-home-title"
        className="w-full max-w-2xl mx-auto relative rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 bg-gradient-to-b from-white/80 via-white/65 to-white/75 backdrop-blur-2xl border border-white/90 shadow-[0_24px_60px_-15px_rgba(200,80,60,0.16),0_4px_16px_rgba(0,0,0,0.04),inset_0_1.5px_1.5px_rgba(255,255,255,0.98),inset_0_-1px_2px_rgba(215,140,120,0.12)] ring-1 ring-white/60 z-10 my-auto flex flex-col items-center text-center transition-all"
      >
        {/* REALISTIC ENAMEL MOUNTAIN EMBLEM */}
        <div className="mb-2.5 flex items-center justify-center">
          <div
            className="w-20 h-11 rounded-full overflow-hidden border-[2.5px] border-white shadow-[0_4px_16px_rgba(180,90,70,0.22),inset_0_2px_4px_rgba(255,255,255,0.85)] bg-gradient-to-b from-[#bde2f7] via-[#f7d9c4] to-[#a8d5ba] relative flex items-center justify-center ring-2 ring-[#e6c9bc] transition-transform duration-300 hover:scale-105"
            title="Serene Himalayan Hills of Assam & Bengal"
          >
            <svg viewBox="0 0 72 38" className="w-full h-full object-cover">
              <defs>
                <linearGradient id="realSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#9ecbf7" />
                  <stop offset="45%" stopColor="#fed7aa" />
                  <stop offset="85%" stopColor="#fecdd3" />
                  <stop offset="100%" stopColor="#dcfce7" />
                </linearGradient>
                <linearGradient id="sunGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="60%" stopColor="#fef08a" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="mountainGradFar" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.45" />
                </linearGradient>
                <linearGradient id="mountainGradNear" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4d7c0f" />
                  <stop offset="100%" stopColor="#2e5207" />
                </linearGradient>
              </defs>
              {/* Sky */}
              <rect width="72" height="38" fill="url(#realSkyGrad)" />
              {/* Sun */}
              <circle cx="36" cy="13" r="5.5" fill="url(#sunGlow)" filter="drop-shadow(0 0 4px rgba(254,240,138,0.8))" />
              {/* Far snowy peaks */}
              <polygon points="4,38 22,15 36,38" fill="url(#mountainGradFar)" />
              <polygon points="18,18 22,15 25,18 22,20" fill="#ffffff" opacity="0.9" />
              <polygon points="28,38 48,13 68,38" fill="url(#mountainGradFar)" />
              <polygon points="43,18 48,13 52,18 48,20" fill="#ffffff" opacity="0.9" />
              {/* Lush Tea Garden Ridges */}
              <path d="M-4,38 Q16,22 38,26 Q54,24 76,38 Z" fill="#65a30d" opacity="0.95" />
              <path d="M6,38 Q30,27 52,28 Q62,26 76,38 Z" fill="url(#mountainGradNear)" />
              {/* Misty atmospheric fog */}
              <ellipse cx="36" cy="31" rx="30" ry="4" fill="#ffffff" opacity="0.4" filter="blur(1px)" />
              {/* Realistic curved glass lens reflection gloss */}
              <path d="M4,4 Q36,16 68,4 Q36,2 4,4 Z" fill="#ffffff" opacity="0.35" />
            </svg>
          </div>
        </div>

        {/* SMRITI TITLE */}
        <div className="flex flex-col items-center justify-center mb-2">
          <h1
            id="smriti-home-title"
            className="text-5xl sm:text-6xl lg:text-7xl font-fun font-black text-[#df735a] tracking-tight drop-shadow-[0_2px_8px_rgba(223,115,90,0.22)]"
          >
            Smriti
          </h1>
          <span className="text-lg sm:text-xl font-fun font-bold text-[#8a4e40] -mt-1 tracking-wide">
            {language === 'bn' ? 'স্মৃতি' : language === 'hi' ? 'स्मृति' : 'Memory & Mind Care'}
          </span>
        </div>

        {/* HERO TITLE & SUBTITLE */}
        <p className="text-2xl sm:text-3xl font-fun font-bold text-[#3d1f30] leading-snug max-w-xl">
          <span>{hero.line1} </span>
          <span className="text-[#c85942] italic">{hero.line2}</span>
        </p>

        <p className="mt-1 text-center text-xs sm:text-sm text-[#5c3e4c] max-w-lg mx-auto font-fun font-medium leading-relaxed px-2">
          {hero.subtitle}
        </p>

        {/* TRANQUIL QUOTE PILL */}
        {quotes[0] && (
          <div className="w-full max-w-md mx-auto my-2.5 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-center gap-2 text-center">
            <QuoteIcon className="w-3.5 h-3.5 text-[#df735a] flex-shrink-0" />
            <p className="text-xs text-[#5c3848] font-medium italic truncate">
              "{quotes[0].text}" <span className="font-bold not-italic text-[#8c5040]">— {quotes[0].source}</span>
            </p>
          </div>
        )}

        {/* ENGAGING COMPANION MIMI */}
        <div className="w-full max-w-lg mx-auto my-2">
          <CompanionMimi
            language={language}
            mood={mimiMood}
            customMessage={
              language === 'as'
                ? 'নমস্কাৰ! মই মিমি, আপোনাৰ খেলৰ মৰমৰ সংগী। কওক "go to the games" বা তলৰ বুটাম টিপক!'
                : language === 'bn'
                ? 'নমস্কার! আমি মিমি, আপনার খেলার সঙ্গী। বলুন "go to the games" বা নিচের বোতামে চাপুন!'
                : language === 'hi'
                ? 'नमस्ते! मैं मीमी हूँ, आपकी प्यारी साथी। कहिए "go to the games" या नीचे बटन दबाएं!'
                : "Hello! I'm Mimi, your companion. Just say \"Go to the games\" to begin!"
            }
            onVoiceSpeak={() => {
              const text =
                language === 'as'
                  ? 'নমস্কাৰ! মই মিমি, আপোনাৰ খেলৰ সংগী। খেলিবলৈ যাওঁ ব’লা কওক!'
                  : language === 'bn'
                  ? 'নমস্কার! আমি মিমি, আপনার খেলার সঙ্গী। খেলা শুরু করতে "go to the games" বলুন!'
                  : language === 'hi'
                  ? 'नमस्ते! मैं मीमी हूँ, आपकी साथी। खेल शुरू करने के लिए "go to the games" कहिए!'
                  : "Hello! I am Mimi. Say 'go to the games' whenever you are ready!";
              speakMessage(text, language);
            }}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(!isMuted)}
            isListening={isListening}
            onToggleListening={handleToggleListening}
            heardTranscript={heardTranscript}
          />
        </div>

        {/* CUTE REALISTIC MICROPHONE & VOICE STATUS BAR */}
        <div
          className={`w-full max-w-lg mx-auto my-2 px-4 py-2.5 rounded-2xl flex items-center justify-between gap-3 transition-all duration-300 border ${
            isListening
              ? 'bg-gradient-to-r from-rose-50/95 via-amber-50/95 to-rose-50/95 border-rose-200/90 shadow-[0_6px_20px_rgba(244,63,94,0.14),inset_0_1.5px_1.5px_rgba(255,255,255,0.98)]'
              : 'bg-white/75 border-white/90 shadow-[0_3px_10px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.95)]'
          } backdrop-blur-xl`}
        >
          {/* Left: Cute Microphone Button with live wave */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              id="btn-landing-cute-mic"
              onClick={handleToggleListening}
              title={isListening ? "Microphone active - Listening (Say 'Go to the games')" : "Tap cute microphone to speak"}
              className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 border shadow-xs ${
                isListening
                  ? 'bg-gradient-to-b from-rose-400 to-rose-600 text-white border-rose-300 shadow-[0_0_14px_rgba(244,63,94,0.55),inset_0_1px_1px_rgba(255,255,255,0.7)] animate-pulse'
                  : 'bg-gradient-to-b from-white to-[#fef2ec] text-[#df735a] hover:text-[#c4533b] border-[#edd2c5] hover:border-[#df735a] shadow-[0_2px_5px_rgba(0,0,0,0.06),inset_0_1.5px_1.5px_rgba(255,255,255,0.95)]'
              }`}
              aria-label="Toggle microphone"
            >
              {isListening && (
                <span className="absolute -inset-1 rounded-full border border-rose-400/60 animate-ping pointer-events-none" />
              )}
              <Mic className={`w-4 h-4 ${isListening ? 'text-white' : 'text-[#df735a]'}`} />
              <span
                className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white ${
                  isListening ? 'bg-emerald-400 animate-pulse' : 'bg-stone-300'
                }`}
              />
            </button>

            <div className="text-left">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#8f4736] flex items-center gap-1.5">
                <span>{isListening ? 'Voice Assistant Active' : 'Voice Assistant'}</span>
                {isListening && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                )}
              </div>
              <p className="text-xs text-[#3d1f30] font-medium leading-tight">
                {voiceNotice ? (
                  <span className="text-emerald-700 font-bold">{voiceNotice}</span>
                ) : heardTranscript ? (
                  <span className="text-emerald-800 font-semibold">Heard: "{heardTranscript}"</span>
                ) : isListening ? (
                  <span>Say <span className="font-bold text-[#b9442e]">"Go to the games"</span> to begin!</span>
                ) : (
                  <span>Tap microphone or say "Go to the games"</span>
                )}
              </p>
            </div>
          </div>

          {/* Right: Cute Equalizer Acoustic Frequency Bars */}
          {isListening ? (
            <div className="flex items-center gap-1 h-5 px-2.5 py-1 rounded-full bg-rose-100/90 border border-rose-200 shadow-2xs">
              <span className="w-1 h-4 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-2.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-5 bg-rose-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="w-1 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
            </div>
          ) : (
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/80 border border-[#ecd5c9] text-[#783e30] font-bold">
              Ready
            </span>
          )}
        </div>

        {/* 6 GAMES QUICK BADGES - Ceramic tactile finish */}
        <div className="w-full max-w-lg mx-auto my-2.5 p-3 rounded-2xl bg-white/65 backdrop-blur-xl border border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.95)]">
          <span className="text-[11px] font-bold text-[#b9573f] uppercase tracking-wider block text-center mb-2">
            {language === 'as'
              ? '🎯 ৬ খন সহজ আৰু আনন্দদায়ক খেল (প্ৰতিখনতে ১০ টাকৈ স্তৰ)'
              : language === 'bn'
              ? '🎯 ৬টি সহজ ও আনন্দদায়ক খেলা (প্রতিটিতে ১০টি ধাপ)'
              : language === 'hi'
              ? '🎯 ६ सरल व आनंददायक खेल (प्रत्येक में १० स्तर)'
              : '🎯 6 Gentle Cognitive Games (10 Progressive Levels Each)'}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs text-[#3d1f30] font-bold">
            <button
              type="button"
              onClick={handleStartPatientGame}
              className="p-2 rounded-xl bg-gradient-to-b from-white to-[#fffaf7] border border-[#f0ded5] shadow-[0_2px_6px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,1)] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-1.5 text-left group"
            >
              <span className="text-base group-hover:scale-110 transition-transform">🎴</span>
              <span className="truncate">{language === 'as' ? '১. সাংস্কৃতিক খেল' : language === 'bn' ? '১. সাংস্কৃতিক মিল' : language === 'hi' ? '१. सांस्कृतिक मिलान' : '1. Cultural Match'}</span>
            </button>
            <button
              type="button"
              onClick={handleStartPatientGame}
              className="p-2 rounded-xl bg-gradient-to-b from-white to-[#fffaf7] border border-[#f0ded5] shadow-[0_2px_6px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,1)] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-1.5 text-left group"
            >
              <span className="text-base group-hover:scale-110 transition-transform">🎵</span>
              <span className="truncate">{language === 'as' ? '২. সুৰ আৰু ছন্দ' : language === 'bn' ? '২. সুর ও ছন্দ' : language === 'hi' ? '२. सुर व लय' : '2. Sound Harmony'}</span>
            </button>
            <button
              type="button"
              onClick={handleStartPatientGame}
              className="p-2 rounded-xl bg-gradient-to-b from-white to-[#fffaf7] border border-[#f0ded5] shadow-[0_2px_6px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,1)] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-1.5 text-left group"
            >
              <span className="text-base group-hover:scale-110 transition-transform">🤝</span>
              <span className="truncate">{language === 'as' ? '৩. দৈনন্দিন সংগ' : language === 'bn' ? '৩. দৈনন্দিন অনুষঙ্গ' : language === 'hi' ? '३. दैनिक साहचर्य' : '3. Daily Routine'}</span>
            </button>
            <button
              type="button"
              onClick={handleStartPatientGame}
              className="p-2 rounded-xl bg-gradient-to-b from-white to-[#fffaf7] border border-[#f0ded5] shadow-[0_2px_6px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,1)] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-1.5 text-left group"
            >
              <span className="text-base group-hover:scale-110 transition-transform">🏡</span>
              <span className="truncate">{language === 'as' ? '৪. মোৰ ঘৰ' : language === 'bn' ? '৪. আমার ঘর' : language === 'hi' ? '४. मेरा घर' : '4. My Home'}</span>
            </button>
            <button
              type="button"
              onClick={handleStartPatientGame}
              className="p-2 rounded-xl bg-gradient-to-b from-white to-[#fffaf7] border border-[#f0ded5] shadow-[0_2px_6px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,1)] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-1.5 text-left group"
            >
              <span className="text-base group-hover:scale-110 transition-transform">🧺</span>
              <span className="truncate">{language === 'as' ? '৫. শ্ৰেণী বিভাজন' : language === 'bn' ? '৫. শ্রেণী বিন্যাস' : language === 'hi' ? '५. वस्तु छंटाई' : '5. Sort It Out'}</span>
            </button>
            <button
              type="button"
              onClick={handleStartPatientGame}
              className="p-2 rounded-xl bg-gradient-to-b from-white to-[#fffaf7] border border-[#f0ded5] shadow-[0_2px_6px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,1)] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-1.5 text-left group"
            >
              <span className="text-base group-hover:scale-110 transition-transform">❤️</span>
              <span className="truncate">{language === 'as' ? '৬. এখেত কোন চিনি পাওক?' : language === 'bn' ? '৬. কে এই প্রিয়জন?' : language === 'hi' ? '६. यह कौन हैं?' : '6. Who Is This?'}</span>
            </button>
          </div>
        </div>

        {/* REALISTIC TACTILE ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto mb-2 mt-1">
          {/* Caregiver Prescriptions & Progress Dashboard */}
          <button
            type="button"
            id="btn-start-option-2"
            onClick={handleStartOption2}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-b from-[#e8775f] to-[#d15e45] text-white font-fun font-bold text-sm shadow-[0_8px_20px_-4px_rgba(223,115,90,0.45),0_2px_4px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.5)] border-t border-rose-300/40 hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 tracking-wide cursor-pointer"
          >
            <Pill className="w-4 h-4" />
            <span>{strings.option2Title}</span>
          </button>

          {/* Patient Cognitive Games Suite (10 Levels) */}
          <button
            type="button"
            id="btn-start-patient-game"
            onClick={handleStartPatientGame}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-b from-white to-[#fff8f5] text-[#df735a] border-2 border-[#df735a] font-fun font-bold text-sm shadow-[0_4px_14px_rgba(223,115,90,0.15),inset_0_1.5px_1.5px_rgba(255,255,255,1)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-[#df735a]" />
            <span>{strings.tabs.games}</span>
          </button>

          {/* Stop Button */}
          <button
            type="button"
            id="btn-stop"
            onClick={handleStop}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-gradient-to-b from-white/95 to-[#f7ece5] text-[#734857] border border-[#ebd2c5] font-fun font-semibold text-xs sm:text-sm shadow-[0_2px_6px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:bg-white active:translate-y-0.5 transition-all"
          >
            <span>{strings.stopButton}</span>
          </button>
        </div>

        {/* Offline reassurance */}
        <p className="text-xs text-[#8c5040] font-fun font-medium tracking-wide mt-2">
          📶 {strings.offlineBadge}
        </p>
      </section>

      {/* FLOATING LANGUAGE SELECTOR AT THE BOTTOM (English, বাংলা, हिन्दी) */}
      <footer className="w-full flex flex-col items-center justify-center z-20 pt-3 pb-1">
        <span className="text-[11px] font-bold text-[#8c5040] uppercase tracking-wider mb-1.5">
          {strings.changeLanguage}
        </span>
        <LanguageSelector
          currentLanguage={language}
          onSelectLanguage={onSelectLanguage}
        />
      </footer>
    </main>
  );
};
