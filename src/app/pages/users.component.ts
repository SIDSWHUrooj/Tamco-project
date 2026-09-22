import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';
import { IconComponent } from '../shared/icon.component';
import { CustomSelectComponent } from '../shared/custom-select.component';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  department: string;
  status: 'Active' | 'Locked' | 'Pending Invite';
  lastLogin: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent, StatusComponent, IconComponent, CustomSelectComponent],
  template: `
    <app-page-heading eyebrow="Identity & Access" title="User Management Directory" subtitle="Manage internal team members, procurement approvers, and supplier business partner accounts.">
      <div class="heading-actions">
        <button class="btn" (click)="showAddUser = !showAddUser">
          {{ showAddUser ? '✕ Close Form' : '+ Invite / Add User' }}
        </button>
        <button class="btn secondary" (click)="exportUsers()">Export Directory</button>
      </div>
    </app-page-heading>

    <!-- Stats Overview -->
    <section class="stats-grid compact">
      <div class="stat-card">
        <span>Total User Accounts</span>
        <strong>{{ usersList.length }}</strong>
        <small>Internal & supplier identities</small>
      </div>
      <div class="stat-card">
        <span>Active Accounts</span>
        <strong style="color: #16855b;">{{ activeCount() }}</strong>
        <small>Cleared for sign-in</small>
      </div>
      <div class="stat-card">
        <span>Locked / Pending</span>
        <strong style="color: #b56b05;">{{ pendingCount() }}</strong>
        <small>Requires administrator review</small>
      </div>
    </section>

    <!-- Add User Form Panel -->
    @if (showAddUser) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
        <div class="panel-title">
          <h2>Invite New Portal User</h2>
        </div>

        <div class="form-grid">
          <label>Full Legal Name *<input [(ngModel)]="newUser.name" placeholder="e.g. Tariq Mansoor" /></label>
          <label>Official Email Address *<input type="email" [(ngModel)]="newUser.email" placeholder="e.g. tariq@company.com" /></label>
          <label>Portal Role Assignment *
            <app-custom-select [(ngModel)]="newUser.role" [options]="roleAssignmentOptions" />
          </label>
          <label>Company / Organization *<input [(ngModel)]="newUser.organization" placeholder="e.g. TAMCO ME Ltd. / ABC Supplies" /></label>
          <label>Department<input [(ngModel)]="newUser.department" placeholder="e.g. Supply Chain / Accounts Payable" /></label>
          <label>Initial Account Status
            <app-custom-select [(ngModel)]="newUser.status" [options]="statusOptions" />
          </label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetForm()">Reset</button>
          <button class="btn" (click)="addUser()">Send Invitation & Provision</button>
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
          placeholder="Search users by name, email, organization or role..."
        />
      </div>
      <app-custom-select
        [(ngModel)]="roleFilter"
        [options]="filterRoleOptions"
        minWidth="170px"
      />
    </div>

    <!-- Live Users Table -->
    <article class="panel">
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email Address</th>
              <th>Assigned Role</th>
              <th>Organization</th>
              <th>Department</th>
              <th>Status</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (u of filteredUsers(); track u.id) {
              <tr>
                <td><input [(ngModel)]="u.name" style="font-weight: 600;" /></td>
                <td><input [(ngModel)]="u.email" /></td>
                <td>
                  <app-custom-select [(ngModel)]="u.role" [options]="roleAssignmentOptions" minWidth="150px" />
                </td>
                <td><input [(ngModel)]="u.organization" /></td>
                <td><input [(ngModel)]="u.department" style="width: 110px;" /></td>
                <td>
                  <app-status [text]="u.status" [good]="u.status==='Active'" [warn]="u.status==='Pending Invite'" [bad]="u.status==='Locked'" />
                </td>
                <td><small style="color: #64748b;">{{ u.lastLogin }}</small></td>
                <td style="white-space: nowrap;">
                  <div style="display: flex; gap: 5px; align-items: center;">
                    <button
                      class="btn-action"
                      [class.btn-action-reject]="u.status !== 'Locked'"
                      [class.btn-action-approve]="u.status === 'Locked'"
                      (click)="toggleLock(u)"
                      style="min-width: 80px; justify-content: center;"
                    >
                      @if (u.status === 'Locked') {
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
                        <span>Unlock</span>
                      } @else {
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        <span>Lock</span>
                      }
                    </button>
                    <button class="btn-action btn-action-save" (click)="saveUser(u)" title="Save changes">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      <span>Save</span>
                    </button>
                    <button class="btn-action btn-action-delete" (click)="deleteUser(u.id)" title="Delete user">
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
export class UsersComponent {
  readonly state = inject(PortalStateService);

  showAddUser = false;
  searchQuery = '';
  roleFilter = '';

  readonly filterRoleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'Vendor Admin', label: 'Vendor Admin' },
    { value: 'Procurement Manager', label: 'Procurement Manager' },
    { value: 'Finance Officer', label: 'Finance Officer' },
    { value: 'System Administrator', label: 'System Administrator' }
  ];

  readonly roleAssignmentOptions = [
    'Procurement Manager',
    'Finance Officer',
    'Vendor Admin',
    'Executive Approver',
    'System Administrator'
  ];

  readonly statusOptions = [
    'Active',
    'Pending Invite',
    'Locked'
  ];

  newUser: UserAccount = {
    id: 'USR-005',
    name: 'Mustafa Siddiqui',
    email: 'mustafa@company.com',
    role: 'Procurement Manager',
    organization: 'TAMCO ME Ltd.',
    department: 'Strategic Sourcing',
    status: 'Active',
    lastLogin: 'Never'
  };

  usersList: UserAccount[] = [
    { id: 'USR-001', name: 'Ali Siddiqui', email: 'ali@abcsupplies.example', role: 'Vendor Admin', organization: 'ABC Supplies Pvt. Ltd.', department: 'Sales & Bidding', status: 'Active', lastLogin: 'Today 12:40 PM' },
    { id: 'USR-002', name: 'Tariq Mansoor', email: 'tariq@company.com', role: 'Procurement Manager', organization: 'TAMCO ME Ltd.', department: 'Strategic Sourcing', status: 'Active', lastLogin: 'Today 11:15 AM' },
    { id: 'USR-003', name: 'Fatima Zahra', email: 'fatima@company.com', role: 'Finance Officer', organization: 'TAMCO ME Ltd.', department: 'Accounts Payable', status: 'Active', lastLogin: 'Today 10:02 AM' },
    { id: 'USR-004', name: 'Admin Master', email: 'admin@company.com', role: 'System Administrator', organization: 'TAMCO ME Ltd.', department: 'IT Enterprise Core', status: 'Active', lastLogin: 'Just now' }
  ];

  filteredUsers(): UserAccount[] {
    const q = this.searchQuery.trim().toLowerCase();
    const rf = this.roleFilter;
    return this.usersList.filter(u => {
      const matchQ = !q ||
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.organization || '').toLowerCase().includes(q) ||
        (u.role || '').toLowerCase().includes(q) ||
        (u.department || '').toLowerCase().includes(q);
      const matchR = !rf || u.role === rf;
      return matchQ && matchR;
    });
  }

  activeCount(): number {
    return this.usersList.filter(u => u.status === 'Active').length;
  }

  pendingCount(): number {
    return this.usersList.filter(u => u.status !== 'Active').length;
  }

  addUser(): void {
    if (!this.newUser.name || !this.newUser.email) {
      this.state.notify('Error: User name and email are required.');
      return;
    }
    const created: UserAccount = { ...this.newUser, id: `USR-${Math.floor(100 + Math.random() * 900)}` };
    this.usersList = [created, ...this.usersList];
    this.state.notify(`User "${created.name}" invited successfully.`);
    this.resetForm();
    this.showAddUser = false;
  }

  resetForm(): void {
    this.newUser = {
      id: '',
      name: '',
      email: '',
      role: 'Procurement Manager',
      organization: 'TAMCO ME Ltd.',
      department: '',
      status: 'Active',
      lastLogin: 'Never'
    };
  }

  toggleLock(u: UserAccount): void {
    u.status = u.status === 'Locked' ? 'Active' : 'Locked';
    this.state.notify(`User account for ${u.name} is now ${u.status}.`);
  }

  saveUser(u: UserAccount): void {
    this.state.notify(`User profile for ${u.name} updated.`);
  }

  deleteUser(id: string): void {
    this.usersList = this.usersList.filter(u => u.id !== id);
    this.state.notify('User account revoked and deleted.');
  }

  exportUsers(): void {
    this.state.notify('Exporting user identity directory (Excel)...');
  }
}
