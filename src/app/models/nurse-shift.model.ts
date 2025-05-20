// nurse-shift.model.ts

export type ShiftCode = '24' | 'R' | 'I' | 'Y';

export interface NurseShift {
  nurseName: string;
  date: string; // ISO tarih formatı kullanılabilir: "2025-06-01"
  shiftType: 'Confirmed' | 'Report' | 'Permission' | 'Annual';
}
