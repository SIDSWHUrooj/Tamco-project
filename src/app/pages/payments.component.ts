import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';

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
  imports: [FormsModule, PageHeadingComponent, StatusComponent],
  template: `
    <app-page-heading eyebrow="Financial Settlement" title="Payments & Disbursements" subtitle="Manage payment runs, electronic fund transfers (EFT), batch processing and vendor payment advice.">
      <div class="heading-actions">
        <button class="btn" (click)="showAddPayment = !showAddPayment">
          {{ showAddPayment ? '✕ Close Form' : '+ Schedule New Payment' }}
        </button>
        <button class="btn secondary" (click)="exportPayments()">Export Payment Advice</button>
      </div>
    </app-page-heading>

    <!-- Stats Overview -->
    <section class="stats-grid compact">
      <div class="stat-card">
        <span>Total Payments</span>
        <strong>{{ paymentsList.length }}</strong>
        <small>Disbursement entries</small>
      </div>
      <div class="stat-card">
        <span>Total Disbursed ($)</span>
        <strong style="color: #16855b;">\${{ totalPaidValue().toLocaleString() }}</strong>
        <small>Settled this month</small>
      </div>
      <div class="stat-card">
        <span>Pending Release ($)</span>
        <strong style="color: #b56b05;">\${{ pendingValue().toLocaleString() }}</strong>
        <small>Scheduled for processing</small>
      </div>
    </section>

    <!-- Add Payment Form -->
    @if (showAddPayment) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid #1769e0;">
        <div class="panel-title">
          <div>
            <h2>Schedule Vendor Disbursement</h2>
            <p>Select approved invoice, specify payment method and value release date.</p>
          </div>
        </div>

        <div class="form-grid">
          <label>Payment Reference # *<input [(ngModel)]="newPayment.paymentRef" placeholder="e.g. PAY-2026-0895" /></label>
          <label>Approved Invoice # *<input [(ngModel)]="newPayment.invoiceRef" placeholder="e.g. INV-00245" /></label>
          <label>Beneficiary Vendor *<input [(ngModel)]="newPayment.vendor" placeholder="e.g. ABC Supplies Pvt. Ltd." /></label>
          <label>Payment Amount ($) *<input type="number" [(ngModel)]="newPayment.amount" placeholder="18600" /></label>
          <label>Payment Channel / Method
            <select [(ngModel)]="newPayment.method" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="Direct EFT (Bank Transfer)">Direct EFT (Bank Transfer)</option>
              <option value="RTGS Urgent Transfer">RTGS Urgent Transfer</option>
              <option value="Corporate Pay Order">Corporate Pay Order</option>
              <option value="Letter of Credit (LC)">Letter of Credit (LC)</option>
            </select>
          </label>
          <label>Value / Settlement Date *<input type="date" [(ngModel)]="newPayment.valueDate" /></label>
          <label class="span-2">Beneficiary Bank & IBAN<input [(ngModel)]="newPayment.bankAccount" placeholder="HBL · PK00 HABB 0000 1234 5678 9012" /></label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetForm()">Reset</button>
          <button class="btn" (click)="addPayment()">Queue for Settlement</button>
        </div>
      </article>
    }

    <!-- Search & Filter Bar -->
    <div style="display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap;">
      <input
        style="flex: 1; min-width: 240px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px;"
        [(ngModel)]="searchQuery"
        placeholder="🔍 Search payments by reference, invoice, or supplier..."
      />
      <select
        style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; background: #fff;"
        [(ngModel)]="statusFilter"
      >
        <option value="">All Statuses</option>
        <option value="Scheduled">Scheduled</option>
        <option value="Processing">Processing</option>
        <option value="Paid">Paid (Settled)</option>
        <option value="On Hold">On Hold</option>
      </select>
    </div>

    <!-- Live Payments Table -->
    <article class="panel">
      <div class="panel-title">
        <div>
          <h2>Payment Run Schedule & History</h2>
          <p>Electronic fund transfers and corporate banking settlements</p>
        </div>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Payment Ref</th>
              <th>Invoice Ref</th>
              <th>Beneficiary Vendor</th>
              <th>Amount ($)</th>
              <th>Method</th>
              <th>Value Date</th>
              <th>Bank Account</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (p of filteredPayments(); track p.id) {
              <tr>
                <td><span class="mono">{{ p.paymentRef }}</span></td>
                <td><input [(ngModel)]="p.invoiceRef" style="width: 90px; font-family: monospace;" /></td>
                <td><input [(ngModel)]="p.vendor" style="font-weight: 600;" /></td>
                <td><input type="number" [(ngModel)]="p.amount" style="width: 85px;" /></td>
                <td><input [(ngModel)]="p.method" /></td>
                <td><input type="date" [(ngModel)]="p.valueDate" /></td>
                <td><input [(ngModel)]="p.bankAccount" /></td>
                <td>
                  <app-status [text]="p.status" [good]="p.status==='Paid'" [warn]="p.status==='Scheduled' || p.status==='Processing'" [bad]="p.status==='On Hold'" />
                </td>
                <td>
                  <div style="display: flex; gap: 5px;">
                    @if (p.status === 'Scheduled' || p.status === 'Processing') {
                      <button class="btn small" (click)="markPaid(p)">Execute</button>
                    }
                    <button class="btn small ghost" (click)="savePayment(p)">Save</button>
                    <button class="btn small danger-btn" (click)="deletePayment(p.id)">✕</button>
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
export class PaymentsComponent {
  readonly state = inject(PortalStateService);

  showAddPayment = false;
  searchQuery = '';
  statusFilter = '';

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

  filteredPayments = computed(() => {
    const q = this.searchQuery.trim().toLowerCase();
    const sf = this.statusFilter;
    return this.paymentsList.filter(p => {
      const matchQ = !q || p.paymentRef.toLowerCase().includes(q) || p.invoiceRef.toLowerCase().includes(q) || p.vendor.toLowerCase().includes(q);
      const matchS = !sf || p.status === sf;
      return matchQ && matchS;
    });
  });

  totalPaidValue = computed(() => this.paymentsList.filter(p => p.status === 'Paid').reduce((acc, p) => acc + (p.amount || 0), 0));
  pendingValue = computed(() => this.paymentsList.filter(p => p.status !== 'Paid').reduce((acc, p) => acc + (p.amount || 0), 0));

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
