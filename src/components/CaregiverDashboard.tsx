import React, { useState, useEffect } from 'react';
import { Language, GameScoreRecord, GameLevelStatus } from '../types';
import {
  ArrowLeft,
  Activity,
  Star,
  TrendingUp,
  RefreshCw,
  Trash2,
  Brain,
  Sparkles,
  User,
  Clock,
  CheckCircle2,
  Pill,
  PlusCircle,
  FileText,
  Heart,
  Calendar,
  AlertCircle,
  Check,
  ChevronRight,
  Printer,
  Edit2,
  Save,
  Smile,
  ShieldCheck,
  Zap,
  Target,
  Music,
  Home,
  FolderKanban,
  Users
} from 'lucide-react';
import {
  getStoredScores,
  clearStoredScores,
  computeScoreSummary,
} from '../utils/scoreStore';
import { getGameLevelsStatus } from '../data/gamesData';
import { fetchScoresFromSupabase, isSupabaseConfigured } from '../utils/supabaseClient';
import {
  getPatientDetails,
  savePatientDetails,
  getPrescriptions,
  savePrescriptions,
  addPrescription,
  deletePrescription,
  togglePrescriptionTaken,
  PatientDetails,
  PrescriptionItem
} from '../utils/prescriptionStore';
import { soundFx } from '../utils/audio';

interface Props {
  language: Language;
  onLaunchPatientGame: () => void;
  onBackHome: () => void;
}

export const DASHBOARD_STRINGS: Record<
  Language,
  {
    title: string;
    subtitle: string;
    playNow: string;
    totalSessions: string;
    highScore: string;
    avgAccuracy: string;
    levelsProgress: string;
    historyTitle: string;
    dateCol: string;
    gameCol: string;
    scoreCol: string;
    accuracyCol: string;
    difficultyCol: string;
    clearHistory: string;
    confirmClear: string;
    noRecords: string;
    subtabs: {
      overview: string;
      prescriptions: string;
      improvement: string;
    };
    patientInfo: {
      title: string;
      patientName: string;
      age: string;
      doctor: string;
      emergency: string;
      allergies: string;
      importantNotes: string;
      saveDetails: string;
      savedSuccess: string;
    };
    prescriptions: {
      title: string;
      subtitle: string;
      addBtn: string;
      medName: string;
      dosage: string;
      timing: string;
      frequency: string;
      instructions: string;
      submitAdd: string;
      cancelAdd: string;
      markTaken: string;
      takenBadge: string;
      pendingBadge: string;
      emptyState: string;
    };
    improvement: {
      title: string;
      subtitle: string;
      patientInsightTitle: string;
      superpower: string;
      joyMeter: string;
      bestTime: string;
      quickBoostersTitle: string;
      sendSparkBtn: string;
      sparksSentLabel: string;
      weeklyMilestones: string;
    };
  }
> = {
  en: {
    title: "Caregiver Care & Progress Dashboard",
    subtitle: "Real-time cognitive progress across 60 levels, patient prescription management, and evidence-based improvement pathways.",
    playNow: "Play Patient Games",
    totalSessions: "Total Sessions",
    highScore: "Peak Memory Score",
    avgAccuracy: "Average Accuracy",
    levelsProgress: "60-Level Star Mastery",
    historyTitle: "Cognitive Game Session History",
    dateCol: "Date & Time",
    gameCol: "Cognitive Game",
    scoreCol: "Score",
    accuracyCol: "Accuracy",
    difficultyCol: "Level",
    clearHistory: "Clear History",
    confirmClear: "Are you sure you want to clear all recorded score history?",
    noRecords: "No cognitive sessions recorded yet. Start playing games to populate progress data!",
    subtabs: {
      overview: "Cognitive Progress & History",
      prescriptions: "Prescriptions & Patient Care",
      improvement: "How Patient Should Improve",
    },
    patientInfo: {
      title: "Patient Profile & Essential Directives",
      patientName: "Patient Name",
      age: "Patient Age",
      doctor: "Attending Doctor & Contact",
      emergency: "Emergency Contact",
      allergies: "Known Allergies & Sensitivities",
      importantNotes: "Important Care Notes & Precautions",
      saveDetails: "Save Patient Details",
      savedSuccess: "Patient details saved successfully!",
    },
    prescriptions: {
      title: "Active Prescriptions & Medication Directives",
      subtitle: "Add, review, and track daily medications, dosages, and important timing instructions.",
      addBtn: "Add Prescription",
      medName: "Medicine / Care Item Name",
      dosage: "Dosage (e.g., 5mg, 1 tablet, 250ml)",
      timing: "Timing (e.g., Morning after breakfast, Bedtime)",
      frequency: "Frequency (e.g., Once daily, Twice daily)",
      instructions: "Important Instructions (e.g., Take with warm water, avoid dairy)",
      submitAdd: "Save Prescription",
      cancelAdd: "Cancel",
      markTaken: "Mark Taken",
      takenBadge: "Taken Today ✓",
      pendingBadge: "Pending",
      emptyState: "No prescriptions added yet. Click 'Add Prescription' above to enter the patient's medications.",
    },
    improvement: {
      title: "How Patient Should Improve",
      subtitle: "Bite-sized, engaging guidance and creative patient insights tailored to memory play.",
      patientInsightTitle: "🌟 Creative Patient Insights & Brain Sparks",
      superpower: "Brain Superpower",
      joyMeter: "Joy & Smile Meter",
      bestTime: "Peak Alertness Time",
      quickBoostersTitle: "🎯 4 Quick Wins for Today (Bite-Sized)",
      sendSparkBtn: "Send High-Five & Cheering Love 💖",
      sparksSentLabel: "High-Fives Sent Today",
      weeklyMilestones: "Weekly Goal Milestones",
    },
  },
  bn: {
    title: "কেয়ারগিভার যত্ন ও স্মৃতি উন্নতি ড্যাশবোর্ড",
    subtitle: "৬০টি ধাপের খেলার অগ্রগতি, রোগীর প্রেসক্রিপশন পরিচালনা এবং উন্নতির ব্যক্তিগত পরিকল্পনা।",
    playNow: "খেলা শুরু করুন",
    totalSessions: "মোট সেশন",
    highScore: "সর্বোচ্চ স্কোর",
    avgAccuracy: "গড় নির্ভুলতা",
    levelsProgress: "৬০টি ধাপের স্টার সংখ্যা",
    historyTitle: "স্মৃতি খেলার সেশন ইতিহাস",
    dateCol: "তারিখ ও সময়",
    gameCol: "খেলার নাম",
    scoreCol: "স্কোর",
    accuracyCol: "নির্ভুলতা",
    difficultyCol: "ধাপ",
    clearHistory: "ইতিহাস মুছুন",
    confirmClear: "আপনি কি নিশ্চিতভাবে সব স্কোরের ইতিহাস মুছে ফেলতে চান?",
    noRecords: "এখনও কোনো খেলার তথ্য রেকর্ড করা হয়নি। তথ্য দেখতে খেলা শুরু করুন!",
    subtabs: {
      overview: "খেলার অগ্রগতি ও ইতিহাস",
      prescriptions: "প্রেসক্রিপশন ও রোগীর তথ্য",
      improvement: "কীভাবে উন্নতি করবেন",
    },
    patientInfo: {
      title: "রোগীর পরিচিতি ও গুরুত্বপূর্ণ নির্দেশনা",
      patientName: "রোগীর নাম",
      age: "রোগীর বয়স",
      doctor: "চিকিৎসক ও যোগাযোগ",
      emergency: "জরুরি যোগাযোগ",
      allergies: "অ্যালার্জি ও সাবধানতা",
      importantNotes: "গুরুত্বপূর্ণ পরিচর্যা ও নির্দেশিকা",
      saveDetails: "তথ্য সংরক্ষণ করুন",
      savedSuccess: "রোগীর তথ্য সফলভাবে সংরক্ষিত হয়েছে!",
    },
    prescriptions: {
      title: "চলমান প্রেসক্রিপশন ও ওষুধের তালিকা",
      subtitle: "রোগীর প্রতিদিনের ওষুধ, মাত্রা এবং সঠিক সময়সূচী যুক্ত ও নিরীক্ষণ করুন।",
      addBtn: "প্রেসক্রিপশন যোগ করুন",
      medName: "ওষুধের নাম",
      dosage: "মাত্রা (যেমন: ৫ মিগ্রা, ১টি ট্যাবলেট)",
      timing: "সময় (যেমন: সকালের জলখাবারের পর, রাতে)",
      frequency: "কতবার (যেমন: দিনে ১ বার)",
      instructions: "জরুরি নির্দেশ (যেমন: কুসুম গরম জল দিয়ে খাবেন)",
      submitAdd: "প্রেসক্রিপশন সংরক্ষণ করুন",
      cancelAdd: "বাতিল",
      markTaken: "খেয়েছেন চিহ্নিত করুন",
      takenBadge: "আজ খাওয়া হয়েছে ✓",
      pendingBadge: "বাকি আছে",
      emptyState: "এখনও কোনো প্রেসক্রিপশন যোগ করা হয়নি। ওষুধ যোগ করতে উপরের বোতামে চাপুন।",
    },
    improvement: {
      title: "রোগীর স্মৃতি উন্নতি ও বিশেষ ইনসাইট",
      subtitle: "খেলার অগ্রগতির ওপর ভিত্তি করে সংক্ষিপ্ত, কার্যকর ও আনন্দদায়ক পরামর্শ।",
      patientInsightTitle: "🌟 রোগীর সৃজনশীল ইনসাইট ও মস্তিষ্কের শক্তি",
      superpower: "মস্তিষ্কের বিশেষ দক্ষতা",
      joyMeter: "আনন্দ ও মনোযোগের মাত্রা",
      bestTime: "সবচেয়ে ভালো সময়",
      quickBoostersTitle: "🎯 আজকের ৪টি চটজলদি ব্রেন বুস্টার",
      sendSparkBtn: "ভালোবাসা ও হাই-ফাইভ পাঠান 💖",
      sparksSentLabel: "আজ পাঠানো হাই-ফাইভ",
      weeklyMilestones: "সাপ্তাহিক লক্ষ্যের অগ্রগতি",
    },
  },
  as: {
    title: "কেয়াৰগিভাৰ যত্ন আৰু অগ্ৰগতি ডেচবৰ্ড",
    subtitle: "৬০ টা স্তৰৰ খেলৰ ফলাফল, প্ৰেছক্ৰিপশ্বন নিৰীক্ষণ আৰু স্মৃতি বৃদ্ধিৰ পৰামৰ্শ।",
    playNow: "খেলিবলৈ যাওক",
    totalSessions: "মুঠ অধিৱেশন",
    highScore: "শীৰ্ষ স্কোৰ",
    avgAccuracy: "গড় শুদ্ধতা",
    levelsProgress: "৬০টা স্তৰৰ তৰা লাভ",
    historyTitle: "খেলৰ ইতিহাস",
    dateCol: "তাৰিখ আৰু সময়",
    gameCol: "খেলৰ নাম",
    scoreCol: "স্কোৰ",
    accuracyCol: "শুদ্ধতা",
    difficultyCol: "স্তৰ",
    clearHistory: "ইতিহাস মচক",
    confirmClear: "সকলো স্কোৰ ইতিহাস মচি পেলাব বিচাৰেনে?",
    noRecords: "এতিয়ালৈকে কোনো খেলৰ তথ্য লিপিবদ্ধ হোৱা নাই।",
    subtabs: {
      overview: "খেলৰ অগ্ৰগতি আৰু ইতিহাস",
      prescriptions: "প্ৰেছক্ৰিপশ্বন আৰু ৰোগীৰ তথ্য",
      improvement: "কেনেকৈ উন্নতি কৰিব",
    },
    patientInfo: {
      title: "ৰোগীৰ পৰিচয় আৰু গুৰুত্বপূৰ্ণ নিৰ্দেশনা",
      patientName: "ৰোগীৰ নাম",
      age: "ৰোগীৰ বয়স",
      doctor: "চিকিৎসক আৰু যোগাযোগ",
      emergency: "জৰুৰী যোগাযোগ",
      allergies: "এলাৰ্জি আৰু সাৱধানতা",
      importantNotes: "গুৰুত্বপূৰ্ণ যত্ন আৰু সাৱধানতা",
      saveDetails: "তথ্য সংৰক্ষণ কৰক",
      savedSuccess: "ৰোগীৰ তথ্য সংৰক্ষণ কৰা হ'ল!",
    },
    prescriptions: {
      title: "ৰোগীৰ প্ৰেছক্ৰিপশ্বন আৰু ঔষধ তালিকা",
      subtitle: "দৈনন্দিন ঔষধ, মাত্ৰা আৰু সময়ৰ সঠিক নিৰীক্ষণ কৰক।",
      addBtn: "প্ৰেছক্ৰিপশ্বন যোগ কৰক",
      medName: "ঔষধৰ নাম",
      dosage: "মাত্ৰা (যেনে: ৫ মি.গ্ৰা., ১টা টেবলেট)",
      timing: "সময় (যেনে: পুৱা চাহৰ পিছত, শোৱাৰ সময়ত)",
      frequency: "কিমানবাৰ (যেনে: দিনত এবাৰ)",
      instructions: "গুৰুত্বপূৰ্ণ নিৰ্দেশনা",
      submitAdd: "সংৰক্ষণ কৰক",
      cancelAdd: "বাতিল",
      markTaken: "খাইছে বুলি চিহ্নিত কৰক",
      takenBadge: "আজি খোৱা হ'ল ✓",
      pendingBadge: "বাকী আছে",
      emptyState: "এতিয়ালৈকে কোনো প্ৰেছক্ৰিপশ্বন যোগ কৰা হোৱা নাই।",
    },
    improvement: {
      title: "ৰোগীৰ স্মৃতি উন্নতি আৰু বিশেষ ইনচাইট",
      subtitle: "খেলৰ অগ্ৰগতিৰ ওপৰত ভিত্তি কৰি চমু, মনোগ্ৰাহী আৰু আনন্দদায়ক পৰামৰ্শ।",
      patientInsightTitle: "🌟 ৰোগীৰ সৃজনশীল ইনচাইট আৰু মগজুৰ শক্তি",
      superpower: "মগজুৰ বিশেষ পাৰদৰ্শিতা",
      joyMeter: "আনন্দ আৰু মনযোগৰ মাত্ৰা",
      bestTime: "সৰ্বাধিক সজাগতাৰ সময়",
      quickBoostersTitle: "🎯 আজিৰ ৪টা সহজ মগজুৰ অনুশীলন",
      sendSparkBtn: "মৰম আৰু হাই-ফাইভ পঠিয়াওক 💖",
      sparksSentLabel: "আজি পঠিওৱা হাই-ফাইভ",
      weeklyMilestones: "সাপ্তাহিক লক্ষ্যৰ অগ্ৰগতি",
    },
  },
  hi: {
    title: "केयरगिवर देखभाल व प्रगति डैशबोर्ड",
    subtitle: "६० स्तरों की संज्ञानात्मक प्रगति, मरीज के प्रिस्क्रिप्शन प्रबंधन एवं सुधार का व्यक्तिगत रोडमैप।",
    playNow: "मरीज खेल शुरू करें",
    totalSessions: "कुल सत्र",
    highScore: "सर्वोत्तम स्कोर",
    avgAccuracy: "औसत सटीकता",
    levelsProgress: "६० स्तरों के सितारे",
    historyTitle: "संज्ञानात्मक खेल सत्र इतिहास",
    dateCol: "दिनांक व समय",
    gameCol: "खेल का नाम",
    scoreCol: "स्कोर",
    accuracyCol: "सटीकता",
    difficultyCol: "स्तर",
    clearHistory: "इतिहास मिटाएं",
    confirmClear: "क्या आप सभी स्कोर इतिहास को मिटाना चाहते हैं?",
    noRecords: "अभी तक कोई सत्र रिकॉर्ड नहीं हुआ है। प्रगति देखने के लिए खेल खेलें!",
    subtabs: {
      overview: "संज्ञानात्मक प्रगति व इतिहास",
      prescriptions: "प्रिस्क्रिप्शन व मरीज का विवरण",
      improvement: "मरीज में सुधार कैसे लाएं",
    },
    patientInfo: {
      title: "मरीज का विवरण व आवश्यक निर्देश",
      patientName: "मरीज का नाम",
      age: "मरीज की आयु",
      doctor: "चिकित्सक व संपर्क",
      emergency: "आपातकालीन संपर्क",
      allergies: "एलर्जी व संवेदनशीलता",
      importantNotes: "महत्वपूर्ण देखभाल निर्देश व सावधानियां",
      saveDetails: "विवरण सुरक्षित करें",
      savedSuccess: "मरीज का विवरण सफलतापूर्वक सुरक्षित हुआ!",
    },
    prescriptions: {
      title: "सक्रिय प्रिस्क्रिप्शन व दवा सूची",
      subtitle: "मरीज की दैनिक दवाइयां, खुराक और समय का आसान प्रबंधन करें।",
      addBtn: "प्रिस्क्रिप्शन जोड़ें",
      medName: "दवा का नाम",
      dosage: "खुराक (जैसे: 5mg, 1 गोली)",
      timing: "समय (जैसे: सुबह नाश्ते के बाद, रात को सोने से पहले)",
      frequency: "आवृत्ति (जैसे: दिन में एक बार)",
      instructions: "विशेष निर्देश (जैसे: गुनगुने पानी से लें)",
      submitAdd: "प्रिस्क्रिप्शन सुरक्षित करें",
      cancelAdd: "रद्द करें",
      markTaken: "दवा ले ली गई",
      takenBadge: "आज ली गई ✓",
      pendingBadge: "लंबित",
      emptyState: "अभी कोई प्रिस्क्रिप्शन नहीं जोड़ा गया है। ऊपर दिए गए बटन से दवाएं जोड़ें।",
    },
    improvement: {
      title: "मरीज स्मृति सुधार व रचनात्मक इनसाइट्स",
      subtitle: "संज्ञानात्मक खेल के आधार पर संक्षिप्त, रोचक और प्रभावी मार्गदर्शन।",
      patientInsightTitle: "🌟 मरीज की रचनात्मक इनसाइट्स व मस्तिष्क शक्ति",
      superpower: "मस्तिष्क की विशेष शक्ति",
      joyMeter: "प्रसन्नता व एकाग्रता स्तर",
      bestTime: "श्रेष्ठ एकाग्रता का समय",
      quickBoostersTitle: "🎯 आज के ४ त्वरित ब्रेन बूस्टर",
      sendSparkBtn: "प्यार और हाई-फाइव भेजें 💖",
      sparksSentLabel: "आज भेजे गए हाई-फाइव",
      weeklyMilestones: "साप्ताहिक लक्ष्य मील के पत्थर",
    },
  },
};

export const CaregiverDashboard: React.FC<Props> = ({
  language,
  onLaunchPatientGame,
  onBackHome,
}) => {
  const [scores, setScores] = useState<GameScoreRecord[]>([]);
  const [g1Levels, setG1Levels] = useState<GameLevelStatus[]>([]);
  const [g2Levels, setG2Levels] = useState<GameLevelStatus[]>([]);
  const [g3Levels, setG3Levels] = useState<GameLevelStatus[]>([]);
  const [g4Levels, setG4Levels] = useState<GameLevelStatus[]>([]);
  const [g5Levels, setG5Levels] = useState<GameLevelStatus[]>([]);
  const [g6Levels, setG6Levels] = useState<GameLevelStatus[]>([]);

  // Subtabs: 'overview' | 'prescriptions' | 'improvement'
  const [activeSubtab, setActiveSubtab] = useState<'overview' | 'prescriptions' | 'improvement'>('overview');

  // Patient Details State
  const [patientDetails, setPatientDetailsState] = useState<PatientDetails>(getPatientDetails);
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [patientSaveMsg, setPatientSaveMsg] = useState<string | null>(null);

  // Prescriptions State
  const [prescriptions, setPrescriptionsState] = useState<PrescriptionItem[]>(getPrescriptions);
  const [showAddRxForm, setShowAddRxForm] = useState(false);
  const [newRx, setNewRx] = useState({
    medicineName: '',
    dosage: '',
    timing: 'Morning after breakfast',
    frequency: 'Once daily',
    instructions: '',
  });

  // Interactive High-Five / Love Sparks
  const [sparksSent, setSparksSent] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('smriti_sparks_sent');
      return saved ? parseInt(saved, 10) : 3;
    } catch {
      return 3;
    }
  });
  const [showSparkCelebration, setShowSparkCelebration] = useState(false);

  const handleSendSpark = () => {
    const next = sparksSent + 1;
    setSparksSent(next);
    try {
      localStorage.setItem('smriti_sparks_sent', next.toString());
    } catch {}
    soundFx.playCelebration();
    setShowSparkCelebration(true);
    setTimeout(() => setShowSparkCelebration(false), 2400);
  };

  // Interactive Quick Brain Booster Toggles
  const [completedBoosters, setCompletedBoosters] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('smriti_quick_boosters');
      return saved ? JSON.parse(saved) : { b1: true, b2: false, b3: false, b4: false };
    } catch {
      return { b1: true, b2: false, b3: false, b4: false };
    }
  });

  const toggleBooster = (id: string) => {
    const updated = { ...completedBoosters, [id]: !completedBoosters[id] };
    setCompletedBoosters(updated);
    try {
      localStorage.setItem('smriti_quick_boosters', JSON.stringify(updated));
    } catch {}
    soundFx.playStarDing(1);
  };

  const strings = DASHBOARD_STRINGS[language];

  const reloadData = async () => {
    const local = getStoredScores();
    setScores(local);
    setG1Levels(getGameLevelsStatus('cultural-match'));
    setG2Levels(getGameLevelsStatus('pattern-harmony'));
    setG3Levels(getGameLevelsStatus('daily-association'));
    setG4Levels(getGameLevelsStatus('my-home'));
    setG5Levels(getGameLevelsStatus('sort-it-out'));
    setG6Levels(getGameLevelsStatus('who-is-this'));

    setPatientDetailsState(getPatientDetails());
    setPrescriptionsState(getPrescriptions());

    if (isSupabaseConfigured()) {
      const cloud = await fetchScoresFromSupabase();
      if (cloud && cloud.length > 0) {
        const existingTimestamps = new Set(local.map((s) => s.dateFormatted));
        const newFromCloud = cloud.filter((c) => !existingTimestamps.has(c.dateFormatted));
        if (newFromCloud.length > 0) {
          setScores([...local, ...newFromCloud]);
        }
      }
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const stats = computeScoreSummary(scores);

  const allLevels = [
    ...g1Levels,
    ...g2Levels,
    ...g3Levels,
    ...g4Levels,
    ...g5Levels,
    ...g6Levels,
  ];
  const totalStars = allLevels.reduce((acc, l) => acc + l.stars, 0);
  const totalUnlocked = allLevels.filter((l) => l.unlocked).length;

  const handleClear = () => {
    if (window.confirm(strings.confirmClear)) {
      clearStoredScores();
      setScores([]);
      soundFx.playCardFlip();
    }
  };

  const handleSavePatientDetails = (e: React.FormEvent) => {
    e.preventDefault();
    savePatientDetails(patientDetails);
    setIsEditingPatient(false);
    setPatientSaveMsg(strings.patientInfo.savedSuccess);
    soundFx.playCelebration();
    setTimeout(() => setPatientSaveMsg(null), 3500);
  };

  const handleAddPrescriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRx.medicineName.trim()) return;

    addPrescription({
      medicineName: newRx.medicineName.trim(),
      dosage: newRx.dosage.trim() || '1 Dose',
      timing: newRx.timing.trim() || 'Daily',
      frequency: newRx.frequency.trim() || 'Once daily',
      instructions: newRx.instructions.trim() || 'Follow prescribed routine',
    });

    setPrescriptionsState(getPrescriptions());
    setNewRx({
      medicineName: '',
      dosage: '',
      timing: 'Morning after breakfast',
      frequency: 'Once daily',
      instructions: '',
    });
    setShowAddRxForm(false);
    soundFx.playCelebration();
  };

  const handleToggleRx = (id: string) => {
    togglePrescriptionTaken(id);
    setPrescriptionsState(getPrescriptions());
    soundFx.playStarDing(1);
  };

  const handleDeleteRx = (id: string) => {
    if (window.confirm('Delete this prescription item?')) {
      deletePrescription(id);
      setPrescriptionsState(getPrescriptions());
      soundFx.playCardFlip();
    }
  };

  // Compute Creative & Fun Cognitive Improvement Insights based on scores
  const getImprovementInsights = () => {
    const accuracy = stats.avgAccuracy;
    const sessionCount = stats.totalSessions;

    // Vitality index (0 - 100)
    let vitalityScore = 78;
    if (accuracy >= 85) vitalityScore = 94;
    else if (accuracy >= 70) vitalityScore = 88;
    else if (accuracy >= 50) vitalityScore = 76;
    else vitalityScore = 64;

    if (sessionCount >= 5) vitalityScore = Math.min(99, vitalityScore + 5);
    else if (sessionCount === 0) vitalityScore = 72;

    // Superpower determination based on highest completed levels
    let superpower = language === 'bn'
      ? 'দৃশ্যস্মৃতি ও সাংস্কৃতিক প্রতীক মেলানোর জাদুকর'
      : language === 'as'
      ? 'দৃশ্যস্মৃতি আৰু চিনাকি প্ৰতীক মিলোৱাৰ পাকৈত'
      : language === 'hi'
      ? 'सांस्कृतिक प्रतीक व दृश्य स्मृति के उस्ताद'
      : 'Visual Cultural Memory Maestro';
    let superpowerEmoji = '🎴';

    if (g2Levels.some((l) => l.completed)) {
      superpower = language === 'bn'
        ? 'সুর ও ছন্দের সঙ্গীত অনুরাগী'
        : language === 'as'
        ? 'সুৰ আৰু ছন্দৰ সংগীত প্ৰেমী'
        : language === 'hi'
        ? 'सुर व ताल के संगीत प्रेमी'
        : 'Melodic Rhythm Champion';
      superpowerEmoji = '🎵';
    } else if (g3Levels.some((l) => l.completed)) {
      superpower = language === 'bn'
        ? 'দৈনন্দিন রুটিন ও চায়ের অনুষঙ্গ পারদর্শী'
        : language === 'as'
        ? 'দৈনন্দিন চাহ আৰু ৰুটিনৰ সংগী বিশেষজ্ঞ'
        : language === 'hi'
        ? 'दैनिक दिनचर्या व चाय साहचर्य विशेषज्ञ'
        : 'Daily Routine Champion';
      superpowerEmoji = '☕';
    }

    const joyMeter = Math.min(98, Math.max(84, Math.round(vitalityScore * 0.94 + sessionCount * 2)));

    const mimiCheer = language === 'bn'
      ? `${patientDetails.name || 'রোগী'} আজ স্মৃতির চেনা কার্ড দেখে খুব হেসেছেন! পারিবারিক গল্প বলার আনন্দ জারি রাখুন। 🌸`
      : language === 'as'
      ? `${patientDetails.name || 'ৰোগী'} আজি খেলবোৰত খুব সুখী হৈছিল! মৰম আৰু প্ৰেৰণা দি থাকক। 🌸`
      : language === 'hi'
      ? `${patientDetails.name || 'मरीज'} आज स्मृति कार्ड देखकर बहुत मुस्कुराए! प्यार और अपनेपन का यह माहौल बनाए रखें। 🌸`
      : `${patientDetails.name || 'The patient'} had bright smiles during cultural card recognition! Keep the warm family storytelling flowing. 🌸`;

    return {
      vitalityScore,
      accuracyTier: accuracy >= 75 ? 'Top Consistency ⭐' : accuracy >= 50 ? 'Steady Rhythm 🌿' : 'Gentle Pacing 🌸',
      suggestedPacing: accuracy < 60 ? '⏱️ 10-15s per turn with soft smiles' : '⏱️ Standard comfortable rhythm',
      superpower,
      superpowerEmoji,
      joyMeter,
      mimiCheer,
      bestTime: '🌅 8:30 AM - 10:30 AM (Morning Chai Time)',
    };
  };

  const insights = getImprovementInsights();

  return (
    <div className="w-full max-w-5xl mx-auto py-4 px-3 sm:px-6 font-fun">
      {/* Top Header Card */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-5 bg-white/80 backdrop-blur-xl rounded-3xl p-4 border border-white/90 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="btn-caregiver-back-home"
            onClick={onBackHome}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#fdf2eb] hover:bg-[#fae6db] text-[#6b3528] font-bold text-xs sm:text-sm transition-all border border-[#f0d8cc] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'bn' ? 'হোমে ফিরুন' : language === 'as' ? 'হোমলৈ উভতক' : language === 'hi' ? 'होम पेज' : 'Back Home'}</span>
          </button>

          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-[#df735a]" />
            <span>Caregiver Care & Progress Analysis</span>
          </span>
        </div>

        {/* Action Button: Play Patient Games */}
        <button
          type="button"
          id="btn-switch-to-patient-mode"
          onClick={onLaunchPatientGame}
          className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#df735a] hover:bg-[#c95d45] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>{strings.playNow}</span>
        </button>
      </header>

      {/* Main Title & Subtitle */}
      <div className="text-center sm:text-left mb-5">
        <h2 className="text-2xl sm:text-3xl font-black text-[#3d1f30] tracking-tight mb-1">
          {strings.title}
        </h2>
        <p className="text-xs sm:text-sm text-[#6c4856] max-w-3xl">
          {strings.subtitle}
        </p>
      </div>

      {/* 3 CLEAN REFACTORED SUB-TABS */}
      <nav aria-label="Caregiver dashboard sections" className="flex flex-wrap items-center gap-2 mb-5 bg-white/75 backdrop-blur-md p-1.5 rounded-2xl border border-white/80 shadow-2xs">
        <button
          type="button"
          id="tab-overview"
          onClick={() => setActiveSubtab('overview')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubtab === 'overview'
              ? 'bg-[#df735a] text-white shadow-xs font-black'
              : 'text-stone-700 hover:bg-white/80'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{strings.subtabs.overview}</span>
        </button>

        <button
          type="button"
          id="tab-prescriptions"
          onClick={() => setActiveSubtab('prescriptions')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubtab === 'prescriptions'
              ? 'bg-[#df735a] text-white shadow-xs font-black'
              : 'text-stone-700 hover:bg-white/80'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>{strings.subtabs.prescriptions}</span>
          {prescriptions.some((p) => !p.takenToday) && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>

        <button
          type="button"
          id="tab-improvement"
          onClick={() => setActiveSubtab('improvement')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubtab === 'improvement'
              ? 'bg-[#df735a] text-white shadow-xs font-black'
              : 'text-stone-700 hover:bg-white/80'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>{strings.subtabs.improvement}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
            AI Guidance
          </span>
        </button>
      </nav>

      {/* -------------------- SUBTAB 1: OVERVIEW & 60-LEVEL PROGRESS -------------------- */}
      {activeSubtab === 'overview' && (
        <section aria-labelledby="section-overview-heading">
          <h3 id="section-overview-heading" className="sr-only">{strings.subtabs.overview}</h3>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {/* Card 1: Total Sessions */}
            <div className="p-4 rounded-3xl bg-amber-50/90 border border-amber-200/80 shadow-xs flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 mb-2">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-0.5">
                {strings.totalSessions}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-amber-950">
                {stats.totalSessions}
              </span>
              <span className="text-[10px] text-amber-700 mt-0.5">Completed sessions</span>
            </div>

            {/* Card 2: Peak Score */}
            <div className="p-4 rounded-3xl bg-rose-50/90 border border-rose-200/80 shadow-xs flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-700 mb-2">
                <Star className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider mb-0.5">
                {strings.highScore}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-rose-950">
                {stats.highScore}
              </span>
              <span className="text-[10px] text-rose-700 mt-0.5">Peak memory points</span>
            </div>

            {/* Card 3: Accuracy */}
            <div className="p-4 rounded-3xl bg-emerald-50/90 border border-emerald-200/80 shadow-xs flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-2">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider mb-0.5">
                {strings.avgAccuracy}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-950">
                {stats.avgAccuracy}%
              </span>
              <span className="text-[10px] text-emerald-700 mt-0.5">Correct match rate</span>
            </div>

            {/* Card 4: 60-Level Mastered Stars */}
            <div className="p-4 rounded-3xl bg-purple-50/90 border border-purple-200/80 shadow-xs flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-700 mb-2">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider mb-0.5">
                {strings.levelsProgress}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-purple-950">
                {totalStars} / 180 ⭐
              </span>
              <span className="text-[10px] text-purple-700 mt-0.5">{totalUnlocked} / 60 levels unlocked</span>
            </div>
          </div>

          {/* 6 Cognitive Domain Level Cards */}
          <div className="mb-5">
            <h3 className="text-base font-black text-[#3d1f30] mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#df735a]" />
              <span>Cognitive Domain Mastery (6 Games × 10 Levels = 60 Levels)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { title: '1. Cultural Memory Match', icon: '🎴', levels: g1Levels, domain: 'Visual & Nostalgic Memory' },
                { title: '2. Sound & Melody Harmony', icon: '🎵', levels: g2Levels, domain: 'Auditory & Sequence Focus' },
                { title: '3. Daily Routine Association', icon: '🤝', levels: g3Levels, domain: 'Daily Habit Recall' },
                { title: '4. My Home Spatial Search', icon: '🏡', levels: g4Levels, domain: 'Spatial & Room Awareness' },
                { title: '5. Sort It Out Category', icon: '🧺', levels: g5Levels, domain: 'Executive Organization' },
                { title: '6. Who Is This Affection', icon: '❤️', levels: g6Levels, domain: 'Facial & Family Recognition' },
              ].map((game, idx) => {
                const unlockedCount = game.levels.filter((l) => l.unlocked).length;
                const earnedStars = game.levels.reduce((acc, l) => acc + l.stars, 0);
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white/80 border border-stone-200/90 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">{game.icon}</span>
                        <span className="text-xs font-black text-[#df735a]">
                          {earnedStars} / 30 ⭐
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#3d1f30] leading-snug">
                        {game.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 mb-2">{game.domain}</p>
                    </div>

                    <div>
                      <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden mb-1">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-[#df735a] h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(10, (unlockedCount / 10) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-stone-600 font-semibold block text-right">
                        {unlockedCount} / 10 Levels Unlocked
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Session History Table */}
          <div className="w-full p-4 sm:p-5 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/90 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-black text-[#3d1f30]">
                {strings.historyTitle}
              </h3>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={reloadData}
                  title="Refresh data"
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                {scores.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClear}
                    title={strings.clearHistory}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{strings.clearHistory}</span>
                  </button>
                )}
              </div>
            </div>

            {scores.length === 0 ? (
              <p className="text-xs sm:text-sm text-stone-500 italic py-6 text-center">
                {strings.noRecords}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 text-[#8c5040] font-black uppercase text-[10px] tracking-wider">
                      <th className="py-2 px-3">{strings.dateCol}</th>
                      <th className="py-2 px-3">{strings.gameCol}</th>
                      <th className="py-2 px-3">{strings.scoreCol}</th>
                      <th className="py-2 px-3">{strings.accuracyCol}</th>
                      <th className="py-2 px-3">{strings.difficultyCol}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {scores.slice(0, 15).map((record) => (
                      <tr key={record.id} className="hover:bg-amber-50/40 transition-colors">
                        <td className="py-2.5 px-3 text-stone-500 whitespace-nowrap">
                          {record.dateFormatted}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#3d1f30]">
                          {record.gameType}
                        </td>
                        <td className="py-2.5 px-3 font-black text-[#df735a]">
                          {record.score}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold ${
                              record.accuracy >= 80
                                ? 'bg-emerald-100 text-emerald-800'
                                : record.accuracy >= 50
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {record.accuracy}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-stone-500 whitespace-nowrap">
                          {record.difficulty}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* -------------------- SUBTAB 2: PRESCRIPTIONS & PATIENT CARE DETAILS -------------------- */}
      {activeSubtab === 'prescriptions' && (
        <section aria-labelledby="section-prescriptions-heading" className="space-y-5">
          <h3 id="section-prescriptions-heading" className="sr-only">{strings.subtabs.prescriptions}</h3>
          {/* Patient Details & Important Things Card */}
          <div className="w-full p-5 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/90 shadow-sm text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-stone-200/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 text-[#df735a] flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#3d1f30]">
                    {strings.patientInfo.title}
                  </h3>
                  <p className="text-xs text-stone-600">
                    Patient Name, Age, and essential care precautions for daily well-being.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingPatient(!isEditingPatient)}
                className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 self-start transition-all cursor-pointer"
              >
                {isEditingPatient ? <Save className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                <span>{isEditingPatient ? 'Done Editing' : 'Edit Patient Info'}</span>
              </button>
            </div>

            {patientSaveMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{patientSaveMsg}</span>
              </div>
            )}

            {isEditingPatient ? (
              <form onSubmit={handleSavePatientDetails} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-stone-600 uppercase block mb-1">
                      {strings.patientInfo.patientName} *
                    </label>
                    <input
                      type="text"
                      required
                      value={patientDetails.name}
                      onChange={(e) => setPatientDetailsState({ ...patientDetails, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold text-[#3d1f30] focus:ring-2 focus:ring-[#df735a] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-600 uppercase block mb-1">
                      {strings.patientInfo.age} *
                    </label>
                    <input
                      type="text"
                      required
                      value={patientDetails.age}
                      onChange={(e) => setPatientDetailsState({ ...patientDetails, age: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold text-[#3d1f30] focus:ring-2 focus:ring-[#df735a] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-600 uppercase block mb-1">
                      Blood Group
                    </label>
                    <input
                      type="text"
                      value={patientDetails.bloodGroup}
                      onChange={(e) => setPatientDetailsState({ ...patientDetails, bloodGroup: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold text-[#3d1f30] focus:ring-2 focus:ring-[#df735a] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-600 uppercase block mb-1">
                      {strings.patientInfo.doctor}
                    </label>
                    <input
                      type="text"
                      value={patientDetails.doctorName}
                      onChange={(e) => setPatientDetailsState({ ...patientDetails, doctorName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold text-[#3d1f30] focus:ring-2 focus:ring-[#df735a] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-600 uppercase block mb-1">
                      {strings.patientInfo.emergency}
                    </label>
                    <input
                      type="text"
                      value={patientDetails.emergencyContact}
                      onChange={(e) => setPatientDetailsState({ ...patientDetails, emergencyContact: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold text-[#3d1f30] focus:ring-2 focus:ring-[#df735a] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-600 uppercase block mb-1">
                      {strings.patientInfo.allergies}
                    </label>
                    <input
                      type="text"
                      value={patientDetails.allergies}
                      onChange={(e) => setPatientDetailsState({ ...patientDetails, allergies: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold text-[#3d1f30] focus:ring-2 focus:ring-[#df735a] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#b9442e] uppercase block mb-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{strings.patientInfo.importantNotes} *</span>
                  </label>
                  <textarea
                    rows={3}
                    value={patientDetails.importantNotes}
                    onChange={(e) => setPatientDetailsState({ ...patientDetails, importantNotes: e.target.value })}
                    placeholder="Enter key dietary precautions, daily hydration minimums, doctor advice, and memory cueing tips..."
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-amber-300 bg-amber-50/50 text-xs font-medium text-stone-800 focus:ring-2 focus:ring-[#df735a] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#df735a] hover:bg-[#c95d45] text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{strings.patientInfo.saveDetails}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block mb-0.5">
                      {strings.patientInfo.patientName} & {strings.patientInfo.age}
                    </span>
                    <p className="text-base font-black text-[#3d1f30]">
                      {patientDetails.name}{' '}
                      <span className="text-xs font-bold text-[#df735a] px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200">
                        Age: {patientDetails.age}
                      </span>
                    </p>
                    <span className="text-[11px] text-stone-500 mt-1 block">
                      Blood Group: <strong>{patientDetails.bloodGroup || 'Not specified'}</strong>
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block mb-0.5">
                      Attending Physician & Contact
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-stone-900">
                      {patientDetails.doctorName}
                    </p>
                    <span className="text-[11px] text-stone-600 block mt-0.5">
                      {patientDetails.doctorContact}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block mb-0.5">
                      Emergency Contact & Allergies
                    </span>
                    <p className="text-xs font-bold text-stone-900">
                      {patientDetails.emergencyContact}
                    </p>
                    <span className="text-[11px] text-rose-700 font-semibold block mt-0.5">
                      Allergies: {patientDetails.allergies || 'None recorded'}
                    </span>
                  </div>
                </div>

                {/* Important Things Callout */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/80 border border-amber-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">
                    <AlertCircle className="w-4 h-4 text-[#df735a]" />
                    <span>Important Things & Special Care Notes</span>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
                    {patientDetails.importantNotes}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Prescriptions Adding & Management Card */}
          <div className="w-full p-5 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/90 shadow-sm text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base sm:text-lg font-black text-[#3d1f30]">
                    {strings.prescriptions.title}
                  </h3>
                </div>
                <p className="text-xs text-stone-600">
                  {strings.prescriptions.subtitle}
                </p>
              </div>

              <button
                type="button"
                id="btn-add-prescription"
                onClick={() => setShowAddRxForm(!showAddRxForm)}
                className="px-4 py-2 rounded-2xl bg-[#df735a] hover:bg-[#c95d45] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 self-start cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{strings.prescriptions.addBtn}</span>
              </button>
            </div>

            {/* Add Prescription Modal / Form */}
            {showAddRxForm && (
              <div className="mb-5 p-4 sm:p-5 rounded-3xl bg-amber-50/90 border border-amber-200 animate-fade-in">
                <h4 className="text-sm font-black text-[#3d1f30] mb-3 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-[#df735a]" />
                  <span>New Prescription Entry for {patientDetails.name} (Age: {patientDetails.age})</span>
                </h4>

                <form onSubmit={handleAddPrescriptionSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        {strings.prescriptions.medName} *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Donepezil 5mg, Multivitamin, BP tablet"
                        value={newRx.medicineName}
                        onChange={(e) => setNewRx({ ...newRx, medicineName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-medium focus:ring-2 focus:ring-[#df735a] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        {strings.prescriptions.dosage}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 5 mg, 1 tablet, 250 ml"
                        value={newRx.dosage}
                        onChange={(e) => setNewRx({ ...newRx, dosage: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-medium focus:ring-2 focus:ring-[#df735a] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        {strings.prescriptions.timing}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Morning after breakfast, 8:00 PM Bedtime"
                        value={newRx.timing}
                        onChange={(e) => setNewRx({ ...newRx, timing: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-medium focus:ring-2 focus:ring-[#df735a] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        {strings.prescriptions.frequency}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Once daily, Twice daily, As needed"
                        value={newRx.frequency}
                        onChange={(e) => setNewRx({ ...newRx, frequency: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-medium focus:ring-2 focus:ring-[#df735a] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">
                      {strings.prescriptions.instructions}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Take with warm water after food. Do not skip."
                      value={newRx.instructions}
                      onChange={(e) => setNewRx({ ...newRx, instructions: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-medium focus:ring-2 focus:ring-[#df735a] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddRxForm(false)}
                      className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
                    >
                      {strings.prescriptions.cancelAdd}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>{strings.prescriptions.submitAdd}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Prescriptions List */}
            {prescriptions.length === 0 ? (
              <p className="text-xs sm:text-sm text-stone-500 italic py-8 text-center">
                {strings.prescriptions.emptyState}
              </p>
            ) : (
              <div className="space-y-3">
                {prescriptions.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      item.takenToday
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : 'bg-white border-stone-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleRx(item.id)}
                        className={`w-6 h-6 mt-0.5 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                          item.takenToday
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'border-stone-300 bg-stone-50 hover:border-[#df735a]'
                        }`}
                        title={item.takenToday ? 'Mark as not taken' : 'Mark as taken'}
                      >
                        {item.takenToday && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-black text-stone-900">
                            {item.medicineName}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                            {item.dosage}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-medium text-[10px]">
                            {item.timing}
                          </span>
                          <span className="text-[10px] text-stone-500 font-medium">
                            ({item.frequency})
                          </span>
                        </div>

                        {item.instructions && (
                          <p className="text-[11px] text-stone-600 mt-1">
                            ℹ️ {item.instructions}
                          </p>
                        )}
                        <span className="text-[10px] text-stone-400 block mt-0.5">
                          Date Prescribed: {item.datePrescribed}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleToggleRx(item.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          item.takenToday
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                        }`}
                      >
                        {item.takenToday ? strings.prescriptions.takenBadge : strings.prescriptions.markTaken}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteRx(item.id)}
                        title="Delete prescription"
                        className="p-1.5 rounded-xl hover:bg-rose-100 text-stone-400 hover:text-rose-600 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* -------------------- SUBTAB 3: HOW PATIENT SHOULD IMPROVE (SHORT, CREATIVE & FUN) -------------------- */}
      {activeSubtab === 'improvement' && (
        <section aria-labelledby="section-improvement-heading" className="space-y-4">
          <h3 id="section-improvement-heading" className="sr-only">{strings.subtabs.improvement}</h3>

          {/* Top Quick Status Banner */}
          <div className="w-full p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/80 shadow-xs text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#3d1f30] flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#df735a]" />
                  <span>{strings.improvement.title}</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {strings.improvement.subtitle}
                </p>
              </div>

              {/* Patient Badge */}
              <div className="flex items-center gap-2 self-start sm:self-center px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-900 font-bold text-xs">
                <span>👤</span>
                <span>{patientDetails.name}</span>
                <span className="text-rose-400">|</span>
                <span>{patientDetails.age} yrs</span>
              </div>
            </div>

            {/* 3 Short Metric Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Vitality Gauge */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-stone-600">Cognitive Vitality</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    {insights.accuracyTier}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-[#df735a]">{insights.vitalityScore}%</span>
                  <span className="text-[10px] text-stone-500 font-medium">overall spark</span>
                </div>
                <div className="w-full bg-amber-100 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="bg-[#df735a] h-full rounded-full transition-all duration-500"
                    style={{ width: `${insights.vitalityScore}%` }}
                  />
                </div>
              </div>

              {/* Comfort Pacing */}
              <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200">
                <span className="text-[11px] font-bold text-stone-600 block mb-1">Comfort Pacing</span>
                <div className="text-xs sm:text-sm font-black text-[#3d1f30]">
                  {insights.suggestedPacing}
                </div>
                <p className="text-[10px] text-stone-500 mt-1.5">
                  Keep smiling, zero rush, patient reassurance.
                </p>
              </div>

              {/* Joy & Smile Index */}
              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-stone-600">{strings.improvement.joyMeter}</span>
                  <span className="text-sm">😊</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-rose-600">{insights.joyMeter}%</span>
                  <span className="text-[10px] text-stone-500 font-medium">positive response</span>
                </div>
                <p className="text-[10px] text-stone-500 mt-1.5">
                  Smiles recorded during memory & music games.
                </p>
              </div>
            </div>
          </div>

          {/* 🌟 CREATIVE PATIENT INSIGHTS & BRAIN SPARKS CARD */}
          <div className="w-full p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-50/90 via-rose-50/90 to-purple-50/90 border border-amber-300 shadow-sm text-left relative overflow-hidden">
            {/* Celebration Confetti Effect when High-Five sent */}
            {showSparkCelebration && (
              <div className="absolute inset-0 bg-[#df735a]/10 backdrop-blur-2xs flex items-center justify-center z-20 animate-fade-in pointer-events-none">
                <div className="px-5 py-2.5 rounded-full bg-white shadow-lg border border-amber-300 text-sm font-black text-[#df735a] flex items-center gap-2 animate-bounce">
                  <span>🎉 High-Five Delivered to {patientDetails.name}! ⭐</span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
              <h4 className="text-sm sm:text-base font-black text-[#3d1f30] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>{strings.improvement.patientInsightTitle}</span>
              </h4>

              {/* High-Fives Sent Badge */}
              <span className="self-start sm:self-center px-3 py-1 rounded-full bg-white/90 border border-amber-200 text-amber-900 font-black text-xs flex items-center gap-1.5 shadow-2xs">
                <span>⭐</span>
                <span>{sparksSent} {strings.improvement.sparksSentLabel}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3.5">
              {/* Superpower Highlight */}
              <div className="p-3.5 rounded-2xl bg-white/95 border border-amber-200 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block mb-1">
                  {strings.improvement.superpower}
                </span>
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{insights.superpowerEmoji}</span>
                  <div>
                    <h5 className="text-xs sm:text-sm font-black text-[#3d1f30]">
                      {insights.superpower}
                    </h5>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Natural strength in recognizing heritage patterns & visual cues.
                    </p>
                  </div>
                </div>
              </div>

              {/* Peak Brain Window */}
              <div className="p-3.5 rounded-2xl bg-white/95 border border-purple-200 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-purple-800 tracking-wider block mb-1">
                  {strings.improvement.bestTime}
                </span>
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🌅</span>
                  <div>
                    <h5 className="text-xs sm:text-sm font-black text-[#3d1f30]">
                      {insights.bestTime}
                    </h5>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Highest alertness & mood after morning tea & sunlight.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mimi's Playful Cheer Speech Bubble & Interactive High-Five Button */}
            <div className="p-3 sm:p-4 rounded-2xl bg-white/90 border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-2xl sm:text-3xl flex-shrink-0 animate-pulse">🐾</span>
                <p className="text-xs sm:text-sm text-stone-700 italic font-medium leading-snug">
                  "{insights.mimiCheer}"
                </p>
              </div>

              {/* Interactive High-Five Button */}
              <button
                type="button"
                id="btn-send-patient-highfive"
                onClick={handleSendSpark}
                className="w-full sm:w-auto flex-shrink-0 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#df735a] to-[#c95d45] hover:from-[#c95d45] hover:to-[#b34c36] text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                title="Send positive cheer and high-five to patient"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>{strings.improvement.sendSparkBtn}</span>
              </button>
            </div>
          </div>

          {/* 🎯 4 QUICK WINS FOR TODAY (BITE-SIZED & INTERACTIVE) */}
          <div className="w-full p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/80 shadow-xs text-left">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <h4 className="text-xs sm:text-sm font-black text-[#3d1f30] flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span>{strings.improvement.quickBoostersTitle}</span>
                </h4>
                <p className="text-[11px] text-stone-500">
                  Tap to complete today's gentle cognitive exercises.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                {Object.values(completedBoosters).filter(Boolean).length} / 4 Done
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Booster 1: Morning Match */}
              <button
                type="button"
                onClick={() => toggleBooster('b1')}
                className={`p-3 rounded-2xl border text-left transition-all flex items-start justify-between gap-2 cursor-pointer ${
                  completedBoosters.b1
                    ? 'bg-emerald-50/80 border-emerald-300'
                    : 'bg-stone-50/80 hover:bg-stone-100 border-stone-200'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-xl">🎴</span>
                  <div>
                    <h5 className="text-xs font-black text-stone-900">
                      1. Morning Cultural Match (5 min)
                    </h5>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      Play 1 relaxed round with morning tea to spark visual recall.
                    </p>
                  </div>
                </div>
                <div className={`w-5 h-5 mt-0.5 rounded-full flex items-center justify-center border transition-all flex-shrink-0 ${
                  completedBoosters.b1 ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300 bg-white'
                }`}>
                  {completedBoosters.b1 && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>

              {/* Booster 2: Music & Rhythm Tap */}
              <button
                type="button"
                onClick={() => toggleBooster('b2')}
                className={`p-3 rounded-2xl border text-left transition-all flex items-start justify-between gap-2 cursor-pointer ${
                  completedBoosters.b2
                    ? 'bg-purple-50/80 border-purple-300'
                    : 'bg-stone-50/80 hover:bg-stone-100 border-stone-200'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-xl">🎵</span>
                  <div>
                    <h5 className="text-xs font-black text-stone-900">
                      2. Melody & Rhythm Tap (5 min)
                    </h5>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      Play favorite folk/raga track and tap fingers gently to rhythm.
                    </p>
                  </div>
                </div>
                <div className={`w-5 h-5 mt-0.5 rounded-full flex items-center justify-center border transition-all flex-shrink-0 ${
                  completedBoosters.b2 ? 'bg-purple-600 border-purple-600 text-white' : 'border-stone-300 bg-white'
                }`}>
                  {completedBoosters.b2 && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>

              {/* Booster 3: Veranda Sunlight Anchor */}
              <button
                type="button"
                onClick={() => toggleBooster('b3')}
                className={`p-3 rounded-2xl border text-left transition-all flex items-start justify-between gap-2 cursor-pointer ${
                  completedBoosters.b3
                    ? 'bg-amber-50/80 border-amber-300'
                    : 'bg-stone-50/80 hover:bg-stone-100 border-stone-200'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-xl">☀️</span>
                  <div>
                    <h5 className="text-xs font-black text-stone-900">
                      3. Sunlight & Veranda Chai Anchor
                    </h5>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      Sit near natural sunlight to anchor natural circadian rhythm.
                    </p>
                  </div>
                </div>
                <div className={`w-5 h-5 mt-0.5 rounded-full flex items-center justify-center border transition-all flex-shrink-0 ${
                  completedBoosters.b3 ? 'bg-amber-600 border-amber-600 text-white' : 'border-stone-300 bg-white'
                }`}>
                  {completedBoosters.b3 && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>

              {/* Booster 4: Family Photo Story */}
              <button
                type="button"
                onClick={() => toggleBooster('b4')}
                className={`p-3 rounded-2xl border text-left transition-all flex items-start justify-between gap-2 cursor-pointer ${
                  completedBoosters.b4
                    ? 'bg-rose-50/80 border-rose-300'
                    : 'bg-stone-50/80 hover:bg-stone-100 border-stone-200'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-xl">📸</span>
                  <div>
                    <h5 className="text-xs font-black text-stone-900">
                      4. One Family Photo Story
                    </h5>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      Point to 1 familiar loved one photo with zero testing pressure.
                    </p>
                  </div>
                </div>
                <div className={`w-5 h-5 mt-0.5 rounded-full flex items-center justify-center border transition-all flex-shrink-0 ${
                  completedBoosters.b4 ? 'bg-rose-600 border-rose-600 text-white' : 'border-stone-300 bg-white'
                }`}>
                  {completedBoosters.b4 && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            </div>
          </div>

          {/* 🏆 WEEKLY PROGRESS MILESTONES (SHORT, VISUAL & ENGAGING) */}
          <div className="w-full p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/80 shadow-xs text-left">
            <h4 className="text-xs sm:text-sm font-black text-[#3d1f30] mb-2.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{strings.improvement.weeklyMilestones}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-stone-700 block">Weekly Game Sessions</span>
                  <span className="text-xs text-stone-500">Goal: 3 sessions</span>
                </div>
                <span className="font-black text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  {stats.totalSessions >= 3 ? '✓ 3/3 Done' : `${stats.totalSessions} / 3`}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-stone-700 block">Accuracy Goal</span>
                  <span className="text-xs text-stone-500">Target: ≥ 70%</span>
                </div>
                <span className="font-black text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  {stats.avgAccuracy >= 70 ? `✓ ${stats.avgAccuracy}%` : `${stats.avgAccuracy}%`}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-stone-700 block">Medication & Hydration</span>
                  <span className="text-xs text-stone-500">Daily adherence</span>
                </div>
                <span className="font-black text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  {prescriptions.every((p) => p.takenToday) ? '✓ 100% On Time' : 'Active Daily'}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
