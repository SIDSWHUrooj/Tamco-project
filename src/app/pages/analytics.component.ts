import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';

export interface CategoryAnalytics {
  id: string;
  category: string;
  totalSpend: number;
  avgBids: number;
  savingsRate: number;
  trend: 'Increasing' | 'Stable' | 'Decreasing';
  strategicImportance: 'Critical' | 'High' | 'Standard';
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent, StatusComponent],
  template: `
    <app-page-heading eyebrow="Strategic Insights" title="Procurement Spend & Sourcing Analytics" subtitle="Analyze category spend velocity, e-bidding cost reductions, supplier participation rates and historical sourcing KPIs.">
      <div class="heading-actions">
        <button class="btn" (click)="showAddCategory = !showAddCategory">
          {{ showAddCategory ? '✕ Close Form' : '+ Add Category Target' }}
        </button>
        <button class="btn secondary" (click)="exportAnalytics()">Export Analytics Dataset</button>
      </div>
    </app-page-heading>

    <!-- Stats Overview -->
    <section class="stats-grid compact">
      <div class="stat-card">
        <span>Total Analyzed Spend</span>
        <strong style="color: #1769e0;">\${{ totalSpend().toLocaleString() }}</strong>
        <small>YTD Procurement outlay</small>
      </div>
      <div class="stat-card">
        <span>Average Savings Realized</span>
        <strong style="color: #16855b;">{{ avgSavings() }}%</strong>
        <small>Via competitive multi-bid RFQs</small>
      </div>
      <div class="stat-card">
        <span>Avg Supplier Bids / RFQ</span>
        <strong style="color: #7048d7;">{{ avgBidders() }} Bids</strong>
        <small>Healthy supplier competition</small>
      </div>
    </section>

    <!-- Add Category Analytics Form -->
    @if (showAddCategory) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid #1769e0;">
        <div class="panel-title">
          <div>
            <h2>Set Category Spend Target & Benchmark</h2>
            <p>Define category budget allocation, cost reduction benchmark and competitiveness goals.</p>
          </div>
        </div>

        <div class="form-grid">
          <label>Purchasing Category Name *<input [(ngModel)]="newCat.category" placeholder="e.g. Civil & Building Infrastructure" /></label>
          <label>Total Category Spend Budget ($) *<input type="number" [(ngModel)]="newCat.totalSpend" placeholder="350000" /></label>
          <label>Target Bidders per RFQ *<input type="number" [(ngModel)]="newCat.avgBids" placeholder="4.5" /></label>
          <label>Target Cost Reduction (%) *<input type="number" [(ngModel)]="newCat.savingsRate" placeholder="9.5" /></label>
          <label>Spend Velocity Trend
            <select [(ngModel)]="newCat.trend" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="Increasing">Increasing</option>
              <option value="Stable">Stable</option>
              <option value="Decreasing">Decreasing</option>
            </select>
          </label>
          <label>Strategic Importance
            <select [(ngModel)]="newCat.strategicImportance" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Standard">Standard</option>
            </select>
          </label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetForm()">Reset</button>
          <button class="btn" (click)="addCategory()">Add Category Benchmark</button>
        </div>
      </article>
    }

    <!-- Live Analytics Table -->
    <article class="panel">
      <div class="panel-title">
        <div>
          <h2>Category Spend Breakdown & Realized Sourcing Savings</h2>
          <p>Multi-dimensional procurement analytics across operational verticals</p>
        </div>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Category Vertical</th>
              <th>Total Spend (YTD)</th>
              <th>Avg Bids / RFQ</th>
              <th>Cost Savings Rate</th>
              <th>Spend Trend</th>
              <th>Strategic Tier</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (c of categoriesList; track c.id) {
              <tr>
                <td><input [(ngModel)]="c.category" style="font-weight: 600; min-width: 220px;" /></td>
                <td><input type="number" [(ngModel)]="c.totalSpend" style="width: 110px;" /></td>
                <td><input type="number" step="0.1" [(ngModel)]="c.avgBids" style="width: 60px;" /> Bids</td>
                <td><input type="number" step="0.1" [(ngModel)]="c.savingsRate" style="width: 60px;" /> %</td>
                <td>
                  <select [(ngModel)]="c.trend" style="border: 1px solid #dbe3ed; border-radius: 6px; padding: 4px;">
                    <option value="Increasing">↑ Increasing</option>
                    <option value="Stable">→ Stable</option>
                    <option value="Decreasing">↓ Decreasing</option>
                  </select>
                </td>
                <td>
                  <app-status [text]="c.strategicImportance" [bad]="c.strategicImportance==='Critical'" [warn]="c.strategicImportance==='High'" [good]="c.strategicImportance==='Standard'" />
                </td>
                <td>
                  <div style="display: flex; gap: 5px;">
                    <button class="btn small ghost" (click)="saveCategory(c)">Save</button>
                    <button class="btn small danger-btn" (click)="deleteCategory(c.id)">✕</button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </article>
  `
})
export class AnalyticsComponent {
  readonly state = inject(PortalStateService);

  showAddCategory = false;

  newCat: CategoryAnalytics = {
    id: 'CAT-005',
    category: 'Civil Works & Substation Building',
    totalSpend: 350000,
    avgBids: 4.2,
    savingsRate: 8.5,
    trend: 'Increasing',
    strategicImportance: 'High'
  };

  categoriesList: CategoryAnalytics[] = [
    { id: 'CAT-001', category: 'Electrical & Power Systems', totalSpend: 850000, avgBids: 4.2, savingsRate: 8.4, trend: 'Increasing', strategicImportance: 'Critical' },
    { id: 'CAT-002', category: 'Mechanical & Fabrication Parts', totalSpend: 620000, avgBids: 3.8, savingsRate: 6.1, trend: 'Stable', strategicImportance: 'High' },
    { id: 'CAT-003', category: 'Raw Materials & Consumables', totalSpend: 450000, avgBids: 5.1, savingsRate: 11.2, trend: 'Increasing', strategicImportance: 'High' },
    { id: 'CAT-004', category: 'IT Hardware & Infrastructure', totalSpend: 290000, avgBids: 3.1, savingsRate: 4.5, trend: 'Stable', strategicImportance: 'Standard' }
  ];

  totalSpend = computed(() => this.categoriesList.reduce((acc, c) => acc + (c.totalSpend || 0), 0));
  avgSavings = computed(() => {
    if (!this.categoriesList.length) return 0;
    return (this.categoriesList.reduce((a, b) => a + (b.savingsRate || 0), 0) / this.categoriesList.length).toFixed(1);
  });
  avgBidders = computed(() => {
    if (!this.categoriesList.length) return 0;
    return (this.categoriesList.reduce((a, b) => a + (b.avgBids || 0), 0) / this.categoriesList.length).toFixed(1);
  });

  addCategory(): void {
    if (!this.newCat.category || !this.newCat.totalSpend) {
      this.state.notify('Error: Category name and spend budget are required.');
      return;
    }
    const created: CategoryAnalytics = { ...this.newCat, id: `CAT-${Math.floor(100 + Math.random() * 900)}` };
    this.categoriesList = [...this.categoriesList, created];
    this.state.notify(`Analytics benchmark for "${created.category}" added.`);
    this.resetForm();
    this.showAddCategory = false;
  }

  resetForm(): void {
    this.newCat = {
      id: '',
      category: '',
      totalSpend: 100000,
      avgBids: 3.5,
      savingsRate: 5.0,
      trend: 'Stable',
      strategicImportance: 'Standard'
    };
  }

  saveCategory(c: CategoryAnalytics): void {
    this.state.notify(`Analytics parameters for "${c.category}" updated.`);
  }

  deleteCategory(id: string): void {
    this.categoriesList = this.categoriesList.filter(c => c.id !== id);
    this.state.notify('Category analytics entry deleted.');
  }

  exportAnalytics(): void {
    this.state.notify('Exporting procurement spend & savings analytics dataset (Excel)...');
  }
}
