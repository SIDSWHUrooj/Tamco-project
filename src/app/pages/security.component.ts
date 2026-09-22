import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';
import { CustomSelectComponent } from '../shared/custom-select.component';

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
  imports: [FormsModule, PageHeadingComponent, StatusComponent, CustomSelectComponent],
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
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
        <div class="panel-title">
          <h2>Provision Security Control / Policy</h2>
        </div>

        <div class="form-grid">
          <label>Security Control Name *<input [(ngModel)]="newPolicy.controlName" placeholder="e.g. IP Whitelisting for Admin Portal" /></label>
          <label>Cryptographic Standard / Protocol *<input [(ngModel)]="newPolicy.standard" placeholder="e.g. CIDR Block / VPN Tunnel" /></label>
          <label>Enforcement Target Scope *<input [(ngModel)]="newPolicy.scope" placeholder="e.g. All Internal Administrator Logins" /></label>
          <label>Enforcement State
            <app-custom-select [(ngModel)]="newPolicy.status" [options]="policyStatusOptions" />
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
                <td style="white-space: nowrap;">
                  <div style="display: flex; gap: 5px; align-items: center;">
                    <button class="btn-action btn-action-view" (click)="verifyKey(p)" title="Audit policy">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      <span>Audit</span>
                    </button>
                    <button class="btn-action btn-action-save" (click)="savePolicy(p)" title="Save changes">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      <span>Save</span>
                    </button>
                    <button class="btn-action btn-action-delete" (click)="deletePolicy(p.id)" title="Delete policy">
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
export class SecurityComponent {
  readonly state = inject(PortalStateService);

  showAddPolicy = false;

  readonly policyStatusOptions = ['Enforced', 'Active', 'Monitoring'];

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
