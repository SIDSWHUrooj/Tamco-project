import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';

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
  imports: [FormsModule, PageHeadingComponent, StatusComponent],
  template: `
    <app-page-heading eyebrow="Alerts & Feed" title="System Notifications & Broadcasts" subtitle="Manage automated workflow alerts, delivery delay escalations, payment release advices and portal broadcasts.">
      <div class="heading-actions">
        <button class="btn" (click)="showBroadcastForm = !showBroadcastForm">
          {{ showBroadcastForm ? '✕ Close Form' : '+ Broadcast Alert' }}
        </button>
        <button class="btn secondary" (click)="markAllRead()">Mark All Read</button>
      </div>
    </app-page-heading>

    <!-- Broadcast Form Panel -->
    @if (showBroadcastForm) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid #1769e0;">
        <div class="panel-title">
          <div>
            <h2>Broadcast System Notification / Alert</h2>
            <p>Publish an immediate alert to internal roles or all registered supplier accounts.</p>
          </div>
        </div>

        <div class="form-grid">
          <label>Alert Title / Message *<input [(ngModel)]="newNotif.message" placeholder="e.g. Scheduled ERP maintenance this Saturday 02:00 AM" /></label>
          <label>Category Type *
            <select [(ngModel)]="newNotif.type" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="Workflow Action">Workflow Action</option>
              <option value="Delivery Alert">Delivery Alert</option>
              <option value="Payment Release">Payment Release</option>
              <option value="System Broadcast">System Broadcast</option>
            </select>
          </label>
          <label>Target Audience *
            <select [(ngModel)]="newNotif.audience" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="All Portal Users">All Portal Users</option>
              <option value="Registered Vendors Only">Registered Vendors Only</option>
              <option value="Procurement Team">Procurement Team</option>
              <option value="Finance & AP Team">Finance & AP Team</option>
            </select>
          </label>
          <label>Priority Severity
            <select [(ngModel)]="newNotif.priority" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="High">High (Immediate Action)</option>
              <option value="Medium">Medium (Attention)</option>
              <option value="Normal">Normal (Informational)</option>
            </select>
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
    <div style="display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap;">
      <input
        style="flex: 1; min-width: 240px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px;"
        [(ngModel)]="searchQuery"
        placeholder="🔍 Search notifications by message, type, audience or entity..."
      />
      <select
        style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; background: #fff;"
        [(ngModel)]="statusFilter"
      >
        <option value="">All Notifications</option>
        <option value="Unread">Unread</option>
        <option value="Read">Read</option>
      </select>
    </div>

    <!-- Live Notifications Table -->
    <article class="panel">
      <div class="panel-title">
        <div>
          <h2>System Broadcasts & Event Feed</h2>
          <p>Real-time activity notices with priority status</p>
        </div>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Priority</th>
              <th>Notification Message</th>
              <th>Type</th>
              <th>Related Entity</th>
              <th>Audience</th>
              <th>Timestamp</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (n of filteredNotifications(); track n.id) {
              <tr>
                <td>
                  <app-status [text]="n.priority" [bad]="n.priority==='High'" [warn]="n.priority==='Medium'" [good]="n.priority==='Normal'" />
                </td>
                <td><input [(ngModel)]="n.message" style="font-weight: 600; min-width: 260px;" /></td>
                <td><input [(ngModel)]="n.type" style="width: 120px;" /></td>
                <td><span class="mono">{{ n.targetEntity }}</span></td>
                <td><input [(ngModel)]="n.audience" style="width: 140px;" /></td>
                <td><small style="color: #64748b;">{{ n.timestamp }}</small></td>
                <td>
                  <app-status [text]="n.status" [warn]="n.status==='Unread'" [good]="n.status==='Read'" />
                </td>
                <td>
                  <div style="display: flex; gap: 5px;">
                    <button class="btn small" (click)="toggleRead(n)">
                      {{ n.status === 'Unread' ? 'Mark Read' : 'Unread' }}
                    </button>
                    <button class="btn small ghost" (click)="saveNotif(n)">Save</button>
                    <button class="btn small danger-btn" (click)="deleteNotif(n.id)">✕</button>
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

  filteredNotifications = computed(() => {
    const q = this.searchQuery.trim().toLowerCase();
    const sf = this.statusFilter;
    return this.notificationsList.filter(n => {
      const matchQ = !q || n.message.toLowerCase().includes(q) || n.targetEntity.toLowerCase().includes(q) || n.audience.toLowerCase().includes(q);
      const matchS = !sf || n.status === sf;
      return matchQ && matchS;
    });
  });

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
