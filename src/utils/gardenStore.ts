import { Language, GardenFlower } from '../types';
import { syncGardenFlowerToSupabase } from './supabaseClient';

const GARDEN_STORAGE_KEY = 'smriti_memory_garden_v1';

export const INITIAL_GARDEN_FLOWERS: GardenFlower[] = [
  {
    day: 1,
    flowerName: {
      en: "Sweet Tagar (Crepe Jasmine)",
      bn: "টগর ফুল",
      hi: "तगर का फूल"
    },
    symbol: "🌸",
    color: "#fbcfe8",
    meaning: {
      en: "Purity, quiet morning breeze, and peace.",
      bn: "পবিত্রতা, নির্মল সকালের বাতাস ও পরম শান্তি।",
      hi: "पवित्रता, भोर की मंद बयार और शांति।"
    },
    bloomed: true,
    unlockedAt: "Day 1 Complete"
  },
  {
    day: 2,
    flowerName: {
      en: "Sacred Lotus (Padma)",
      bn: "পবিত্র নীলপদ্ম",
      hi: "पवित्र कमल"
    },
    symbol: "🪷",
    color: "#f472b6",
    meaning: {
      en: "Serenity, deep breathing, and emotional clarity.",
      bn: "প্রশান্তি, গভীর দীর্ঘশ্বাস ও মুক্ত মন।",
      hi: "प्रशांति, गहरी सांस और आंतरिक स्पष्टता।"
    },
    bloomed: true,
    unlockedAt: "Day 2 Complete"
  },
  {
    day: 3,
    flowerName: {
      en: "Red Hibiscus (Jaba)",
      bn: "রক্ত জবা",
      hi: "लाल गुड़हल"
    },
    symbol: "🌺",
    color: "#fb7185",
    meaning: {
      en: "Morning devotion, prayer, and warmth of life.",
      bn: "সকালের পূজা, ভক্তি ও জীবনের উজ্জ্বল উষ্ণতা।",
      hi: "सुबह की पूजा, भक्ति और जीवन की उज्ज्वल गर्माहट।"
    },
    bloomed: false
  },
  {
    day: 4,
    flowerName: {
      en: "Golden Marigold (Genda)",
      bn: "গাঁদা ফুল",
      hi: "गेंदा फूल"
    },
    symbol: "🌼",
    color: "#fcd34d",
    meaning: {
      en: "Festive joy, autumn sunshine, and laughter.",
      bn: "উৎসবের আনন্দ, সোনালী রোদ ও মধুর স্মৃতি।",
      hi: "उत्सव का आनंद, सुनहरी धूप और सुखद स्मृतियां।"
    },
    bloomed: false
  },
  {
    day: 5,
    flowerName: {
      en: "Fragrant Rose (Golap)",
      bn: "গোলাপ ফুল",
      hi: "गुलाब का फूल"
    },
    symbol: "🌹",
    color: "#f43f5e",
    meaning: {
      en: "Affection, soothing fragrance, and gratitude.",
      bn: "স্নেহ, মন জুড়ানো সুবাস ও শুভকামনা।",
      hi: "स्नेह, मनभावन सुगंध और कृतज्ञता।"
    },
    bloomed: false
  },
  {
    day: 6,
    flowerName: {
      en: "Golden Sunflower (Surjamukhi)",
      bn: "সূর্যমুখী ফুল",
      hi: "सूरजमुखी का फूल"
    },
    symbol: "🌻",
    color: "#fbbf24",
    meaning: {
      en: "Vitality, turning towards light, and hope.",
      bn: "জীবনীশক্তি, আলোর প্রতি শ্রদ্ধা ও অটুট আশা।",
      hi: "ऊर्जा, प्रकाश की ओर उन्मुखता और अटूट आशा।"
    },
    bloomed: false
  },
  {
    day: 7,
    flowerName: {
      en: "Foxtail Orchid (Kopou Phool)",
      bn: "কপো ফুল (অর্কিড)",
      hi: "कपो फूल (ऑर्किड)"
    },
    symbol: "🪻",
    color: "#c084fc",
    meaning: {
      en: "North East spring heritage, dance, and music.",
      bn: "উত্তর-পূর্বের বসন্ত বিহু ঐতিহ্য, গান ও নৃত্য।",
      hi: "पूर्वोत्तर की वसंत छटा, लोक संगीत और बिहू उत्सव।"
    },
    bloomed: false
  },
  {
    day: 8,
    flowerName: {
      en: "Star Jasmine (Chameli)",
      bn: "চামেলি ফুল",
      hi: "चमेली का फूल"
    },
    symbol: "🌾",
    color: "#e2e8f0",
    meaning: {
      en: "Night bloom, peaceful sleep, and sweet dreams.",
      bn: "রাত্রির স্নিগ্ধ সুবাস, শান্ত ঘুম ও সুস্বপ্ন।",
      hi: "रात्रि की शीतल सुगंध, शांत निद्रा और मधुर स्वप्न।"
    },
    bloomed: false
  },
  {
    day: 9,
    flowerName: {
      en: "Valley Chrysanthemum",
      bn: "চন্দ্রমল্লিকা",
      hi: "गुलदाउदी"
    },
    symbol: "🌷",
    color: "#a78bfa",
    meaning: {
      en: "Gentle patience, winter warmth, and longevity.",
      bn: "ধৈর্য, শীতের মিঠে রোদ ও দীর্ঘায়ু।",
      hi: "धैर्य, शीतकाल की मीठी धूप और दीर्घायु।"
    },
    bloomed: false
  },
  {
    day: 10,
    flowerName: {
      en: "Auspicious Tulsi Manjari",
      bn: "তুলসী মঞ্জরী",
      hi: "तुलसी मंजरी"
    },
    symbol: "🌿",
    color: "#86efac",
    meaning: {
      en: "Auspicious healing, family harmony, and blessing.",
      bn: "পবিত্র আরোগ্য, গৃহের কল্যাণ ও আশীর্বাদ।",
      hi: "पवित्र आरोग्य, परिवार का कल्याण और आशीर्वाद।"
    },
    bloomed: false
  }
];

export function getGardenFlowers(): GardenFlower[] {
  if (typeof window === 'undefined') return INITIAL_GARDEN_FLOWERS;
  try {
    const raw = localStorage.getItem(GARDEN_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(GARDEN_STORAGE_KEY, JSON.stringify(INITIAL_GARDEN_FLOWERS));
      return INITIAL_GARDEN_FLOWERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_GARDEN_FLOWERS;
  }
}

export function unlockNextGardenFlower(): { bloomedFlower: GardenFlower; totalBloomed: number } {
  const current = getGardenFlowers();
  const nextUnbloomedIdx = current.findIndex((f) => !f.bloomed);

  if (nextUnbloomedIdx === -1) {
    // All bloomed already
    return {
      bloomedFlower: current[current.length - 1],
      totalBloomed: current.length
    };
  }

  current[nextUnbloomedIdx].bloomed = true;
  current[nextUnbloomedIdx].unlockedAt = new Date().toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });

  try {
    localStorage.setItem(GARDEN_STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save garden bloom', e);
  }

  // Cloud backup to Supabase
  syncGardenFlowerToSupabase(current[nextUnbloomedIdx]).catch((err) =>
    console.warn('Supabase flower sync notice:', err)
  );

  return {
    bloomedFlower: current[nextUnbloomedIdx],
    totalBloomed: current.filter((f) => f.bloomed).length
  };
}
