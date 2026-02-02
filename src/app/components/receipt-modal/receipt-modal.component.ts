import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular'; 
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common'; 
import { Printer } from '@awesome-cordova-plugins/printer/ngx';
import { UsbSerial } from 'capacitor-usb-serial';


@Component({
  selector: 'app-receipt-modal',
  templateUrl: './receipt-modal.component.html',
  styleUrls: ['./receipt-modal.component.scss'],
  standalone: true, 
  imports: [IonicModule, CommonModule], 
  providers: [Printer, DatePipe, DecimalPipe] 
})
export class ReceiptModalComponent implements OnInit {
  @Input() sale: any;
  @Input() config: any;

  constructor(private modalCtrl: ModalController, private printer: Printer) {}

  ngOnInit() { }

  close() { this.modalCtrl.dismiss(); }

  parseDate(dateInput: any): Date {
    if (!dateInput) return new Date();
    return dateInput.seconds ? new Date(dateInput.seconds * 1000) : new Date(dateInput);
  }



async printTestTicket() {
    const usb = UsbSerial as any;

    try {
      // 1. Détection de l'imprimante
      const result = await usb.devices();
      if (!result.devices || result.devices.length === 0) {
        alert("Erreur : Imprimante USB non détectée.");
        return;
      }

      const device = result.devices[0];

      // 2. Connexion
      await usb.connect({
        deviceId: device.deviceId,
        baudRate: 9600 // Standard pour la plupart des imprimantes de caisse
      });

      // 3. Préparation du contenu du ticket (basé sur ton image)
      const encoder = new TextEncoder();
      
      // Commandes ESC/POS
      const ESC = 0x1B;
      const GS = 0x1D;
      
      const initPrinter = [ESC, 0x40];
      const centerAlign = [ESC, 0x61, 0x01];
      const leftAlign = [ESC, 0x61, 0x00];
      const boldOn = [ESC, 0x45, 0x01];
      const boldOff = [ESC, 0x45, 0x00];
      const cutPaper = [GS, 0x56, 0x41, 0x03];

      // Construction du texte
      let content = "";
      content += "MON COMMERCE\n";
      content += "Tunisie\n";
      content += "--------------------------------\n";
      content += "1x Article 1\n";
      content += "1x Article 2\n";
      content += "1x Article 3\n";
      content += "--------------------------------\n";
      content += "TOTAL : 15.500 DT\n\n";
      content += "Merci de votre visite !\n\n\n";

      // Encodage en binaire
      const textBytes = Array.from(encoder.encode(content));

      // Fusion de toutes les commandes : Initialisation + Centrage + Texte + Coupe
      const fullPayload = [
        ...initPrinter, 
        ...centerAlign, 
        ...boldOn,
        ...textBytes, 
        ...cutPaper
      ];

      // 4. Envoi unique en Hexadécimal
      await usb.write({
        data: this.toHexString(new Uint8Array(fullPayload))
      });

      console.log("Impression lancée avec succès");

    } catch (err) {
      console.error("Échec de l'impression :", err);
      alert("Erreur technique lors de l'impression.");
    }
  }

  toHexString(byteArray: Uint8Array): string {
    return Array.from(byteArray, (byte) => {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
  }

  printReceipt() {
    const receiptElement = document.getElementById('receipt-area');
    if (!receiptElement) return;

    const content = receiptElement.innerHTML;
    const style = "<style>body { font-family: 'Courier New', monospace; width: 100%; margin: 0; padding: 10px; } table { width: 100%; border-collapse: collapse; } .text-right { text-align: right; } hr { border-top: 1px dashed black; margin: 10px 0; }</style>";
    const fullHtml = "<html><head>" + style + "</head><body>" + content + "</body></html>";

    // Forcer l'impression système Android
    this.printer.isAvailable().then(() => {
      this.printer.print(fullHtml, { name: 'Ticket_Caisse', duplex: false });
    }).catch(() => {
      // Méthode IFRAME pour éviter la fenêtre vide Chrome
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      document.body.appendChild(iframe);
      
      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(fullHtml);
        doc.close();
        
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => document.body.removeChild(iframe), 2000);
        }, 500);
      }
    });
  }
}
