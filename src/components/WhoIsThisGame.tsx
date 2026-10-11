import React, { useState, useEffect, useRef } from 'react';
import { Language, GameLevelStatus } from '../types';
import {
  WHO_IS_THIS_LEVELS,
  getGameLevelsStatus,
  updateLevelCompletion,
} from '../data/gamesData';
import {
  Users,
  Volume2,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Heart,
  HelpCircle,
} from 'lucide-react';
import { speakMessage } from '../utils/speech';
import { soundFx } from '../utils/audio';
import { saveScoreRecord } from '../utils/scoreStore';
import { CompanionMood } from './CompanionMimi';

interface Props {
  language: Language;
  onCompanionSpeech: (msg: string, mood?: CompanionMood) => void;
  onLevelCompletedOverall: (level: number, scoreAdded: number) => void;
}

export const WhoIsThisGame: React.FC<Props> = ({
  language,
  onCompanionSpeech,
  onLevelCompletedOverall,
}) => {
  const [levelsStatus, setLevelsStatus] = useState<GameLevelStatus[]>(() =>
    getGameLevelsStatus('who-is-this')
  );
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [earnedStars, setEarnedStars] = useState(3);
  const [showHint, setShowHint] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  const currentConfig =
    WHO_IS_THIS_LEVELS.find((l) => l.level === currentLevel) || WHO_IS_THIS_LEVELS[0];

  const loadLevel = (lvlNum: number) => {
    setCurrentLevel(lvlNum);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setIsWon(false);
    setAttempts(0);
    setShowHint(false);
    startTimeRef.current = Date.now();

    const cfg = WHO_IS_THIS_LEVELS.find((l) => l.level === lvlNum) || WHO_IS_THIS_LEVELS[0];
    const relation = cfg.relationTitle[language] || cfg.relationTitle.en;
    const msg =
      language === 'bn'
        ? `কে এই প্রিয় মানুষটি? ধাপ ${lvlNum}: সূত্রটি পড়ুন ও চিনুন।`
        : language === 'hi'
        ? `यह कौन हैं? स्तर ${lvlNum}: संकेत पढ़कर पहचानिए।`
        : `Who Is This? Level ${lvlNum}: Read the warm clue to match the relationship.`;
    onCompanionSpeech(msg, 'happy');
  };

  useEffect(() => {
    loadLevel(currentLevel);
  }, [language]);

  const handleSelectOption = (optionId: string) => {
    if (isAnswered && isCorrect) return;

    setSelectedOptionId(optionId);
    setIsAnswered(true);
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (optionId === currentConfig.roleId) {
      // Correct!
      setIsCorrect(true);
      soundFx.playCorrectMatch();
      soundFx.playStarDing(1);

      const stars = nextAttempts === 1 ? 3 : nextAttempts === 2 ? 2 : 1;
      setEarnedStars(stars);
      const points = 160 + stars * 40;

      const personName = currentConfig.name[language] || currentConfig.name.en;
      const praise =
        language === 'bn'
          ? `হ্যাঁ, ইনি আমাদের পরম স্নেহের ${personName}!`
          : language === 'hi'
          ? `हाँ, यह हमारे अत्यंत प्रिय ${personName} हैं!`
          : `Yes, this is our beloved ${personName}!`;
      onCompanionSpeech(praise, 'cheering');

      const updated = updateLevelCompletion('who-is-this', currentLevel, stars, points);
      setLevelsStatus(updated);
      onLevelCompletedOverall(currentLevel, points);

      saveScoreRecord({
        gameType: `Who Is This (Lvl ${currentLevel})`,
        score: points,
        matches: 1,
        moves: nextAttempts,
        accuracy: Math.round((1 / nextAttempts) * 100),
        timeSpentSec: Math.max(8, Math.round((Date.now() - startTimeRef.current) / 1000)),
        difficulty: `Level ${currentLevel}`,
        language,
      });

      setTimeout(() => {
        soundFx.playVictoryFanfare();
        setIsWon(true);
      }, 700);
    } else {
      // Wrong
      setIsCorrect(false);
      soundFx.playGentleMismatch();
      const retryMsg =
        language === 'bn'
          ? 'শান্তভাবে স্মৃতি রোমন্থন করুন, অন্য সম্পর্কটি দেখুন।'
          : language === 'hi'
          ? 'कोई बात नहीं, प्यार से दूसरा विकल्प चुनिए।'
          : 'Gently reflect on the clue and try another relationship.';
      onCompanionSpeech(retryMsg, 'thinking');
    }
  };

  const handleReadAloud = () => {
    const text = `${currentConfig.clue[language] || currentConfig.clue.en}`;
    speakMessage(text, language);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* 10-LEVEL PROGRESSION RIBBON */}
      <div className="w-full mb-3 p-3 rounded-2xl bg-white/65 backdrop-blur-xl border border-white/80 shadow-2xs">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold text-[#8c5040] uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#df735a]" />
            <span>
              {language === 'bn'
                ? 'কে এই প্রিয়জন? ১০টি মধুর ধাপ'
                : language === 'hi'
                ? 'यह कौन हैं? १० आत्मीय स्तर'
                : 'Who Is This? 10 Familiar Levels'}
            </span>
          </span>
          <span className="text-xs font-bold text-[#3d1f30]">
            {language === 'bn'
              ? `ধাপ: ${currentLevel}/১০`
              : language === 'hi'
              ? `स्तर: ${currentLevel}/১০`
              : `Level: ${currentLevel}/10`}
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
          {levelsStatus.map((lvl) => {
            const isCurrent = lvl.level === currentLevel;
            return (
              <button
                type="button"
                key={lvl.level}
                disabled={!lvl.unlocked}
                onClick={() => loadLevel(lvl.level)}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-[#df735a] text-white shadow-xs scale-105 font-black ring-2 ring-amber-300'
                    : lvl.unlocked
                    ? 'bg-white/85 hover:bg-white text-[#5c3848] border border-white/90 shadow-2xs'
                    : 'bg-stone-100/60 text-stone-400 opacity-60 cursor-not-allowed'
                }`}
              >
                <span className="text-xs font-bold">{lvl.level}</span>
                <div className="flex items-center text-[9px] mt-0.5">
                  {lvl.stars > 0 ? (
                    <span className="text-amber-400">★{lvl.stars}</span>
                  ) : lvl.unlocked ? (
                    <span className="text-stone-300">•</span>
                  ) : (
                    <span>🔒</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CLUE & PERSON CARD */}
      <div className="w-full p-5 sm:p-6 rounded-3xl bg-white/75 backdrop-blur-xl border border-white/90 shadow-sm mb-4 text-center relative">
        <span className="text-xs font-bold text-[#b9573f] uppercase tracking-wider block mb-1">
          {language === 'bn' ? 'মধুর স্মৃতি ও পরিচিত মুখ' : language === 'hi' ? 'पहचानी सूरत व स्नेह' : 'Familiar Face & Warm Role'}
        </span>

        {/* Large Portrait/Emoji */}
        <div className="flex flex-col items-center justify-center my-2">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-rose-100 via-amber-50 to-orange-100 border-4 border-white flex items-center justify-center text-5xl sm:text-6xl shadow-md mb-2">
            {currentConfig.avatarSymbol}
          </div>

          <h3 className="text-base sm:text-xl font-bold text-[#3d1f30] max-w-xl mx-auto leading-relaxed mt-1 font-serif italic">
            "{currentConfig.clue[language] || currentConfig.clue.en}"
          </h3>
        </div>

        {/* Listen Button */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <button
            type="button"
            onClick={handleReadAloud}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#fae6db] hover:bg-[#f5d5c5] text-[#8a3f2c] font-bold text-xs shadow-2xs transition-all active:scale-95"
          >
            <Volume2 className="w-4 h-4" />
            <span>{language === 'bn' ? 'কথাটি শুনুন' : language === 'hi' ? 'संकेत सुनिए' : 'Listen to Clue'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const nextState = !showHint;
              setShowHint(nextState);
              soundFx.playStarDing(0);
              const note = currentConfig.warmNote[language] || currentConfig.warmNote.en;
              if (nextState && note) {
                speakMessage(note, language);
                onCompanionSpeech(note, 'happy');
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs border border-amber-300 shadow-2xs transition-all active:scale-95"
          >
            <HelpCircle className="w-4 h-4 text-amber-700" />
            <span>{showHint ? (language === 'bn' ? 'ইঙ্গিত লুকান' : language === 'hi' ? 'संकेत छिपाएं' : 'Hide Hint') : (language === 'bn' ? 'ইঙ্গিত (Hint)' : language === 'hi' ? 'संকেत (Hint)' : 'Gentle Hint')}</span>
          </button>
        </div>

        {showHint && (
          <div className="mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 font-medium animate-fade-in">
            💖 {currentConfig.warmNote[language] || currentConfig.warmNote.en}
          </div>
        )}
      </div>

      {/* RELATIONSHIP CHOICES */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
        {currentConfig.options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          const isThisCorrect = opt.id === currentConfig.roleId;

          let btnStyles =
            'bg-white/80 hover:bg-white border-2 border-stone-200/90 text-stone-800 shadow-sm';
          if (isSelected) {
            if (isThisCorrect) {
              btnStyles = 'bg-emerald-50 border-2 border-emerald-400 text-emerald-950 ring-4 ring-emerald-200/70 scale-102';
            } else {
              btnStyles = 'bg-rose-50 border-2 border-rose-300 text-rose-950';
            }
          } else if (isAnswered && isThisCorrect) {
            btnStyles = 'bg-emerald-50/70 border-2 border-emerald-300 text-emerald-900';
          }

          return (
            <button
              type="button"
              key={opt.id}
              onClick={() => handleSelectOption(opt.id)}
              className={`p-5 rounded-3xl flex flex-col items-center justify-center text-center transition-all transform active:scale-95 min-h-[130px] ${btnStyles}`}
            >
              <span className="text-4xl mb-2 filter drop-shadow-xs">{opt.symbol}</span>
              <span className="text-base sm:text-lg font-black font-fun leading-tight">
                {opt.label[language] || opt.label.en}
              </span>
              <span className="text-xs text-[#8c5040] mt-1 font-medium">
                {isSelected && isThisCorrect
                  ? '✓ ' + (language === 'bn' ? 'সঠিক উত্তর!' : language === 'hi' ? 'सही पहचान!' : 'Matched!')
                  : isSelected
                  ? '✗ ' + (language === 'bn' ? 'আবার ভাবুন' : language === 'hi' ? 'पुनः सोचें' : 'Think again')
                  : language === 'bn'
                  ? 'ইনি হতে পারেন'
                  : language === 'hi'
                  ? 'यह हो सकते हैं'
                  : 'Select'}
              </span>
            </button>
          );
        })}
      </div>

      {/* WARM NOSTALGIC REFLECTION */}
      {isAnswered && isCorrect && (
        <div className="w-full p-4 rounded-3xl bg-rose-50/90 border border-rose-300/80 shadow-2xs backdrop-blur-md mb-4 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💖</span>
            <div>
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
                {language === 'bn' ? 'হৃদয়ের বন্ধন' : language === 'hi' ? 'आत्मीय रिश्ता' : 'Warm Heart Bond'}
              </span>
              <p className="text-xs sm:text-sm text-rose-950 font-medium leading-relaxed mt-0.5">
                {currentConfig.warmNote[language] || currentConfig.warmNote.en}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const note = currentConfig.warmNote[language] || currentConfig.warmNote.en;
              if (note) speakMessage(note, language);
            }}
            className="p-2 rounded-full bg-rose-200 hover:bg-rose-300 text-rose-900 flex-shrink-0 shadow-2xs"
            title="Listen to warm note"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* LEVEL VICTORY MODAL */}
      {isWon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white/95 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center border-2 border-[#df735a] shadow-2xl relative">
            <div className="w-16 h-16 rounded-full bg-rose-100 mx-auto flex items-center justify-center text-3xl mb-3 shadow-inner">
              ❤️
            </div>

            <h3 className="text-2xl font-black text-[#3d1f30] font-fun mb-2">
              {language === 'bn'
                ? `ধাপ ${currentLevel} সম্পূর্ণ!`
                : language === 'hi'
                ? `स्तर ${currentLevel} पूरा हुआ!`
                : `Level ${currentLevel} Complete!`}
            </h3>

            {/* Stars */}
            <div className="flex items-center justify-center gap-1.5 my-3 text-amber-400 text-2xl">
              {Array.from({ length: 3 }).map((_, i) => (
                <span
                  key={i}
                  className={i < earnedStars ? 'opacity-100 scale-110' : 'opacity-30'}
                >
                  ★
                </span>
              ))}
            </div>

            <p className="text-sm text-[#6c4856] font-medium mb-4">
              {language === 'bn'
                ? 'আত্মীয়তা ও সম্পর্কের বন্ধন আপনার হৃদয়ে সতেজ ও অমলিন!'
                : language === 'hi'
                ? 'रिश्तों की मिठास और पहचान आपके मन में हमेशा तरोताजा है!'
                : 'Your family bonds and cherished memories are crystal clear and warm!'}
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => loadLevel(currentLevel)}
                className="px-5 py-2.5 rounded-full bg-stone-100 text-stone-700 font-bold text-xs sm:text-sm hover:bg-stone-200"
              >
                {language === 'bn' ? 'পুনরায় খেলুন' : language === 'hi' ? 'पुनः खेलें' : 'Replay'}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (currentLevel < 10) {
                    loadLevel(currentLevel + 1);
                  } else {
                    loadLevel(1);
                  }
                }}
                className="px-6 py-2.5 rounded-full bg-[#df735a] text-white font-bold text-xs sm:text-sm hover:bg-[#c95d45] shadow-md flex items-center gap-1.5"
              >
                <span>{language === 'bn' ? 'পরবর্তী ধাপ' : language === 'hi' ? 'अगला स्तर' : 'Next Level'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
