import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-excel-upload',
  standalone: true,
  imports:[CommonModule],
  template: `
    <h2>Excel Dosyası Yükle</h2>
    <input type="file" (change)="onFileChange($event)" accept=".xlsx, .xls" />
    
    <table *ngIf="data.length > 0" border="1" style="margin-top:20px; width: 100%;">
      <thead>
        <tr>
          <th *ngFor="let col of cols">{{col}}</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let row of data">
          <td *ngFor="let col of cols">{{row[col]}}</td>
        </tr>
      </tbody>
    </table>
  `
})
export class ExcelUploadComponent {
  data: any[] = [];
  cols: string[] = [];

  onFileChange(evt: any) {
    const target: DataTransfer = <DataTransfer>(evt.target);

    if (target.files.length !== 1) {
      alert('Lütfen sadece bir dosya seçin.');
      return;
    }

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      this.data = XLSX.utils.sheet_to_json(ws);
      this.cols = this.data.length > 0 ? Object.keys(this.data[0]) : [];
    };

    reader.readAsArrayBuffer(target.files[0]);
  }
}
