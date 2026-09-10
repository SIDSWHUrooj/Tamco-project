import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';
import { Invoice, InvoiceLine } from '../core/models';

interface ReceiptRecord {
  invoiceNumber: string;
  receiptNumber: string;
  receiptDate: string;
  extendedCost: number;
  currency: string;
  lines: InvoiceLine[];
}

@Component({
  selector: 'app-invoice-page',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent, StatusComponent],
  styles: [`
    .invoice-record-head { background: #00778c; color: #fff; padding: 10px 14px; border-radius: 5px; font-size: 15px; font-weight: 600; }
    .invoice-record-rule { margin: 5px 0 16px; border: 0; border-top: 1px solid forestgreen; }
    .receipt-input-group { display: flex; align-items: stretch; }
    .receipt-input-group input { border-top-right-radius: 0; border-bottom-right-radius: 0; }
    .receipt-search-btn { width: 42px; border: 1px solid #0b1f6b; background: #00008b; color: #fff; border-radius: 0 8px 8px 0; font-size: 16px; }
    .invoice-record-lines thead th { background: #2f8d9e; color: #fff; text-transform: none; letter-spacing: 0; font-size: 12px; }
    .invoice-record-lines tfoot td { border-bottom: 0; font-weight: 700; }
    .invoice-record-lines tfoot input { width: 100%; text-align: right; font-weight: 700; border: 1px solid #dbe3ed; border-radius: 6px; padding: 8px; }
    .receipt-finder-overlay { position: fixed; inset: 0; z-index: 80; background: rgba(7, 18, 40, .45); display: grid; place-items: center; padding: 20px; }
    .receipt-finder { width: min(860px, 100%); background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 18px 50px rgba(7, 22, 43, .28); max-height: 90vh; display: flex; flex-direction: column; }
    .receipt-finder-header { background: #00008b; color: #fff; height: 50px; display: flex; align-items: center; padding: 0 16px; font-size: 18px; font-weight: 600; }
    .receipt-finder-header button { margin-left: auto; background: none; border: 0; color: #fff; font-size: 22px; }
    .receipt-finder-body { padding: 16px; overflow: auto; }
    .receipt-finder-body > input { width: 100%; margin-bottom: 12px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; }
    .receipt-finder tbody tr { cursor: pointer; }
    .receipt-finder tbody tr:hover, .receipt-finder tbody tr.selected { background: #eef5ff; }
    .receipt-finder-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 16px; border-top: 1px solid #edf1f6; }
  `],
  template: `
    <app-page-heading eyebrow="Accounts payable" title="Invoice Management & Processing" [subtitle]="role()==='vendor' ? 'Invoice submission unlocks only after Goods Receipt Note (GRN) and QC acceptance.' : 'Review, verify, match and authorize vendor invoices for ERP payment scheduling.'">
      <div class="heading-actions">
        <button class="btn" (click)="showUploadForm = !showUploadForm">
          {{ showUploadForm ? '✕ Close Form' : '+ Upload New Invoice' }}
        </button>
        <button class="btn secondary" (click)="exportInvoices()">Export Invoices</button>
      </div>
    </app-page-heading>

    <!-- Stats Overview -->
    <section class="stats-grid compact">
      <div class="stat-card">
        <span>Total Invoices</span>
        <strong>{{ invoicesList.length }}</strong>
        <small>Total submissions</small>
      </div>
      <div class="stat-card">
        <span>Total Value ($)</span>
        <strong style="color: #1769e0;">\${{ totalValue().toLocaleString() }}</strong>
        <small>Accounts payable sum</small>
      </div>
      <div class="stat-card">
        <span>Pending Approval</span>
        <strong style="color: #b56b05;">{{ pendingCount() }}</strong>
        <small>Awaiting 3-way match sign-off</small>
      </div>
    </section>

    <!-- Invoice Upload / Submission Panel -->
    @if (showUploadForm) {
      <article class="panel invoice-upload" style="margin-bottom: 18px; border-left: 4px solid #1769e0;">
        <div class="panel-title">
          <div>
            <h2>Upload & Submit Vendor Invoice</h2>
            <p>Select an approved Purchase Order with passed QC inspection to trigger automated 3-way match.</p>
          </div>
        </div>

        <div class="form-grid">
          <label>Invoice Reference # *<input [(ngModel)]="newInvoice.id" placeholder="e.g. INV-00248" /></label>
          <label>Related Purchase Order *
            <select [(ngModel)]="newInvoice.poId" (ngModelChange)="onPoSelected()" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="">-- Select Approved PO --</option>
              <option value="PO-002334">PO-002334 · ABC Supplies (Amount: $18,600 · QC Passed)</option>
              <option value="PO-002345">PO-002345 · ABC Supplies (Amount: $52,000 · QC Pending)</option>
              <option value="PO-002321">PO-002321 · Perfect Industrial (Amount: $43,800 · QC Passed)</option>
              <option value="PO-002315">PO-002315 · Global Traders (Amount: $31,500 · QC Passed)</option>
            </select>
          </label>
          <label>Vendor / Beneficiary Name *<input [(ngModel)]="newInvoice.vendor" placeholder="e.g. ABC Supplies Pvt. Ltd." /></label>
          <label>Total Invoice Amount ($) *<input type="number" [(ngModel)]="newInvoice.amount" placeholder="18600" /></label>
          <label class="span-2">Invoice Attachment (PDF or Stamped Scanned Copy)
            <input type="file" (change)="onFileAttached($event)" />
          </label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetForm()">Reset</button>
          <button class="btn" (click)="uploadInvoice()">Upload & Execute 3-Way Match</button>
        </div>
      </article>
    }

    <article class="panel invoice-record" style="margin-bottom: 18px;">
      <div class="invoice-record-head">Invoice Record</div>
      <hr class="invoice-record-rule" />

      <div class="form-grid">
        <label>Invoice Number
          <input [value]="selectedReceipt().invoiceNumber" readonly />
        </label>
        <label>Receipt
          <div class="receipt-input-group">
            <input [value]="selectedReceipt().receiptNumber" readonly />
            <button type="button" class="receipt-search-btn" (click)="openReceiptFinder()" title="Find Receipt">⌕</button>
          </div>
        </label>
        <label>Invoice Amount
          <input [value]="selectedReceipt().extendedCost.toFixed(2)" readonly />
        </label>
        <label>Invoice Date
          <input [value]="formatDate(selectedReceipt().receiptDate)" readonly />
        </label>
      </div>

      <div class="table-scroll" style="margin-top: 16px;">
        <table class="invoice-record-lines">
          <thead>
            <tr>
              <th>Item Description</th>
              <th>Quantity Received</th>
              <th>UOM</th>
              <th>Currency</th>
              <th>Unit Price</th>
              <th>VAT</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            @for (line of selectedReceipt().lines; track $index) {
              <tr>
                <td>{{ line.itemDescription }}</td>
                <td>{{ line.quantityReceived }}</td>
                <td>{{ line.unitOfMeasure }}</td>
                <td>{{ line.currency }}</td>
                <td>{{ line.unitCost.toFixed(2) }}</td>
                <td>{{ line.vat.toFixed(2) }}</td>
                <td>{{ line.total.toFixed(2) }}</td>
              </tr>
            }
          </tbody>
          <tfoot>
            <tr>
              <td colspan="6" style="text-align: right;">Grand Total ({{ selectedReceipt().currency }}):</td>
              <td><input [value]="receiptGrandTotal().toFixed(2)" readonly /></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </article>

    @if (showReceiptFinder) {
      <div class="receipt-finder-overlay" (click)="closeReceiptFinder()">
        <div class="receipt-finder" (click)="$event.stopPropagation()">
          <div class="receipt-finder-header">
            Invoices
            <button type="button" (click)="closeReceiptFinder()" aria-label="Close">&times;</button>
          </div>
          <div class="receipt-finder-body">
            <input [(ngModel)]="receiptQuery" placeholder="Search invoice or receipt..." />
            <table>
              <thead><tr><th>Item Description</th><th>Quantity Received</th><th>UOM</th></tr></thead>
              <tbody>
                @for (receipt of filteredReceipts(); track receipt.receiptNumber) {
                  <tr [class.selected]="receipt.receiptNumber === pendingReceipt" (click)="pendingReceipt = receipt.receiptNumber">
                    <td>{{ receipt.lines[0]?.itemDescription }}</td>
                    <td>{{ receipt.lines[0]?.quantityReceived }}</td>
                    <td>{{ receipt.lines[0]?.unitOfMeasure }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="receipt-finder-footer">
            <button type="button" class="btn danger-btn" (click)="closeReceiptFinder()">Close</button>
            <button type="button" class="btn" (click)="confirmReceipt()">Select</button>
          </div>
        </div>
      </div>
    }

    <!-- Search & Filter Bar -->
    <div style="display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap;">
      <input
        style="flex: 1; min-width: 240px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px;"
        [(ngModel)]="searchQuery"
        placeholder="🔍 Search invoices by invoice #, PO #, or supplier..."
      />
      <select
        style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; background: #fff;"
        [(ngModel)]="statusFilter"
      >
        <option value="">All Statuses</option>
        <option value="Approved">Approved</option>
        <option value="Pending">Pending</option>
        <option value="Paid">Paid</option>
        <option value="Rejected">Rejected</option>
      </select>
    </div>

    <!-- Invoice Register Table -->
    <article class="panel">
      <div class="panel-title">
        <div>
          <h2>Invoice Register & Matching Status</h2>
          <p>Real-time reconciliation of Purchase Order, Goods Receipt, and Invoiced Value</p>
        </div>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>PO #</th>
              <th>Supplier Name</th>
              <th>Amount ($)</th>
              <th>3-Way Match</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (inv of filteredInvoices(); track inv.id) {
              <tr>
                <td><span class="mono">{{ inv.id }}</span></td>
                <td><input [(ngModel)]="inv.poId" style="width: 100px; font-family: monospace;" /></td>
                <td><input [(ngModel)]="inv.vendor" style="font-weight: 600;" /></td>
                <td><input type="number" [(ngModel)]="inv.amount" style="width: 85px;" /></td>
                <td>
                  <app-status [text]="inv.match" [good]="inv.match==='Matched'" [warn]="inv.match==='Pending'" [bad]="inv.match==='Mismatch'" />
                </td>
                <td>
                  <app-status [text]="inv.status" [good]="inv.status==='Approved' || inv.status==='Paid'" [warn]="inv.status==='Pending'" [bad]="inv.status==='Rejected'" />
                </td>
                <td>
                  <div style="display: flex; gap: 5px;">
                    @if (role() !== 'vendor' && inv.status === 'Pending') {
                      <button class="btn small" (click)="approveInvoice(inv)">Approve</button>
                      <button class="btn small danger-btn" (click)="rejectInvoice(inv)">Reject</button>
                    }
                    <button class="btn small ghost" (click)="saveInvoice(inv)">Save</button>
                    @if (role() !== 'vendor') {
                      <button class="btn small danger-btn" (click)="deleteInvoice(inv.id)">✕</button>
                    }
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
export class InvoicePageComponent {
  readonly state = inject(PortalStateService);
  readonly role = computed(() => this.state.role());

  showUploadForm = false;
  showReceiptFinder = false;
  searchQuery = '';
  statusFilter = '';
  receiptQuery = '';
  pendingReceipt = 'RCPT-0001';

  newInvoice: Invoice = {
    id: 'INV-00248',
    poId: 'PO-002334',
    vendor: 'ABC Supplies Pvt. Ltd.',
    amount: 18600,
    status: 'Pending',
    match: 'Matched'
  };

  invoicesList: Invoice[] = [
    { id: 'INV-00245', poId: 'PO-002334', vendor: 'ABC Supplies Pvt. Ltd.', amount: 18600, status: 'Pending', match: 'Matched' },
    { id: 'INV-00246', poId: 'PO-002301', vendor: 'Global Traders', amount: 8750, status: 'Approved', match: 'Matched' },
    { id: 'INV-00247', poId: 'PO-002299', vendor: 'Tech Solutions', amount: 12900, status: 'Rejected', match: 'Mismatch' },
    { id: 'INV-00242', poId: 'PO-002280', vendor: 'Perfect Industrial', amount: 43800, status: 'Paid', match: 'Matched' }
  ];

  receipts: ReceiptRecord[] = [
    {
      invoiceNumber: 'INV-00245', receiptNumber: 'RCPT-0001', receiptDate: '2026-08-20', extendedCost: 18600, currency: 'USD',
      lines: [
        this.makeReceiptLine('FR Coverall - Arc Rated', 40, 'SET', 'USD', 185),
        this.makeReceiptLine('Safety Helmet with Visor', 40, 'PCS', 'USD', 42),
        this.makeReceiptLine('Insulated Gloves Class 2', 20, 'PAIR', 'USD', 68)
      ]
    },
    {
      invoiceNumber: 'INV-00242', receiptNumber: 'RCPT-0002', receiptDate: '2026-08-18', extendedCost: 43800, currency: 'USD',
      lines: [
        this.makeReceiptLine('Pump Mechanical Seal Kit', 6, 'PCS', 'USD', 1450),
        this.makeReceiptLine('Impeller Assembly 150mm', 2, 'SET', 'USD', 12800)
      ]
    }
  ];

  filteredInvoices = computed(() => {
    let list = this.invoicesList;
    if (this.role() === 'vendor') {
      list = list.filter(inv => inv.vendor.includes('ABC Supplies'));
    }
    const q = this.searchQuery.trim().toLowerCase();
    const st = this.statusFilter;
    return list.filter(inv => {
      const matchQ = !q || inv.id.toLowerCase().includes(q) || inv.poId.toLowerCase().includes(q) || inv.vendor.toLowerCase().includes(q);
      const matchSt = !st || inv.status === st;
      return matchQ && matchSt;
    });
  });

  totalValue = computed(() => this.invoicesList.reduce((acc, i) => acc + (i.amount || 0), 0));
  pendingCount = computed(() => this.invoicesList.filter(i => i.status === 'Pending').length);

  filteredReceipts(): ReceiptRecord[] {
    const query = this.receiptQuery.trim().toLowerCase();
    return this.receipts.filter(receipt =>
      !query || receipt.invoiceNumber.toLowerCase().includes(query) || receipt.receiptNumber.toLowerCase().includes(query)
    );
  }

  selectedReceipt(): ReceiptRecord {
    return this.receipts.find(receipt => receipt.receiptNumber === this.pendingReceipt) ?? this.receipts[0];
  }

  receiptGrandTotal(): number {
    return this.selectedReceipt().lines.reduce((sum, line) => sum + line.total + line.vat, 0);
  }

  makeReceiptLine(itemDescription: string, quantityReceived: number, unitOfMeasure: string, currency: string, unitCost: number): InvoiceLine {
    const total = +(quantityReceived * unitCost).toFixed(2);
    return { itemDescription, quantityReceived, unitOfMeasure, currency, unitCost, vat: +(total * 0.17).toFixed(2), total };
  }

  formatDate(date: string): string {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return date;
    return `${String(parsedDate.getDate()).padStart(2, '0')}/${String(parsedDate.getMonth() + 1).padStart(2, '0')}/${parsedDate.getFullYear()}`;
  }

  openReceiptFinder(): void {
    this.receiptQuery = '';
    this.showReceiptFinder = true;
  }

  closeReceiptFinder(): void {
    this.showReceiptFinder = false;
  }

  confirmReceipt(): void {
    if (!this.pendingReceipt) {
      this.state.notify('Select a receipt first.');
      return;
    }
    this.closeReceiptFinder();
  }

  onPoSelected(): void {
    if (this.newInvoice.poId === 'PO-002334') {
      this.newInvoice.vendor = 'ABC Supplies Pvt. Ltd.';
      this.newInvoice.amount = 18600;
    } else if (this.newInvoice.poId === 'PO-002321') {
      this.newInvoice.vendor = 'Perfect Industrial';
      this.newInvoice.amount = 43800;
    } else if (this.newInvoice.poId === 'PO-002315') {
      this.newInvoice.vendor = 'Global Traders';
      this.newInvoice.amount = 31500;
    }
  }

  uploadInvoice(): void {
    if (!this.newInvoice.id || !this.newInvoice.poId || !this.newInvoice.amount) {
      this.state.notify('Error: Invoice reference, PO reference and amount are required.');
      return;
    }
    const match: 'Matched' | 'Mismatch' = (this.newInvoice.poId === 'PO-002345') ? 'Mismatch' : 'Matched';
    const created: Invoice = { ...this.newInvoice, match, status: 'Pending' };
    this.invoicesList = [created, ...this.invoicesList];
    this.state.notify(`Invoice ${created.id} uploaded. 3-Way match result: ${match}.`);
    this.resetForm();
    this.showUploadForm = false;
  }

  resetForm(): void {
    this.newInvoice = {
      id: `INV-00${Math.floor(250 + Math.random() * 50)}`,
      poId: '',
      vendor: '',
      amount: 0,
      status: 'Pending',
      match: 'Pending'
    };
  }

  approveInvoice(inv: Invoice): void {
    inv.status = 'Approved';
    this.state.notify(`Invoice ${inv.id} approved for payment release.`);
  }

  rejectInvoice(inv: Invoice): void {
    inv.status = 'Rejected';
    this.state.notify(`Invoice ${inv.id} rejected.`);
  }

  saveInvoice(inv: Invoice): void {
    this.state.notify(`Invoice ${inv.id} updated.`);
  }

  deleteInvoice(id: string): void {
    this.invoicesList = this.invoicesList.filter(i => i.id !== id);
    this.state.notify(`Invoice ${id} deleted.`);
  }

  onFileAttached(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      this.state.notify(`Invoice attachment "${file.name}" linked.`);
    }
  }

  exportInvoices(): void {
    this.state.notify('Exporting Accounts Payable Invoice Register (Excel)...');
  }
}
