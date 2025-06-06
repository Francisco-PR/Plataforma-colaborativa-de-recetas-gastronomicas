import { Routes } from '@angular/router';
import { isNotAuthenticatedGuard } from './auth/guards/is-not-authenticated.guard';

export const routes: Routes = [
  { path: 'auth',
    canActivate: [ isNotAuthenticatedGuard ],
    loadChildren: () => import('./auth/auth.routes')
  },
  { path: 'cookLab', loadChildren: () => import('./cookLab/cookLab.routes') },
  { path: '', redirectTo: 'cookLab', pathMatch: 'full' },
  { path: '**', redirectTo: 'cookLab' },
];
