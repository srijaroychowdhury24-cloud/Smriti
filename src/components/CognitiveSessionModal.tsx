import React, { useState, useEffect, useRef } from 'react';
import { Language, GameLevelStatus } from '../types';
import { UI_STRINGS, CULTURAL_SYMBOLS } from '../data/translations';
import {
  MEMORY_LEVELS,
  getGameLevelsStatus,
  updateLevelCompletion,
} from '../data/gamesData';
import {
  ArrowLeft,
  Sparkles,
  Award,
  TrendingUp,
  RotateCcw,
  Volume2,
  Clock,
  CheckCircle2,
  HelpCircle,
  Activity,
  Star,
  ChevronRight,
  Music,
  HeartHandshake,
  Home,
  FolderKanban,
  Users,
  Flower2,
  Brain,
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X
} from 'lucide-react';
import { stopAllSpeech, speakMessage } from '../utils/speech';
import { soundFx } from '../utils/audio';
import { saveScoreRecord } from '../utils/scoreStore';
import { CompanionMimi, CompanionMood } from './CompanionMimi';
import { CaregiverDashboard } from './CaregiverDashboard';
import { LanguageSelector } from './LanguageSelector';
import { PatternHarmonyGame } from './PatternHarmonyGame';
import { DailyAssociationGame } from './DailyAssociationGame';
import { MyHomeGame } from './MyHomeGame';
import { SortItOutGame } from './SortItOutGame';
import { WhoIsThisGame } from './WhoIsThisGame';
import { MemoryGardenJourney } from './MemoryGardenJourney';
import {
  recordAdaptiveTrial,
  loadAdaptiveProfile,
  AdaptiveCognitiveProfile
} from '../utils/adaptiveEngine';
import {
  getScheduledReminders,
  saveScheduledReminders,
  initReminderSchedulerDaemon,
  ScheduledReminder,
  requestNotificationPermission,
  triggerCaregiverAlert
} from '../utils/reminderScheduler';

interface Props {
  language: Language;
  onStopSession: () => void;
  onLanguageChange: (lang: Language) => void;
  initialTab?: 'games' | 'caregiver' | 'reminders' | 'breathing' | 'garden';
}

interface GameCard {
  id: number;
  pairId: string;
  symbol: string;
  name: string;
  description: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const CognitiveSessionModal: React.FC<Props> = ({
  language,
  onStopSession,
  onLanguageChange,
  initialTab = 'games',
}) => {
  const strings = UI_STRINGS[language];
  const [activeTab, setActiveTab] = useState<'games' | 'caregiver' | 'reminders' | 'breathing' | 'garden'>(initialTab);
  
  // Selected Game inside Cognitive Suite (6 games with 10 levels each = 60 levels total)
  const [selectedGame, setSelectedGame] = useState<
    'match' | 'harmony' | 'association' | 'my-home' | 'sort-it-out' | 'who-is-this'
  >('match');

  // Scheduled Reminders
  const [scheduledReminders, setScheduledReminders] = useState<ScheduledReminder[]>(getScheduledReminders);
  const [activeAlertReminder, setActiveAlertReminder] = useState<ScheduledReminder | null>(null);

  // Adaptive AI Profile
  const [adaptiveProfile, setAdaptiveProfile] = useState<AdaptiveCognitiveProfile>(loadAdaptiveProfile);

  // Game 1: Cultural Memory Match 10-Levels state
  const [g1Levels, setG1Levels] = useState<GameLevelStatus[]>(() =>
    getGameLevelsStatus('cultural-match')
  );
  const [currentLevelNum, setCurrentLevelNum] = useState<number>(1);
  const currentLevelConfig =
    MEMORY_LEVELS.find((l) => l.level === currentLevelNum) || MEMORY_LEVELS[0];

  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [earnedStars, setEarnedStars] = useState(3);
  const [activeCardDetail, setActiveCardDetail] = useState<string | null>(null);
  const [hintActive, setHintActive] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const trialStartRef = useRef<number>(Date.now());

  // Companion Mimi State
  const [mimiMood, setMimiMood] = useState<CompanionMood>('idle');
  const [mimiSpeech, setMimiSpeech] = useState<string | undefined>(undefined);
  const [isMuted, setIsMuted] = useState(false);

  // Breathing State
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathSecondsLeft, setBreathSecondsLeft] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [completedBreathCycles, setCompletedBreathCycles] = useState(0);

  // Initialize Reminder Scheduler Daemon
  useEffect(() => {
    const stopDaemon = initReminderSchedulerDaemon((rem) => {
      setActiveAlertReminder(rem);
      soundFx.playBell();
      const text = `${rem.title[language] || rem.title.en}. ${rem.subtitle[language] || rem.subtitle.en}`;
      speakMessage(text, language);
    });

    return () => {
      stopDaemon();
    };
  }, [language]);

  // Guided 432Hz Breathing Ring Timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (activeTab === 'breathing' && isBreathingActive) {
      timer = setInterval(() => {
        setBreathSecondsLeft((prev) => {
          if (prev <= 1) {
            if (breathPhase === 'inhale') {
              setBreathPhase('hold');
              soundFx.playToneIndex(1);
              return 4;
            } else if (breathPhase === 'hold') {
              setBreathPhase('exhale');
              soundFx.playToneIndex(0);
              return 4;
            } else {
              setBreathPhase('inhale');
              soundFx.playToneIndex(2);
              setCompletedBreathCycles((c) => c + 1);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeTab, isBreathingActive, breathPhase]);

  // Read Aloud Handler for Mimi in Cognitive Suite
  const handleMimiReadAloud = () => {
    let textToSpeak = mimiSpeech;
    if (!textToSpeak) {
      if (selectedGame === 'match') {
        textToSpeak = `${currentLevelConfig.title[language] || currentLevelConfig.title.en}. ${currentLevelConfig.description[language] || currentLevelConfig.description.en}`;
      } else if (selectedGame === 'harmony') {
        textToSpeak =
          language === 'bn'
            ? 'সুর ও ছন্দ: বাদ্যযন্ত্রের সুর শুনুন এবং সঠিক ক্রমানুসারে বাজান।'
            : language === 'as'
            ? 'সুৰ আৰু ছন্দ: বাদ্যযন্ত্ৰৰ সুৰ শুনক আৰু সঠিক ক্ৰমত বজাওক।'
            : language === 'hi'
            ? 'सुर व लय: वाद्ययंत्रों की धुन सुनकर उसी क्रम में दोहराएं।'
            : 'Sound Harmony: Listen to the melodious musical sequence and repeat the instruments in order.';
      } else if (selectedGame === 'association') {
        textToSpeak =
          language === 'bn'
            ? 'দৈনন্দিন অনুষঙ্গ: প্রতিদিনের পরিচিত স্মৃতি ও সঠিক অনুষঙ্গটি বেছে নিন।'
            : language === 'as'
            ? 'দৈনন্দিন সংগ: প্রতিদিনৰ চিনাকি স্মৃতি আৰু সঠিক সংগী বাছক।'
            : language === 'hi'
            ? 'दैनिक साहचर्य: दिनचर्या और सुखद स्मृतियों से सही वस्तु चुनिए।'
            : 'Daily Routine: Identify the familiar daily memory and choose the right companion object.';
      } else if (selectedGame === 'my-home') {
        textToSpeak =
          language === 'bn'
            ? 'আমার ঘর: গৃহস্থালির চেনা জিনিসটি কোন ঘরে থাকে তা নির্বাচন করুন।'
            : language === 'as'
            ? 'মোৰ ঘৰ: ঘৰৰ চিনাকি বস্তুটো কোনটো কোঠাত থাকে বাছক।'
            : language === 'hi'
            ? 'मेरा घर: पहचानिए कि यह घरेलू वस्तु किस कमरे में रखी जाती है।'
            : 'My Home: Choose which room in the home this familiar object belongs to.';
      } else if (selectedGame === 'sort-it-out') {
        textToSpeak =
          language === 'bn'
            ? 'শ্রেণী বিন্যাস: প্রতিটি উপাদানকে তার সঠিক সাংস্কৃতিক পাত্রে সাজিয়ে রাখুন।'
            : language === 'as'
            ? 'শ্ৰেণী বিভাজন: প্ৰতিটো বস্তুক সঠিক পাত্ৰত সজাওক।'
            : language === 'hi'
            ? 'वस्तु छंटाई: सभी वस्तुओं को उनकी सही श्रेणी और टोकरी में रखिए।'
            : 'Sort It Out: Organize each item into its correct cultural category.';
      } else if (selectedGame === 'who-is-this') {
        textToSpeak =
          language === 'bn'
            ? 'কে এই প্রিয়জন: স্নেহের সূত্র পড়ে পরিবারের প্রিয় মানুষটিকে চিনুন।'
            : language === 'as'
            ? 'এইজন কোন আপোনজন: স্নেহৰ সূত্ৰ পঢ়ি পৰিয়ালৰ আপোনজনক চিনক।'
            : language === 'hi'
            ? 'यह कौन हैं: आत्मीय संकेत पढ़कर परिवार के प्रियजन को पहचानिए।'
            : 'Who Is This: Read the warm affectionate clue to identify your loved one.';
      }
    }
    if (textToSpeak) {
      speakMessage(textToSpeak, language);
    }
  };

  // Hear Types of Games Present - Narrate all 6 cognitive games aloud
  const handleHearGameTypes = () => {
    const optionsSpeech =
      language === 'bn'
        ? 'এখানে ৬টি জ্ঞানমূলক খেলা রয়েছে: ১. সাংস্কৃতিক মিল, ২. সুর ও ছন্দ, ৩. দৈনন্দিন অনুষঙ্গ, ৪. আমার ঘর, ৫. শ্রেণী বিন্যাস, এবং ৬. কে এই প্রিয়জন।'
        : language === 'as'
        ? 'ইয়াত ৬টা জ্ঞানমূলক খেল আছে: ১. সাংস্কৃতিক খেল, ২. সুৰ আৰু ছন্দ, ৩. দৈনন্দিন সংগ, ৪. মোৰ ঘৰ, ৫. শ্ৰেণী বিভাজন, আৰু ৬. এইজন কোন আপোনজন।'
        : language === 'hi'
        ? 'यहाँ ६ प्रकार के संज्ञानात्मक खेल उपलब्ध हैं: १. सांस्कृतिक मिलान, २. सुर व लय, ३. दैनिक साहचर्य, ४. मेरा घर, ५. वस्तु छंटाई, और ६. यह कौन हैं।'
        : 'Here are the 6 cognitive games available: 1. Cultural Match, 2. Sound Harmony, 3. Daily Routine, 4. My Home, 5. Sort It Out, and 6. Who Is This.';

    setMimiMood('happy');
    setMimiSpeech(optionsSpeech);
    soundFx.playToneIndex(1);
    speakMessage(optionsSpeech, language);
  };

  // Initialize Game 1 for a specific level
  const startMemoryLevel = (lvlNum: number) => {
    setCurrentLevelNum(lvlNum);
    startTimeRef.current = Date.now();
    trialStartRef.current = Date.now();
    const config = MEMORY_LEVELS.find((l) => l.level === lvlNum) || MEMORY_LEVELS[0];
    
    const subsetSymbols = config.symbolsSubset
      .map((id) => CULTURAL_SYMBOLS.find((s) => s.pairId === id))
      .filter((s): s is NonNullable<typeof s> => !!s);

    const deck: GameCard[] = [];
    subsetSymbols.forEach((item, idx) => {
      deck.push({
        id: idx * 2,
        pairId: item.pairId,
        symbol: item.symbol,
        name: item.name[language] || item.name.en,
        description: item.description[language] || item.description.en,
        isFlipped: false,
        isMatched: false,
      });
      deck.push({
        id: idx * 2 + 1,
        pairId: item.pairId,
        symbol: item.symbol,
        name: item.name[language] || item.name.en,
        description: item.description[language] || item.description.en,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setScore(0);
    setStreak(0);
    setIsWon(false);
    setActiveCardDetail(null);
    setHintActive(false);
    setMimiMood('idle');
    setMimiSpeech(undefined);
  };

  useEffect(() => {
    startMemoryLevel(1);
  }, [language]);

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2 || isWon) return;

    const clickedCard = cards.find((c) => c.id === cardId);
    if (!clickedCard || clickedCard.isMatched || clickedCard.isFlipped) return;

    soundFx.playCardFlip();
    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );

    setActiveCardDetail(`${clickedCard.name}: ${clickedCard.description}`);

    if (newFlipped.length === 2) {
      const nextMoves = moves + 1;
      setMoves(nextMoves);

      const firstCard = cards.find((c) => c.id === newFlipped[0])!;
      const secondCard = clickedCard;
      const trialDuration = Date.now() - trialStartRef.current;
      trialStartRef.current = Date.now();

      if (firstCard.pairId === secondCard.pairId) {
        // MATCH
        soundFx.playStarDing(Math.min(3, streak + 1));
        setMimiMood('cheering');
        const praises = {
          as: ['অপূৰ্ব মিল!', 'বৰ ধুনীয়া স্মৃতিশক্তি!', 'অসাধাৰণ!'],
          bn: ['চমৎকার মিল!', 'অপূর্ব স্মৃতিশক্তি!', 'অসাধারণ!'],
          hi: ['अति सुंदर मिलान!', 'शानदार याददाश्त!', 'बहुत बढ़िया!'],
          en: ['Splendid match!', 'Wonderful recall!', 'Delightful pairing!'],
        };
        const randomPraise = praises[language][Math.floor(Math.random() * praises[language].length)];
        setMimiSpeech(randomPraise);

        const newStreak = streak + 1;
        setStreak(newStreak);
        const earnedPoints = 120 + newStreak * 30;
        setScore((prev) => prev + earnedPoints);

        // Record trial into Adaptive ML Engine
        const updatedProf = recordAdaptiveTrial({
          gameId: 'cultural-match',
          level: currentLevelNum,
          latencyMs: trialDuration,
          isCorrect: true,
          attempts: 1
        });
        setAdaptiveProfile(updatedProf);

        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((c) =>
              c.pairId === firstCard.pairId ? { ...c, isMatched: true, isFlipped: true } : c
            )
          );
          setFlippedCards([]);
          setMatches((prev) => {
            const nextMatches = prev + 1;
            const target = currentLevelConfig.pairsCount;
            if (nextMatches >= target) {
              handleMemoryLevelVictory(score + earnedPoints, nextMoves, nextMatches);
            }
            return nextMatches;
          });
        }, 500);
      } else {
        // MISMATCH
        soundFx.playGentleMismatch();
        setStreak(0);
        setMimiMood('thinking');
        setMimiSpeech(
          language === 'as'
            ? 'কোনো কথা নাই, লাহেকৈ পিছৰ কাৰ্ডখন চাওক।'
            : language === 'bn'
            ? 'কোনো ব্যাপার নয়, শান্ত হয়ে পরের কার্ডটি দেখুন।'
            : language === 'hi'
            ? 'कोई बात नहीं, आराम से अगली तस्वीर देखिए।'
            : 'No worries at all, take your time.'
        );

        // Record mismatch in adaptive engine
        const updatedProf = recordAdaptiveTrial({
          gameId: 'cultural-match',
          level: currentLevelNum,
          latencyMs: trialDuration,
          isCorrect: false,
          attempts: 2
        });
        setAdaptiveProfile(updatedProf);

        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((c) =>
              newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
        }, 1100);
      }
    }
  };

  const handleMemoryLevelVictory = (finalScore: number, totalMoves: number, totalMatches: number) => {
    setIsWon(true);
    soundFx.playVictoryFanfare();
    setMimiMood('proud');
    setMimiSpeech(
      language === 'as'
        ? `অভিনন্দন! আপুনি ${currentLevelNum} স্তৰ সফলতাৰে সম্পন্ন কৰিলে!`
        : language === 'bn'
        ? `অভিনন্দন! আপনি ${currentLevelNum} ধাপ সফলভাবে সম্পন্ন করেছেন!`
        : language === 'hi'
        ? `बधाई हो! आपने स्तर ${currentLevelNum} सफलतापूर्वक पूर्ण कर लिया!`
        : `Splendid! Level ${currentLevelNum} completed with joy!`
    );

    const mistakes = Math.max(0, totalMoves - totalMatches);
    const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
    setEarnedStars(stars);

    const updated = updateLevelCompletion('cultural-match', currentLevelNum, stars, finalScore);
    setG1Levels(updated);

    saveScoreRecord({
      gameType: `Cultural Memory Match (Lvl ${currentLevelNum})`,
      score: finalScore,
      matches: totalMatches,
      moves: totalMoves,
      accuracy: Math.round((totalMatches / Math.max(1, totalMoves)) * 100),
      timeSpentSec: Math.max(10, Math.round((Date.now() - startTimeRef.current) / 1000)),
      difficulty: `Level ${currentLevelNum}`,
      language,
    });
  };

  const triggerHint = () => {
    if (hintActive) return;
    setHintActive(true);
    soundFx.playStarDing(1);
    setMimiMood('happy');
    setMimiSpeech(
      language === 'as'
        ? 'মনোযোগ দি চাওক! কাৰ্ডৰ ছবি এক পলকৰ বাবে স্পষ্ট হৈছে।'
        : language === 'bn'
        ? 'মনোযোগ দিয়ে দেখুন! কয়েকটি কার্ডের ছবি এক পলকের জন্য দৃশ্যমান হয়েছে।'
        : language === 'hi'
        ? 'ध्यान से देखिए! कार्ड की झलक सामने आई है।'
        : 'Take a gentle peek at the glowing cards!'
    );

    setTimeout(() => {
      setHintActive(false);
    }, 2000);
  };

  const handleCaregiverTabClick = () => {
    setActiveTab('caregiver');
  };

  const updateReminderDecision = (id: string, decision: 'done' | 'not_done') => {
    const nextStatus: ScheduledReminder['status'] = decision === 'done' ? 'acknowledged' : 'missed';
    const updated = scheduledReminders.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: nextStatus,
          lastTriggeredDate: new Date().toISOString().split('T')[0]
        };
      }
      return r;
    });
    saveScheduledReminders(updated);
    setScheduledReminders(updated);

    if (decision === 'done') {
      soundFx.playCelebration();
      setMimiMood('cheering');
      const msg = language === 'bn'
        ? 'চমৎকার! রিমাইন্ডারটি সম্পন্ন হিসেবে দৈনিক রুটিনে চিহ্নিত হলো।'
        : language === 'as'
        ? 'বৰ ভাল! ৰিমাইণ্ডাৰটো সম্পন্ন বুলি ৰুটিনত চিহ্নিত হ\'ল।'
        : language === 'hi'
        ? 'बहुत बढ़िया! यह रिमाइंडर पूरा चिह्नित कर दिया गया है।'
        : 'Wonderful! Marked as Done in your Daily Rhythm.';
      setMimiSpeech(msg);
      speakMessage(msg, language);
    } else {
      soundFx.playGentleMismatch();
      setMimiMood('thinking');
      const msg = language === 'bn'
        ? 'ঠিক আছে, এটি সম্পন্ন নয় হিসেবে দৈনিক রুটিনে রাখা হলো।'
        : language === 'as'
        ? 'ঠিক আছে, এয়া এতিয়াও বাকী বুলি নথিভুক্ত হ\'ল।'
        : language === 'hi'
        ? 'ठीक है, इसे दैनिक रूटीन में अपूर्ण रखा गया है।'
        : 'Noted as Not Done in your Daily Rhythm.';
      setMimiSpeech(msg);
      speakMessage(msg, language);
    }
  };

  const toggleReminderStatus = (id: string) => {
    const updated = scheduledReminders.map(r => {
      if (r.id === id) {
        const nextStatus = r.status === 'acknowledged' ? 'pending' : 'acknowledged';
        return {
          ...r,
          status: nextStatus as ScheduledReminder['status']
        };
      }
      return r;
    });
    saveScheduledReminders(updated);
    setScheduledReminders(updated);
    soundFx.playToneIndex(2);
  };

  const triggerInGameReminder = () => {
    const targetRem = scheduledReminders.find(r => r.status === 'pending') || scheduledReminders.find(r => r.status === 'missed') || scheduledReminders[0];
    if (targetRem) {
      setActiveAlertReminder(targetRem);
      soundFx.playBell();
      const text = `${language === 'bn' ? 'দৈনন্দিন রুটিন রিমাইন্ডার' : language === 'hi' ? 'दैनिक रूटीन रिमाइंडर' : 'Daily Rhythm Reminder'}: ${targetRem.title[language] || targetRem.title.en}. ${targetRem.subtitle[language] || targetRem.subtitle.en}`;
      speakMessage(text, language);
    }
  };

  // Periodic Daily Rhythm Reminder popup during active game sessions
  useEffect(() => {
    if (!selectedGame) return;

    // After 25 seconds of starting or playing a game, trigger a reminder popup
    const initialTimer = setTimeout(() => {
      const targetRem = scheduledReminders.find(r => r.status === 'pending') || scheduledReminders.find(r => r.status === 'missed') || scheduledReminders[0];
      if (targetRem) {
        setActiveAlertReminder(targetRem);
        soundFx.playBell();
        const text = `${language === 'bn' ? 'দৈনন্দিন রুটিন রিমাইন্ডার' : language === 'hi' ? 'दैनिक रूटीन रिमाइंडर' : 'Daily Rhythm Reminder'}: ${targetRem.title[language] || targetRem.title.en}. ${targetRem.subtitle[language] || targetRem.subtitle.en}`;
        speakMessage(text, language);
      }
    }, 25000);

    const intervalTimer = setInterval(() => {
      const targetRem = scheduledReminders.find(r => r.status === 'pending') || scheduledReminders.find(r => r.status === 'missed') || scheduledReminders[Math.floor(Math.random() * scheduledReminders.length)];
      if (targetRem) {
        setActiveAlertReminder(targetRem);
        soundFx.playBell();
        const text = `${language === 'bn' ? 'দৈনন্দিন রুটিন রিমাইন্ডার' : language === 'hi' ? 'दैनिक रूटीन रिमाइंडर' : 'Daily Rhythm Reminder'}: ${targetRem.title[language] || targetRem.title.en}. ${targetRem.subtitle[language] || targetRem.subtitle.en}`;
        speakMessage(text, language);
      }
    }, 60000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [selectedGame, scheduledReminders, language]);

  return (
    <main className="min-h-screen w-full relative overflow-x-hidden overflow-y-auto bg-gradient-to-b from-[#fcf3ec] via-[#f7e8ef] to-[#fbeef5] text-[#3d1f30] py-3 sm:py-4 px-2.5 sm:px-6 flex flex-col items-center justify-between font-fun">
      {/* Soft Ambient Glow Orbs */}
      <div className="absolute -top-32 -left-28 w-[500px] h-[500px] rounded-full bg-[#fed7aa]/25 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/4 -right-32 w-[480px] h-[480px] rounded-full bg-[#fbcfe8]/25 blur-[110px] pointer-events-none" />
      <div className="absolute -bottom-28 left-1/5 w-[520px] h-[520px] rounded-full bg-[#dcfce7]/25 blur-[120px] pointer-events-none" />

      {/* TOP BAR / NAVIGATION */}
      <header className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 mb-3 z-20">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <button
            type="button"
            id="btn-nav-home"
            onClick={onStopSession}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/80 hover:bg-white text-[#783e30] border border-stone-200 shadow-2xs font-bold text-xs sm:text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{strings.stopButton}</span>
          </button>

          {/* App Branding */}
          <div className="flex items-center gap-2">
            <span className="text-xl">🏔️</span>
            <span className="text-lg sm:text-xl font-black text-[#df735a] font-fun tracking-tight">
              Smriti
            </span>
          </div>
        </div>

        {/* 4 MAIN TABS (Games Suite, Caregiver Analytics, Rhythm Reminders, Calm Breathing) */}
        <nav className="flex items-center gap-1 bg-stone-100/80 p-1 rounded-2xl border border-stone-200/80 overflow-x-auto max-w-full no-scrollbar">
          <button
            type="button"
            id="tab-games"
            onClick={() => setActiveTab('games')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'games'
                ? 'bg-[#df735a] text-white shadow-xs font-black'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{strings.tabs.games}</span>
          </button>

          <button
            type="button"
            id="tab-caregiver"
            onClick={handleCaregiverTabClick}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'caregiver'
                ? 'bg-[#df735a] text-white shadow-xs font-black'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{strings.tabs.caregiver}</span>
          </button>

          <button
            type="button"
            id="tab-reminders"
            onClick={() => setActiveTab('reminders')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'reminders'
                ? 'bg-[#df735a] text-white shadow-xs font-black'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{strings.tabs.reminders}</span>
          </button>

          <button
            type="button"
            id="tab-breathing"
            onClick={() => {
              setActiveTab('breathing');
              setIsBreathingActive(true);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'breathing'
                ? 'bg-[#df735a] text-white shadow-xs font-black'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <span>🪷</span>
            <span>{strings.tabs.breathing}</span>
          </button>
        </nav>

        {/* Language Selector */}
        <LanguageSelector
          currentLanguage={language}
          onSelectLanguage={onLanguageChange}
        />
      </header>

      {/* SCHEDULED ALERT MODAL (Triggered when alarm daemon fires) */}
      {activeAlertReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-rose-300 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3 animate-bounce">
              <Bell className="w-7 h-7" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-rose-100 text-rose-800 inline-block mb-2">
              Scheduled Reminder Alert
            </span>
            <h3 className="text-xl font-black text-[#3d1f30] mb-1">
              {activeAlertReminder.title[language] || activeAlertReminder.title.en}
            </h3>
            <p className="text-sm text-stone-600 mb-5">
              {activeAlertReminder.subtitle[language] || activeAlertReminder.subtitle.en}
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  toggleReminderStatus(activeAlertReminder.id);
                  setActiveAlertReminder(null);
                  soundFx.playVictoryFanfare();
                }}
                className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md"
              >
                ✓ Taken / Completed
              </button>
              <button
                type="button"
                onClick={() => setActiveAlertReminder(null)}
                className="px-4 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: COGNITIVE GAMES SUITE (6 Games with 10 Levels Each = 60 Levels Total) */}
      {activeTab === 'games' && (
        <div className="w-full max-w-4xl mx-auto z-10 flex flex-col items-center">
          {/* COMPANION MIMI BANNER */}
          <div className="w-full mb-3">
            <CompanionMimi
              language={language}
              mood={mimiMood}
              customMessage={mimiSpeech}
              onVoiceSpeak={handleMimiReadAloud}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted(!isMuted)}
              hideMicrophone={true}
              onHearGames={handleHearGameTypes}
            />
          </div>

          {/* 6 COGNITIVE GAMES HEADER WITH AUDIBLE NARRATION */}
          <div className="w-full flex items-center justify-between mb-2 px-1">
            <span className="text-xs sm:text-sm font-bold text-stone-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#df735a]" />
              {language === 'bn' ? 'উপলব্ধ ৬টি খেলা:' : language === 'as' ? 'উপলব্ধ ৬টা খেল:' : language === 'hi' ? 'उपलब्ध ६ खेल:' : '6 Cognitive Games Available:'}
            </span>
            <button
              type="button"
              id="btn-hear-all-games"
              onClick={handleHearGameTypes}
              className="px-3 py-1 rounded-full bg-amber-100 hover:bg-amber-200 text-[#df735a] hover:text-[#c95d45] text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 border border-amber-200"
              title="Hear the list of available games"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'খেলার নাম শুনুন' : language === 'as' ? 'খেলৰ নাম শুনক' : language === 'hi' ? 'खेलों के नाम सुनें' : 'Hear Games'}</span>
            </button>
          </div>

          {/* 6 COGNITIVE GAMES SUB-SWITCHER (10 Levels each = 60 levels total) */}
          <div className="w-full p-2 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-2xs mb-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <button
              type="button"
              id="subtab-game-match"
              onClick={() => setSelectedGame('match')}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                selectedGame === 'match'
                  ? 'bg-[#df735a] text-white shadow-xs font-black scale-102 ring-2 ring-amber-300'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <span>🎴</span>
              <span className="truncate">
                {language === 'bn'
                  ? '১. সাংস্কৃতিক মিল'
                  : language === 'as'
                  ? '১. সাংস্কৃতিক খেল'
                  : language === 'hi'
                  ? '१. सांस्कृतिक मिलान'
                  : '1. Cultural Match'}
              </span>
            </button>

            <button
              type="button"
              id="subtab-game-harmony"
              onClick={() => setSelectedGame('harmony')}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                selectedGame === 'harmony'
                  ? 'bg-[#df735a] text-white shadow-xs font-black scale-102 ring-2 ring-amber-300'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span className="truncate">
                {language === 'bn'
                  ? '২. সুর ও ছন্দ'
                  : language === 'as'
                  ? '২. সুৰ আৰু ছন্দ'
                  : language === 'hi'
                  ? '२. सुर व लय'
                  : '2. Sound Harmony'}
              </span>
            </button>

            <button
              type="button"
              id="subtab-game-association"
              onClick={() => setSelectedGame('association')}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                selectedGame === 'association'
                  ? 'bg-[#df735a] text-white shadow-xs font-black scale-102 ring-2 ring-amber-300'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span className="truncate">
                {language === 'bn'
                  ? '৩. দৈনন্দিন অনুষঙ্গ'
                  : language === 'as'
                  ? '৩. দৈনন্দিন সংগ'
                  : language === 'hi'
                  ? '३. दैनिक साहचर्य'
                  : '3. Daily Routine'}
              </span>
            </button>

            <button
              type="button"
              id="subtab-game-my-home"
              onClick={() => setSelectedGame('my-home')}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                selectedGame === 'my-home'
                  ? 'bg-[#df735a] text-white shadow-xs font-black scale-102 ring-2 ring-amber-300'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span className="truncate">
                {language === 'bn'
                  ? '৪. আমার ঘর'
                  : language === 'as'
                  ? '৪. মোৰ ঘৰ'
                  : language === 'hi'
                  ? '४. मेरा घर'
                  : '4. My Home'}
              </span>
            </button>

            <button
              type="button"
              id="subtab-game-sort-it-out"
              onClick={() => setSelectedGame('sort-it-out')}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                selectedGame === 'sort-it-out'
                  ? 'bg-[#df735a] text-white shadow-xs font-black scale-102 ring-2 ring-amber-300'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span className="truncate">
                {language === 'bn'
                  ? '৫. শ্রেণী বিন্যাস'
                  : language === 'as'
                  ? '৫. শ্ৰেণী বিভাজন'
                  : language === 'hi'
                  ? '५. वस्तु छंटाई'
                  : '5. Sort It Out'}
              </span>
            </button>

            <button
              type="button"
              id="subtab-game-who-is-this"
              onClick={() => setSelectedGame('who-is-this')}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                selectedGame === 'who-is-this'
                  ? 'bg-[#df735a] text-white shadow-xs font-black scale-102 ring-2 ring-amber-300'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span className="truncate">
                {language === 'bn'
                  ? '৬. কে এই প্রিয়জন?'
                  : language === 'as'
                  ? '৬. এইজন কোন আপোনজন?'
                  : language === 'hi'
                  ? '६. यह कौन हैं?'
                  : '6. Who Is This?'}
              </span>
            </button>
          </div>

          {/* SUB-GAME 1: CULTURAL MEMORY MATCH (10 Progressive Levels) */}
          {selectedGame === 'match' && (
            <div className="w-full flex flex-col items-center">
              {/* 10-LEVEL PROGRESSION RIBBON */}
              <div className="w-full mb-3 p-3 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-2xs">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-bold text-[#8c5040] uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#df735a]" />
                    <span>
                      {language === 'bn'
                        ? 'স্মৃতি মিল: ১০টি সমৃদ্ধ ধাপ'
                        : language === 'as'
                        ? 'স্মৃতি খেল: ১০ টা সমৃদ্ধ স্তৰ'
                        : language === 'hi'
                        ? 'स्मृति मिलान: १० समृद्ध स्तर'
                        : 'Memory Match: 10 Rich Levels'}
                    </span>
                  </span>
                  <span className="text-xs font-bold text-[#3d1f30]">
                    {language === 'bn'
                      ? `চলতি ধাপ: ${currentLevelNum}/১০`
                      : language === 'as'
                      ? `বৰ্তমান স্তৰ: ${currentLevelNum}/১০`
                      : language === 'hi'
                      ? `वर्तमान स्तर: ${currentLevelNum}/१०`
                      : `Current Level: ${currentLevelNum}/10`}
                  </span>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                  {g1Levels.map((lvl) => {
                    const isCurrent = lvl.level === currentLevelNum;
                    return (
                      <button
                        type="button"
                        key={lvl.level}
                        disabled={!lvl.unlocked}
                        onClick={() => startMemoryLevel(lvl.level)}
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

              {/* REAL-TIME SCORE TRACKER & CONTROLS */}
              <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
                <div className="p-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-2xs flex flex-col items-center text-center">
                  <span className="text-[11px] font-bold text-[#b9573f] uppercase tracking-wider flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>{strings.scoreTracker.score}</span>
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-[#df735a]">
                    {score}
                  </span>
                  {streak > 1 && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full mt-0.5">
                      🔥 {streak}x {strings.scoreTracker.streak}
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-2xs flex flex-col items-center text-center">
                  <span className="text-[11px] font-bold text-[#b9573f] uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{strings.scoreTracker.matches}</span>
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-[#3d1f30]">
                    {matches} / {currentLevelConfig.pairsCount}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-2xs flex flex-col items-center text-center">
                  <span className="text-[11px] font-bold text-[#b9573f] uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{strings.scoreTracker.moves}</span>
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-[#3d1f30]">
                    {moves}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-2xs flex flex-col items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={triggerHint}
                    disabled={hintActive}
                    className="w-full py-1.5 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                    <span>{strings.controls?.hint || strings.games?.hintButton || 'Gentle Hint'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => startMemoryLevel(currentLevelNum)}
                    className="w-full py-1.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{strings.controls?.reset || strings.games?.reset || 'Shuffle Cards'}</span>
                  </button>
                </div>
              </div>

              {/* RULE & OBJECTIVE BANNER ABOVE CULTURAL MATCH */}
              <div className="w-full p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-2xs mb-3 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] sm:text-[11px] font-bold text-[#b9573f] uppercase tracking-wider bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-200">
                        {language === 'bn' ? 'খেলার নিয়ম ও উদ্দেশ্য' : language === 'as' ? 'খেলৰ নিয়ম আৰু উদ্দেশ্য' : language === 'hi' ? 'खेल का नियम व उद्देश्य' : 'Game Rule & Objective'}
                      </span>
                      <span className="text-xs font-bold text-amber-800 bg-white/80 px-2 py-0.5 rounded-full border border-stone-200">
                        {language === 'bn'
                          ? `${currentLevelConfig.pairsCount - matches} জোড়া বাকি`
                          : language === 'as'
                          ? `${currentLevelConfig.pairsCount - matches} জোৰা বাকী`
                          : language === 'hi'
                          ? `${currentLevelConfig.pairsCount - matches} जोड़े शेष`
                          : `${currentLevelConfig.pairsCount - matches} pairs remaining`}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#5d2e24] font-medium leading-relaxed">
                      {language === 'bn'
                        ? `নিয়ম: কাচের পাত্রের যেকোনো দুটি কার্ডে চাপ দিয়ে উল্টান এবং একই সাংস্কৃতিক প্রতীকের জোড়া মেলান। কার্ডের ছবি মনে রেখে কম চালে স্তরটি সম্পূর্ণ করুন!`
                        : language === 'as'
                        ? `নিয়ম: কাঁচৰ পাত্ৰৰ দুখন কাৰ্ড স্পৰ্শ কৰি ওলোটাওক আৰু একে সাংস্কৃতিক প্ৰতীকৰ জোৰা মিলাওক। কম চালতে স্তৰটো সমাপ্ত কৰক!`
                        : language === 'hi'
                        ? `नियम: कांच के कंटेनर वाले किन्हीं दो कार्डों को छूकर पलटें और समान सांस्कृतिक प्रतीक का जोड़ा खोजें। कार्डों का स्थान याद रखकर कम चालों में स्तर पूरा करें!`
                        : `Rule: Tap any two glass container cards to reveal matching cultural symbols. Remember symbol positions to match pairs with fewest moves!`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const ruleText = language === 'bn'
                          ? `নিয়ম: কাচের পাত্রের যেকোনো দুটি কার্ড স্পর্শ করে উল্টান এবং একই সাংস্কৃতিক প্রতীকের জোড়া মেলান। মোট ${currentLevelConfig.pairsCount} টি জোড়া খুঁজে বের করুন। বাকি আছে ${currentLevelConfig.pairsCount - matches} জোড়া।`
                          : language === 'hi'
                          ? `नियम: कांच के कंटेनर वाले किन्हीं दो कार्डों को पलटकर समान सांस्कृतिक प्रतीक का जोड़ा खोजें। कुल ${currentLevelConfig.pairsCount} जोड़े मिलाइए। शेष हैं ${currentLevelConfig.pairsCount - matches} जोड़े।`
                          : `Rule: Tap any two glass cards to flip and match pairs of cultural symbols. ${currentLevelConfig.pairsCount - matches} pairs remaining!`;
                        speakMessage(ruleText, language);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#fae6db] hover:bg-[#f5d5c5] text-[#8a3f2c] font-bold text-xs shadow-2xs transition-all active:scale-95"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'নিয়ম শুনুন' : language === 'hi' ? 'नियम सुनें' : 'Hear Rule'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={triggerHint}
                      disabled={hintActive}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs border border-amber-300 shadow-2xs transition-all active:scale-95"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                      <span>{language === 'bn' ? 'ইঙ্গিত' : language === 'hi' ? 'संकेत' : 'Gentle Hint'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* CARD DETAIL TOAST */}
              {activeCardDetail && (
                <div className="w-full p-2.5 mb-3 rounded-2xl bg-amber-50/90 border border-amber-200 text-center text-xs font-semibold text-[#6b3528] animate-fade-in">
                  🌸 {activeCardDetail}
                </div>
              )}

              {/* MEMORY CARDS GRID - REALISTIC GLASS CONTAINERS */}
              <div
                className={`w-full grid gap-2 sm:gap-3.5 ${
                  currentLevelConfig.pairsCount <= 2
                    ? 'grid-cols-2 sm:grid-cols-4'
                    : currentLevelConfig.pairsCount <= 3
                    ? 'grid-cols-3 sm:grid-cols-6'
                    : currentLevelConfig.pairsCount <= 4
                    ? 'grid-cols-3 sm:grid-cols-4'
                    : currentLevelConfig.pairsCount === 5
                    ? 'grid-cols-3 sm:grid-cols-5'
                    : 'grid-cols-3 sm:grid-cols-6'
                }`}
              >
                {cards.map((card) => {
                  const isFlipped = card.isFlipped || card.isMatched || hintActive;
                  return (
                    <button
                      type="button"
                      key={card.id}
                      onClick={() => handleCardClick(card.id)}
                      disabled={card.isMatched || isWon}
                      className={`relative aspect-[3.2/4] sm:aspect-square rounded-2xl sm:rounded-3xl p-2 flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 select-none overflow-hidden ${
                        card.isMatched
                          ? 'bg-gradient-to-b from-emerald-50/90 via-teal-50/75 to-emerald-100/65 backdrop-blur-md border-2 border-emerald-400/80 shadow-[0_4px_14px_rgba(16,185,129,0.2),inset_0_2px_4px_rgba(255,255,255,0.95)] opacity-85 scale-95'
                          : isFlipped
                          ? 'bg-gradient-to-b from-white/95 via-amber-50/90 to-orange-50/85 backdrop-blur-md border-2 border-amber-300 shadow-[0_8px_20px_rgba(245,158,11,0.22),inset_0_2px_6px_rgba(255,255,255,1)] ring-2 ring-amber-200/80'
                          : 'bg-gradient-to-b from-white/80 via-[#f8ebe3]/70 to-[#edd5c8]/85 backdrop-blur-md border-2 border-white/90 shadow-[0_6px_18px_rgba(223,115,90,0.14),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-2px_4px_rgba(0,0,0,0.03)] hover:border-[#df735a]/60 hover:shadow-md'
                      }`}
                    >
                      {/* Glass container rim/lip reflection */}
                      <div className="absolute top-1.5 inset-x-2.5 h-1 sm:h-1.5 rounded-full bg-white/80 shadow-[0_1px_2px_rgba(255,255,255,0.9)] border border-white/60 pointer-events-none" />

                      {/* Glass specular shine highlight */}
                      <div className="absolute top-2.5 left-2.5 w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-white/70 blur-[0.5px] pointer-events-none" />
                      <div className="absolute bottom-2 inset-x-3 h-1 rounded-full bg-white/40 blur-[1px] pointer-events-none" />

                      {isFlipped ? (
                        <div className="flex flex-col items-center justify-center text-center z-10">
                          <span className="text-3xl sm:text-4xl mb-0.5 filter drop-shadow-xs">{card.symbol}</span>
                          <span className="text-[10px] sm:text-[11px] font-bold text-[#3d1f30] line-clamp-1 px-1">
                            {card.name}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-[#9c513e] z-10">
                          <span className="text-2xl sm:text-3xl opacity-80 filter drop-shadow-xs">🪷</span>
                          <span className="text-[9px] font-black uppercase tracking-wider mt-0.5 text-[#8a4231]/80">
                            Smriti
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* VICTORY OVERLAY DIALOG */}
              {isWon && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
                  <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-amber-300 text-center">
                    <span className="text-4xl">🎉</span>
                    <h3 className="text-2xl font-black text-[#3d1f30] font-fun mb-2 mt-1">
                      {strings.victory?.title || strings.games?.completedTitle || 'Splendid! Level Complete!'}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 mb-4">
                      {strings.victory?.subtitle || strings.games?.completedDesc || 'Your memory score has been securely saved.'}
                    </p>

                    <div className="flex items-center justify-center gap-1 text-3xl text-amber-400 mb-4">
                      {[...Array(3)].map((_, i) => (
                        <span
                          key={i}
                          className={i < earnedStars ? 'opacity-100 scale-110' : 'opacity-30'}
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => startMemoryLevel(currentLevelNum)}
                        className="px-4 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs sm:text-sm"
                      >
                        {strings.victory?.replay || strings.games?.playAgain || 'Play Again'}
                      </button>
                      {currentLevelNum < 10 ? (
                        <button
                          type="button"
                          onClick={() => startMemoryLevel(currentLevelNum + 1)}
                          className="px-6 py-2.5 rounded-full bg-[#df735a] hover:bg-[#c95d45] text-white font-bold text-xs sm:text-sm shadow-md"
                        >
                          {strings.victory?.nextLevel || (language === 'as' ? 'পৰৱৰ্তী স্তৰ' : language === 'bn' ? 'পরবর্তী ধাপ' : language === 'hi' ? 'अगला स्तर' : 'Next Level')}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveTab('games')}
                          className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md"
                        >
                          Complete Suite
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUB-GAME 2: PATTERN & SOUND HARMONY (10 Levels) */}
          {selectedGame === 'harmony' && (
            <PatternHarmonyGame
              language={language}
              onCompanionSpeech={(msg, mood) => {
                setMimiSpeech(msg);
                if (mood) setMimiMood(mood);
              }}
              onLevelCompletedOverall={(lvl, addedScore) => {
                setScore((prev) => prev + addedScore);
              }}
            />
          )}

          {/* SUB-GAME 3: DAILY ROUTINE RECALL (10 Levels) */}
          {selectedGame === 'association' && (
            <DailyAssociationGame
              language={language}
              onCompanionSpeech={(msg, mood) => {
                setMimiSpeech(msg);
                if (mood) setMimiMood(mood);
              }}
              onLevelCompletedOverall={(lvl, addedScore) => {
                setScore((prev) => prev + addedScore);
              }}
            />
          )}

          {/* SUB-GAME 4: MY HOME - ROOM MATCHING (10 Levels) */}
          {selectedGame === 'my-home' && (
            <MyHomeGame
              language={language}
              onCompanionSpeech={(msg, mood) => {
                setMimiSpeech(msg);
                if (mood) setMimiMood(mood);
              }}
              onLevelCompletedOverall={(lvl, addedScore) => {
                setScore((prev) => prev + addedScore);
              }}
            />
          )}

          {/* SUB-GAME 5: SORT IT OUT - CATEGORIZE OBJECTS (10 Levels) */}
          {selectedGame === 'sort-it-out' && (
            <SortItOutGame
              language={language}
              onCompanionSpeech={(msg, mood) => {
                setMimiSpeech(msg);
                if (mood) setMimiMood(mood);
              }}
              onLevelCompletedOverall={(lvl, addedScore) => {
                setScore((prev) => prev + addedScore);
              }}
            />
          )}

          {/* SUB-GAME 6: WHO IS THIS? - FAMILIAR RELATIONSHIPS & ROLES (10 Levels) */}
          {selectedGame === 'who-is-this' && (
            <WhoIsThisGame
              language={language}
              onCompanionSpeech={(msg, mood) => {
                setMimiSpeech(msg);
                if (mood) setMimiMood(mood);
              }}
              onLevelCompletedOverall={(lvl, addedScore) => {
                setScore((prev) => prev + addedScore);
              }}
            />
          )}
        </div>
      )}

      {/* TAB 2: CAREGIVER & CLINICAL DASHBOARD (Option 2) */}
      {activeTab === 'caregiver' && (
        <div className="w-full max-w-4xl mx-auto z-10">
          <CaregiverDashboard
            language={language}
            onLaunchPatientGame={() => setActiveTab('games')}
            onBackHome={onStopSession}
          />
        </div>
      )}

      {/* TAB 3: DAILY RHYTHM & SCHEDULED ALERTS */}
      {activeTab === 'reminders' && (
        <div className="w-full max-w-2xl mx-auto z-10 bg-white/70 backdrop-blur-2xl rounded-3xl p-5 sm:p-7 border border-white/80 shadow-[0_16px_48px_0_rgba(223,115,90,0.12)]">
          <div className="text-center mb-5">
            <span className="text-xs font-bold text-[#df735a] uppercase tracking-wider block mb-1">
              ⏰ Daily Rhythm, Scheduled Alarms & Hydration
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#3d1f30] font-fun">
              {strings.reminders.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#6c4856]">
              {strings.reminders.desc}
            </p>

            {/* Notification Permission Toggle */}
            <div className="mt-3 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  const granted = await requestNotificationPermission();
                  if (granted) {
                    alert('Browser alarm alerts enabled!');
                  }
                }}
                className="px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5 text-rose-500" />
                <span>Enable Browser Alarms</span>
              </button>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {scheduledReminders.map((item) => (
              <div
                key={item.id}
                id={`reminder-${item.id}`}
                onClick={() => toggleReminderStatus(item.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  item.status === 'acknowledged'
                    ? 'bg-emerald-50/80 border-emerald-300 shadow-2xs'
                    : 'bg-white/80 hover:bg-white border-stone-200 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center border transition-colors ${
                      item.status === 'acknowledged'
                        ? 'bg-emerald-500 border-emerald-600 text-white'
                        : 'border-stone-300 text-transparent'
                    }`}
                  >
                    ✓
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#df735a] bg-[#fae6db] px-2 py-0.5 rounded-full">
                        {item.timeStr}
                      </span>
                      {item.isCritical && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                          Critical
                        </span>
                      )}
                      <span className={`text-sm sm:text-base font-bold font-fun ${item.status === 'acknowledged' ? 'line-through text-stone-400' : 'text-[#3d1f30]'}`}>
                        {item.title?.[language] || item.title?.en || ''}
                      </span>
                    </div>
                    {(item.subtitle?.[language] || item.subtitle?.en) && (
                      <p className={`text-xs mt-0.5 ${item.status === 'acknowledged' ? 'text-stone-400' : 'text-[#6c4856]'}`}>
                        {item.subtitle?.[language] || item.subtitle?.en}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const textToSpeak = `${item.title?.[language] || item.title?.en || ''}. ${item.subtitle?.[language] || item.subtitle?.en || ''}`.trim();
                    speakMessage(textToSpeak, language);
                  }}
                  className="p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex-shrink-0"
                  title="Speak reminder"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Calming reassurance */}
          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-center text-xs text-amber-900 font-medium">
            💛 {language === 'as' ? 'নিয়মিত পানী খোৱা আৰু ঔষধ সেৱনে শৰীৰত প্ৰশান্তি আৰু স্নিগ্ধতা বৰ্তাই ৰাখে।' : language === 'bn' ? 'নিয়মিত জলপান ও ওষুধ সেবন শরীরে প্রশান্তি ও সতেজতা বজায় রাখে।' : language === 'hi' ? 'समय पर जलपान एवं दवा का सेवन स्वास्थ्य और मन को शांत रखता है।' : 'Regular sips of water and peaceful routine nurture physical and mental clarity.'}
          </div>
        </div>
      )}

      {/* TAB 4: CALM LOTUS BREATHING RING */}
      {activeTab === 'breathing' && (
        <div className="w-full max-w-lg mx-auto z-10 bg-white/70 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/80 shadow-[0_16px_48px_0_rgba(223,115,90,0.12)] text-center flex flex-col items-center">
          <span className="text-xs font-bold text-[#df735a] uppercase tracking-wider block mb-1">
            🪷 432Hz Serenity Ring
          </span>
          <h2 className="text-2xl font-black text-[#3d1f30] font-fun mb-1">
            {strings.breathing.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#6c4856] max-w-sm mb-6">
            {strings.breathing.desc}
          </p>

          {/* INTERACTIVE EXPANDING/CONTRACTING BREATHING RING */}
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center my-4">
            <div
              className={`absolute inset-0 rounded-full bg-[#df735a]/10 transition-transform duration-1000 ${
                breathPhase === 'inhale'
                  ? 'scale-110 opacity-70'
                  : breathPhase === 'hold'
                  ? 'scale-105 opacity-85 ring-4 ring-[#df735a]/30'
                  : 'scale-90 opacity-40'
              }`}
            />
            <div
              className={`absolute inset-4 rounded-full bg-[#df735a]/20 transition-transform duration-1000 ${
                breathPhase === 'inhale'
                  ? 'scale-105 opacity-80'
                  : breathPhase === 'hold'
                  ? 'scale-100 opacity-90'
                  : 'scale-85 opacity-50'
              }`}
            />

            {/* Core Breathing Orb */}
            <div
              className={`w-36 h-36 rounded-full bg-gradient-to-br from-[#df735a] to-[#d05c43] text-white flex flex-col items-center justify-center shadow-xl transition-transform duration-1000 z-10 ${
                breathPhase === 'inhale'
                  ? 'scale-110 shadow-2xl'
                  : breathPhase === 'hold'
                  ? 'scale-105 ring-4 ring-amber-300'
                  : 'scale-95 shadow-md'
              }`}
            >
              <span className="text-3xl filter drop-shadow-xs mb-1">🪷</span>
              <span className="text-sm font-black uppercase tracking-wider font-fun">
                {strings.breathing[breathPhase]}
              </span>
              <span className="text-xl font-black mt-0.5">
                {breathSecondsLeft}s
              </span>
            </div>
          </div>

          {/* Phase guidance */}
          <p className="text-sm text-[#462d3a] font-bold mt-2">
            {breathPhase === 'inhale'
              ? language === 'as'
                ? 'লাহে লাহে বুকুত প্ৰশান্ত স্নিগ্ধ বতাহ গ্ৰহণ কৰক...'
                : language === 'bn'
                ? 'ধীরে ধীরে বুক ভরে শান্ত স্নিগ্ধ বাতাস গ্রহণ করুন...'
                : language === 'hi'
                ? 'धीरे-धीरे गहरी और शांत सांस भीतर भरिए...'
                : 'Breathe in slowly and peacefully...'
              : breathPhase === 'hold'
              ? language === 'as'
                ? 'উশাহ ধৰি ৰাখক, মনৰ প্ৰশান্তি অনুভৱ কৰক...'
                : language === 'bn'
                ? 'শ্বাস ধরে রাখুন, মনের শান্তি অনুভব করুন...'
                : language === 'hi'
                ? 'सांस रोककर आंतरिक शांति को महसूस कीजिए...'
                : 'Hold gently, feeling quiet calm...'
              : language === 'as'
              ? 'লাহে লাহে সমস্ত ক্লান্তি উশাহৰ সৈতে এৰি দিয়ক...'
              : language === 'bn'
              ? 'ধীরে ধীরে সমস্ত ক্লান্তি নিঃশ্বাসের সাথে ছেড়ে দিন...'
              : language === 'hi'
              ? 'धीरे-धीरे संपूर्ण थकान सांस के साथ बाहर छोड़िए...'
              : 'Slowly breathe out, releasing all tension...'}
          </p>

          <div className="mt-5 pt-4 border-t border-stone-200/80 w-full flex flex-col items-center">
            <span className="text-xs text-[#8c5040] font-medium mb-2">
              {completedBreathCycles > 0
                ? language === 'as'
                  ? `🌸 ${completedBreathCycles} টা শান্ত প্ৰাণায়াম সম্পন্ন! আপোনাৰ বাগিচাৰ ফুল প্রস্ফুটিত হ'বলৈ সাজু।`
                  : language === 'bn'
                  ? `🌸 ${completedBreathCycles}টি শান্ত প্রাণায়াম সম্পন্ন! আপনার বাগানের ফুল প্রস্ফুটিত হওয়ার জন্য প্রস্তুত।`
                  : language === 'hi'
                  ? `🌸 ${completedBreathCycles} प्राणायाम पूर्ण! आपके उद्यान का पुष्प खिलने को तत्पर है।`
                  : `🌸 ${completedBreathCycles} calm cycle(s) complete! Your garden flower is ready to bloom.`
                : language === 'as'
                ? 'ধ্যানৰ অন্তত আপোনাৰ স্মৃতি বাগিচাত আজিৰ ফুল প্রস্ফুটিত হ\'ব।'
                : language === 'bn'
                ? 'ধ্যান শেষে আপনার স্মৃতি বাগানের আজকের ফুল প্রস্ফুটিত হবে।'
                : language === 'hi'
                ? 'प्राणायाम उपरांत आपके स्मृति उद्यान में आज का पुष्प प्रफुल्लित होगा।'
                : 'Mindful breathing nurtures today\'s blooming flower in your Memory Garden.'}
            </span>

            <button
              type="button"
              onClick={() => {
                soundFx.playVictoryFanfare();
                setIsBreathingActive(false);
                setActiveTab('garden');
              }}
              className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <Flower2 className="w-4 h-4" />
              <span>
                {language === 'as'
                  ? 'উশাহ-নিশাহ সম্পূৰ্ণ কৰক আৰু বাগিচালৈ যাওক'
                  : language === 'bn'
                  ? 'শ্বাসক্রিয়া সম্পূর্ণ করুন ও বাগানে যান'
                  : language === 'hi'
                  ? 'प्राणायाम पूर्ण करें व बगिया में खिलें'
                  : 'Complete Breathing & Enter Garden'}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => {
                soundFx.playBell();
                setIsBreathingActive(!isBreathingActive);
              }}
              className="px-6 py-2.5 rounded-full bg-[#df735a] hover:bg-[#c95d45] text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <span>{isBreathingActive ? 'Pause Breathing' : 'Start Guided Ring'}</span>
            </button>

            <button
              type="button"
              onClick={() => soundFx.playBell()}
              className="p-2.5 rounded-full bg-[#fae6db] hover:bg-[#f5d5c5] text-[#8a3f2c] shadow-2xs"
              title="Temple Bell Chime"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* AUTOMATIC INTERFACE AFTER CALM BREATHING RING: MEMORY GARDEN JOURNEY */}
      {activeTab === 'garden' && (
        <MemoryGardenJourney
          language={language}
          onReturnToGames={() => setActiveTab('games')}
          onReturnHome={onStopSession}
          onBreatheAgain={() => {
            setActiveTab('breathing');
            setIsBreathingActive(true);
            setBreathSecondsLeft(4);
            setBreathPhase('inhale');
            setCompletedBreathCycles(0);
          }}
        />
      )}

      {/* FOOTER REASSURANCE */}
      <footer className="w-full flex justify-center items-center z-10 pt-3 pb-1">
        <span className="text-[11px] font-bold text-[#8c5040] uppercase tracking-wider">
          📶 {strings.offlineBadge} • {strings.bottomNote || strings.voiceNotice || 'Voice Assisted Care'}
        </span>
      </footer>
    </main>
  );
};
