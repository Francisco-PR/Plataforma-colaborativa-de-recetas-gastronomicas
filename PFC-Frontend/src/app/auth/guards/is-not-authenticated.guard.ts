import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { AuthStatus } from '../interfaces/auth-status.enum';
import { delay, of, tap } from 'rxjs';

export const isNotAuthenticatedGuard: CanActivateFn = (route, state) => {

  const authService = inject( AuthService )
  const router = inject( Router )

  if (authService.authStatus() === AuthStatus.checking) {
    return of(true).pipe(
      delay(100),
      tap(() => isNotAuthenticatedGuard(route, state))
    );
  }

  if ( authService.authStatus() === AuthStatus.authenticated ) {
    router.navigateByUrl('cookLab/home')
    return false;
  }

  return true;
};

