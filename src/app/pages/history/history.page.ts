import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonIcon, IonModal, IonDatetime, IonDatetimeButton, 
  IonSegment, IonSegmentButton, IonLabel, ModalController, IonMenuButton,
  IonSelect, IonSelectOption 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, calendarOutline, receiptOutline, cardOutline, 
  cashOutline, menuOutline, personOutline, filterOutline, chevronDownOutline 
} from 'ionicons/icons';
import { StatsService } from 'src/app/services/stats.service';
import { StaffService } from 'src/app/services/staff.service';
import { Sale } from 'src/app/models/sale.model';
import { Staff } from 'src/app/models/staff.model';
import { Observable, BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';
import { ReceiptModalComponent } from 'src/app/components/receipt-modal/receipt-modal.component';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonIcon, IonModal, IonDatetime, IonDatetimeButton,
    IonSegment, IonSegmentButton, IonLabel, IonMenuButton,
    IonSelect, IonSelectOption
  ]
})
export class HistoryPage implements OnInit {

  // Flux de filtres
  rangeSubject = new BehaviorSubject<{start: Date, end: Date}>(this.getRange('today'));
  paymentFilter$ = new BehaviorSubject<string>('ALL');
  staffFilter$ = new BehaviorSubject<string>('ALL'); // NOUVEAU FILTRE
  
  // Données
  sales$: Observable<Sale[]>;
  stats$: Observable<{ totalRevenue: number, count: number }>;
  staffList$: Observable<Staff[]>;
  
  currentRange: 'today' | 'yesterday' | 'week' | 'custom' = 'today';

  // Options pour le selecteur de staff (Style iOS propre)
  customPopoverOptions: any = {
    cssClass: 'modern-staff-popover', 
    side: 'bottom',
    alignment: 'start',
    showBackdrop: false
  };

  constructor(
    private statsService: StatsService, 
    private staffService: StaffService,
    private modalCtrl: ModalController
  ) {
    addIcons({ 
      arrowBackOutline, calendarOutline, receiptOutline, cardOutline, 
      cashOutline, menuOutline, personOutline, filterOutline, chevronDownOutline 
    });

    this.staffList$ = this.staffService.getStaff();

    // COMBINAISON DES 3 FILTRES
    this.sales$ = combineLatest([
      this.rangeSubject.pipe(
        switchMap(range => this.statsService.getSalesHistory(range.start, range.end))
      ),
      this.paymentFilter$,
      this.staffFilter$
    ]).pipe(
      map(([sales, paymentType, staffId]) => {
        let filtered = sales;

        // 1. Filtre Paiement
        if (paymentType !== 'ALL') {
          filtered = filtered.filter(s => s.paymentMethod === paymentType);
        }

        // 2. Filtre Staff
        if (staffId !== 'ALL') {
          // Si staffId est 'COMPTOIR', on cherche ceux qui n'ont pas de staffId ou qui ont 'COMPTOIR'
          if (staffId === 'COMPTOIR') {
            filtered = filtered.filter(s => !s.staffId || s.staffId === 'COMPTOIR');
          } else {
            filtered = filtered.filter(s => s.staffId === staffId);
          }
        }

        return filtered;
      })
    );

    // Calcul des KPIs sur la liste filtrée
    this.stats$ = this.sales$.pipe(
      map(sales => ({
        totalRevenue: sales.reduce((acc, s) => acc + s.total, 0),
        count: sales.length
      }))
    );
  }

  ngOnInit() {}

  setRange(type: 'today' | 'yesterday' | 'week') {
    this.currentRange = type;
    this.rangeSubject.next(this.getRange(type));
  }

  onDateChange(event: any) {
    const dateStr = event.detail.value;
    if (dateStr) {
      this.currentRange = 'custom';
      const start = new Date(dateStr);
      start.setHours(0,0,0,0);
      const end = new Date(dateStr);
      end.setHours(23,59,59,999);
      this.rangeSubject.next({ start, end });
    }
  }

  onPaymentChange(event: any) {
    this.paymentFilter$.next(event.detail.value);
  }

  // Appelé quand on change le vendeur
  onStaffChange(event: any) {
    this.staffFilter$.next(event.detail.value);
  }

  getRange(type: string): {start: Date, end: Date} {
    const start = new Date();
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    if (type === 'today') {
      start.setHours(0, 0, 0, 0);
    } else if (type === 'yesterday') {
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
    } else if (type === 'week') {
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
    }
    return { start, end };
  }

  async openReceipt(sale: Sale) {
    const modal = await this.modalCtrl.create({
      component: ReceiptModalComponent,
      componentProps: { sale: sale }
    });
    await modal.present();
  }
}
