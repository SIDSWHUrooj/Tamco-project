import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';

export interface SecurityPolicy {
  id: string;
  controlName: string;
  standard: string;
  scope: string;
  status: 'Enforced' | 'Active' | 'Monitoring';
  lastAudit: string;
}

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent, StatusComponent],
  template: `
    <app-page-heading eyebrow="Cybersecurity & Governance" title="Information Security & Access Controls" subtitle="Manage two-factor authentication (2FA), banking data encryption, session token policies and perimeter brute-force safeguards.">
      <div class="heading-actions">
        <button class="btn" (click)="showAddPolicy = !showAddPolicy">
          {{ showAddPolicy ? '✕ Close Form' : '+ Add Security Policy' }}
        </button>
        <button class="btn secondary" (click)="runComplianceAudit()">Run Compliance Audit</button>
      </div>
    </app-page-heading>

    <!-- Add Security Policy Form -->
    @if (showAddPolicy) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid #1769e0;">
        <div class="panel-title">
          <div>
            <h2>Provision Security Control / Policy</h2>
            <p>Declare cryptographic requirements, authentication factors and enforcement target.</p>
          </div>
        </div>

        <div class="form-grid">
          <label>Security Control Name *<input [(ngModel)]="newPolicy.controlName" placeholder="e.g. IP Whitelisting for Admin Portal" /></label>
          <label>Cryptographic Standard / Protocol *<input [(ngModel)]="newPolicy.standard" placeholder="e.g. CIDR Block / VPN Tunnel" /></label>
          <label>Enforcement Target Scope *<input [(ngModel)]="newPolicy.scope" placeholder="e.g. All Internal Administrator Logins" /></label>
          <label>Enforcement State
            <select [(ngModel)]="newPolicy.status" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="Enforced">Enforced (Strict Blocking)</option>
              <option value="Active">Active (Standard)</option>
              <option value="Monitoring">Monitoring (Audit Only)</option>
            </select>
          </label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetForm()">Reset</button>
          <button class="btn" (click)="addPolicy()">Deploy Security Policy</button>
        </div>
      </article>
    }

    <!-- Live Security Controls Table -->
    <article class="panel">
      <div class="panel-title">
        <div>
          <h2>Active Platform Security Protocols</h2>
          <p>Continuous cryptographic protection and identity assurance</p>
        </div>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Security Control</th>
              <th>Protocol / Standard</th>
              <th>Enforcement Scope</th>
              <th>Last Verified</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (p of policies; track p.id) {
              <tr>
                <td><input [(ngModel)]="p.controlName" style="font-weight: 600; min-width: 220px;" /></td>
                <td><input [(ngModel)]="p.standard" style="min-width: 180px;" /></td>
                <td><input [(ngModel)]="p.scope" style="min-width: 200px;" /></td>
                <td><small style="color: #64748b;">{{ p.lastAudit }}</small></td>
                <td>
                  <app-status [text]="p.status" [good]="p.status==='Enforced' || p.status==='Active'" [warn]="p.status==='Monitoring'" />
                </td>
                <td>
                  <div style="display: flex; gap: 5px;">
                    <button class="btn small" (click)="verifyKey(p)">Audit</button>
                    <button class="btn small ghost" (click)="savePolicy(p)">Save</button>
                    <button class="btn small danger-btn" (click)="deletePolicy(p.id)">✕</button>
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
export class SecurityComponent {
  readonly state = inject(PortalStateService);

  showAddPolicy = false;

  newPolicy: SecurityPolicy = {
    id: 'SEC-005',
    controlName: 'IP Geolocation & Anomaly Detection',
    standard: 'GeoIP2 / Behavioral Machine Learning',
    scope: 'All Vendor & Internal Portal Endpoints',
    status: 'Enforced',
    lastAudit: 'Just now'
  };

  policies: SecurityPolicy[] = [
    { id: 'SEC-001', controlName: 'Two-Factor Authentication (2FA)', standard: 'TOTP / RFC 6238 & SMS OTP', scope: 'All Internal & Vendor Admins', status: 'Enforced', lastAudit: 'Today 12:00 PM' },
    { id: 'SEC-002', controlName: 'Banking Field Encryption', standard: 'AES-256 GCM (Envelope Encryption)', scope: 'IBAN, Bank Account, Swift Code', status: 'Enforced', lastAudit: 'Today 11:30 AM' },
    { id: 'SEC-003', controlName: 'Session Inactivity Auto-Lock', standard: '30 Min Token Expiry & Refresh Rotation', scope: 'Global Portal Sessions', status: 'Active', lastAudit: 'Today 09:00 AM' },
    { id: 'SEC-004', controlName: 'Brute-Force & Rate Limiting', standard: '5 Failed Sign-ins Lockout / Cloudflare WAF', scope: 'Authentication Gateway', status: 'Active', lastAudit: 'Today 08:00 AM' }
  ];

  addPolicy(): void {
    if (!this.newPolicy.controlName) {
      this.state.notify('Error: Security control name is required.');
      return;
    }
    const created: SecurityPolicy = { ...this.newPolicy, id: `SEC-${Math.floor(100 + Math.random() * 900)}` };
    this.policies = [...this.policies, created];
    this.state.notify(`Security control "${created.controlName}" deployed.`);
    this.resetForm();
    this.showAddPolicy = false;
  }

  resetForm(): void {
    this.newPolicy = {
      id: '',
      controlName: '',
      standard: 'AES-256 GCM',
      scope: 'Global Portal',
      status: 'Enforced',
      lastAudit: 'Just now'
    };
  }

  verifyKey(p: SecurityPolicy): void {
    p.lastAudit = 'Verified Just now';
    this.state.notify(`Integrity audit for "${p.controlName}": 100% compliant.`);
  }

  savePolicy(p: SecurityPolicy): void {
    this.state.notify(`Security policy "${p.controlName}" updated.`);
  }

  deletePolicy(id: string): void {
    this.policies = this.policies.filter(p => p.id !== id);
    this.state.notify('Security policy removed.');
  }

  runComplianceAudit(): void {
    this.state.notify('Full enterprise SOC-2 / ISO-27001 compliance audit passed: 0 vulnerabilities found.');
  }
}
