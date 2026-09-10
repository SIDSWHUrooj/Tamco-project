import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';

export interface WorkflowPipeline {
  id: string;
  name: string;
  triggerEvent: string;
  stages: string;
  slaHours: number;
  priority: 'High' | 'Normal' | 'Critical';
  status: 'Active' | 'Draft' | 'Inactive';
}

@Component({
  selector: 'app-workflows',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent, StatusComponent],
  template: `
    <app-page-heading eyebrow="Automation & Process" title="Workflow Setup & Pipelines" subtitle="Configure and monitor automated paperless approval chains, service level agreements (SLAs), and verification milestones.">
      <div class="heading-actions">
        <button class="btn" (click)="showAddWorkflow = !showAddWorkflow">
          {{ showAddWorkflow ? '✕ Close Form' : '+ New Workflow Pipeline' }}
        </button>
        <button class="btn secondary" (click)="saveAll()">Save Configurations</button>
      </div>
    </app-page-heading>

    <!-- Add Workflow Form -->
    @if (showAddWorkflow) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid #1769e0;">
        <div class="panel-title">
          <div>
            <h2>Configure Approval & Verification Pipeline</h2>
            <p>Define event trigger, sequential sign-off stages and maximum SLA thresholds.</p>
          </div>
        </div>

        <div class="form-grid">
          <label>Workflow Title *<input [(ngModel)]="newWorkflow.name" placeholder="e.g. High-Value PO Approval Flow" /></label>
          <label>Trigger Event *
            <select [(ngModel)]="newWorkflow.triggerEvent" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="Vendor Profile Submitted">Vendor Profile Submitted</option>
              <option value="RFQ Sourcing Concluded">RFQ Sourcing Concluded</option>
              <option value="Purchase Order Released">Purchase Order Released</option>
              <option value="Invoice Uploaded & Matched">Invoice Uploaded & Matched</option>
            </select>
          </label>
          <label>Sequential Stages & Approvers *<input [(ngModel)]="newWorkflow.stages" placeholder="e.g. Buyer → Manager → Head of Procurement" /></label>
          <label>Max SLA (Hours) *<input type="number" [(ngModel)]="newWorkflow.slaHours" placeholder="48" /></label>
          <label>Priority
            <select [(ngModel)]="newWorkflow.priority" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
            </select>
          </label>
          <label>Initial State
            <select [(ngModel)]="newWorkflow.status" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetForm()">Reset</button>
          <button class="btn" (click)="addWorkflow()">Deploy Workflow</button>
        </div>
      </article>
    }

    <!-- Live Workflows Table -->
    <article class="panel">
      <div class="panel-title">
        <div>
          <h2>Configured Workflow Pipelines</h2>
          <p>Real-time execution rules for enterprise procurement lifecycle</p>
        </div>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Workflow Name</th>
              <th>Trigger Event</th>
              <th>Sequential Stages</th>
              <th>SLA (Hours)</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (w of workflows; track w.id) {
              <tr>
                <td><input [(ngModel)]="w.name" style="font-weight: 600; min-width: 190px;" /></td>
                <td><input [(ngModel)]="w.triggerEvent" style="min-width: 170px;" /></td>
                <td><input [(ngModel)]="w.stages" style="min-width: 220px;" /></td>
                <td><input type="number" [(ngModel)]="w.slaHours" style="width: 60px;" /> hrs</td>
                <td>
                  <app-status [text]="w.priority" [bad]="w.priority==='Critical'" [warn]="w.priority==='High'" [good]="w.priority==='Normal'" />
                </td>
                <td>
                  <app-status [text]="w.status" [good]="w.status==='Active'" [warn]="w.status==='Draft'" [bad]="w.status==='Inactive'" />
                </td>
                <td>
                  <div style="display: flex; gap: 5px;">
                    <button class="btn small" (click)="toggleActive(w)">
                      {{ w.status === 'Active' ? 'Deactivate' : 'Activate' }}
                    </button>
                    <button class="btn small ghost" (click)="saveWorkflow(w)">Save</button>
                    <button class="btn small danger-btn" (click)="deleteWorkflow(w.id)">✕</button>
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
export class WorkflowsComponent {
  readonly state = inject(PortalStateService);

  showAddWorkflow = false;

  newWorkflow: WorkflowPipeline = {
    id: 'WF-005',
    name: 'Emergency Procurement Fast-Track',
    triggerEvent: 'Purchase Order Released',
    stages: 'Head of Procurement → Executive Director',
    slaHours: 12,
    priority: 'Critical',
    status: 'Active'
  };

  workflows: WorkflowPipeline[] = [
    { id: 'WF-001', name: 'Vendor Onboarding Dual Approval', triggerEvent: 'Vendor Profile Submitted', stages: 'Procurement Inspection → Finance Verification', slaHours: 48, priority: 'High', status: 'Active' },
    { id: 'WF-002', name: 'RFQ Quotation Scoring & Award', triggerEvent: 'RFQ Sourcing Concluded', stages: 'Buyer Comparison → Sourcing Manager Sign-off', slaHours: 72, priority: 'Normal', status: 'Active' },
    { id: 'WF-003', name: 'Tiered PO Multi-Level Release', triggerEvent: 'Purchase Order Released', stages: 'Routing by Spend Matrix → Release to Supplier', slaHours: 24, priority: 'High', status: 'Active' },
    { id: 'WF-004', name: 'Invoice 3-Way Match & AP Sign-off', triggerEvent: 'Invoice Uploaded & Matched', stages: 'Automated Match → Finance Controller Posting', slaHours: 24, priority: 'Normal', status: 'Active' }
  ];

  addWorkflow(): void {
    if (!this.newWorkflow.name) {
      this.state.notify('Error: Workflow title is required.');
      return;
    }
    const created: WorkflowPipeline = { ...this.newWorkflow, id: `WF-${Math.floor(100 + Math.random() * 900)}` };
    this.workflows = [...this.workflows, created];
    this.state.notify(`Workflow "${created.name}" configured and active.`);
    this.resetForm();
    this.showAddWorkflow = false;
  }

  resetForm(): void {
    this.newWorkflow = {
      id: '',
      name: '',
      triggerEvent: 'Vendor Profile Submitted',
      stages: '',
      slaHours: 24,
      priority: 'Normal',
      status: 'Active'
    };
  }

  toggleActive(w: WorkflowPipeline): void {
    w.status = w.status === 'Active' ? 'Inactive' : 'Active';
    this.state.notify(`Workflow "${w.name}" is now ${w.status}.`);
  }

  saveWorkflow(w: WorkflowPipeline): void {
    this.state.notify(`Workflow parameters for "${w.name}" updated.`);
  }

  deleteWorkflow(id: string): void {
    this.workflows = this.workflows.filter(w => w.id !== id);
    this.state.notify('Workflow pipeline deleted.');
  }

  saveAll(): void {
    this.state.notify('All workflow rules saved and deployed.');
  }
}
