export interface User {
  id: string;
  email: string;
  name: string;
  dateOfBirth?: string | null;
  heightCm?: number | null;
  timezone: string;
  locale: string;
  createdAt: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  aiContextOptIn: boolean;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
  theme: 'light' | 'dark' | 'system';
  notifEmail: boolean;
  notifPush: boolean;
  notifInApp: boolean;
}

export interface HealthLog {
  id: string;
  type: string;
  value: Record<string, any>;
  unit?: string | null;
  loggedAt: string;
  note?: string | null;
  createdAt: string;
}

export interface Goal {
  id: string;
  type: string;
  targetValue: number;
  period: 'DAILY' | 'WEEKLY';
  isActive: boolean;
  createdAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  dose: string;
  form: string;
  schedule: {
    times: string[];
    daysOfWeek?: number[];
  };
  startDate: string;
  endDate?: string | null;
  notes?: string | null;
  isActive: boolean;
  recentEvents?: MedicineEvent[];
  createdAt: string;
}

export interface MedicineEvent {
  id: string;
  medicineId: string;
  scheduledAt: string;
  status: 'PENDING' | 'TAKEN' | 'SKIPPED' | 'MISSED' | 'SNOOZED';
  actedAt?: string | null;
  createdAt: string;
}

export interface Reminder {
  id: string;
  kind: 'MEDICINE' | 'WATER' | 'EXERCISE' | 'SLEEP' | 'APPOINTMENT' | 'CUSTOM';
  title: string;
  body?: string | null;
  rrule: string;
  timezone: string;
  nextFireAt: string;
  channels: ('IN_APP' | 'PUSH' | 'EMAIL')[];
  isActive: boolean;
  medicine?: { id: string; name: string; dose: string };
  appointment?: { id: string; title: string; scheduledAt: string };
}

export interface Appointment {
  id: string;
  title: string;
  doctor?: string | null;
  location?: string | null;
  scheduledAt: string;
  notes?: string | null;
  reminderOffsetMinutes?: number | null;
  reminders?: Reminder[];
  createdAt: string;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface AdherenceStats {
  totalEvents: number;
  taken: number;
  skipped: number;
  missed: number;
  adherenceRate: number;
}
