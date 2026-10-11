/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Language } from './types';
import { SmritiHome } from './components/SmritiHome';
import { CognitiveSessionModal } from './components/CognitiveSessionModal';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [initialTab, setInitialTab] = useState<'games' | 'caregiver'>('caregiver');

  const handleStartOption2 = () => {
    setInitialTab('caregiver');
    setIsSessionActive(true);
  };

  const handleStartPatientGame = () => {
    setInitialTab('games');
    setIsSessionActive(true);
  };

  const handleStop = () => {
    setIsSessionActive(false);
  };

  return (
    <div className="w-full min-h-screen font-fun selection:bg-rose-100 selection:text-rose-900">
      {isSessionActive ? (
        <CognitiveSessionModal
          language={language}
          onStopSession={handleStop}
          onLanguageChange={setLanguage}
          initialTab={initialTab}
        />
      ) : (
        <SmritiHome
          language={language}
          onSelectLanguage={setLanguage}
          onStartOption2={handleStartOption2}
          onStartPatientGame={handleStartPatientGame}
          onStop={handleStop}
        />
      )}
    </div>
  );
}
