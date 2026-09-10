import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';

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
  imports: [FormsModule, PageHeadingComponent, StatusComponent],
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
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid #1769e0;">
        <div class="panel-title">
          <div>
            <h2>Invite New Portal User</h2>
            <p>Provision access permissions, organization membership and authentication role.</p>
          </div>
        </div>

        <div class="form-grid">
          <label>Full Legal Name *<input [(ngModel)]="newUser.name" placeholder="e.g. Tariq Mansoor" /></label>
          <label>Official Email Address *<input type="email" [(ngModel)]="newUser.email" placeholder="e.g. tariq@company.com" /></label>
          <label>Portal Role Assignment *
            <select [(ngModel)]="newUser.role" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="Procurement Manager">Procurement Manager</option>
              <option value="Finance Officer">Finance Officer</option>
              <option value="Vendor Admin">Vendor Admin</option>
              <option value="Executive Approver">Executive Approver</option>
              <option value="System Administrator">System Administrator</option>
            </select>
          </label>
          <label>Company / Organization *<input [(ngModel)]="newUser.organization" placeholder="e.g. TAMCO ME Ltd. / ABC Supplies" /></label>
          <label>Department<input [(ngModel)]="newUser.department" placeholder="e.g. Supply Chain / Accounts Payable" /></label>
          <label>Initial Account Status
            <select [(ngModel)]="newUser.status" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="Active">Active</option>
              <option value="Pending Invite">Pending Invite</option>
              <option value="Locked">Locked</option>
            </select>
          </label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetForm()">Reset</button>
          <button class="btn" (click)="addUser()">Send Invitation & Provision</button>
        </div>
      </article>
    }

    <!-- Search & Filter Bar -->
    <div style="display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap;">
      <input
        style="flex: 1; min-width: 240px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px;"
        [(ngModel)]="searchQuery"
        placeholder="🔍 Search users by name, email, organization or role..."
      />
      <select
        style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; background: #fff;"
        [(ngModel)]="roleFilter"
      >
        <option value="">All Roles</option>
        <option value="Vendor Admin">Vendor Admin</option>
        <option value="Procurement Manager">Procurement Manager</option>
        <option value="Finance Officer">Finance Officer</option>
        <option value="System Administrator">System Administrator</option>
      </select>
    </div>

    <!-- Live Users Table -->
    <article class="panel">
      <div class="panel-title">
        <div>
          <h2>System Users & Identity Management</h2>
          <p>Maintain user permissions, passwords and account active status</p>
        </div>
      </div>

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
                  <select [(ngModel)]="u.role" style="border: 1px solid #dbe3ed; border-radius: 6px; padding: 4px;">
                    <option value="Vendor Admin">Vendor Admin</option>
                    <option value="Procurement Manager">Procurement Manager</option>
                    <option value="Finance Officer">Finance Officer</option>
                    <option value="Executive Approver">Executive Approver</option>
                    <option value="System Administrator">System Administrator</option>
                  </select>
                </td>
                <td><input [(ngModel)]="u.organization" /></td>
                <td><input [(ngModel)]="u.department" style="width: 110px;" /></td>
                <td>
                  <app-status [text]="u.status" [good]="u.status==='Active'" [warn]="u.status==='Pending Invite'" [bad]="u.status==='Locked'" />
                </td>
                <td><small style="color: #64748b;">{{ u.lastLogin }}</small></td>
                <td>
                  <div style="display: flex; gap: 5px;">
                    <button class="btn small" (click)="toggleLock(u)">
                      {{ u.status === 'Locked' ? 'Unlock' : 'Lock' }}
                    </button>
                    <button class="btn small ghost" (click)="saveUser(u)">Save</button>
                    <button class="btn small danger-btn" (click)="deleteUser(u.id)">✕</button>
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

  filteredUsers = computed(() => {
    const q = this.searchQuery.trim().toLowerCase();
    const rf = this.roleFilter;
    return this.usersList.filter(u => {
      const matchQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.organization.toLowerCase().includes(q);
      const matchR = !rf || u.role === rf;
      return matchQ && matchR;
    });
  });

  activeCount = computed(() => this.usersList.filter(u => u.status === 'Active').length);
  pendingCount = computed(() => this.usersList.filter(u => u.status !== 'Active').length);

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
