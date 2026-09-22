import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';
import { IconComponent } from '../shared/icon.component';
import { CustomSelectComponent } from '../shared/custom-select.component';

export interface NotificationItem {
  id: string;
  type: string;
  message: string;
  targetEntity: string;
  audience: string;
  timestamp: string;
  status: 'Unread' | 'Read';
  priority: 'High' | 'Medium' | 'Normal';
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent, StatusComponent, IconComponent, CustomSelectComponent],
  template: `
    <app-page-heading eyebrow="Alerts & Feed" title="System Notifications & Broadcasts" subtitle="Manage automated workflow alerts, delivery delay escalations, payment release advices and portal broadcasts.">
      <div class="heading-actions">
        <button class="btn" (click)="showBroadcastForm = !showBroadcastForm" style="display: inline-flex; align-items: center; gap: 6px;">
          @if (showBroadcastForm) {
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            <span>Close Form</span>
          } @else {
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Broadcast Alert</span>
          }
        </button>
        <button class="btn secondary" (click)="markAllRead()" style="display: inline-flex; align-items: center; gap: 6px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>Mark All Read</span>
        </button>
      </div>
    </app-page-heading>

    <!-- Broadcast Form Panel -->
    @if (showBroadcastForm) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
        <div class="panel-title">
          <h2>Broadcast System Notification / Alert</h2>
        </div>

        <div class="form-grid">
          <label>Alert Title / Message *<input [(ngModel)]="newNotif.message" placeholder="e.g. Scheduled ERP maintenance this Saturday 02:00 AM" /></label>
          <label>Category Type *
            <app-custom-select [(ngModel)]="newNotif.type" [options]="typeOptions" />
          </label>
          <label>Target Audience *
            <app-custom-select [(ngModel)]="newNotif.audience" [options]="audienceOptions" />
          </label>
          <label>Priority Severity
            <app-custom-select [(ngModel)]="newNotif.priority" [options]="priorityOptions" />
          </label>
          <label class="span-2">Associated Reference (PO / Invoice / RFQ #)<input [(ngModel)]="newNotif.targetEntity" placeholder="e.g. PO-002345 / GLOBAL" /></label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetForm()">Reset</button>
          <button class="btn" (click)="addNotification()">Publish Broadcast</button>
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
          placeholder="Search notifications by message, type, audience or entity..."
        />
      </div>
      <app-custom-select
        [(ngModel)]="statusFilter"
        [options]="statusFilterOptions"
        minWidth="170px"
      />
    </div>

    <!-- Live Notifications Table -->
    <article class="panel">
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Priority</th>
              <th>Notification Message</th>
              <th>Category</th>
              <th>Entity Ref</th>
              <th>Target Audience</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (n of filteredNotifications(); track n.id) {
              <tr>
                <td>
                  <span class="pill" [class.danger]="n.priority==='High'" [class.warning]="n.priority==='Medium'">
                    {{ n.priority }}
                  </span>
                </td>
                <td><input [(ngModel)]="n.message" style="font-weight: 600; min-width: 260px;" /></td>
                <td><input [(ngModel)]="n.type" style="width: 120px;" /></td>
                <td><span class="mono">{{ n.targetEntity }}</span></td>
                <td><input [(ngModel)]="n.audience" style="width: 140px;" /></td>
                <td><small style="color: #64748b;">{{ n.timestamp }}</small></td>
                <td>
                  <app-status [text]="n.status" [warn]="n.status==='Unread'" [good]="n.status==='Read'" />
                </td>
                <td style="white-space: nowrap;">
                  <div style="display: flex; gap: 5px; align-items: center;">
                    <button
                      class="btn-action"
                      [class.btn-action-approve]="n.status === 'Unread'"
                      [class.btn-action-view]="n.status === 'Read'"
                      (click)="toggleRead(n)"
                      [title]="n.status === 'Unread' ? 'Mark as Read' : 'Mark as Unread'"
                      style="min-width: 96px; justify-content: center;"
                    >
                      @if (n.status === 'Unread') {
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span>Mark Read</span>
                      } @else {
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <span>Unread</span>
                      }
                    </button>
                    <button class="btn-action btn-action-save" (click)="saveNotif(n)" title="Save changes">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      <span>Save</span>
                    </button>
                    <button class="btn-action btn-action-delete" (click)="deleteNotif(n.id)" title="Delete Notification">
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
export class NotificationsComponent {
  readonly state = inject(PortalStateService);

  showBroadcastForm = false;
  searchQuery = '';
  statusFilter = '';

  readonly statusFilterOptions = [
    { value: '', label: 'All Notifications' },
    { value: 'Unread', label: 'Unread' },
    { value: 'Read', label: 'Read' }
  ];

  readonly typeOptions = ['Workflow Action', 'Delivery Alert', 'Payment Release', 'System Broadcast'];
  readonly audienceOptions = ['All Portal Users', 'Registered Vendors Only', 'Procurement Team', 'Finance & AP Team'];
  readonly priorityOptions = ['High', 'Medium', 'Normal'];

  newNotif: NotificationItem = {
    id: 'NOT-005',
    type: 'System Broadcast',
    message: 'Scheduled ERP backend sync maintenance on Sunday at 02:00 AM UTC',
    targetEntity: 'SYS-CORE',
    audience: 'All Portal Users',
    timestamp: 'Just now',
    status: 'Unread',
    priority: 'Normal'
  };

  notificationsList: NotificationItem[] = [
    { id: 'NOT-001', type: 'Workflow Action', message: 'PO #PO-002345 pending manager approval exceeds 48 hrs SLA', targetEntity: 'PO-002345', audience: 'Procurement Team', timestamp: '10 mins ago', status: 'Unread', priority: 'High' },
    { id: 'NOT-002', type: 'Delivery Alert', message: 'Supplier arrival date updated for PO #PO-002321 (Delivery Delayed)', targetEntity: 'PO-002321', audience: 'Procurement Team', timestamp: '1 hour ago', status: 'Unread', priority: 'High' },
    { id: 'NOT-003', type: 'Payment Release', message: 'Invoice #INV-00246 matched and cleared for bank disbursement', targetEntity: 'INV-00246', audience: 'Finance & AP Team', timestamp: '3 hours ago', status: 'Read', priority: 'Normal' },
    { id: 'NOT-004', type: 'System Broadcast', message: 'All vendors must re-verify annual NTN certificates before Q4', targetEntity: 'VEN-GLOBAL', audience: 'Registered Vendors Only', timestamp: '1 day ago', status: 'Read', priority: 'Medium' }
  ];

  filteredNotifications(): NotificationItem[] {
    const q = this.searchQuery.trim().toLowerCase();
    const sf = this.statusFilter;
    return this.notificationsList.filter(n => {
      const matchQ = !q || (n.message || '').toLowerCase().includes(q) || (n.targetEntity || '').toLowerCase().includes(q) || (n.audience || '').toLowerCase().includes(q) || (n.type || '').toLowerCase().includes(q) || (n.id || '').toLowerCase().includes(q);
      const matchS = !sf || n.status === sf;
      return matchQ && matchS;
    });
  }

  addNotification(): void {
    if (!this.newNotif.message) {
      this.state.notify('Error: Notification message is required.');
      return;
    }
    const created: NotificationItem = { ...this.newNotif, id: `NOT-${Math.floor(100 + Math.random() * 900)}`, timestamp: 'Just now' };
    this.notificationsList = [created, ...this.notificationsList];
    this.state.notify('Broadcast alert published to target audience.');
    this.resetForm();
    this.showBroadcastForm = false;
  }

  resetForm(): void {
    this.newNotif = {
      id: '',
      type: 'System Broadcast',
      message: '',
      targetEntity: 'GLOBAL',
      audience: 'All Portal Users',
      timestamp: 'Just now',
      status: 'Unread',
      priority: 'Normal'
    };
  }

  toggleRead(n: NotificationItem): void {
    n.status = n.status === 'Unread' ? 'Read' : 'Unread';
  }

  saveNotif(n: NotificationItem): void {
    this.state.notify('Notification updated.');
  }

  deleteNotif(id: string): void {
    this.notificationsList = this.notificationsList.filter(n => n.id !== id);
    this.state.notify('Notification removed.');
  }

  markAllRead(): void {
    this.notificationsList.forEach(n => n.status = 'Read');
    this.state.notify('All notifications marked as read.');
  }
}
