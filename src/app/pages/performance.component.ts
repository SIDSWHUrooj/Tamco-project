import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';
import { IconComponent } from '../shared/icon.component';
import { CustomSelectComponent } from '../shared/custom-select.component';

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
  imports: [FormsModule, PageHeadingComponent, StatusComponent, IconComponent, CustomSelectComponent],
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
    <section class="dash-kpis three">
      <article class="dash-kpi">
        <div class="kpi-top-row">
          <span class="kpi-label">Active Scorecards</span>
          <span class="kpi-icon-badge blue">
            <app-icon name="vendors" [size]="16" />
          </span>
        </div>
        <strong class="kpi-value">{{ scorecards.length }}</strong>
        <small>Audited supplier partners</small>
      </article>

      <article class="dash-kpi">
        <div class="kpi-top-row">
          <span class="kpi-label">On-Time Arrival Rate</span>
          <span class="kpi-icon-badge emerald">
            <app-icon name="deliveries" [size]="16" />
          </span>
        </div>
        <strong class="kpi-value" style="color: #059669;">{{ avgOnTime() }}%</strong>
        <small>Fleet delivery punctuality index</small>
      </article>

      <article class="dash-kpi">
        <div class="kpi-top-row">
          <span class="kpi-label">QC Inspection Pass Rate</span>
          <span class="kpi-icon-badge purple">
            <app-icon name="approval-matrix" [size]="16" />
          </span>
        </div>
        <strong class="kpi-value" style="color: #7c3aed;">{{ avgQc() }}%</strong>
        <small>Quality & compliance conformance</small>
      </article>
    </section>

    <!-- Add Evaluation Form -->
    @if (showAddScorecard) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
        <div class="panel-title">
          <h2>Record Vendor Performance Evaluation</h2>
        </div>

        <div class="form-grid">
          <label>Supplier Legal Name *<input [(ngModel)]="newCard.vendor" placeholder="e.g. Al-Hasan Engineering Works" /></label>
          <label>Primary Category *
            <app-custom-select [(ngModel)]="newCard.category" [options]="categoryOptions" />
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
    <div class="search-filter-bar">
      <div class="search-input-wrap">
        <span class="search-icon">
          <app-icon name="search" [size]="15" />
        </span>
        <input
          type="text"
          [(ngModel)]="searchQuery"
          placeholder="Search vendor scorecards by supplier or category..."
        />
      </div>
      <app-custom-select
        [(ngModel)]="tierFilter"
        [options]="tierOptions"
        minWidth="180px"
      />
    </div>

    <!-- Live Scorecards Table -->
    <article class="panel">
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
                <td style="white-space: nowrap;">
                  <div style="display: flex; gap: 5px; align-items: center;">
                    <button class="btn-action btn-action-save" (click)="saveScorecard(s)" title="Save changes">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      <span>Save</span>
                    </button>
                    <button class="btn-action btn-action-delete" (click)="deleteScorecard(s.id)" title="Delete scorecard">
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
export class PerformanceComponent {
  readonly state = inject(PortalStateService);

  showAddScorecard = false;
  searchQuery = '';
  tierFilter = '';

  readonly tierOptions = [
    { value: '', label: 'All Tiers' },
    { value: 'Tier 1 (Preferred)', label: 'Tier 1 (Preferred)' },
    { value: 'Tier 2 (Qualified)', label: 'Tier 2 (Qualified)' },
    { value: 'Tier 3 (Under Review)', label: 'Tier 3 (Under Review)' }
  ];

  readonly categoryOptions = [
    'Electrical',
    'Mechanical',
    'Safety Equipment',
    'Raw Materials',
    'IT & Hardware'
  ];

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

  filteredScorecards(): ScorecardItem[] {
    const q = this.searchQuery.trim().toLowerCase();
    const tf = this.tierFilter;
    return this.scorecards.filter(s => {
      const matchQ = !q || (s.vendor || '').toLowerCase().includes(q) || (s.category || '').toLowerCase().includes(q) || (s.tier || '').toLowerCase().includes(q) || (s.id || '').toLowerCase().includes(q);
      const matchT = !tf || s.tier === tf;
      return matchQ && matchT;
    });
  }

  avgOnTime(): number {
    if (!this.scorecards.length) return 0;
    return Math.round(this.scorecards.reduce((a, b) => a + (b.onTime || 0), 0) / this.scorecards.length);
  }

  avgQc(): number {
    if (!this.scorecards.length) return 0;
    return Math.round(this.scorecards.reduce((a, b) => a + (b.qcPass || 0), 0) / this.scorecards.length);
  }

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
