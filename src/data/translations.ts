import { Language, Quote, CardItem, ReminderItem, PromptCard } from '../types';

export const APP_NAME = "Smriti";

export interface HeroContent {
  line1: string;
  line2: string;
  subtitle: string;
}

export const HERO_CONTENT: Record<Language, HeroContent> = {
  en: {
    line1: "Your memories,",
    line2: "held with care",
    subtitle: "A gentle place for familiar moments, quiet courage, and the warmth of home."
  },
  bn: {
    line1: "আপনার স্মৃতি,",
    line2: "স্নেহে সংরক্ষিত",
    subtitle: "চেনা মুহূর্ত, শান্ত সাহস এবং গৃহের স্নিগ্ধ উষ্ণতার এক প্রশান্ত আলয়।"
  },
  as: {
    line1: "আপোনাৰ স্মৃতি,",
    line2: "স্নেহেৰে সংৰক্ষিত",
    subtitle: "চিনাকি মুহূৰ্ত, শান্ত সাহস আৰু ঘৰৰ স্নিগ্ধ উমৰ এক প্ৰশান্ত আশ্ৰয়।"
  },
  hi: {
    line1: "आपकी स्मृतियाँ,",
    line2: "स्नेह से सुरक्षित",
    subtitle: "परिचित पलों, शांत साहस और घर की आत्मीय गर्माहट का एक कोमल आश्रय।"
  }
};

export const PROMPT_CARDS: Record<Language, PromptCard[]> = {
  en: [
    {
      icon: "📖",
      text: "Every memory is a little light on the path."
    },
    {
      icon: "🌿",
      text: "The hills remind us: slow steps still move forward."
    },
    {
      icon: "💛",
      text: "Like rain on bamboo, every day has its own rhythm."
    }
  ],
  as: [
    {
      icon: "📖",
      text: "প্ৰতিটো স্মৃতি বাটৰ এক পোহৰ।"
    },
    {
      icon: "🌿",
      text: "পাহাৰবোৰে আমাক শিকায়: লাহে লাহে খোজ কাঢ়িও আগবাঢ়িব পাৰি।"
    },
    {
      icon: "💛",
      text: "বাঁহবনত বৰষুণৰ দৰে, প্ৰতিটো দিনৰে নিজা এটা ছন্দ আছে।"
    }
  ],
  bn: [
    {
      icon: "📖",
      text: "প্রতিটি স্মৃতি চলার পথের এক টুকরো স্নিগ্ধ আলো।"
    },
    {
      icon: "🌿",
      text: "পাহাড় আমাদের শেখায়: ধীর পদক্ষেপেও এগিয়ে চলা যায়।"
    },
    {
      icon: "💛",
      text: "বাঁশবনের বৃষ্টির মতো, প্রতিটি দিনের রয়েছে নিজস্ব এক ছন্দ।"
    }
  ],
  hi: [
    {
      icon: "📖",
      text: "हर याद जीवन के रास्ते पर जलता हुआ एक छोटा दिया है।"
    },
    {
      icon: "🌿",
      text: "पहाड़ हमें सिखाते हैं: धीरे-धीरे चलकर भी आगे बढ़ा जाता है।"
    },
    {
      icon: "💛",
      text: "बांस पर गिरती बारिश की तरह, हर दिन की अपनी सुंदर लय है।"
    }
  ]
};

export const LANGUAGE_LABELS: Record<Language, { native: string; label: string }> = {
  en: { native: "English", label: "English" },
  as: { native: "অসমীয়া", label: "Assamese" },
  bn: { native: "বাংলা", label: "Bengali" },
  hi: { native: "हिन्दी", label: "Hindi" }
};

export const QUOTES: Record<Language, Quote[]> = {
  en: [
    {
      text: "Memories may soften like morning mist over the hills, but love and gentle joy remain forever in the heart.",
      subtext: "Every sunrise brings a quiet, peaceful moment just for you.",
      source: "North Eastern Care Reflection"
    },
    {
      text: "You do not have to remember everything today. Just being here, breathing peacefully, is enough.",
      subtext: "Patience and gentle steps light the path ahead.",
      source: "Geriatric Wellness Circle"
    },
    {
      text: "Like the flowing waters of the Brahmaputra, life carries its own gentle rhythm.",
      subtext: "Take a deep breath and cherish this warm moment.",
      source: "Traditional Mindfulness"
    }
  ],
  bn: [
    {
      text: "স্মৃতি হয়তো ভোরের নদীর কুয়াশার মতো মিলিয়ে যায়, কিন্তু হৃদয়ের স্নেহ আর অনুভূতি চিরন্তন।",
      subtext: "আজ সব মনে রাখার কোনো তাড়া নেই। শুধু শান্ত মনে একটি সুন্দর মুহূর্ত কাটান।",
      source: "স্নেহ ও স্মৃতির বাণী"
    },
    {
      text: "নদীর স্রোতের মতো জীবনের প্রতিটি পল শান্ত ছন্দে বয়ে যায়।",
      subtext: "একটি দীর্ঘ শ্বাস নিন, মন শান্ত রাখুন। আমরা সবাই আপনার পাশে আছি।",
      source: "শান্তিময় মনের কথা"
    },
    {
      text: "স্নেহ এবং ভালোবাসার কোনো স্মৃতিভ্রম হয় না—হৃদয় সবসময় চিনে নেয়।",
      subtext: "ধীরে ধীরে প্রতিটি পদক্ষেপে শান্তি খুঁজে নিন।",
      source: "প্রবীণ সেবা চিন্তন"
    }
  ],
  as: [
    {
      text: "স্মৃতি হয়তো পুৱাৰ কুঁৱলীৰ দৰে পাতল হৈ যাব পাৰে, কিন্তু মনৰ মৰম আৰু স্নেহ সদায় সজীৱ হৈ থাকে।",
      subtext: "আজি সকলো মনত পেলোৱাৰ কোনো খৰখেদা নাই। মাথোঁ শান্ত মনেৰে ক্ষণিক উপভোগ কৰক।",
      source: "স্নেহ আৰু স্মৃতিৰ বাণী"
    },
    {
      text: "ব্ৰহ্মপুত্ৰৰ শান্ত সোঁতৰ দৰে জীৱনৰ প্ৰতিটো ক্ষণ মৃদু গতিত বৈ থাকে।",
      subtext: "এটি দীঘল উশাহ লওক, মন শান্ত ৰাখক। আমি আপোনাৰ কাষত আছো।",
      source: "শান্তিময় মনৰ কথা"
    },
    {
      text: "আন্তৰিকতা আৰু ভালপোৱাৰ কোনো বিস্মৃতি নাই—হৃদয়ে সকলোকে চিনি পায়।",
      subtext: "ধীৰে ধীৰে প্ৰতিটো পদক্ষেপতে শান্তি বিচাৰি লওক।",
      source: "বয়োজ্যেষ্ঠ কল্যাণ চিন্তা"
    }
  ],
  hi: [
    {
      text: "यादें भले ही पहाड़ों के कोहरे की तरह धुंधली हो जाएं, पर दिल का प्यार और अपनापन हमेशा जीवित रहता है।",
      subtext: "आज सब कुछ याद रखने की कोई जल्दबाजी नहीं है। बस शांत भाव से वर्तमान में रहिए।",
      source: "स्नेह एवं स्मृति संदेश"
    },
    {
      text: "नदी की शीतल धारा की तरह जीवन भी अपनी सौम्य और शांत गति से बहता रहता है।",
      subtext: "एक गहरी और सुकून भरी सांस लीजिए, हम हर कदम पर आपके साथ हैं।",
      source: "मन की शांति"
    },
    {
      text: "प्रेम और अपनत्व की कोई विस्मृति नहीं होती—हृदय हमेशा अपनों को पहचान लेता है।",
      subtext: "सहनशीलता और छोटे-छोटे कदम आगे का मार्ग प्रशस्त करते हैं।",
      source: "वरिष्ठ नागरिक सेवा"
    }
  ]
};

export const HOME_CARDS: Record<Language, CardItem[]> = {
  en: [
    {
      id: 'culture-recall',
      iconName: 'Sparkles',
      title: "Cultural Heritage & Memory Matching",
      description: "Delightful reminiscence with Assam tea, Gamusa, Japi, and folk melodies.",
      tag: "Feature 1: Games"
    },
    {
      id: 'daily-routine',
      iconName: 'Clock',
      title: "AI-Enabled Adaptive Difficulty & Score Tracking",
      description: "Automatically adjusts card count, response speeds, and keeps permanent score logs.",
      tag: "Feature 2: Adaptive"
    },
    {
      id: 'peaceful-calm',
      iconName: 'Heart',
      title: "Voice Assistance & Multilingual Instructions",
      description: "Soothing spoken audio and prompts in Hindi, Bengali, and English.",
      tag: "Feature 3: Voice"
    }
  ],
  bn: [
    {
      id: 'culture-recall',
      iconName: 'Sparkles',
      title: "পরিচিত ঐতিহ্য ও স্মৃতি খেলা",
      description: "আসামের চা, গামছা, জাপি ও চেনা লোকজ সুরের মাধ্যমে মধুর স্মৃতি চারণ।",
      tag: "ফিচার ১: খেলা"
    },
    {
      id: 'daily-routine',
      iconName: 'Clock',
      title: "অভিযোজিত কঠিন্য ও স্কোর ট্র্যাকার",
      description: "খেলার গতির সাথে নিজে থেকেই সমন্বয় করে এবং স্থায়ীভাবে স্কোর সংরক্ষণ করে।",
      tag: "ফিচার ২: গতিবিধি"
    },
    {
      id: 'peaceful-calm',
      iconName: 'Heart',
      title: "ভয়েস সহায়তা ও বহুভাষিক নির্দেশনা",
      description: "বাংলা, হিন্দি এবং ইংরেজিতে স্পষ্ট ও মধুর কণ্ঠের সাহায্য।",
      tag: "ফিচার ৩: ভয়েস"
    }
  ],
  as: [
    {
      id: 'culture-recall',
      iconName: 'Sparkles',
      title: "সাংস্কৃতিক ঐতিহ্য আৰু স্মৃতি খেল",
      description: "অসমৰ চাহ, গামোচা, জাপি আৰু চিনাকি লোকগীতৰ সুৰেৰে আনন্দময় স্মৃতিচাৰণ।",
      tag: "ফিচাৰ ১: খেল"
    },
    {
      id: 'daily-routine',
      iconName: 'Clock',
      title: "অভিযোজিত কঠিনতা আৰু স্কোৰ নিৰীক্ষণ",
      description: "আপোনাৰ সুবিধা অনুসৰি গতি নিৰ্ধাৰণ কৰে আৰু স্কোৰ সংৰক্ষিত কৰি ৰাখে।",
      tag: "ফিচাৰ ২: নিৰীক্ষণ"
    },
    {
      id: 'peaceful-calm',
      iconName: 'Heart',
      title: "কণ্ঠস্বৰ সহায় আৰু বহুভাষিক নিৰ্দেশনা",
      description: "অসমীয়া, ইংৰাজী, বাংলা আৰু হিন্দীত স্পষ্ট আৰু মৃদু কণ্ঠেৰে সহায়।",
      tag: "ফিচাৰ ৩: ভয়েচ"
    }
  ],
  hi: [
    {
      id: 'culture-recall',
      iconName: 'Sparkles',
      title: "सांस्कृतिक स्मृति मिलान खेल",
      description: "असम की चाय, गमोछा, जापी और मधुर सांस्कृतिक प्रतीकों की सुखद यादें।",
      tag: "फीचर १: खेल"
    },
    {
      id: 'daily-routine',
      iconName: 'Clock',
      title: "अनुकूलित कठिनाई एवं स्कोर ट्रैकर",
      description: "खिलाड़ी की गति अनुसार कार्ड की संख्या तय होती है और स्कोर सुरक्षित रहता है।",
      tag: "फीचर २: अनुकूलन"
    },
    {
      id: 'peaceful-calm',
      iconName: 'Heart',
      title: "आवाज सहायता एवं बहुभाषी निर्देश",
      description: "हिन्दी, बांग्ला और अंग्रेजी में कोमल व स्पष्ट आवाज में मार्गदर्शन।",
      tag: "फीचर ३: आवाज"
    }
  ]
};

export const UI_STRINGS: Record<Language, {
  topBadge: string;
  title: string;
  subtitle: string;
  startButton: string;
  stopButton: string;
  welcomeNotice: string;
  sayWelcome: string;
  sessionActive: string;
  backHome: string;
  changeLanguage: string;
  option2Title: string;
  option2Sub: string;
  tabs: {
    games: string;
    caregiver: string;
    reminders: string;
    breathing: string;
  };
  scoreTracker: {
    score: string;
    streak: string;
    accuracy: string;
    level: string;
    savedAlert: string;
  };
  games: {
    title: string;
    desc: string;
    moves: string;
    matches: string;
    reset: string;
    completedTitle: string;
    completedDesc: string;
    playAgain: string;
    hintButton: string;
  };
  reminders: {
    title: string;
    desc: string;
    allDone: string;
    markDone: string;
    completed: string;
  };
  breathing: {
    title: string;
    desc: string;
    inhale: string;
    hold: string;
    exhale: string;
    calmMessage: string;
  };
  offlineBadge: string;
  voiceNotice: string;
  controls: {
    hint: string;
    reset: string;
  };
  victory: {
    title: string;
    subtitle: string;
    replay: string;
    nextLevel: string;
  };
  bottomNote: string;
}> = {
  en: {
    topBadge: "NORTH EASTERN COGNITIVE CARE",
    title: "Smriti",
    subtitle: "A soothing companion for peaceful memory, daily routine, and gentle care.",
    startButton: "Start Game & Care Session",
    stopButton: "Stop",
    welcomeNotice: "Voice assistant ready in English, Bengali & Hindi",
    sayWelcome: "Hear Voice",
    sessionActive: "Care Session is Active",
    backHome: "Back to Sanctuary",
    changeLanguage: "Language",
    option2Title: "Caregiver & Prescriptions Dashboard",
    option2Sub: "Manage patient prescriptions, care notes, and review cognitive progress.",
    tabs: {
      games: "Cognitive Games Suite",
      caregiver: "Caregiver & Prescriptions",
      reminders: "Daily Rhythm Reminders",
      breathing: "Calm Breathing Ring"
    },
    scoreTracker: {
      score: "Memory Score",
      streak: "Match Streak",
      accuracy: "Accuracy",
      level: "Adaptive Mode",
      savedAlert: "Score saved to permanent history!"
    },
    games: {
      title: "Cultural Memory Match",
      desc: "Tap two cards to reveal and match familiar North Eastern treasures. Sound effects and score tracking are active!",
      moves: "Gentle Taps",
      matches: "Pairs Matched",
      reset: "Shuffle Cards",
      completedTitle: "Splendid! All pairs matched perfectly.",
      completedDesc: "Your memory score has been securely saved to the Caregiver Dashboard.",
      playAgain: "Play Again",
      hintButton: "Gentle Hint"
    },
    reminders: {
      title: "Today's Gentle Care Routine",
      desc: "Small acts of wellness to keep you comfortable, hydrated, and smiling.",
      allDone: "All daily routine steps are gently completed for today!",
      markDone: "Mark Complete",
      completed: "Completed"
    },
    breathing: {
      title: "Gentle Lotus Breathing",
      desc: "Follow the expanding flower to breathe in calm and release any worry.",
      inhale: "Gently Breathe In...",
      hold: "Softly Hold...",
      exhale: "Slowly Breathe Out...",
      calmMessage: "You are safe, loved, and at peace."
    },
    offlineBadge: "Works Offline in Remote Hills",
    voiceNotice: "Voice enabled in Hindi, Bengali & English",
    controls: {
      hint: "Gentle Hint",
      reset: "Shuffle Cards"
    },
    victory: {
      title: "Splendid! All pairs matched perfectly.",
      subtitle: "Your memory score has been securely saved to the Caregiver Dashboard.",
      replay: "Play Again",
      nextLevel: "Next Level"
    },
    bottomNote: "Designed with love for North Eastern Elders"
  },
  bn: {
    topBadge: "উত্তর-পূর্বাঞ্চল প্রবীণ স্মৃতি সেবা",
    title: "স্মৃতি",
    subtitle: "শান্তিময় স্মৃতি, দৈনন্দিন যত্ন ও মানসিক প্রশান্তির একটি মমতাময় মাধ্যম।",
    startButton: "সেশন শুরু করুন (Start)",
    stopButton: "থামুন (Stop)",
    welcomeNotice: "বাংলা, হিন্দি ও ইংরেজিতে ভয়েস সহায়তা প্রস্তুত",
    sayWelcome: "ভয়েস শুনুন",
    sessionActive: "যত্ন সেবা সচল রয়েছে",
    backHome: "শান্ত কুটিরে ফিরে যান",
    changeLanguage: "ভাষা নির্বাচন",
    option2Title: "কেয়ারগিভার ও প্রেসক্রিপশন ড্যাশবোর্ড",
    option2Sub: "রোগীর প্রেসক্রিপশন, যত্ন নির্দেশিকা ও স্মৃতি উন্নতির বিশ্লেষণ দেখুন।",
    tabs: {
      games: "জ্ঞানমূলক খেলাসমূহ",
      caregiver: "কেয়ারগিভার ও প্রেসক্রিপশন",
      reminders: "দৈনিক স্মরণিকা",
      breathing: "শান্ত শ্বাস"
    },
    scoreTracker: {
      score: "স্মৃতি স্কোর",
      streak: "ধারাবাহিকতা",
      accuracy: "নির্ভুলতা",
      level: "অভিযোজিত ধাপ (ফিচার ২)",
      savedAlert: "স্কোর সফলভাবে সংরক্ষণ করা হয়েছে!"
    },
    games: {
      title: "পরিচিত ঐতিহ্য ও স্মৃতি খেলা",
      desc: "দুটি কার্ড স্পর্শ করে চেনা জোড়াগুলি খুঁজে নিন। সঠিক মিল হলে সুরের ধ্বনি বাজবে ও স্কোর জমা হবে!",
      moves: "স্পর্শ সংখ্যা",
      matches: "পাওয়া জোড়া",
      reset: "নতুন করে সাজান",
      completedTitle: "চমৎকার! সব জোড়া শান্তভাবে খুঁজে পেয়েছেন।",
      completedDesc: "আপনার স্কোর পরিচর্যাকারী ড্যাশবোর্ডে সুরক্ষিতভাবে সংরক্ষিত হয়েছে।",
      playAgain: "আবার খেলুন",
      hintButton: "একটু সাহায্য"
    },
    reminders: {
      title: "আজকের দৈনন্দিন যত্ন তালিকা",
      desc: "আপনাকে সুস্থ ও প্রফুল্ল রাখতে কয়েকটি সহজ পদক্ষেপ।",
      allDone: "আজকের সব যত্নমূলক কাজ সম্পন্ন হয়েছে!",
      markDone: "সম্পন্ন করুন",
      completed: "সম্পন্ন"
    },
    breathing: {
      title: "পদ্মের ছন্দে প্রশান্ত শ্বাস",
      desc: "পদ্মফুলের প্রস্ফুটিত রূপ দেখে ধীরে ধীরে শ্বাস নিন ও মনের সব ক্লান্তি দূর করুন।",
      inhale: "ধীরে ধীরে শ্বাস গ্রহণ করুন...",
      hold: "কিছুক্ষণ স্থির রাখুন...",
      exhale: "আস্তে আস্তে শ্বাস ত্যাগ করুন...",
      calmMessage: "আপনি নিরাপদ, আপনি ভালোবাসা ও শান্তিতে আছেন।"
    },
    offlineBadge: "পাহাড়ের প্রত্যন্ত অঞ্চলেও অফলাইনে কাজ করে",
    voiceNotice: "বাংলা, হিন্দি ও ইংরেজিতে ভয়েস সহায়তা সক্রিয়",
    controls: {
      hint: "একটু সাহায্য",
      reset: "নতুন করে সাজান"
    },
    victory: {
      title: "চমৎকার! সব জোড়া শান্তভাবে খুঁজে পেয়েছেন।",
      subtitle: "আপনার স্কোর পরিচর্যাকারী ড্যাশবোর্ডে সুরক্ষিতভাবে সংরক্ষিত হয়েছে।",
      replay: "আবার খেলুন",
      nextLevel: "পরবর্তী ধাপ"
    },
    bottomNote: "উত্তর-পূর্ব ভারতের প্রিয় প্রবীণদের সেবায় নিবেদিত"
  },
  as: {
    topBadge: "উত্তৰ-পূৰ্বাঞ্চল জ্ঞানীয় স্বাস্থ্য সেৱা",
    title: "স্মৃতি",
    subtitle: "শান্তিময় স্মৃতি, দৈনন্দিন যত্ন আৰু আন্তৰিক প্ৰশান্তিৰ এক মৰমৰ সংগী।",
    startButton: "অধিৱেশন আৰম্ভ কৰক (Start)",
    stopButton: "বন্ধ কৰক (Stop)",
    welcomeNotice: "অসমীয়া, ইংৰাজী, বাংলা আৰু হিন্দীত ভয়েচ সহায় সাজু",
    sayWelcome: "কণ্ঠস্বৰ শুনক",
    sessionActive: "যত্ন অধিৱেশন সক্ৰিয় হৈ আছে",
    backHome: "শান্ত আশ্ৰয়লৈ উভতি যাওক",
    changeLanguage: "ভাষা সলনি কৰক",
    option2Title: "কেয়াৰগিভাৰ আৰু প্ৰেছক্ৰিপশ্বন ডেচবৰ্ড",
    option2Sub: "ৰোগীৰ প্ৰেছক্ৰিপশ্বন, যত্ন নিৰ্দেশনা আৰু স্মৃতি অগ্ৰগতি নিৰীক্ষণ কৰক।",
    tabs: {
      games: "জ্ঞানীয় খেলসমূহ",
      caregiver: "কেয়াৰগিভাৰ আৰু প্ৰেছক্ৰিপশ্বন",
      reminders: "দৈনন্দিন ৰুটিন সোঁৱৰণী",
      breathing: "শান্ত উশাহৰ চক্ৰ"
    },
    scoreTracker: {
      score: "স্মৃতি স্কোৰ",
      streak: "ধাৰাবাহিকতা",
      accuracy: "শুদ্ধতা",
      level: "অভিযোজিত স্তৰ (ফিচাৰ ২)",
      savedAlert: "স্কোৰ সফলতাৰে সংৰক্ষণ কৰা হ'ল!"
    },
    games: {
      title: "সাংস্কৃতিক ঐতিহ্য আৰু স্মৃতি খেল",
      desc: "দুখন কাৰ্ড স্পৰ্শ কৰি চিনাকি সাংস্কৃতিক চিহ্নৰ যোৰ মিলাওক। শুদ্ধ উত্তৰত সুমধুৰ ধ্বনি বাজিব!",
      moves: "স্পৰ্শ সংখ্যা",
      matches: "মিলা যোৰ",
      reset: "নতুনকৈ সজাওক",
      completedTitle: "অতিকৈ সুন্দৰ! সকলো যোৰ সফলতাৰে মিলিল।",
      completedDesc: "আপোনাৰ স্কোৰ শুশ্ৰূষাকাৰী ডেচবৰ্ডত সংৰক্ষিত কৰা হৈছে।",
      playAgain: "পুনৰ খেলক",
      hintButton: "অলপ সহায়"
    },
    reminders: {
      title: "আজিৰ সহজ যত্ন তালিকা",
      desc: "আপোনাক সুস্থ, শান্ত আৰু আনন্দময় কৰি ৰাখিবলৈ সৰু সৰু পদক্ষেপ।",
      allDone: "আজিৰ সকলো দৈনন্দিন কাম সুচাৰুৰূপে সম্পন্ন হৈছে!",
      markDone: "সম্পন্ন বুলি চিহ্নিত কৰক",
      completed: "সম্পন্ন"
    },
    breathing: {
      title: "পদুম ফুলৰ সুৰভিত শান্ত উশাহ",
      desc: "ফুলি উঠা পদুম ফুলৰ লগত লাহে লাহে উশাহ লওক আৰু সকলো চিন্তা পাহৰি যাওক।",
      inhale: "ধীৰে ধীৰে উশাহ লওক...",
      hold: "কিছু সময় ৰাখক...",
      exhale: "লাহে লাহে উশাহ এৰক...",
      calmMessage: "আপুনি নিৰাপদে আছে, অপৰিসীম স্নেহ আৰু শান্তিত আছে।"
    },
    offlineBadge: "পাহাৰীয়া অঞ্চলতো ইণ্টাৰনেট অবিহনে চলে",
    voiceNotice: "অসমীয়া, ইংৰাজী, বাংলা আৰু হিন্দীত ভয়েচ সহায় সক্ষম",
    controls: {
      hint: "অলপ সহায়",
      reset: "নতুনকৈ সজাওক"
    },
    victory: {
      title: "অতিকৈ সুন্দৰ! সকলো যোৰ সফলতাৰে মিলিল।",
      subtitle: "আপোনাৰ স্কোৰ শুশ্ৰূষাকাৰী ডেচবৰ্ডত সংৰক্ষিত কৰা হৈছে।",
      replay: "পুনৰ খেলক",
      nextLevel: "পৰৱৰ্তী স্তৰ"
    },
    bottomNote: "উত্তৰ-পূৰ্বাঞ্চলৰ মৰমৰ জ্যেষ্ঠসকলৰ বাবে সযত্নে নিৰ্মিত"
  },
  hi: {
    topBadge: "उत्तर-पूर्वी संज्ञानात्मक स्वास्थ्य सेवा",
    title: "स्मृति",
    subtitle: "शांत स्मृतियों, दैनिक दिनचर्या और कोमल देखभाल का एक आत्मीय साथी।",
    startButton: "सत्र प्रारंभ करें (Start)",
    stopButton: "रोकें (Stop)",
    welcomeNotice: "हिन्दी, बांग्ला एवं अंग्रेजी में आवाज सहायता उपलब्ध",
    sayWelcome: "आवाज सुनें",
    sessionActive: "देखभाल सत्र सक्रिय है",
    backHome: "मुख पृष्ठ पर लौटें",
    changeLanguage: "भाषा चुनें",
    option2Title: "केयरगिवर व प्रिस्क्रिप्शन डैशबोर्ड",
    option2Sub: "मरीज की दवाएं, देखभाल निर्देश एवं स्मृति सुधार विश्लेषण देखें।",
    tabs: {
      games: "संज्ञानात्मक खेल",
      caregiver: "केयरगिवर व प्रिस्क्रिप्शन",
      reminders: "दैनिक दिनचर्या स्मरण",
      breathing: "शांत श्वास चक्र"
    },
    scoreTracker: {
      score: "स्मृति स्कोर",
      streak: "सटीक क्रम",
      accuracy: "सटीकता",
      level: "अनुकूलित स्तर (फीचर २)",
      savedAlert: "स्कोर सुरक्षित कर लिया गया है!"
    },
    games: {
      title: "सांस्कृतिक स्मृति मिलान खेल",
      desc: "कार्ड्स को छूकर जाने-पहचाने सांस्कृतिक प्रतीकों के जोड़े मिलाएं। सही उत्तर पर मधुर ध्वनि बजेगी और स्कोर जुड़ेगा!",
      moves: "स्पर्श संख्या",
      matches: "मिले जोड़े",
      reset: "फिर से सजाएं",
      completedTitle: "अति उत्तम! सभी जोड़े सफलतापूर्वक मिल गए।",
      completedDesc: "आपका स्कोर देखभालकर्ता डैशबोर्ड में सुरक्षित रूप से दर्ज कर दिया गया है।",
      playAgain: "पुनः खेलें",
      hintButton: "संकेत लें"
    },
    reminders: {
      title: "आज की कोमल दिनचर्या",
      desc: "आपको स्वस्थ, प्रसन्न और सहज रखने के छोटे-छोटे नियम।",
      allDone: "आज के सभी दैनिक कार्य पूर्ण हो चुके हैं!",
      markDone: "पूर्ण चिह्नित करें",
      completed: "पूर्ण हुआ"
    },
    breathing: {
      title: "कमल के पुष्प संग शांत श्वास",
      desc: "खिलते हुए कमल के साथ गहरी सांस लें और हर चिंता को विदा करें।",
      inhale: "धीमी और गहरी सांस लें...",
      hold: "थोड़ी देर रोकें...",
      exhale: "धीरे-धीरे सांस छोड़ें...",
      calmMessage: "आप सुरक्षित हैं और अपनों के असीम स्नेह में हैं।"
    },
    offlineBadge: "पहाड़ी अंचलों में भी बिना इंटरनेट काम करता है",
    voiceNotice: "हिन्दी, बांग्ला और अंग्रेजी में आवाज सहायता सक्षम",
    controls: {
      hint: "संकेत लें",
      reset: "फिर से सजाएं"
    },
    victory: {
      title: "अति उत्तम! सभी जोड़े सफलतापूर्वक मिल गए।",
      subtitle: "आपका स्कोर देखभालकर्ता डैशबोर्ड में सुरक्षित रूप से दर्ज कर दिया गया है।",
      replay: "पुनः खेलें",
      nextLevel: "अगला स्तर"
    },
    bottomNote: "पूर्वोत्तर के आदरणीय बुजुर्गों की सेवा में समर्पित"
  }
};

export const INITIAL_REMINDERS: ReminderItem[] = [
  {
    id: 'rem-1',
    time: "07:30 AM",
    title: {
      en: "Morning Glass of Warm Water & Fresh Air",
      as: "পুৱাৰ এগিলাচ কুহুমীয়া পানী আৰু মুক্ত বতাহ",
      bn: "সকালের এক গ্লাস কুসুম গরম জল ও মুক্ত বাতাস",
      hi: "सुबह का एक गिलास गुनगुना पानी और ताजी हवा"
    },
    subtitle: {
      en: "Gentle hydration for body and mind",
      as: "দেহ আৰু মনৰ বাবে স্নিগ্ধ জলপান",
      bn: "শরীর ও মনের জন্য স্নিগ্ধ জলপান",
      hi: "शरीर और मन के लिए सुखद जलपान"
    },
    category: 'hydration',
    completed: true,
    icon: 'Droplets'
  },
  {
    id: 'rem-2',
    time: "08:30 AM",
    title: {
      en: "Morning Medicine after light breakfast",
      as: "পাতল পুৱাৰ জলপানৰ পিছত নিয়মীয়া ঔষধ",
      bn: "হালকা প্রাতঃরাশের পর সকালের নির্ধারিত ওষুধ",
      hi: "हल्के नाश्ते के बाद सुबह की नियमित दवा"
    },
    subtitle: {
      en: "Taken with warm water and care",
      as: "কুহুমীয়া পানীৰ সৈতে নিয়ম মতে সেৱন",
      bn: "কুসুম গরম জলের সাথে সেবন",
      hi: "गुनगुने पानी के साथ नियमपूर्वक सेवन"
    },
    category: 'medicine',
    completed: true,
    icon: 'Pill'
  },
  {
    id: 'rem-3',
    time: "11:30 AM",
    title: {
      en: "Gentle Hydration & Lemon Water",
      as: "শৰীৰত পানীৰ ভাৰসাম্য আৰু নেমুৰ চৰবত",
      bn: "শরীরে জলের ভারসাম্য ও লেবুর শরবত",
      hi: "पर्याप्त पानी एवं शिकंजी का सेवन"
    },
    subtitle: {
      en: "Refreshing sips to stay energetic",
      as: "সতেজ হৈ থাকিবলৈ পৰিমিত পানী গ্ৰহণ",
      bn: "সতেজ থাকতে পরিমিত তরল গ্রহণ",
      hi: "ताजगी और ऊर्जा के लिए पर्याप्त पेय"
    },
    category: 'hydration',
    completed: false,
    icon: 'Droplets'
  },
  {
    id: 'rem-4',
    time: "04:30 PM",
    title: {
      en: "Afternoon Assam Tea & Chat with Family",
      as: "আবেলিৰ অসমৰ চাহ আৰু পৰিয়ালৰ সৈতে কথা-বতৰা",
      bn: "বিকালের আসাম চা ও পরিবারের সাথে গল্প",
      hi: "शाम की गरमागरम चाय और परिवार से बातचीत"
    },
    subtitle: {
      en: "Warm moments of togetherness",
      as: "আপোনজনৰ সৈতে মধুৰ মুহূৰ্ত",
      bn: "প্রিয়জনদের সাথে আন্তরিক মুহূর্ত",
      hi: "अपनों के साथ सुखद व आत्मीय पल"
    },
    category: 'activity',
    completed: false,
    icon: 'Coffee'
  },
  {
    id: 'rem-5',
    time: "08:30 PM",
    title: {
      en: "Night Medicine & Restful Sleep Preparation",
      as: "ৰাতিৰ ঔষধ আৰু শান্তিৰ টোপনিৰ প্ৰস্তুতি",
      bn: "রাতের ওষুধ ও প্রশান্ত ঘুমের প্রস্তুতি",
      hi: "रात की दवा और सुखद निद्रा की तैयारी"
    },
    subtitle: {
      en: "Peaceful breathing before sweet dreams",
      as: "টোপনিৰ পূৰ্বে শান্ত আৰু গভীৰ উশাহ",
      bn: "ঘুমের আগে শান্ত দীর্ঘ শ্বাস",
      hi: "सोने से पहले शांत सांस और सुकून"
    },
    category: 'medicine',
    completed: false,
    icon: 'Moon'
  }
];

export const CULTURAL_SYMBOLS = [
  {
    pairId: 'tea',
    name: {
      en: "Assam Tea Garden Leaf",
      as: "অসমৰ সতেজ চাহ পাত",
      bn: "আসামের সতেজ চা পাতা",
      hi: "असम के बागानों की ताजा चाय पत्ती"
    },
    symbol: "🍃",
    category: "nature",
    description: {
      en: "Fragrant fresh green tea leaves from the rolling lush gardens of the Brahmaputra valley.",
      as: "ব্ৰহ্মপুত্ৰ উপত্যকাৰ সেউজীয়া বাগিচাৰ সুগন্ধি সতেজ চাহ পাত।",
      bn: "ব্রহ্মপুত্র উপত্যকার সবুজে ঘেরা বাগান থেকে তোলা সুগন্ধি সতেজ চা পাতা।",
      hi: "ब्रह्मपुत्र घाटी के हरे-भरे चाय बागानों से तोड़ी गई सुगंधित चाय की पत्तियां।"
    }
  },
  {
    pairId: 'gamusa',
    name: {
      en: "Traditional Gamusa",
      as: "ঐতিহ্যমণ্ডিত ফুলাম গামোচা",
      bn: "ঐতিহ্যবাহী অসমীয়া গামোচা",
      hi: "पारंपरिक असमिया गमोछा"
    },
    symbol: "🧣",
    category: "craft",
    description: {
      en: "Handwoven white and red cotton towel signifying respect, honor, and deep affection.",
      as: "শ্ৰদ্ধা আৰু মৰমৰ প্ৰতীক, বগা আৰু ৰঙা সূতাৰে বোৱা আপোন গামোচা।",
      bn: "শ্রদ্ধা ও ভালোবাসার প্রতীক লাল-সাদা সুতোয় বোনা প্রিয় গামোচা।",
      hi: "सम्मान और स्नेह का प्रतीक, सफेद और लाल धागों से बुना हुआ पारंपरिक गमोछा।"
    }
  },
  {
    pairId: 'japi',
    name: {
      en: "Heritage Japi",
      as: "ঐতিহ্যবাহী জাপি",
      bn: "ঐতিহ্যবাহী জাপি",
      hi: "पारंपरिक जापी टोपी"
    },
    symbol: "👒",
    category: "heritage",
    description: {
      en: "Conical headgear woven from bamboo and tokou leaves, symbol of hospitality.",
      as: "বাঁহ আৰু তোকো পাতেৰে নিৰ্মিত সন্মান আৰু আতিথ্যৰ প্ৰতীক।",
      bn: "বাঁশ ও তোকো পাতা দিয়ে তৈরি ঐতিহ্যবাহী টুপি, যা আতিথেয়তার প্রতীক।",
      hi: "बांस और तोको के पत्तों से बनी पारंपरिक सुंदर टोपी, जो आतिथ्य की पहचान है।"
    }
  },
  {
    pairId: 'rhino',
    name: {
      en: "Kaziranga One-Horned Rhino",
      as: "কাজিৰঙাৰ এশিঙীয়া গঁড়",
      bn: "একশৃঙ্গ গণ্ডার",
      hi: "काजीरंगा का एक सींग वाला गैंडा"
    },
    symbol: "🦏",
    category: "wildlife",
    description: {
      en: "The magnificent one-horned rhinoceros roaming peacefully in Kaziranga National Park.",
      as: "কাজিৰঙা ৰাষ্ট্ৰীয় উদ্যানৰ গৌৰৱ, শান্ত আৰু সুন্দৰ এশিঙীয়া গঁড়।",
      bn: "কাজিরাঙা জাতীয় উদ্যানের গর্ব, শান্ত ও সুন্দর একশৃঙ্গ গণ্ডার।",
      hi: "काजीरंगा राष्ट्रीय उद्यान का शांत एवं भव्य एक सींग वाला गैंडा।"
    }
  },
  {
    pairId: 'bell',
    name: {
      en: "Temple Brass Bell",
      as: "মন্দিৰৰ কাঁহৰ ঘণ্টা",
      bn: "মন্দিরের পিতলের ঘণ্টা",
      hi: "मंदिर की पीतल की मधुर घंटी"
    },
    symbol: "🔔",
    category: "spiritual",
    description: {
      en: "Resonant bell filling the morning valley with sacred and serene vibrations.",
      as: "পুৱাৰ শান্ত বতাহত পৱিত্ৰ ধ্বনি তোলা সুমধুৰ কাঁহৰ ঘণ্টা।",
      bn: "সকালের শান্ত বাতাসে পবিত্র ধ্বনি তোলা পিতলের মঙ্গল ঘণ্টা।",
      hi: "सुबह की प्रार्थना में गूंजने वाली पावन और सुखद पीतल की घंटी।"
    }
  },
  {
    pairId: 'lamp',
    name: {
      en: "Clay Diya Lamp",
      as: "মাটিৰ চাকি",
      bn: "মাটির প্রদীপ",
      hi: "मिट्टी का पावन दीया"
    },
    symbol: "🪔",
    category: "spiritual",
    description: {
      en: "Warm golden flame bringing blessings, warmth, and nostalgic home memories.",
      as: "ঘৰৰ চোতালত স্নিগ্ধ পোহৰ আৰু শান্তি বিলোৱা পৱিত্ৰ মাটিৰ চাকি।",
      bn: "গৃহের শান্তি ও ভালোবাসার সোনালী আলো ছড়ানো মাটির প্রদীপ।",
      hi: "घर के आंगन में उजाला और अपनापन बिखेरता पावन मिट्टी का दीपक।"
    }
  },
  {
    pairId: 'dhol',
    name: {
      en: "Bihu Dhol Drum",
      as: "বিহুৰ ঢোল",
      bn: "উৎসবের বিহুর ঢোল",
      hi: "उत्सव का बिहू ढोल"
    },
    symbol: "🥁",
    category: "music",
    description: {
      en: "Heartbeat of spring festivities, bringing joy, clapping, and happy memories.",
      as: "বসন্ত উৎসৱৰ প্ৰাণ, আনন্দ আৰু উল্লাস জগাই তোলা কাঠৰ ঢোল।",
      bn: "বসন্ত উৎসবের আনন্দময় ছন্দে বাজা প্রিয় কাঠের ঢোল।",
      hi: "बसंत उत्सव की खुशी और उत्साह जगाने वाला पारंपरिक ढोल।"
    }
  },
  {
    pairId: 'silk',
    name: {
      en: "Muga Golden Silk",
      as: "সোণালী মুগা ৰেচম",
      bn: "সোনালী মুগা রেশম",
      hi: "सुनहरा मुगा रेशम"
    },
    symbol: "🦋",
    category: "heritage",
    description: {
      en: "Precious shimmering golden silk woven exclusively in the Assam hills.",
      as: "অসমৰ বিশ্ববিখ্যাত, উজ্বল আৰু মহামূল্যবান সোণালী মুগা সূতা।",
      bn: "পাহাড়ের অমূল্য সোনালী চকচকে ঐতিহ্যবাহী মুগা সিল্ক।",
      hi: "असम की पहाड़ियों का प्रसिद्ध, चमकता हुआ दुर्लभ सुनहरा रेशम।"
    }
  },
  {
    pairId: 'lotus',
    name: {
      en: "Wild Pink Lotus",
      as: "পৱিত্ৰ পদুম ফুল",
      bn: "পবিত্র লাল পদ্মফুল",
      hi: "पावन गुलाबी कमल"
    },
    symbol: "🪷",
    category: "nature",
    description: {
      en: "Graceful sacred flower blooming quietly upon the morning village ponds.",
      as: "পুৱাৰ শান্ত পুখুৰীৰ পানীত ফুলি থকা স্নিগ্ধ আৰু পৱিত্ৰ পদুম।",
      bn: "ভোরের শান্ত দীঘির জলে ফুটে থাকা স্নিগ্ধ ও পবিত্র পদ্ম।",
      hi: "सुबह के शांत सरोवर में खिला हुआ पवित्र और सुंदर कमल पुष्प।"
    }
  },
  {
    pairId: 'pepa',
    name: {
      en: "Bamboo Pepa Flute",
      as: "ম'হৰ শিঙৰ পেঁপা",
      bn: "বাঁশের সুরের পেঁপা",
      hi: "बांस की सुरमयी बांसुरी"
    },
    symbol: "🪈",
    category: "music",
    description: {
      en: "Melodious folk horn carved from bamboo, echoing sweetly through the valleys.",
      as: "পাহাৰ-ভৈয়ামৰ আকাশত সুৰৰ লহৰ তোলা ঐতিহ্যবাহী পেঁপা।",
      bn: "উপত্যকার বাতাসে মিষ্টি সুর ছড়ানো ঐতিহ্যবাহী বাঁশি।",
      hi: "घाटियों में मधुर स्वर बिखेरती हुई पारंपरिक बांसुरी।"
    }
  },
  {
    pairId: 'pitha',
    name: {
      en: "Assam Sweet Pitha",
      as: "ঐতিহ্যবাহী তিল পিঠা",
      bn: "ঐতিহ্যবাহী তিল পিঠা",
      hi: "पारंपरिक मीठा पीठा"
    },
    symbol: "🥮",
    category: "food",
    description: {
      en: "Delightful warm sweet treat prepared lovingly from harvested rice and jaggery.",
      as: "বৰা চাউল আৰু গুড়েৰে মৰমেৰে তৈয়াৰ কৰা সোৱাদভৰা পিঠা।",
      bn: "নতুন চালের গুঁড়ো ও গুড় দিয়ে তৈরি স্নেহের মিষ্টি পিঠা।",
      hi: "नए चावल व गुड़ से बना हुआ स्वादिष्ट व मीठा पारंपरिक पकवान।"
    }
  },
  {
    pairId: 'bird',
    name: {
      en: "Singing Hill Bird",
      as: "গান গোৱা পাহাৰীয়া চৰাই",
      bn: "মিষ্টি গানের শ্যামা পাখি",
      hi: "मधुर गाने वाली श्यामा चिड़िया"
    },
    symbol: "🐦",
    category: "nature",
    description: {
      en: "Joyful songbird welcoming the morning sun with a cheerful melody.",
      as: "পুৱাৰ ৰদালিত সুমধুৰ মাতেৰে আকাশ মুখৰিত কৰা শুৱনি চৰাই।",
      bn: "ভোরের সূর্যকে মিষ্টি গানে আহ্বান জানানো উপত্যকার সুন্দর পাখি।",
      hi: "सुबह की मीठी धूप में मधुर तान सुनाने वाली सुंदर पहाड़ी चिड़िया।"
    }
  }
];
