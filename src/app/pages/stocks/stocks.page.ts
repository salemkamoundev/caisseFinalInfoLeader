import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonIcon, IonItemSliding, IonItem, IonItemOptions, IonItemOption, 
  ModalController, NavController, ToastController, IonMenuButton 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, addOutline, cubeOutline, trashOutline, imageOutline, 
  barcodeOutline, searchOutline, alertCircleOutline, filterOutline, pencilOutline, menuOutline 
} from 'ionicons/icons';
import { ProductService } from 'src/app/services/product.service';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from 'src/app/models/product.model';
import { ProductModalComponent } from 'src/app/components/product-modal/product-modal.component';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.page.html',
  styleUrls: ['./stocks.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonItemSliding, IonItem, IonItemOptions, IonItemOption, IonMenuButton]
})
export class StocksPage implements OnInit {
  
  private productsSource$ = this.productService.getProducts();
  
  searchTerm$ = new BehaviorSubject<string>('');
  categoryFilter$ = new BehaviorSubject<string>('Tout');

  filteredProducts$: Observable<Product[]>;

  categories = ['Tout', 'Stock Faible', 'Boissons', 'Snack', 'Viennoiserie', 'Divers'];

  constructor(
    private productService: ProductService, 
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) {
    addIcons({ arrowBackOutline, addOutline, cubeOutline, trashOutline, imageOutline, barcodeOutline, searchOutline, alertCircleOutline, filterOutline, pencilOutline, menuOutline });
    
    this.filteredProducts$ = combineLatest([
      this.productsSource$,
      this.searchTerm$,
      this.categoryFilter$
    ]).pipe(
      map(([products, term, category]) => {
        let filtered = products.filter(p => 
          p.name.toLowerCase().includes(term.toLowerCase()) || 
          (p.barcode && p.barcode.includes(term))
        );

        if (category === 'Stock Faible') {
          filtered = filtered.filter(p => p.stock <= 5);
        } else if (category !== 'Tout') {
          filtered = filtered.filter(p => p.category === category);
        }
        return filtered;
      })
    );
  }

  ngOnInit() {}

  goBack() {
    this.navCtrl.navigateBack('/dashboard');
  }

  onSearch(event: any) {
    this.searchTerm$.next(event.target.value);
  }

  setCategory(cat: string) {
    this.categoryFilter$.next(cat);
  }

  async openAddModal() {
    const modal = await this.modalCtrl.create({ component: ProductModalComponent });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data) {
      this.productService.addProduct(data);
      this.presentToast('Produit créé avec succès', 'success');
    }
  }

  async editProduct(product: Product, slidingItem: any) {
    slidingItem.close();
    const modal = await this.modalCtrl.create({ 
      component: ProductModalComponent,
      componentProps: { productToEdit: product }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data) {
      await this.productService.updateProduct(data);
      this.presentToast('Produit mis à jour', 'success');
    }
  }

  async deleteProduct(id: string) {
    await this.productService.deleteProduct(id);
    this.presentToast('Produit supprimé', 'dark');
  }

  async presentToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color, position: 'top' });
    t.present();
  }
}
