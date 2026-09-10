import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';

export interface ScorecardItem {
  id: string;
  vendor: string;
  category: string;
  onTime: number;
  qcPass: number;
  priceScore: number;
  responseTime: number;
  overallRating: number;
  tier: 'Tier 1 (Preferred)' | 'Tier 2 (Qualified)' | 'Tier 3 (Under Review)';
}

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent, StatusComponent],
  template: `
    <app-page-heading eyebrow="Vendor Evaluation" title="Supplier Performance & Scorecards" subtitle="Track delivery punctuality, quality acceptance rates, commercial competitiveness and RFQ responsiveness KPIs.">
      <div class="heading-actions">
        <button class="btn" (click)="showAddScorecard = !showAddScorecard">
          {{ showAddScorecard ? '✕ Close Form' : '+ Add Evaluation Scorecard' }}
        </button>
        <button class="btn secondary" (click)="exportScorecards()">Export Scorecards</button>
      </div>
    </app-page-heading>

    <!-- Stats Overview -->
    <section class="stats-grid compact">
      <div class="stat-card">
        <span>Evaluated Vendors</span>
        <strong>{{ scorecards.length }}</strong>
        <small>Active vendor scorecards</small>
      </div>
      <div class="stat-card">
        <span>Average On-Time Arrival</span>
        <strong style="color: #16855b;">{{ avgOnTime() }}%</strong>
        <small>Delivery punctuality index</small>
      </div>
      <div class="stat-card">
        <span>Average QC Pass Rate</span>
        <strong style="color: #1769e0;">{{ avgQc() }}%</strong>
        <small>Material quality compliance</small>
      </div>
    </section>

    <!-- Add Evaluation Form -->
    @if (showAddScorecard) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid #1769e0;">
        <div class="panel-title">
          <div>
            <h2>Record Vendor Performance Evaluation</h2>
            <p>Input audit scores across delivery, quality inspection, pricing and technical response.</p>
          </div>
        </div>

        <div class="form-grid">
          <label>Supplier Legal Name *<input [(ngModel)]="newCard.vendor" placeholder="e.g. Al-Hasan Engineering Works" /></label>
          <label>Primary Category *
            <select [(ngModel)]="newCard.category" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="Electrical">Electrical</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Safety Equipment">Safety Equipment</option>
              <option value="Raw Materials">Raw Materials</option>
              <option value="IT & Hardware">IT & Hardware</option>
            </select>
          </label>
          <label>On-Time Delivery Rate (%) *<input type="number" [(ngModel)]="newCard.onTime" placeholder="92" /></label>
          <label>Quality / QC Pass Rate (%) *<input type="number" [(ngModel)]="newCard.qcPass" placeholder="96" /></label>
          <label>Price Competitiveness (0-100)<input type="number" [(ngModel)]="newCard.priceScore" placeholder="88" /></label>
          <label>Average RFQ Response Time (Hours)<input type="number" [(ngModel)]="newCard.responseTime" placeholder="12" /></label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetForm()">Reset</button>
          <button class="btn" (click)="addScorecard()">Save Evaluation</button>
        </div>
      </article>
    }

    <!-- Search & Filter Bar -->
    <div style="display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap;">
      <input
        style="flex: 1; min-width: 240px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px;"
        [(ngModel)]="searchQuery"
        placeholder="🔍 Search vendor scorecards by supplier or category..."
      />
      <select
        style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; background: #fff;"
        [(ngModel)]="tierFilter"
      >
        <option value="">All Tiers</option>
        <option value="Tier 1 (Preferred)">Tier 1 (Preferred)</option>
        <option value="Tier 2 (Qualified)">Tier 2 (Qualified)</option>
        <option value="Tier 3 (Under Review)">Tier 3 (Under Review)</option>
      </select>
    </div>

    <!-- Live Scorecards Table -->
    <article class="panel">
      <div class="panel-title">
        <div>
          <h2>Supplier Performance & Quality Index</h2>
          <p>Multi-factor rating scorecard with automated classification</p>
        </div>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Supplier Name</th>
              <th>Category</th>
              <th>On-Time (%)</th>
              <th>QC Pass (%)</th>
              <th>Price Index</th>
              <th>Response (Hrs)</th>
              <th>Overall Rating</th>
              <th>Classification Tier</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (s of filteredScorecards(); track s.id) {
              <tr>
                <td><input [(ngModel)]="s.vendor" style="font-weight: 600;" /></td>
                <td><input [(ngModel)]="s.category" /></td>
                <td><input type="number" [(ngModel)]="s.onTime" (ngModelChange)="recalcRating(s)" style="width: 55px;" /> %</td>
                <td><input type="number" [(ngModel)]="s.qcPass" (ngModelChange)="recalcRating(s)" style="width: 55px;" /> %</td>
                <td><input type="number" [(ngModel)]="s.priceScore" (ngModelChange)="recalcRating(s)" style="width: 55px;" /> / 100</td>
                <td><input type="number" [(ngModel)]="s.responseTime" style="width: 55px;" /> hrs</td>
                <td><strong style="color: #1769e0; font-size: 13px;">{{ s.overallRating }} ★</strong></td>
                <td>
                  <app-status [text]="s.tier" [good]="s.tier.includes('Tier 1')" [warn]="s.tier.includes('Tier 2')" [bad]="s.tier.includes('Tier 3')" />
                </td>
                <td>
                  <div style="display: flex; gap: 5px;">
                    <button class="btn small ghost" (click)="saveScorecard(s)">Save</button>
                    <button class="btn small danger-btn" (click)="deleteScorecard(s.id)">✕</button>
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
export class PerformanceComponent {
  readonly state = inject(PortalStateService);

  showAddScorecard = false;
  searchQuery = '';
  tierFilter = '';

  newCard: ScorecardItem = {
    id: 'SC-005',
    vendor: 'Al-Hasan Engineering Works',
    category: 'Electrical',
    onTime: 92,
    qcPass: 96,
    priceScore: 88,
    responseTime: 10,
    overallRating: 4.6,
    tier: 'Tier 1 (Preferred)'
  };

  scorecards: ScorecardItem[] = [
    { id: 'SC-001', vendor: 'ABC Supplies Pvt. Ltd.', category: 'Electrical', onTime: 94, qcPass: 98, priceScore: 92, responseTime: 8, overallRating: 4.8, tier: 'Tier 1 (Preferred)' },
    { id: 'SC-002', vendor: 'Global Traders', category: 'Mechanical', onTime: 88, qcPass: 92, priceScore: 85, responseTime: 14, overallRating: 4.2, tier: 'Tier 2 (Qualified)' },
    { id: 'SC-003', vendor: 'Tech Solutions', category: 'IT & Hardware', onTime: 96, qcPass: 99, priceScore: 90, responseTime: 6, overallRating: 4.6, tier: 'Tier 1 (Preferred)' },
    { id: 'SC-004', vendor: 'Perfect Industrial', category: 'Raw Materials', onTime: 90, qcPass: 95, priceScore: 89, responseTime: 12, overallRating: 4.5, tier: 'Tier 1 (Preferred)' }
  ];

  filteredScorecards = computed(() => {
    const q = this.searchQuery.trim().toLowerCase();
    const tf = this.tierFilter;
    return this.scorecards.filter(s => {
      const matchQ = !q || s.vendor.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
      const matchT = !tf || s.tier === tf;
      return matchQ && matchT;
    });
  });

  avgOnTime = computed(() => {
    if (!this.scorecards.length) return 0;
    return Math.round(this.scorecards.reduce((a, b) => a + (b.onTime || 0), 0) / this.scorecards.length);
  });

  avgQc = computed(() => {
    if (!this.scorecards.length) return 0;
    return Math.round(this.scorecards.reduce((a, b) => a + (b.qcPass || 0), 0) / this.scorecards.length);
  });

  recalcRating(s: ScorecardItem): void {
    const score = ((s.onTime || 0) * 0.4 + (s.qcPass || 0) * 0.4 + (s.priceScore || 0) * 0.2) / 20;
    s.overallRating = Number(score.toFixed(1));
    s.tier = s.overallRating >= 4.5 ? 'Tier 1 (Preferred)' : (s.overallRating >= 4.0 ? 'Tier 2 (Qualified)' : 'Tier 3 (Under Review)');
  }

  addScorecard(): void {
    if (!this.newCard.vendor) {
      this.state.notify('Error: Supplier name is required.');
      return;
    }
    const created: ScorecardItem = { ...this.newCard, id: `SC-${Math.floor(100 + Math.random() * 900)}` };
    this.recalcRating(created);
    this.scorecards = [created, ...this.scorecards];
    this.state.notify(`Performance scorecard for ${created.vendor} created.`);
    this.resetForm();
    this.showAddScorecard = false;
  }

  resetForm(): void {
    this.newCard = {
      id: '',
      vendor: '',
      category: 'Electrical',
      onTime: 90,
      qcPass: 95,
      priceScore: 85,
      responseTime: 12,
      overallRating: 4.5,
      tier: 'Tier 1 (Preferred)'
    };
  }

  saveScorecard(s: ScorecardItem): void {
    this.recalcRating(s);
    this.state.notify(`Scorecard for ${s.vendor} updated.`);
  }

  deleteScorecard(id: string): void {
    this.scorecards = this.scorecards.filter(s => s.id !== id);
    this.state.notify('Scorecard deleted.');
  }

  exportScorecards(): void {
    this.state.notify('Exporting vendor performance scorecards (Excel)...');
  }
}
