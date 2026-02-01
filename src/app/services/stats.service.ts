import { Injectable, inject } from '@angular/core';
import { Firestore, collection, query, where, orderBy, limit, getDocs, Timestamp } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Sale } from '../models/sale.model';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private firestore: Firestore = inject(Firestore);

  constructor() {}

  // Récupérer les ventes d'aujourd'hui
  getTodaySales(): Observable<Sale[]> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return this.getSalesHistory(start, end);
  }

  // Récupérer les ventes récentes (limité à 10)
  getRecentSales(): Observable<Sale[]> {
    const salesRef = collection(this.firestore, 'sales');
    const q = query(salesRef, orderBy('date', 'desc'), limit(10));
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale)))
    );
  }

  // Récupérer l'historique avec filtres de date
  getSalesHistory(startDate: Date, endDate: Date): Observable<Sale[]> {
    const salesRef = collection(this.firestore, 'sales');
    const q = query(
      salesRef,
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'desc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale)))
    );
  }
}
