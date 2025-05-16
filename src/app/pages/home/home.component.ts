import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,RouterLink],
  template: `<form> <h1>🏠 Ana Sayfa</h1><a routerLink="/login">Giriş yap</a> </form>`,
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {}
