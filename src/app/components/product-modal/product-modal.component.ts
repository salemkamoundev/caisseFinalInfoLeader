import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, 
  IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, ModalController, IonIcon, 
  IonSpinner, ToastController 
} from '@ionic/angular/standalone';
import { Product } from 'src/app/models/product.model';
import { addIcons } from 'ionicons';
import { closeOutline, saveOutline, barcodeOutline, gridOutline, cameraOutline, imageOutline, add } from 'ionicons/icons';
import { ImageService } from 'src/app/services/image.service';

@Component({
  selector: 'app-product-modal',
  templateUrl: './product-modal.component.html',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
    IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonIcon, IonSpinner
  ]
})
export class ProductModalComponent implements OnInit {

  // Si ce produit est passé en entrée, on est en mode "Modification"
  @Input() productToEdit?: Product;

  product: Product = {
    name: '',
    price: 0,
    category: 'Divers',
    stock: 0,
    imageUrl: '',
    barcode: ''
  };

  isUploading = false;
  isEditMode = false; // Flag pour savoir si on modifie ou on crée

  constructor(
    private modalCtrl: ModalController,
    private imageService: ImageService,
    private toastCtrl: ToastController
  ) {
    addIcons({ closeOutline, saveOutline, barcodeOutline, gridOutline, cameraOutline, imageOutline, add });
  }

  ngOnInit() {
    // Si on a reçu un produit, on initialise le formulaire avec ses valeurs
    if (this.productToEdit) {
      this.isEditMode = true;
      // On copie l'objet pour ne pas modifier l'original en temps réel avant validation
      this.product = { ...this.productToEdit };
    }
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async selectPhoto() {
    const base64 = await this.imageService.selectImage();
    
    if (base64) {
      this.isUploading = true;
      try {
        const url = await this.imageService.uploadImage(base64);
        this.product.imageUrl = url;
      } catch (error) {
        console.error('Erreur upload', error);
        this.presentToast('Erreur lors de l\'upload', 'danger');
      } finally {
        this.isUploading = false;
      }
    }
  }

  confirm() {
    if (!this.product.name) {
      this.presentToast('Le nom est obligatoire', 'warning');
      return;
    }
    // On renvoie le produit modifié (ou créé)
    this.modalCtrl.dismiss(this.product, 'confirm');
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: color,
      position: 'top'
    });
    toast.present();
  }
}
