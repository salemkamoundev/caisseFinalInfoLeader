import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton, ModalController, IonIcon } from '@ionic/angular/standalone';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-scan-modal',
  templateUrl: './scan-modal.component.html',
  standalone: true,
  imports: [
    CommonModule, 
    ZXingScannerModule,
    IonContent, IonButton, IonIcon
  ]
})
export class ScanModalComponent {

  allowedFormats = ['QR_CODE', 'EAN_13', 'EAN_8', 'CODE_128', 'CODE_39'] as any;

  constructor(private modalCtrl: ModalController) {
    addIcons({ closeOutline });
  }

  handleQrCodeResult(resultString: string) {
    // Petit délai pour l'UX
    setTimeout(() => {
        this.modalCtrl.dismiss(resultString, 'scan_success');
    }, 200);
  }

  close() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
