import { ChangeDetectorRef, Component, NgZone, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { UserDashboard } from '../../../core/models/models';
import { Chart, ArcElement, DoughnutController, BarElement, BarController,
         CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, DoughnutController, BarElement, BarController,
               CategoryScale, LinearScale, Tooltip, Legend);

// ── Plugin : texte centré dans le donut (total) ──────────────────────────────
const centerTextPlugin = {
  id: 'centerText',
  afterDraw(chart: any) {
    if (chart.config.type !== 'doughnut') return;
    const { ctx, chartArea } = chart;
    const total = (chart.data.datasets[0]?.data as number[]).reduce((a, b) => a + b, 0);
    const cx = (chartArea.left + chartArea.right) / 2;
    const cy = (chartArea.top + chartArea.bottom) / 2;
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(total, cx, cy - 10);
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Total', cx, cy + 12);
    ctx.restore();
  }
};

// ── Plugin : labels valeur + nom sur chaque arc ──────────────────────────────
const arcLabelPlugin = {
  id: 'arcLabel',
  afterDraw(chart: any) {
    if (chart.config.type !== 'doughnut') return;
    const { ctx } = chart;
    const dataset = chart.data.datasets[0];
    const meta    = chart.getDatasetMeta(0);
    meta.data.forEach((arc: any, i: number) => {
      const span = arc.endAngle - arc.startAngle;
      if (span < 0.35) return;                          // arc trop petit
      const mid  = arc.startAngle + span / 2;
      const r    = (arc.outerRadius + arc.innerRadius) / 2;
      const x    = arc.x + Math.cos(mid) * r;
      const y    = arc.y + Math.sin(mid) * r;
      const val  = dataset.data[i];
      const lbl  = (chart.data.labels[i] as string) ?? '';
      ctx.save();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText(String(val), x, y - 8);
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(lbl, x, y + 8);
      ctx.restore();
    });
  }
};

Chart.register(centerTextPlugin as any, arcLabelPlugin as any);

@Component({ selector: 'app-user-dashboard', templateUrl: './user-dashboard.component.html' })
export class UserDashboardComponent implements OnInit, OnDestroy {

  @ViewChild('statusCanvas') statusCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('typeCanvas')   typeCanvas!:   ElementRef<HTMLCanvasElement>;
  @ViewChild('daysCanvas')   daysCanvas!:   ElementRef<HTMLCanvasElement>;

  dashboard: UserDashboard | null = null;
  loading = true;
  private charts: any[] = [];

  private statusColors: Record<string, string> = {
    DRAFT: '#94a3b8', SUBMIT: '#3b82f6', VALIDATED: '#22c55e',
    REJECTED: '#ef4444', EXPIRED: '#f97316'
  };
  private statusLabels: Record<string, string> = {
    DRAFT: 'Brouillon', SUBMIT: 'Soumis', VALIDATED: 'Validé',
    REJECTED: 'Rejeté', EXPIRED: 'Expiré'
  };
  private typeColors: Record<string, string> = {
    SINISTRE: '#ef4444', EER: '#8b5cf6', ADHESION: '#06b6d4'
  };

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.api.getUserDashboard().subscribe({
      next: d => {
        this.dashboard = d;
        this.loading = false;
        this.cdr.detectChanges();  // met à jour le DOM (rend les canvases visibles)
        // Exécuter Chart.js HORS de la zone Angular pour éviter la boucle infinie
        this.ngZone.runOutsideAngular(() => {
          setTimeout(() => this.buildCharts(d), 50);
        });
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    this.charts.forEach(c => { try { c.destroy(); } catch (_) {} });
  }

  private buildCharts(d: UserDashboard) {
    this.charts.forEach(c => { try { c.destroy(); } catch (_) {} });
    this.charts = [];

    // ── Donut statut ──
    const sKeys = Object.keys(d.byStatus);
    this.charts.push(new Chart(this.statusCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: sKeys.map(k => this.statusLabels[k] ?? k),
        datasets: [{
          data: sKeys.map(k => d.byStatus[k]),
          backgroundColor: sKeys.map(k => this.statusColors[k] ?? '#64748b'),
          borderWidth: 2, borderColor: '#fff', hoverOffset: 6
        }]
      },
      options: {
        cutout: '62%',
        plugins: { legend: { display: false }, tooltip: { enabled: true } }
      }
    }));

    // ── Donut type ──
    const tKeys = Object.keys(d.byType);
    this.charts.push(new Chart(this.typeCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: tKeys,
        datasets: [{
          data: tKeys.map(k => d.byType[k]),
          backgroundColor: tKeys.map(k => this.typeColors[k] ?? '#64748b'),
          borderWidth: 2, borderColor: '#fff', hoverOffset: 6
        }]
      },
      options: {
        cutout: '62%',
        plugins: { legend: { display: false }, tooltip: { enabled: true } }
      }
    }));

    // ── Bar vertical 10 jours (dates en X, nombre en Y) ──
    this.charts.push(new Chart(this.daysCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: d.last10Days.map(x => x.date.slice(5)),
        datasets: [{
          label: 'Dossiers créés',
          data: d.last10Days.map(x => x.count),
          backgroundColor: '#3b82f6cc',
          borderColor: '#2563eb',
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 12 } } },
          y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#f1f5f9' } }
        }
      }
    }));
  }

  getStatusColor(k: string) { return this.statusColors[k] ?? '#64748b'; }
  getStatusLabel(k: string) { return this.statusLabels[k] ?? k; }
}
