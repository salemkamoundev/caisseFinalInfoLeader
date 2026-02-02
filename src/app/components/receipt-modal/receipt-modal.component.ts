import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, Platform } from '@ionic/angular'; // ✅ Correction : Import de IonicModule
import { addIcons } from 'ionicons';
import { printOutline, closeOutline, checkmarkCircle, barcodeOutline } from 'ionicons/icons';
import { Sale } from 'src/app/models/sale.model';
import { ConfigService } from 'src/app/services/config.service';
import { StoreConfig } from 'src/app/models/config.model';
import { Printer, PrintOptions } from '@awesome-cordova-plugins/printer/ngx';

@Component({
  selector: 'app-receipt-modal',
  templateUrl: './receipt-modal.component.html',
  styleUrls: ['./receipt-modal.component.scss'],
  standalone: true,
  // ✅ Correction : On utilise IonicModule au lieu de lister les composants individuellement
  imports: [CommonModule, IonicModule], 
  providers: [Printer]
})
export class ReceiptModalComponent implements OnInit {

  @Input() sale!: Sale;
  config: StoreConfig | null = null;

  constructor(
    private modalCtrl: ModalController,
    private configService: ConfigService,
    private printer: Printer,
    private platform: Platform
  ) {
    addIcons({ printOutline, closeOutline, checkmarkCircle, barcodeOutline });
  }

  ngOnInit() {
    this.configService.getConfig().subscribe(c => this.config = c);
  }

  close() {
    this.modalCtrl.dismiss();
  }

  // --- FONCTION ANTI-CRASH ---
  parseDate(date: any): Date {
    let validDate: Date;

    if (!date) {
      validDate = new Date();
    } 
    else if (typeof date === 'object' && 'seconds' in date) {
      validDate = new Date(date.seconds * 1000);
    } 
    else {
      validDate = new Date(date);
    }

    if (isNaN(validDate.getTime())) {
      return new Date();
    }

    return validDate;
  }

  async printReceipt() {
    // 1. Récupérer le contenu HTML brut
    const content = document.getElementById('receipt-area')?.innerHTML;

    if (!content) {
      alert("Erreur: Ticket vide");
      return;
    }

    // 2. Définir le CSS SPÉCIFIQUE pour l'impression (C'est ici que la magie opère)
    // On force le centrage, la police, et la largeur à 100% pour le ticket
    const styles = `
      <style>
        body { 
          font-family: 'Courier New', Courier, monospace; 
          width: 100%; 
          margin: 0; 
          padding: 0; 
          background-color: white; 
        }
        .receipt-container, div {
          width: 100%;
          text-align: center; /* Centre tout par défaut */
        }
        
        /* Force les titres en gras et gros */
        h2, h3 { 
          margin: 5px 0; 
          text-align: center;
        }

        /* Force les produits en MAJUSCULES */
        .product-name, strong {
          text-transform: uppercase !important; 
        }

        /* Tableau des prix : alignement gauche/droite */
        table { width: 100%; border-collapse: collapse; }
        td { padding: 2px 0; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        
        /* Ligne de séparation */
        hr { border-top: 1px dashed black; }
        
        /* Image/Logo au centre */
        img { 
          display: block; 
          margin: 0 auto; 
          max-width: 150px; 
        }
      </style>
    `;

    // 3. Construire une page HTML complète avec les styles INCLUS
    const fullHtml = `
      <html>
        <head>
          ${styles}
        </head>
        <body>
          <div class="receipt-container">
            ${content}
          </div>
        </body>
      </html>
    `;

    const options: PrintOptions = {
      name: 'Ticket Caisse',
      duplex: false,
      orientation: 'portrait',
      monochrome: true
    };

    if (!this.platform.is('cordova') && !this.platform.is('capacitor')) {
      // Sur PC (Web), on ouvre une fenêtre spéciale pour imprimer proprement
      const popupWin = window.open('', '_blank', 'width=400,height=600');
      if (popupWin) {
        popupWin.document.open();
        popupWin.document.write(fullHtml);
        popupWin.document.close();
        popupWin.onload = () => {
            popupWin.focus();
            popupWin.print();
            popupWin.close();
        };
      }
      return;
    }

    try {
      // Sur Android/Tablette : On envoie le HTML COMPLET avec le CSS
      const printResult = this.printer.print(fullHtml, options);
      if (printResult && typeof printResult.then === 'function') {
        await printResult;
      }
    } catch (e) {
      console.error('Erreur impression', e);
      // Fallback
      window.print();
    }
  }
}
