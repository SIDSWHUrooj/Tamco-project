import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent } from '../shared/ui.component';

export interface ApprovalTier {
  id: string;
  tierName: string;
  minSpend: number;
  maxSpend: number;
  primaryApprover: string;
  secondaryApprover: string;
  slaHours: number;
  autoEscalate: boolean;
}

@Component({
  selector: 'app-approval-matrix',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent],
  template: `
    <app-page-heading eyebrow="Governance & Authorization" title="Approval Limits & Spending Matrix" subtitle="Define automated routing policies by financial value, category delegation limits and executive sign-off thresholds.">
      <div class="heading-actions">
        <button class="btn" (click)="showAddTier = !showAddTier">
          {{ showAddTier ? '✕ Close Form' : '+ Add Approval Tier' }}
        </button>
        <button class="btn secondary" (click)="saveAll()">Save Matrix</button>
      </div>
    </app-page-heading>

    <!-- Add Approval Tier Form -->
    @if (showAddTier) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid #1769e0;">
        <div class="panel-title">
          <div>
            <h2>Define New Spending Authority Threshold</h2>
            <p>Specify spend limits, required sign-off roles and auto-escalation periods.</p>
          </div>
        </div>

        <div class="form-grid">
          <label>Tier Name / Identifier *<input [(ngModel)]="newTier.tierName" placeholder="e.g. Tier 5 (Board Authority)" /></label>
          <label>Minimum Amount (USD) *<input type="number" [(ngModel)]="newTier.minSpend" placeholder="500000" /></label>
          <label>Maximum Amount (USD) *<input type="number" [(ngModel)]="newTier.maxSpend" placeholder="2000000" /></label>
          <label>Primary Approver Role *
            <select [(ngModel)]="newTier.primaryApprover" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="Procurement Manager">Procurement Manager</option>
              <option value="Head of Sourcing">Head of Sourcing</option>
              <option value="Executive Director">Executive Director</option>
              <option value="Chief Financial Officer (CFO)">Chief Financial Officer (CFO)</option>
              <option value="Chief Executive Officer (CEO)">Chief Executive Officer (CEO)</option>
            </select>
          </label>
          <label>Secondary Sign-off Role<input [(ngModel)]="newTier.secondaryApprover" placeholder="e.g. Managing Director" /></label>
          <label>SLA Before Escalation (Hours)<input type="number" [(ngModel)]="newTier.slaHours" placeholder="48" /></label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetForm()">Reset</button>
          <button class="btn" (click)="addTier()">Save Tier</button>
        </div>
      </article>
    }

    <!-- Live Matrix Table -->
    <article class="panel">
      <div class="panel-title">
        <div>
          <h2>Active Financial Delegation Matrix</h2>
          <p>Commercial spend threshold routing rules configured in ERP</p>
        </div>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Tier Level</th>
              <th>Min Amount ($)</th>
              <th>Max Amount ($)</th>
              <th>Primary Approver</th>
              <th>Secondary Approver</th>
              <th>SLA (Hours)</th>
              <th>Auto-Escalate</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (t of matrixTiers; track t.id) {
              <tr>
                <td><input [(ngModel)]="t.tierName" style="font-weight: 700; width: 130px;" /></td>
                <td><input type="number" [(ngModel)]="t.minSpend" style="width: 85px;" /></td>
                <td><input type="number" [(ngModel)]="t.maxSpend" style="width: 95px;" /></td>
                <td><input [(ngModel)]="t.primaryApprover" style="min-width: 170px;" /></td>
                <td><input [(ngModel)]="t.secondaryApprover" style="min-width: 150px;" /></td>
                <td><input type="number" [(ngModel)]="t.slaHours" style="width: 55px;" /> hrs</td>
                <td style="text-align: center;"><input type="checkbox" [(ngModel)]="t.autoEscalate" /></td>
                <td>
                  <div style="display: flex; gap: 5px;">
                    <button class="btn small ghost" (click)="saveTier(t)">Save</button>
                    <button class="btn small danger-btn" (click)="deleteTier(t.id)">✕</button>
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
export class ApprovalMatrixComponent {
  readonly state = inject(PortalStateService);

  showAddTier = false;

  newTier: ApprovalTier = {
    id: 'TR-005',
    tierName: 'Tier 5 (Board Authority)',
    minSpend: 500000,
    maxSpend: 2500000,
    primaryApprover: 'Chief Executive Officer (CEO)',
    secondaryApprover: 'Board Audit Committee',
    slaHours: 72,
    autoEscalate: true
  };

  matrixTiers: ApprovalTier[] = [
    { id: 'TR-001', tierName: 'Level 1 (Operational)', minSpend: 0, maxSpend: 10000, primaryApprover: 'Procurement Manager', secondaryApprover: 'Plant Head', slaHours: 24, autoEscalate: true },
    { id: 'TR-002', tierName: 'Level 2 (Tactical)', minSpend: 10000, maxSpend: 50000, primaryApprover: 'Head of Sourcing', secondaryApprover: 'Finance Manager', slaHours: 48, autoEscalate: true },
    { id: 'TR-003', tierName: 'Level 3 (Strategic)', minSpend: 50000, maxSpend: 250000, primaryApprover: 'Executive Director', secondaryApprover: 'VP Supply Chain', slaHours: 48, autoEscalate: true },
    { id: 'TR-004', tierName: 'Level 4 (Executive)', minSpend: 250000, maxSpend: 1000000, primaryApprover: 'Chief Financial Officer (CFO)', secondaryApprover: 'CEO Sign-off', slaHours: 72, autoEscalate: true }
  ];

  addTier(): void {
    if (!this.newTier.tierName) {
      this.state.notify('Error: Tier name is required.');
      return;
    }
    const created: ApprovalTier = { ...this.newTier, id: `TR-${Math.floor(100 + Math.random() * 900)}` };
    this.matrixTiers = [...this.matrixTiers, created];
    this.state.notify(`Approval tier "${created.tierName}" saved.`);
    this.resetForm();
    this.showAddTier = false;
  }

  resetForm(): void {
    this.newTier = {
      id: '',
      tierName: '',
      minSpend: 0,
      maxSpend: 100000,
      primaryApprover: 'Procurement Manager',
      secondaryApprover: '',
      slaHours: 24,
      autoEscalate: true
    };
  }

  saveTier(t: ApprovalTier): void {
    this.state.notify(`Spending limits for "${t.tierName}" updated.`);
  }

  deleteTier(id: string): void {
    this.matrixTiers = this.matrixTiers.filter(t => t.id !== id);
    this.state.notify('Approval tier removed.');
  }

  saveAll(): void {
    this.state.notify('Approval matrix saved and synchronized with ERP authorization engine.');
  }
}
