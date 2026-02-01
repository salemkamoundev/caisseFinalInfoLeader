import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isLogged = await authService.isLoggedIn();

  if (isLogged) {
    return true; // Accès autorisé
  } else {
    // Redirection vers login
    router.navigate(['/login']);
    return false;
  }
};
