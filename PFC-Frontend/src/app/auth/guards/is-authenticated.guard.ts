import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { AuthStatus } from '../interfaces/auth-status.enum';
import { delay, of, switchMap, tap } from 'rxjs';


export const isAuthenticatedGuard: CanActivateFn = (route, state) => {

  const authService = inject( AuthService )
  const router = inject( Router )

  if (authService.authStatus() === AuthStatus.checking) {
    return of(true).pipe(
      delay(100),
      tap(() => isAuthenticatedGuard(route, state))
    );
  }

  if ( authService.authStatus() === AuthStatus.authenticated ) {
    return true;
  }

  const url = state.url;
  localStorage.setItem('url', url);

  router.navigateByUrl('auth/login')
  return false;
};

