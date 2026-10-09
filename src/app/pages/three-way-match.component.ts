import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';
import { IconComponent } from '../shared/icon.component';
import { CustomSelectComponent } from '../shared/custom-select.component';

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
  imports: [FormsModule, PageHeadingComponent, StatusComponent, IconComponent, CustomSelectComponent],
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

    <!-- Add Reconciliation Form Panel -->
    @if (showAddMatch) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
        <div class="panel-title">
          <h2>Perform Invoice Reconciliation</h2>
        </div>

        <div class="form-grid four-col">
          <label>Invoice Reference # *<input [(ngModel)]="newEntry.invoiceId" placeholder="e.g. INV-00249" /></label>
          <label>Purchase Order # *<input [(ngModel)]="newEntry.poId" placeholder="e.g. PO-002349" /></label>
          <label>ERP GRN Reference # *<input [(ngModel)]="newEntry.grnId" placeholder="e.g. GRN-99812" /></label>
          <label>Supplier Name *<input [(ngModel)]="newEntry.vendor" placeholder="e.g. ABC Supplies Pvt. Ltd." /></label>
          <label>PO Contract Amount ($) *<input type="number" [(ngModel)]="newEntry.poAmount" (ngModelChange)="calcVariance()" placeholder="18600" /></label>
          <label>Invoiced Amount ($) *<input type="number" [(ngModel)]="newEntry.invoiceAmount" (ngModelChange)="calcVariance()" placeholder="18600" /></label>
          <label>Quality Inspection (QC)
            <app-custom-select [(ngModel)]="newEntry.qcStatus" [options]="qcOptions" />
          </label>
          <label>Calculated Variance ($)<input type="number" [value]="newEntry.variance" readonly style="background: var(--surface-3);" /></label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetForm()">Reset</button>
          <button class="btn" (click)="addEntry()">Submit for Match</button>
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
          placeholder="Search matching queue by Invoice, PO, GRN or Supplier..."
        />
      </div>
      <app-custom-select
        [(ngModel)]="matchFilter"
        [options]="matchFilterOptions"
        minWidth="190px"
      />
    </div>

    <!-- Live Matching Queue Table -->
    <article class="panel">
      <div class="table-scroll">
        <table class="reconciliation-table">
          <thead>
            <tr>
              <th style="min-width: 105px;">Invoice #</th>
              <th style="min-width: 95px;">PO #</th>
              <th style="min-width: 95px;">GRN #</th>
              <th style="min-width: 180px;">Supplier</th>
              <th style="min-width: 95px;">PO Value</th>
              <th style="min-width: 95px;">Invoice Value</th>
              <th style="min-width: 85px;">Variance</th>
              <th style="min-width: 80px;">QC</th>
              <th style="min-width: 105px;">3-Way Match</th>
              <th style="min-width: 95px;">Approval</th>
              <th style="min-width: 210px; text-align: left;">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (m of filteredQueue(); track m.id) {
              <tr>
                <td><span class="mono">{{ m.invoiceId }}</span></td>
                <td><input [(ngModel)]="m.poId" style="width: 90px; font-family: monospace;" /></td>
                <td><input [(ngModel)]="m.grnId" style="width: 85px; font-family: monospace;" /></td>
                <td><input [(ngModel)]="m.vendor" style="min-width: 170px; width: 100%; font-weight: 600;" /></td>
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
                <td style="white-space: nowrap;">
                  <div class="row-actions">
                    @if (m.matchStatus === 'Mismatch') {
                      <button class="btn-action btn-action-reject" (click)="overrideMismatch(m)" title="Override discrepancy">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <span>Override</span>
                      </button>
                    } @else if (m.approvalStatus === 'Approved') {
                      <button class="btn-action btn-action-approved" (click)="toggleApproval(m)" title="Approved (Click to Revoke Approval)">
                        <svg class="icon-check" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        <svg class="icon-revoke" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        <span class="text-approved">Approved</span>
                        <span class="text-revoke">Revoke</span>
                      </button>
                    } @else {
                      <button class="btn-action btn-action-approve" (click)="toggleApproval(m)" title="Approve 3-way match">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        <span>Approve</span>
                      </button>
                    }

                    <button class="btn-action btn-action-save" (click)="saveMatch(m)" title="Save changes">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      <span>Save</span>
                    </button>
                    <button class="btn-action btn-action-delete" (click)="deleteMatch(m.id)" title="Delete match record">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            }

            @if (filteredQueue().length === 0) {
              <tr>
                <td colspan="11" style="text-align: center; padding: 36px 16px; color: var(--muted, #64748b);">
                  No reconciliation records match your search query.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </article>
  `,
  styles: [`
    .reconciliation-table {
      width: 100%;
      min-width: 1260px;
      border-collapse: separate;
      border-spacing: 0;

      thead th {
        background: var(--role-accent, #1769e0);
        color: #ffffff;
        font-size: 11.5px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        padding: 11px 12px;
        border: none;
        white-space: nowrap;

        &:first-child {
          border-top-left-radius: var(--radius-sm, 6px);
        }
        &:last-child {
          border-top-right-radius: var(--radius-sm, 6px);
        }
      }

      tbody tr:hover {
        background: rgba(23, 105, 224, 0.04);
      }

      tbody td {
        padding: 10px 12px;
        vertical-align: middle;
        border-bottom: 1px solid var(--line, var(--line));
      }
    }

    .row-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      justify-content: flex-start;
    }
  `]
})
export class ThreeWayMatchComponent {
  readonly state = inject(PortalStateService);
  readonly Math = Math;

  showAddMatch = false;
  searchQuery = '';
  matchFilter = '';

  readonly matchFilterOptions = [
    { value: '', label: 'All Match Results' },
    { value: 'Matched', label: 'Matched (0 Variance)' },
    { value: 'Mismatch', label: 'Price / Qty Mismatch' },
    { value: 'Pending', label: 'Pending Check' }
  ];

  readonly qcOptions = ['Passed', 'Pending', 'Rejected'];

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

  filteredQueue(): MatchEntry[] {
    const q = this.searchQuery.trim().toLowerCase();
    const mf = this.matchFilter;
    return this.matchQueue.filter(m => {
      const matchQ = !q ||
        (m.invoiceId || '').toLowerCase().includes(q) ||
        (m.poId || '').toLowerCase().includes(q) ||
        (m.vendor || '').toLowerCase().includes(q) ||
        (m.grnId || '').toLowerCase().includes(q);
      const matchM = !mf || m.matchStatus === mf;
      return matchQ && matchM;
    });
  }

  matchedCount(): number {
    return this.matchQueue.filter(m => m.matchStatus === 'Matched').length;
  }

  mismatchCount(): number {
    return this.matchQueue.filter(m => m.matchStatus === 'Mismatch').length;
  }

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

  toggleApproval(m: MatchEntry): void {
    if (m.approvalStatus === 'Approved') {
      m.approvalStatus = 'Pending';
      this.state.notify(`Approval revoked for match ${m.invoiceId}. Status reverted to Pending.`);
    } else {
      m.approvalStatus = 'Approved';
      this.state.notify(`3-Way match approved for ${m.invoiceId}. Invoice ready for disbursement.`);
    }
  }

  approveMatch(m: MatchEntry): void {
    this.toggleApproval(m);
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
