import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';


export const isAdminGuard: CanActivateFn = (route, state) => {

  const authService = inject( AuthService )
  const router = inject( Router )

  if ( authService.isAdmin() ) {
    return true;
  }

  router.navigateByUrl('/cookLab/home')
  return false;
};

