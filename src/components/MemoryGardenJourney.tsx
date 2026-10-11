import React, { useState, useEffect } from 'react';
import { Language, GardenFlower } from '../types';
import {
  getGardenFlowers,
  unlockNextGardenFlower,
} from '../utils/gardenStore';
import {
  Sparkles,
  Volume2,
  Flower2,
  Heart,
  ArrowRight,
  RotateCcw,
  Sun,
  Droplets,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { speakMessage } from '../utils/speech';
import { soundFx } from '../utils/audio';

interface Props {
  language: Language;
  onReturnToGames: () => void;
  onReturnHome: () => void;
  onBreatheAgain: () => void;
}

export const MemoryGardenJourney: React.FC<Props> = ({
  language,
  onReturnToGames,
  onReturnHome,
  onBreatheAgain,
}) => {
  const [flowers, setFlowers] = useState<GardenFlower[]>(() => getGardenFlowers());
  const [latestBloom, setLatestBloom] = useState<GardenFlower | null>(null);
  const [selectedFlower, setSelectedFlower] = useState<GardenFlower | null>(null);

  useEffect(() => {
    // Automatically bloom today's flower upon arriving from calm breathing
    const { bloomedFlower } = unlockNextGardenFlower();
    const updated = getGardenFlowers();
    setFlowers(updated);
    setLatestBloom(bloomedFlower);
    setSelectedFlower(bloomedFlower);

    soundFx.playVictoryFanfare();
    setTimeout(() => {
      soundFx.playBell();
    }, 900);
  }, []);

  const activeFlower = selectedFlower || latestBloom || flowers[0];

  const handleSpeakFlower = (flower: GardenFlower) => {
    const name = flower.flowerName[language] || flower.flowerName.en;
    const meaning = flower.meaning[language] || flower.meaning.en;
    const text = `${name}. ${meaning}`;
    speakMessage(text, language);
  };

  const bloomedCount = flowers.filter((f) => f.bloomed).length;

  return (
    <div className="w-full max-w-4xl mx-auto z-10 animate-fade-in flex flex-col items-center">
      {/* TOP HEADER */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2 shadow-2xs">
          <Flower2 className="w-4 h-4 text-emerald-600" />
          <span>
            {language === 'bn'
              ? 'স্মৃতি বাগান যাত্রা'
              : language === 'hi'
              ? 'स्मृति उद्यान यात्रा'
              : 'Memory Garden Journey'}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#2e1d27] font-fun">
          {language === 'bn'
            ? 'আপনার মনের শান্ত সুরভিত বাগান'
            : language === 'hi'
            ? 'आपके अंतर्मन का शांत सुरभित उद्यान'
            : 'Your Serene Mindful Botanical Garden'}
        </h2>

        <p className="text-xs sm:text-sm text-[#5c3e4c] font-medium max-w-lg mx-auto mt-1">
          {language === 'bn'
            ? 'প্রতিদিনের শ্বাসক্রিয়া ও শান্ত ধ্যানের স্পর্শে এই বাগানে একটি করে ফুল প্রস্ফুটিত হয়।'
            : language === 'hi'
            ? 'प्रतिदिन के शांत प्राणायाम और स्मृति साधना से इस बगिया में एक नया पुष्प खिलता है।'
            : 'Every mindful breathing session and daily activity blooms a fresh, fragrant blossom in your personal garden.'}
        </p>
      </div>

      {/* TODAY'S BLOOM HERO SHOWCASE */}
      {activeFlower && (
        <div className="w-full rounded-3xl sm:rounded-[36px] p-6 sm:p-8 bg-gradient-to-b from-white/90 via-emerald-50/60 to-white/90 backdrop-blur-2xl border-2 border-emerald-200/90 shadow-[0_20px_50px_rgba(16,185,129,0.12)] mb-6 text-center relative overflow-hidden">
          {/* Decorative subtle background sparkles */}
          <div className="absolute top-4 right-6 text-2xl opacity-40 animate-float-1">✨</div>
          <div className="absolute bottom-4 left-6 text-2xl opacity-40 animate-float-2">🌿</div>

          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest block mb-2">
            {activeFlower.bloomed
              ? language === 'bn'
                ? '🌸 আজকের প্রস্ফুটিত স্মৃতি ফুল'
                : language === 'hi'
                ? '🌸 आज का खिला हुआ स्मृति पुष्प'
                : '🌸 Today\'s Bloomed Memory Blossom'
              : language === 'bn'
              ? '🌱 আগামী দিনের স্মৃতি কুঁড়ি'
              : language === 'hi'
              ? '🌱 आने वाले कल की स्मृति कली'
              : '🌱 Awaiting Mindful Breath'}
          </span>

          {/* Glowing Botanical Bloom Orb */}
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto my-3 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full blur-xl opacity-60 animate-pulse"
              style={{ backgroundColor: activeFlower.color || '#fbcfe8' }}
            />
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white border-4 border-emerald-100 flex items-center justify-center text-6xl sm:text-7xl shadow-lg transform hover:scale-105 transition-transform">
              {activeFlower.bloomed ? activeFlower.symbol : '🌱'}
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-[#223326] font-fun mt-2">
            {activeFlower.flowerName[language] || activeFlower.flowerName.en}
          </h3>

          <p className="text-sm sm:text-base text-emerald-950 font-medium max-w-md mx-auto mt-1 leading-relaxed">
            "{activeFlower.meaning[language] || activeFlower.meaning.en}"
          </p>

          {activeFlower.unlockedAt && (
            <div className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold bg-emerald-100/70 px-3 py-1 rounded-full mt-3">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {language === 'bn' ? 'অর্জন: ' : language === 'hi' ? 'खिला: ' : 'Bloomed: '}
                {activeFlower.unlockedAt}
              </span>
            </div>
          )}

          {/* Voice button */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => handleSpeakFlower(activeFlower)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <Volume2 className="w-4 h-4" />
              <span>
                {language === 'bn'
                  ? 'ফুলের তাৎপর্য শুনুন'
                  : language === 'hi'
                  ? 'पुष्प की मधुर गाथा सुनिए'
                  : 'Hear Flower Reflection'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => soundFx.playBell()}
              className="p-2.5 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-900 shadow-2xs transition-all"
              title="Serenity chime"
            >
              <Sun className="w-4 h-4 text-amber-600" />
            </button>
          </div>
        </div>
      )}

      {/* 10-DAY MEMORY GARDEN TRAIL (Gallery of all blooms) */}
      <div className="w-full p-5 sm:p-6 rounded-3xl bg-white/75 backdrop-blur-xl border border-white/90 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪴</span>
            <div>
              <h4 className="text-base sm:text-lg font-black text-[#3d1f30] font-fun">
                {language === 'bn'
                  ? 'আপনার ১০ দিনের স্মৃতিকানন'
                  : language === 'hi'
                  ? 'आपका १० दिवसीय स्मृति उपवन'
                  : 'Your 10-Day Garden Trail'}
              </h4>
              <span className="text-xs text-[#8c5040] font-medium">
                {bloomedCount}/10 {language === 'bn' ? 'ফুল প্রস্ফুটিত' : language === 'hi' ? 'पुष्प खिले' : 'Blossoms Bloomed'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {Math.round((bloomedCount / flowers.length) * 100)}% {language === 'bn' ? 'উন্নত' : language === 'hi' ? 'उन्नत' : 'Flourishing'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {flowers.map((fl) => {
            const isSelected = selectedFlower?.day === fl.day;
            return (
              <button
                type="button"
                key={fl.day}
                onClick={() => {
                  setSelectedFlower(fl);
                  soundFx.playCardFlip();
                }}
                className={`p-3.5 rounded-2xl flex flex-col items-center justify-center text-center transition-all transform active:scale-95 ${
                  isSelected
                    ? 'bg-emerald-50 border-2 border-emerald-500 shadow-md ring-2 ring-emerald-300 scale-102'
                    : fl.bloomed
                    ? 'bg-white/90 hover:bg-white border border-emerald-200/80 shadow-2xs'
                    : 'bg-stone-50/70 border border-stone-200 opacity-60'
                }`}
              >
                <div className="text-3xl mb-1.5 filter drop-shadow-xs">
                  {fl.bloomed ? fl.symbol : '🌱'}
                </div>

                <span className="text-xs font-bold text-[#3d1f30] font-fun line-clamp-1">
                  {fl.flowerName[language] || fl.flowerName.en}
                </span>

                <span className="text-[10px] font-bold text-emerald-700 mt-0.5">
                  {fl.bloomed
                    ? language === 'bn'
                      ? `দিন ${fl.day} সম্পন্ন`
                      : language === 'hi'
                      ? `दिन ${fl.day} पूर्ण`
                      : `Day ${fl.day} Bloomed`
                    : language === 'bn'
                    ? `দিন ${fl.day}`
                    : language === 'hi'
                    ? `दिन ${fl.day}`
                    : `Day ${fl.day}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BOTTOM NAVIGATION ACTIONS */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onReturnToGames}
          className="px-6 py-3 rounded-full bg-[#df735a] hover:bg-[#c95d45] text-white font-fun font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
        >
          <span>
            {language === 'bn'
              ? 'স্মৃতি খেলায় ফিরে যান'
              : language === 'hi'
              ? 'स्मृति खेलों में जाएं'
              : 'Return to Cognitive Games'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onBreatheAgain}
          className="px-5 py-3 rounded-full bg-white/90 hover:bg-white text-emerald-800 border-2 border-emerald-400 font-fun font-bold text-sm shadow-xs transition-all active:scale-95 flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>
            {language === 'bn'
              ? 'পুনরায় প্রাণায়াম করুন'
              : language === 'hi'
              ? 'पुनः प्राणायाम करें'
              : 'Breathe Again'}
          </span>
        </button>

        <button
          type="button"
          onClick={onReturnHome}
          className="px-5 py-3 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-fun font-bold text-sm transition-all"
        >
          {language === 'bn' ? 'মূল পাতায় ফিরুন' : language === 'hi' ? 'मुख्य पृष्ठ' : 'Return Home'}
        </button>
      </div>
    </div>
  );
};
