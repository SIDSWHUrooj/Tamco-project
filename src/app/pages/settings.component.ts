import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent } from '../shared/ui.component';
import { CustomSelectComponent } from '../shared/custom-select.component';

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  category: string;
  description: string;
  modifiedBy: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent, CustomSelectComponent],
  template: `
    <app-page-heading eyebrow="Portal Configuration" title="Global System Settings" subtitle="Maintain platform runtime parameters, notification triggers, session security, and procurement tolerance rules.">
      <div class="heading-actions">
        <button class="btn" (click)="showAddSetting = !showAddSetting">
          {{ showAddSetting ? '✕ Close Form' : '+ Add Configuration Key' }}
        </button>
        <button class="btn secondary" (click)="saveAll()">Save All Settings</button>
      </div>
    </app-page-heading>

    <!-- Add Setting Form -->
    @if (showAddSetting) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
        <div class="panel-title">
          <h2>Add System Configuration Parameter</h2>
        </div>

        <div class="form-grid">
          <label>Parameter Key Name *<input [(ngModel)]="newSetting.key" placeholder="e.g. ALLOW_ADVANCE_PAYMENTS" /></label>
          <label>Configured Value *<input [(ngModel)]="newSetting.value" placeholder="e.g. TRUE / 15% Max" /></label>
          <label>Category Module *
            <app-custom-select [(ngModel)]="newSetting.category" [options]="categoryOptions" />
          </label>
          <label>Business Description<input [(ngModel)]="newSetting.description" placeholder="e.g. Allows 20% advance release for Tier 1 suppliers" /></label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetForm()">Reset</button>
          <button class="btn" (click)="addSetting()">Save Parameter</button>
        </div>
      </article>
    }

    <!-- Live Settings Table -->
    <article class="panel">
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Parameter Key</th>
              <th>Configured Value</th>
              <th>Category Module</th>
              <th>Description / Policy</th>
              <th>Modified By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (s of settings; track s.id) {
              <tr>
                <td><input [(ngModel)]="s.key" style="font-weight: 700; font-family: monospace; font-size: 11px; width: 190px;" /></td>
                <td><input [(ngModel)]="s.value" style="font-weight: 600; width: 140px;" /></td>
                <td><input [(ngModel)]="s.category" style="width: 140px;" /></td>
                <td><input [(ngModel)]="s.description" style="min-width: 250px;" /></td>
                <td><small style="color: #64748b;">{{ s.modifiedBy }}</small></td>
                <td style="white-space: nowrap;">
                  <div style="display: flex; gap: 5px; align-items: center;">
                    <button class="btn-action btn-action-save" (click)="saveSetting(s)" title="Save changes">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      <span>Save</span>
                    </button>
                    <button class="btn-action btn-action-delete" (click)="deleteSetting(s.id)" title="Delete setting">
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
export class SettingsComponent {
  readonly state = inject(PortalStateService);

  showAddSetting = false;

  readonly categoryOptions = [
    'Security & Auth',
    'Procurement Policy',
    'Finance & AP',
    'Legal & Compliance'
  ];

  newSetting: SystemSetting = {
    id: 'SET-005',
    key: 'ALLOW_ADVANCE_PAYMENTS',
    value: 'TRUE (Max 20%)',
    category: 'Finance & AP',
    description: 'Allows advance mobilization deposit for pre-qualified Tier 1 vendors',
    modifiedBy: 'Admin'
  };

  settings: SystemSetting[] = [
    { id: 'SET-001', key: 'SESSION_TIMEOUT_MINS', value: '30 Minutes', category: 'Security & Auth', description: 'Inactivity auto-signout policy for internal & vendor users', modifiedBy: 'Security Head' },
    { id: 'SET-002', key: 'PO_OVERDUE_GRACE_DAYS', value: '2 Days', category: 'Procurement Policy', description: 'Grace threshold before automated late escalation email is fired', modifiedBy: 'Procurement Manager' },
    { id: 'SET-003', key: 'INVOICE_TOLERANCE_PERCENT', value: '± 0.50 %', category: 'Finance & AP', description: 'Allowable price variance during automated 3-way match', modifiedBy: 'CFO Office' },
    { id: 'SET-004', key: 'DOC_RETENTION_YEARS', value: '7 Years', category: 'Legal & Compliance', description: 'Statutory tax and legal document archiving rule', modifiedBy: 'Legal Counsel' }
  ];

  addSetting(): void {
    if (!this.newSetting.key || !this.newSetting.value) {
      this.state.notify('Error: Key name and value are required.');
      return;
    }
    const created: SystemSetting = { ...this.newSetting, id: `SET-${Math.floor(100 + Math.random() * 900)}` };
    this.settings = [...this.settings, created];
    this.state.notify(`Setting "${created.key}" added.`);
    this.resetForm();
    this.showAddSetting = false;
  }

  resetForm(): void {
    this.newSetting = {
      id: '',
      key: '',
      value: '',
      category: 'Procurement Policy',
      description: '',
      modifiedBy: 'Admin'
    };
  }

  saveSetting(s: SystemSetting): void {
    this.state.notify(`Setting "${s.key}" updated successfully.`);
  }

  deleteSetting(id: string): void {
    this.settings = this.settings.filter(s => s.id !== id);
    this.state.notify('Configuration parameter removed.');
  }

  saveAll(): void {
    this.state.notify('Global system settings persisted across all nodes.');
  }
}
