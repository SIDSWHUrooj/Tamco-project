import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';
import { IconComponent } from '../shared/icon.component';
import { CustomSelectComponent } from '../shared/custom-select.component';
import { CustomDatePickerComponent } from '../shared/custom-date-picker.component';

export interface PaymentItem {
  id: string;
  paymentRef: string;
  invoiceRef: string;
  vendor: string;
  amount: number;
  method: string;
  valueDate: string;
  bankAccount: string;
  status: 'Paid' | 'Scheduled' | 'Processing' | 'On Hold';
}

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent, StatusComponent, IconComponent, CustomSelectComponent, CustomDatePickerComponent],
  template: `
    <app-page-heading eyebrow="Financial Settlement" title="Payments & Disbursements" subtitle="Manage payment runs, electronic fund transfers (EFT), batch processing and vendor payment advice.">
      <div class="heading-actions">
        <button class="btn" (click)="showAddPayment = !showAddPayment">
          @if (showAddPayment) {
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            <span>Close Form</span>
          } @else {
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Schedule Disbursement</span>
          }
        </button>
        <button class="btn secondary" (click)="exportPayments()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span>Export Advice</span>
        </button>
      </div>
    </app-page-heading>

    <!-- Stats Overview -->
    <section class="dash-kpis three">
      <article class="dash-kpi">
        <div class="kpi-top-row">
          <span class="kpi-label">Total Transactions</span>
          <span class="kpi-icon-badge blue">
            <app-icon name="payments" [size]="16" />
          </span>
        </div>
        <strong class="kpi-value">{{ paymentsList.length }}</strong>
        <small>Disbursement ledger entries</small>
      </article>

      <article class="dash-kpi">
        <div class="kpi-top-row">
          <span class="kpi-label">Total Disbursed</span>
          <span class="kpi-icon-badge emerald">
            <app-icon name="banks" [size]="16" />
          </span>
        </div>
        <strong class="kpi-value" style="color: #059669;">\${{ totalPaidValue().toLocaleString() }}</strong>
        <small>Settled via EFT Host-to-Host</small>
      </article>

      <article class="dash-kpi">
        <div class="kpi-top-row">
          <span class="kpi-label">Pending Release</span>
          <span class="kpi-icon-badge amber">
            <app-icon name="invoices" [size]="16" />
          </span>
        </div>
        <strong class="kpi-value" style="color: #d97706;">\${{ pendingValue().toLocaleString() }}</strong>
        <small>Scheduled for next batch disbursement</small>
      </article>
    </section>

    <!-- Add Payment Form -->
    @if (showAddPayment) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
        <div class="panel-title">
          <h2>Schedule Vendor Disbursement</h2>
        </div>

        <div class="form-grid four-col">
          <label>Payment Reference # *<input [(ngModel)]="newPayment.paymentRef" placeholder="e.g. PAY-2026-0895" /></label>
          <label>Approved Invoice # *<input [(ngModel)]="newPayment.invoiceRef" placeholder="e.g. INV-00245" /></label>
          <label>Beneficiary Vendor *<input [(ngModel)]="newPayment.vendor" placeholder="e.g. ABC Supplies Pvt. Ltd." /></label>
          <label>Payment Amount ($) *<input type="number" [(ngModel)]="newPayment.amount" placeholder="18600" /></label>
          <label>Payment Channel / Method
            <app-custom-select [(ngModel)]="newPayment.method" [options]="methodOptions" />
          </label>
          <label>Value / Settlement Date *
            <app-custom-date-picker [(ngModel)]="newPayment.valueDate" />
          </label>
          <label class="span-2">Beneficiary Bank & IBAN<input [(ngModel)]="newPayment.bankAccount" placeholder="HBL · PK00 HABB 0000 1234 5678 9012" /></label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetForm()">Reset</button>
          <button class="btn" (click)="addPayment()">Queue for Settlement</button>
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
          placeholder="Search payments by reference, invoice, or supplier..."
        />
      </div>
      <app-custom-select
        [(ngModel)]="statusFilter"
        [options]="statusOptions"
        minWidth="180px"
      />
    </div>

    <!-- Live Payments Table -->
    <article class="panel">
      <div class="table-scroll">
        <table class="payments-table">
          <thead>
            <tr>
              <th style="min-width: 120px;">Payment Ref</th>
              <th style="min-width: 105px;">Invoice Ref</th>
              <th style="min-width: 170px;">Beneficiary Vendor</th>
              <th style="min-width: 125px;">Amount ($)</th>
              <th style="min-width: 190px;">Method</th>
              <th style="min-width: 145px;">Value Date</th>
              <th style="min-width: 210px;">Bank Account</th>
              <th style="min-width: 110px;">Status</th>
              <th style="min-width: 200px; text-align: left;">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (p of filteredPayments(); track p.id) {
              <tr [class.is-paid]="p.status === 'Paid'">
                <td><span class="mono pay-ref">{{ p.paymentRef }}</span></td>
                <td><input [(ngModel)]="p.invoiceRef" class="table-cell-input mono" placeholder="INV-00000" /></td>
                <td><input [(ngModel)]="p.vendor" class="table-cell-input vendor-input" placeholder="Vendor name" /></td>
                <td>
                  <div class="table-amount-wrap">
                    <span class="amount-prefix">$</span>
                    <input type="number" [(ngModel)]="p.amount" class="table-cell-input amount-input" />
                  </div>
                </td>
                <td>
                  <select [(ngModel)]="p.method" class="table-cell-select">
                    @for (opt of methodOptions; track opt) {
                      <option [value]="opt">{{ opt }}</option>
                    }
                  </select>
                </td>
                <td>
                  <app-custom-date-picker [(ngModel)]="p.valueDate" [compact]="true" minWidth="130px" />
                </td>
                <td><input [(ngModel)]="p.bankAccount" class="table-cell-input bank-input" placeholder="Bank & IBAN" /></td>
                <td>
                  <app-status [text]="p.status" [good]="p.status==='Paid'" [warn]="p.status==='Scheduled' || p.status==='Processing'" [bad]="p.status==='On Hold'" />
                </td>
                <td style="white-space: nowrap;">
                  <div class="row-actions">
                    @if (p.status === 'Scheduled' || p.status === 'Processing') {
                      <button class="btn-action btn-action-execute" (click)="markPaid(p)" title="Execute Electronic Fund Transfer">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        <span>Execute</span>
                      </button>
                    } @else if (p.status === 'Paid') {
                      <button class="btn-action btn-action-paid" (click)="togglePaymentStatus(p)" title="Payment Dispatched (Click to Revert to Scheduled)">
                        <svg class="icon-check" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        <svg class="icon-revoke" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        <span class="text-paid">Paid</span>
                        <span class="text-revert">Revert</span>
                      </button>
                    } @else if (p.status === 'On Hold') {
                      <button class="btn-action btn-action-reject" (click)="markScheduled(p)" title="Disbursement on Hold (Click to Release to Scheduled)">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        <span>On Hold</span>
                      </button>
                    }

                    <button class="btn-action btn-action-save" (click)="savePayment(p)" title="Save changes">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                      <span>Save</span>
                    </button>
                    <button class="btn-action btn-action-delete" (click)="deletePayment(p.id)" title="Delete disbursement record">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            }

            @if (filteredPayments().length === 0) {
              <tr>
                <td colspan="9" class="empty-table-td">
                  <div class="empty-table-msg">
                    <app-icon name="payments" [size]="24" />
                    <span>No payment records match "{{ searchQuery }}"{{ statusFilter ? ' with status ' + statusFilter : '' }}.</span>
                    <button class="btn secondary small" (click)="searchQuery = ''; statusFilter = ''">Reset Filters</button>
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
    .payments-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;

      thead th {
        background: var(--role-accent, #16a34a);
        color: #ffffff;
        font-size: 11.5px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        padding: 11px 12px;
        white-space: nowrap;
        border-bottom: 2px solid var(--role-accent-hover, #15803d);
        transition: background-color 0.2s ease, border-color 0.2s ease;

        &:first-child {
          border-top-left-radius: var(--radius-sm, 6px);
        }
        &:last-child {
          border-top-right-radius: var(--radius-sm, 6px);
        }
      }

      td {
        padding: 8px 10px;
        vertical-align: middle;
        border-bottom: 1px solid var(--line);
      }

      tr.is-paid {
        background: rgba(240, 253, 244, 0.45);
      }
    }

    .pay-ref {
      font-weight: 700;
      color: var(--role-accent);
    }

    .table-cell-input {
      width: 100%;
      border: 1px solid var(--line);
      background: #ffffff;
      border-radius: var(--radius-sm);
      padding: 6px 10px;
      font-size: 12.5px;
      line-height: 1.3;
      transition: all 0.15s ease;

      &:hover {
        border-color: var(--line-strong);
      }

      &:focus {
        border-color: var(--role-accent);
        box-shadow: 0 0 0 2px var(--role-soft);
        outline: none;
      }

      &.mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      }

      &.vendor-input {
        font-weight: 600;
        color: var(--text);
      }
    }

    .table-amount-wrap {
      position: relative;
      display: flex;
      align-items: center;

      .amount-prefix {
        position: absolute;
        left: 8px;
        font-weight: 700;
        color: var(--muted);
        font-size: 12px;
        pointer-events: none;
      }

      .amount-input {
        padding-left: 20px;
        font-weight: 700;
        color: #0f172a;
      }
    }

    .table-cell-select {
      width: 100%;
      border: 1px solid var(--line);
      background: #ffffff;
      border-radius: var(--radius-sm);
      padding: 6px 8px;
      font-size: 12px;
      color: var(--text);
      line-height: 1.3;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        border-color: var(--line-strong);
      }

      &:focus {
        border-color: var(--role-accent);
        box-shadow: 0 0 0 2px var(--role-soft);
        outline: none;
      }
    }

    .row-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 6px;

      .icon-btn {
        width: 26px;
        height: 26px;
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
      }
    }

    .empty-table-td {
      text-align: center;
      padding: 36px 16px !important;
    }

    .empty-table-msg {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      color: var(--muted);

      span {
        font-size: 13px;
        font-weight: 500;
      }
    }
  `]
})
export class PaymentsComponent {
  readonly state = inject(PortalStateService);

  showAddPayment = false;
  searchQuery = '';
  statusFilter = '';

  readonly statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Scheduled', label: 'Scheduled' },
    { value: 'Processing', label: 'Processing' },
    { value: 'Paid', label: 'Paid (Settled)' },
    { value: 'On Hold', label: 'On Hold' }
  ];

  readonly methodOptions = [
    'Direct EFT (Bank Transfer)',
    'RTGS Urgent Transfer',
    'Corporate Pay Order',
    'Letter of Credit (LC)'
  ];

  newPayment: PaymentItem = {
    id: 'PAY-005',
    paymentRef: 'PAY-2026-0895',
    invoiceRef: 'INV-00245',
    vendor: 'ABC Supplies Pvt. Ltd.',
    amount: 18600,
    method: 'Direct EFT (Bank Transfer)',
    valueDate: '2026-08-28',
    bankAccount: 'HBL · PK00 HABB 0000 1234 5678 9012',
    status: 'Scheduled'
  };

  paymentsList: PaymentItem[] = [
    { id: 'PAY-001', paymentRef: 'PAY-2026-0891', invoiceRef: 'INV-00246', vendor: 'Global Traders', amount: 8750, method: 'Direct EFT (Bank Transfer)', valueDate: '2026-08-25', bankAccount: 'UBL · PK12 UNIL 0000 4567 8901', status: 'Scheduled' },
    { id: 'PAY-002', paymentRef: 'PAY-2026-0870', invoiceRef: 'INV-00234', vendor: 'ABC Supplies Pvt. Ltd.', amount: 18600, method: 'Direct EFT (Bank Transfer)', valueDate: '2026-08-18', bankAccount: 'HBL · PK00 HABB 0000 1234 5678', status: 'Paid' },
    { id: 'PAY-003', paymentRef: 'PAY-2026-0855', invoiceRef: 'INV-00210', vendor: 'Perfect Industrial', amount: 43800, method: 'RTGS Urgent Transfer', valueDate: '2026-08-12', bankAccount: 'Bank Alfalah · PK90 ALFH 0000', status: 'Paid' },
    { id: 'PAY-004', paymentRef: 'PAY-2026-0840', invoiceRef: 'INV-00195', vendor: 'Tech Solutions', amount: 12900, method: 'Direct EFT', valueDate: '2026-08-05', bankAccount: 'Meezan Bank · PK78 MEZN 0000', status: 'Paid' }
  ];

  filteredPayments(): PaymentItem[] {
    const q = this.searchQuery.trim().toLowerCase();
    const sf = this.statusFilter;
    return this.paymentsList.filter(p => {
      const matchQ = !q || (p.paymentRef || '').toLowerCase().includes(q) || (p.invoiceRef || '').toLowerCase().includes(q) || (p.vendor || '').toLowerCase().includes(q) || (p.method || '').toLowerCase().includes(q) || (p.bankAccount || '').toLowerCase().includes(q) || (p.id || '').toLowerCase().includes(q);
      const matchS = !sf || p.status === sf;
      return matchQ && matchS;
    });
  }

  totalPaidValue(): number { return this.paymentsList.filter(p => p.status === 'Paid').reduce((acc, p) => acc + (p.amount || 0), 0); }
  pendingValue(): number { return this.paymentsList.filter(p => p.status !== 'Paid').reduce((acc, p) => acc + (p.amount || 0), 0); }

  addPayment(): void {
    if (!this.newPayment.paymentRef || !this.newPayment.vendor || !this.newPayment.amount) {
      this.state.notify('Error: Payment reference, vendor, and amount are required.');
      return;
    }
    const created: PaymentItem = { ...this.newPayment, id: `PAY-${Math.floor(100 + Math.random() * 900)}` };
    this.paymentsList = [created, ...this.paymentsList];
    this.state.notify(`Payment ${created.paymentRef} ($${created.amount.toLocaleString()}) queued for settlement.`);
    this.resetForm();
    this.showAddPayment = false;
  }

  resetForm(): void {
    this.newPayment = {
      id: '',
      paymentRef: `PAY-2026-${Math.floor(895 + Math.random() * 50)}`,
      invoiceRef: '',
      vendor: '',
      amount: 0,
      method: 'Direct EFT (Bank Transfer)',
      valueDate: '2026-08-30',
      bankAccount: '',
      status: 'Scheduled'
    };
  }

  markPaid(p: PaymentItem): void {
    p.status = 'Paid';
    this.state.notify(`Payment ${p.paymentRef} executed via ${p.method}. Payment advice dispatched.`);
  }

  togglePaymentStatus(p: PaymentItem): void {
    if (p.status === 'Paid') {
      p.status = 'Scheduled';
      this.state.notify(`Disbursement reverted for ${p.paymentRef}. Status returned to Scheduled.`);
    } else {
      p.status = 'Paid';
      this.state.notify(`Payment ${p.paymentRef} executed via ${p.method}. Payment advice dispatched.`);
    }
  }

  markScheduled(p: PaymentItem): void {
    p.status = 'Scheduled';
    this.state.notify(`Payment ${p.paymentRef} released from hold to Scheduled queue.`);
  }

  savePayment(p: PaymentItem): void {
    this.state.notify(`Payment terms for ${p.paymentRef} saved.`);
  }

  deletePayment(id: string): void {
    this.paymentsList = this.paymentsList.filter(p => p.id !== id);
    this.state.notify('Payment schedule record deleted.');
  }

  exportPayments(): void {
    this.state.notify('Exporting payment settlement run report (PDF / Excel)...');
  }
}
