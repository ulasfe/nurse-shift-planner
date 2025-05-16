import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { mockUsers } from '../mock-users';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  template: `
    
<form (ngSubmit)="login()" #loginForm="ngForm">
  <h2>Giriş Yap</h2>
  <input type="email" name="email" [(ngModel)]="email" placeholder="E-posta" required /><br />
  <input type="password" name="password" [(ngModel)]="password" placeholder="Şifre" required /><br />

  <div *ngIf="loginError" style="color: red;">E-posta veya şifre hatalı.</div>

  <button type="submit" [disabled]="!loginForm.form.valid">Giriş Yap</button>
<p>Hesabınız yok mu? <a [routerLink]="['/register']">Kayıt olun</a></p>
</form>

  `,
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  loginError = false;

  constructor(private router: Router) {}

  login() {
    const found = mockUsers.find(
      (user) => user.email === this.email && user.password === this.password
    );

    if (!found) {
      this.loginError = true;
    } else {
      this.loginError = false;
      alert(`Hoş geldiniz ${found.name}`);
      this.router.navigate(['/excel-upload']);
    }
  }
}
