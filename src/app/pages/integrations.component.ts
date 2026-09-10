import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';

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
  imports: [FormsModule, PageHeadingComponent, StatusComponent],
  template: `
    <app-page-heading eyebrow="System Architecture" title="ERP & Enterprise Integrations" subtitle="Configure RESTful APIs, webhooks, and background connectors for SAP/Oracle ERP, automated GRN syncing and banking gateways.">
      <div class="heading-actions">
        <button class="btn" (click)="showAddConnector = !showAddConnector">
          {{ showAddConnector ? '✕ Close Form' : '+ Add API Connector' }}
        </button>
        <button class="btn secondary" (click)="testAllConnections()">Test All Endpoints</button>
      </div>
    </app-page-heading>

    <!-- Add Connector Form -->
    @if (showAddConnector) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid #1769e0;">
        <div class="panel-title">
          <div>
            <h2>Register New Enterprise API Connector</h2>
            <p>Define API gateway endpoint, authorization standard and background polling schedule.</p>
          </div>
        </div>

        <div class="form-grid">
          <label>Service / Connector Name *<input [(ngModel)]="newConnector.name" placeholder="e.g. Oracle ERP General Ledger Gateway" /></label>
          <label>Target API Endpoint URL *<input [(ngModel)]="newConnector.endpoint" placeholder="https://api.erp.tamco.example/v1/gl" /></label>
          <label>Authentication Standard
            <select [(ngModel)]="newConnector.protocol" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="REST API (OAuth 2.0 Bearer)">REST API (OAuth 2.0 Bearer)</option>
              <option value="Mutual TLS (mTLS x509)">Mutual TLS (mTLS x509)</option>
              <option value="HMAC Stamped Webhook">HMAC Stamped Webhook</option>
              <option value="ISO 20022 Host-to-Host">ISO 20022 Host-to-Host</option>
            </select>
          </label>
          <label>Sync Interval
            <select [(ngModel)]="newConnector.syncInterval" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="Real-time Webhook">Real-time Webhook</option>
              <option value="Every 5 Minutes">Every 5 Minutes</option>
              <option value="Hourly Batch">Hourly Batch</option>
              <option value="Daily Midnight Run">Daily Midnight Run</option>
            </select>
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
      <div class="panel-title">
        <div>
          <h2>Configured Enterprise Connectors</h2>
          <p>Real-time telemetry, service latency, and sync history</p>
        </div>
      </div>

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
                <td><input [(ngModel)]="c.name" style="font-weight: 600; min-width: 180px;" /></td>
                <td><input [(ngModel)]="c.endpoint" style="font-family: monospace; font-size: 11px; min-width: 230px;" /></td>
                <td><input [(ngModel)]="c.protocol" style="width: 140px;" /></td>
                <td><input [(ngModel)]="c.syncInterval" style="width: 120px;" /></td>
                <td><small style="color: #64748b;">{{ c.lastSync }}</small></td>
                <td>
                  <app-status [text]="c.health" [good]="c.health==='Healthy'" [warn]="c.health==='Degraded'" [bad]="c.health==='Offline'" />
                </td>
                <td>
                  <div style="display: flex; gap: 5px;">
                    <button class="btn small" (click)="syncNow(c)">Sync</button>
                    <button class="btn small ghost" (click)="ping(c)">Ping</button>
                    <button class="btn small ghost" (click)="saveConnector(c)">Save</button>
                    <button class="btn small danger-btn" (click)="deleteConnector(c.id)">✕</button>
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
