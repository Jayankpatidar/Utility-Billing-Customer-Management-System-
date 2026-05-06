import { Component, OnInit } from '@angular/core';
import { DashboardService } from '@core/services/dashboard.service';
import { DashboardStats, MonthlyData, ActivityItem } from '@shared/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;
  chartMax = 1;

  constructor(private dashService: DashboardService) {}

  ngOnInit() {
    this.dashService.getStats().subscribe({
      next: s => {
        this.stats = s;
        if (s.monthlyCollection?.length) {
          this.chartMax = Math.max(...s.monthlyCollection.map(d => d.amount));
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  barHeight(amount: number): string {
    return Math.round((amount / this.chartMax) * 72) + 'px';
  }

  revenueDisplay(): string {
    const r = this.stats?.totalRevenue ?? 0;
    return '₹' + (r / 1000).toFixed(0) + 'K';
  }

  activityIcon(type: ActivityItem['type']): string {
    return ({ payment: 'fa-credit-card', bill: 'fa-file-invoice', customer: 'fa-user-plus' } as Record<string, string>)[type] ?? 'fa-circle';
  }

  formatAmount(n: number) {
    return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  }
}
