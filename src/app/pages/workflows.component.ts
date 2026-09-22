import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';
import { CustomSelectComponent } from '../shared/custom-select.component';

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
  imports: [FormsModule, PageHeadingComponent, StatusComponent, CustomSelectComponent],
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
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
        <div class="panel-title">
          <h2>Configure Approval & Verification Pipeline</h2>
        </div>

        <div class="form-grid">
          <label>Workflow Title *<input [(ngModel)]="newWorkflow.name" placeholder="e.g. High-Value PO Approval Flow" /></label>
          <label>Trigger Event *
            <app-custom-select [(ngModel)]="newWorkflow.triggerEvent" [options]="triggerOptions" />
          </label>
          <label>Sequential Stages & Approvers *<input [(ngModel)]="newWorkflow.stages" placeholder="e.g. Buyer → Manager → Head of Procurement" /></label>
          <label>Max SLA (Hours) *<input type="number" [(ngModel)]="newWorkflow.slaHours" placeholder="48" /></label>
          <label>Priority
            <app-custom-select [(ngModel)]="newWorkflow.priority" [options]="priorityOptions" />
          </label>
          <label>Initial State
            <app-custom-select [(ngModel)]="newWorkflow.status" [options]="statusOptions" />
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
                <td style="white-space: nowrap;">
                  <div style="display: flex; gap: 5px; align-items: center;">
                    <button
                      class="btn-action"
                      [class.btn-action-reject]="w.status === 'Active'"
                      [class.btn-action-approve]="w.status !== 'Active'"
                      (click)="toggleActive(w)"
                      style="min-width: 90px; justify-content: center;"
                    >
                      @if (w.status === 'Active') {
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                        <span>Deactivate</span>
                      } @else {
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        <span>Activate</span>
                      }
                    </button>
                    <button class="btn-action btn-action-save" (click)="saveWorkflow(w)" title="Save changes">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      <span>Save</span>
                    </button>
                    <button class="btn-action btn-action-delete" (click)="deleteWorkflow(w.id)" title="Delete workflow">
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
export class WorkflowsComponent {
  readonly state = inject(PortalStateService);

  showAddWorkflow = false;

  readonly triggerOptions = [
    'Vendor Profile Submitted',
    'RFQ Sourcing Concluded',
    'Purchase Order Released',
    'Invoice Uploaded & Matched'
  ];
  readonly priorityOptions = ['Critical', 'High', 'Normal'];
  readonly statusOptions = ['Active', 'Draft', 'Inactive'];

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
