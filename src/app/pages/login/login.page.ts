import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { storefront, alertCircle } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonSpinner]
})
export class LoginPage implements OnInit {

  email = 'admin@gmail.com';
  password = 'User123';
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {
    addIcons({ storefront, alertCircle });
  }

  ngOnInit() {
    // Si déjà connecté, on redirige direct
    this.authService.isLoggedIn().then(logged => {
      if (logged) this.router.navigate(['/dashboard']);
    });
  }

  async onLogin(e: Event) {
    e.preventDefault();
    console.log('🔴 BOUTON LOGIN CLIQUÉ'); // Log 1

    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    console.log('🔴 Tentative de connexion avec:', this.email); // Log 2

    try {
      const user = await this.authService.login(this.email, this.password);
      console.log('🟢 CONNEXION RÉUSSIE ! User:', user); // Log 3
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    } catch (error: any) {
      console.error('🔴 ERREUR LOGIN:', error); // Log 4
      console.log('🔴 CODE ERREUR:', error.code); // Log 5
      console.log('🔴 MESSAGE ERREUR:', error.message); // Log 6
      
      if (error.code === 'auth/invalid-credential') {
        this.errorMessage = 'Email ou mot de passe incorrect';
      } else if (error.code === 'auth/network-request-failed') {
        this.errorMessage = 'Erreur réseau (Pas internet ?)';
      } else {
        this.errorMessage = 'Erreur: ' + error.message;
      }
    } finally {
      this.isLoading = false;
    }
  }
}
