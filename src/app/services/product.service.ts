import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private firestore: Firestore = inject(Firestore);
  private productsCollection = collection(this.firestore, 'products');

  constructor() {}

  getProducts(): Observable<Product[]> {
    return collectionData(this.productsCollection, { idField: 'id' }) as Observable<Product[]>;
  }

  async addProduct(product: Product) {
    return addDoc(this.productsCollection, product);
  }

  // NOUVEAU : Fonction de mise à jour
  async updateProduct(product: Product) {
    if (!product.id) return;
    const productDoc = doc(this.firestore, `products/${product.id}`);
    // On retire l'ID de l'objet data pour ne pas le dupliquer dans les champs
    const { id, ...data } = product;
    return updateDoc(productDoc, data as any);
  }

  async deleteProduct(id: string) {
    const productDoc = doc(this.firestore, `products/${id}`);
    return deleteDoc(productDoc);
  }
}
