import React, { useState, useEffect, useRef } from 'react';
import { Language, GameLevelStatus } from '../types';
import {
  MY_HOME_LEVELS,
  getGameLevelsStatus,
  updateLevelCompletion,
} from '../data/gamesData';
import {
  Award,
  RotateCcw,
  Volume2,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Home,
  CheckCircle2,
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

export const MyHomeGame: React.FC<Props> = ({
  language,
  onCompanionSpeech,
  onLevelCompletedOverall,
}) => {
  const [levelsStatus, setLevelsStatus] = useState<GameLevelStatus[]>(() =>
    getGameLevelsStatus('my-home')
  );
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [earnedStars, setEarnedStars] = useState(3);
  const [showHint, setShowHint] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  const currentConfig =
    MY_HOME_LEVELS.find((l) => l.level === currentLevel) || MY_HOME_LEVELS[0];

  const loadLevel = (lvlNum: number) => {
    setCurrentLevel(lvlNum);
    setSelectedRoomId(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setIsWon(false);
    setAttempts(0);
    setShowHint(false);
    startTimeRef.current = Date.now();

    const cfg = MY_HOME_LEVELS.find((l) => l.level === lvlNum) || MY_HOME_LEVELS[0];
    const itemName = cfg.item.name[language] || cfg.item.name.en;
    const msg =
      language === 'bn'
        ? `আমার ঘর ধাপ ${lvlNum}: ${itemName} কোন ঘরে থাকে?`
        : language === 'hi'
        ? `मेरा घर स्तर ${lvlNum}: ${itemName} किस कमरे में रहता है?`
        : `My Home Level ${lvlNum}: Where does the ${itemName} belong?`;
    onCompanionSpeech(msg, 'happy');
  };

  useEffect(() => {
    loadLevel(currentLevel);
  }, [language]);

  const handleRoomSelect = (roomId: string) => {
    if (isAnswered && isCorrect) return;

    setSelectedRoomId(roomId);
    setIsAnswered(true);
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (roomId === currentConfig.correctRoomId) {
      // CORRECT!
      setIsCorrect(true);
      soundFx.playCorrectMatch();
      soundFx.playStarDing(1);

      const stars = nextAttempts === 1 ? 3 : nextAttempts === 2 ? 2 : 1;
      setEarnedStars(stars);
      const points = 150 + stars * 40;

      const praise =
        language === 'bn'
          ? `একদম সঠিক! ${currentConfig.item.name[language] || currentConfig.item.name.en} এখানেই থাকে!`
          : language === 'hi'
          ? `बिल्कुल सही! ${currentConfig.item.name[language] || currentConfig.item.name.en} इसी कमरे में रहता है!`
          : `Spot on! The ${currentConfig.item.name[language] || currentConfig.item.name.en} belongs right here!`;
      onCompanionSpeech(praise, 'cheering');

      const updated = updateLevelCompletion('my-home', currentLevel, stars, points);
      setLevelsStatus(updated);
      onLevelCompletedOverall(currentLevel, points);

      saveScoreRecord({
        gameType: `My Home (Lvl ${currentLevel})`,
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
      // WRONG
      setIsCorrect(false);
      soundFx.playGentleMismatch();
      const encouragement =
        language === 'bn'
          ? 'কোনো ব্যাপার নয়, শান্ত হয়ে অন্য ঘরের ছবিগুলো দেখুন।'
          : language === 'hi'
          ? 'कोई बात नहीं, आराम से दूसरे कमरों को देखिए।'
          : 'No worries at all, take a gentle look at the other rooms.';
      onCompanionSpeech(encouragement, 'thinking');
    }
  };

  const handleReadAloud = () => {
    const itemName = currentConfig?.item?.name?.[language] || currentConfig?.item?.name?.en || '';
    const itemHint = currentConfig?.item?.hint?.[language] || currentConfig?.item?.hint?.en || '';
    const text = itemHint ? `${itemName}. ${itemHint}` : itemName;
    speakMessage(text, language);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* 10-LEVEL PROGRESSION RIBBON */}
      <div className="w-full mb-3 p-3 rounded-2xl bg-white/65 backdrop-blur-xl border border-white/80 shadow-2xs">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold text-[#8c5040] uppercase tracking-wider flex items-center gap-1.5">
            <Home className="w-4 h-4 text-[#df735a]" />
            <span>
              {language === 'bn'
                ? 'আমার ঘর: ১০টি আনন্দময় ধাপ'
                : language === 'hi'
                ? 'मेरा घर: १० आनंदमय स्तर'
                : 'My Home: 10 Peaceful Levels'}
            </span>
          </span>
          <span className="text-xs font-bold text-[#3d1f30]">
            {language === 'bn'
              ? `চলতি ধাপ: ${currentLevel}/১০`
              : language === 'hi'
              ? `वर्तमान स्तर: ${currentLevel}/१०`
              : `Current Level: ${currentLevel}/10`}
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

      {/* QUESTION CARD: THE ITEM */}
      <div className="w-full p-5 sm:p-6 rounded-3xl bg-white/75 backdrop-blur-xl border border-white/90 shadow-sm mb-4 text-center relative">
        <span className="text-xs font-bold text-[#b9573f] uppercase tracking-wider block mb-1">
          {language === 'bn' ? 'এই জিনিসটি চিনে নিন' : language === 'hi' ? 'इस वस्तु को पहचानिए' : 'Identify This Familiar Object'}
        </span>

        {/* Large Item Symbol & Name */}
        <div className="flex flex-col items-center justify-center my-2">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-[#edd7cd] flex items-center justify-center text-5xl sm:text-6xl shadow-inner mb-2 transform hover:scale-105 transition-all">
            {currentConfig.item.symbol}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#3d1f30] font-fun">
            {currentConfig.item.name[language] || currentConfig.item.name.en}
          </h2>
          <p className="text-xs sm:text-sm text-[#784d40] font-medium max-w-md mt-1">
            {currentConfig?.item?.hint?.[language] || currentConfig?.item?.hint?.en || ''}
          </p>
        </div>

        {/* Audio buttons */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <button
            type="button"
            onClick={handleReadAloud}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#fae6db] hover:bg-[#f5d5c5] text-[#8a3f2c] font-bold text-xs shadow-2xs transition-all active:scale-95"
          >
            <Volume2 className="w-4 h-4" />
            <span>{language === 'bn' ? 'শুনে নিন' : language === 'hi' ? 'सुनिए' : 'Hear Clue'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const nextState = !showHint;
              setShowHint(nextState);
              soundFx.playStarDing(0);
              const hintMsg = currentConfig?.item?.hint?.[language] || currentConfig?.item?.hint?.en || '';
              if (nextState && hintMsg) {
                speakMessage(hintMsg, language);
                onCompanionSpeech(hintMsg, 'happy');
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs border border-amber-300 shadow-2xs transition-all active:scale-95"
          >
            <HelpCircle className="w-4 h-4 text-amber-700" />
            <span>{showHint ? (language === 'bn' ? 'ইঙ্গিত লুকান' : language === 'hi' ? 'संकेत छिपाएं' : 'Hide Hint') : (language === 'bn' ? 'ইঙ্গিত (Hint)' : language === 'hi' ? 'संकेत (Hint)' : 'Gentle Hint')}</span>
          </button>
        </div>

        {showHint && (
          <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 font-medium animate-fade-in">
            💡 {currentConfig?.item?.hint?.[language] || currentConfig?.item?.hint?.en || ''}
          </div>
        )}
      </div>

      {/* ROOM CHOICES (3 Big Touch-Friendly Buttons) */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
        {currentConfig.rooms.map((room) => {
          const isSelected = selectedRoomId === room.id;
          const isThisCorrect = room.id === currentConfig.correctRoomId;

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
              key={room.id}
              onClick={() => handleRoomSelect(room.id)}
              className={`p-5 rounded-3xl flex flex-col items-center justify-center text-center transition-all transform active:scale-95 min-h-[140px] ${btnStyles}`}
            >
              <span className="text-4xl mb-2 filter drop-shadow-xs">{room.symbol}</span>
              <span className="text-base sm:text-lg font-black font-fun leading-tight">
                {room.name[language] || room.name.en}
              </span>
              <span className="text-xs text-[#8c5040] mt-1 font-medium">
                {isSelected && isThisCorrect
                  ? '✓ ' + (language === 'bn' ? 'সঠিক স্থান!' : language === 'hi' ? 'सही स्थान!' : 'Correct Room!')
                  : isSelected
                  ? '✗ ' + (language === 'bn' ? 'অন্য ঘর দেখুন' : language === 'hi' ? 'दूसरा कमरा देखें' : 'Try another')
                  : language === 'bn'
                  ? 'এখানে রাখুন'
                  : language === 'hi'
                  ? 'यहाँ रखिए'
                  : 'Place Here'}
              </span>
            </button>
          );
        })}
      </div>

      {/* EXPLANATION & NOSTALGIA CARD */}
      {isAnswered && isCorrect && (
        <div className="w-full p-4 rounded-3xl bg-emerald-50/90 border border-emerald-300/80 shadow-2xs backdrop-blur-md mb-4 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏡</span>
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                {language === 'bn' ? 'গৃহের মিষ্টি স্মৃতি' : language === 'hi' ? 'घर की सुखद स्मृति' : 'Warm Home Association'}
              </span>
              <p className="text-xs sm:text-sm text-emerald-950 font-medium leading-relaxed mt-0.5">
                {currentConfig.explanation[language] || currentConfig.explanation.en}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const exp = currentConfig.explanation[language] || currentConfig.explanation.en;
              if (exp) speakMessage(exp, language);
            }}
            className="p-2 rounded-full bg-emerald-200 hover:bg-emerald-300 text-emerald-900 flex-shrink-0 shadow-2xs"
            title="Listen to explanation"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* LEVEL VICTORY MODAL */}
      {isWon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white/95 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center border-2 border-[#df735a] shadow-2xl relative">
            <div className="w-16 h-16 rounded-full bg-amber-100 mx-auto flex items-center justify-center text-3xl mb-3 shadow-inner">
              🏡
            </div>

            <h3 className="text-2xl font-black text-[#3d1f30] font-fun mb-2">
              {language === 'bn'
                ? `ধাপ ${currentLevel} সম্পন্ন!`
                : language === 'hi'
                ? `स्तर ${currentLevel} पूर्ण!`
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
                ? 'আপনার গৃহস্মৃতি অতি চমৎকার ও সুস্পষ্ট!'
                : language === 'hi'
                ? 'आपकी घर से जुड़ी स्मृतियां अत्यंत सुंदर और स्पष्ट हैं!'
                : 'Your home memory and spatial familiarity are sharp and wonderful!'}
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
