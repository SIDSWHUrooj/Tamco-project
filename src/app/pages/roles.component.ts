import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent } from '../shared/ui.component';

export interface RolePermission {
  id: string;
  name: string;
  description: string;
  vendorMgmt: boolean;
  rfqBidding: boolean;
  poDeliveries: boolean;
  invoicesPay: boolean;
  adminControls: boolean;
  userCount: number;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent],
  template: `
    <app-page-heading eyebrow="Access Control" title="Role Management & Permissions" subtitle="Configure granular functional permissions across sourcing, purchasing, warehouse receipts, and accounts payable.">
      <div class="heading-actions">
        <button class="btn" (click)="showAddRole = !showAddRole">
          {{ showAddRole ? '✕ Close Form' : '+ Create Custom Role' }}
        </button>
        <button class="btn secondary" (click)="saveAll()">Save All Roles</button>
      </div>
    </app-page-heading>

    <!-- Create Custom Role Panel -->
    @if (showAddRole) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
        <div class="panel-title">
          <h2>Define Custom Authorization Role</h2>
        </div>

        <div class="form-grid">
          <label>Role Identifier / Name *<input [(ngModel)]="newRole.name" placeholder="e.g. Sourcing Specialist" /></label>
          <label>Role Purpose & Scope *<input [(ngModel)]="newRole.description" placeholder="Responsible for RFQ evaluation and vendor onboarding" /></label>
          <div class="span-2" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 6px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 11px;">
              <input type="checkbox" [(ngModel)]="newRole.vendorMgmt" /> Vendor Pre-Qualification
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 11px;">
              <input type="checkbox" [(ngModel)]="newRole.rfqBidding" /> RFQs & Bidding Management
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 11px;">
              <input type="checkbox" [(ngModel)]="newRole.poDeliveries" /> PO & Delivery Fulfillment
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 11px;">
              <input type="checkbox" [(ngModel)]="newRole.invoicesPay" /> Invoices & AP Processing
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 11px;">
              <input type="checkbox" [(ngModel)]="newRole.adminControls" /> System Master & Security
            </label>
          </div>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetForm()">Reset</button>
          <button class="btn" (click)="addRole()">Create Role</button>
        </div>
      </article>
    }

    <!-- Live Roles Table -->
    <article class="panel">
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Role Name</th>
              <th>Description</th>
              <th>Vendors</th>
              <th>RFQs / Bids</th>
              <th>POs / Delivery</th>
              <th>Invoices / AP</th>
              <th>Admin & Core</th>
              <th>Assigned Users</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (r of rolesList; track r.id) {
              <tr>
                <td><input [(ngModel)]="r.name" style="font-weight: 700; width: 140px;" /></td>
                <td><input [(ngModel)]="r.description" style="min-width: 220px;" /></td>
                <td style="text-align: center;"><input type="checkbox" [(ngModel)]="r.vendorMgmt" /></td>
                <td style="text-align: center;"><input type="checkbox" [(ngModel)]="r.rfqBidding" /></td>
                <td style="text-align: center;"><input type="checkbox" [(ngModel)]="r.poDeliveries" /></td>
                <td style="text-align: center;"><input type="checkbox" [(ngModel)]="r.invoicesPay" /></td>
                <td style="text-align: center;"><input type="checkbox" [(ngModel)]="r.adminControls" /></td>
                <td><strong style="color: #1769e0;">{{ r.userCount }} users</strong></td>
                <td style="white-space: nowrap;">
                  <div style="display: flex; gap: 5px; align-items: center;">
                    <button class="btn-action btn-action-save" (click)="saveRole(r)" title="Save changes">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      <span>Save</span>
                    </button>
                    <button class="btn-action btn-action-delete" (click)="deleteRole(r.id)" title="Delete role">
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
export class RolesComponent {
  readonly state = inject(PortalStateService);

  showAddRole = false;

  newRole: RolePermission = {
    id: 'ROL-005',
    name: 'Sourcing Specialist',
    description: 'Manages vendor questionnaires, RFQ invitations, and technical evaluations',
    vendorMgmt: true,
    rfqBidding: true,
    poDeliveries: false,
    invoicesPay: false,
    adminControls: false,
    userCount: 0
  };

  rolesList: RolePermission[] = [
    { id: 'ROL-001', name: 'Vendor Representative', description: 'Access to own company profile, RFQ bidding and invoice uploads', vendorMgmt: true, rfqBidding: true, poDeliveries: true, invoicesPay: true, adminControls: false, userCount: 86 },
    { id: 'ROL-002', name: 'Procurement Specialist', description: 'Full access to vendor verification, RFQ sourcing and PO release', vendorMgmt: true, rfqBidding: true, poDeliveries: true, invoicesPay: false, adminControls: false, userCount: 18 },
    { id: 'ROL-003', name: 'Finance / AP Officer', description: 'Validates bank records, performs 3-way matching and approves invoices', vendorMgmt: true, rfqBidding: false, poDeliveries: true, invoicesPay: true, adminControls: false, userCount: 12 },
    { id: 'ROL-004', name: 'System Administrator', description: 'Full access to master data, integrations, workflows and security', vendorMgmt: true, rfqBidding: true, poDeliveries: true, invoicesPay: true, adminControls: true, userCount: 4 }
  ];

  addRole(): void {
    if (!this.newRole.name) {
      this.state.notify('Error: Role name is required.');
      return;
    }
    const created: RolePermission = { ...this.newRole, id: `ROL-${Math.floor(100 + Math.random() * 900)}` };
    this.rolesList = [...this.rolesList, created];
    this.state.notify(`Role "${created.name}" configured.`);
    this.resetForm();
    this.showAddRole = false;
  }

  resetForm(): void {
    this.newRole = {
      id: '',
      name: '',
      description: '',
      vendorMgmt: true,
      rfqBidding: true,
      poDeliveries: false,
      invoicesPay: false,
      adminControls: false,
      userCount: 0
    };
  }

  saveRole(r: RolePermission): void {
    this.state.notify(`Permissions for role "${r.name}" updated.`);
  }

  deleteRole(id: string): void {
    this.rolesList = this.rolesList.filter(r => r.id !== id);
    this.state.notify('Role deleted.');
  }

  saveAll(): void {
    this.state.notify('All role matrices synchronized across active sessions.');
  }
}
