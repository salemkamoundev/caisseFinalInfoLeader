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
    const content = document.getElementById('receipt-area')?.innerHTML;
    const options: PrintOptions = {
      name: 'Ticket Caisse',
      duplex: false,
      orientation: 'portrait',
      monochrome: true
    };

    if (!this.platform.is('cordova') && !this.platform.is('capacitor')) {
      window.print();
      return;
    }

    try {
      const printResult = this.printer.print(content || '', options);
      if (printResult && typeof printResult.then === 'function') {
        await printResult;
      } else {
        window.print();
      }
    } catch (e) {
      window.print();
    }
  }
}
