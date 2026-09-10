import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';

export interface ContractItem {
  id: string;
  contractNo: string;
  vendor: string;
  type: string;
  startDate: string;
  endDate: string;
  value: number;
  paymentTerms: string;
  status: 'Active' | 'Expiring Soon' | 'Terminated' | 'Draft';
}

@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent, StatusComponent],
  template: `
    <app-page-heading eyebrow="Commercial Agreements" title="Contract & SLA Management" subtitle="Maintain executed supplier master agreements, annual rate contracts, service level agreements and legal validity milestones.">
      <div class="heading-actions">
        <button class="btn" (click)="showAddContract = !showAddContract">
          {{ showAddContract ? '✕ Close Form' : '+ New Contract Agreement' }}
        </button>
        <button class="btn secondary" (click)="exportContracts()">Export Contract Register</button>
      </div>
    </app-page-heading>

    <!-- Stats Overview -->
    <section class="stats-grid compact">
      <div class="stat-card">
        <span>Active Contracts</span>
        <strong>{{ activeCount() }}</strong>
        <small>Legally executed agreements</small>
      </div>
      <div class="stat-card">
        <span>Total Committed Value ($)</span>
        <strong style="color: #1769e0;">\${{ totalValue().toLocaleString() }}</strong>
        <small>Contractual outlay</small>
      </div>
      <div class="stat-card">
        <span>Expiring Within 90 Days</span>
        <strong style="color: #b56b05;">{{ expiringCount() }}</strong>
        <small>Requires renewal review</small>
      </div>
    </section>

    <!-- Create New Contract Form -->
    @if (showAddContract) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid #1769e0;">
        <div class="panel-title">
          <div>
            <h2>Execute New Commercial Agreement / Contract</h2>
            <p>Specify legal contract code, supplier partner, effective period and monetary commitment.</p>
          </div>
        </div>

        <div class="form-grid">
          <label>Contract Reference # *<input [(ngModel)]="newContract.contractNo" placeholder="e.g. CTR-2026-025" /></label>
          <label>Contracted Supplier *<input [(ngModel)]="newContract.vendor" placeholder="e.g. ABC Supplies Pvt. Ltd." /></label>
          <label>Agreement Type *
            <select [(ngModel)]="newContract.type" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="Annual Rate Contract">Annual Rate Contract</option>
              <option value="Master Service Agreement">Master Service Agreement</option>
              <option value="Raw Material Supply Agreement">Raw Material Supply Agreement</option>
              <option value="Software & Hardware SLA">Software & Hardware SLA</option>
            </select>
          </label>
          <label>Effective Start Date *<input type="date" [(ngModel)]="newContract.startDate" /></label>
          <label>Contract Expiry Date *<input type="date" [(ngModel)]="newContract.endDate" /></label>
          <label>Total Committed Value ($) *<input type="number" [(ngModel)]="newContract.value" placeholder="250000" /></label>
          <label class="span-2">Commercial Payment Terms<input [(ngModel)]="newContract.paymentTerms" placeholder="e.g. Net 30 Days after verified GRN & 3-Way Match" /></label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetForm()">Reset</button>
          <button class="btn" (click)="addContract()">Save & Execute Contract</button>
        </div>
      </article>
    }

    <!-- Search & Filter Bar -->
    <div style="display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap;">
      <input
        style="flex: 1; min-width: 240px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px;"
        [(ngModel)]="searchQuery"
        placeholder="🔍 Search contracts by #, supplier, or agreement type..."
      />
      <select
        style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; background: #fff;"
        [(ngModel)]="statusFilter"
      >
        <option value="">All Statuses</option>
        <option value="Active">Active</option>
        <option value="Expiring Soon">Expiring Soon</option>
        <option value="Terminated">Terminated</option>
      </select>
    </div>

    <!-- Live Contracts Table -->
    <article class="panel">
      <div class="panel-title">
        <div>
          <h2>Master Supplier Contracts Register</h2>
          <p>Binding legal agreements and SLA terms</p>
        </div>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Contract #</th>
              <th>Supplier Name</th>
              <th>Agreement Type</th>
              <th>Start Date</th>
              <th>Expiry Date</th>
              <th>Total Value ($)</th>
              <th>Payment Terms</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (c of filteredContracts(); track c.id) {
              <tr>
                <td><span class="mono">{{ c.contractNo }}</span></td>
                <td><input [(ngModel)]="c.vendor" style="font-weight: 600; min-width: 170px;" /></td>
                <td><input [(ngModel)]="c.type" style="min-width: 190px;" /></td>
                <td><input type="date" [(ngModel)]="c.startDate" /></td>
                <td><input type="date" [(ngModel)]="c.endDate" /></td>
                <td><input type="number" [(ngModel)]="c.value" style="width: 85px;" /></td>
                <td><input [(ngModel)]="c.paymentTerms" style="min-width: 140px;" /></td>
                <td>
                  <app-status [text]="c.status" [good]="c.status==='Active'" [warn]="c.status==='Expiring Soon'" [bad]="c.status==='Terminated'" />
                </td>
                <td>
                  <div style="display: flex; gap: 5px;">
                    <button class="btn small ghost" (click)="saveContract(c)">Save</button>
                    <button class="btn small danger-btn" (click)="deleteContract(c.id)">✕</button>
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
export class ContractsComponent {
  readonly state = inject(PortalStateService);

  showAddContract = false;
  searchQuery = '';
  statusFilter = '';

  newContract: ContractItem = {
    id: 'CTR-005',
    contractNo: 'CTR-2026-025',
    vendor: 'ABC Supplies Pvt. Ltd.',
    type: 'Annual Rate Contract',
    startDate: '2026-09-01',
    endDate: '2027-08-31',
    value: 350000,
    paymentTerms: 'Net 30 Days',
    status: 'Active'
  };

  contractsList: ContractItem[] = [
    { id: 'CTR-001', contractNo: 'CTR-2025-019', vendor: 'ABC Supplies Pvt. Ltd.', type: 'Annual Rate Contract', startDate: '2025-01-01', endDate: '2026-12-31', value: 450000, paymentTerms: 'Net 30 Days', status: 'Active' },
    { id: 'CTR-002', contractNo: 'CTR-2025-042', vendor: 'Global Traders', type: 'Master Service Agreement', startDate: '2025-06-01', endDate: '2026-09-30', value: 280000, paymentTerms: 'Net 45 Days', status: 'Expiring Soon' },
    { id: 'CTR-003', contractNo: 'CTR-2026-008', vendor: 'Tech Solutions', type: 'Software & Hardware SLA', startDate: '2026-02-01', endDate: '2027-01-31', value: 160000, paymentTerms: 'Net 30 Days', status: 'Active' },
    { id: 'CTR-004', contractNo: 'CTR-2026-015', vendor: 'Perfect Industrial', type: 'Raw Material Supply Agreement', startDate: '2026-03-15', endDate: '2027-03-14', value: 520000, paymentTerms: 'Net 60 Days', status: 'Active' }
  ];

  filteredContracts = computed(() => {
    const q = this.searchQuery.trim().toLowerCase();
    const sf = this.statusFilter;
    return this.contractsList.filter(c => {
      const matchQ = !q || c.contractNo.toLowerCase().includes(q) || c.vendor.toLowerCase().includes(q) || c.type.toLowerCase().includes(q);
      const matchS = !sf || c.status === sf;
      return matchQ && matchS;
    });
  });

  activeCount = computed(() => this.contractsList.filter(c => c.status === 'Active' || c.status === 'Expiring Soon').length);
  totalValue = computed(() => this.contractsList.reduce((acc, c) => acc + (c.value || 0), 0));
  expiringCount = computed(() => this.contractsList.filter(c => c.status === 'Expiring Soon').length);

  addContract(): void {
    if (!this.newContract.contractNo || !this.newContract.vendor) {
      this.state.notify('Error: Contract reference and Supplier are required.');
      return;
    }
    const created: ContractItem = { ...this.newContract, id: `CTR-${Math.floor(100 + Math.random() * 900)}` };
    this.contractsList = [created, ...this.contractsList];
    this.state.notify(`Contract ${created.contractNo} executed successfully.`);
    this.resetForm();
    this.showAddContract = false;
  }

  resetForm(): void {
    this.newContract = {
      id: '',
      contractNo: `CTR-2026-0${Math.floor(26 + Math.random() * 50)}`,
      vendor: '',
      type: 'Annual Rate Contract',
      startDate: '2026-09-01',
      endDate: '2027-08-31',
      value: 100000,
      paymentTerms: 'Net 30 Days',
      status: 'Active'
    };
  }

  saveContract(c: ContractItem): void {
    this.state.notify(`Contract ${c.contractNo} updated.`);
  }

  deleteContract(id: string): void {
    this.contractsList = this.contractsList.filter(c => c.id !== id);
    this.state.notify('Contract removed from register.');
  }

  exportContracts(): void {
    this.state.notify('Exporting master supplier contracts register (Excel)...');
  }
}
