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
async printReceipt() {
  const usb = UsbSerial as any;

  try {
    const result = await usb.usbSerialDevices()
    if (!result.usbSerialDevices() || result.usbSerialDevices().length === 0) {
      alert("Imprimante non détectée sur le port USB.");
      return;
    }

    // Connexion au premier périphérique trouvé
    await usb.connect({ deviceId: result.devices[0].deviceId, baudRate: 9600 });

    const encoder = new TextEncoder();
    const esc = {
      init: [0x1B, 0x40],
      center: [0x1B, 0x61, 0x01],
      boldOn: [0x1B, 0x45, 0x01],
      cut: [0x1D, 0x56, 0x41, 0x03]
    };

    // Construction du texte brut pour l'imprimante thermique
    const ticketData = [
      ...esc.init,
      ...esc.center,
      ...esc.boldOn,
      ...encoder.encode("MON COMMERCE\nTunisie\n\n"),
      ...encoder.encode("--------------------------------\n"),
      ...encoder.encode("TOTAL: 17.000 DT\n\n"),
      ...esc.cut
    ];

    // Envoi direct (C'est cette commande qui évite le Print Spooler)
    await usb.write({
      data: this.toHexString(new Uint8Array(ticketData))
    });

  } catch (err) {
    console.error("Erreur impression directe:", err);
  }
}


async printTestTicket() {
  const usb = UsbSerial as any;
  try {
    const result = await usb.devices();
    if (result.devices.length > 0) {
      const device = result.devices[0];

      // Connexion directe au port
      await usb.connect({ deviceId: device.deviceId, baudRate: 9600 });

      const encoder = new TextEncoder();
      
      // Commandes ESC/POS cruciales
      const init = [0x1B, 0x40];      // Reset imprimante
      const cut  = [0x1D, 0x56, 0x01]; // Coupe partielle
      
      const texte = Array.from(encoder.encode("MON COMMERCE\nTOTAL: 15.500 DT\n\n\n"));
      
      // On combine tout dans un seul envoi
      const payload = [...init, ...texte, ...cut];

      await usb.write({
        data: this.toHexString(new Uint8Array(payload))
      });
      
      console.log("Données envoyées au port USB !");
    }
  } catch (e) {
    console.error("Erreur USB:", e);
  }
}
  toHexString(byteArray: Uint8Array): string {
    return Array.from(byteArray, (byte) => {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
  }
}