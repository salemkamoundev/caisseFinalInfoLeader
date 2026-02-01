import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonIcon, ModalController, ToastController, 
  IonSelect, IonSelectOption, IonMenuButton 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, scanOutline, cartOutline, basketOutline, removeOutline, 
  addOutline, checkmarkCircleOutline, person, chevronDownOutline, menuOutline 
} from 'ionicons/icons';
import { ProductService } from 'src/app/services/product.service';
import { CartService } from 'src/app/services/cart.service';
import { StaffService } from 'src/app/services/staff.service';
import { Observable, take } from 'rxjs';
import { Product } from 'src/app/models/product.model';
import { Staff } from 'src/app/models/staff.model';
import { ScanModalComponent } from 'src/app/components/scan-modal/scan-modal.component';
import { ReceiptModalComponent } from 'src/app/components/receipt-modal/receipt-modal.component';

@Component({
  selector: 'app-caisse',
  templateUrl: './caisse.page.html',
  styleUrls: ['./caisse.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonSelect, IonSelectOption, IonMenuButton]
})
export class CaissePage implements OnInit {

  products$: Observable<Product[]>;
  cart$: Observable<any>;
  staffList$: Observable<Staff[]>;
  
  isProcessing = false;
  
  currentStaffId = 'COMPTOIR';
  currentStaffName = 'Comptoir';
  private allStaff: Staff[] = [];

  customPopoverOptions: any = {
    cssClass: 'modern-staff-popover',
    side: 'bottom',
    alignment: 'start',
    showBackdrop: false,
    event: null
  };

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private staffService: StaffService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {
    addIcons({ arrowBackOutline, scanOutline, cartOutline, basketOutline, removeOutline, addOutline, checkmarkCircleOutline, person, chevronDownOutline, menuOutline });
    this.products$ = this.productService.getProducts();
    this.cart$ = this.cartService.cart$;
    this.staffList$ = this.staffService.getStaff();
  }

  ngOnInit() {
    this.staffList$.subscribe(list => this.allStaff = list);
  }

  addToCart(product: Product) { this.cartService.addToCart(product); }
  decreaseItem(id: string) { this.cartService.removeFromCart(id); }

  updateCurrentStaffName() {
    if (this.currentStaffId === 'COMPTOIR') {
      this.currentStaffName = 'Comptoir';
    } else {
      const found = this.allStaff.find(s => s.id === this.currentStaffId);
      this.currentStaffName = found ? found.name : 'Inconnu';
    }
  }

  async openScanner() {
    const modal = await this.modalCtrl.create({ component: ScanModalComponent });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'scan_success' && data) {
      this.handleScanResult(data);
    }
  }

  private handleScanResult(barcode: string) {
    this.products$.pipe(take(1)).subscribe(products => {
      const found = products.find(p => p.barcode === barcode);
      if (found) {
        this.addToCart(found);
        this.presentToast('Ajouté', 'success');
      } else {
        this.presentToast('Inconnu', 'warning');
      }
    });
  }

  async validateSale() {
    this.isProcessing = true;
    try {
      const staffInfo = { id: this.currentStaffId, name: this.currentStaffName };
      const sale = await this.cartService.checkout('ESPECES', staffInfo);
      
      const modal = await this.modalCtrl.create({
        component: ReceiptModalComponent,
        componentProps: { sale: sale },
        backdropDismiss: false
      });
      await modal.present();
      this.presentToast('Vente OK', 'success');
    } catch (error) {
      console.error(error);
      this.presentToast('Erreur vente', 'danger');
    } finally {
      this.isProcessing = false;
    }
  }

  async presentToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color, position: 'top' });
    t.present();
  }
}
