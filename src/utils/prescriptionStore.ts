/**
 * Patient Prescriptions & Clinical Care Directive Store
 * Persists patient demographics, important precautions, and daily prescriptions.
 */

export interface PatientDetails {
  name: string;
  age: number | string;
  doctorName: string;
  doctorContact: string;
  emergencyContact: string;
  bloodGroup: string;
  allergies: string;
  importantNotes: string;
}

export interface PrescriptionItem {
  id: string;
  medicineName: string;
  dosage: string;
  timing: string;
  frequency: string;
  instructions: string;
  datePrescribed: string;
  isActive: boolean;
  takenToday?: boolean;
}

const DETAILS_KEY = 'smriti_patient_details';
const PRESCRIPTIONS_KEY = 'smriti_patient_prescriptions';

const DEFAULT_PATIENT: PatientDetails = {
  name: 'Ananya Devi',
  age: 72,
  doctorName: 'Dr. B. K. Sen (Neurology & Geriatrics)',
  doctorContact: '+91 98301 23456',
  emergencyContact: '+91 98450 11223 (Son: Debraj)',
  bloodGroup: 'O+',
  allergies: 'Penicillin, Sulfa drugs, Cold dairy late evening',
  importantNotes: 'Ensure 2L daily hydration. Gentle morning sunlight walk for 15 mins. Avoid crowded noisy areas. Encourage cultural memory reminiscing.',
};

const DEFAULT_PRESCRIPTIONS: PrescriptionItem[] = [
  {
    id: 'rx-1',
    medicineName: 'Donepezil Hydrochloride',
    dosage: '5 mg',
    timing: 'Night before bedtime',
    frequency: 'Once daily',
    instructions: 'Take with warm water after dinner to maintain neuro-cognitive connection.',
    datePrescribed: '2026-09-15',
    isActive: true,
    takenToday: true,
  },
  {
    id: 'rx-2',
    medicineName: 'Memantine HCL',
    dosage: '10 mg',
    timing: 'Morning after breakfast',
    frequency: 'Once daily',
    instructions: 'Take after morning Assam tea & light breakfast to prevent confusion.',
    datePrescribed: '2026-09-15',
    isActive: true,
    takenToday: true,
  },
  {
    id: 'rx-3',
    medicineName: 'Vitamin B12 & Methylcobalamin',
    dosage: '1500 mcg',
    timing: 'Noon with lunch',
    frequency: 'Once daily',
    instructions: 'Supports nerve regeneration; take after midday meal.',
    datePrescribed: '2026-09-20',
    isActive: true,
    takenToday: false,
  },
  {
    id: 'rx-4',
    medicineName: 'Electrolyte & Warm Herbal Hydration',
    dosage: '250 ml',
    timing: 'Afternoon at 3:30 PM',
    frequency: 'Daily',
    instructions: 'Crucial for cognitive alertness and preventing afternoon fatigue.',
    datePrescribed: '2026-09-10',
    isActive: true,
    takenToday: false,
  },
];

export function getPatientDetails(): PatientDetails {
  try {
    const raw = localStorage.getItem(DETAILS_KEY);
    if (!raw) {
      savePatientDetails(DEFAULT_PATIENT);
      return DEFAULT_PATIENT;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PATIENT;
  }
}

export function savePatientDetails(details: PatientDetails): void {
  try {
    localStorage.setItem(DETAILS_KEY, JSON.stringify(details));
  } catch (err) {
    console.warn('Failed to save patient details', err);
  }
}

export function getPrescriptions(): PrescriptionItem[] {
  try {
    const raw = localStorage.getItem(PRESCRIPTIONS_KEY);
    if (!raw) {
      savePrescriptions(DEFAULT_PRESCRIPTIONS);
      return DEFAULT_PRESCRIPTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PRESCRIPTIONS;
  }
}

export function savePrescriptions(items: PrescriptionItem[]): void {
  try {
    localStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Failed to save prescriptions', err);
  }
}

export function addPrescription(
  data: Omit<PrescriptionItem, 'id' | 'datePrescribed' | 'isActive'>
): PrescriptionItem {
  const current = getPrescriptions();
  const newItem: PrescriptionItem = {
    ...data,
    id: `rx-${Date.now()}`,
    datePrescribed: new Date().toISOString().split('T')[0],
    isActive: true,
    takenToday: false,
  };
  const updated = [newItem, ...current];
  savePrescriptions(updated);
  return newItem;
}

export function deletePrescription(id: string): void {
  const current = getPrescriptions();
  const filtered = current.filter((rx) => rx.id !== id);
  savePrescriptions(filtered);
}

export function togglePrescriptionTaken(id: string): void {
  const current = getPrescriptions();
  const updated = current.map((rx) =>
    rx.id === id ? { ...rx, takenToday: !rx.takenToday } : rx
  );
  savePrescriptions(updated);
}
