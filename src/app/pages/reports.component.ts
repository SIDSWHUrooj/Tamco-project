import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';

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
  imports: [FormsModule, PageHeadingComponent, StatusComponent],
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
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid #1769e0;">
        <div class="panel-title">
          <div>
            <h2>Configure Scheduled Enterprise Report</h2>
            <p>Define reporting parameters, distribution frequency and recipient emails.</p>
          </div>
        </div>

        <div class="form-grid">
          <label>Report Title *<input [(ngModel)]="newReport.title" placeholder="e.g. Weekly Purchase Order Delivery SLA" /></label>
          <label>Business Category *
            <select [(ngModel)]="newReport.category" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="Procurement">Procurement</option>
              <option value="Finance & AP">Finance & AP</option>
              <option value="Supply Chain">Supply Chain</option>
              <option value="Compliance & Audit">Compliance & Audit</option>
            </select>
          </label>
          <label>Frequency
            <select [(ngModel)]="newReport.frequency" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
            </select>
          </label>
          <label>Export Format
            <select [(ngModel)]="newReport.format" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="PDF / XLSX">PDF / XLSX</option>
              <option value="Excel (XLSX)">Excel (XLSX)</option>
              <option value="CSV">CSV</option>
              <option value="PDF Presentation">PDF Presentation</option>
            </select>
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
    <div style="display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap;">
      <input
        style="flex: 1; min-width: 240px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px;"
        [(ngModel)]="searchQuery"
        placeholder="🔍 Search reports by title or category..."
      />
      <select
        style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; background: #fff;"
        [(ngModel)]="categoryFilter"
      >
        <option value="">All Categories</option>
        <option value="Procurement">Procurement</option>
        <option value="Finance & AP">Finance & AP</option>
        <option value="Supply Chain">Supply Chain</option>
      </select>
    </div>

    <!-- Live Reports Table -->
    <article class="panel">
      <div class="panel-title">
        <div>
          <h2>Standard & Custom Enterprise Reports</h2>
          <p>Download instant snapshots or maintain automated distribution schedules</p>
        </div>
      </div>

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
                <td>
                  <div style="display: flex; gap: 5px;">
                    <button class="btn small ghost" (click)="downloadReport(r)">Download</button>
                    <button class="btn small ghost" (click)="saveReport(r)">Save</button>
                    <button class="btn small danger-btn" (click)="deleteReport(r.id)">✕</button>
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

  filteredReports = computed(() => {
    const q = this.searchQuery.trim().toLowerCase();
    const cf = this.categoryFilter;
    return this.reports.filter(r => {
      const matchQ = !q || r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
      const matchC = !cf || r.category === cf;
      return matchQ && matchC;
    });
  });

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
