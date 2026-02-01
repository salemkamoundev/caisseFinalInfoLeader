import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, docData } from '@angular/fire/firestore';
import { Observable, of, map } from 'rxjs';
import { StoreConfig } from '../models/config.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private firestore: Firestore = inject(Firestore);
  
  // On utilise un document unique 'store' dans la collection 'config'
  private configDocRef = doc(this.firestore, 'config/store');

  constructor() { }

  /**
   * Récupère la configuration en temps réel
   */
  getConfig(): Observable<StoreConfig> {
    return docData(this.configDocRef).pipe(
      map(data => {
        // Retourne la data ou des valeurs par défaut si vide
        return (data as StoreConfig) || {
          name: 'Ma Boutique',
          address: 'Adresse non configurée',
          phone: '',
          footerMessage: 'Merci de votre visite'
        };
      })
    );
  }

  /**
   * Sauvegarde la configuration
   */
  async saveConfig(config: StoreConfig): Promise<void> {
    await setDoc(this.configDocRef, config);
  }
}
