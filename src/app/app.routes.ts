import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'dashboard', 
    pathMatch: 'full' 
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage),
    //canActivate: [authGuard] // <--- Protégé
  },
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) 
  },
  { 
    path: 'caisse', 
    loadComponent: () => import('./pages/caisse/caisse.page').then(m => m.CaissePage),
    canActivate: [authGuard]
  },
  { 
    path: 'stocks', 
    loadComponent: () => import('./pages/stocks/stocks.page').then(m => m.StocksPage),
    canActivate: [authGuard]
  },
  { 
    path: 'settings', 
    loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage),
    canActivate: [authGuard]
  },
  { 
    path: 'history', 
    loadComponent: () => import('./pages/history/history.page').then(m => m.HistoryPage),
    canActivate: [authGuard]
  },
  { 
    path: 'staff', 
    loadComponent: () => import('./pages/staff/staff.page').then(m => m.StaffPage),
    canActivate: [authGuard] // Gestion des utilisateurs (Staff) protégée
  },
];
