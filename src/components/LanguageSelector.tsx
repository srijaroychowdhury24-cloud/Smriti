import React from 'react';
import { Language } from '../types';
import { LANGUAGE_LABELS } from '../data/translations';

interface Props {
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
}

export const LanguageSelector: React.FC<Props> = ({ currentLanguage, onSelectLanguage }) => {
  const languages: Language[] = ['en', 'as', 'bn', 'hi'];

  return (
    <nav aria-label="Language selection" className="inline-flex items-center justify-center gap-1.5 p-1.5 rounded-full bg-white/70 sm:bg-white/80 border border-[#f0d8cc] shadow-sm backdrop-blur-md">
      {languages.map((lang) => {
        const isSelected = currentLanguage === lang;
        return (
          <button
            key={lang}
            id={`lang-btn-${lang}`}
            onClick={() => onSelectLanguage(lang)}
            aria-pressed={isSelected}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
              isSelected
                ? 'bg-[#df735a] text-white font-semibold shadow-xs'
                : 'text-[#6b473b] hover:text-[#3d1f18] hover:bg-white/80'
            }`}
          >
            <span className="tracking-wide">{LANGUAGE_LABELS[lang].native}</span>
          </button>
        );
      })}
    </nav>
  );
};
