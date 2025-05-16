import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { mockUsers } from '../mock-users';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (ngSubmit)="register()" #registerForm="ngForm">
      <h2>Kayıt Ol</h2>
      <input type="text" name="name" [(ngModel)]="name" placeholder="Ad Soyad" required /><br />

      <input type="email" name="email" [(ngModel)]="email" placeholder="E-posta" required /><br />
      <input type="email" name="confirmEmail" [(ngModel)]="confirmEmail" placeholder="E-postayı tekrar girin" required /><br />

      <input type="password" name="password" [(ngModel)]="password" placeholder="Şifre" required /><br />

      <div *ngIf="emailMismatch" style="color: red;">E-posta adresleri uyuşmuyor.</div>
      <div *ngIf="invalidEmailFormat" style="color: red;">Geçerli bir e-posta adresi girin.</div>

      <button type="submit" [disabled]="!registerForm.form.valid">Kayıt Ol</button>
    </form>
  `,
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  name = '';
  email = '';
  confirmEmail = '';
  password = '';

  emailMismatch = false;
  invalidEmailFormat = false;

  constructor(private router: Router) {}

  register() {
    this.emailMismatch = this.email !== this.confirmEmail;
    this.invalidEmailFormat = !this.validateEmail(this.email);

    if (this.emailMismatch || this.invalidEmailFormat) {
      return;
    }

    const newUser = {
      name: this.name,
      email: this.email,
      password: this.password,
    };

    mockUsers.push(newUser);

    alert('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.');
    this.router.navigate(['/login']);
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
