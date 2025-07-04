import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pivot-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="pivotRows.length > 0">
      <h3>Nöbet Listesi</h3>
      <table border="1" style="width: 100%; margin-top: 10px;">
        <thead>
          <tr>
            <th>Hemşire</th>
            <th *ngFor="let day of scheduleDays">{{ day }}</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of pivotRows">
            <td>{{ row.nurse }}</td>
            <td *ngFor="let day of scheduleDays">
              {{ row[day] || '' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class PivotDisplayComponent {
  @Input() set scheduleData(value: { [day: string]: string[] }) {
    if (!value || typeof value !== 'object') {
      this.scheduleDays = [];
      this.pivotRows = [];
      return;
    }

    this.scheduleDays = Object.keys(value).sort((a, b) => +a - +b);

    const nurseSet = new Set<string>();

    for (const day of this.scheduleDays) {
      const nurses = Array.isArray(value[day]) ? value[day] : [];
      for (const nurse of nurses) {
        nurseSet.add(nurse);
      }
    }

    const rows: any[] = [];
    for (const nurse of nurseSet) {
      const row: any = { nurse };
      for (const day of this.scheduleDays) {
        const nurses = Array.isArray(value[day]) ? value[day] : [];
        row[day] = nurses.includes(nurse) ? '24' : '';
      }
      rows.push(row);
    }

    this.pivotRows = rows;
  }

  scheduleDays: string[] = [];
  pivotRows: { nurse: string; [key: string]: string }[] = [];
}
