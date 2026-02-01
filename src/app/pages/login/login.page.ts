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
    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.login(this.email, this.password);
      // La redirection est gérée par le router ou ici
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/invalid-credential') {
        this.errorMessage = 'Email ou mot de passe incorrect';
      } else if (error.code === 'auth/too-many-requests') {
        this.errorMessage = 'Trop de tentatives. Réessayez plus tard.';
      } else {
        this.errorMessage = 'Erreur de connexion.';
      }
    } finally {
      this.isLoading = false;
    }
  }
}
