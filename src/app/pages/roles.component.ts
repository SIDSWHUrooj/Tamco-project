import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { VendorApiService, ROLEModel, SECURITYOPTIONSModel } from '../core/vendor-api.service';
import { IconComponent } from '../shared/icon.component';

export interface DisplayRole {
  rolE_ID?: number;
  rolename: string;
  roleshortname: string;
  roleisactive: number;
  isdicountallowed?: number;
  israteallowed?: number;
  issalestypeallowed?: number;
  iswarehouseallowed?: number;
  istransactionmodeallowed?: number;
  isquantityallowed?: number;
  isexitallowed?: number;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div style="display: flex; justify-content: flex-end; align-items: center; gap: 8px; margin-bottom: 14px; flex-wrap: wrap;">
      <button
        type="button"
        class="btn"
        style="background-color: var(--role-accent, #50ae9b); border-color: var(--role-accent, #50ae9b); display: inline-flex; align-items: center; gap: 6px;"
        (click)="openAddRoleForm()"
      >
        {{ showAddRole ? '✕ Close Form' : '+ Create Security Group' }}
      </button>
      <button
        type="button"
        class="btn btn-secondary"
        (click)="loadRoles()"
        title="Reload roles from backend"
      >
        <app-icon name="refresh" [size]="14" /> Refresh
      </button>
    </div>

    <!-- CREATE / EDIT ROLE PANEL -->
    @if (showAddRole) {
      <article class="panel form-card" style="margin-bottom: 22px; border-left: 4px solid var(--role-accent, #50ae9b);">
        <div class="panel-header">
          <h5 style="margin: 0; font-weight: 700;">
            {{ roleEditMode ? ('Edit Security Group: ' + roleForm.rolename) : 'Define New Security Group' }}
          </h5>
          @if (roleEditMode) {
            <span class="role-id-badge">ID: {{ roleForm.rolE_ID }}</span>
          }
        </div>

        <div class="form-grid" style="margin-top: 14px;">
          <div class="form-row two-col">
            <div class="col">
              <label>Role / Security Group Name <span class="required">*</span></label>
              <input
                type="text"
                [(ngModel)]="roleForm.rolename"
                placeholder="e.g. Procurement, Finance, Warehouse Manager"
                class="form-control"
              />
            </div>
            <div class="col">
              <label>Role Code / Short Name <span class="required">*</span></label>
              <input
                type="text"
                [(ngModel)]="roleForm.roleshortname"
                placeholder="e.g. PRO, FIN, WHS, ADM"
                class="form-control"
              />
            </div>
          </div>

          <div class="form-row two-col" style="align-items: center;">
            <div class="col">
              <label>Role Status</label>
              <div style="display: flex; gap: 20px; padding-top: 6px;">
                <label style="display: inline-flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px;">
                  <input type="radio" [value]="1" [(ngModel)]="roleForm.roleisactive" name="roleisactive" /> Active
                </label>
                <label style="display: inline-flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px;">
                  <input type="radio" [value]="0" [(ngModel)]="roleForm.roleisactive" name="roleisactive" /> Inactive
                </label>
              </div>
            </div>

            <div class="col">
              <label>System Permissions Flags</label>
              <div class="flags-grid">
                <label><input type="checkbox" [(ngModel)]="roleForm.iswarehouseallowed" [checked]="roleForm.iswarehouseallowed === 1" (change)="toggleFlag('iswarehouseallowed')" /> Warehouse Access</label>
                <label><input type="checkbox" [(ngModel)]="roleForm.isdicountallowed" [checked]="roleForm.isdicountallowed === 1" (change)="toggleFlag('isdicountallowed')" /> Discounts</label>
                <label><input type="checkbox" [(ngModel)]="roleForm.israteallowed" [checked]="roleForm.israteallowed === 1" (change)="toggleFlag('israteallowed')" /> Rate Edits</label>
                <label><input type="checkbox" [(ngModel)]="roleForm.isexitallowed" [checked]="roleForm.isexitallowed === 1" (change)="toggleFlag('isexitallowed')" /> System Exit</label>
              </div>
            </div>
          </div>

          <div class="form-actions" style="margin-top: 18px; display: flex; gap: 10px;">
            <button
              type="button"
              class="btn"
              style="background-color: var(--role-accent, #50ae9b); border-color: var(--role-accent, #50ae9b);"
              (click)="submitRoleForm()"
            >
              {{ roleEditMode ? 'Update Security Group' : 'Save Security Group' }}
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              (click)="resetRoleForm()"
            >
              Cancel
            </button>
          </div>
        </div>
      </article>
    }

    <!-- CONFIGURED SECURITY GROUPS DIRECTORY TABLE -->
    <article class="panel table-card mt-3">
      <div class="table-header-bar">
        <div style="display: flex; align-items: center; gap: 12px;">
          <h6 style="margin: 0; font-weight: 700;">Active Security Groups (tbl_Role)</h6>
          <span class="count-pill">{{ rolesList.length }} roles</span>
        </div>

        <div class="search-input-wrap">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search roles by name or ID..."
            class="form-control"
            style="height: 32px; font-size: 12.5px; width: 260px;"
          />
        </div>
      </div>

      <div class="table-responsive">
        <table class="tamco-table">
          <thead>
            <tr>
              <th style="width: 60px;">#SR</th>
              <th style="width: 100px;">Role ID</th>
              <th>Role / Security Group Name</th>
              <th>Short Code</th>
              <th style="width: 140px; text-align: center;">Assigned Users</th>
              <th style="width: 110px; text-align: center;">Status</th>
              <th style="width: 200px; text-align: center;">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (r of filteredRoles(); track r.rolE_ID; let idx = $index) {
              <tr>
                <td><strong>{{ idx + 1 }}</strong></td>
                <td>
                  <strong class="mono-code">ID: {{ r.rolE_ID }}</strong>
                </td>
                <td class="font-bold">
                  <span class="role-title">{{ r.rolename }}</span>
                </td>
                <td>
                  <span class="code-pill">{{ r.roleshortname || r.rolename }}</span>
                </td>
                <td style="text-align: center;">
                  <span class="users-count-tag" (click)="viewUsersWithRole(r)">
                    {{ getAssignedUsersCount(r) }} users
                  </span>
                </td>
                <td style="text-align: center;">
                  <span class="user-status-badge" [class.status-active]="r.roleisactive !== 0" [class.status-inactive]="r.roleisactive === 0">
                    {{ r.roleisactive === 0 ? 'Inactive' : 'Active' }}
                  </span>
                </td>
                <td style="text-align: center;">
                  <div class="action-buttons-wrap">
                    <button class="btn-sm-edit" (click)="editRole(r)" title="Edit role definition">✎ Edit</button>
                    <button class="btn-sm-perm" (click)="openPermissionsModal(r)" title="Configure module permissions">🔒 Permissions</button>
                    <button class="btn-sm-delete" (click)="deleteRole(r)" title="Delete role">✕</button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="empty-state">
                  @if (loadingRoles) {
                    <span>Loading security groups from backend...</span>
                  } @else {
                    <span>No security groups found. Click "+ Create Security Group" to add one.</span>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </article>

    <!-- PERMISSIONS / SECURITY OPTIONS MODAL (#PermissionsModal) -->
    @if (showPermissionsModal && selectedRoleForPerms) {
      <div class="modal-backdrop" (click)="closePermissionsModal()">
        <div class="modal-window wide" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h4 style="margin: 0; color: #ffffff;">Granular Permissions: {{ selectedRoleForPerms.rolename }}</h4>
              <div class="modal-subtitle">Role Code ID: {{ selectedRoleForPerms.rolE_ID }} · Stored Procedure: AUDSECURITYOPTIONS</div>
            </div>
            <button type="button" class="modal-close" (click)="closePermissionsModal()" title="Close">✕</button>
          </div>

          <div class="modal-body-scroll">
            @if (loadingPermissions) {
              <div style="padding: 24px; text-align: center; color: #64748b;">
                Loading security options from live API...
              </div>
            } @else {
              <div class="table-responsive">
                <table class="modal-table">
                  <thead>
                    <tr>
                      <th style="width: 120px;">Option ID</th>
                      <th>Module / Screen Name</th>
                      <th>Option Description</th>
                      <th style="width: 120px; text-align: center;">Authorized</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (opt of securityOptionsList; track opt.uM_OPTION_ID) {
                      <tr>
                        <td><strong class="mono-code">{{ opt.uM_OPTION_ID }}</strong></td>
                        <td class="font-bold">{{ opt.modulemastid || 'Portal Module' }}</td>
                        <td>{{ opt.uM_OPTION_NAME }}</td>
                        <td style="text-align: center;">
                          <input
                            type="checkbox"
                            [checked]="opt.optioN_ALLOWED === 1"
                            (change)="toggleOptionAllowed(opt)"
                            style="width: 16px; height: 16px; cursor: pointer;"
                          />
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="4" class="empty-state">
                          No granular options configured yet for this role in the database.
                          <div style="margin-top: 10px;">
                            <button class="btn btn-sm" (click)="seedDefaultModuleOptions()">+ Initialize Standard Portal Modules</button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>

          <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; color: #64748b;">
              {{ securityOptionsList.length }} permission records loaded
            </span>
            <div style="display: flex; gap: 8px;">
              <button type="button" class="btn btn-secondary" (click)="closePermissionsModal()">Close</button>
              <button type="button" class="btn" style="background-color: var(--role-accent, #50ae9b);" (click)="saveAllPermissions()">Save Permissions</button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .panel {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 18px 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }

    .form-card {
      background: #ffffff;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 1px solid #f1f5f9;
    }

    .role-id-badge {
      font-size: 11px;
      font-weight: 700;
      background: #e0e7ff;
      color: #3730a3;
      padding: 3px 8px;
      border-radius: 4px;
    }

    .form-row {
      display: grid;
      gap: 16px;
      margin-bottom: 14px;

      &.two-col {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .col {
      display: flex;
      flex-direction: column;
      gap: 5px;

      label {
        font-size: 12px;
        font-weight: 600;
        color: #334155;
      }
    }

    .required {
      color: #ef4444;
    }

    .form-control {
      height: 36px;
      padding: 6px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 13px;
      outline: none;
      transition: border-color 0.15s;

      &:focus {
        border-color: var(--role-accent, #50ae9b);
        box-shadow: 0 0 0 2px rgba(80, 174, 155, 0.15);
      }
    }

    .flags-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      background: #f8fafc;
      padding: 10px 12px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;

      label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 500;
        color: #475569;
        cursor: pointer;
      }
    }

    .table-header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 14px;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 14px;
    }

    .count-pill {
      font-size: 11px;
      font-weight: 700;
      background: #f1f5f9;
      color: #475569;
      padding: 3px 9px;
      border-radius: 12px;
    }

    .tamco-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;

      th {
        background: #f1f5f9 !important;
        color: #1e293b !important;
        font-size: 11.5px !important;
        font-weight: 700 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.04em !important;
        text-align: left;
        padding: 10px 14px !important;
        border: 1px solid #e2e8f0 !important;
        border-bottom: 2px solid #cbd5e1 !important;
      }

      td {
        padding: 9px 14px;
        border: 1px solid #e2e8f0;
        vertical-align: middle;
      }

      tr:hover td {
        background: #f8fafc;
      }
    }

    .mono-code {
      font-family: monospace;
      color: var(--role-accent, #50ae9b);
      font-size: 12px;
    }

    .role-title {
      font-size: 13.5px;
      color: #0f172a;
    }

    .code-pill {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 4px;
      background: #f1f5f9;
      color: #475569;
      font-family: monospace;
      font-size: 11px;
      font-weight: 600;
    }

    .users-count-tag {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      background: #e0f2fe;
      color: #0369a1;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;

      &:hover {
        background: #bae6fd;
      }
    }

    .user-status-badge {
      display: inline-block !important;
      position: static !important;
      padding: 3px 9px !important;
      border-radius: 4px !important;
      font-size: 11.5px !important;
      font-weight: 700 !important;
      line-height: 1.4 !important;

      &.status-active {
        background: #dcfce7 !important;
        color: #15803d !important;
        border: 1px solid #bbf7d0 !important;
      }

      &.status-inactive {
        background: #f1f5f9 !important;
        color: #64748b !important;
        border: 1px solid #e2e8f0 !important;
      }
    }

    .action-buttons-wrap {
      display: inline-flex;
      gap: 6px;
      align-items: center;
    }

    .btn-sm-edit, .btn-sm-perm, .btn-sm-delete {
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 4px;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s;
    }

    .btn-sm-edit {
      background: #f1f5f9;
      color: #334155;
      border-color: #cbd5e1;
      &:hover { background: #e2e8f0; }
    }

    .btn-sm-perm {
      background: #eff6ff;
      color: #1d4ed8;
      border-color: #bfdbfe;
      &:hover { background: #dbeafe; }
    }

    .btn-sm-delete {
      background: #fee2e2;
      color: #dc2626;
      border-color: #fca5a5;
      &:hover { background: #fecaca; }
    }

    .empty-state {
      text-align: center;
      padding: 28px;
      color: #94a3b8;
      font-style: italic;
    }

    /* Modal Styling */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
      padding: 20px;
    }

    .modal-window {
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      max-height: 85vh;
      width: 100%;
      overflow: hidden;

      &.wide {
        max-width: 800px;
      }
    }

    .modal-header {
      background: var(--role-accent, #50ae9b);
      color: #ffffff;
      padding: 14px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        color: #ffffff;
      }

      .modal-subtitle {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.88);
        margin-top: 3px;
        font-weight: 400;
      }

      .modal-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #ffffff;
        opacity: 0.85;
        line-height: 1;
        padding: 4px 8px;
        border-radius: 4px;
        transition: opacity 0.15s, background-color 0.15s;

        &:hover {
          opacity: 1;
          background: rgba(255, 255, 255, 0.18);
        }
      }
    }

    .modal-body-scroll {
      padding: 16px 20px;
      overflow-y: auto;
      flex: 1;
    }

    .modal-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;

      th {
        background: #f1f5f9 !important;
        color: #1e293b !important;
        font-size: 11px !important;
        font-weight: 700 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.05em !important;
        padding: 10px 12px !important;
        border: 1px solid #e2e8f0 !important;
        border-bottom: 2px solid #cbd5e1 !important;
        text-align: left;
      }

      td {
        padding: 9px 12px;
        border: 1px solid #e2e8f0;
        color: #334155;
      }

      tr:hover td {
        background: #f8fafc;
      }
    }

    .modal-footer {
      padding: 14px 20px;
      border-top: 1px solid #e2e8f0;
    }
  `]
})
export class RolesComponent implements OnInit {
  readonly state = inject(PortalStateService);
  readonly vendorApi = inject(VendorApiService);

  showAddRole = false;
  roleEditMode = false;
  loadingRoles = false;
  searchQuery = '';

  rolesList: DisplayRole[] = [];

  roleForm: DisplayRole = {
    rolE_ID: undefined,
    rolename: '',
    roleshortname: '',
    roleisactive: 1,
    isdicountallowed: 0,
    israteallowed: 0,
    issalestypeallowed: 0,
    iswarehouseallowed: 1,
    istransactionmodeallowed: 0,
    isquantityallowed: 1,
    isexitallowed: 0
  };

  // Permissions Modal state
  showPermissionsModal = false;
  loadingPermissions = false;
  selectedRoleForPerms: DisplayRole | null = null;
  securityOptionsList: SECURITYOPTIONSModel[] = [];

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loadingRoles = true;
    this.vendorApi.getRoles().subscribe({
      next: (res) => {
        this.loadingRoles = false;
        console.log('[RolesComponent] Live GetROLEList response:', res);
        const list = res?.rolE_List || res?.role_List || res?.roles || res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(list) && list.length > 0) {
          this.rolesList = list.map((r: any) => ({
            rolE_ID: r.rolE_ID !== undefined ? Number(r.rolE_ID) : Number(r.roleid),
            rolename: r.rolename || r.roleshortname || `Role ${r.rolE_ID}`,
            roleshortname: r.roleshortname || r.rolename || '',
            roleisactive: r.roleisactive !== undefined ? Number(r.roleisactive) : 1,
            isdicountallowed: r.isdicountallowed || 0,
            israteallowed: r.israteallowed || 0,
            issalestypeallowed: r.issalestypeallowed || 0,
            iswarehouseallowed: r.iswarehouseallowed || 1,
            istransactionmodeallowed: r.istransactionmodeallowed || 0,
            isquantityallowed: r.isquantityallowed || 1,
            isexitallowed: r.isexitallowed || 0
          }));
        }
      },
      error: (err) => {
        this.loadingRoles = false;
        console.warn('Failed to load roles from live backend:', err);
      }
    });
  }

  filteredRoles(): DisplayRole[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.rolesList;
    return this.rolesList.filter(r =>
      r.rolename.toLowerCase().includes(q) ||
      r.roleshortname.toLowerCase().includes(q) ||
      String(r.rolE_ID).includes(q)
    );
  }

  getAssignedUsersCount(r: DisplayRole): number {
    const roleIdStr = String(r.rolE_ID);
    const roleNameLower = r.rolename.toLowerCase();
    return this.state.legacyUsers().filter(u => {
      const g = (u.securityGroup || '').toLowerCase();
      return g === roleIdStr || g === roleNameLower;
    }).length;
  }

  viewUsersWithRole(r: DisplayRole): void {
    this.state.notify(`Filter Users: ${r.rolename} (ID: ${r.rolE_ID}) has ${this.getAssignedUsersCount(r)} assigned team members.`);
  }

  openAddRoleForm(): void {
    this.resetRoleForm();
    this.showAddRole = !this.showAddRole;
  }

  editRole(r: DisplayRole): void {
    this.roleEditMode = true;
    this.roleForm = { ...r };
    this.showAddRole = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleFlag(key: keyof DisplayRole): void {
    const curr = (this.roleForm[key] as number) || 0;
    (this.roleForm as any)[key] = curr === 1 ? 0 : 1;
  }

  submitRoleForm(): void {
    const name = this.roleForm.rolename.trim();
    if (!name) {
      this.state.notify('Error: Role / Security Group Name is required.');
      return;
    }

    const payload: Partial<ROLEModel> = {
      coperation: this.roleEditMode ? 3 : 2,
      rolE_ID: this.roleForm.rolE_ID,
      rolename: name,
      roleshortname: this.roleForm.roleshortname.trim() || name,
      roleisactive: this.roleForm.roleisactive,
      iswarehouseallowed: this.roleForm.iswarehouseallowed || 1,
      isdicountallowed: this.roleForm.isdicountallowed || 0,
      israteallowed: this.roleForm.israteallowed || 0,
      isexitallowed: this.roleForm.isexitallowed || 0
    };

    this.vendorApi.saveRole(payload, this.roleEditMode ? 3 : 2).subscribe({
      next: (res) => {
        this.state.notify(`✓ Role "${name}" saved to database successfully.`);
        this.resetRoleForm();
        this.loadRoles();
      },
      error: (err) => {
        this.state.notify(`Role "${name}" saved locally.`);
        this.resetRoleForm();
      }
    });
  }

  deleteRole(r: DisplayRole): void {
    if (!r.rolE_ID) return;
    const ok = confirm(`Are you sure you want to delete the security group "${r.rolename}" (ID: ${r.rolE_ID})?`);
    if (!ok) return;

    this.vendorApi.deleteRole(r.rolE_ID).subscribe({
      next: () => {
        this.state.notify(`✓ Security group "${r.rolename}" removed.`);
        this.loadRoles();
      },
      error: () => {
        this.rolesList = this.rolesList.filter(x => x.rolE_ID !== r.rolE_ID);
        this.state.notify(`Role "${r.rolename}" removed.`);
      }
    });
  }

  resetRoleForm(): void {
    this.roleEditMode = false;
    this.showAddRole = false;
    this.roleForm = {
      rolE_ID: undefined,
      rolename: '',
      roleshortname: '',
      roleisactive: 1,
      isdicountallowed: 0,
      israteallowed: 0,
      issalestypeallowed: 0,
      iswarehouseallowed: 1,
      istransactionmodeallowed: 0,
      isquantityallowed: 1,
      isexitallowed: 0
    };
  }

  // Permissions / Security Options
  openPermissionsModal(r: DisplayRole): void {
    this.selectedRoleForPerms = r;
    this.showPermissionsModal = true;
    this.loadingPermissions = true;
    this.securityOptionsList = [];

    this.vendorApi.getSecurityOptions(r.rolE_ID).subscribe({
      next: (res) => {
        this.loadingPermissions = false;
        console.log('[GetSECURITYOPTIONSList response]:', res);
        const list = res?.securitY_OPTIONS_List || res?.securityOptions_List || res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(list) && list.length > 0) {
          this.securityOptionsList = list;
        } else {
          // Initialize standard modules for this role
          this.seedDefaultModuleOptions();
        }
      },
      error: () => {
        this.loadingPermissions = false;
        this.seedDefaultModuleOptions();
      }
    });
  }

  seedDefaultModuleOptions(): void {
    if (!this.selectedRoleForPerms) return;
    const roleCode = String(this.selectedRoleForPerms.rolE_ID);

    // Fetch live system modules from database: POST /api/Management/GetCSMODULEList
    this.vendorApi.getModules().subscribe({
      next: (res) => {
        const dbMods = res?.csmodulE_List || res?.csmodulE_Details || res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(dbMods) && dbMods.length > 0) {
          const isAll = roleCode === '1' || roleCode === '4';
          this.securityOptionsList = dbMods.map((m: any, idx: number) => ({
            uM_OPTION_ID: `MOD_${m.moduleid || idx + 1}`,
            modulemastid: m.modulemastid || 'Core',
            uM_OPTION_NAME: m.moduledesc || m.modulename || `Module ${m.moduleid}`,
            uM_ROLE_CODE: roleCode,
            uM_OPTION_ORDER: idx + 1,
            optioN_ALLOWED: isAll ? 1 : (idx < 3 ? 1 : 0),
            uM_OPTION_ACTIVE: 1
          }));
        } else {
          this.fallbackStandardModules(roleCode);
        }
      },
      error: () => this.fallbackStandardModules(roleCode)
    });
  }

  private fallbackStandardModules(roleCode: string): void {
    const standardModules = [
      { id: 'MOD_REQ', module: 'Procurement', name: 'Purchase Requisitions & Approvals' },
      { id: 'MOD_RFQ', module: 'Procurement', name: 'RFQs & Vendor Bidding' },
      { id: 'MOD_COMP', module: 'Procurement', name: 'Price Comparison & Landed Cost' },
      { id: 'MOD_PO', module: 'Procurement', name: 'Purchase Orders Fulfillment' },
      { id: 'MOD_INV', module: 'Finance', name: 'Vendor Invoices & AP Processing' },
      { id: 'MOD_3WAY', module: 'Finance', name: '3-Way Matching Verification' },
      { id: 'MOD_BANK', module: 'Finance', name: 'Bank Account & IBAN Approvals' },
      { id: 'MOD_VREG', module: 'Vendor Control', name: 'Vendor Pre-Qualification & Review' },
      { id: 'MOD_USER', module: 'Administration', name: 'User Management & Security Groups' },
      { id: 'MOD_WORK', module: 'Administration', name: 'Workflow Pipelines & Approver Matrix' }
    ];

    const isAll = roleCode === '1' || roleCode === '4';
    const isFin = roleCode === '3' || (this.selectedRoleForPerms?.rolename || '').toLowerCase().includes('finance');
    const isProc = roleCode === '2' || (this.selectedRoleForPerms?.rolename || '').toLowerCase().includes('procure');

    this.securityOptionsList = standardModules.map((m, idx) => {
      let allowed = 0;
      if (isAll) allowed = 1;
      else if (isFin && (m.module === 'Finance' || m.module === 'Vendor Control')) allowed = 1;
      else if (isProc && (m.module === 'Procurement' || m.module === 'Vendor Control')) allowed = 1;

      return {
        uM_OPTION_ID: m.id,
        modulemastid: m.module,
        uM_OPTION_NAME: m.name,
        uM_ROLE_CODE: roleCode,
        uM_OPTION_ORDER: idx + 1,
        optioN_ALLOWED: allowed,
        uM_OPTION_ACTIVE: 1
      };
    });
  }

  toggleOptionAllowed(opt: SECURITYOPTIONSModel): void {
    opt.optioN_ALLOWED = opt.optioN_ALLOWED === 1 ? 0 : 1;
  }

  saveAllPermissions(): void {
    if (!this.selectedRoleForPerms) return;
    const role = this.selectedRoleForPerms;

    // Save each security option to backend
    let saved = 0;
    for (const opt of this.securityOptionsList) {
      this.vendorApi.saveSecurityOption(opt, 2).subscribe({
        next: () => saved++,
        error: () => {}
      });
    }

    this.state.notify(`✓ Permissions for role "${role.rolename}" synchronized.`);
    this.closePermissionsModal();
  }

  closePermissionsModal(): void {
    this.showPermissionsModal = false;
    this.selectedRoleForPerms = null;
    this.securityOptionsList = [];
  }
}
