import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { VendorApiService, USERModel } from '../core/vendor-api.service';
import { IconComponent } from '../shared/icon.component';
import { CustomSelectComponent } from '../shared/custom-select.component';
import { LegacyUserItem, DepartmentItem } from '../core/models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, CustomSelectComponent],
  template: `
    <div style="display: flex; justify-content: flex-end; margin-bottom: 14px;">
      <button
        type="button"
        class="btn"
        style="background-color: var(--role-accent, #50ae9b); border-color: var(--role-accent, #50ae9b); display: inline-flex; align-items: center; gap: 6px;"
        (click)="resetUserForm()"
      >
        + New User Record
      </button>
    </div>

    <!-- USERS DETAILS CARD (Matches Screenshot media_1790932261121.jpg & /Setup/Users) -->
    <article class="panel main-card">
      <div class="main-heading-banner">
        <h5>Users Details</h5>
      </div>

      <div class="form-body">
        <!-- Row 1: User ID, First Name, Last Name, Password -->
        <div class="form-row four-col">
          <div class="col">
            <label>User ID <span class="required">*</span></label>
            <div class="input-with-actions">
              <input
                type="text"
                [(ngModel)]="userForm.userId"
                placeholder="Enter User ID"
                class="form-control"
              />
              <button
                type="button"
                class="btn-attached search-btn"
                style="background-color: var(--role-accent, #50ae9b);"
                (click)="showUserModal = true"
                title="Search existing users"
              >
                <app-icon name="search" [size]="15" />
              </button>
              <button
                type="button"
                class="btn-attached refresh-btn"
                style="background-color: deepskyblue;"
                (click)="resetUserForm()"
                title="Reset Form"
              >
                <app-icon name="refresh" [size]="15" />
              </button>
            </div>
          </div>

          <div class="col">
            <label>First Name <span class="required">*</span></label>
            <input
              type="text"
              [(ngModel)]="userForm.firstName"
              placeholder="Enter First Name"
              class="form-control"
            />
          </div>

          <div class="col">
            <label>Last Name</label>
            <input
              type="text"
              [(ngModel)]="userForm.lastName"
              placeholder="Enter Last Name"
              class="form-control"
            />
          </div>

          <div class="col">
            <label>Password <span class="required">*</span></label>
            <div class="input-with-actions">
              <input
                [type]="showPassword ? 'text' : 'password'"
                [(ngModel)]="userForm.password"
                [placeholder]="userEditMode ? 'Leave blank to keep existing password' : 'Enter Password'"
                class="form-control"
              />
              <button
                type="button"
                class="btn-attached"
                style="background-color: #64748b;"
                (click)="showPassword = !showPassword"
                title="Toggle password visibility"
              >
                <span>{{ showPassword ? '🙈' : '👁️' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Row 2: Country, City, Phone No, Cell No -->
        <div class="form-row four-col">
          <div class="col">
            <label>Country</label>
            <app-custom-select
              [(ngModel)]="userForm.country"
              [options]="countryOptions"
              placeholder="Select Country"
            />
          </div>

          <div class="col">
            <label>City</label>
            <app-custom-select
              [(ngModel)]="userForm.city"
              [options]="cityOptions"
              placeholder="Select City"
            />
          </div>

          <div class="col">
            <label>Phone No</label>
            <input
              type="text"
              [(ngModel)]="userForm.phoneNo"
              placeholder="Enter Phone No"
              class="form-control"
            />
          </div>

          <div class="col">
            <label>Cell No</label>
            <input
              type="text"
              [(ngModel)]="userForm.cellNo"
              placeholder="Enter Cell No"
              class="form-control"
            />
          </div>
        </div>

        <!-- Row 3: Department, Designation, Email Address -->
        <div class="form-row three-col">
          <div class="col" style="flex: 1.2;">
            <label>Department <span class="required">*</span></label>
            <div class="input-with-actions">
              <input
                type="text"
                [(ngModel)]="userForm.department"
                placeholder="Enter Department"
                class="form-control"
              />
              <button
                type="button"
                class="btn-attached search-btn"
                style="background-color: var(--role-accent, #50ae9b);"
                (click)="showDeptModal = true"
                title="Lookup departments"
              >
                <app-icon name="search" [size]="15" />
              </button>
            </div>
          </div>

          <div class="col" style="flex: 1.2;">
            <label>Designation <span class="required">*</span></label>
            <input
              type="text"
              [(ngModel)]="userForm.designation"
              placeholder="Enter Designation"
              class="form-control"
            />
          </div>

          <div class="col" style="flex: 1.6;">
            <label>Email Address <span class="required">*</span></label>
            <input
              type="email"
              [(ngModel)]="userForm.email"
              placeholder="Enter Email Address"
              class="form-control"
            />
          </div>
        </div>

        <!-- Row 4: Security Group, Status -->
        <div class="form-row two-col" style="align-items: center;">
          <div class="col">
            <label>Security Group</label>
            <app-custom-select
              [(ngModel)]="userForm.securityGroup"
              [options]="rolesList"
              placeholder="Select Security Group"
            />
          </div>

          <div class="col">
            <label>Status</label>
            <div style="display: flex; gap: 24px; padding-top: 6px;">
              <label style="display: inline-flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13.5px;">
                <input type="radio" name="usrStatus" value="Active" [(ngModel)]="userForm.status" />
                <span style="font-weight: 600; color: #166534;">Active</span>
              </label>
              <label style="display: inline-flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13.5px;">
                <input type="radio" name="usrStatus" value="Inactive" [(ngModel)]="userForm.status" />
                <span style="font-weight: 600; color: #991b1b;">Inactive</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Submit Buttons -->
        <div class="btn-actions-row">
          <button
            type="button"
            class="btn btn-primary"
            style="background-color: var(--role-accent, #50ae9b); border-color: var(--role-accent, #50ae9b); color: white; padding: 9px 24px; font-weight: 600;"
            (click)="submitUserForm()"
          >
            {{ userEditMode ? 'Update' : 'Submit' }}
          </button>
          @if (userEditMode) {
            <button
              type="button"
              class="btn btn-secondary"
              (click)="resetUserForm()"
            >
              Cancel Edit
            </button>
          }
        </div>
      </div>
    </article>

    <!-- CONFIGURED USERS TABLE -->
    <article class="panel table-card mt-3" style="margin-top: 22px;">
      <div class="table-header-bar">
        <div style="display: flex; align-items: center; gap: 12px;">
          <h6 style="margin: 0; font-weight: 700;">Configured Users Directory</h6>
          <span class="count-pill">{{ filteredUsers().length }} users</span>
        </div>

        <div class="search-input-wrap">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search users by name, ID, email or role..."
            class="form-control"
            style="height: 32px; font-size: 12.5px; width: 280px;"
          />
        </div>
      </div>

      <div class="table-responsive">
        <table class="tamco-table">
          <thead>
            <tr>
              <th style="width: 60px;">#SR</th>
              <th style="width: 120px;">User ID</th>
              <th>Full Name</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Email Address</th>
              <th style="width: 130px;">Security Group</th>
              <th style="width: 100px; text-align: center;">Status</th>
              <th style="width: 140px; text-align: center;">Action</th>
            </tr>
          </thead>
          <tbody>
            @for (u of filteredUsers(); track u.id; let idx = $index) {
              <tr>
                <td><strong>{{ idx + 1 }}</strong></td>
                <td><strong class="mono-code">{{ u.userId }}</strong></td>
                <td class="font-bold">{{ u.firstName }} {{ u.lastName }}</td>
                <td>{{ u.department }}</td>
                <td>{{ u.designation }}</td>
                <td class="mono-email">{{ u.email }}</td>
                <td><span class="badge-role">{{ getRoleLabel(u.securityGroup) }}</span></td>
                <td style="text-align: center;">
                  <span class="user-status-badge" [class.status-active]="(u.status || 'Active') === 'Active'" [class.status-inactive]="u.status === 'Inactive'">
                    {{ u.status || 'Active' }}
                  </span>
                </td>
                <td style="text-align: center;">
                  <div class="action-buttons-wrap">
                    <button class="btn-sm-edit" (click)="editUser(u)" title="Edit user">✎ Edit</button>
                    <button class="btn-sm-delete" (click)="deleteUser(u.id)" title="Delete user">✕</button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="9" class="empty-state">No users match the search filter.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </article>

    <!-- USER SEARCH MODAL (#UserSearchModal) -->
    @if (showUserModal) {
      <div class="modal-backdrop" (click)="showUserModal = false">
        <div class="modal-window wide" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h4>User Directory Lookup</h4>
            <button type="button" class="modal-close" (click)="showUserModal = false">✕</button>
          </div>
          <div class="modal-body-scroll">
            <table class="modal-table">
              <thead>
                <tr>
                  <th style="width: 120px;">User ID</th>
                  <th>Full Name</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Security Group</th>
                </tr>
              </thead>
              <tbody>
                @for (u of state.legacyUsers(); track u.id) {
                  <tr (click)="selectUserFromModal(u)" class="clickable-row">
                    <td><strong class="mono-code">{{ u.userId }}</strong></td>
                    <td>{{ u.firstName }} {{ u.lastName }}</td>
                    <td>{{ u.department }}</td>
                    <td>{{ u.designation }}</td>
                    <td>{{ getRoleLabel(u.securityGroup) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn secondary" (click)="showUserModal = false">Close</button>
          </div>
        </div>
      </div>
    }

    <!-- DEPARTMENT SEARCH MODAL (#DeptModal) -->
    @if (showDeptModal) {
      <div class="modal-backdrop" (click)="showDeptModal = false">
        <div class="modal-window" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h4>Department List</h4>
            <button type="button" class="modal-close" (click)="showDeptModal = false">✕</button>
          </div>
          <div class="modal-body-scroll">
            <table class="modal-table">
              <thead>
                <tr>
                  <th style="width: 140px;">Department ID</th>
                  <th>Department Name</th>
                </tr>
              </thead>
              <tbody>
                @for (dept of state.departments(); track dept.id) {
                  <tr (click)="selectDeptFromModal(dept)" class="clickable-row">
                    <td><strong class="mono-code">{{ dept.deptId }}</strong></td>
                    <td>{{ dept.deptName }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn secondary" (click)="showDeptModal = false">Close</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .panel {
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
      overflow: visible !important;

      &.table-card {
        overflow: hidden !important;
      }
    }

    .main-heading-banner {
      background-color: var(--role-accent, #50ae9b);
      color: #ffffff;
      padding: 9px 16px;
      text-align: center;
      width: 100%;
      border-top-left-radius: 7px;
      border-top-right-radius: 7px;

      h5 {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
        letter-spacing: 0.02em;
      }
    }

    .form-body {
      padding: 20px 22px;
      overflow: visible !important;
    }

    .form-row {
      display: flex;
      gap: 18px;
      margin-bottom: 16px;

      &.two-col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        @media (max-width: 768px) { grid-template-columns: 1fr; }
      }

      &.three-col {
        display: flex;
        @media (max-width: 768px) { flex-direction: column; }
      }

      &.four-col {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        @media (max-width: 992px) { grid-template-columns: repeat(2, 1fr); }
        @media (max-width: 576px) { grid-template-columns: 1fr; }
      }

      label {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: #0f172a;
        margin-bottom: 6px;

        .required { color: #dc2626; }
      }
    }

    .form-control {
      width: 100%;
      height: 38px;
      padding: 6px 12px;
      font-size: 13.5px;
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      outline: none;
      box-sizing: border-box;

      &:focus {
        border-color: var(--role-accent, #50ae9b);
        box-shadow: 0 0 0 2px var(--role-glow, rgba(80, 174, 155, 0.2));
      }

      &.form-select {
        background-color: white;
        cursor: pointer;
      }
    }

    .input-with-actions {
      display: flex !important;
      align-items: stretch !important;
      width: 100%;
      height: 38px !important;
      border: 1px solid #cbd5e1 !important;
      border-radius: 6px !important;
      background: #ffffff !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;

      &:focus-within {
        border-color: var(--role-accent, #50ae9b) !important;
        box-shadow: 0 0 0 2px var(--role-glow, rgba(80, 174, 155, 0.2)) !important;
      }

      input,
      .form-control {
        flex: 1 1 auto !important;
        min-width: 0 !important;
        height: 100% !important;
        border: none !important;
        border-radius: 0 !important;
        outline: none !important;
        box-shadow: none !important;
        background: transparent !important;
        padding: 0 12px !important;
        margin: 0 !important;
        box-sizing: border-box !important;
        font-size: 13.5px;
        color: #0f172a;
      }

      .btn-attached {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        flex: 0 0 auto !important;
        width: 38px !important;
        min-width: 38px !important;
        height: 100% !important;
        min-height: 100% !important;
        max-height: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
        border: none !important;
        border-radius: 0 !important;
        color: white;
        cursor: pointer;
        box-sizing: border-box !important;
        vertical-align: middle;
        transition: opacity 0.2s;

        &:hover { opacity: 0.9; }

        &:focus-visible {
          outline: 2px solid var(--role-accent, #50ae9b);
          outline-offset: -2px;
        }
      }
    }

    .btn-actions-row {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 18px;
    }

    .table-header-bar {
      padding: 12px 18px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h6 {
        margin: 0;
        font-size: 14px;
        font-weight: 700;
        color: #1e293b;
      }

      .count-pill {
        font-size: 12px;
        font-weight: 600;
        padding: 3px 10px;
        background: #e2e8f0;
        color: #334155;
        border-radius: 20px;
      }
    }

    .tamco-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;

      th {
        background: #f1f5f9;
        color: #334155;
        font-weight: 700;
        text-align: left;
        padding: 10px 14px;
        border: 1px solid #e2e8f0;
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
      font-size: 13px;
    }

    .mono-email {
      font-family: monospace;
      font-size: 12px;
      color: #475569;
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

    .badge-role {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      background: #e0e7ff;
      color: #3730a3;
      font-size: 11.5px;
      font-weight: 700;
    }

    .action-buttons-wrap {
      display: inline-flex;
      gap: 6px;
      align-items: center;
    }

    .btn-sm-edit {
      background: #0284c7;
      color: white;
      border: none;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 4px;
      cursor: pointer;

      &:hover { background: #0369a1; }
    }

    .btn-sm-delete {
      background: #ef4444;
      color: white;
      border: none;
      padding: 4px 8px;
      font-size: 12px;
      font-weight: 700;
      border-radius: 4px;
      cursor: pointer;

      &:hover { background: #dc2626; }
    }

    /* Modal Styles */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      z-index: 1000;
      display: grid;
      place-items: center;
      padding: 20px;
    }

    .modal-window {
      background: #ffffff;
      border-radius: 8px;
      width: min(700px, 95%);
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
      overflow: hidden;

      &.wide { width: min(850px, 95%); }

      .modal-header {
        background: var(--role-accent, #50ae9b);
        color: white;
        padding: 12px 18px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        h4 { margin: 0; font-size: 16px; font-weight: 700; }
        .modal-close { background: none; border: none; color: white; font-size: 18px; cursor: pointer; }
      }

      .modal-body-scroll {
        padding: 16px 20px;
        overflow-y: auto;
        max-height: 55vh;
      }

      .modal-footer {
        padding: 12px 18px;
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
        display: flex;
        justify-content: flex-end;
      }
    }

    .modal-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;

      th {
        background: #f1f5f9;
        padding: 8px 12px;
        text-align: left;
        border: 1px solid #e2e8f0;
      }

      td {
        padding: 8px 12px;
        border: 1px solid #e2e8f0;
      }

      tr.clickable-row {
        cursor: pointer;
        &:hover td { background: #eff6ff; }
      }
    }

    .empty-state {
      text-align: center;
      color: #94a3b8;
      padding: 24px;
      font-style: italic;
    }
  `]
})
export class UsersComponent implements OnInit {
  readonly state = inject(PortalStateService);
  readonly vendorApi = inject(VendorApiService);

  userEditMode = false;
  editingUserId = '';
  showPassword = false;
  searchQuery = '';

  countryOptions = ['United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Oman', 'Bahrain'];
  cityOptions = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'];

  rolesList = [
    { label: 'Admin', value: '1' },
    { label: 'Manager', value: '4' },
    { label: 'Editor', value: '2' },
    { label: 'Viewer', value: '3' }
  ];

  getRoleLabel(role: string): string {
    if (!role) return 'Unassigned';
    const match = this.rolesList.find(x => String(x.value).toLowerCase() === String(role).toLowerCase() || x.label.toLowerCase() === String(role).toLowerCase());
    if (match) return match.label;
    if (role === '1') return 'Admin';
    if (role === '2') return 'Editor';
    if (role === '3') return 'Viewer';
    if (role === '4') return 'Manager';
    return role;
  }

  userForm: {
    userId: string;
    firstName: string;
    lastName: string;
    password?: string;
    country: string;
    city: string;
    phoneNo: string;
    cellNo: string;
    department: string;
    designation: string;
    email: string;
    securityGroup: string;
    status: 'Active' | 'Inactive';
  } = {
    userId: '',
    firstName: '',
    lastName: '',
    password: '',
    country: 'United Arab Emirates',
    city: 'Dubai',
    phoneNo: '',
    cellNo: '',
    department: 'Procurement & Sourcing',
    designation: 'Senior Sourcing Buyer',
    email: '',
    securityGroup: '1',
    status: 'Active'
  };

  showUserModal = false;
  showDeptModal = false;

  ngOnInit(): void {
    this.loadBackendData();
  }

  loadBackendData(): void {
    // 1. Fetch live user accounts from backend
    this.vendorApi.getUsers().subscribe({
      next: (res) => {
        console.log('[GetUSERList live response]:', res);
        const list = res?.useR_List || res?.user_List || res?.userList || res?.users || res?.data || (Array.isArray(res) ? res : null);
        console.log('[GetUSERList parsed list]:', list);
        if (Array.isArray(list) && list.length > 0) {
          const liveUsers: LegacyUserItem[] = list.map((u: any, idx: number) => {
            const uid = u.userid || u.useR_ID || u.userID || u.userId || `USER_${idx + 1}`;
            const status: 'Active' | 'Inactive' = (u.isactive === 0 || u.isActive === 0) ? 'Inactive' : 'Active';
            return {
              id: `usr_${uid}`,
              userId: uid,
              firstName: u.fname || u.firstName || uid,
              lastName: u.lname || u.lastName || '',
              password: u.userpwd || u.password || '',
              country: u.country || 'United Arab Emirates',
              city: u.city || 'Dubai',
              phoneNo: u.phone || u.contactno || '',
              cellNo: u.contactno || u.phone || '',
              department: u.deptid || u.department || 'Procurement & Sourcing',
              designation: u.desid || u.designation || 'Staff',
              email: u.email || `${uid.toLowerCase()}@tamco.ae`,
              securityGroup: u.securitygroup || u.securityGroup || 'Procurement',
              status
            };
          });

          // Merge with any local users to ensure no data is lost
          const existingList = this.state.legacyUsers();
          const merged = [...liveUsers];
          for (const localUser of existingList) {
            if (!merged.some(x => x.userId.toLowerCase() === localUser.userId.toLowerCase())) {
              merged.push(localUser);
            }
          }
          this.state.legacyUsers.set(merged);
        }
      },
      error: (err) => console.warn('[GetUSERList error]:', err)
    });

    // 2. Fetch live roles / security groups from GetROLEList API
    this.vendorApi.getRoles().subscribe({
      next: (res) => {
        console.log('[GetROLEList live response]:', res);
        const list = res?.rolE_List || res?.role_List || res?.roles || res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(list) && list.length > 0) {
          const liveRoles = list.map((r: any) => ({
            label: r.rolename || r.roleshortname || `Role ${r.rolE_ID}`,
            value: String(r.rolE_ID !== undefined ? r.rolE_ID : r.rolename)
          }));
          if (liveRoles.length > 0) {
            this.rolesList = liveRoles;
          }
        }
      },
      error: (err) => console.warn('[GetROLEList error]:', err)
    });

    // 3. Fetch departments
    this.vendorApi.getDepartments().subscribe(res => {
      const list = res?.department_List || res?.data || (Array.isArray(res) ? res : null);
      if (Array.isArray(list) && list.length > 0) {
        for (const d of list) {
          const did = d.deP_ID || '';
          const dname = d.deP_NAME || did;
          if (!dname) continue;
          const existing = this.state.departments().find(x => x.deptId === did || x.deptName.toLowerCase() === dname.toLowerCase());
          if (!existing) {
            this.state.departments.update(prev => [...prev, { id: `dep-${did || Date.now()}`, deptId: did, deptName: dname }]);
          }
        }
      }
    });
  }

  filteredUsers(): LegacyUserItem[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.state.legacyUsers();
    return this.state.legacyUsers().filter(u =>
      u.userId.toLowerCase().includes(q) ||
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q) ||
      u.securityGroup.toLowerCase().includes(q)
    );
  }

  submitUserForm(): void {
    if (!this.userForm.userId.trim() || !this.userForm.firstName.trim() || !this.userForm.email.trim()) {
      this.state.notify('Error: User ID, First Name, and Email Address are required.');
      return;
    }
    if (!this.userEditMode && !this.userForm.password?.trim()) {
      this.state.notify('Error: Password is required for new user.');
      return;
    }

    const usr: LegacyUserItem = {
      id: this.userEditMode && this.editingUserId ? this.editingUserId : `usr_${Date.now()}`,
      userId: this.userForm.userId.trim(),
      firstName: this.userForm.firstName.trim(),
      lastName: this.userForm.lastName.trim(),
      password: this.userForm.password,
      country: this.userForm.country,
      city: this.userForm.city,
      phoneNo: this.userForm.phoneNo,
      cellNo: this.userForm.cellNo,
      department: this.userForm.department,
      designation: this.userForm.designation,
      email: this.userForm.email.trim(),
      securityGroup: this.userForm.securityGroup,
      status: this.userForm.status
    };

    this.state.saveLegacyUser(usr);

    // Sync to live backend API: AUDUSER
    const payload: Partial<USERModel> = {
      coperation: this.userEditMode ? 3 : 2,
      userid: this.userForm.userId.trim(),
      fname: this.userForm.firstName.trim(),
      lname: this.userForm.lastName.trim(),
      userpwd: this.userForm.password && !this.userForm.password.includes('•') ? this.userForm.password.trim() : (this.userEditMode ? undefined : this.userForm.password?.trim()),
      email: this.userForm.email.trim(),
      contactno: this.userForm.cellNo || this.userForm.phoneNo,
      phone: this.userForm.phoneNo,
      gender: 'Male',
      country: this.userForm.country,
      city: this.userForm.city,
      deptid: this.userForm.department,
      desid: this.userForm.designation,
      securitygroup: this.userForm.securityGroup,
      isactive: this.userForm.status === 'Active' ? 1 : 0
    };

    this.vendorApi.saveUser(payload, this.userEditMode ? 3 : 2).subscribe({
      next: () => {
        this.state.notify(`✓ Backend: User record ${this.userForm.userId} synchronized.`);
        setTimeout(() => this.loadBackendData(), 400);
      },
      error: () => this.state.notify(`User record ${this.userForm.userId} saved locally.`)
    });

    this.resetUserForm();
  }

  editUser(u: LegacyUserItem): void {
    this.userEditMode = true;
    this.editingUserId = u.id;
    this.userForm = {
      userId: u.userId,
      firstName: u.firstName,
      lastName: u.lastName,
      password: '',
      country: u.country,
      city: u.city,
      phoneNo: u.phoneNo,
      cellNo: u.cellNo,
      department: u.department,
      designation: u.designation,
      email: u.email,
      securityGroup: u.securityGroup,
      status: u.status
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteUser(id: string): void {
    const item = this.state.legacyUsers().find(x => x.id === id);
    if (item) {
      this.vendorApi.deleteUser(item.userId).subscribe({
        next: () => this.state.notify(`✓ Backend: User ${item.userId} deleted.`),
        error: () => console.warn('User deletion local fallback')
      });
    }

    this.state.deleteLegacyUser(id);
    if (this.editingUserId === id) this.resetUserForm();
  }

  resetUserForm(): void {
    this.userEditMode = false;
    this.editingUserId = '';
    this.userForm = {
      userId: '',
      firstName: '',
      lastName: '',
      password: '',
      country: 'United Arab Emirates',
      city: 'Dubai',
      phoneNo: '',
      cellNo: '',
      department: 'Procurement & Sourcing',
      designation: 'Senior Sourcing Buyer',
      email: '',
      securityGroup: '1',
      status: 'Active'
    };
  }

  selectUserFromModal(u: LegacyUserItem): void {
    this.editUser(u);
    this.showUserModal = false;
  }

  selectDeptFromModal(dept: DepartmentItem): void {
    this.userForm.department = dept.deptName;
    this.showDeptModal = false;
  }
}
