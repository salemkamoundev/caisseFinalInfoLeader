import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, authState, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);

  // Observable de l'état utilisateur (Connecté ou pas)
  user$: Observable<User | null> = authState(this.auth);

  constructor() {}

  // Connexion
  async login(email: string, pass: string) {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, pass);
      return credential.user;
    } catch (e: any) {
      console.error(e);
      throw e;
    }
  }

  // Déconnexion
  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

  // Vérifier si connecté (Promise) pour les Guards
  isLoggedIn(): Promise<boolean> {
    return new Promise((resolve) => {
      const unsubscribe = this.auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(!!user);
      });
    });
  }
  
  // Récupérer l'email actuel
  getCurrentUserEmail() {
    return this.auth.currentUser?.email;
  }
}
