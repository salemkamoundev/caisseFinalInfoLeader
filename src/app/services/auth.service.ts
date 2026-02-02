import { Injectable, NgZone, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, authState, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);
  private ngZone: NgZone = inject(NgZone);

  // Observable de l'utilisateur courant
  user$: Observable<User | null> = authState(this.auth);

  constructor() {}

  // --- LOGIN ---
  async login(email: string, pass: string) {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, pass);
      
      // Force la redirection dans la zone Angular
      this.ngZone.run(() => {
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      });

      return credential.user;
    } catch (e) {
      console.error('Erreur Login:', e);
      throw e;
    }
  }

  // --- LOGOUT ---
  async logout() {
    try {
      await signOut(this.auth);
      this.ngZone.run(() => {
        this.router.navigate(['/login'], { replaceUrl: true });
      });
    } catch (e) {
      console.error('Erreur Logout:', e);
    }
  }

  // --- UTILITAIRE GUARD ---
  isLoggedIn(): Promise<boolean> {
    return new Promise((resolve) => {
      const unsubscribe = this.auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(!!user);
      });
    });
  }

  // --- MÉTHODE MANQUANTE AJOUTÉE ICI ---
  getCurrentUserEmail(): string | null | undefined {
    return this.auth.currentUser?.email;
  }
}