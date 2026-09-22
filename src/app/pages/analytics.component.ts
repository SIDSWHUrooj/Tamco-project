import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';
import { CustomSelectComponent } from '../shared/custom-select.component';

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
  imports: [FormsModule, PageHeadingComponent, StatusComponent, CustomSelectComponent],
  template: `
    <app-page-heading eyebrow="Strategic Insights" title="Procurement Spend & Sourcing Analytics">
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

    <!-- Add Category Spend Form Panel -->
    @if (showAddCategory) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
        <div class="panel-title">
          <h2>Set Category Spend Target & Benchmark</h2>
        </div>

        <div class="form-grid">
          <label>Purchasing Category Name *<input [(ngModel)]="newCat.category" placeholder="e.g. Civil & Building Infrastructure" /></label>
          <label>Total Category Spend Budget ($) *<input type="number" [(ngModel)]="newCat.totalSpend" placeholder="350000" /></label>
          <label>Target Bidders per RFQ *<input type="number" [(ngModel)]="newCat.avgBids" placeholder="4.5" /></label>
          <label>Target Cost Reduction (%) *<input type="number" [(ngModel)]="newCat.savingsRate" placeholder="9.5" /></label>
          <label>Spend Velocity Trend
            <app-custom-select [(ngModel)]="newCat.trend" [options]="trendOptions" />
          </label>
          <label>Strategic Importance
            <app-custom-select [(ngModel)]="newCat.strategicImportance" [options]="importanceOptions" />
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
                  <app-custom-select [(ngModel)]="c.trend" [options]="trendOptions" minWidth="130px" />
                </td>
                <td>
                  <app-status [text]="c.strategicImportance" [bad]="c.strategicImportance==='Critical'" [warn]="c.strategicImportance==='High'" [good]="c.strategicImportance==='Standard'" />
                </td>
                <td style="white-space: nowrap;">
                  <div style="display: flex; gap: 5px; align-items: center;">
                    <button class="btn-action btn-action-save" (click)="saveCategory(c)" title="Save changes">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      <span>Save</span>
                    </button>
                    <button class="btn-action btn-action-delete" (click)="deleteCategory(c.id)" title="Delete category target">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
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

  readonly trendOptions = ['Increasing', 'Stable', 'Decreasing'];
  readonly importanceOptions = ['Critical', 'High', 'Standard'];

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
