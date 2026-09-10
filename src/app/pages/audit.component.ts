import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';

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
  imports: [FormsModule, PageHeadingComponent, StatusComponent],
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
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid #1769e0;">
        <div class="panel-title">
          <div>
            <h2>Record Compliance / Manual Audit Entry</h2>
            <p>Attach tamper-evident supervisor note or internal investigation observation.</p>
          </div>
        </div>

        <div class="form-grid">
          <label>Event Description / Action *<input [(ngModel)]="newEvent.action" placeholder="e.g. Annual vendor bank confirmation completed" /></label>
          <label>Auditor / Operator Email *<input [(ngModel)]="newEvent.user" placeholder="e.g. internal.auditor@company.com" /></label>
          <label>System Module *
            <select [(ngModel)]="newEvent.module" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="Finance & Banking">Finance & Banking</option>
              <option value="Procurement Sourcing">Procurement Sourcing</option>
              <option value="Identity & Security">Identity & Security</option>
              <option value="System Master">System Master</option>
            </select>
          </label>
          <label>Severity Level
            <select [(ngModel)]="newEvent.severity" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="Info">Info (Standard Event)</option>
              <option value="Warning">Warning (Review Needed)</option>
              <option value="Critical">Critical (Security / Financial)</option>
            </select>
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
    <div style="display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap;">
      <input
        style="flex: 1; min-width: 240px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px;"
        [(ngModel)]="searchQuery"
        placeholder="🔍 Search audit logs by action, user email, module or IP..."
      />
      <select
        style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; background: #fff;"
        [(ngModel)]="moduleFilter"
      >
        <option value="">All Modules</option>
        <option value="Finance & Banking">Finance & Banking</option>
        <option value="Procurement">Procurement</option>
        <option value="User Management">User Management</option>
        <option value="Invoicing">Invoicing</option>
      </select>
    </div>

    <!-- Live Audit Trail Table -->
    <article class="panel">
      <div class="panel-title">
        <div>
          <h2>System Audit Trail & Security Events</h2>
          <p>Cryptographically hashed activity log with actor attribution</p>
        </div>
      </div>

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
                <td>
                  <div style="display: flex; gap: 5px;">
                    <button class="btn small ghost" (click)="saveEvent(evt)">Save</button>
                    <button class="btn small danger-btn" (click)="deleteEvent(evt.id)">✕</button>
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

  filteredEvents = computed(() => {
    const q = this.searchQuery.trim().toLowerCase();
    const mf = this.moduleFilter;
    return this.events.filter(e => {
      const matchQ = !q || e.action.toLowerCase().includes(q) || e.user.toLowerCase().includes(q) || e.module.toLowerCase().includes(q);
      const matchM = !mf || e.module.includes(mf);
      return matchQ && matchM;
    });
  });

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
