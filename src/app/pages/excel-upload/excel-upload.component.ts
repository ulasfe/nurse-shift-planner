import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { CommonModule } from '@angular/common';
import { NurseShift } from '../../models/nurse-shift.model'; // Model dosyasına göre yolunu kontrol et

@Component({
  selector: 'app-excel-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Excel Dosyası Yükle</h2>
    <input type="file" (change)="onFileChange($event)" accept=".xlsx, .xls" />
    
    <table *ngIf="data.length > 0" border="1" style="margin-top:20px; width: 100%;">
      <thead>
        <tr>
          <th *ngFor="let col of cols">{{ col.header }}</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let row of data">
          <td *ngFor="let col of cols">{{row[col.field]}}</td>
        </tr>
      </tbody>
    </table>

    <button *ngIf="data.length > 0" (click)="prepareAndSend()" style="margin-top: 20px;">
      Verileri Gönder
    </button>
  `
})
export class ExcelUploadComponent {
  data: any[] = [];
  cols: { field: string; header: string }[] = [];

  onFileChange(evt: any) {
    const target: DataTransfer = <DataTransfer>(evt.target);
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

      const range = XLSX.utils.decode_range(ws['!ref'] as string);
      const headerRow = 4;
      this.cols = []; // önceki sütunları sıfırla
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: headerRow, c: C });
        const cell = ws[cellRef];
        const header = (cell && cell.v) ? cell.v.toString() : `Column${C + 1}`;
        this.cols.push({ field: header, header: header });
        if (header.trim().toUpperCase() === 'TOPLAM') break;
      }

      const rowStart = 5;
      const dataRows: any[] = [];
      for (let R = rowStart; R <= range.e.r; ++R) {
        const rowObj: any = {};
        for (let i = 0; i < this.cols.length; ++i) {
          const C = range.s.c + i;
          const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = ws[cellRef];
          const key = this.cols[i].field;
          rowObj[key] = cell ? cell.v : '';
        }
        dataRows.push(rowObj);
      }

      this.data = dataRows;
      console.log('Sütunlar:', this.cols);
      console.log('Veriler:', this.data);
    };
    reader.readAsArrayBuffer(target.files[0]);
  }

  prepareAndSend() {
    const nurseShifts: NurseShift[] = [];

    for (const row of this.data) {
      const nurseName = row[this.cols[0].field]; // İlk sütun hemşire adı varsayılıyor
      for (let i = 1; i < this.cols.length; i++) {
        const day = this.cols[i].field;
        const value = row[day]?.toString().trim();

        if (value === '24' || value === 'R' || value === 'I' || value === 'Y') {
          let shiftType: NurseShift['shiftType'];

          switch (value) {
            case '24': shiftType = 'Confirmed'; break;
            case 'R': shiftType = 'Report'; break;
            case 'I': shiftType = 'Permission'; break;
            case 'Y': shiftType = 'Annual'; break;
            default: continue;
          }

          nurseShifts.push({
            nurseName,
            date: day,
            shiftType
          });
        }
      }
    }

    console.log('Oluşan JSON:', nurseShifts);

    // TODO: HTTP POST ile gönderme işlemi yapılacak
    // this.http.post('/api/nurse-shifts', nurseShifts).subscribe(...)
  }
}
