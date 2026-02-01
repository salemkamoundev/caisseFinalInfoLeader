import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, AlertController, IonMenuButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  settingsOutline, walletOutline, trendingUpOutline, calculatorOutline, 
  cubeOutline, timeOutline, receiptOutline, peopleOutline, 
  logOutOutline, shieldCheckmarkOutline, gridOutline 
} from 'ionicons/icons';
import { StatsService } from 'src/app/services/stats.service';
import { AuthService } from 'src/app/services/auth.service';
import { Observable, map } from 'rxjs';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonContent, IonIcon, IonMenuButton]
})
export class DashboardPage implements OnInit, AfterViewInit {

  todaySales$ = this.statsService.getTodaySales();
  totalRevenue$: Observable<number>;
  totalCount$: Observable<number>;
  chart: any;
  
  currentUserEmail: string | null | undefined = '';

  constructor(
    private statsService: StatsService,
    private authService: AuthService,
    private alertCtrl: AlertController
  ) {
    addIcons({ 
      settingsOutline, walletOutline, trendingUpOutline, calculatorOutline, 
      cubeOutline, timeOutline, receiptOutline, peopleOutline,
      logOutOutline, shieldCheckmarkOutline, gridOutline
    });

    this.totalRevenue$ = this.todaySales$.pipe(
      map(sales => sales.reduce((acc, sale) => acc + sale.total, 0))
    );

    this.totalCount$ = this.todaySales$.pipe(
      map(sales => sales.length)
    );
  }

  ngOnInit() {
    this.currentUserEmail = this.authService.getCurrentUserEmail();
  }

  ngAfterViewInit() {
    this.loadChartData();
  }

  loadChartData() {
    const labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const data = [120, 190, 30, 50, 20, 300, 450]; 

    this.createChart(labels, data);
  }

  createChart(labels: string[], data: number[]) {
    const canvas = document.getElementById('salesChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(79, 70, 229, 0.8)');
    gradient.addColorStop(1, 'rgba(79, 70, 229, 0.1)');

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'CA Journalier',
          data: data,
          backgroundColor: gradient,
          borderRadius: 6,
          barThickness: 12
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { display: false }, ticks: { display: false } },
          x: { grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' }, color: '#94a3b8' } }
        }
      }
    });
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Déconnexion',
      message: 'Quitter la caisse ?',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { text: 'Déconnexion', role: 'confirm', handler: () => this.authService.logout() }
      ]
    });
    await alert.present();
  }
}
