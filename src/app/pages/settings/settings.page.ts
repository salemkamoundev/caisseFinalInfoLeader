import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, ToastController, AlertController, IonMenuButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, saveOutline, storefrontOutline, callOutline, mailOutline, 
  receiptOutline, warningOutline, peopleOutline, chevronForwardOutline, 
  logOutOutline, shieldCheckmarkOutline, menuOutline
} from 'ionicons/icons';
import { ConfigService } from 'src/app/services/config.service';
import { AuthService } from 'src/app/services/auth.service';
import { StoreConfig } from 'src/app/models/config.model';
import { take } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonContent, IonIcon, IonMenuButton]
})
export class SettingsPage implements OnInit {
  
  config: StoreConfig = { 
    name: '', address: '', phone: '', footerMessage: '', email: '', siret: '', defaultVat: 20, currencySymbol: '€'
  };
  isSaving = false;
  currentUserEmail: string | undefined | null = '';

  constructor(
    private configService: ConfigService, 
    private authService: AuthService,
    private toastCtrl: ToastController, 
    private alertCtrl: AlertController
  ) {
    addIcons({ 
      arrowBackOutline, saveOutline, storefrontOutline, callOutline, mailOutline, 
      receiptOutline, warningOutline, peopleOutline, chevronForwardOutline,
      logOutOutline, shieldCheckmarkOutline, menuOutline
    });
  }

  ngOnInit() {
    this.configService.getConfig().pipe(take(1)).subscribe(d => {
      if (d) this.config = { ...this.config, ...d };
    });
    this.currentUserEmail = this.authService.getCurrentUserEmail();
  }

  async save() {
    this.isSaving = true;
    try {
      await this.configService.saveConfig(this.config);
      const toast = await this.toastCtrl.create({ message: 'Sauvegardé !', duration: 2000, color: 'success', position: 'top' });
      toast.present();
    } catch (e) {
      console.error(e);
    } finally {
      this.isSaving = false;
    }
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Déconnexion',
      message: 'Voulez-vous vraiment vous déconnecter ?',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { text: 'Se déconnecter', role: 'confirm', handler: () => this.authService.logout() }
      ]
    });
    await alert.present();
  }

  async resetCache() {
    const alert = await this.alertCtrl.create({
      header: 'Confirmation',
      message: 'Vider le cache local ?',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { text: 'Oui', role: 'confirm', handler: () => { localStorage.clear(); location.reload(); } }
      ]
    });
    await alert.present();
  }
}
