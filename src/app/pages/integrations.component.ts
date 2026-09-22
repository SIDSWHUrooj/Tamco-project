import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';
import { CustomSelectComponent } from '../shared/custom-select.component';

export interface IntegrationConnector {
  id: string;
  name: string;
  endpoint: string;
  protocol: string;
  syncInterval: string;
  lastSync: string;
  health: 'Healthy' | 'Degraded' | 'Offline';
}

@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent, StatusComponent, CustomSelectComponent],
  template: `
    <app-page-heading eyebrow="System Architecture" title="ERP & Enterprise Integrations">
      <div class="heading-actions">
        <button class="btn" (click)="showAddConnector = !showAddConnector">
          {{ showAddConnector ? '✕ Close Form' : '+ Add API Connector' }}
        </button>
        <button class="btn secondary" (click)="testAllConnections()">Test All Endpoints</button>
      </div>
    </app-page-heading>

    <!-- Add Connector Form -->
    @if (showAddConnector) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
        <div class="panel-title">
          <h2>Register New Enterprise API Connector</h2>
        </div>

        <div class="form-grid">
          <label>Service / Connector Name *<input [(ngModel)]="newConnector.name" placeholder="e.g. Oracle ERP General Ledger Gateway" /></label>
          <label>Target API Endpoint URL *<input [(ngModel)]="newConnector.endpoint" placeholder="https://api.erp.tamco.example/v1/gl" /></label>
          <label>Authentication Standard
            <app-custom-select [(ngModel)]="newConnector.protocol" [options]="protocolOptions" />
          </label>
          <label>Sync Interval
            <app-custom-select [(ngModel)]="newConnector.syncInterval" [options]="syncIntervalOptions" />
          </label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetForm()">Reset</button>
          <button class="btn" (click)="addConnector()">Deploy Connector</button>
        </div>
      </article>
    }

    <!-- Live Connectors Table -->
    <article class="panel">
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Service Connector</th>
              <th>Endpoint URL</th>
              <th>Protocol / Auth</th>
              <th>Sync Schedule</th>
              <th>Last Synced</th>
              <th>Health Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (c of connectors; track c.id) {
              <tr>
                <td><input [(ngModel)]="c.name" style="font-weight: 600; min-width: 220px;" /></td>
                <td><input [(ngModel)]="c.endpoint" style="font-family: monospace; font-size: 12px; min-width: 260px;" /></td>
                <td><input [(ngModel)]="c.protocol" style="min-width: 170px;" /></td>
                <td><input [(ngModel)]="c.syncInterval" style="width: 130px;" /></td>
                <td><small style="color: #64748b;">{{ c.lastSync }}</small></td>
                <td>
                  <app-status [text]="c.health" [good]="c.health==='Healthy'" [warn]="c.health==='Degraded'" [bad]="c.health==='Offline'" />
                </td>
                <td style="white-space: nowrap;">
                  <div style="display: flex; gap: 5px; align-items: center;">
                    <button class="btn-action btn-action-view" (click)="ping(c)" title="Ping connector">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                      <span>Ping</span>
                    </button>
                    <button class="btn-action btn-action-save" (click)="saveConnector(c)" title="Save changes">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      <span>Save</span>
                    </button>
                    <button class="btn-action btn-action-delete" (click)="deleteConnector(c.id)" title="Delete connector">
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
export class IntegrationsComponent {
  readonly state = inject(PortalStateService);

  showAddConnector = false;

  readonly protocolOptions = [
    'REST API (OAuth 2.0 Bearer)',
    'Mutual TLS (mTLS x509)',
    'HMAC Stamped Webhook',
    'ISO 20022 Host-to-Host'
  ];

  readonly syncIntervalOptions = [
    'Real-time Webhook',
    'Every 5 Minutes',
    'Hourly Batch',
    'Daily Midnight Run'
  ];

  newConnector: IntegrationConnector = {
    id: 'INT-005',
    name: 'Oracle ERP General Ledger Gateway',
    endpoint: 'https://api.erp.tamco.example/v1/gl-postings',
    protocol: 'REST API (OAuth 2.0 Bearer)',
    syncInterval: 'Real-time Webhook',
    lastSync: 'Never',
    health: 'Healthy'
  };

  connectors: IntegrationConnector[] = [
    { id: 'INT-001', name: 'SAP Vendor Master Sync', endpoint: 'https://api.erp.tamco.example/v1/vendors', protocol: 'REST API (OAuth 2.0)', syncInterval: 'Real-time Webhook', lastSync: 'Just now', health: 'Healthy' },
    { id: 'INT-002', name: 'Purchase Order Outbound Gateway', endpoint: 'https://api.erp.tamco.example/v1/purchase-orders', protocol: 'OData / REST', syncInterval: 'Every 5 Minutes', lastSync: '2 mins ago', health: 'Healthy' },
    { id: 'INT-003', name: 'Warehouse GRN & QC Telemetry', endpoint: 'https://api.erp.tamco.example/v1/grn-inbound', protocol: 'AMQP / Event Hub', syncInterval: 'Every 5 Minutes', lastSync: '1 min ago', health: 'Healthy' },
    { id: 'INT-004', name: 'Corporate Banking EFT Gateway', endpoint: 'https://api.banking.tamco.example/v2/disbursements', protocol: 'ISO 20022 Host-to-Host', syncInterval: 'Hourly Batch', lastSync: '15 mins ago', health: 'Healthy' }
  ];

  addConnector(): void {
    if (!this.newConnector.name || !this.newConnector.endpoint) {
      this.state.notify('Error: Service name and endpoint URL are required.');
      return;
    }
    const created: IntegrationConnector = { ...this.newConnector, id: `INT-${Math.floor(100 + Math.random() * 900)}` };
    this.connectors = [...this.connectors, created];
    this.state.notify(`Connector "${created.name}" deployed.`);
    this.resetForm();
    this.showAddConnector = false;
  }

  resetForm(): void {
    this.newConnector = {
      id: '',
      name: '',
      endpoint: 'https://api.erp.tamco.example/v1/',
      protocol: 'REST API (OAuth 2.0 Bearer)',
      syncInterval: 'Every 5 Minutes',
      lastSync: 'Never',
      health: 'Healthy'
    };
  }

  syncNow(c: IntegrationConnector): void {
    c.lastSync = 'Just now';
    c.health = 'Healthy';
    this.state.notify(`Synchronized ${c.name} (200 OK). 12 records updated.`);
  }

  ping(c: IntegrationConnector): void {
    this.state.notify(`Ping ${c.endpoint}: Latency 24ms · SSL Valid.`);
  }

  saveConnector(c: IntegrationConnector): void {
    this.state.notify(`Connector settings for "${c.name}" saved.`);
  }

  deleteConnector(id: string): void {
    this.connectors = this.connectors.filter(c => c.id !== id);
    this.state.notify('API connector deleted.');
  }

  testAllConnections(): void {
    this.state.notify('All 4 enterprise connectors verified healthy (100% uptime).');
  }
}
