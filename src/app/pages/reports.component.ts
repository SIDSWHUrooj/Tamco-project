import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';
import { IconComponent } from '../shared/icon.component';
import { CustomSelectComponent } from '../shared/custom-select.component';

export interface ReportItem {
  id: string;
  title: string;
  category: string;
  frequency: string;
  format: string;
  recipients: string;
  lastGenerated: string;
  status: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent, StatusComponent, IconComponent, CustomSelectComponent],
  template: `
    <app-page-heading eyebrow="Business Intelligence" title="Operational Reports & Exports" subtitle="Generate, configure, and automate scheduled management reports across procurement, warehousing and payables.">
      <div class="heading-actions">
        <button class="btn" (click)="showAddReport = !showAddReport">
          {{ showAddReport ? '✕ Close Form' : '+ Schedule New Report' }}
        </button>
        <button class="btn secondary" (click)="generateAll()">Generate All Active</button>
      </div>
    </app-page-heading>

    <!-- Configure New Report Panel -->
    @if (showAddReport) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
        <div class="panel-title">
          <h2>Configure Scheduled Enterprise Report</h2>
        </div>

        <div class="form-grid">
          <label>Report Title *<input [(ngModel)]="newReport.title" placeholder="e.g. Weekly Purchase Order Delivery SLA" /></label>
          <label>Business Category *
            <app-custom-select [(ngModel)]="newReport.category" [options]="categoryOptions" />
          </label>
          <label>Frequency
            <app-custom-select [(ngModel)]="newReport.frequency" [options]="frequencyOptions" />
          </label>
          <label>Export Format
            <app-custom-select [(ngModel)]="newReport.format" [options]="formatOptions" />
          </label>
          <label class="span-2">Distribution Email List (comma separated)
            <input [(ngModel)]="newReport.recipients" placeholder="cfo@company.com, procurement.head@company.com" />
          </label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetForm()">Reset</button>
          <button class="btn" (click)="addReport()">Save Schedule</button>
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
          placeholder="Search reports by title or category..."
        />
      </div>
      <app-custom-select
        [(ngModel)]="categoryFilter"
        [options]="categoryFilterOptions"
        minWidth="170px"
      />
    </div>

    <!-- Live Reports Table -->
    <article class="panel">
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Report Title</th>
              <th>Category</th>
              <th>Frequency</th>
              <th>Format</th>
              <th>Recipients</th>
              <th>Last Run</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (r of filteredReports(); track r.id) {
              <tr>
                <td><input [(ngModel)]="r.title" style="font-weight: 600; min-width: 220px;" /></td>
                <td><input [(ngModel)]="r.category" style="width: 110px;" /></td>
                <td><input [(ngModel)]="r.frequency" style="width: 80px;" /></td>
                <td><input [(ngModel)]="r.format" style="width: 90px;" /></td>
                <td><input [(ngModel)]="r.recipients" style="min-width: 160px;" /></td>
                <td><small style="color: #64748b;">{{ r.lastGenerated }}</small></td>
                <td><app-status [text]="r.status" [good]="r.status==='Active'" /></td>
                <td style="white-space: nowrap;">
                  <div style="display: flex; gap: 5px; align-items: center;">
                    <button class="btn-action btn-action-download" (click)="downloadReport(r)" title="Download {{ r.title }}">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      <span>Download</span>
                    </button>
                    <button class="btn-action btn-action-save" (click)="saveReport(r)" title="Save changes">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      <span>Save</span>
                    </button>
                    <button class="btn-action btn-action-delete" (click)="deleteReport(r.id)" title="Delete report">
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
export class ReportsComponent {
  readonly state = inject(PortalStateService);

  showAddReport = false;
  searchQuery = '';
  categoryFilter = '';

  readonly categoryFilterOptions = [
    { value: '', label: 'All Categories' },
    { value: 'Procurement', label: 'Procurement' },
    { value: 'Finance & AP', label: 'Finance & AP' },
    { value: 'Supply Chain', label: 'Supply Chain' }
  ];

  readonly categoryOptions = ['Procurement', 'Finance & AP', 'Supply Chain', 'Compliance & Audit'];
  readonly frequencyOptions = ['Daily', 'Weekly', 'Monthly', 'Quarterly'];
  readonly formatOptions = ['PDF / XLSX', 'Excel (XLSX)', 'CSV', 'PDF Presentation'];

  newReport: ReportItem = {
    id: 'REP-005',
    title: 'Monthly Sourcing Savings & Category Spend',
    category: 'Procurement',
    frequency: 'Monthly',
    format: 'Excel (XLSX)',
    recipients: 'procurement@company.com, cfo@company.com',
    lastGenerated: 'Today',
    status: 'Active'
  };

  reports: ReportItem[] = [
    { id: 'REP-001', title: 'Monthly Sourcing & Spend Breakdown', category: 'Procurement', frequency: 'Monthly', format: 'PDF / XLSX', recipients: 'cfo@company.com', lastGenerated: '2026-08-20', status: 'Active' },
    { id: 'REP-002', title: 'Vendor Delivery & Quality Scorecard', category: 'Supply Chain', frequency: 'Weekly', format: 'Excel (XLSX)', recipients: 'supply.chain@company.com', lastGenerated: '2026-08-22', status: 'Active' },
    { id: 'REP-003', title: 'Accounts Payable 3-Way Match Audit Log', category: 'Finance & AP', frequency: 'Daily', format: 'CSV', recipients: 'finance.ap@company.com', lastGenerated: '2026-08-24', status: 'Active' },
    { id: 'REP-004', title: 'Purchase Order Aging & Delivery Delays', category: 'Procurement', frequency: 'Weekly', format: 'PDF Presentation', recipients: 'mgmt@company.com', lastGenerated: '2026-08-23', status: 'Active' }
  ];

  filteredReports(): ReportItem[] {
    const q = this.searchQuery.trim().toLowerCase();
    const cf = this.categoryFilter;
    return this.reports.filter(r => {
      const matchQ = !q || (r.title || '').toLowerCase().includes(q) || (r.category || '').toLowerCase().includes(q) || (r.format || '').toLowerCase().includes(q) || (r.frequency || '').toLowerCase().includes(q) || (r.id || '').toLowerCase().includes(q) || (r.recipients || '').toLowerCase().includes(q);
      const matchC = !cf || r.category === cf;
      return matchQ && matchC;
    });
  }

  addReport(): void {
    if (!this.newReport.title) {
      this.state.notify('Error: Report title is required.');
      return;
    }
    const created: ReportItem = { ...this.newReport, id: `REP-${Math.floor(100 + Math.random() * 900)}` };
    this.reports = [created, ...this.reports];
    this.state.notify(`Report "${created.title}" scheduled.`);
    this.resetForm();
    this.showAddReport = false;
  }

  resetForm(): void {
    this.newReport = {
      id: '',
      title: '',
      category: 'Procurement',
      frequency: 'Monthly',
      format: 'Excel (XLSX)',
      recipients: '',
      lastGenerated: 'Today',
      status: 'Active'
    };
  }

  downloadReport(r: ReportItem): void {
    this.state.notify(`Generating and downloading "${r.title}" (${r.format})...`);
  }

  saveReport(r: ReportItem): void {
    this.state.notify(`Report configuration for "${r.title}" saved.`);
  }

  deleteReport(id: string): void {
    this.reports = this.reports.filter(r => r.id !== id);
    this.state.notify('Report configuration deleted.');
  }

  generateAll(): void {
    this.state.notify('All active scheduled reports generated and emailed to recipients.');
  }
}
