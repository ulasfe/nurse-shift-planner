import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },{
    path: 'register',
    loadComponent: () =>
    import('./auth/register/register.component').then((m) => m.RegisterComponent),
    },{
    path: 'excel-upload',
    loadComponent: () =>
    import('./pages/excel-upload/excel-upload.component').then((m) => m.ExcelUploadComponent),
    },
];
