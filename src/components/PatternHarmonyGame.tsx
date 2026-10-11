import React, { useState, useEffect, useRef } from 'react';
import { Language, GameLevelStatus } from '../types';
import {
  PATTERN_INSTRUMENTS,
  PATTERN_LEVELS,
  getGameLevelsStatus,
  updateLevelCompletion,
} from '../data/gamesData';
import { soundFx } from '../utils/audio';
import { saveScoreRecord } from '../utils/scoreStore';
import { Play, RotateCcw, Volume2, Star, Sparkles, CheckCircle2, ChevronRight, Award, HelpCircle } from 'lucide-react';
import { speakMessage } from '../utils/speech';

interface Props {
  language: Language;
  onCompanionSpeech: (msg: string, mood?: 'happy' | 'cheering' | 'thinking' | 'proud') => void;
  onLevelCompletedOverall?: (level: number, score: number) => void;
}

export const PatternHarmonyGame: React.FC<Props> = ({
  language,
  onCompanionSpeech,
  onLevelCompletedOverall,
}) => {
  const [levelsStatus, setLevelsStatus] = useState<GameLevelStatus[]>(() =>
    getGameLevelsStatus('pattern-harmony')
  );
  const [currentLevelNum, setCurrentLevelNum] = useState<number>(1);
  const currentConfig = PATTERN_LEVELS.find((l) => l.level === currentLevelNum) || PATTERN_LEVELS[0];

  // Sequence state
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerIndex, setPlayerIndex] = useState<number>(0);
  const [isPlayingSequence, setIsPlayingSequence] = useState<boolean>(false);
  const [activeHighlightIdx, setActiveHighlightIdx] = useState<number | null>(null);
  const [isLevelWon, setIsLevelWon] = useState<boolean>(false);
  const [earnedStars, setEarnedStars] = useState<number>(3);
  const [attempts, setAttempts] = useState<number>(0);
  const [score, setScore] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate sequence for current level
  const startLevel = (lvlNum: number) => {
    setCurrentLevelNum(lvlNum);
    const config = PATTERN_LEVELS.find((l) => l.level === lvlNum) || PATTERN_LEVELS[0];
    
    // Generate random notes within length
    const newSeq: number[] = [];
    for (let i = 0; i < config.sequenceLength; i++) {
      newSeq.push(Math.floor(Math.random() * 4));
    }

    setSequence(newSeq);
    setPlayerIndex(0);
    setIsLevelWon(false);
    setAttempts(0);
    setActiveHighlightIdx(null);

    const greeting =
      language === 'bn'
        ? `ধাপ ${lvlNum}: সুরের আলো ও ধ্বনি মনোযোগ দিয়ে শুনুন।`
        : language === 'as'
        ? `স্তৰ ${lvlNum}: সুৰৰ পোহৰ আৰু ধ্বনি মনোযোগেৰে শুনক।`
        : language === 'hi'
        ? `स्तर ${lvlNum}: सुरों की चमक और ध्वनि को ध्यान से सुनिए।`
        : `Level ${lvlNum}: Listen and watch the soothing sequence.`;
    onCompanionSpeech(greeting, 'happy');

    // Automatically play sequence after brief delay
    setTimeout(() => {
      playSequenceToPlayer(newSeq, config.speedMs);
    }, 600);
  };

  useEffect(() => {
    startLevel(1);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Play audio/visual sequence to player
  const playSequenceToPlayer = (seq: number[], speedMs: number) => {
    setIsPlayingSequence(true);
    setPlayerIndex(0);

    seq.forEach((noteIdx, step) => {
      setTimeout(() => {
        setActiveHighlightIdx(noteIdx);
        soundFx.playToneIndex(noteIdx);

        setTimeout(() => {
          setActiveHighlightIdx(null);
          if (step === seq.length - 1) {
            setIsPlayingSequence(false);
            const prompt =
              language === 'bn'
                ? 'এবার আপনার পালা! একই ক্রমে বাদ্যযন্ত্রগুলি স্পর্শ করুন।'
                : language === 'hi'
                ? 'अब आपकी बारी! उसी क्रम में वाद्यों को छूएं।'
                : "Now your turn! Tap the instruments in the same rhythm.";
            onCompanionSpeech(prompt, 'idle');
          }
        }, speedMs * 0.65);
      }, step * speedMs);
    });
  };

  // Replay sequence button
  const handleReplaySequence = () => {
    if (isPlayingSequence) return;
    playSequenceToPlayer(sequence, currentConfig.speedMs);
  };

  // Trigger gentle hint for next note
  const handleTriggerHint = () => {
    if (isPlayingSequence || isLevelWon) return;
    const targetIdx = sequence[playerIndex];
    if (targetIdx === undefined) return;

    soundFx.playStarDing(0);
    setActiveHighlightIdx(targetIdx);
    soundFx.playToneIndex(targetIdx);
    setTimeout(() => {
      setActiveHighlightIdx(null);
    }, 900);

    const inst = PATTERN_INSTRUMENTS[targetIdx];
    const instName = inst.name[language] || inst.name.en;
    const hintMsg =
      language === 'bn'
        ? `ইঙ্গিত: পরবর্তী বাদ্যযন্ত্রটি হলো ${instName}!`
        : language === 'as'
        ? `ইংগিত: পৰৱৰ্তী বাদ্যযন্ত্ৰটো হ'ল ${instName}!`
        : language === 'hi'
        ? `संकेत: अगला वाद्य ${instName} है!`
        : `Hint: Next instrument is ${instName}!`;
    onCompanionSpeech(hintMsg, 'happy');
    speakMessage(hintMsg, language);
  };

  // Handle player pressing an instrument
  const handleInstrumentPress = (instIdx: number) => {
    if (isPlayingSequence || isLevelWon) return;

    soundFx.playToneIndex(instIdx);
    setActiveHighlightIdx(instIdx);
    setTimeout(() => setActiveHighlightIdx(null), 250);

    const expectedIdx = sequence[playerIndex];

    if (instIdx === expectedIdx) {
      // Correct step!
      const nextIndex = playerIndex + 1;
      setPlayerIndex(nextIndex);

      if (nextIndex === sequence.length) {
        // LEVEL COMPLETE!
        handleLevelVictory();
      }
    } else {
      // Mismatch step
      soundFx.playGentleMismatch();
      setAttempts((prev) => prev + 1);
      const cheeringMsg =
        language === 'bn'
          ? 'কোনো চিন্তা নেই! চলুন আবার সুরটি শুনে নিই।'
          : language === 'hi'
          ? 'कोई बात नहीं! चलिए सुरों को पुनः एक बार सुनते हैं।'
          : 'No worries at all! Let us listen together again.';
      onCompanionSpeech(cheeringMsg, 'thinking');

      setTimeout(() => {
        playSequenceToPlayer(sequence, currentConfig.speedMs);
      }, 900);
    }
  };

  // Handle Victory of Level
  const handleLevelVictory = () => {
    setIsLevelWon(true);
    soundFx.playVictoryFanfare();

    const stars = attempts === 0 ? 3 : attempts === 1 ? 2 : 1;
    setEarnedStars(stars);
    const addedScore = 150 * currentLevelNum * stars;
    const newTotal = score + addedScore;
    setScore(newTotal);

    // Update level status in localStorage
    const updated = updateLevelCompletion('pattern-harmony', currentLevelNum, stars, addedScore);
    setLevelsStatus(updated);

    // Save to global score history
    saveScoreRecord({
      gameType: `Pattern Harmony (Lvl ${currentLevelNum})`,
      score: addedScore,
      matches: sequence.length,
      moves: sequence.length + attempts,
      accuracy: Math.round((sequence.length / (sequence.length + attempts)) * 100),
      timeSpentSec: Math.max(10, sequence.length * 4),
      difficulty: `Level ${currentLevelNum}`,
      language,
    });

    if (onLevelCompletedOverall) {
      onLevelCompletedOverall(currentLevelNum, addedScore);
    }

    const winPraise =
      language === 'bn'
        ? `অপূর্ব! আপনি ${currentLevelNum} ধাপ সফলভাবে সম্পন্ন করেছেন!`
        : language === 'hi'
        ? `शानदार! आपने स्तर ${currentLevelNum} कुशलतापूर्वक पूर्ण कर लिया!`
        : `Splendid! You have mastered Level ${currentLevelNum}!`;
    onCompanionSpeech(winPraise, 'proud');
  };

  // Advance to next level
  const handleNextLevel = () => {
    if (currentLevelNum < 10) {
      startLevel(currentLevelNum + 1);
    } else {
      startLevel(1);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* 10-LEVEL PROGRESSION SELECTOR RIBBON */}
      <div className="w-full mb-4 p-3 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-2xs">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold text-[#8c5040] uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#df735a]" />
            <span>
              {language === 'bn' ? '১০টি সুরের ধাপ' : language === 'hi' ? '१० सुरों के स्तर' : '10 Harmony Levels'}
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

      {/* CURRENT LEVEL CARD & INSTRUCTIONS */}
      <div className="w-full p-4 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/85 shadow-sm mb-4 text-center">
        <h3 className="text-lg sm:text-xl font-black text-[#3d1f30] font-fun mb-1">
          {currentConfig?.title?.[language] || currentConfig?.title?.en || ''}
        </h3>
        <p className="text-xs sm:text-sm text-[#6c4856] font-medium max-w-md mx-auto mb-3">
          {currentConfig?.description?.[language] || currentConfig?.description?.en || ''}
        </p>

        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleReplaySequence}
            disabled={isPlayingSequence}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs shadow-2xs border border-amber-300 transition-all active:scale-95 disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>
              {language === 'bn' ? 'আবার সুর শুনুন' : language === 'hi' ? 'पुनः सुर सुनें' : 'Listen Again'}
            </span>
          </button>

          {/* Gentle Hint button */}
          <button
            type="button"
            onClick={handleTriggerHint}
            disabled={isPlayingSequence || isLevelWon}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#fef3c7] hover:bg-[#fde68a] text-[#78350f] font-bold text-xs shadow-2xs border border-[#f59e0b]/40 transition-all active:scale-95 disabled:opacity-50"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {language === 'bn' ? 'ইঙ্গিত (Hint)' : language === 'hi' ? 'संकेत (Hint)' : 'Gentle Hint'}
            </span>
          </button>

          {/* Spoken voice instruction */}
          <button
            type="button"
            onClick={() => {
              const desc = currentConfig?.description?.[language] || currentConfig?.description?.en || '';
              if (desc) speakMessage(desc, language);
            }}
            className="p-2 rounded-full bg-[#fae6db] hover:bg-[#f5d5c5] text-[#8a3f2c] shadow-2xs"
            title="Read instructions aloud"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 INTERACTIVE MUSICAL INSTRUMENTS (Dhol, Bell, Flute, Diya) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-2xl mb-4">
        {PATTERN_INSTRUMENTS.map((inst, idx) => {
          const isHighlighted = activeHighlightIdx === idx;

          return (
            <button
              type="button"
              key={inst.id}
              onClick={() => handleInstrumentPress(idx)}
              disabled={isPlayingSequence || isLevelWon}
              className={`h-36 sm:h-44 rounded-3xl p-4 flex flex-col items-center justify-center relative transition-all duration-300 transform select-none shadow-md ${
                isHighlighted
                  ? 'bg-amber-200/95 border-4 border-amber-400 scale-105 shadow-xl ring-4 ring-amber-300/80 -translate-y-1'
                  : 'bg-white/80 hover:bg-white border-2 border-white/95 hover:border-[#df735a] active:scale-95'
              }`}
            >
              <span className={`text-4xl sm:text-5xl mb-2 transition-transform duration-200 ${isHighlighted ? 'scale-125' : ''}`}>
                {inst.symbol}
              </span>
              <span className="text-xs sm:text-sm font-black text-[#3d1f30] font-fun leading-tight">
                {inst?.name?.[language] || inst?.name?.en || ''}
              </span>
              <span className="text-[10px] text-[#8c5040] font-bold mt-1">
                {idx === 0
                  ? 'C4 Note'
                  : idx === 1
                  ? 'E4 Note'
                  : idx === 2
                  ? 'G4 Note'
                  : 'C5 Note'}
              </span>

              {isHighlighted && (
                <span className="absolute inset-0 rounded-3xl bg-amber-300/20 animate-ping pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>

      {/* SEQUENCE PROGRESS INDICATOR */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-xs font-bold text-[#8c5040]">
          {language === 'bn' ? 'অগ্রগতি:' : language === 'hi' ? 'प्रगति:' : 'Progress:'}
        </span>
        <div className="flex items-center gap-1.5">
          {sequence.map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${
                i < playerIndex
                  ? 'bg-emerald-500 scale-110 shadow-2xs'
                  : 'bg-stone-200 border border-stone-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* VICTORY MODAL OVERLAY */}
      {isLevelWon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white/95 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center border-2 border-[#df735a] shadow-2xl relative">
            <div className="w-16 h-16 rounded-full bg-amber-100 mx-auto flex items-center justify-center text-3xl mb-3 shadow-inner">
              🎶
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
                ? 'আপনার সুরের স্মৃতিশক্তি অত্যন্ত চমৎকার! পরবর্তী ধাপে এগিয়ে চলুন।'
                : language === 'hi'
                ? 'आपकी सुर स्मरण शक्ति अत्यंत सराहनीय है! अगले स्तर पर चलें।'
                : 'Your musical memory is delightful and sharp! Continue to the next level.'}
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
