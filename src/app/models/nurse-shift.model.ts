export type ShiftCode = '24' | 'R' | 'İ' | 'Yİ' | 'NÇ';

export type ShiftType = 'Confirmed' | 'Report' | 'Permission' | 'Annual' | 'AfterShift' | 'Free' | 'BeforeShift';

export interface ShiftEntry {
  date: string; // Örn: "2025-06-01"
  shiftType: ShiftType;
}

export interface NurseShift {
  nurseName: string;
  shifts: ShiftEntry[]; // Birden fazla tarih/vardiya bilgisi
}

export interface ShiftResponse {
  nurseName: string;
  shiftId: string;
  shiftType: ShiftType; // 0=Off, 1=Confirmed, 2=Vacation, 3=Sick
  day: string;
  isWorkingDay: boolean;
}
