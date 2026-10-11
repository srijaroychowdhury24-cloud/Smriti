import {
  Language,
  MultilingualText,
  CognitiveGameId,
  GameLevelStatus,
  MyHomeLevelConfig,
  SortItOutLevelConfig,
  WhoIsThisLevelConfig
} from '../types';
import { syncGameProgressToSupabase } from '../utils/supabaseClient';

export interface MemoryGameLevelConfig {
  level: number;
  pairsCount: number;
  symbolsSubset: string[]; // pairIds
  title: MultilingualText;
  description: MultilingualText;
}

export interface PatternGameLevelConfig {
  level: number;
  sequenceLength: number;
  speedMs: number;
  title: MultilingualText;
  description: MultilingualText;
}

export interface AssociationGameLevelConfig {
  level: number;
  title: MultilingualText;
  prompt: MultilingualText;
  culturalMemory: MultilingualText;
  correctOptionId: string;
  options: {
    id: string;
    symbol: string;
    label: MultilingualText;
    detail: MultilingualText;
  }[];
}

// 1. Cultural Memory Match: 10 Progressive Levels
export const MEMORY_LEVELS: MemoryGameLevelConfig[] = [
  {
    level: 1,
    pairsCount: 2,
    symbolsSubset: ['tea', 'bell'],
    title: {
      en: "Level 1: Morning Mist & Valley Bell",
      bn: "ধাপ ১: ভোরের কুয়াশা ও মঙ্গল ঘণ্টা",
      hi: "स्तर १: सुबह का कोहरा व पावन घंटी"
    },
    description: {
      en: "Find 2 gentle pairs: Assam Tea Leaf and Temple Bell.",
      bn: "২ জোড়া চেনা ছবি খুঁজুন: সতেজ চা পাতা এবং মঙ্গল ঘণ্টা।",
      hi: "२ जोड़े पहचानिए: चाय पत्ती और मंदिर की घंटी।"
    }
  },
  {
    level: 2,
    pairsCount: 2,
    symbolsSubset: ['rhino', 'lamp'],
    title: {
      en: "Level 2: Gentle Wildlife & Evening Diya",
      bn: "ধাপ ২: কাজিরাঙার গণ্ডার ও সাঁঝের প্রদীপ",
      hi: "स्तर २: काजीरंगा का गैंडा व शाम का दीया"
    },
    description: {
      en: "Find 2 pairs: The one-horned rhino and the warm golden clay diya.",
      bn: "২ জোড়া ছবি খুঁজুন: একশৃঙ্গ গণ্ডার এবং মাটির প্রদীপ।",
      hi: "२ जोड़े मिलाइए: एक सींग वाला गैंडा और सुंदर दीया।"
    }
  },
  {
    level: 3,
    pairsCount: 3,
    symbolsSubset: ['tea', 'gamusa', 'japi'],
    title: {
      en: "Level 3: Handwoven Respect & Tea",
      bn: "ধাপ ৩: সুতোয় বোনা গামোচা ও জাপি",
      hi: "स्तर ३: असमिया गमोछा व पारंपरिक जापी"
    },
    description: {
      en: "Match 3 pairs: Gamusa towel, bamboo Japi, and fresh green tea.",
      bn: "৩ জোড়া মেলান: প্রিয় গামোচা, বাঁশের জাপি ও চা পাতা।",
      hi: "३ जोड़े पहचानिए: पारंपरिक गमोछा, जापी और चाय पत्ती।"
    }
  },
  {
    level: 4,
    pairsCount: 3,
    symbolsSubset: ['dhol', 'silk', 'bell'],
    title: {
      en: "Level 4: Festival Rhythm & Golden Silk",
      bn: "ধাপ ৪: বিহুর ঢোল ও সোনালী মুগা রেশম",
      hi: "स्तर ४: ढोल की थाप व सुनहरा रेशम"
    },
    description: {
      en: "Match 3 pairs: Festive Bihu Dhol drum, Muga silk moth, and brass bell.",
      bn: "৩ জোড়া মেলান: উৎসবের ঢোল, সোনালী রেশম ও পিতলের ঘণ্টা।",
      hi: "३ जोड़े मिलाइए: उत्सव का ढोल, सुनहरा रेशम और घंटी।"
    }
  },
  {
    level: 5,
    pairsCount: 4,
    symbolsSubset: ['tea', 'rhino', 'japi', 'lotus'],
    title: {
      en: "Level 5: Serene Lotus & Green Hills",
      bn: "ধাপ ৫: শান্ত পদ্ম ও সবুজ পাহাড়",
      hi: "स्तर ५: शांत कमल व हरी-भरी पहाड़ियां"
    },
    description: {
      en: "Match 4 pairs: Red lotus blossom, rhino, tea leaf, and japi.",
      bn: "৪ জোড়া মেলান: শান্ত পদ্মফুল, গণ্ডার, চা পাতা ও জাপি।",
      hi: "४ जोड़े पहचानिए: लाल कमल, गैंडा, चाय पत्ती व जापी।"
    }
  },
  {
    level: 6,
    pairsCount: 4,
    symbolsSubset: ['gamusa', 'lamp', 'pepa', 'bell'],
    title: {
      en: "Level 6: Melodies of Brahmaputra",
      bn: "ধাপ ৬: ব্রহ্মপুত্রের সুর ও আলো",
      hi: "स्तर ६: ब्रह्मपुत्र के सुर व दीप"
    },
    description: {
      en: "Match 4 pairs: Bamboo flute, evening lamp, gamusa, and brass bell.",
      bn: "৪ জোড়া মেলান: বাঁশের বাঁশি, মাটির প্রদীপ, গামোচা ও ঘণ্টা।",
      hi: "४ जोड़े मिलाइए: बांस की बांसुरी, दीया, गमोछा और घंटी।"
    }
  },
  {
    level: 7,
    pairsCount: 5,
    symbolsSubset: ['tea', 'pitha', 'bird', 'silk', 'lotus'],
    title: {
      en: "Level 7: Harvest Treats & Valley Birds",
      bn: "ধাপ ৭: মিষ্টি পিঠা ও বনপাখি",
      hi: "स्तर ७: मधुर पीठा व वन के पक्षी"
    },
    description: {
      en: "Match 5 pairs: Steamed pitha, singing bird, tea, silk, and lotus.",
      bn: "৫ জোড়া মেলান: সুস্বাদু পিঠা, গানের পাখি, চা, রেশম ও পদ্ম।",
      hi: "५ जोड़े पहचानिए: स्वादिष्ट पीठा, सुंदर चिड़िया, चाय, रेशम व कमल।"
    }
  },
  {
    level: 8,
    pairsCount: 5,
    symbolsSubset: ['rhino', 'dhol', 'japi', 'pepa', 'lamp'],
    title: {
      en: "Level 8: Forest Song & Festivity",
      bn: "ধাপ ৮: অরণ্যের সুর ও আনন্দমেলা",
      hi: "स्तर ८: जंगल की धुन व उत्सव"
    },
    description: {
      en: "Match 5 pairs: Rhino, festival dhol, bamboo flute, japi, and lamp.",
      bn: "৫ জোড়া মেলান: গণ্ডার, ঢোল, বাঁশি, জাপি ও প্রদীপ।",
      hi: "५ जोड़े मिलाइए: गैंडा, ढोल, बांसुरी, जापी और पावन दीया।"
    }
  },
  {
    level: 9,
    pairsCount: 6,
    symbolsSubset: ['tea', 'gamusa', 'japi', 'rhino', 'bell', 'lamp'],
    title: {
      en: "Level 9: Heritage Mastery",
      bn: "ধাপ ৯: উত্তর-পূর্বের ঐতিহ্য বিস্তার",
      hi: "स्तर ९: उत्तर-पूर्व की विरासत"
    },
    description: {
      en: "Match 6 pairs across our most cherished cultural treasures.",
      bn: "৬ জোড়া মেলান: আমাদের প্রিয় ঐতিহ্য ও স্মৃতির সম্ভার।",
      hi: "६ जोड़े मिलाइए: हमारे सबसे आत्मीय सांस्कृतिक प्रतीक।"
    }
  },
  {
    level: 10,
    pairsCount: 6,
    symbolsSubset: ['lotus', 'silk', 'dhol', 'pepa', 'pitha', 'bird'],
    title: {
      en: "Level 10: Grand Himalayan Celebration",
      bn: "ধাপ ১০: মহা হিমালয় স্মৃতি আনন্দ",
      hi: "स्तर १०: महा हिमालय स्मृति उत्सव"
    },
    description: {
      en: "The master level: 6 pairs celebrating melody, nature, and joy.",
      bn: "চূড়ান্ত ধাপ: সুর, প্রকৃতি ও আনন্দের ৬টি মনোমুগ্ধকর জোড়া।",
      hi: "अंतिम स्तर: संगीत, प्रकृति और आनंद के ६ सुंदर जोड़े।"
    }
  }
];

// 2. Sound & Pattern Harmony: 10 Progressive Levels
export const PATTERN_INSTRUMENTS = [
  { id: 'dhol', symbol: '🥁', name: { en: 'Bihu Dhol', bn: 'বিহুর ঢোল', hi: 'बिहू ढोल' }, noteIdx: 0 },
  { id: 'bell', symbol: '🔔', name: { en: 'Temple Bell', bn: 'মন্দিরের ঘণ্টা', hi: 'मंदिर घंटी' }, noteIdx: 1 },
  { id: 'pepa', symbol: '🪈', name: { en: 'Bamboo Flute', bn: 'বাঁশের বাঁশি', hi: 'बांसुरी' }, noteIdx: 2 },
  { id: 'diya', symbol: '🪔', name: { en: 'Golden Flame', bn: 'সোনার প্রদীপ', hi: 'स्वर्ण दीप' }, noteIdx: 3 },
];

export const PATTERN_LEVELS: PatternGameLevelConfig[] = [
  {
    level: 1,
    sequenceLength: 2,
    speedMs: 750,
    title: { en: "Level 1: Gentle Echo", bn: "ধাপ ১: স্নিগ্ধ প্রতিধ্বনি", hi: "स्तर १: कोमल प्रतिध्वनि" },
    description: { en: "Watch and repeat the 2 gentle notes in sequence.", bn: "২টি সুরের আলো মনোযোগ দিয়ে দেখে ক্রমানুসারে স্পর্শ করুন।", hi: "२ सुरों की चमक ध्यान से देखकर उसी क्रम में छूएं।" }
  },
  {
    level: 2,
    sequenceLength: 2,
    speedMs: 700,
    title: { en: "Level 2: River Bells", bn: "ধাপ ২: নদীর ঘণ্টার সুর", hi: "स्तर २: नदी किनारे घंटियां" },
    description: { en: "Listen to the 2 resonant bell tones and repeat.", bn: "২টি মিষ্টি সুরের ধ্বনি শুনে পুনরাবৃত্তি করুন।", hi: "२ मधुर घंटियों के सुर सुनकर दोहराएं।" }
  },
  {
    level: 3,
    sequenceLength: 3,
    speedMs: 700,
    title: { en: "Level 3: Three Morning Chimes", bn: "ধাপ ৩: সকালের তিনটি সুর", hi: "स्तर ३: सुबह के तीन सुर" },
    description: { en: "Follow the 3-step melody of the hills.", bn: "পাহাড়ের তিনটি সুরের ক্রম মিলিয়ে নিন।", hi: "पहाड़ों के तीन सुरों का क्रम दोहराएं।" }
  },
  {
    level: 4,
    sequenceLength: 3,
    speedMs: 650,
    title: { en: "Level 4: Valley Rhythm", bn: "ধাপ ৪: উপত্যকার ছন্দ", hi: "स्तर ४: घाटी की ताल" },
    description: { en: "A warm 3-note melody from the bamboo groves.", bn: "বাঁশবনের ৩টি শান্ত সুর মনে রাখুন।", hi: "बांस के वनों के ३ सुर याद रखिए।" }
  },
  {
    level: 5,
    sequenceLength: 4,
    speedMs: 650,
    title: { en: "Level 5: Four Seasons Song", bn: "ধাপ ৫: ঋতুসংগীতের চার সুর", hi: "स्तर ५: ऋतुओं के चार सुर" },
    description: { en: "Follow the 4-step musical sequence calmly.", bn: "৪টি সুরের সংগীতময় ক্রম শান্তভাবে মনে রাখুন।", hi: "४ सुरों के संगीतमय क्रम को शांति से दोहराएं।" }
  },
  {
    level: 6,
    sequenceLength: 4,
    speedMs: 600,
    title: { en: "Level 6: Temple Chimes", bn: "ধাপ ৬: মন্দিরের সান্ধ্য সুর", hi: "स्तर ६: संध्या आरती सुर" },
    description: { en: "Echo the 4 temple tones with care.", bn: "স্নেহভরে ৪টি ঘণ্টার সুরের পুনরাবৃত্তি করুন।", hi: "स्नेहपूर्वक ४ घंटियों के सुर दोहराएं।" }
  },
  {
    level: 7,
    sequenceLength: 5,
    speedMs: 600,
    title: { en: "Level 7: Hillside Harmony", bn: "ধাপ ৭: পাহাড়ি তান", hi: "स्तर ७: पहाड़ी धुन" },
    description: { en: "Follow the 5-step soothing pattern.", bn: "৫টি সুরের সুন্দর ছন্দ মনে রাখুন।", hi: "५ सुरों का सुंदर क्रम याद रखें।" }
  },
  {
    level: 8,
    sequenceLength: 5,
    speedMs: 550,
    title: { en: "Level 8: Forest Breeze", bn: "ধাপ ৮: অরণ্যের সমীরণ", hi: "स्तर ८: वन की बयार" },
    description: { en: "A flowing 5-note breeze through the trees.", bn: "গাছপালার মধ্য দিয়ে বয়ে যাওয়া ৫টি সুরের ছোঁয়া।", hi: "पेड़ों के बीच बहते ५ सुरों का स्पर्श।" }
  },
  {
    level: 9,
    sequenceLength: 6,
    speedMs: 550,
    title: { en: "Level 9: Brahmaputra Waves", bn: "ধাপ ৯: ব্রহ্মপুত্রের ঢেউ", hi: "स्तर ९: ब्रह्मपुत्र की तरंगें" },
    description: { en: "6 harmonious steps like gentle river ripples.", bn: "নদীর শান্ত ঢেউয়ের মতো ৬টি ধারাবাহিক সুর।", hi: "नदी की शांत लहरों जैसे ६ क्रमिक सुर।" }
  },
  {
    level: 10,
    sequenceLength: 7,
    speedMs: 520,
    title: { en: "Level 10: Master Symphony of Peace", bn: "ধাপ ১০: প্রশান্তির মহাশঙ্খধ্বনি", hi: "स्तर १०: शांति का महासंगीत" },
    description: { en: "The ultimate 7-note meditative symphony.", bn: "সর্বোচ্চ ৭টি সুরের ধ্যানমগ্ন প্রশান্ত সুরমালা।", hi: "सर्वोच्च ७ सुरों की ध्यानमयी पावन सुरमाला।" }
  }
];

// 3. Daily Routine & Visual Association Recall: 10 Levels
export const ASSOCIATION_LEVELS: AssociationGameLevelConfig[] = [
  {
    level: 1,
    title: {
      en: "Level 1: Gentle Morning Warmth",
      bn: "ধাপ ১: ভোরের প্রথম স্নিগ্ধতা",
      hi: "स्तर १: सुबह की पहली कोमलता"
    },
    prompt: {
      en: "What brings cozy warmth and comfort when sitting with family in the crisp morning air?",
      bn: "সকালের মনোরম বাতাসে পরিবারের সাথে বসে গল্প করার সময় কোনটি সবচেয়ে তৃপ্তিদায়ক?",
      hi: "सुबह की ठंडी ताजी हवा में परिवार के साथ बैठते समय कौन सा पेय सुकून देता है?"
    },
    culturalMemory: {
      en: "A piping hot cup of Assam tea garden leaves brewed with love.",
      bn: "স্নেহে ভরা আসামের বাগানের সতেজ পাতার এক কাপ গরম চা।",
      hi: "असम के बागानों की महकती हुई गरमागरम ताजी चाय।"
    },
    correctOptionId: 'tea',
    options: [
      {
        id: 'tea',
        symbol: '🍃',
        label: { en: "Fresh Tea Leaves", bn: "সতেজ চা পাতা", hi: "ताजा चाय पत्ती" },
        detail: { en: "Steaming hot morning Assam tea", bn: "ধোঁয়া ওঠা ভোরের প্রিয় চা", hi: "भाप उड़ती हुई सुबह की चाय" }
      },
      {
        id: 'moon',
        symbol: '🌙',
        label: { en: "Night Moon", bn: "রাতের চাঁদ", hi: "रात का चांद" },
        detail: { en: "Belongs to the quiet night", bn: "রাতের শান্ত আকাশের প্রতীক", hi: "रात के शांत आकाश का प्रतीक" }
      },
      {
        id: 'stone',
        symbol: '🪨',
        label: { en: "River Pebble", bn: "নদীর নুড়িপাথর", hi: "नदी का पत्थर" },
        detail: { en: "Cool stone by the water", bn: "নদীর তীরের শীতল পাথর", hi: "नदी किनारे का ठंडा पत्थर" }
      }
    ]
  },
  {
    level: 2,
    title: {
      en: "Level 2: Morning Prayer Resonance",
      bn: "ধাপ ২: প্রভাতী প্রার্থনার মঙ্গলধ্বনি",
      hi: "स्तर २: प्रभात की पावन प्रार्थना"
    },
    prompt: {
      en: "What sacred sound awakens the village temple with blessings at sunrise?",
      bn: "সূর্যোদয়ের সময় গ্রামের মন্দিরে কোন পবিত্র ধ্বনি চারপাশকে শান্ত করে তোলে?",
      hi: "सूर्योदय के समय मंदिर में कौन सी पावन ध्वनि वातावरण को शांत व पवित्र बनाती है?"
    },
    culturalMemory: {
      en: "The pure, resonant tone of the sacred temple brass bell.",
      bn: "মন্দিরের পিতলের ঘণ্টার সুমধুর ও পবিত্র সুর।",
      hi: "मंदिर की पीतल की घंटी की गूंजती हुई मधुर ध्वनि।"
    },
    correctOptionId: 'bell',
    options: [
      {
        id: 'rhino',
        symbol: '🦏',
        label: { en: "Kaziranga Rhino", bn: "একশৃঙ্গ গণ্ডার", hi: "एक सींग वाला गैंडा" },
        detail: { en: "Peaceful wildlife in the park", bn: "বনের শান্ত প্রাণী", hi: "जंगल का शांत प्राणी" }
      },
      {
        id: 'bell',
        symbol: '🔔',
        label: { en: "Temple Brass Bell", bn: "মন্দিরের পিতলের ঘণ্টা", hi: "मंदिर की पीतल घंटी" },
        detail: { en: "Fills the morning with serene joy", bn: "সকালে পবিত্র সুর তোলে", hi: "सुबह पावन तरंगें बिखेरती है" }
      },
      {
        id: 'shoe',
        symbol: '👞',
        label: { en: "Walking Shoes", bn: "চলার জুতো", hi: "चलने के जूते" },
        detail: { en: "For walking outside", bn: "বাইরে হাঁটার জন্য", hi: "सैर पर जाने के लिए" }
      }
    ]
  },
  {
    level: 3,
    title: {
      en: "Level 3: Welcoming Respected Guests",
      bn: "ধাপ ৩: শ্রদ্ধা ও আতিথেয়তার উপহার",
      hi: "स्तर ३: सम्मान और आतिथ्य"
    },
    prompt: {
      en: "When revered elders or dear guests visit, what handwoven gift is draped with heartfelt respect?",
      bn: "সম্মানিত অতিথি বা প্রিয়জনেরা এলে কোন লাল-সাদা হস্তবস্ত্রটি শ্রদ্ধার সাথে পরিয়ে দেওয়া হয়?",
      hi: "घर आए आदरणीय अतिथियों को कौन सा लाल व सफेद हाथ से बुना पारंपरिक वस्त्र पहनाया जाता है?"
    },
    culturalMemory: {
      en: "The traditional Gamusa, handwoven with crimson borders and deep affection.",
      bn: "শ্রদ্ধা ও ভালোবাসার লাল-সাদা সূতায় বোনা ঐতিহ্যবাহী গামোচা।",
      hi: "स्नेह और सम्मान से बुना हुआ पारंपरिक असमिया गमोछा।"
    },
    correctOptionId: 'gamusa',
    options: [
      {
        id: 'gamusa',
        symbol: '🧣',
        label: { en: "Traditional Gamusa", bn: "ঐতিহ্যবাহী গামোচা", hi: "पारंपरिक गमोछा" },
        detail: { en: "Handwoven red & white respect", bn: "শ্রদ্ধা ও স্নেহের উপহার", hi: "स्नेह व सम्मान का प्रतीक" }
      },
      {
        id: 'book',
        symbol: '📖',
        label: { en: "Reading Book", bn: "পড়ার বই", hi: "किताब" },
        detail: { en: "For quiet afternoon reading", bn: "বিকালে পাঠ করার জন্য", hi: "दोपहर में पढ़ने के लिए" }
      },
      {
        id: 'bucket',
        symbol: '🪣',
        label: { en: "Water Pail", bn: "জলের বালতি", hi: "पानी की बाल्टी" },
        detail: { en: "Household utility", bn: "গৃহস্থালির কাজের পাত্র", hi: "घर के उपयोग की बाल्टी" }
      }
    ]
  },
  {
    level: 4,
    title: {
      en: "Level 4: Dusk & Evening Blessings",
      bn: "ধাপ ৪: সাঁঝের আলো ও প্রদীপ",
      hi: "स्तर ४: संध्या व दीप का प्रकाश"
    },
    prompt: {
      en: "As the sun dips behind the hills, what warm light is gently illuminated in the courtyard?",
      bn: "পাহাড়ের আড়ালে সূর্য ঢলে পড়লে উঠানে শান্তির জন্য কোন সোনালী আলোটি জ্বালানো হয়?",
      hi: "सूरज ढलने पर आंगन में सुख-शांति के लिए कौन सा पावन प्रकाश प्रज्वलित किया जाता है?"
    },
    culturalMemory: {
      en: "The warm earthen clay diya, warding away shadows with golden light.",
      bn: "গৃহকোণে সোনালী আলো ছড়ানো মাটির মঙ্গল প্রদীপ।",
      hi: "घर के आंगन में उजाला बिखेरता पवित्र मिट्टी का दीपक।"
    },
    correctOptionId: 'diya',
    options: [
      {
        id: 'sun',
        symbol: '☀️',
        label: { en: "Blazing Midday Sun", bn: "দুপুরের প্রখর রোদ", hi: "दोपहर की तेज धूप" },
        detail: { en: "Belongs to noon", bn: "দুপুরের সময়ের প্রতীক", hi: "दोपहर का समय" }
      },
      {
        id: 'diya',
        symbol: '🪔',
        label: { en: "Clay Diya Lamp", bn: "মাটির প্রদীপ", hi: "मिट्टी का पावन दीया" },
        detail: { en: "Warm golden flame at twilight", bn: "সন্ধ্যার শান্ত সোনালী শিখা", hi: "संध्या का पावन सुनहरा दीप" }
      },
      {
        id: 'umbrella',
        symbol: '☂️',
        label: { en: "Rain Umbrella", bn: "বৃষ্টির ছাতা", hi: "बरसात की छतरी" },
        detail: { en: "For stormy days", bn: "ঝড়-বৃষ্টির সময়ের জন্য", hi: "बारिश के समय के लिए" }
      }
    ]
  },
  {
    level: 5,
    title: {
      en: "Level 5: Vital Daily Hydration",
      bn: "ধাপ ৫: দৈনিক স্বাস্থ্য ও জলপান",
      hi: "स्तर ५: दैनिक स्वास्थ्य व जलपान"
    },
    prompt: {
      en: "What essential healthy routine keeps your body refreshed and mind alert throughout the day?",
      bn: "সারা দিন শরীর সুস্থ ও সতেজ রাখতে নিয়মিত কী পান করা একান্ত প্রয়োজন?",
      hi: "पूरे दिन शरीर को ताजगी और स्फूर्ति देने के लिए नियमित क्या पीना सबसे जरूरी है?"
    },
    culturalMemory: {
      en: "A pure glass of warm water or soothing lemon water.",
      bn: "পর্যাপ্ত বিশুদ্ধ কুসুম গরম জল বা হালকা লেবুর শরবত।",
      hi: "शुद्ध गुनगुना पानी या नींबू पानी का पर्याप्त सेवन।"
    },
    correctOptionId: 'water',
    options: [
      {
        id: 'water',
        symbol: '💧',
        label: { en: "Pure Fresh Water", bn: "বিশুদ্ধ জল", hi: "शुद्ध ताजा पानी" },
        detail: { en: "Keeps memory & body hydrated", bn: "শরীর সুস্থ ও সতেজ রাখে", hi: "शरीर को ऊर्जावान रखता है" }
      },
      {
        id: 'spices',
        symbol: '🌶️',
        label: { en: "Hot Red Chili", bn: "ঝাল লঙ্কা", hi: "तीखी मिर्च" },
        detail: { en: "Too spicy for elderly care", bn: "প্রবীণদের জন্য অতিরিক্ত ঝাল", hi: "बुजुर्गों के लिए बहुत तीखी" }
      },
      {
        id: 'key',
        symbol: '🔑',
        label: { en: "Brass Key", bn: "পিতলের চাবি", hi: "पीतल की चाबी" },
        detail: { en: "For opening locks", bn: "দরজা খোলার চাবি", hi: "ताला खोलने की चाबी" }
      }
    ]
  },
  {
    level: 6,
    title: {
      en: "Level 6: Valley Shade & Bamboo Craft",
      bn: "ধাপ ৬: রোদের ছায়া ও বাঁশের জাপি",
      hi: "स्तर ६: धूप की छांव व जापी"
    },
    prompt: {
      en: "What conical bamboo hat protects elders and farmers from the hill sunshine and gentle rains?",
      bn: "বাঁশ ও পাতার তৈরি কোন ঐতিহ্যবাহী টুপি রোদ-বৃষ্টি থেকে মাথায় ছায়া জোগায়?",
      hi: "बांस और पत्तों से बनी कौन सी सुंदर टोपी धूप और बारिश से बचाव करती है?"
    },
    culturalMemory: {
      en: "The historic Japi, meticulously woven with red velvet accents.",
      bn: "লাল কাপড় আর বাঁশের নিখুঁত বুননে তৈরি প্রিয় জাপি।",
      hi: "लाल गोटे और बांस से बनी पारंपरिक सुंदर जापी।"
    },
    correctOptionId: 'japi',
    options: [
      {
        id: 'japi',
        symbol: '👒',
        label: { en: "Heritage Japi", bn: "ঐতিহ্যবাহী জাপি", hi: "पारंपरिक जापी" },
        detail: { en: "Bamboo shade and hospitality", bn: "রোদে ছায়া ও আতিথেয়তার প্রতীক", hi: "छांव और आतिथ्य का प्रतीक" }
      },
      {
        id: 'radio',
        symbol: '📻',
        label: { en: "Antique Radio", bn: "পুরনো রেডিও", hi: "रेडियो" },
        detail: { en: "For evening news", bn: "খবর শোনার জন্য", hi: "समाचार सुनने के लिए" }
      },
      {
        id: 'scissors',
        symbol: '✂️',
        label: { en: "Sewing Scissors", bn: "কাঁচি", hi: "कैंची" },
        detail: { en: "For tailoring", bn: "কাপড় কাটার জিনিস", hi: "कपड़ा काटने का औजार" }
      }
    ]
  },
  {
    level: 7,
    title: {
      en: "Level 7: Festive Harvest Delicacies",
      bn: "ধাপ ৭: উৎসবের মিষ্টি পিঠা",
      hi: "स्तर ७: उत्सव का मीठा पीठा"
    },
    prompt: {
      en: "During harvest celebrations, what warm sweet delicacy is lovingly prepared from rice flour and jaggery?",
      bn: "উৎসবের দিনগুলিতে নতুন চালের গুঁড়ো ও গুড় দিয়ে স্নেহে কোন মিষ্টি খাবার তৈরি করা হয়?",
      hi: "उत्सव के दिनों में नए चावल के आटे और गुड़ से कौन सी स्वादिष्ट मीठी मिठाई बनाई जाती है?"
    },
    culturalMemory: {
      en: "Authentic Til Pitha and Ghila Pitha enjoyed with afternoon tea.",
      bn: "চা সহযোগে উপভোগ করা ঐতিহ্যবাহী সুস্বাদু তিল পিঠা।",
      hi: "शाम की चाय के साथ खाया जाने वाला पारंपरिक मीठा पीठा।"
    },
    correctOptionId: 'pitha',
    options: [
      {
        id: 'pitha',
        symbol: '🥮',
        label: { en: "Assam Pitha", bn: "ঐতিহ্যবাহী পিঠা", hi: "पारंपरिक पीठा" },
        detail: { en: "Warm sweet rice treat", bn: "সুস্বাদু মিষ্টি পিঠার স্বাদ", hi: "चावल व गुड़ का स्वादिष्ट पकवान" }
      },
      {
        id: 'hammer',
        symbol: '🔨',
        label: { en: "Carpenter Hammer", bn: "হাতুড়ি", hi: "हथौड़ा" },
        detail: { en: "Workshop tool", bn: "কাজের যন্ত্র", hi: "काम का औजार" }
      },
      {
        id: 'brick',
        symbol: '🧱',
        label: { en: "Red Brick", bn: "লাল ইট", hi: "लाल ईंट" },
        detail: { en: "Building material", bn: "বাড়ি তৈরির ইট", hi: "मकान बनाने की ईंट" }
      }
    ]
  },
  {
    level: 8,
    title: {
      en: "Level 8: Peaceful Pond Lotus",
      bn: "ধাপ ৮: শান্ত দীঘির পদ্মফুল",
      hi: "स्तर ८: शांत सरोवर का कमल"
    },
    prompt: {
      en: "What pristine flower floats gracefully on morning temple ponds, symbolizing tranquility and purity?",
      bn: "সকালের শান্ত পুকুরে কোন মনোহর ফুলটি ভাসে, যা শুচিতা ও শান্তির প্রতীক?",
      hi: "सुबह के शांत सरोवर में कौन सा पवित्र पुष्प खिलता है, जो शांति और शुचिता का प्रतीक है?"
    },
    culturalMemory: {
      en: "The divine pink and red lotus blossoms blooming in quiet waters.",
      bn: "জলের ওপর ফুটে থাকা অপূর্ব লাল পদ্মফুল।",
      hi: "पानी में शांत भाव से खिला हुआ पावन लाल कमल।"
    },
    correctOptionId: 'lotus',
    options: [
      {
        id: 'lotus',
        symbol: '🪷',
        label: { en: "Wild Sacred Lotus", bn: "পবিত্র পদ্মফুল", hi: "पावन कमल पुष्प" },
        detail: { en: "Calm and peaceful blossom", bn: "শান্তিময় প্রস্ফুটিত রূপ", hi: "शांति और पवित्रता का प्रतीक" }
      },
      {
        id: 'tractor',
        symbol: '🚜',
        label: { en: "Farm Tractor", bn: "ট্র্যাক্টর", hi: "ट्रैक्टर" },
        detail: { en: "Field machine", bn: "মাঠের যন্ত্র", hi: "खेत की मशीन" }
      },
      {
        id: 'lock',
        symbol: '🔒',
        label: { en: "Iron Lock", bn: "লোহার তালা", hi: "ताला" },
        detail: { en: "Hardware item", bn: "নিরাপত্তা তালা", hi: "सुरक्षा का ताला" }
      }
    ]
  },
  {
    level: 9,
    title: {
      en: "Level 9: Forest Wildlife Guardian",
      bn: "ধাপ ৯: অরণ্যের শান্ত রক্ষক",
      hi: "स्तर ९: जंगल का शांत संरक्षक"
    },
    prompt: {
      en: "What majestic, gentle one-horned animal roams the tall grass wetlands of Kaziranga?",
      bn: "কাজিরাঙার উঁচু কাশবন ও জলাভূমিতে কোন শান্ত একশৃঙ্গ বন্যপ্রাণী বিচরণ করে?",
      hi: "काजीरंगा के लंबे घास के मैदानों में कौन सा शांत व भव्य एक सींग वाला वन्यजीव विचरण करता है?"
    },
    culturalMemory: {
      en: "The historic Indian One-Horned Rhinoceros, pride of the valley.",
      bn: "উপত্যকার গর্ব আমাদের শান্ত একশৃঙ্গ গণ্ডার।",
      hi: "असम की पावन भूमि का गौरव, एक सींग वाला गैंडा।"
    },
    correctOptionId: 'rhino',
    options: [
      {
        id: 'rhino',
        symbol: '🦏',
        label: { en: "One-Horned Rhino", bn: "একশৃঙ্গ গণ্ডার", hi: "एक सींग वाला गैंडा" },
        detail: { en: "Pride of Kaziranga", bn: "কাজিরাঙার গর্ব", hi: "काजीरंगा की शान" }
      },
      {
        id: 'chair',
        symbol: '🪑',
        label: { en: "Wooden Chair", bn: "কাঠের চেয়ার", hi: "लकड़ी की कुर्सी" },
        detail: { en: "Furniture to sit", bn: "বসার আসন", hi: "बैठने का स्थान" }
      },
      {
        id: 'envelope',
        symbol: '✉️',
        label: { en: "Paper Envelope", bn: "চিঠির খাম", hi: "चिट्ठी का लिफाफा" },
        detail: { en: "Postal letter", bn: "ডাকঘরের খাম", hi: "डाक का लिफाफा" }
      }
    ]
  },
  {
    level: 10,
    title: {
      en: "Level 10: Nighttime Serenity & Rest",
      bn: "ধাপ ১০: রাতের শান্তি ও প্রশান্ত নিদ্রা",
      hi: "स्तर १०: रात की शांति व सुखद निद्रा"
    },
    prompt: {
      en: "When stars blanket the hills, what loving routine prepares your mind for deep, healing sleep?",
      bn: "রাতের আকাশে তারা উঠলে মন ও শরীরকে প্রশান্ত ঘুমের জন্য প্রস্তুত করতে কী করণীয়?",
      hi: "रात में तारों भरी चादर के नीचे, गहरी व सुखद नींद के लिए कौन सी दिनचर्या सबसे उत्तम है?"
    },
    culturalMemory: {
      en: "Taking bedtime medicine, slow lotus breathing, and resting under warm covers.",
      bn: "রাতের ওষুধ সেবন, শান্ত দীর্ঘ শ্বাস এবং উষ্ণ কম্বলের আশ্রয়ে প্রশান্ত বিশ্রাম।",
      hi: "रात की दवा, गहरी व शांत सांस और अपने बिस्तर पर सुकून भरी निद्रा।"
    },
    correctOptionId: 'sleep',
    options: [
      {
        id: 'sleep',
        symbol: '🌙',
        label: { en: "Peaceful Sleep Routine", bn: "প্রশান্ত ঘুমের প্রস্তুতি", hi: "सुखद निद्रा की तैयारी" },
        detail: { en: "Gentle breathing and rest", bn: "শান্ত শ্বাস ও বিশ্রামের আনন্দ", hi: "शांत श्वास और सुखद विश्राम" }
      },
      {
        id: 'alarm',
        symbol: '⏰',
        label: { en: "Loud Ringing Siren", bn: "উচ্চশব্দের সাইরেন", hi: "तेज सायरन" },
        detail: { en: "Harsh loud noise", bn: "অতিরিক্ত চড়া শব্দ", hi: "अनावश्यक तेज शोर" }
      },
      {
        id: 'sun',
        symbol: '☀️',
        label: { en: "Midday Heat", bn: "দুপুরের উত্তাপ", hi: "दोपहर की गर्मी" },
        detail: { en: "Daytime sun", bn: "দিনের রোদ", hi: "दिन की धूप" }
      }
    ]
  }
];

// 4. "My Home" - Identify Objects & Matching Room (10 Progressive Levels)
export const MY_HOME_LEVELS: MyHomeLevelConfig[] = [
  {
    level: 1,
    item: {
      symbol: "🍵",
      name: { en: "Ceramic Tea Cup", bn: "চায়ের কাপ", hi: "चाय का कप" },
      hint: {
        en: "Where do we brew hot morning Assam tea and wash cups?",
        bn: "কোথায় আমরা সকালের গরম চা বানাই এবং কাপ ধুয়ে রাখি?",
        hi: "हम सुबह की गरमागरम चाय कहाँ बनाते हैं और कप रखते हैं?"
      }
    },
    correctRoomId: "kitchen",
    rooms: [
      { id: "kitchen", symbol: "🍳", name: { en: "Kitchen", bn: "রান্নাঘর", hi: "रसोईघर" } },
      { id: "bedroom", symbol: "🛏️", name: { en: "Bedroom", bn: "শোবার ঘর", hi: "शयनकक्ष" } },
      { id: "bathroom", symbol: "🚿", name: { en: "Bathroom", bn: "স্নানঘর", hi: "स्नानागार" } }
    ],
    explanation: {
      en: "A tea cup belongs in the kitchen, near the warm kettle and tea leaves!",
      bn: "চায়ের কাপ থাকে রান্নাঘরে, যেখানে কেটলি ও সুগন্ধি চা পাতা থাকে!",
      hi: "चाय का कप रसोईघर में चाय की केतली और बर्तनों के साथ रहता है!"
    }
  },
  {
    level: 2,
    item: {
      symbol: "🛏️",
      name: { en: "Soft Pillow & Blanket", bn: "নরম বালিশ ও চাদর", hi: "मुलायम तकिया व कंबल" },
      hint: {
        en: "Where do we rest our head for a peaceful afternoon nap and night sleep?",
        bn: "কোথায় আমরা দুপুরে ও রাতে শান্তির ঘুমের জন্য মাথা রাখি?",
        hi: "हम दोपहर व रात को आराम की नींद कहाँ लेते हैं?"
      }
    },
    correctRoomId: "bedroom",
    rooms: [
      { id: "living", symbol: "🛋️", name: { en: "Living Room", bn: "বৈঠকখানা", hi: "बैठक कक्ष" } },
      { id: "bedroom", symbol: "🛏️", name: { en: "Bedroom", bn: "শোবার ঘর", hi: "शयनकक्ष" } },
      { id: "kitchen", symbol: "🍳", name: { en: "Kitchen", bn: "রান্নাঘর", hi: "रसोईघर" } }
    ],
    explanation: {
      en: "The pillow and warm quilt belong on the cozy bed in the bedroom.",
      bn: "নরম বালিশ ও চাদর থাকে শোবার ঘরের খাটের ওপর।",
      hi: "तकिया और चादर शयनकक्ष में बिस्तर पर आराम के लिए होते हैं।"
    }
  },
  {
    level: 3,
    item: {
      symbol: "🧼",
      name: { en: "Fragrant Bath Soap & Towel", bn: "সুগন্ধি সাবান ও তোয়ালে", hi: "सुगंधित साबुन व तौलिया" },
      hint: {
        en: "Where do we wash our hands and take a refreshing morning bath?",
        bn: "কোথায় আমরা হাত-মুখ ধুই এবং স্নান করি?",
        hi: "हम हाथ-मुँह कहाँ धोते हैं और स्नान कहाँ करते हैं?"
      }
    },
    correctRoomId: "bathroom",
    rooms: [
      { id: "bathroom", symbol: "🚿", name: { en: "Bathroom", bn: "স্নানঘর", hi: "स्नानागार" } },
      { id: "kitchen", symbol: "🍳", name: { en: "Kitchen", bn: "রান্নাঘর", hi: "रसोईघर" } },
      { id: "verandah", symbol: "🪴", name: { en: "Verandah", bn: "বারান্দা", hi: "बरामदा" } }
    ],
    explanation: {
      en: "Soap and fresh bath towels belong near the sink in the bathroom.",
      bn: "সাবান ও তোয়ালে থাকে স্নানঘরের বেসিনের পাশে।",
      hi: "साबुन और तौलिया स्नानागार (बाथरूम) में स्वच्छता के लिए रखे जाते हैं।"
    }
  },
  {
    level: 4,
    item: {
      symbol: "🪔",
      name: { en: "Brass Puja Bell & Clay Diya", bn: "পূজার কাঁসার ঘণ্টা ও প্রদীপ", hi: "पूजा की पीतल घंटी व दीया" },
      hint: {
        en: "Where do we light incense, ring the bell, and pray with folded hands?",
        bn: "কোথায় আমরা ধূপ প্রদীপ জ্বালাই এবং হাতজোড় করে প্রার্থনা করি?",
        hi: "हम धूप-दीप कहाँ जलाते हैं और हाथ जोड़कर प्रार्थना कहाँ करते हैं?"
      }
    },
    correctRoomId: "pujaghar",
    rooms: [
      { id: "bedroom", symbol: "🛏️", name: { en: "Bedroom", bn: "শোবার ঘর", hi: "शयनकक्ष" } },
      { id: "pujaghar", symbol: "🪔", name: { en: "Puja Room (Thakur Ghar)", bn: "পূজার ঘর (ঠাকুরঘর)", hi: "पूजा घर / मंदिर" } },
      { id: "living", symbol: "🛋️", name: { en: "Living Room", bn: "বৈঠকখানা", hi: "बैठक कक्ष" } }
    ],
    explanation: {
      en: "The sacred brass bell and lamp belong in the peaceful Puja room.",
      bn: "পূজার কাঁসার ঘণ্টা ও মঙ্গল প্রদীপ ঠাকুরঘরে ভক্তির সাথে রাখা থাকে।",
      hi: "पूजा की पावन घंटी और दीप मंदिर कक्ष (पूजा घर) में शोभा पाते हैं।"
    }
  },
  {
    level: 5,
    item: {
      symbol: "🪴",
      name: { en: "Clay Flower Pot & Watering Can", bn: "মাটির ফুলের টব ও জলদানি", hi: "मिट्टी का गमला व जल-झारी" },
      hint: {
        en: "Where do we place blooming marigolds and water the green plants in fresh air?",
        bn: "কোথায় খোলা বাতাসে গাঁদা ফুলের টব থাকে এবং গাছে জল দেওয়া হয়?",
        hi: "हम ताजी हवा में फूलों के पौधे कहाँ रखते हैं और पानी देते हैं?"
      }
    },
    correctRoomId: "verandah",
    rooms: [
      { id: "verandah", symbol: "🪴", name: { en: "Verandah / Garden", bn: "বারান্দা ও বাগান", hi: "बरामदा व बगीचा" } },
      { id: "bathroom", symbol: "🚿", name: { en: "Bathroom", bn: "স্নানঘর", hi: "स्नानागार" } },
      { id: "kitchen", symbol: "🍳", name: { en: "Kitchen", bn: "রান্নাঘর", hi: "रसोईघर" } }
    ],
    explanation: {
      en: "Flower pots and garden watering cans thrive on the sunlit verandah!",
      bn: "ফুলের টব ও জলদানি রোদের আলোয় বারান্দা বা বাগানে থাকে!",
      hi: "गमले और पानी की झारी धूपदार बरामदे या बगीचे में रखे जाते हैं!"
    }
  },
  {
    level: 6,
    item: {
      symbol: "🍳",
      name: { en: "Spice Box (Masala Dabba)", bn: "মশলার কৌটো ও কড়াই", hi: "मसाला दानी व कड़ाही" },
      hint: {
        en: "Where are turmeric, cumin, mustard seeds, and cooking pans kept?",
        bn: "কোথায় হলুদ, জিরে, সর্ষে ও রান্নার কড়াই থাকে?",
        hi: "हल्दी, जीरा, राई और भोजन पकाने के बर्तन कहाँ रखे जाते हैं?"
      }
    },
    correctRoomId: "kitchen",
    rooms: [
      { id: "bedroom", symbol: "🛏️", name: { en: "Bedroom", bn: "শোবার ঘর", hi: "शयनकक्ष" } },
      { id: "kitchen", symbol: "🍳", name: { en: "Kitchen", bn: "রান্নাঘর", hi: "रसोईघर" } },
      { id: "living", symbol: "🛋️", name: { en: "Living Room", bn: "বৈঠকখানা", hi: "बैठक कक्ष" } }
    ],
    explanation: {
      en: "The aromatic spice box belongs right next to the stove in the kitchen.",
      bn: "সুগন্ধি মশলার কৌটো রান্নাঘরের উনুনের পাশেই থাকে।",
      hi: "मसाला दानी रसोईघर में चूल्हे के समीप रखी जाती है।"
    }
  },
  {
    level: 7,
    item: {
      symbol: "📰",
      name: { en: "Daily Newspaper & Spectacles", bn: "সকালের সংবাদপত্র ও চশমা", hi: "दैनिक समाचार पत्र व चश्मा" },
      hint: {
        en: "Where do we sit comfortably on the sofa to read morning news and talk with visitors?",
        bn: "কোথায় আমরা সোফায় বসে খবরের কাগজ পড়ি ও অতিথিদের সাথে কথা বলি?",
        hi: "हम सोफे पर बैठकर अखबार कहाँ पढ़ते हैं और मेहमानों से बातचीत करते हैं?"
      }
    },
    correctRoomId: "living",
    rooms: [
      { id: "living", symbol: "🛋️", name: { en: "Living Room", bn: "বৈঠকখানা", hi: "बैठक कक्ष" } },
      { id: "bathroom", symbol: "🚿", name: { en: "Bathroom", bn: "স্নানঘর", hi: "स्नानागार" } },
      { id: "pujaghar", symbol: "🪔", name: { en: "Puja Room", bn: "পূজার ঘর", hi: "पूजा घर" } }
    ],
    explanation: {
      en: "Reading glasses and newspapers sit nicely on the coffee table in the living room.",
      bn: "খবরের কাগজ ও চশমা বৈঠকখানার টেবিলের ওপর রাখা থাকে।",
      hi: "अखबार और चश्मा बैठक कक्ष (लिविंग रूम) की मेज पर रखे जाते हैं।"
    }
  },
  {
    level: 8,
    item: {
      symbol: "🪞",
      name: { en: "Wardrobe & Ironed Kurtas", bn: "আলমারি ও ইস্ত্রি করা পোশাক", hi: "अलमारी व साफ कपड़े" },
      hint: {
        en: "Where do we keep our folded sarees, kurtas, and dressing mirror?",
        bn: "কোথায় আমরা পরিপাটি শাড়ি, কুর্তা ও ড্রেসিং টেবিল রাখি?",
        hi: "हम धुले व साफ वस्त्र और कपड़े रखने की अलमारी कहाँ रखते हैं?"
      }
    },
    correctRoomId: "bedroom",
    rooms: [
      { id: "kitchen", symbol: "🍳", name: { en: "Kitchen", bn: "রান্নাঘর", hi: "रसोईघर" } },
      { id: "bedroom", symbol: "🛏️", name: { en: "Bedroom", bn: "শোবার ঘর", hi: "शयनकक्ष" } },
      { id: "verandah", symbol: "🪴", name: { en: "Verandah", bn: "বারান্দা", hi: "बरामदा" } }
    ],
    explanation: {
      en: "The clothes wardrobe and mirror belong in the peaceful bedroom.",
      bn: "পোশাকের আলমারি ও আয়না শোবার ঘরেই মানানসই।",
      hi: "कपड़ों की अलमारी और शीशा शयनकक्ष में सजे होते हैं।"
    }
  },
  {
    level: 9,
    item: {
      symbol: "🪣",
      name: { en: "Water Bucket & Plastic Mug", bn: "জলের বালতি ও মগ", hi: "पानी की बाल्टी व मग" },
      hint: {
        en: "Where do we find the water tap, bucket, and bathing mug?",
        bn: "কোথায় জলের কল, বালতি ও মগ থাকে?",
        hi: "पानी का नल, बाल्टी और नहाने का मग कहाँ मिलते हैं?"
      }
    },
    correctRoomId: "bathroom",
    rooms: [
      { id: "living", symbol: "🛋️", name: { en: "Living Room", bn: "বৈঠকখানা", hi: "बैठक कक्ष" } },
      { id: "bathroom", symbol: "🚿", name: { en: "Bathroom", bn: "স্নানঘর", hi: "स्नानागार" } },
      { id: "pujaghar", symbol: "🪔", name: { en: "Puja Room", bn: "পূজার ঘর", hi: "पूजा घर" } }
    ],
    explanation: {
      en: "The bucket and mug are kept right below the water tap in the bathroom.",
      bn: "বালতি ও মগ স্নানঘরের জলের কলের নিচেই থাকে।",
      hi: "बाल्टी और मग स्नानागार में पानी के नल के नीचे रखे जाते हैं।"
    }
  },
  {
    level: 10,
    item: {
      symbol: "🪑",
      name: { en: "Cane Rocking Chair", bn: "বেতের আরামকেদারা", hi: "बेंत की आरामकुर्सी" },
      hint: {
        en: "Where do elders love to sit in the gentle evening breeze watching the street birds?",
        bn: "কোথায় বিকালের মিঠে বাতাসে বসে পাখিদের ওড়া দেখা যায়?",
        hi: "शाम की शीतल बयार में बैठकर बाहर का दृश्य देखने की कुर्सी कहाँ होती है?"
      }
    },
    correctRoomId: "verandah",
    rooms: [
      { id: "verandah", symbol: "🪴", name: { en: "Verandah", bn: "বারান্দা", hi: "बरामदा" } },
      { id: "bathroom", symbol: "🚿", name: { en: "Bathroom", bn: "স্নানঘর", hi: "स्नानागार" } },
      { id: "kitchen", symbol: "🍳", name: { en: "Kitchen", bn: "রান্নাঘর", hi: "रसोईघर" } }
    ],
    explanation: {
      en: "The breezy verandah is the best spot for the beloved cane rocking chair!",
      bn: "বেতের আরামকেদারা বারান্দার স্নিগ্ধ ছায়াতেই সবচেয়ে আনন্দদায়ক!",
      hi: "बेंत की आरामकुर्सी हवादार बरामदे में बैठने के लिए सबसे उत्तम है!"
    }
  }
];

// 5. "Sort It Out" - Categorize Objects into Categories (Food, Clothes, Animals, etc.) (10 Levels)
export const SORT_IT_OUT_LEVELS: SortItOutLevelConfig[] = [
  {
    level: 1,
    title: { en: "Level 1: Food vs Clothes", bn: "ধাপ ১: খাবার বনাম পোশাক", hi: "स्तर १: भोजन बनाम वस्त्र" },
    description: {
      en: "Sort these items into Food or Clothes categories.",
      bn: "উপাদানগুলোকে খাবার অথবা পোশাকের ঝুড়িতে সাজিয়ে রাখুন।",
      hi: "इन वस्तुओं को भोजन या वस्त्र की श्रेणी में छांटिए।"
    },
    categories: [
      { id: "food", symbol: "🍲", name: { en: "Food", bn: "খাবার", hi: "भोजन" } },
      { id: "clothes", symbol: "👗", name: { en: "Clothes", bn: "পোশাক", hi: "वस्त्र" } }
    ],
    items: [
      { id: "s1", symbol: "🍎", name: { en: "Red Apple", bn: "লাল আপেল", hi: "लाल सेब" }, categoryId: "food" },
      { id: "s2", symbol: "👗", name: { en: "Cotton Saree", bn: "সুতির শাড়ি", hi: "सूती साड़ी" }, categoryId: "clothes" },
      { id: "s3", symbol: "🍌", name: { en: "Sweet Banana", bn: "পাকা কলা", hi: "पका केला" }, categoryId: "food" },
      { id: "s4", symbol: "🧣", name: { en: "Woolen Shawl", bn: "উলের চাদর", hi: "ऊनी शॉल" }, categoryId: "clothes" }
    ]
  },
  {
    level: 2,
    title: { en: "Level 2: Food vs Animals", bn: "ধাপ ২: খাবার বনাম পশু-পাখি", hi: "स्तर २: भोजन बनाम पशु-पक्षी" },
    description: {
      en: "Separate nutritious foods from gentle animals.",
      bn: "পুষ্টিকর খাবার এবং নিরীহ পশু-পাখিদের আলাদা করুন।",
      hi: "पौष्टिक भोजन और शांत पशुओं को अलग-अलग करिए।"
    },
    categories: [
      { id: "food", symbol: "🍲", name: { en: "Food", bn: "খাবার", hi: "भोजन" } },
      { id: "animals", symbol: "🐘", name: { en: "Animals", bn: "পশু-পাখি", hi: "पशु-पक्षी" } }
    ],
    items: [
      { id: "s5", symbol: "🍚", name: { en: "Steamed Rice", bn: "গরম ভাত", hi: "गरम चावल" }, categoryId: "food" },
      { id: "s6", symbol: "🐘", name: { en: "Gentle Elephant", bn: "হাতি", hi: "हाथी" }, categoryId: "animals" },
      { id: "s7", symbol: "🥭", name: { en: "Juicy Mango", bn: "মিষ্টি আম", hi: "मीठा आम" }, categoryId: "food" },
      { id: "s8", symbol: "🦌", name: { en: "Forest Deer", bn: "হরিণ", hi: "हिरण" }, categoryId: "animals" }
    ]
  },
  {
    level: 3,
    title: { en: "Level 3: Clothes vs Animals", bn: "ধাপ ৩: পোশাক বনাম প্রাণী", hi: "स्तर ३: वस्त्र बनाम प्राणी" },
    description: {
      en: "Sort traditional clothing and forest animals.",
      bn: "ঐতিহ্যবাহী পোশাক ও বনের প্রাণীদের সঠিক ভাগে রাখুন।",
      hi: "पारंपरिक पहनावे और वन्य प्राणियों को सही डिब्बे में रखिए।"
    },
    categories: [
      { id: "clothes", symbol: "👗", name: { en: "Clothes", bn: "পোশাক", hi: "वस्त्र" } },
      { id: "animals", symbol: "🐅", name: { en: "Animals", bn: "প্রাণী", hi: "प्राणी" } }
    ],
    items: [
      { id: "s9", symbol: "🥻", name: { en: "Assam Gamusa", bn: "গামোচা", hi: "गमोसा" }, categoryId: "clothes" },
      { id: "s10", symbol: "🐅", name: { en: "Royal Bengal Tiger", bn: "রয়েল বেঙ্গল বাঘ", hi: "बंगाल बाघ" }, categoryId: "animals" },
      { id: "s11", symbol: "👒", name: { en: "Sun Hat / Japi", bn: "টুপি / জাপি", hi: "टोपी / जापी" }, categoryId: "clothes" },
      { id: "s12", symbol: "🐦", name: { en: "Singing Myna", bn: "ময়না পাখি", hi: "मैना पक्षी" }, categoryId: "animals" }
    ]
  },
  {
    level: 4,
    title: { en: "Level 4: Food, Clothes & Animals", bn: "ধাপ ৪: খাবার, পোশাক ও প্রাণী", hi: "स्तर ४: भोजन, वस्त्र व प्राणी" },
    description: {
      en: "Sort all 6 items into 3 distinct categories.",
      bn: "৬টি উপাদানকে ৩টি সঠিক ভাগে আলাদা করুন।",
      hi: "सभी ६ वस्तुओं को ३ सही श्रेणियों में छांटिए।"
    },
    categories: [
      { id: "food", symbol: "🍲", name: { en: "Food", bn: "খাবার", hi: "भोजन" } },
      { id: "clothes", symbol: "👗", name: { en: "Clothes", bn: "পোশাক", hi: "वस्त्र" } },
      { id: "animals", symbol: "🦏", name: { en: "Animals", bn: "প্রাণী", hi: "प्राणी" } }
    ],
    items: [
      { id: "s13", symbol: "🍲", name: { en: "Dal & Rice", bn: "ডাল-ভাত", hi: "दाल-चावल" }, categoryId: "food" },
      { id: "s14", symbol: "👘", name: { en: "Cotton Kurta", bn: "কুর্তা", hi: "कुर्ता" }, categoryId: "clothes" },
      { id: "s15", symbol: "🦏", name: { en: "One-Horned Rhino", bn: "একশৃঙ্গ গণ্ডার", hi: "एक सींग वाला गैंडा" }, categoryId: "animals" },
      { id: "s16", symbol: "🍞", name: { en: "Soft Roti / Bread", bn: "রুটি", hi: "नरम रोटी" }, categoryId: "food" },
      { id: "s17", symbol: "🧦", name: { en: "Warm Socks", bn: "উলের মোজা", hi: "मोज़े" }, categoryId: "clothes" },
      { id: "s18", symbol: "🐄", name: { en: "Dairy Cow", bn: "দেশি গাই গরু", hi: "गौ माता" }, categoryId: "animals" }
    ]
  },
  {
    level: 5,
    title: { en: "Level 5: Kitchen vs Living Room", bn: "ধাপ ৫: রান্নাঘর বনাম বৈঠকখানা", hi: "स्तर ५: रसोईघर बनाम बैठक कक्ष" },
    description: {
      en: "Categorize kitchen utensils and living room comforts.",
      bn: "রান্নাঘরের বাসনকোসন ও বৈঠকখানার সামগ্রী আলাদা করুন।",
      hi: "रसोई के बर्तन और बैठक कक्ष के सामान को छांटिए।"
    },
    categories: [
      { id: "kitchen", symbol: "🥄", name: { en: "Kitchen Utensils", bn: "রান্নার পাত্র", hi: "रसोई के बर्तन" } },
      { id: "living", symbol: "🛋️", name: { en: "Living Room", bn: "বৈঠকখানার আসবাব", hi: "बैठक कक्ष" } }
    ],
    items: [
      { id: "s19", symbol: "🥄", name: { en: "Steel Spoon", bn: "চামচ", hi: "चम्मच" }, categoryId: "kitchen" },
      { id: "s20", symbol: "🛋️", name: { en: "Cushion Sofa", bn: "সোফা", hi: "सोफा" }, categoryId: "living" },
      { id: "s21", symbol: "🫖", name: { en: "Tea Kettle", bn: "চায়ের কেটলি", hi: "चायदानी" }, categoryId: "kitchen" },
      { id: "s22", symbol: "📻", name: { en: "Old Radio / Clock", bn: "রেডিও ও ঘড়ি", hi: "रेडियो व दीवार घड़ी" }, categoryId: "living" }
    ]
  },
  {
    level: 6,
    title: { en: "Level 6: Flowers vs Fruits vs Veggies", bn: "ধাপ ৬: ফুল, ফল ও সবজি", hi: "स्तर ६: फूल, फल व सब्जियां" },
    description: {
      en: "Sort blossoms, sweet fruits, and fresh garden vegetables.",
      bn: "সুগন্ধি ফুল, মিষ্টি ফল এবং পুষ্টিকর সবজি সাজান।",
      hi: "फूल, मीठे फल और हरी सब्जियों को अलग करिए।"
    },
    categories: [
      { id: "flowers", symbol: "🌺", name: { en: "Flowers", bn: "ফুল", hi: "फूल" } },
      { id: "fruits", symbol: "🍊", name: { en: "Fruits", bn: "ফল", hi: "फल" } },
      { id: "veggies", symbol: "🥕", name: { en: "Vegetables", bn: "সবজি", hi: "सब्जियां" } }
    ],
    items: [
      { id: "s23", symbol: "🪷", name: { en: "Pink Lotus", bn: "পদ্মফুল", hi: "कमल का फूल" }, categoryId: "flowers" },
      { id: "s24", symbol: "🍊", name: { en: "Juicy Orange", bn: "কমলালেবু", hi: "संतरा" }, categoryId: "fruits" },
      { id: "s25", symbol: "🥕", name: { en: "Sweet Carrot", bn: "গাজর", hi: "गाजर" }, categoryId: "veggies" },
      { id: "s26", symbol: "🌺", name: { en: "Red Hibiscus", bn: "জবা ফুল", hi: "गुड़हल" }, categoryId: "flowers" },
      { id: "s27", symbol: "🍇", name: { en: "Fresh Grapes", bn: "আঙুর", hi: "अंगूर" }, categoryId: "fruits" },
      { id: "s28", symbol: "🥔", name: { en: "Potato", bn: "আলু", hi: "आलू" }, categoryId: "veggies" }
    ]
  },
  {
    level: 7,
    title: { en: "Level 7: Wearables vs Cleaning tools", bn: "ধাপ ৭: পরিধান বনাম পরিচ্ছন্নতা", hi: "स्तर ७: पहनावा बनाम सफाई" },
    description: {
      en: "Sort clothes to wear and daily household cleaning tools.",
      bn: "পোশাক এবং ঘরের পরিচ্ছন্নতার সামগ্রী আলাদা করুন।",
      hi: "पहनने के कपड़े और घर की सफाई के साधन अलग करिए।"
    },
    categories: [
      { id: "wear", symbol: "🧵", name: { en: "Wearable", bn: "পরিধান", hi: "पहनावा" } },
      { id: "clean", symbol: "🧹", name: { en: "Cleaning", bn: "পরিচ্ছন্নতা", hi: "सफाई साधन" } }
    ],
    items: [
      { id: "s29", symbol: "🧵", name: { en: "Muga Silk Scarf", bn: "মুগা রেশম চাদর", hi: "रेशमी दुपट्टा" }, categoryId: "wear" },
      { id: "s30", symbol: "🧹", name: { en: "Grass Broom", bn: "ঝাঁটা", hi: "झाड़ू" }, categoryId: "clean" },
      { id: "s31", symbol: "🧣", name: { en: "Warm Scarf", bn: "মাফলার", hi: "मफलर" }, categoryId: "wear" },
      { id: "s32", symbol: "🪥", name: { en: "Toothbrush", bn: "দাঁতের ব্রাশ", hi: "टूथब्रश" }, categoryId: "clean" }
    ]
  },
  {
    level: 8,
    title: { en: "Level 8: Musical Instruments vs Birds", bn: "ধাপ ৮: বাদ্যযন্ত্র বনাম সুন্দর পাখি", hi: "स्तर ८: वाद्ययंत्र बनाम सुंदर पक्षी" },
    description: {
      en: "Sort traditional festive instruments and native singing birds.",
      bn: "উৎসবের বাদ্যযন্ত্র ও সুরেলা পাখিদের ভাগ করুন।",
      hi: "उत्सव के वाद्ययंत्र और सुंदर पक्षियों को छांटिए।"
    },
    categories: [
      { id: "music", symbol: "🥁", name: { en: "Instruments", bn: "বাদ্যযন্ত্র", hi: "वाद्ययंत्र" } },
      { id: "birds", symbol: "🦜", name: { en: "Birds", bn: "পাখি", hi: "पक्षी" } }
    ],
    items: [
      { id: "s33", symbol: "🥁", name: { en: "Bihu Dhol Drum", bn: "বিহু ঢোল", hi: "बिहू ढोल" }, categoryId: "music" },
      { id: "s34", symbol: "🦚", name: { en: "Peacock", bn: "ময়ূর", hi: "मोर" }, categoryId: "birds" },
      { id: "s35", symbol: "🪈", name: { en: "Bamboo Flute", bn: "বাঁশের বাঁশি", hi: "बांसुरी" }, categoryId: "music" },
      { id: "s36", symbol: "🦜", name: { en: "Green Parrot", bn: "টিয়া পাখি", hi: "तोता" }, categoryId: "birds" }
    ]
  },
  {
    level: 9,
    title: { en: "Level 9: Festival Sweets vs Handicrafts", bn: "ধাপ ৯: পিঠা-মিষ্টান্ন বনাম হস্তশিল্প", hi: "स्तर ९: पारंपरिक मिष्ठान्न बनाम हस्तशिल्प" },
    description: {
      en: "Sort traditional sweets and artisanal cane handicrafts.",
      bn: "উৎসবের মিষ্টি পিঠা ও বেতের হস্তশিল্প পৃথক করুন।",
      hi: "स्वादिष्ट पीठा-मिठाई और बांस-बेंत के हस्तशिल्प अलग करिए।"
    },
    categories: [
      { id: "sweets", symbol: "🥟", name: { en: "Sweets & Pitha", bn: "পিঠা ও মিষ্টান্ন", hi: "पीठा व मिष्ठान्न" } },
      { id: "crafts", symbol: "🎍", name: { en: "Handicrafts", bn: "হস্তশিল্প", hi: "हस्तशिल्प" } }
    ],
    items: [
      { id: "s37", symbol: "🥟", name: { en: "Til Pitha", bn: "তিল পিঠা", hi: "तिल पीठा" }, categoryId: "sweets" },
      { id: "s38", symbol: "🎍", name: { en: "Bamboo Basket", bn: "বাঁশের টুকরি / ডালা", hi: "बांस की टोकरी" }, categoryId: "crafts" },
      { id: "s39", symbol: "🍯", name: { en: "Coconut Laru", bn: "নারকেলের নাড়ু", hi: "नारियल लड्डू" }, categoryId: "sweets" },
      { id: "s40", symbol: "🎎", name: { en: "Clay Asharikandi Toy", bn: "মাটির পুতুল", hi: "मिट्टी का खिलौना" }, categoryId: "crafts" }
    ]
  },
  {
    level: 10,
    title: { en: "Level 10: Morning Care vs Night Rest", bn: "ধাপ ১০: সকালের যত্ন বনাম রাতের বিশ্রাম", hi: "स्तर १०: सुबह की देखभाल बनाम रात का आराम" },
    description: {
      en: "Sort items used in dawn rituals and nighttime sleep.",
      bn: "সকালের প্রাত্যহিক যত্ন ও রাতের বিশ্রামের সামগ্রী সাজান।",
      hi: "सुबह की ताजगी और रात के विश्राम की वस्तुओं को छांटिए।"
    },
    categories: [
      { id: "morning", symbol: "☀️", name: { en: "Morning Care", bn: "সকালের যত্ন", hi: "सुबह की देखभाल" } },
      { id: "night", symbol: "🌙", name: { en: "Night Rest", bn: "রাতের বিশ্রাম", hi: "रात का आराम" } }
    ],
    items: [
      { id: "s41", symbol: "🍵", name: { en: "Fresh Morning Tea", bn: "সকালের লাল চা", hi: "सुबह की ताजी चाय" }, categoryId: "morning" },
      { id: "s42", symbol: "🛌", name: { en: "Warm Night Quilt", bn: "লেপ ও কম্বল", hi: "गर्म रजाई व बिस्तर" }, categoryId: "night" },
      { id: "s43", symbol: "🪥", name: { en: "Toothpaste & Brush", bn: "মাজন ও ব্রাশ", hi: "दंतमंजन" }, categoryId: "morning" },
      { id: "s44", symbol: "🌙", name: { en: "Dim Night Lamp", bn: "রাতের মৃদু আলো", hi: "रात का धीमा लैंप" }, categoryId: "night" }
    ]
  }
];

// 6. "Who Is This?" - Match Names with Familiar Relationships and Roles (10 Progressive Levels)
export const WHO_IS_THIS_LEVELS: WhoIsThisLevelConfig[] = [
  {
    level: 1,
    roleId: "grandfather",
    name: { en: "Dadu / Grandpa", bn: "দাদু (ঠাকুরদা)", hi: "दादाजी" },
    relationTitle: { en: "Grandfather", bn: "পিতামহ / দাদু", hi: "दादाजी" },
    avatarSymbol: "👴",
    clue: {
      en: "He sits on the cane chair, tells ancient folk stories of the Brahmaputra, and loves morning tea.",
      bn: "তিনি বেতের আরামকেদারায় বসেন, ব্রহ্মপুত্রের রূপকথা শোনান এবং সকালে চা ভালোবাসেন।",
      hi: "वह आरामकुर्सी पर बैठकर पुरानी लोककथाएं सुनाते हैं और सुबह की चाय पसंद करते हैं।"
    },
    options: [
      { id: "grandfather", symbol: "👴", label: { en: "Grandfather (Dadu)", bn: "দাদু (পিতামহ)", hi: "दादाजी" } },
      { id: "doctor", symbol: "🩺", label: { en: "Doctor", bn: "ডাক্তারবাবু", hi: "चिकित्सक" } },
      { id: "postman", symbol: "📬", label: { en: "Postman", bn: "ডাকপিয়ন", hi: "डाकिया" } }
    ],
    warmNote: {
      en: "Grandfather's warm wisdom and fond smiles fill the entire home with security and love.",
      bn: "দাদুর স্নেহময় আশীর্বাদ ও অমূল্য গল্প পুরো বাড়িকে শান্তিতে ভরিয়ে রাখে।",
      hi: "दादाजी का स्नेह और आशीर्वाद पूरे घर को प्रेम व सुरक्षा से भर देता है।"
    }
  },
  {
    level: 2,
    roleId: "grandmother",
    name: { en: "Didun / Grandma", bn: "দিদা (ঠাকুমা)", hi: "दादीजी" },
    relationTitle: { en: "Grandmother", bn: "মাতামহী / দিদা", hi: "दादीजी" },
    avatarSymbol: "👵",
    clue: {
      en: "She knits soft woolen scarves, recites evening prayers, and makes delicious sweet coconut larus.",
      bn: "তিনি উলের স্কার্ফ বোনেন, সাঁঝে প্রদীপ জ্বেলে প্রার্থনা করেন এবং মিষ্টি নারকেলের নাড়ু বানান।",
      hi: "वह ऊनी शॉल बुनती हैं, शाम को प्रार्थना करती हैं और स्वादिष्ट नारियल के लड्डू बनाती हैं।"
    },
    options: [
      { id: "friend", symbol: "🧑‍🤝‍🧑", label: { en: "Old Friend", bn: "বাল্যবন্ধু", hi: "मित्र" } },
      { id: "grandmother", symbol: "👵", label: { en: "Grandmother (Didun)", bn: "দিদা (ঠাকুমা)", hi: "दादीजी" } },
      { id: "teacher", symbol: "🧑‍🏫", label: { en: "Teacher", bn: "শিক্ষক", hi: "अध्यापक" } }
    ],
    warmNote: {
      en: "Grandmother's sweet voice and hand-spun love nurture generations of sweet memories.",
      bn: "দিদার মমতাময়ী স্পর্শ ও প্রার্থনা আমাদের প্রাণে শান্তি জোগায়।",
      hi: "दादीजी की ममता और लोरी मन को परम शांति प्रदान करती है।"
    }
  },
  {
    level: 3,
    roleId: "mother",
    name: { en: "Ma / Mother", bn: "মা (জননী)", hi: "माँ (माताजी)" },
    relationTitle: { en: "Mother", bn: "মা", hi: "माँ" },
    avatarSymbol: "👩",
    clue: {
      en: "Her gentle touch soothes every ache, and her warm homemade khichuri comforts your soul.",
      bn: "যার স্নেহময় স্পর্শে সব কষ্ট দূর হয় এবং যার হাতের গরম খিচুড়ি মনে অপার তৃপ্তি আনে।",
      hi: "जिनके कोमल स्पर्श से हर थकान मिट जाती है और जिनका बनाया भोजन अमृत समान होता है।"
    },
    options: [
      { id: "mother", symbol: "👩", label: { en: "Mother (Ma)", bn: "মা (জননী)", hi: "माँ" } },
      { id: "sister", symbol: "👧", label: { en: "Sister", bn: "বোন", hi: "बहन" } },
      { id: "neighbor", symbol: "🧑‍🌾", label: { en: "Neighbor", bn: "প্রতিবেশী", hi: "पड़ोसी" } }
    ],
    warmNote: {
      en: "A mother's unconditional affection is the bedrock of lifelong comfort and peace.",
      bn: "মায়ের ভালোবাসার চেয়ে পবিত্র ও নিরাপদ আশ্রয় পৃথিবীতে আর নেই।",
      hi: "माँ का निस्वार्थ प्रेम जीवन का सबसे सुखद व सुरक्षित आश्रय है।"
    }
  },
  {
    level: 4,
    roleId: "father",
    name: { en: "Baba / Father", bn: "বাবা (পিতা)", hi: "पिताजी" },
    relationTitle: { en: "Father", bn: "বাবা", hi: "पिताजी" },
    avatarSymbol: "👨",
    clue: {
      en: "He brings fresh vegetables from the weekly haat market and always checks that you are comfortable.",
      bn: "যিনি সাপ্তাহিক হাট থেকে তাজা শাকসবজি আনেন এবং সবার সুবিধা-অসুবিধার খেয়াল রাখেন।",
      hi: "जो साप्ताहिक हाट से ताजी सब्जियां लाते हैं और परिवार की हर जरूरत का ध्यान रखते हैं।"
    },
    options: [
      { id: "father", symbol: "👨", label: { en: "Father (Baba)", bn: "বাবা (পিতা)", hi: "पिताजी" } },
      { id: "postman", symbol: "📬", label: { en: "Postman", bn: "ডাকপিয়ন", hi: "डाकिया" } },
      { id: "doctor", symbol: "🩺", label: { en: "Doctor", bn: "ডাক্তারবাবু", hi: "डॉक्टर बाबू" } }
    ],
    warmNote: {
      en: "Father's steady presence is like the sturdy banyan tree protecting the home.",
      bn: "বাবার উপস্থিতি বটবৃক্ষের মতো শান্ত ছায়া দিয়ে সমস্ত বিপদ থেকে রক্ষা করে।",
      hi: "पिताजी की छत्रछाया वटवृक्ष की भांति संपूर्ण परिवार को संबल देती है।"
    }
  },
  {
    level: 5,
    roleId: "doctor",
    name: { en: "Daktar Babu / Doctor", bn: "ডাক্তারবাবু (চিকিৎসক)", hi: "डॉक्टर बाबू (चिकित्सक)" },
    relationTitle: { en: "Family Doctor", bn: "পারিবারিক চিকিৎসক", hi: "पारिवारिक डॉक्टर" },
    avatarSymbol: "🩺",
    clue: {
      en: "He arrives with a stethoscope, checks pulse gently, smiles, and advises proper hydration and rest.",
      bn: "যিনি স্টেথোস্কোপ নিয়ে নাড়ি পরীক্ষা করেন, হাসিমুখে খোঁজ নেন এবং বিশ্রামের পরামর্শ দেন।",
      hi: "जो स्टेथोस्कोप से नब्ज देखते हैं, मुस्कुराते हुए स्वास्थ्य का हाल पूछते हैं और दवा बताते हैं।"
    },
    options: [
      { id: "teacher", symbol: "🧑‍🏫", label: { en: "Teacher", bn: "শিক্ষক", hi: "अध्यापक" } },
      { id: "doctor", symbol: "🩺", label: { en: "Doctor (Daktar Babu)", bn: "ডাক্তারবাবু", hi: "डॉक्टर बाबू" } },
      { id: "grandfather", symbol: "👴", label: { en: "Grandfather", bn: "দাদু", hi: "दादाजी" } }
    ],
    warmNote: {
      en: "Our compassionate doctor brings healing, reassurance, and calmness to body and spirit.",
      bn: "ডাক্তারবাবুর মিষ্টি কথা ও সহমর্মিতা অর্ধেক রোগ এমনিতেই সারিয়ে দেয়।",
      hi: "डॉक्टर बाबू का स्नेहपूर्ण व्यवहार और देखभाल मन को नया संबल देती है।"
    }
  },
  {
    level: 6,
    roleId: "teacher",
    name: { en: "Shikshak / Revered Teacher", bn: "শিক্ষক মশাই (গুরুজি)", hi: "शिक्षक महोदय (गुरुजी)" },
    relationTitle: { en: "Teacher", bn: "শিক্ষক", hi: "शिक्षक" },
    avatarSymbol: "🧑‍🏫",
    clue: {
      en: "He held the blackboard chalk, taught the alphabets, values, and inspired curiosity in the village school.",
      bn: "যিনি চক-ডাস্টার নিয়ে বর্ণমালা ও জীবনের নীতিশিক্ষা শিখিয়েছিলেন গ্রামের বিদ্যালয়ে।",
      hi: "जिन्होंने चाक लेकर वर्णमाला, अच्छे संस्कार और ज्ञान का प्रकाश दिया था।"
    },
    options: [
      { id: "postman", symbol: "📬", label: { en: "Postman", bn: "ডাকপিয়ন", hi: "डाकिया" } },
      { id: "teacher", symbol: "🧑‍🏫", label: { en: "Teacher (Shikshak)", bn: "শিক্ষক মশাই", hi: "शिक्षक महोदय" } },
      { id: "farmer", symbol: "🧑‍🌾", label: { en: "Farmer", bn: "কৃষক", hi: "किसान" } }
    ],
    warmNote: {
      en: "A respected teacher's gentle lessons continue to shine like a guiding lighthouse throughout life.",
      bn: "শ্রদ্ধেয় শিক্ষকের দেখানো সৎ পথ সারাজীবন আলোর দিশারী হয়ে থাকে।",
      hi: "गुरुजनों की दी हुई सीख जीवन भर पथ-प्रदर्शक का कार्य करती है।"
    }
  },
  {
    level: 7,
    roleId: "postman",
    name: { en: "Daakpeon / Postman", bn: "ডাকপিয়ন (চিঠি বিলিকারী)", hi: "डाकिया (पत्रवाहक)" },
    relationTitle: { en: "Postman", bn: "ডাকপিয়ন", hi: "डाकिया" },
    avatarSymbol: "📬",
    clue: {
      en: "He rode his cycle ringing the bell, carrying handwritten postcards and festive greetings from faraway kin.",
      bn: "যিনি সাইকেলের ঘণ্টা বাজিয়ে দূর সম্পর্কের আত্মীয়দের হাতে লেখা চিঠি ও শুভেচ্ছা বয়ে আনতেন।",
      hi: "जो साइकिल की घंटी बजाते हुए दूर रहने वाले प्रियजनों के हाथ के लिखे पत्र लेकर आते थे।"
    },
    options: [
      { id: "postman", symbol: "📬", label: { en: "Postman (Daakpeon)", bn: "ডাকপিয়ন", hi: "डाकिया" } },
      { id: "mother", symbol: "👩", label: { en: "Mother", bn: "মা", hi: "माँ" } },
      { id: "friend", symbol: "🧑‍🤝‍🧑", label: { en: "Friend", bn: "বন্ধু", hi: "मित्र" } }
    ],
    warmNote: {
      en: "The arrival of the postman once brought smiles, eagerly unfolding letters full of love and news.",
      bn: "ডাকপিয়নের ডাকে পুরো পরিবার আনন্দে মুখরিত হয়ে চিঠির ভাঁজ খুলত।",
      hi: "डाकिया का आना पूरे मोहल्ले में खुशी और चिट्ठियों की मिठास भर देता था।"
    }
  },
  {
    level: 8,
    roleId: "sister",
    name: { en: "Chhoto Bon / Little Sister", bn: "ছোট বোন (স্নেহের অনুজা)", hi: "छोटी बहन (लाडली)" },
    relationTitle: { en: "Younger Sister", bn: "ছোট বোন", hi: "छोटी बहन" },
    avatarSymbol: "👧",
    clue: {
      en: "She braids flower garlands, hums folk tunes in the courtyard, and shares sweet mango slices with you.",
      bn: "যিনি উঠোনে ফুলের মালা গাঁথেন, মিষ্টি সুরে গান করেন এবং পাকা আমের ভাগ নিয়ে আসেন।",
      hi: "जो आंगन में फूलों की माला बनाती हैं, गुनगुनाती हैं और मीठे आम का हिस्सा साझा करती हैं।"
    },
    options: [
      { id: "grandmother", symbol: "👵", label: { en: "Grandmother", bn: "দিদা", hi: "दादीजी" } },
      { id: "sister", symbol: "👧", label: { en: "Little Sister (Bon)", bn: "ছোট বোন", hi: "छोटी बहन" } },
      { id: "doctor", symbol: "🩺", label: { en: "Doctor", bn: "ডাক্তার", hi: "चिकित्सक" } }
    ],
    warmNote: {
      en: "A sister's laughter brings youthful spring back into the quietest afternoons.",
      bn: "ছোট বোনের খিলখিল হাসি যে কোনো নীরব দুপুরকে বসন্তের মতো রঙিন করে তোলে।",
      hi: "बहन की मुस्कान और चुलबुलापन जीवन में सदैव ताजगी बनाए रखता है।"
    }
  },
  {
    level: 9,
    roleId: "friend",
    name: { en: "Bondhu / Childhood Friend", bn: "বাল্যবন্ধু (সুহৃদ)", hi: "बाल्य सखा / प्रिय मित्र" },
    relationTitle: { en: "Dear Friend", bn: "প্রিয় বন্ধু", hi: "सच्चा मित्र" },
    avatarSymbol: "🧑‍🤝‍🧑",
    clue: {
      en: "You shared village pond swims, walked miles to school together, and still laugh at memories from 50 years ago.",
      bn: "যার সাথে গ্রামের পুকুরে সাঁতার কেটেছেন, একসাথে স্কুলে যেতেন এবং আজও পুরোনো কথা মনে করে হাসেন।",
      hi: "जिनके साथ गांव के तालाब में तैरे, साथ स्कूल गए और ५० साल पुरानी बातें याद कर मुस्कुराते हैं।"
    },
    options: [
      { id: "friend", symbol: "🧑‍🤝‍🧑", label: { en: "Childhood Friend", bn: "বাল্যবন্ধু", hi: "बाल्य सखा" } },
      { id: "father", symbol: "👨", label: { en: "Father", bn: "বাবা", hi: "पिताजी" } },
      { id: "farmer", symbol: "🧑‍🌾", label: { en: "Farmer", bn: "কৃষক", hi: "किसान" } }
    ],
    warmNote: {
      en: "True friendship is a timeless garden where years melt away and heart speaks to heart.",
      bn: "সুহৃদ বন্ধুর বন্ধুত্ব এমন এক ফুল যা সময়ের সাথে কখনো ম্লান হয় না।",
      hi: "सच्ची मित्रता समय के बंधनों से परे मन को सदैव युवा व प्रफुल्लित रखती है।"
    }
  },
  {
    level: 10,
    roleId: "farmer",
    name: { en: "Chashi Bhai / Village Farmer Neighbor", bn: "কৃষক ভাই (অন্নদাতা প্রতিবেশী)", hi: "किसान भाई (अन्नदाता)" },
    relationTitle: { en: "Farmer Neighbor", bn: "কৃষক প্রতিবেশী", hi: "किसान साथी" },
    avatarSymbol: "🧑‍🌾",
    clue: {
      en: "He wakes before the sun, nurtures green paddy fields, and shares fresh mustard greens across the fence.",
      bn: "যিনি সূর্য ওঠার আগেই মাঠে যান, সবুজ ধান চাষ করেন এবং পরম স্নেহে টাটকা শাকসবজি উপহার দেন।",
      hi: "जो सूर्योदय से पूर्व खेत जाते हैं, लहलहाती फसल उगाते हैं और ताजे साग-सब्जी प्रेम से बांटते हैं।"
    },
    options: [
      { id: "farmer", symbol: "🧑‍🌾", label: { en: "Farmer Neighbor", bn: "কৃষক প্রতিবেশী", hi: "किसान साथी" } },
      { id: "teacher", symbol: "🧑‍🏫", label: { en: "Teacher", bn: "শিক্ষক", hi: "अध्यापक" } },
      { id: "grandfather", symbol: "👴", label: { en: "Grandfather", bn: "দাদু", hi: "दादाजी" } }
    ],
    warmNote: {
      en: "The humble farmer's hard work provides the golden grains that feed families with gratitude.",
      bn: "কৃষক ভাইয়ের ঘামে ভেজা সোনালী শস্যের অন্ন আমাদের জীবনকে বাঁচিয়ে রাখে।",
      hi: "परिश्रमी किसान का त्याग व समर्पण संपूर्ण समाज को जीवनदायिनी शक्ति देता है।"
    }
  }
];

const STORAGE_PREFIX = 'smriti_levels_';

export function getGameLevelsStatus(gameId: CognitiveGameId): GameLevelStatus[] {
  if (typeof window === 'undefined') {
    return createInitialLevels();
  }
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${gameId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 10) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to load levels from storage", e);
  }
  const initial = createInitialLevels();
  saveGameLevelsStatus(gameId, initial);
  return initial;
}

export function saveGameLevelsStatus(gameId: CognitiveGameId, levels: GameLevelStatus[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${gameId}`, JSON.stringify(levels));
  } catch (e) {
    console.warn("Failed to save levels", e);
  }
}

export function updateLevelCompletion(
  gameId: CognitiveGameId,
  levelNum: number,
  stars: number,
  score: number
): GameLevelStatus[] {
  const current = getGameLevelsStatus(gameId);
  const updated = current.map(item => {
    if (item.level === levelNum) {
      return {
        ...item,
        stars: Math.max(item.stars, stars),
        bestScore: Math.max(item.bestScore, score),
      };
    }
    // Unlock next level!
    if (item.level === levelNum + 1) {
      return {
        ...item,
        unlocked: true,
      };
    }
    return item;
  });
  saveGameLevelsStatus(gameId, updated);

  // Cloud sync to Supabase (safe background async)
  syncGameProgressToSupabase(gameId, levelNum, stars, score).catch(err =>
    console.warn('Supabase game progress sync notice:', err)
  );

  return updated;
}

function createInitialLevels(): GameLevelStatus[] {
  return Array.from({ length: 10 }, (_, i) => ({
    level: i + 1,
    unlocked: i === 0, // Level 1 is always unlocked
    stars: 0,
    bestScore: 0,
  }));
}
