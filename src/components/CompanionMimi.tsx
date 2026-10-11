import React, { useState } from 'react';
import { Language } from '../types';
import { Volume2, VolumeX, Sparkles, Mic, MicOff } from 'lucide-react';
import { soundFx } from '../utils/audio';
import {
  isSpeechRecognitionSupported,
  startVoiceListening,
  stopVoiceListening,
  VoiceCommandIntent,
  speakMessage,
} from '../utils/speech';

export type CompanionMood = 'idle' | 'happy' | 'cheering' | 'thinking' | 'proud';

interface Props {
  language: Language;
  mood?: CompanionMood;
  customMessage?: string;
  onVoiceSpeak?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onVoiceCommand?: (intent: VoiceCommandIntent, transcript: string) => void;
  isListening?: boolean;
  onToggleListening?: () => void;
  heardTranscript?: string | null;
  listeningPrompt?: string;
  hideMicrophone?: boolean;
  onHearGames?: () => void;
}

const DEFAULT_MESSAGES: Record<Language, { greeting: string; praise: string; hint: string }> = {
  en: {
    greeting: "Hello! I'm Mimi, your companion. Take all the time you need, you are doing wonderfully!",
    praise: "Splendid match! Your memory shines bright today!",
    hint: "Notice the gentle colors and shapes. You're doing great!",
  },
  bn: {
    greeting: "নমস্কার! আমি মিমি, আপনার সঙ্গী। কোনো তাড়া নেই, ধীরে সুস্থে খেলুন!",
    praise: "দারুণ মিলিয়েছেন! আপনার স্মৃতি সত্যিই অসাধারণ!",
    hint: "স্নিগ্ধ রং আর চেনা ছবির দিকে তাকান। আপনি চমৎকার করছেন!",
  },
  as: {
    greeting: "নমস্কাৰ! মই মিমি, আপোনাৰ সংগী। কোনো খৰখেদা নাই, লাহে লাহে খেলক!",
    praise: "চমৎকাৰ মিলাইছে! আপোনাৰ স্মৃতিশক্তি সঁচাকৈয়ে অপূৰ্ব!",
    hint: "ৰং আৰু চিনাকি আকৃতিবোৰ ভালদৰে চাওক। আপুনি খুব ধুনীয়াকৈ কৰিছে!",
  },
  hi: {
    greeting: "नमस्ते! मैं मीमी हूँ, आपकी साथी। कोई जल्दी नहीं, आराम से खेलिए!",
    praise: "बहुत खूब! आपकी याददाश्त बहुत शानदार है!",
    hint: "रंगों और आकृतियों को ध्यान से देखिए। आप बहुत अच्छा कर रहे हैं!",
  },
};

export const CompanionMimi: React.FC<Props> = ({
  language,
  mood = 'idle',
  customMessage,
  onVoiceSpeak,
  isMuted,
  onToggleMute,
  onVoiceCommand,
  isListening: externalIsListening,
  onToggleListening: externalToggleListening,
  heardTranscript: externalTranscript,
  listeningPrompt,
  hideMicrophone = false,
  onHearGames,
}) => {
  const currentText = customMessage || DEFAULT_MESSAGES[language].greeting;
  const [internalListening, setInternalListening] = useState(false);
  const [internalTranscript, setInternalTranscript] = useState<string | null>(null);

  const isListening = externalIsListening !== undefined ? externalIsListening : internalListening;
  const heardTranscript = externalTranscript !== undefined ? externalTranscript : internalTranscript;

  const handleToggleListening = () => {
    if (externalToggleListening) {
      externalToggleListening();
      return;
    }

    if (isListening) {
      stopVoiceListening();
      setInternalListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      alert(
        language === 'bn'
          ? 'আপনার ব্রাউজারে ভয়েস রিকগনিশন সক্রিয় নয়।'
          : language === 'hi'
          ? 'आपके ब्राउज़र में वॉइस कमांड समर्थিত नहीं है।'
          : 'Voice recognition is not supported in this browser window.'
      );
      return;
    }

    setInternalListening(true);
    setInternalTranscript(null);
    soundFx.playCardFlip();

    startVoiceListening({
      language,
      onResult: ({ transcript, intent }) => {
        setInternalListening(false);
        setInternalTranscript(`"${transcript}"`);
        setTimeout(() => setInternalTranscript(null), 4000);
        if (onVoiceCommand) {
          onVoiceCommand(intent, transcript);
        }
      },
      onError: () => {
        setInternalListening(false);
      },
      onEnd: () => {
        setInternalListening(false);
      },
    });
  };

  return (
    <aside
      aria-label="Cognitive companion Mimi"
      className="w-full bg-gradient-to-r from-amber-50/90 via-rose-50/90 to-purple-50/90 rounded-3xl p-3.5 sm:p-4 border border-[#ebd8cf] shadow-[0_8px_24px_-6px_rgba(223,115,90,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-xl flex flex-col sm:flex-row items-center gap-3 sm:gap-4 transition-all"
    >
      {/* Mimi Avatar Frame with realistic depth */}
      <div className="relative flex-shrink-0">
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#fed7aa] via-[#fecdd3] to-[#e9d5ff] flex items-center justify-center shadow-[0_4px_14px_rgba(223,115,90,0.22),inset_0_2px_4px_rgba(255,255,255,0.9)] border-2 border-white ring-2 ring-[#ebd5cc] transition-transform duration-300 ${
            isListening ? 'ring-4 ring-rose-400 scale-105 animate-pulse' : mood === 'cheering' ? 'scale-110 animate-bounce' : 'animate-pulse'
          }`}
        >
          {/* Detailed SVG Illustration of Mimi the Himalayan Red Panda */}
          <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-xs">
            <circle cx="50" cy="50" r="45" fill="#fff" opacity="0.3" />
            <polygon points="20,16 38,34 16,38" fill="#e06a3b" />
            <polygon points="23,22 34,34 20,36" fill="#fed7aa" />
            <polygon points="80,16 62,34 84,38" fill="#e06a3b" />
            <polygon points="77,22 66,34 80,36" fill="#fed7aa" />
            <ellipse cx="50" cy="56" rx="36" ry="30" fill="#df6338" />
            <ellipse cx="32" cy="56" rx="14" ry="12" fill="#fffaf5" />
            <ellipse cx="68" cy="56" rx="14" ry="12" fill="#fffaf5" />
            <path d="M42,38 Q50,44 58,38 Z" fill="#fffaf5" />
            <circle cx="28" cy="62" r="5" fill="#f472b6" opacity="0.75" />
            <circle cx="72" cy="62" r="5" fill="#f472b6" opacity="0.75" />

            {/* Eyes */}
            {mood === 'cheering' || mood === 'happy' ? (
              <>
                <path d="M35,52 Q40,46 45,52" fill="none" stroke="#2b1510" strokeWidth="3" strokeLinecap="round" />
                <path d="M55,52 Q60,46 65,52" fill="none" stroke="#2b1510" strokeWidth="3" strokeLinecap="round" />
              </>
            ) : (
              <>
                <circle cx="40" cy="52" r="4" fill="#2b1510" />
                <circle cx="38.5" cy="50.5" r="1.5" fill="#ffffff" />
                <circle cx="60" cy="52" r="4" fill="#2b1510" />
                <circle cx="58.5" cy="50.5" r="1.5" fill="#ffffff" />
              </>
            )}

            <ellipse cx="50" cy="61" rx="4" ry="3" fill="#2b1510" />
            <path d="M45,66 Q50,71 55,66" fill="none" stroke="#2b1510" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="34" cy="28" r="4" fill="#f43f5e" />
            <circle cx="34" cy="28" r="1.5" fill="#fef08a" />
          </svg>
        </div>

        {/* Emotion or Listening icon indicator */}
        <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white text-rose-500 shadow-sm border border-[#f0d8cc] text-[11px] font-bold">
          {isListening ? '🎙️' : mood === 'cheering' ? '🌟' : mood === 'happy' ? '💖' : '🌸'}
        </div>
      </div>

      {/* Dialog Speech Bubble */}
      <div className="flex-1 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1 flex-wrap">
          <span className="font-display font-bold text-sm text-[#4a2218] flex items-center gap-1">
            <span>Mimi</span>
            <span className="text-[11px] font-normal text-[#8c584b]">
              ({language === 'bn' ? 'মিমি • বন্ধু' : language === 'as' ? 'মিমি • সংগী' : language === 'hi' ? 'मीमी • साथी' : 'Care Companion'})
            </span>
          </span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border flex items-center gap-1 transition-all ${
            isListening
              ? 'bg-rose-100 text-rose-800 border-rose-300 shadow-2xs animate-pulse'
              : 'bg-white/70 text-[#9c4d38] border-[#edd7cd]'
          }`}>
            {isListening ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                <span>{listeningPrompt || 'Listening...'}</span>
              </>
            ) : mood === 'cheering' ? (
              '🎉 Cheering'
            ) : (
              '🌿 Companion'
            )}
          </span>
        </div>

        {heardTranscript ? (
          <p className="text-xs sm:text-sm text-emerald-800 font-bold leading-relaxed font-sans animate-fade-in flex items-center justify-center sm:justify-start gap-1">
            <span>Heard:</span>
            <span className="bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">{heardTranscript}</span>
          </p>
        ) : (
          <p className="text-xs sm:text-sm text-[#4b261b] font-medium leading-relaxed font-sans">
            "{currentText}"
          </p>
        )}
      </div>

      {/* Realistic Sound & Audio Controls */}
      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap sm:flex-nowrap justify-center">
        {/* Hear Games List Button (Audible narration of available game types) */}
        {onHearGames && (
          <button
            type="button"
            id="btn-hear-game-options"
            onClick={onHearGames}
            title={
              language === 'bn'
                ? 'উপলব্ধ খেলার নাম শুনুন'
                : language === 'as'
                ? 'উপলব্ধ খেলৰ নাম শুনক'
                : language === 'hi'
                ? 'उपलब्ध खेलों के नाम सुनें'
                : 'Hear types of games available'
            }
            className="h-8 px-2.5 rounded-full bg-gradient-to-b from-[#fed7aa] to-[#fdba74] hover:from-[#fdba74] hover:to-[#fb923c] text-[#7c2d12] border border-[#f97316]/30 text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#9a3412]" />
            <span className="text-[10px] font-bold">
              {language === 'bn'
                ? 'খেলার নাম শুনুন'
                : language === 'as'
                ? 'খেলৰ নাম শুনক'
                : language === 'hi'
                ? 'खेलों के नाम सुनें'
                : 'Hear Games'}
            </span>
          </button>
        )}

        {/* Miniature Microphone Button (only shown if hideMicrophone is false and voice command is enabled) */}
        {!hideMicrophone && (onVoiceCommand || externalToggleListening) && (
          <button
            type="button"
            id="btn-cute-microphone"
            onClick={handleToggleListening}
            title={isListening ? (listeningPrompt || "Listening... Speak to Mimi") : "Tap microphone to speak to Mimi"}
            className={`relative w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 active:scale-90 shadow-xs group ${
              isListening
                ? 'bg-gradient-to-b from-rose-400 to-rose-600 text-white border-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.45),inset_0_1px_1px_rgba(255,255,255,0.6)] animate-pulse'
                : 'bg-gradient-to-b from-white to-[#fef3ee] text-[#b8533c] hover:text-[#9e3a24] border-[#ebd2c5] hover:border-[#df735a] shadow-[0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:shadow-sm'
            }`}
            aria-label="Microphone"
          >
            {isListening ? (
              <>
                <span className="absolute -inset-1 rounded-full border border-rose-400/50 animate-ping pointer-events-none" />
                <Mic className="w-4 h-4 text-white" />
              </>
            ) : (
              <Mic className="w-4 h-4 text-[#df735a] group-hover:scale-110 transition-transform" />
            )}
            {/* Tiny LED dot */}
            <span
              className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${
                isListening ? 'bg-emerald-400 animate-pulse shadow-xs' : 'bg-stone-300'
              }`}
            />
          </button>
        )}

        {/* Sound FX Toggle */}
        <button
          type="button"
          id="btn-toggle-sound-effects"
          onClick={() => {
            onToggleMute();
            if (isMuted) {
              soundFx.setMuted(false);
              soundFx.playCardFlip();
            } else {
              soundFx.setMuted(true);
            }
          }}
          title={isMuted ? "Unmute sound effects" : "Mute sound effects"}
          className={`h-8 px-2.5 rounded-full border transition-all text-xs font-semibold flex items-center gap-1.5 shadow-2xs active:scale-95 ${
            !isMuted
              ? 'bg-[#df735a] text-white border-[#df735a] hover:bg-[#c95d45] shadow-[0_2px_4px_rgba(223,115,90,0.3),inset_0_1px_0_rgba(255,255,255,0.3)]'
              : 'bg-white/85 text-stone-600 border-[#ecd5c9] hover:bg-white'
          }`}
        >
          {!isMuted ? (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline font-bold">Sound ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline font-bold">Muted</span>
            </>
          )}
        </button>

        {/* Read Aloud button (Always active and audible) */}
        <button
          type="button"
          id="btn-companion-speak"
          onClick={() => {
            if (onVoiceSpeak) {
              onVoiceSpeak();
            } else {
              speakMessage(currentText, language);
            }
          }}
          title="Hear Mimi read aloud"
          className="h-8 px-2.5 rounded-full bg-white/90 hover:bg-white text-[#783e30] border border-[#ebd2c5] text-[11px] font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 flex items-center gap-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[10px] hidden sm:inline">Read Aloud</span>
        </button>
      </div>
    </aside>
  );
};

