import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent } from '../shared/ui.component';
import { IconComponent } from '../shared/icon.component';
import { LegacyUserItem, DepartmentItem } from '../core/models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeadingComponent, IconComponent],
  template: `
    <app-page-heading
      eyebrow="Setup & Administration"
      title="User Management (/Setup/Users)"
      subtitle="Provision internal team members, set security groups, configure contact details, and assign departmental roles."
    >
      <div class="heading-actions">
        <button
          type="button"
          class="btn"
          style="background-color: var(--role-accent, #50ae9b); border-color: var(--role-accent, #50ae9b); display: inline-flex; align-items: center; gap: 6px;"
          (click)="resetUserForm()"
        >
          + New User Record
        </button>
      </div>
    </app-page-heading>

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
                placeholder="Enter Password"
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
            <select [(ngModel)]="userForm.country" class="form-control form-select">
              <option value="United Arab Emirates">United Arab Emirates</option>
              <option value="Saudi Arabia">Saudi Arabia</option>
              <option value="Qatar">Qatar</option>
              <option value="Oman">Oman</option>
              <option value="Bahrain">Bahrain</option>
            </select>
          </div>

          <div class="col">
            <label>City</label>
            <select [(ngModel)]="userForm.city" class="form-control form-select">
              <option value="Dubai">Dubai</option>
              <option value="Abu Dhabi">Abu Dhabi</option>
              <option value="Sharjah">Sharjah</option>
              <option value="Ajman">Ajman</option>
              <option value="Ras Al Khaimah">Ras Al Khaimah</option>
            </select>
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
            <select [(ngModel)]="userForm.securityGroup" class="form-control form-select">
              <option value="Admin">Admin (Full System Master)</option>
              <option value="Procurement">Procurement (Buyers & Sourcing)</option>
              <option value="Finance">Finance (Accounts Payable & Banks)</option>
              <option value="Vendor">Vendor (External Partner)</option>
            </select>
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
            style="background-color: #007bff; border-color: #007bff; color: white; padding: 9px 24px;"
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
                <td><span class="badge-role">{{ u.securityGroup }}</span></td>
                <td style="text-align: center;">
                  <span class="badge" [class.badge-yes]="u.status === 'Active'" [class.badge-no]="u.status !== 'Active'">
                    {{ u.status }}
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
                    <td>{{ u.securityGroup }}</td>
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
      overflow: hidden;
    }

    .main-heading-banner {
      background-color: var(--role-accent, #50ae9b);
      color: #ffffff;
      padding: 9px 16px;
      text-align: center;
      width: 100%;

      h5 {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
        letter-spacing: 0.02em;
      }
    }

    .form-body {
      padding: 20px 22px;
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
      display: flex;
      width: 100%;

      input {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }

      .btn-attached {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        border: none;
        color: white;
        cursor: pointer;
        transition: opacity 0.2s;

        &:hover { opacity: 0.9; }

        &.refresh-btn {
          border-top-right-radius: 5px;
          border-bottom-right-radius: 5px;
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

    .badge {
      display: inline-block;
      padding: 3px 9px;
      border-radius: 4px;
      font-size: 11.5px;
      font-weight: 700;

      &.badge-yes {
        background: #dcfce7;
        color: #15803d;
      }

      &.badge-no {
        background: #f1f5f9;
        color: #64748b;
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

  userEditMode = false;
  editingUserId = '';
  showPassword = false;
  searchQuery = '';

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
    securityGroup: 'Procurement',
    status: 'Active'
  };

  showUserModal = false;
  showDeptModal = false;

  ngOnInit(): void {}

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
    this.resetUserForm();
  }

  editUser(u: LegacyUserItem): void {
    this.userEditMode = true;
    this.editingUserId = u.id;
    this.userForm = {
      userId: u.userId,
      firstName: u.firstName,
      lastName: u.lastName,
      password: u.password || '••••••••',
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
      securityGroup: 'Procurement',
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
