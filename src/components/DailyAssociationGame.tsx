import React, { useState } from 'react';
import { Language, GameLevelStatus } from '../types';
import {
  ASSOCIATION_LEVELS,
  getGameLevelsStatus,
  updateLevelCompletion,
} from '../data/gamesData';
import { soundFx } from '../utils/audio';
import { saveScoreRecord } from '../utils/scoreStore';
import { speakMessage } from '../utils/speech';
import { Award, Volume2, ChevronRight, CheckCircle2, Heart, Sparkles, RotateCcw, HelpCircle } from 'lucide-react';

interface Props {
  language: Language;
  onCompanionSpeech: (msg: string, mood?: 'happy' | 'cheering' | 'thinking' | 'proud') => void;
  onLevelCompletedOverall?: (level: number, score: number) => void;
}

export const DailyAssociationGame: React.FC<Props> = ({
  language,
  onCompanionSpeech,
  onLevelCompletedOverall,
}) => {
  const [levelsStatus, setLevelsStatus] = useState<GameLevelStatus[]>(() =>
    getGameLevelsStatus('daily-association')
  );
  const [currentLevelNum, setCurrentLevelNum] = useState<number>(1);
  const currentConfig =
    ASSOCIATION_LEVELS.find((l) => l.level === currentLevelNum) || ASSOCIATION_LEVELS[0];

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isLevelWon, setIsLevelWon] = useState<boolean>(false);
  const [mistakes, setMistakes] = useState<number>(0);
  const [earnedStars, setEarnedStars] = useState<number>(3);
  const [score, setScore] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);

  const startLevel = (lvlNum: number) => {
    setCurrentLevelNum(lvlNum);
    setSelectedOptionId(null);
    setIsLevelWon(false);
    setMistakes(0);
    setShowHint(false);

    const greeting =
      language === 'bn'
        ? `ধাপ ${lvlNum}: প্রশ্নটি পড়ে চেনা অনুষঙ্গটি বেছে নিন।`
        : language === 'hi'
        ? `स्तर ${lvlNum}: प्रश्न को ध्यान से पढ़कर सही वस्तु चुनिए।`
        : `Level ${lvlNum}: Read the prompt and find the familiar item.`;
    onCompanionSpeech(greeting, 'happy');
  };

  const handleSelectOption = (optionId: string) => {
    if (isLevelWon) return;
    setSelectedOptionId(optionId);

    if (optionId === currentConfig.correctOptionId) {
      // CORRECT ANSWER!
      soundFx.playCorrectMatch();
      soundFx.playStarDing(0);

      const stars = mistakes === 0 ? 3 : mistakes === 1 ? 2 : 1;
      setEarnedStars(stars);
      setIsLevelWon(true);

      const points = 180 * currentLevelNum * stars;
      setScore((prev) => prev + points);

      // Update level storage
      const updated = updateLevelCompletion('daily-association', currentLevelNum, stars, points);
      setLevelsStatus(updated);

      // Save to global history
      saveScoreRecord({
        gameType: `Daily Association (Lvl ${currentLevelNum})`,
        score: points,
        matches: 1,
        moves: mistakes + 1,
        accuracy: Math.round((1 / (mistakes + 1)) * 100),
        timeSpentSec: 15,
        difficulty: `Level ${currentLevelNum}`,
        language,
      });

      if (onLevelCompletedOverall) {
        onLevelCompletedOverall(currentLevelNum, points);
      }

      const winMessage =
        language === 'bn'
          ? 'চমৎকার উত্তর! আপনার স্মৃতি ও বিচারবোধ প্রশংসনীয়।'
          : language === 'hi'
          ? 'अति सुंदर उत्तर! आपकी याददाश्त और समझ सराहनीय है।'
          : 'Marvelous choice! Your cultural memory is warm and precise.';
      onCompanionSpeech(winMessage, 'cheering');
    } else {
      // MISMATCH
      soundFx.playGentleMismatch();
      setMistakes((prev) => prev + 1);

      const retryMsg =
        language === 'bn'
          ? 'একটু ভাবুন, অন্য সুন্দর বিকল্পটি পরীক্ষা করে দেখুন।'
          : language === 'hi'
          ? 'थोड़ा विचार कीजिए, अन्य विकल्पों को ध्यान से देखिए।'
          : 'Take your time, consider the other options peacefully.';
      onCompanionSpeech(retryMsg, 'thinking');
    }
  };

  const handleNextLevel = () => {
    if (currentLevelNum < 10) {
      startLevel(currentLevelNum + 1);
    } else {
      startLevel(1);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* 10-LEVEL RIBBON */}
      <div className="w-full mb-4 p-3 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-2xs">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold text-[#8c5040] uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#df735a]" />
            <span>
              {language === 'bn' ? '১০টি অনুষঙ্গ স্মরণ ধাপ' : language === 'hi' ? '१० दैनिक साहचर्य स्तर' : '10 Association Levels'}
            </span>
          </span>
          <span className="text-xs font-bold text-[#3d1f30]">
            {language === 'bn' ? `চলতি ধাপ: ${currentLevelNum}` : language === 'hi' ? `वर्तमान स्तर: ${currentLevelNum}` : `Current Level: ${currentLevelNum}/10`}
          </span>
        </div>

        {/* Level Pills 1 to 10 */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
          {levelsStatus.map((lvl) => {
            const isCurrent = lvl.level === currentLevelNum;
            return (
              <button
                type="button"
                key={lvl.level}
                disabled={!lvl.unlocked}
                onClick={() => startLevel(lvl.level)}
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

      {/* QUESTION PROMPT CARD */}
      <div className="w-full p-5 sm:p-6 rounded-3xl bg-white/75 backdrop-blur-xl border border-white/90 shadow-sm mb-5 text-center relative">
        <span className="text-xs font-bold text-[#b9573f] uppercase tracking-wider block mb-1">
          {currentConfig?.title?.[language] || currentConfig?.title?.en || ''}
        </span>

        <h3 className="text-lg sm:text-2xl font-black text-[#3d1f30] font-fun max-w-xl mx-auto mb-3 leading-snug">
          "{currentConfig?.prompt?.[language] || currentConfig?.prompt?.en || ''}"
        </h3>

        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              const p = currentConfig?.prompt?.[language] || currentConfig?.prompt?.en || '';
              if (p) speakMessage(p, language);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#fae6db] hover:bg-[#f5d5c5] text-[#8a3f2c] font-bold text-xs shadow-2xs transition-all active:scale-95"
          >
            <Volume2 className="w-4 h-4" />
            <span>
              {language === 'bn' ? 'প্রশ্নটি শুনুন' : language === 'hi' ? 'प्रश्न सुनें' : 'Read Prompt Aloud'}
            </span>
          </button>

          {/* Gentle Hint Button */}
          <button
            type="button"
            onClick={() => {
              setShowHint(!showHint);
              soundFx.playStarDing(0);
              const hintText = currentConfig.culturalMemory?.[language] || currentConfig.culturalMemory?.en || '';
              if (hintText) {
                onCompanionSpeech(hintText, 'happy');
                speakMessage(hintText, language);
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs border border-amber-300 shadow-2xs transition-all active:scale-95"
          >
            <HelpCircle className="w-4 h-4 text-amber-700" />
            <span>{showHint ? (language === 'bn' ? 'ইঙ্গিত লুকান' : language === 'hi' ? 'संकेत छिपाएं' : 'Hide Hint') : (language === 'bn' ? 'ইঙ্গিত (Hint)' : language === 'hi' ? 'संकेत (Hint)' : 'Gentle Hint')}</span>
          </button>
        </div>

        {showHint && (
          <div className="mt-3.5 p-3.5 rounded-2xl bg-amber-50/95 border border-amber-200 text-xs sm:text-sm text-amber-950 font-medium animate-fade-in text-center max-w-lg mx-auto shadow-2xs">
            💡 <span className="font-bold">{language === 'bn' ? 'স্মৃতি সূত্র: ' : language === 'hi' ? 'स्मृति संकेत: ' : 'Memory Clue: '}</span>
            {currentConfig?.culturalMemory?.[language] || currentConfig?.culturalMemory?.en || ''}
          </div>
        )}
      </div>

      {/* 3 CANDIDATE OPTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full max-w-2xl mb-4">
        {currentConfig.options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          const isCorrect = opt.id === currentConfig.correctOptionId;

          return (
            <button
              type="button"
              key={opt.id}
              onClick={() => handleSelectOption(opt.id)}
              className={`p-4 rounded-3xl flex flex-col items-center justify-center text-center transition-all duration-300 transform select-none shadow-md ${
                isSelected && isCorrect
                  ? 'bg-emerald-100/95 border-3 border-emerald-400 scale-105 shadow-xl'
                  : isSelected && !isCorrect
                  ? 'bg-rose-50 border-2 border-rose-300 opacity-80'
                  : 'bg-white/80 hover:bg-white border-2 border-white/95 hover:border-[#df735a] active:scale-98'
              }`}
            >
              <span className="text-4xl sm:text-5xl mb-2 filter drop-shadow-xs">
                {opt.symbol}
              </span>
              <span className="text-sm sm:text-base font-black text-[#3d1f30] font-fun mb-1">
                {opt?.label?.[language] || opt?.label?.en || ''}
              </span>
              <span className="text-xs text-[#6b473b] font-medium leading-tight">
                {opt?.detail?.[language] || opt?.detail?.en || ''}
              </span>

              {isSelected && isCorrect && (
                <span className="text-xs font-black text-emerald-800 mt-2 bg-emerald-200 px-3 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Correct</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* CULTURAL MEMORY STORY AFTER WIN */}
      {isLevelWon && (
        <div className="w-full max-w-2xl p-4 rounded-3xl bg-emerald-50/90 border border-emerald-300 shadow-xs mb-4 flex items-center justify-between gap-3 animate-fade-in">
          <div className="text-left">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              {language === 'bn' ? 'স্নিগ্ধ স্মৃতি অনুষঙ্গ' : language === 'hi' ? 'सुखद स्मृति प्रसंग' : 'Cultural Nostalgia Reflection'}
            </span>
            <p className="text-xs sm:text-sm text-emerald-950 font-medium leading-relaxed mt-0.5">
              {currentConfig?.culturalMemory?.[language] || currentConfig?.culturalMemory?.en || ''}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const mem = currentConfig?.culturalMemory?.[language] || currentConfig?.culturalMemory?.en || '';
              if (mem) speakMessage(mem, language);
            }}
            className="p-2 rounded-full bg-emerald-200 hover:bg-emerald-300 text-emerald-900 flex-shrink-0 shadow-2xs"
            title="Listen to reflection"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* VICTORY MODAL OVERLAY */}
      {isLevelWon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white/95 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center border-2 border-[#df735a] shadow-2xl relative">
            <div className="w-16 h-16 rounded-full bg-amber-100 mx-auto flex items-center justify-center text-3xl mb-3 shadow-inner">
              ✨
            </div>

            <h3 className="text-2xl font-black text-[#3d1f30] font-fun mb-1">
              {language === 'bn'
                ? `ধাপ ${currentLevelNum} সম্পন্ন!`
                : language === 'hi'
                ? `स्तर ${currentLevelNum} पूर्ण!`
                : `Level ${currentLevelNum} Completed!`}
            </h3>

            {/* Stars */}
            <div className="flex items-center justify-center gap-1.5 my-3 text-amber-400 text-2xl">
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className={i < earnedStars ? 'opacity-100 scale-110' : 'opacity-30'}>
                  ★
                </span>
              ))}
            </div>

            <p className="text-xs sm:text-sm text-[#6c4856] font-medium mb-5">
              {language === 'bn'
                ? 'আপনার স্মৃতিশক্তি ও মনোযোগ অত্যন্ত সতেজ! পরবর্তী ধাপে এগিয়ে চলুন।'
                : language === 'hi'
                ? 'आपकी याददाश्त और ध्यान अत्यंत जागरूक है! अगले स्तर पर चलें।'
                : 'Your recall and visual associations are vibrant and clear! Continue to the next level.'}
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => startLevel(currentLevelNum)}
                className="px-5 py-2.5 rounded-full bg-stone-100 text-stone-700 font-bold text-xs sm:text-sm hover:bg-stone-200"
              >
                {language === 'bn' ? 'আবার খেলুন' : language === 'hi' ? 'पुनः खेलें' : 'Replay'}
              </button>

              <button
                type="button"
                onClick={handleNextLevel}
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
