import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';
import { IconComponent } from '../shared/icon.component';
import { CustomSelectComponent } from '../shared/custom-select.component';

export interface BankRecord {
  id: string;
  vendorId: string;
  vendorName: string;
  bankName: string;
  iban: string;
  accountTitle: string;
  branchCode: string;
  verificationStatus: 'Approved' | 'Pending' | 'Rejected';
  verifiedDate: string;
  notes: string;
}

@Component({
  selector: 'app-bank-verification',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent, StatusComponent, IconComponent, CustomSelectComponent],
  template: `
    <app-page-heading eyebrow="Finance control" title="Bank Account Verification" subtitle="Validate banking instruments, IBAN ownership, and corporate account titles prior to vendor payment authorization.">
      <div class="heading-actions">
        <button class="btn" (click)="showAddForm = !showAddForm">
          {{ showAddForm ? '✕ Close Form' : '+ Add Bank Record' }}
        </button>
        <button class="btn secondary" (click)="exportList()">Export Audit Log</button>
      </div>
    </app-page-heading>

    <!-- Stats Overview -->
    <section class="stats-grid compact">
      <div class="stat-card">
        <span>Total Bank Records</span>
        <strong>{{ bankRecords.length }}</strong>
        <small>Active banking profiles</small>
      </div>
      <div class="stat-card">
        <span>Pending Verification</span>
        <strong style="color: #b56b05;">{{ pendingCount() }}</strong>
        <small>Awaiting officer check</small>
      </div>
      <div class="stat-card">
        <span>Verified & Active</span>
        <strong style="color: #16855b;">{{ verifiedCount() }}</strong>
        <small>Cleared for EFT payments</small>
      </div>
    </section>

    <!-- Add New Bank Form Panel -->
    @if (showAddForm) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
        <div class="panel-title">
          <h2>Register Bank Account Evidence</h2>
        </div>

        <div class="form-grid four-col">
          <label>Vendor Code *<input [(ngModel)]="newRecord.vendorId" placeholder="e.g. VEN-10024" /></label>
          <label>Company Legal Name *<input [(ngModel)]="newRecord.vendorName" placeholder="Enter vendor legal name" /></label>
          <label>Bank Name *<input [(ngModel)]="newRecord.bankName" placeholder="e.g. Habib Bank Limited (HBL)" /></label>
          <label>IBAN (International Bank Account Number) *<input [(ngModel)]="newRecord.iban" placeholder="PK00 HABB 0000 1234 5678 9012" /></label>
          <label>Beneficiary Account Title *<input [(ngModel)]="newRecord.accountTitle" placeholder="Account title" /></label>
          <label>Branch Code / City<input [(ngModel)]="newRecord.branchCode" placeholder="e.g. Main Branch 0001 · Karachi" /></label>
          <label class="span-4">Verification Notes / Reference<input [(ngModel)]="newRecord.notes" placeholder="Notes or bank certificate reference" /></label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetForm()">Reset</button>
          <button class="btn" (click)="addRecord()">Submit for Verification</button>
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
          placeholder="Search by vendor, bank name, or IBAN..."
        />
      </div>
      <app-custom-select
        [(ngModel)]="statusFilter"
        [options]="statusFilterOptions"
        minWidth="160px"
      />
    </div>

    <!-- Live Bank Verification Queue Table -->
    <article class="panel">
      <div class="table-scroll">
        <table class="bank-table">
          <thead>
            <tr>
              <th style="min-width: 105px;">Vendor ID</th>
              <th style="min-width: 170px;">Vendor Name</th>
              <th style="min-width: 150px;">Bank Name</th>
              <th style="min-width: 190px;">IBAN Number</th>
              <th style="min-width: 170px;">Account Title</th>
              <th style="min-width: 150px;">Branch</th>
              <th style="min-width: 100px;">Status</th>
              <th style="min-width: 210px; text-align: left;">Actions</th>
            </tr>
          </thead>
          <tbody>
            @if (filteredRecords().length === 0) {
              <tr>
                <td colspan="8" style="text-align: center; color: #94a3b8; padding: 28px;">
                  No bank records registered yet. Click "<strong>+ Add Bank Record</strong>" to register banking information.
                </td>
              </tr>
            }
            @for (rec of filteredRecords(); track rec.id) {
              <tr>
                <td><span class="mono">{{ rec.vendorId }}</span></td>
                <td><input [(ngModel)]="rec.vendorName" style="font-weight: 600;" /></td>
                <td><input [(ngModel)]="rec.bankName" /></td>
                <td><input [(ngModel)]="rec.iban" style="font-family: monospace; font-size: 11px;" /></td>
                <td><input [(ngModel)]="rec.accountTitle" /></td>
                <td><input [(ngModel)]="rec.branchCode" /></td>
                <td>
                  <app-status [text]="rec.verificationStatus" [good]="rec.verificationStatus==='Approved'" [warn]="rec.verificationStatus==='Pending'" [bad]="rec.verificationStatus==='Rejected'" />
                </td>
                <td style="white-space: nowrap;">
                  <div class="row-actions">
                    @if (rec.verificationStatus === 'Pending') {
                      <button class="btn-action btn-action-approve" (click)="setStatus(rec, 'Approved')" title="Approve banking details">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        <span>Approve</span>
                      </button>
                      <button class="btn-action btn-action-reject" (click)="setStatus(rec, 'Rejected')" title="Reject banking details">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <span>Reject</span>
                      </button>
                    } @else if (rec.verificationStatus === 'Approved') {
                      <button class="btn-action btn-action-approved" (click)="toggleStatus(rec)" title="Approved (Click to Revoke Approval)">
                        <svg class="icon-check" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        <svg class="icon-revoke" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        <span class="text-approved">Approved</span>
                        <span class="text-revoke">Revoke</span>
                      </button>
                    } @else if (rec.verificationStatus === 'Rejected') {
                      <button class="btn-action btn-action-rejected" (click)="toggleStatus(rec)" title="Rejected (Click to Re-open)">
                        <svg class="icon-rejected" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <svg class="icon-reopen" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                        <span class="text-rejected">Rejected</span>
                        <span class="text-reopen">Re-open</span>
                      </button>
                    }

                    <button class="btn-action btn-action-save" (click)="updateRecord(rec)" title="Save changes">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      <span>Save</span>
                    </button>
                    <button class="btn-action btn-action-delete" (click)="deleteRecord(rec.id)" title="Delete bank record">
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
  `,
  styles: [`
    .bank-table {
      width: 100%;
      min-width: 1100px;
      border-collapse: separate;
      border-spacing: 0;

      thead th {
        background: var(--role-accent, #7048d7);
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
        background: rgba(112, 72, 215, 0.04);
      }

      tbody td {
        padding: 10px 12px;
        vertical-align: middle;
        border-bottom: 1px solid var(--line, #e2e8f0);
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
export class BankVerificationComponent {
  readonly state = inject(PortalStateService);

  showAddForm = true;
  searchQuery = '';
  statusFilter = '';

  readonly statusFilterOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' }
  ];

  newRecord: BankRecord = {
    id: 'BNK-2026-015',
    vendorId: 'VEN-10028',
    vendorName: 'Horizon Power Systems',
    bankName: 'Meezan Bank',
    iban: 'PK12 MEZN 0000 4455 6677 8899',
    accountTitle: 'Horizon Power Systems',
    branchCode: 'F-10 Markaz · 0044',
    verificationStatus: 'Pending',
    verifiedDate: '',
    notes: 'Awaiting original bank letter scan'
  };

  bankRecords: BankRecord[] = [
    { id: 'BNK-2026-011', vendorId: 'VEN-10024', vendorName: 'ABC Supplies Pvt. Ltd.', bankName: 'Habib Bank Limited', iban: 'PK36 HABB 0000 1234 5678 9012', accountTitle: 'ABC Supplies Pvt. Ltd.', branchCode: 'Korangi Main · 0892', verificationStatus: 'Approved', verifiedDate: '18 May 2026', notes: 'IBAN matched to SECP title' },
    { id: 'BNK-2026-012', vendorId: 'VEN-10025', vendorName: 'Global Traders', bankName: 'MCB Bank', iban: 'PK55 MUCB 0000 9988 7766 5544', accountTitle: 'Global Traders', branchCode: 'Gulberg · 0211', verificationStatus: 'Approved', verifiedDate: '16 May 2026', notes: 'Verified via bank certificate' },
    { id: 'BNK-2026-013', vendorId: 'VEN-10026', vendorName: 'Perfect Industrial', bankName: 'Allied Bank', iban: 'PK77 ABPA 0000 1122 3344 5566', accountTitle: 'Perfect Industrial', branchCode: 'SITE Karachi · 0308', verificationStatus: 'Pending', verifiedDate: '', notes: 'Title mismatch under review' },
    { id: 'BNK-2026-014', vendorId: 'VEN-10027', vendorName: 'Tech Solutions', bankName: 'HBL', iban: 'PK21 HABB 0000 6677 8899 0011', accountTitle: 'Tech Solutions (Pvt) Ltd.', branchCode: 'Blue Area · 0155', verificationStatus: 'Rejected', verifiedDate: '15 May 2026', notes: 'Account title does not match NTN' }
  ];

  filteredRecords(): BankRecord[] {
    const q = this.searchQuery.trim().toLowerCase();
    const st = this.statusFilter;
    return this.bankRecords.filter(r => {
      const matchQuery = !q || (r.vendorName || '').toLowerCase().includes(q) || (r.vendorId || '').toLowerCase().includes(q) || (r.iban || '').toLowerCase().includes(q) || (r.bankName || '').toLowerCase().includes(q) || (r.accountTitle || '').toLowerCase().includes(q) || (r.branchCode || '').toLowerCase().includes(q);
      const matchStatus = !st || r.verificationStatus === st;
      return matchQuery && matchStatus;
    });
  }

  pendingCount(): number { return this.bankRecords.filter(r => r.verificationStatus === 'Pending').length; }
  verifiedCount(): number { return this.bankRecords.filter(r => r.verificationStatus === 'Approved').length; }

  addRecord(): void {
    if (!this.newRecord.vendorId || !this.newRecord.iban || !this.newRecord.bankName) {
      this.state.notify('Error: Vendor ID, Bank Name and IBAN are required.');
      return;
    }
    const added: BankRecord = { ...this.newRecord, id: `BNK-2026-${Math.floor(100 + Math.random() * 900)}` };
    this.bankRecords = [added, ...this.bankRecords];
    this.state.notify(`Bank record for "${added.vendorName || added.vendorId}" submitted for verification.`);
    this.resetForm();
  }

  resetForm(): void {
    this.newRecord = {
      id: `BNK-2026-${Math.floor(100 + Math.random() * 900)}`,
      vendorId: 'VEN-10028',
      vendorName: 'Horizon Power Systems',
      bankName: 'Meezan Bank',
      iban: 'PK12 MEZN 0000 4455 6677 8899',
      accountTitle: 'Horizon Power Systems',
      branchCode: 'F-10 Markaz · 0044',
      verificationStatus: 'Pending',
      verifiedDate: '',
      notes: 'Awaiting original bank letter scan'
    };
  }

  setStatus(rec: BankRecord, status: 'Approved' | 'Rejected'): void {
    rec.verificationStatus = status;
    if (status === 'Approved') {
      this.state.approveVendor(rec.vendorId, 'finance');
      this.state.notify(`Bank verification approved for ${rec.vendorName || rec.vendorId}.`);
    } else {
      this.state.notify(`Bank verification rejected for ${rec.vendorName || rec.vendorId}.`);
    }
  }

  toggleStatus(rec: BankRecord): void {
    if (rec.verificationStatus === 'Approved' || rec.verificationStatus === 'Rejected') {
      rec.verificationStatus = 'Pending';
      this.state.notify(`Bank verification status reverted to Pending for ${rec.vendorName || rec.vendorId}.`);
    } else {
      this.setStatus(rec, 'Approved');
    }
  }

  updateRecord(rec: BankRecord): void {
    this.state.notify(`Bank details for ${rec.vendorName || rec.vendorId} updated.`);
  }

  deleteRecord(id: string): void {
    const item = this.bankRecords.find(r => r.id === id);
    this.bankRecords = this.bankRecords.filter(r => r.id !== id);
    this.state.notify(`Bank record for ${item ? item.vendorName : id} deleted.`);
  }

  exportList(): void {
    this.state.notify('Exporting bank verification audit trail (Excel)...');
  }
}
