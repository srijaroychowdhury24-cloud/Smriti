/**
 * Scheduled Alert & Caregiver Notification Daemon for Smriti
 * 
 * Manages timed medication alarms, hydration intervals, browser Web Notifications,
 * Web Audio chimes, Mimi voice prompts, and Caregiver Escalation Triggers.
 */

import { Language } from '../types';
import { speakMessage } from './speech';
import { soundFx } from './audio';

export interface ScheduledReminder {
  id: string;
  timeStr: string; // e.g., "08:30 AM", "01:30 PM"
  hour24: number; // 0-23
  minute: number; // 0-59
  category: 'medicine' | 'hydration' | 'activity' | 'appointment';
  isCritical: boolean; // Critical medication will trigger caregiver alerts if missed
  title: {
    en: string;
    bn: string;
    hi: string;
    as: string;
  };
  subtitle: {
    en: string;
    bn: string;
    hi: string;
    as: string;
  };
  icon: string;
  soundAlarm: boolean;
  voicePrompt: boolean;
  status: 'pending' | 'acknowledged' | 'snoozed' | 'missed';
  lastTriggeredDate?: string; // e.g. "2026-09-21"
  snoozedUntilTimestamp?: number;
}

export interface CaregiverAlertEvent {
  id: string;
  timestamp: number;
  timeFormatted: string;
  reminderId: string;
  reminderTitle: string;
  severity: 'warning' | 'critical' | 'info';
  message: string;
  resolved: boolean;
}

const REMINDERS_KEY = 'smriti_scheduled_reminders_v1';
const CAREGIVER_ALERTS_KEY = 'smriti_caregiver_alerts_v1';

export const SEEDED_SCHEDULED_REMINDERS: ScheduledReminder[] = [
  {
    id: 'rem-1',
    timeStr: '08:30 AM',
    hour24: 8,
    minute: 30,
    category: 'medicine',
    isCritical: true,
    title: {
      en: 'Morning Blood Pressure & Memory Medicine',
      bn: 'সকালের প্রেসার ও স্মৃতিবর্ধক ওষুধ',
      hi: 'प्रातःकाल की रक्तचाप व स्मरण औषधि',
      as: 'ৰাতিপুৱাৰ প্ৰেচাৰ আৰু স্মৃতিবৰ্ধক ঔষধ'
    },
    subtitle: {
      en: 'Take with warm water after light breakfast',
      bn: 'হালকা প্রাতঃরাশের পর ঈষদুষ্ণ জলের সাথে',
      hi: 'हल्के नाश्ते के पश्चात गुनगुने जल के साथ',
      as: 'লঘু জলপানৰ পিছত কুহুমীয়া পানীৰ সৈতে'
    },
    icon: '💊',
    soundAlarm: true,
    voicePrompt: true,
    status: 'pending'
  },
  {
    id: 'rem-2',
    timeStr: '10:30 AM',
    hour24: 10,
    minute: 30,
    category: 'hydration',
    isCritical: false,
    title: {
      en: 'Gentle Hydration — Glass of Warm Water',
      bn: 'স্নিগ্ধ জলপান — এক গ্লাস ঈষদুষ্ণ জল',
      hi: 'सुखद जलपान — एक गिलास गुनगुना पानी',
      as: 'স্নিগ্ধ জলপান — এক গিলাচ কুহুমীয়া পানী'
    },
    subtitle: {
      en: 'Small peaceful sips to refresh the mind',
      bn: 'মন ও শরীর তরতাজা রাখতে কয়েক ঢোক জল',
      hi: 'मन और तन को शांत ताजगी देने हेतु',
      as: 'মন আৰু শৰীৰ সতেজ ৰাখিবলৈ কেইঢোকমান পানী'
    },
    icon: '💧',
    soundAlarm: true,
    voicePrompt: true,
    status: 'pending'
  },
  {
    id: 'rem-3',
    timeStr: '01:00 PM',
    hour24: 13,
    minute: 0,
    category: 'activity',
    isCritical: false,
    title: {
      en: 'Nourishing Lunch & Quiet Pause',
      bn: 'দুপুরের পুষ্টিকর আহার ও প্রশান্ত বিশ্রাম',
      hi: 'दोपहर का पौष्टिक भोजन व विश्राम',
      as: 'দুপৰীয়াৰ পুষ্টিকৰ আহাৰ আৰু প্ৰশান্ত বিশ্ৰাম'
    },
    subtitle: {
      en: 'Enjoy warm food slowly with loved ones',
      bn: 'পরিবারের সাথে ধীরে সুস্থে প্রিয় খাবার উপভোগ করুন',
      hi: 'परिजनों के साथ शांत भाव से भोजन करें',
      as: 'পৰিয়ালৰ সৈতে লাহে লাহে প্ৰিয় খাদ্য উপভোগ কৰক'
    },
    icon: '🍲',
    soundAlarm: false,
    voicePrompt: true,
    status: 'pending'
  },
  {
    id: 'rem-4',
    timeStr: '04:30 PM',
    hour24: 16,
    minute: 30,
    category: 'activity',
    isCritical: false,
    title: {
      en: 'Garden Stroll & Gentle Tea Cup',
      bn: 'বিকেলের বাগান ভ্রমণ ও চা-চক্র',
      hi: 'संध्याकालीन वाटिका भ्रमण व चाय',
      as: 'গধূলিৰ বাগিচা ভ্ৰমণ আৰু চাহৰ পিয়লা'
    },
    subtitle: {
      en: 'Feel the gentle evening breeze and floral scent',
      bn: 'স্নিগ্ধ বিকেলের মিষ্টি বাতাসে কিছুক্ষণ হাঁটুন',
      hi: 'सुहावनी हवा में कुछ पल चहलकदमी करें',
      as: 'স্নিগ্ধ গধূলিৰ বতাহত কিছু সময় খোজ কাঢ়ক'
    },
    icon: '🌿',
    soundAlarm: false,
    voicePrompt: true,
    status: 'pending'
  },
  {
    id: 'rem-5',
    timeStr: '08:00 PM',
    hour24: 20,
    minute: 0,
    category: 'medicine',
    isCritical: true,
    title: {
      en: 'Night Care & Peaceful Sleep Medicine',
      bn: 'রাতের ওষুধ ও প্রশান্ত ঘুমের প্রস্তুতি',
      hi: 'रात्रि औषधि व शांत निद्रा की तैयारी',
      as: 'ৰাতিৰ ঔষধ আৰু শান্ত টোপনিৰ প্ৰস্তুতি'
    },
    subtitle: {
      en: 'Take with warm milk or water before bed',
      bn: 'ঘুমানোর আগে হালকা দুধ বা জলের সাথে গ্রহণ করুন',
      hi: 'सोने से पूर्व हल्के दूध या जल के साथ लें',
      as: 'শোৱাৰ আগতে কুহুমীয়া গাখীৰ বা পানীৰ সৈতে লওক'
    },
    icon: '🌙',
    soundAlarm: true,
    voicePrompt: true,
    status: 'pending'
  }
];

export function getScheduledReminders(): ScheduledReminder[] {
  if (typeof window === 'undefined') return SEEDED_SCHEDULED_REMINDERS;
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    if (!raw) {
      localStorage.setItem(REMINDERS_KEY, JSON.stringify(SEEDED_SCHEDULED_REMINDERS));
      return SEEDED_SCHEDULED_REMINDERS;
    }
    return JSON.parse(raw);
  } catch {
    return SEEDED_SCHEDULED_REMINDERS;
  }
}

export function saveScheduledReminders(reminders: ScheduledReminder[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  } catch (err) {
    console.error('Failed to save scheduled reminders:', err);
  }
}

export function getCaregiverAlerts(): CaregiverAlertEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CAREGIVER_ALERTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCaregiverAlerts(alerts: CaregiverAlertEvent[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CAREGIVER_ALERTS_KEY, JSON.stringify(alerts.slice(0, 50)));
  } catch (err) {
    console.error('Failed to save caregiver alerts:', err);
  }
}

export function triggerCaregiverAlert(reminder: ScheduledReminder, reason: string): CaregiverAlertEvent {
  const alerts = getCaregiverAlerts();
  const newAlert: CaregiverAlertEvent = {
    id: 'alert-' + Date.now(),
    timestamp: Date.now(),
    timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    reminderId: reminder.id,
    reminderTitle: reminder.title.en,
    severity: reminder.isCritical ? 'critical' : 'warning',
    message: reason,
    resolved: false
  };

  const updated = [newAlert, ...alerts];
  saveCaregiverAlerts(updated);

  // Also play attention chime
  soundFx.playGentleMismatch();
  return newAlert;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
}

export function showBrowserNotification(title: string, body: string, icon = '🌸'): void {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'smriti-reminder',
        requireInteraction: true
      });
    } catch {
      // Ignore if iframe policy prevents it
    }
  }
}

export function initReminderSchedulerDaemon(
  onAlarmTriggered?: (reminder: ScheduledReminder) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  let lastCheckedMinute = -1;

  const intervalId = setInterval(() => {
    const now = new Date();
    const currentMinute = now.getMinutes();
    const currentHour = now.getHours();

    if (currentMinute === lastCheckedMinute) return;
    lastCheckedMinute = currentMinute;

    const reminders = getScheduledReminders();
    for (const rem of reminders) {
      if (rem.hour24 === currentHour && rem.minute === currentMinute && rem.status === 'pending') {
        if (rem.soundAlarm) {
          soundFx.playBell();
        }
        showBrowserNotification(rem.title.en, rem.subtitle.en);
        if (onAlarmTriggered) {
          onAlarmTriggered(rem);
        }
      }
    }
  }, 10000);

  return () => clearInterval(intervalId);
}

