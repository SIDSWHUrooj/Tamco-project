import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';

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
  imports: [FormsModule, PageHeadingComponent, StatusComponent],
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
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid #7048d7;">
        <div class="panel-title">
          <div>
            <h2>Register Bank Account Evidence</h2>
            <p>Enter IBAN details, beneficiary account title and bank information.</p>
          </div>
        </div>

        <div class="form-grid">
          <label>Vendor Code *<input [(ngModel)]="newRecord.vendorId" placeholder="e.g. VEN-10024" /></label>
          <label>Company Legal Name *<input [(ngModel)]="newRecord.vendorName" placeholder="Enter vendor legal name" /></label>
          <label>Bank Name *<input [(ngModel)]="newRecord.bankName" placeholder="e.g. Habib Bank Limited (HBL)" /></label>
          <label>IBAN (International Bank Account Number) *<input [(ngModel)]="newRecord.iban" placeholder="PK00 HABB 0000 1234 5678 9012" /></label>
          <label>Beneficiary Account Title *<input [(ngModel)]="newRecord.accountTitle" placeholder="Account title" /></label>
          <label>Branch Code / City<input [(ngModel)]="newRecord.branchCode" placeholder="e.g. Main Branch 0001 · Karachi" /></label>
          <label class="span-2">Verification Notes / Reference<input [(ngModel)]="newRecord.notes" placeholder="Notes or bank certificate reference" /></label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetForm()">Reset</button>
          <button class="btn" (click)="addRecord()">Submit for Verification</button>
        </div>
      </article>
    }

    <!-- Search & Filter -->
    <div style="display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap;">
      <input
        style="flex: 1; min-width: 240px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px;"
        [(ngModel)]="searchQuery"
        placeholder="🔍 Search by vendor, bank name, or IBAN..."
      />
      <select
        style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; background: #fff;"
        [(ngModel)]="statusFilter"
      >
        <option value="">All Statuses</option>
        <option value="Pending">Pending</option>
        <option value="Approved">Approved</option>
        <option value="Rejected">Rejected</option>
      </select>
    </div>

    <!-- Live Bank Verification Queue Table -->
    <article class="panel">
      <div class="panel-title">
        <div>
          <h2>Banking Instruments Queue</h2>
          <p>Review account titles against corporate certificates before releasing electronic fund transfers.</p>
        </div>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Vendor ID</th>
              <th>Vendor Name</th>
              <th>Bank Name</th>
              <th>IBAN Number</th>
              <th>Account Title</th>
              <th>Branch</th>
              <th>Status</th>
              <th>Actions</th>
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
                <td>
                  <div style="display: flex; gap: 5px;">
                    @if (rec.verificationStatus === 'Pending') {
                      <button class="btn small" (click)="setStatus(rec, 'Approved')">Approve</button>
                      <button class="btn small danger-btn" (click)="setStatus(rec, 'Rejected')">Reject</button>
                    }
                    <button class="btn small ghost" (click)="updateRecord(rec)">Save</button>
                    <button class="btn small danger-btn" (click)="deleteRecord(rec.id)">✕</button>
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
export class BankVerificationComponent {
  readonly state = inject(PortalStateService);

  showAddForm = true;
  searchQuery = '';
  statusFilter = '';

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

  filteredRecords = computed(() => {
    const q = this.searchQuery.trim().toLowerCase();
    const st = this.statusFilter;
    return this.bankRecords.filter(r => {
      const matchQuery = !q || r.vendorName.toLowerCase().includes(q) || r.vendorId.toLowerCase().includes(q) || r.iban.toLowerCase().includes(q) || r.bankName.toLowerCase().includes(q);
      const matchStatus = !st || r.verificationStatus === st;
      return matchQuery && matchStatus;
    });
  });

  pendingCount = computed(() => this.bankRecords.filter(r => r.verificationStatus === 'Pending').length);
  verifiedCount = computed(() => this.bankRecords.filter(r => r.verificationStatus === 'Approved').length);

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
