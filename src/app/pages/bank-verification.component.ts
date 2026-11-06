import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { VendorApiService } from '../core/vendor-api.service';
import { StatusComponent } from '../shared/ui.component';
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
  imports: [FormsModule, StatusComponent, IconComponent, CustomSelectComponent],
  template: `
    <div style="display: flex; justify-content: flex-end; margin-bottom: 12px;">
      <button class="btn" (click)="showAddForm = !showAddForm">
        {{ showAddForm ? '✕ Close Form' : '+ Add Bank Record' }}
      </button>
    </div>

    <!-- Stats Overview -->
    <section class="stats-grid compact">
      <div class="stat-card">
        <span>Total Bank Records</span>
        <strong>{{ totalCount() }}</strong>
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
          <label>Vendor Code *<input [(ngModel)]="newRecord.vendorId" placeholder="e.g. VEN-001" /></label>
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
export class BankVerificationComponent implements OnInit {
  readonly state = inject(PortalStateService);
  readonly vendorApi = inject(VendorApiService);

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

  ngOnInit(): void {
    this.loadBackendBankData();
  }

  loadBackendBankData(): void {
    // 1. Fetch live bank accounts submitted by vendors
    this.vendorApi.getAllVendorBanks().subscribe(res => {
      const list = res?.vbank_List || res?.data || (Array.isArray(res) ? res : null);
      if (Array.isArray(list) && list.length > 0) {
        for (const b of list) {
          const reqNo = b.reqno || b.reQ_NO || '';
          if (!reqNo) continue;
          const status: 'Approved' | 'Pending' | 'Rejected' =
            (b.status === 'Approved' || b.isactive === 1) ? 'Approved' : (b.status === 'Rejected' ? 'Rejected' : 'Pending');
          const existing = this.state.bankRecords().find(r => r.vendorId === reqNo || r.iban === (b.accounT_IBAN || b.accounT_NO));
          if (!existing) {
            this.state.addBankRecord({
              id: `BNK-${reqNo}-${b.linenum || 1}`,
              vendorId: reqNo,
              vendorName: b.vendoR_NAME || reqNo,
              bankName: b.banK_NAME || 'Commercial Bank',
              iban: b.accounT_IBAN || b.accounT_NO || '',
              accountTitle: b.titlE_ACC || b.vendoR_NAME || '',
              branchCode: b.banK_ADRESS || b.swifT_CODE || 'Main Branch',
              verificationStatus: status,
              verifiedDate: status === 'Approved' ? new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
              notes: `Registered via portal Step 8 (Currency: ${b.currency || 'AED'})`
            });
          }
        }
      }
    });

    // 2. Fetch live bank validation audit records
    this.vendorApi.getBankValidations().subscribe(res => {
      const list = res?.bankvalidation_List || res?.data || (Array.isArray(res) ? res : null);
      if (Array.isArray(list) && list.length > 0) {
        for (const val of list) {
          const reqNo = val.reqno || '';
          if (!reqNo) continue;
          const status = val.status || (val.action === 1 ? 'Approved' : (val.action === 2 ? 'Rejected' : 'Pending'));
          const rec = this.state.bankRecords().find(r => r.vendorId === reqNo);
          if (rec) {
            this.state.setBankVerificationStatus(rec.id, status as any);
          }
        }
      }
    });
  }

  filteredRecords(): BankRecord[] {
    const q = this.searchQuery.trim().toLowerCase();
    const st = this.statusFilter;
    return this.state.bankRecords().filter(r => {
      const matchQuery = !q || (r.vendorName || '').toLowerCase().includes(q) || (r.vendorId || '').toLowerCase().includes(q) || (r.iban || '').toLowerCase().includes(q) || (r.bankName || '').toLowerCase().includes(q) || (r.accountTitle || '').toLowerCase().includes(q) || (r.branchCode || '').toLowerCase().includes(q);
      const matchStatus = !st || r.verificationStatus === st;
      return matchQuery && matchStatus;
    });
  }

  totalCount(): number { return this.state.bankRecords().length; }
  pendingCount(): number { return this.state.bankRecords().filter(r => r.verificationStatus === 'Pending').length; }
  verifiedCount(): number { return this.state.bankRecords().filter(r => r.verificationStatus === 'Approved').length; }

  addRecord(): void {
    if (!this.newRecord.vendorId || !this.newRecord.iban || !this.newRecord.bankName) {
      this.state.notify('Error: Vendor ID, Bank Name and IBAN are required.');
      return;
    }
    const added: BankRecord = { ...this.newRecord, id: `BNK-2026-${Math.floor(100 + Math.random() * 900)}` };
    this.state.addBankRecord(added);

    // Sync to live backend APIs
    this.vendorApi.saveVendorBank({
      coperation: 2,
      reqno: added.vendorId,
      vendoR_NAME: added.vendorName,
      banK_NAME: added.bankName,
      accounT_IBAN: added.iban,
      titlE_ACC: added.accountTitle,
      status: added.verificationStatus
    }).subscribe();

    this.vendorApi.saveBankValidation({
      coperation: 2,
      reqno: added.vendorId,
      vendoR_NAME: added.vendorName,
      bankname: added.bankName,
      status: added.verificationStatus,
      action: added.verificationStatus === 'Approved' ? 1 : (added.verificationStatus === 'Rejected' ? 2 : 0),
      remarks: added.notes,
      letteR_DATE: new Date().toISOString()
    }).subscribe();

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
    this.state.setBankVerificationStatus(rec.id, status);

    // Sync to live backend API: AUBANKVALIDATION
    this.vendorApi.saveBankValidation({
      coperation: 2,
      reqno: rec.vendorId,
      vendoR_NAME: rec.vendorName,
      bankname: rec.bankName,
      status: status,
      action: status === 'Approved' ? 1 : 2,
      remarks: rec.notes || `Finance verification: ${status}`,
      letteR_DATE: new Date().toISOString()
    }).subscribe({
      next: () => this.state.notify(`✓ Backend: Bank verification for ${rec.vendorName} saved as ${status}.`),
      error: () => this.state.notify(`Local bank status updated to ${status}.`)
    });

    // Also sync AUDVendorBank
    this.vendorApi.saveVendorBank({
      coperation: 2,
      reqno: rec.vendorId,
      vendoR_NAME: rec.vendorName,
      banK_NAME: rec.bankName,
      accounT_IBAN: rec.iban,
      titlE_ACC: rec.accountTitle,
      status: status,
      isactive: status === 'Approved' ? 1 : 0
    }).subscribe();
  }

  toggleStatus(rec: BankRecord): void {
    const nextStatus = rec.verificationStatus === 'Approved' || rec.verificationStatus === 'Rejected' ? 'Pending' : 'Approved';
    if (nextStatus === 'Pending') {
      this.state.setBankVerificationStatus(rec.id, 'Pending');
      this.vendorApi.saveBankValidation({
        coperation: 2,
        reqno: rec.vendorId,
        vendoR_NAME: rec.vendorName,
        bankname: rec.bankName,
        status: 'Pending',
        action: 0,
        remarks: 'Verification status reopened',
        letteR_DATE: new Date().toISOString()
      }).subscribe();
    } else {
      this.setStatus(rec, 'Approved');
    }
  }

  updateRecord(rec: BankRecord): void {
    this.vendorApi.saveBankValidation({
      coperation: 2,
      reqno: rec.vendorId,
      vendoR_NAME: rec.vendorName,
      bankname: rec.bankName,
      status: rec.verificationStatus,
      action: rec.verificationStatus === 'Approved' ? 1 : (rec.verificationStatus === 'Rejected' ? 2 : 0),
      remarks: rec.notes,
      letteR_DATE: new Date().toISOString()
    }).subscribe();

    this.vendorApi.saveVendorBank({
      coperation: 2,
      reqno: rec.vendorId,
      vendoR_NAME: rec.vendorName,
      banK_NAME: rec.bankName,
      accounT_IBAN: rec.iban,
      titlE_ACC: rec.accountTitle,
      status: rec.verificationStatus
    }).subscribe();

    this.state.notify(`Bank details for ${rec.vendorName || rec.vendorId} saved.`);
  }

  deleteRecord(id: string): void {
    this.state.deleteBankRecord(id);
  }
}
