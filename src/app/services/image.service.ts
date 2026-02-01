import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  
  private supabase: SupabaseClient;

  constructor() {
    // Initialisation du client
    // Note: Si l'URL est vide, cela plantera. Assurez-vous d'avoir édité environment.ts
    this.supabase = createClient(environment.supabase.url, environment.supabase.key);
  }

  async selectImage(): Promise<string | undefined> {
    try {
      const image = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt,
        width: 800
      });
      return image.base64String;
    } catch (e) {
      console.log('Sélection annulée');
      return undefined;
    }
  }

  async uploadImage(base64: string): Promise<string> {
    const fileName = `products/${new Date().getTime()}.jpg`;
    
    // Conversion Base64 -> ArrayBuffer
    const arrayBuffer = decode(base64);

    // Upload vers le bucket 'images'
    const { data, error } = await this.supabase
      .storage
      .from('images') // Assurez-vous que ce bucket existe sur Supabase !
      .upload(fileName, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (error) {
      console.error('Erreur Upload Supabase:', error);
      throw error;
    }

    // Récupération de l'URL publique
    const { data: urlData } = this.supabase
      .storage
      .from('images')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }
}

// Utilitaire de décodage
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
