import { Printer } from '@awesome-cordova-plugins/printer/ngx';
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

// Firebase Imports
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth'; // <--- NOUVEAU
import { provideStorage, getStorage } from '@angular/fire/storage';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    Printer,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    
    // Initialisation Firebase
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),       // <--- AJOUT
    provideStorage(() => getStorage())  // <--- AJOUT (Au cas où pour les images)
  ],
});
