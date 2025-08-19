import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-month-year-picker',
  standalone: true,
  imports: [
    DatePipe,              // 👈 add this line
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './month-year-picker.component.html'
})
export class MonthYearPickerComponent {
  date: Date | null = null;

  chosenYearHandler(normalizedYear: Date) {
    const ctrlValue = this.date || new Date();
    ctrlValue.setFullYear(normalizedYear.getFullYear());
    this.date = ctrlValue;
  }

  chosenMonthHandler(normalizedMonth: Date, datepicker: any) {
    const ctrlValue = this.date || new Date();
    ctrlValue.setMonth(normalizedMonth.getMonth());
    this.date = ctrlValue;
    datepicker.close();
  }
}
