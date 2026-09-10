import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';

export interface MatchEntry {
  id: string;
  invoiceId: string;
  poId: string;
  grnId: string;
  vendor: string;
  poAmount: number;
  invoiceAmount: number;
  variance: number;
  qcStatus: 'Passed' | 'Pending' | 'Rejected';
  matchStatus: 'Matched' | 'Pending' | 'Mismatch';
  approvalStatus: 'Approved' | 'Pending' | 'On Hold';
}

@Component({
  selector: 'app-three-way-match',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent, StatusComponent],
  template: `
    <app-page-heading eyebrow="Accounts payable" title="3-Way Match Verification" subtitle="Automated reconciliation of Purchase Orders, Goods Receipt Notes (GRN/QC), and Supplier Invoices before payment sign-off.">
      <div class="heading-actions">
        <button class="btn" (click)="showAddMatch = !showAddMatch">
          {{ showAddMatch ? '✕ Close Form' : '+ Add Reconciliation' }}
        </button>
        <button class="btn secondary" (click)="exportLog()">Export Audit Trail</button>
      </div>
    </app-page-heading>

    <!-- Stats Overview -->
    <section class="stats-grid compact">
      <div class="stat-card">
        <span>Total Reconciliations</span>
        <strong>{{ matchQueue.length }}</strong>
        <small>Total invoices under match</small>
      </div>
      <div class="stat-card">
        <span>Successfully Matched</span>
        <strong style="color: #16855b;">{{ matchedCount() }}</strong>
        <small>PO = GRN = Invoice</small>
      </div>
      <div class="stat-card">
        <span>Price / Qty Variance</span>
        <strong style="color: #d33643;">{{ mismatchCount() }}</strong>
        <small>Requires resolution</small>
      </div>
    </section>

    <!-- Add Match Panel -->
    @if (showAddMatch) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid #16855b;">
        <div class="panel-title">
          <div>
            <h2>Log 3-Way Match Verification</h2>
            <p>Perform automated or manual 3-way check against ERP Purchase Order and GRN.</p>
          </div>
        </div>

        <div class="form-grid">
          <label>Invoice Reference # *<input [(ngModel)]="newEntry.invoiceId" placeholder="e.g. INV-00249" /></label>
          <label>Purchase Order # *<input [(ngModel)]="newEntry.poId" placeholder="e.g. PO-002349" /></label>
          <label>ERP GRN Reference # *<input [(ngModel)]="newEntry.grnId" placeholder="e.g. GRN-99812" /></label>
          <label>Supplier Name *<input [(ngModel)]="newEntry.vendor" placeholder="e.g. ABC Supplies Pvt. Ltd." /></label>
          <label>PO Contract Amount ($) *<input type="number" [(ngModel)]="newEntry.poAmount" (ngModelChange)="calcVariance()" placeholder="18600" /></label>
          <label>Invoiced Amount ($) *<input type="number" [(ngModel)]="newEntry.invoiceAmount" (ngModelChange)="calcVariance()" placeholder="18600" /></label>
          <label>Quality Inspection (QC)
            <select [(ngModel)]="newEntry.qcStatus" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="Passed">Passed</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </label>
          <label>Calculated Variance ($)<input type="number" [value]="newEntry.variance" readonly style="background: #f1f5f9;" /></label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetForm()">Reset</button>
          <button class="btn" (click)="addEntry()">Submit for Match</button>
        </div>
      </article>
    }

    <!-- Search & Filter Bar -->
    <div style="display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap;">
      <input
        style="flex: 1; min-width: 240px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px;"
        [(ngModel)]="searchQuery"
        placeholder="🔍 Search matching queue by Invoice, PO, GRN or Supplier..."
      />
      <select
        style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; background: #fff;"
        [(ngModel)]="matchFilter"
      >
        <option value="">All Match Results</option>
        <option value="Matched">Matched (0 Variance)</option>
        <option value="Mismatch">Price / Qty Mismatch</option>
        <option value="Pending">Pending Check</option>
      </select>
    </div>

    <!-- Live Matching Queue Table -->
    <article class="panel">
      <div class="panel-title">
        <div>
          <h2>Reconciliation Queue (PO ↔ GRN ↔ Invoice)</h2>
          <p>Verify quantities, unit rates, tax amounts and inspection certificates.</p>
        </div>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>PO #</th>
              <th>GRN #</th>
              <th>Supplier</th>
              <th>PO Value</th>
              <th>Invoice Value</th>
              <th>Variance</th>
              <th>QC</th>
              <th>3-Way Match</th>
              <th>Approval</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (m of filteredQueue(); track m.id) {
              <tr>
                <td><span class="mono">{{ m.invoiceId }}</span></td>
                <td><input [(ngModel)]="m.poId" style="width: 90px; font-family: monospace;" /></td>
                <td><input [(ngModel)]="m.grnId" style="width: 85px; font-family: monospace;" /></td>
                <td><input [(ngModel)]="m.vendor" style="font-weight: 600;" /></td>
                <td><input type="number" [(ngModel)]="m.poAmount" (ngModelChange)="recalcRow(m)" style="width: 80px;" /></td>
                <td><input type="number" [(ngModel)]="m.invoiceAmount" (ngModelChange)="recalcRow(m)" style="width: 80px;" /></td>
                <td>
                  <strong [style.color]="m.variance === 0 ? '#16855b' : '#d33643'">
                    {{ m.variance === 0 ? '$0' : (m.variance > 0 ? '+$' + m.variance : '-$' + Math.abs(m.variance)) }}
                  </strong>
                </td>
                <td>
                  <app-status [text]="m.qcStatus" [good]="m.qcStatus==='Passed'" [warn]="m.qcStatus==='Pending'" [bad]="m.qcStatus==='Rejected'" />
                </td>
                <td>
                  <app-status [text]="m.matchStatus" [good]="m.matchStatus==='Matched'" [warn]="m.matchStatus==='Pending'" [bad]="m.matchStatus==='Mismatch'" />
                </td>
                <td>
                  <app-status [text]="m.approvalStatus" [good]="m.approvalStatus==='Approved'" [warn]="m.approvalStatus==='Pending'" [bad]="m.approvalStatus==='On Hold'" />
                </td>
                <td>
                  <div style="display: flex; gap: 5px;">
                    @if (m.approvalStatus === 'Pending' && m.matchStatus === 'Matched') {
                      <button class="btn small" (click)="approveMatch(m)">Approve</button>
                    }
                    @if (m.matchStatus === 'Mismatch') {
                      <button class="btn small secondary" (click)="overrideMismatch(m)">Override</button>
                    }
                    <button class="btn small ghost" (click)="saveMatch(m)">Save</button>
                    <button class="btn small danger-btn" (click)="deleteMatch(m.id)">✕</button>
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
export class ThreeWayMatchComponent {
  readonly state = inject(PortalStateService);
  readonly Math = Math;

  showAddMatch = false;
  searchQuery = '';
  matchFilter = '';

  newEntry: MatchEntry = {
    id: 'MTC-005',
    invoiceId: 'INV-00249',
    poId: 'PO-002349',
    grnId: 'GRN-99824',
    vendor: 'ABC Supplies Pvt. Ltd.',
    poAmount: 18600,
    invoiceAmount: 18600,
    variance: 0,
    qcStatus: 'Passed',
    matchStatus: 'Matched',
    approvalStatus: 'Pending'
  };

  matchQueue: MatchEntry[] = [
    { id: 'MTC-001', invoiceId: 'INV-00245', poId: 'PO-002334', grnId: 'GRN-99810', vendor: 'ABC Supplies Pvt. Ltd.', poAmount: 18600, invoiceAmount: 18600, variance: 0, qcStatus: 'Passed', matchStatus: 'Matched', approvalStatus: 'Pending' },
    { id: 'MTC-002', invoiceId: 'INV-00246', poId: 'PO-002301', grnId: 'GRN-99780', vendor: 'Global Traders', poAmount: 8750, invoiceAmount: 8750, variance: 0, qcStatus: 'Passed', matchStatus: 'Matched', approvalStatus: 'Approved' },
    { id: 'MTC-003', invoiceId: 'INV-00247', poId: 'PO-002299', grnId: 'GRN-99750', vendor: 'Tech Solutions', poAmount: 12500, invoiceAmount: 12900, variance: 400, qcStatus: 'Passed', matchStatus: 'Mismatch', approvalStatus: 'On Hold' },
    { id: 'MTC-004', invoiceId: 'INV-00242', poId: 'PO-002280', grnId: 'GRN-99710', vendor: 'Perfect Industrial', poAmount: 43800, invoiceAmount: 43800, variance: 0, qcStatus: 'Passed', matchStatus: 'Matched', approvalStatus: 'Approved' }
  ];

  filteredQueue = computed(() => {
    const q = this.searchQuery.trim().toLowerCase();
    const mf = this.matchFilter;
    return this.matchQueue.filter(m => {
      const matchQ = !q || m.invoiceId.toLowerCase().includes(q) || m.poId.toLowerCase().includes(q) || m.vendor.toLowerCase().includes(q) || m.grnId.toLowerCase().includes(q);
      const matchM = !mf || m.matchStatus === mf;
      return matchQ && matchM;
    });
  });

  matchedCount = computed(() => this.matchQueue.filter(m => m.matchStatus === 'Matched').length);
  mismatchCount = computed(() => this.matchQueue.filter(m => m.matchStatus === 'Mismatch').length);

  calcVariance(): void {
    this.newEntry.variance = (this.newEntry.invoiceAmount || 0) - (this.newEntry.poAmount || 0);
    this.newEntry.matchStatus = this.newEntry.variance === 0 && this.newEntry.qcStatus === 'Passed' ? 'Matched' : 'Mismatch';
  }

  recalcRow(m: MatchEntry): void {
    m.variance = (m.invoiceAmount || 0) - (m.poAmount || 0);
    m.matchStatus = m.variance === 0 && m.qcStatus === 'Passed' ? 'Matched' : 'Mismatch';
  }

  addEntry(): void {
    if (!this.newEntry.invoiceId || !this.newEntry.poId) {
      this.state.notify('Error: Invoice and PO reference are required.');
      return;
    }
    const created: MatchEntry = { ...this.newEntry, id: `MTC-${Math.floor(100 + Math.random() * 900)}` };
    this.matchQueue = [created, ...this.matchQueue];
    this.state.notify(`Match record for Invoice ${created.invoiceId} added.`);
    this.resetForm();
    this.showAddMatch = false;
  }

  resetForm(): void {
    this.newEntry = {
      id: '',
      invoiceId: '',
      poId: '',
      grnId: '',
      vendor: '',
      poAmount: 0,
      invoiceAmount: 0,
      variance: 0,
      qcStatus: 'Passed',
      matchStatus: 'Matched',
      approvalStatus: 'Pending'
    };
  }

  approveMatch(m: MatchEntry): void {
    m.approvalStatus = 'Approved';
    this.state.notify(`3-Way match approved for ${m.invoiceId}. Invoice ready for disbursement.`);
  }

  overrideMismatch(m: MatchEntry): void {
    m.matchStatus = 'Matched';
    m.approvalStatus = 'Approved';
    this.state.notify(`Manager override applied for ${m.invoiceId}. Approved within acceptable tolerance.`);
  }

  saveMatch(m: MatchEntry): void {
    this.state.notify(`3-Way match details for ${m.invoiceId} updated.`);
  }

  deleteMatch(id: string): void {
    this.matchQueue = this.matchQueue.filter(m => m.id !== id);
    this.state.notify('Reconciliation record deleted.');
  }

  exportLog(): void {
    this.state.notify('Exporting complete 3-way match audit trail (Excel)...');
  }
}
