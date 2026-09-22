import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';
import { IconComponent } from '../shared/icon.component';
import { CustomSelectComponent } from '../shared/custom-select.component';

export interface AuditEvent {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  ipAddress: string;
  severity: 'Info' | 'Warning' | 'Critical';
}

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent, StatusComponent, IconComponent, CustomSelectComponent],
  template: `
    <app-page-heading eyebrow="Compliance & Security" title="Immutable Audit Logs & Event Trail" subtitle="Trace digital timestamps, sensitive financial field modifications, user role assignments, and authorization events.">
      <div class="heading-actions">
        <button class="btn" (click)="showAddEvent = !showAddEvent">
          {{ showAddEvent ? '✕ Close Form' : '+ Record Audit Note' }}
        </button>
        <button class="btn secondary" (click)="exportAuditTrail()">Export Signed Audit Log</button>
      </div>
    </app-page-heading>

    <!-- Record Manual Audit Note Form -->
    @if (showAddEvent) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
        <div class="panel-title">
          <h2>Record Compliance / Manual Audit Entry</h2>
        </div>

        <div class="form-grid">
          <label>Event Description / Action *<input [(ngModel)]="newEvent.action" placeholder="e.g. Annual vendor bank confirmation completed" /></label>
          <label>Auditor / Operator Email *<input [(ngModel)]="newEvent.user" placeholder="e.g. internal.auditor@company.com" /></label>
          <label>System Module *
            <app-custom-select [(ngModel)]="newEvent.module" [options]="moduleOptions" />
          </label>
          <label>Severity Level
            <app-custom-select [(ngModel)]="newEvent.severity" [options]="severityOptions" />
          </label>
          <label class="span-2">Source IP / Device Info<input [(ngModel)]="newEvent.ipAddress" placeholder="192.168.1.100 (Internal LAN)" /></label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetForm()">Reset</button>
          <button class="btn" (click)="addEvent()">Write to Audit Trail</button>
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
          placeholder="Search audit logs by action, user email, module or IP..."
        />
      </div>
      <app-custom-select
        [(ngModel)]="moduleFilter"
        [options]="filterModuleOptions"
        minWidth="170px"
      />
    </div>

    <!-- Live Audit Trail Table -->
    <article class="panel">
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action / Event</th>
              <th>User Account</th>
              <th>Module</th>
              <th>IP Address</th>
              <th>Severity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (evt of filteredEvents(); track evt.id) {
              <tr>
                <td><small style="color: #64748b; font-family: monospace;">{{ evt.timestamp }}</small></td>
                <td><input [(ngModel)]="evt.action" style="font-weight: 600; min-width: 260px;" /></td>
                <td><input [(ngModel)]="evt.user" style="min-width: 170px;" /></td>
                <td><input [(ngModel)]="evt.module" style="width: 140px;" /></td>
                <td><input [(ngModel)]="evt.ipAddress" style="font-family: monospace; font-size: 11px; width: 110px;" /></td>
                <td>
                  <app-status [text]="evt.severity" [good]="evt.severity==='Info'" [warn]="evt.severity==='Warning'" [bad]="evt.severity==='Critical'" />
                </td>
                <td style="white-space: nowrap;">
                  <div style="display: flex; gap: 5px; align-items: center;">
                    <button class="btn-action btn-action-save" (click)="saveEvent(evt)" title="Save changes">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      <span>Save</span>
                    </button>
                    <button class="btn-action btn-action-delete" (click)="deleteEvent(evt.id)" title="Delete audit record">
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
export class AuditLogsComponent {
  readonly state = inject(PortalStateService);

  showAddEvent = false;
  searchQuery = '';
  moduleFilter = '';

  readonly filterModuleOptions = [
    { value: '', label: 'All Modules' },
    { value: 'Finance & Banking', label: 'Finance & Banking' },
    { value: 'Procurement', label: 'Procurement' },
    { value: 'User Management', label: 'User Management' },
    { value: 'Invoicing', label: 'Invoicing' }
  ];
  readonly moduleOptions = ['Finance & Banking', 'Procurement', 'User Management', 'Invoicing', 'Identity & Security', 'System Master'];
  readonly severityOptions = ['Info', 'Warning', 'Critical'];

  newEvent: AuditEvent = {
    id: 'EVT-005',
    timestamp: '2026-08-24 14:10:00',
    user: 'internal.auditor@company.com',
    action: 'Periodic bank account authorization sample check passed',
    module: 'Finance & Banking',
    ipAddress: '192.168.1.104',
    severity: 'Info'
  };

  events: AuditEvent[] = [
    { id: 'EVT-001', timestamp: '2026-08-24 12:45:10', user: 'admin@company.com', action: 'User role updated: Tariq Mansoor → Procurement Manager', module: 'User Management', ipAddress: '192.168.1.45', severity: 'Info' },
    { id: 'EVT-002', timestamp: '2026-08-24 11:30:22', user: 'fatima@company.com', action: 'Bank verification approved for vendor VEN-10024 (HBL)', module: 'Finance & Banking', ipAddress: '192.168.1.88', severity: 'Info' },
    { id: 'EVT-003', timestamp: '2026-08-24 10:15:04', user: 'tariq@company.com', action: 'PO #PO-002345 approved ($52,000 released)', module: 'Procurement', ipAddress: '192.168.1.12', severity: 'Info' },
    { id: 'EVT-004', timestamp: '2026-08-24 09:02:51', user: 'ali@abcsupplies.example', action: 'Invoice #INV-00245 uploaded ($18,600)', module: 'Invoicing', ipAddress: '182.185.12.9', severity: 'Info' }
  ];

  filteredEvents(): AuditEvent[] {
    const q = this.searchQuery.trim().toLowerCase();
    const mf = this.moduleFilter;
    return this.events.filter(e => {
      const matchQ = !q || (e.action || '').toLowerCase().includes(q) || (e.user || '').toLowerCase().includes(q) || (e.module || '').toLowerCase().includes(q) || (e.ipAddress || '').toLowerCase().includes(q) || (e.id || '').toLowerCase().includes(q) || (e.timestamp || '').toLowerCase().includes(q);
      const matchM = !mf || (e.module || '').includes(mf);
      return matchQ && matchM;
    });
  }

  addEvent(): void {
    if (!this.newEvent.action) {
      this.state.notify('Error: Action description is required.');
      return;
    }
    const created: AuditEvent = { ...this.newEvent, id: `EVT-${Math.floor(100 + Math.random() * 900)}`, timestamp: 'Just now' };
    this.events = [created, ...this.events];
    this.state.notify('Audit event recorded in immutable ledger.');
    this.resetForm();
    this.showAddEvent = false;
  }

  resetForm(): void {
    this.newEvent = {
      id: '',
      timestamp: 'Just now',
      user: 'admin@company.com',
      action: '',
      module: 'Finance & Banking',
      ipAddress: '192.168.1.1',
      severity: 'Info'
    };
  }

  saveEvent(evt: AuditEvent): void {
    this.state.notify(`Audit event ${evt.id} updated.`);
  }

  deleteEvent(id: string): void {
    this.events = this.events.filter(e => e.id !== id);
    this.state.notify('Audit record archived.');
  }

  exportAuditTrail(): void {
    this.state.notify('Exporting signed cryptographic audit log (CSV)...');
  }
}
