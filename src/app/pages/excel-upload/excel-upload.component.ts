import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { CommonModule } from '@angular/common';
import { NurseShift, ShiftCode, ShiftEntry, ShiftResponse } from '../../models/nurse-shift.model';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { PivotDisplayComponent } from '../pivot-display/pivot-display.component';

@Component({
  selector: 'app-excel-upload',
  standalone: true,
  imports: [CommonModule,PivotDisplayComponent, HttpClientModule],
    styleUrls: ['./excel-upload.component.scss'],
 templateUrl: './excel-upload.component.html',
})
export class ExcelUploadComponent {
  data: any[] = [];
  cols: { field: string; header: string }[] = [];
  shiftData: NurseShift[] = [];
  scheduleData: any = {};
  days: string[] = [];
  nurseList: string[] = [];
  private scheduleMap = new Map<string, Set<ShiftResponse>>();
  dayTotals: Record<string, number> = {};

  constructor(private http: HttpClient) {}

  onFileChange(evt: any) {
    const target: DataTransfer = <DataTransfer>evt.target;
    if (target.files.length !== 1) {
      throw new Error('Lütfen tek bir dosya seçin.');
    }

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const wsname: string = wb.SheetNames[wb.SheetNames.length - 1];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      const merges: XLSX.Range[] = (ws['!merges'] as XLSX.Range[]) || [];
      merges.forEach((merge) => {
        if (merge.s.r < 4) {
          const startCell = XLSX.utils.encode_cell({ r: merge.s.r, c: merge.s.c });
          const startValue = ws[startCell]?.v;
          for (let R = merge.s.r; R <= merge.e.r; ++R) {
            for (let C = merge.s.c; C <= merge.e.c; ++C) {
              const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
              ws[cellAddress] = { t: 's', v: startValue };
            }
          }
        }
      });

      if (ws && ws['!ref']) {
        const range = XLSX.utils.decode_range(ws['!ref'] as string);
        const headerRow = 4;
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellRef = XLSX.utils.encode_cell({ r: headerRow, c: C });
          const cell = ws[cellRef];
          const header = cell && cell.v ? cell.v.toString() : `Column${C + 1}`;
          this.cols.push({ field: header, header });
          if (header.trim().toUpperCase() === 'TOPLAM') break;
        }

        const dataRows: any[] = [];
        const rowStart = 5;
        for (let R = rowStart; R <= range.e.r; ++R) {
          const rowObj: any = {};
          for (let i = 0; i < this.cols.length; ++i) {
            const C = range.s.c + i;
            const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = ws[cellRef];
            rowObj[this.cols[i].field] = cell ? cell.v : '';
          }
          dataRows.push(rowObj);
        }
        this.data = dataRows;
      } else {
        console.error('Sheet ya da !ref tanımsız.');
      }
    };
    reader.readAsArrayBuffer(target.files[0]);
  }

  mapShiftCode(code: ShiftCode): ShiftEntry['shiftType'] {
    switch (code) {
      case '24': return 'Confirmed';
      case 'R': return 'Report';
      case 'İ': return 'Permission';
      case 'Yİ': return 'Annual';
      case 'NÇ': return 'AfterShift';
      case 'EX': return 'ExtraWorkHours';
    }
  }

  prepareAndSend() {
    const mapShifts = new Map<string, ShiftEntry[]>();

   for (const row of this.data) {
    const nurseName = row[this.cols[1].field]?.toString().trim();
    if (!nurseName || nurseName.toUpperCase().includes('TOPLAM')) continue;

    // Her hemşire için boş da olsa baştan entry oluştur
    if (!mapShifts.has(nurseName)) {
      mapShifts.set(nurseName, []);
    }

    for (let i = 2; i < this.cols.length; i++) {  // i=2 çünkü i=1 AD SOYAD
      const dayStr = this.cols[i].field;
      const value = row[dayStr]?.toString().trim();

      if (['24', 'R', 'İ', 'Yİ', 'NÇ','EX'].includes(value)) {
        const shiftType = this.mapShiftCode(value as ShiftCode);
// --- Burada DateOnly formatına dönüş yap ---
    const dayNum = parseInt(dayStr, 10); // Excel başlığından gelen gün numarası
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 2; // JavaScript'te ay 0 tabanlı

    // Ay ve günü 2 basamaklı hale getir
    const monthStr = month.toString().padStart(2, '0');
    const day = dayNum.toString().padStart(2, '0');

    const formattedDateOnly = `${year}-${monthStr}-${day}`; // DateOnly formatı: yyyy-MM-dd


        const entry: ShiftEntry = { date : formattedDateOnly, shiftType };
        const entries = mapShifts.get(nurseName) || [];
        entries.push(entry);
      }
    }
  }
    

    // Map'ten diziye dönüştür
    this.shiftData = Array.from(mapShifts.entries()).map(
      ([nurseName, shifts]) => ({ nurseName, shifts })
    );

    console.log('Oluşan JSON:', this.shiftData);
 
    

    // HTTP POST
this.http.post<{ [day: string]: ShiftResponse[] }>('http://localhost:5000/api/NurseShifts', this.shiftData)
  .subscribe({
    next: (response) => {
      this.scheduleMap.clear();

      // NurseName -> Set<ShiftResponse>
      for (const [day, shifts] of Object.entries(response)) {
        for (const shift of shifts) {
          const nurseName = shift.nurseName.trim();
          if (!this.scheduleMap.has(nurseName)) {
            this.scheduleMap.set(nurseName, new Set<ShiftResponse>());
          }
          this.scheduleMap.get(nurseName)!.add(shift);
        }
      }

      // Günleri sırala
     this.days = Object.keys(response)
  .filter(day => day !== "ExtraWorkHours" && day !== "WorkHours" ) // ExtraWorkHours'ı hariç tut
  .sort((a, b) => +a - +b); // Sayısal sıralama
     console.log('Gelen data:', response);
      // Hemşireleri sırala
      this.nurseList = Array.from(this.scheduleMap.keys()).sort((a, b) =>
        a.localeCompare(b, 'tr', { sensitivity: 'base' })
      );

      // Günlük nöbet sayıları
      this.dayTotals = {};
      for (const day of this.days) {
        let count = 0;
        for (const shifts of this.scheduleMap.values()) {
          if ([...shifts].some(s => s.day === day && s.shiftType === 'Confirmed')) {
            count++;
          }
        }
        this.dayTotals[day] = count;
      }

      alert('Pivot tablo hazır!');
    },
    error: err => {
      console.error('HTTP Hatası:', err);
      alert('Gönderim sırasında hata oluştu: ' + (err.error?.message || err.message));
    }
  });

  }

  mapShiftType(shiftType: string): string {
  switch (shiftType) {
    case 'Confirmed': return '24';
    case 'Report': return 'R';
    case 'Permission': return 'İ';
    case 'Annual': return 'Yİ';
    case 'AfterShift': return 'NÇ';
    case 'ExtraWorkHours': return 'EX';
    case 'WorkHours': return 'WH';
    default: return '';
  }
}

getNurseWeekendTotal(nurse: string): number {
  var total = 0;
  const shifts = this.scheduleMap.get(nurse);
  if (!shifts) return 0;
  total =[...shifts].filter(s =>!s.isWorkingDay && s.shiftType.trim() === 'Confirmed').length
  return total ;
}

getCellClass(nurse: string, day: string): string {
  const nurseSchedule = this.scheduleMap.get(nurse);

  if (!nurseSchedule) return '';

  const entry = Array.from(nurseSchedule).find(d => d.day === day);

  if (entry && entry.isWorkingDay === false) {
    return 'weekend-cell'; 
  }

  return '';
}



getCellValue(nurse: string, day: string): string {
  const shifts = this.scheduleMap.get(nurse);
  if (!shifts) return '';

  const match = [...shifts].find(s => s.day.toString() === day.toString());
 console.log('match:', match);
  if (!match) {
    return '';
  } else {
    const mappedType = this.mapShiftType(match.shiftType);
    if (mappedType === '24' || mappedType === 'Yİ') {
      return mappedType;
    } else  {
      return ''; // veya istediğiniz başka bir gösterim
    }
    return '';
  }
}

getNurseWeekdayTotal(nurse: string): number {
  const shifts = this.scheduleMap.get(nurse);
  if (!shifts) return 0;
  return [...shifts].filter(s => s.isWorkingDay &&  s.shiftType.trim() === 'Confirmed').length;
}

getExtraWorkHoursTotal(nurse: string): number {
  const shifts = this.scheduleMap.get(nurse);
  if (!shifts) return 0;

  return [...shifts]
    .filter(s => s.isWorkingDay && s.shiftType?.trim() === 'ExtraWorkHours')
    .reduce((total, shift) => total + (shift.workHours || 0), 0); // workHours değerlerini topla
}


getWorkHoursTotal(nurse: string): number {
  const shifts = this.scheduleMap.get(nurse);
  if (!shifts) return 0;

  return [...shifts]
    .filter(s => s.isWorkingDay && s.shiftType?.trim() === 'WorkHours')
    .reduce((total, shift) => total + (shift.workHours || 0), 0); // workHours değerlerini topla
}

getNurseTotal(nurse: string): number {
  const shifts = this.scheduleMap.get(nurse);
  if (!shifts) return 0;

 return [...shifts]
    .filter(s => s.shiftType.trim() === 'Confirmed') // R: Confirmed
    .length;
}


  // --- Footer’da haftasonu, hafta içi ve ay toplamları ---
 getFooterWeekendTotal(): number {
  let total = 0;

  this.scheduleMap.forEach((shifts) => {
    shifts.forEach(shift => {
      if (shift.isWorkingDay &&  this.mapShiftType(shift.shiftType) === '24' ) {
        total++;
      }
    });
  });

  return total;
}


getFooterExtraWorkHoursTotal(): number {
   let total = 0;

  this.scheduleMap.forEach((shifts) => {
    shifts.forEach(shift => {
      if (this.mapShiftType(shift.shiftType) === 'EX') {
        total += shift.workHours;
      }
    });
  });

  return total;
  }

  getFooterWorkHoursTotal(): number {
   let total = 0;

  this.scheduleMap.forEach((shifts) => {
    shifts.forEach(shift => {
      if (this.mapShiftType(shift.shiftType) === 'WH') {
        total += shift.workHours;
      }
    });
  });

  return total;
  }

  getFooterWeekdayTotal(): number {
   let total = 0;

  this.scheduleMap.forEach((shifts) => {
    shifts.forEach(shift => {
      if (!shift.isWorkingDay &&  this.mapShiftType(shift.shiftType) === '24' ) {
        total++;
      }
    });
  });

  return total;
  }

  getFooterTotal(): number {
    // Ay toplamı = tüm gün sütun toplamları
    return Object.values(this.dayTotals).reduce((a, b) => a + b, 0);
  }
}
