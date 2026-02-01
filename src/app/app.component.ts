import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { 
  IonApp, IonRouterOutlet, IonMenu, IonContent, IonList, 
  IonIcon, IonMenuToggle 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  gridOutline, calculatorOutline, cubeOutline, timeOutline, 
  settingsOutline, peopleOutline, logOutOutline, storefront, 
  chevronForwardOutline 
} from 'ionicons/icons';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterLink, RouterLinkActive,
    IonApp, IonRouterOutlet, IonMenu, IonContent, IonList, 
    IonIcon, IonMenuToggle
  ],
})
export class AppComponent {
  
  public appPages = [
    { title: 'Tableau de bord', url: '/dashboard', icon: 'grid-outline' },
    { title: 'Caisse', url: '/caisse', icon: 'calculator-outline' },
    { title: 'Stocks', url: '/stocks', icon: 'cube-outline' },
    { title: 'Historique', url: '/history', icon: 'time-outline' },
    { title: 'Équipe', url: '/staff', icon: 'people-outline' },
    { title: 'Paramètres', url: '/settings', icon: 'settings-outline' },
  ];

  userEmail: string | null | undefined = '';

  constructor(public authService: AuthService) {
    addIcons({ 
      gridOutline, calculatorOutline, cubeOutline, timeOutline, 
      settingsOutline, peopleOutline, logOutOutline, storefront,
      chevronForwardOutline
    });
    
    this.userEmail = this.authService.getCurrentUserEmail();
  }

  logout() {
    this.authService.logout();
  }
}
