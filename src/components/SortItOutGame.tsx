import React, { useState, useEffect, useRef } from 'react';
import { Language, GameLevelStatus, SortItem } from '../types';
import {
  SORT_IT_OUT_LEVELS,
  getGameLevelsStatus,
  updateLevelCompletion,
} from '../data/gamesData';
import {
  FolderKanban,
  Volume2,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
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

export const SortItOutGame: React.FC<Props> = ({
  language,
  onCompanionSpeech,
  onLevelCompletedOverall,
}) => {
  const [levelsStatus, setLevelsStatus] = useState<GameLevelStatus[]>(() =>
    getGameLevelsStatus('sort-it-out')
  );
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [placedItems, setPlacedItems] = useState<Record<string, string>>({}); // itemId -> categoryId
  const [mistakes, setMistakes] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [earnedStars, setEarnedStars] = useState(3);
  const [hintText, setHintText] = useState<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const currentConfig =
    SORT_IT_OUT_LEVELS.find((l) => l.level === currentLevel) || SORT_IT_OUT_LEVELS[0];

  const unplacedItems = currentConfig.items.filter((item) => !placedItems[item.id]);

  const loadLevel = (lvlNum: number) => {
    setCurrentLevel(lvlNum);
    setSelectedItemId(null);
    setPlacedItems({});
    setMistakes(0);
    setIsWon(false);
    setHintText(null);
    startTimeRef.current = Date.now();

    const cfg = SORT_IT_OUT_LEVELS.find((l) => l.level === lvlNum) || SORT_IT_OUT_LEVELS[0];
    const catNames = cfg.categories
      .map((c) => c.name[language] || c.name.en)
      .join(', ');
    const msg =
      language === 'bn'
        ? `শ্রেণী বিন্যাস ধাপ ${lvlNum}: উপাদানগুলোকে ${catNames} শ্রেণীতে সাজান।`
        : language === 'hi'
        ? `श्रेणीबद्ध कीजिए स्तर ${lvlNum}: वस्तुओं को ${catNames} में छांटिए।`
        : `Sort It Out Level ${lvlNum}: Group items into ${catNames}.`;
    onCompanionSpeech(msg, 'happy');
  };

  useEffect(() => {
    loadLevel(currentLevel);
  }, [language]);

  // If there are unplaced items and no item is selected, auto-select the first unplaced item
  useEffect(() => {
    if (unplacedItems.length > 0 && !selectedItemId) {
      setSelectedItemId(unplacedItems[0].id);
    }
  }, [unplacedItems, selectedItemId]);

  const handleSelectCategory = (categoryId: string) => {
    if (!selectedItemId) return;

    const item = currentConfig.items.find((i) => i.id === selectedItemId);
    if (!item) return;

    if (item.categoryId === categoryId) {
      // Correct placement
      soundFx.playCorrectMatch();
      soundFx.playStarDing(1);

      const newPlaced = { ...placedItems, [item.id]: categoryId };
      setPlacedItems(newPlaced);

      const categoryObj = currentConfig.categories.find((c) => c.id === categoryId);
      const catName = categoryObj ? (categoryObj.name[language] || categoryObj.name.en) : '';
      const itemName = item.name[language] || item.name.en;

      const cheer =
        language === 'bn'
          ? `চমৎকার! ${itemName}属于 ${catName} শ্রেণীতে!`
          : language === 'hi'
          ? `बहुत खूब! ${itemName} ${catName} श्रेणी में आ गया!`
          : `Great job! ${itemName} belongs in ${catName}!`;
      onCompanionSpeech(cheer, 'happy');

      // Check if all items in this level are now placed
      if (Object.keys(newPlaced).length === currentConfig.items.length) {
        const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
        setEarnedStars(stars);
        const score = 200 + stars * 50;

        const updated = updateLevelCompletion('sort-it-out', currentLevel, stars, score);
        setLevelsStatus(updated);
        onLevelCompletedOverall(currentLevel, score);

        saveScoreRecord({
          gameType: `Sort It Out (Lvl ${currentLevel})`,
          score,
          matches: currentConfig.items.length,
          moves: currentConfig.items.length + mistakes,
          accuracy: Math.round(
            (currentConfig.items.length / (currentConfig.items.length + mistakes)) * 100
          ),
          timeSpentSec: Math.max(10, Math.round((Date.now() - startTimeRef.current) / 1000)),
          difficulty: `Level ${currentLevel}`,
          language,
        });

        setTimeout(() => {
          soundFx.playVictoryFanfare();
          setIsWon(true);
          const winMsg =
            language === 'bn'
              ? `অভিনন্দন! ধাপ ${currentLevel} নিখুঁতভাবে সম্পূর্ণ!`
              : language === 'hi'
              ? `बधाई! स्तर ${currentLevel} बहुत सुंदरता से पूरा हुआ!`
              : `Wonderful! Level ${currentLevel} sorted flawlessly!`;
          onCompanionSpeech(winMsg, 'cheering');
        }, 500);
      } else {
        // Select next unplaced item
        const remaining = currentConfig.items.filter((i) => i.id !== item.id && !newPlaced[i.id]);
        if (remaining.length > 0) {
          setSelectedItemId(remaining[0].id);
        }
      }
    } else {
      // Wrong category
      soundFx.playGentleMismatch();
      setMistakes((m) => m + 1);
      const hintMsg =
        language === 'bn'
          ? 'এই ভাগে মিলছে না, অন্য ঝুড়িটি চেষ্টা করুন।'
          : language === 'hi'
          ? 'इस श्रेणी में नहीं, दूसरा डिब्बा देखिए।'
          : 'Does not belong in this group, try another basket.';
      onCompanionSpeech(hintMsg, 'thinking');
    }
  };

  const currentSelectedItem = currentConfig.items.find((i) => i.id === selectedItemId);

  return (
    <div className="w-full flex flex-col items-center">
      {/* 10-LEVEL PROGRESSION RIBBON */}
      <div className="w-full mb-3 p-3 rounded-2xl bg-white/65 backdrop-blur-xl border border-white/80 shadow-2xs">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold text-[#8c5040] uppercase tracking-wider flex items-center gap-1.5">
            <FolderKanban className="w-4 h-4 text-[#df735a]" />
            <span>
              {language === 'bn'
                ? 'শ্রেণী বিন্যাস: ১০টি ধাপ'
                : language === 'hi'
                ? 'वस्तु छंटाई: १० स्तर'
                : 'Sort It Out: 10 Levels'}
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

      {/* INSTRUCTION CARD */}
      <div className="w-full p-4 rounded-3xl bg-white/75 backdrop-blur-xl border border-white/90 shadow-sm mb-4 text-center">
        <h3 className="text-base sm:text-xl font-black text-[#3d1f30] font-fun">
          {currentConfig.title[language] || currentConfig.title.en}
        </h3>
        <p className="text-xs sm:text-sm text-[#784d40] font-medium mt-1 mb-2.5">
          {currentConfig.description[language] || currentConfig.description.en}
        </p>

        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (unplacedItems.length === 0 || isWon) return;
              const targetItem = currentSelectedItem || unplacedItems[0];
              if (!targetItem) return;

              soundFx.playStarDing(0);
              const targetCat = currentConfig.categories.find((c) => c.id === targetItem.categoryId);
              const itemName = targetItem.name[language] || targetItem.name.en;
              const catName = targetCat ? (targetCat.name[language] || targetCat.name.en) : '';

              const msg =
                language === 'bn'
                  ? `ইঙ্গিত: "${itemName}" উপাদানটি "${catName}" ঝুড়িতে যাবে!`
                  : language === 'as'
                  ? `ইংগিত: "${itemName}" উপাদানটো "${catName}" শ্ৰেণীত যাব!`
                  : language === 'hi'
                  ? `संकेत: "${itemName}" वस्तु "${catName}" डिब्बे में जाएगी!`
                  : `Hint: "${itemName}" belongs in "${catName}"!`;

              setHintText(msg);
              onCompanionSpeech(msg, 'happy');
              speakMessage(msg, language);
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs border border-amber-300 shadow-2xs transition-all active:scale-95"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
            <span>{language === 'bn' ? 'ইঙ্গিত (Hint)' : language === 'hi' ? 'संकेत (Hint)' : 'Gentle Hint'}</span>
          </button>
        </div>

        {hintText && (
          <div className="mt-3 p-3 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs sm:text-sm text-amber-950 font-medium animate-fade-in text-center max-w-md mx-auto shadow-2xs">
            💡 {hintText}
          </div>
        )}
      </div>

      {/* ITEMS POOL TO BE SORTED */}
      <div className="w-full p-4 rounded-3xl bg-gradient-to-r from-amber-50/60 via-orange-50/50 to-rose-50/60 border border-white/90 shadow-2xs mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#8c5040] uppercase tracking-wider">
            {language === 'bn' ? 'সাজানোর জন্য উপাদান' : language === 'hi' ? 'छांटने के लिए वस्तुएं' : 'Items to Sort'} ({unplacedItems.length} {language === 'bn' ? 'বাকি' : language === 'hi' ? 'शेष' : 'remaining'})
          </span>

          {currentSelectedItem && (
            <button
              type="button"
              onClick={() => {
                const text = currentSelectedItem.name[language] || currentSelectedItem.name.en;
                speakMessage(text, language);
              }}
              className="flex items-center gap-1 text-xs font-bold text-[#8a3f2c] bg-[#fae6db] hover:bg-[#f5d5c5] px-2.5 py-1 rounded-full shadow-2xs"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'শুনুন' : language === 'hi' ? 'सुनिए' : 'Listen'}</span>
            </button>
          )}
        </div>

        {unplacedItems.length === 0 ? (
          <div className="py-6 text-center text-emerald-800 font-black text-sm flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>
              {language === 'bn'
                ? 'সবগুলো উপাদান সঠিক ঝুড়িতে রাখা হয়েছে!'
                : language === 'hi'
                ? 'सभी वस्तुएं सही डिब्बे में रख दी गई हैं!'
                : 'All items categorized correctly!'}
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {unplacedItems.map((item) => {
              const isSelected = item.id === selectedItemId;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    setSelectedItemId(item.id);
                    soundFx.playCardFlip();
                  }}
                  className={`px-4 py-3 rounded-2xl flex items-center gap-2.5 transition-all transform active:scale-95 ${
                    isSelected
                      ? 'bg-white border-2 border-[#df735a] shadow-md scale-105 ring-4 ring-[#df735a]/20'
                      : 'bg-white/80 hover:bg-white border border-stone-200 shadow-2xs'
                  }`}
                >
                  <span className="text-3xl">{item.symbol}</span>
                  <span className="text-sm font-bold text-[#3d1f30] font-fun">
                    {item.name[language] || item.name.en}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#df735a] text-white px-1.5 py-0.5 rounded-md ml-1">
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* CATEGORY BASKETS (TARGETS) */}
      <div className={`w-full grid gap-3 sm:gap-4 mb-4 ${currentConfig.categories.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {currentConfig.categories.map((cat) => {
          const itemsInCat = currentConfig.items.filter(
            (i) => placedItems[i.id] === cat.id
          );

          return (
            <div
              key={cat.id}
              onClick={() => handleSelectCategory(cat.id)}
              className="p-4 sm:p-5 rounded-3xl bg-white/85 backdrop-blur-xl border-2 border-stone-200/90 shadow-sm flex flex-col justify-between hover:border-[#df735a] hover:bg-white transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl sm:text-4xl filter drop-shadow-xs">{cat.symbol}</span>
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-[#3d1f30] font-fun">
                      {cat.name[language] || cat.name.en}
                    </h4>
                    <span className="text-xs text-[#8c5040] font-medium">
                      {itemsInCat.length} {language === 'bn' ? 'টি উপাদান' : language === 'hi' ? 'वस्तुएं' : 'items'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectCategory(cat.id);
                  }}
                  className="px-3 py-1.5 rounded-full bg-[#fae6db] group-hover:bg-[#df735a] group-hover:text-white text-[#8a3f2c] font-bold text-xs shadow-2xs transition-all"
                >
                  {language === 'bn' ? 'এখানে রাখুন' : language === 'hi' ? 'यहाँ डालें' : 'Put Here'}
                </button>
              </div>

              {/* Items already placed in this category */}
              <div className="min-h-[64px] p-2 rounded-2xl bg-stone-50/80 border border-stone-200/60 flex flex-wrap gap-1.5 items-center">
                {itemsInCat.length === 0 ? (
                  <span className="text-xs text-stone-400 font-medium italic mx-auto">
                    {language === 'bn'
                      ? 'এখনও কোনো উপাদান রাখা হয়নি'
                      : language === 'hi'
                      ? 'अभी कोई वस्तु नहीं डाली गई'
                      : 'Empty basket - tap above to place'}
                  </span>
                ) : (
                  itemsInCat.map((it) => (
                    <span
                      key={it.id}
                      className="px-2.5 py-1 rounded-xl bg-white border border-emerald-300 text-emerald-950 font-bold text-xs flex items-center gap-1.5 shadow-2xs animate-fade-in"
                    >
                      <span>{it.symbol}</span>
                      <span>{it.name[language] || it.name.en}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </span>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* VICTORY MODAL */}
      {isWon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white/95 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center border-2 border-[#df735a] shadow-2xl relative">
            <div className="w-16 h-16 rounded-full bg-amber-100 mx-auto flex items-center justify-center text-3xl mb-3 shadow-inner">
              🧺
            </div>

            <h3 className="text-2xl font-black text-[#3d1f30] font-fun mb-2">
              {language === 'bn'
                ? `ধাপ ${currentLevel} সুসম্পন্ন!`
                : language === 'hi'
                ? `स्तर ${currentLevel} संपन्न!`
                : `Level ${currentLevel} Completed!`}
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
                ? 'আপনার চিন্তাশক্তি ও শ্রেণী বিভাজন দক্ষতা প্রশংসনীয়!'
                : language === 'hi'
                ? 'आपकी समझ और वस्तुओं की सही पहचान अत्यंत सराहनीय है!'
                : 'Your mental categorization and logic are sharp and clear!'}
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => loadLevel(currentLevel)}
                className="px-5 py-2.5 rounded-full bg-stone-100 text-stone-700 font-bold text-xs sm:text-sm hover:bg-stone-200"
              >
                {language === 'bn' ? 'পুনরায় সাজান' : language === 'hi' ? 'पुनः छांटें' : 'Sort Again'}
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
