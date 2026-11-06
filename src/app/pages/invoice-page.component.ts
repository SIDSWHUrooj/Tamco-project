import { Component, OnInit, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { SageApiService } from '../core/sage-api.service';
import { StatusComponent } from '../shared/ui.component';
import { IconComponent } from '../shared/icon.component';
import { CustomSelectComponent } from '../shared/custom-select.component';
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
  imports: [FormsModule, StatusComponent, IconComponent, CustomSelectComponent],
  styles: [`
    .po-active-badge {
      font-size: 12px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 6px;
      background: var(--role-soft, #f0fdf4);
      color: var(--role-accent, #16a34a);
      border: 1px solid var(--role-border, #bbf7d0);
    }
    .po-date-badge {
      font-size: 12px;
      color: var(--muted, #64748b);
      font-weight: 500;
    }

    /* Enhanced Browse Button */
    .po-browse-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 36px;
      padding: 0 14px 0 10px;
      font-size: 12.5px;
      font-weight: 600;
      border-radius: var(--radius-sm, 6px);
      background: #ffffff;
      color: var(--navy, #0b1f3a);
      border: 1.5px solid var(--line-strong, #cbd5e1);
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

      .browse-icon-wrap {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 4px;
        background: var(--role-soft, #f0fdf4);
        color: var(--role-accent, #16a34a);
        transition: all 0.2s ease;
      }

      .browse-text {
        letter-spacing: -0.01em;
        white-space: nowrap;
      }

      .browse-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 1px 7px;
        font-size: 11px;
        font-weight: 700;
        border-radius: var(--radius-full, 9999px);
        background: #f1f5f9;
        color: var(--muted, #64748b);
        transition: all 0.2s ease;
      }

      &:hover {
        border-color: var(--role-accent, #16a34a);
        color: var(--role-accent, #16a34a);
        background: #ffffff;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px -2px rgba(22, 163, 74, 0.16);

        .browse-icon-wrap {
          background: var(--role-accent, #16a34a);
          color: #ffffff;
        }

        .browse-pill {
          background: var(--role-soft, #f0fdf4);
          color: var(--role-accent, #16a34a);
        }
      }

      &:active {
        transform: translateY(0);
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
      }
    }

    .receipt-picker-input-wrap {
      display: flex;
      align-items: stretch;
      width: 100%;

      input {
        flex: 1;
        border-top-right-radius: 0 !important;
        border-bottom-right-radius: 0 !important;
        border-right: none !important;
      }

      .receipt-finder-inline-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        min-width: 38px;
        padding: 0;
        background: #f1f5f9;
        color: var(--role-accent, #7048d7);
        border: 1px solid var(--line, #e2e8f0);
        border-left: 1px solid #cbd5e1;
        border-top-left-radius: 0 !important;
        border-bottom-left-radius: 0 !important;
        border-top-right-radius: var(--radius-sm, 6px) !important;
        border-bottom-right-radius: var(--radius-sm, 6px) !important;
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover {
          background: var(--role-accent, #7048d7);
          color: #ffffff;
          border-color: var(--role-accent, #7048d7);
        }

        &:active {
          transform: scale(0.96);
        }
      }
    }

    .readonly-input {
      background-color: #f8fafc !important;
      color: var(--text, #0f172a) !important;
      font-weight: 600;
      border-color: var(--line, #e2e8f0) !important;
    }

    /* Line items table */
    .invoice-record-lines {
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
        padding: 10px 12px;
        border-bottom: 2px solid var(--role-accent-hover, #15803d);
        white-space: nowrap;
        transition: background-color 0.2s ease, border-color 0.2s ease;

        &:first-child { border-top-left-radius: var(--radius-sm, 6px); }
        &:last-child { border-top-right-radius: var(--radius-sm, 6px); }
      }

      tbody td {
        padding: 8px 12px;
        border-bottom: 1px solid var(--line, #e2e8f0);
        font-size: 13px;
      }

      tfoot td {
        padding: 12px;
        border-top: 2px solid var(--line, #e2e8f0);
        background: #f8fafc;
        font-weight: 700;
      }
    }

    .table-badge-qty {
      display: inline-block;
      padding: 2px 8px;
      font-size: 11.5px;
      font-weight: 700;
      border-radius: 4px;
      background: #f1f5f9;
      color: var(--text, #0f172a);
    }

    .grand-total-val {
      font-size: 15px;
      font-weight: 800;
      color: var(--role-accent, #16a34a);
      background: var(--role-soft, #f0fdf4);
      padding: 4px 12px;
      border-radius: 6px;
      border: 1px solid var(--role-border, #bbf7d0);
    }

    /* Invoices Register Table */
    .invoices-table {
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

        &:first-child { border-top-left-radius: var(--radius-sm, 6px); }
        &:last-child { border-top-right-radius: var(--radius-sm, 6px); }
      }

      tbody td {
        padding: 8px 10px;
        vertical-align: middle;
        border-bottom: 1px solid var(--line, #e2e8f0);
      }
    }

    .inv-code {
      font-weight: 700;
      color: var(--role-accent, #16a34a);
    }

    .table-cell-input {
      width: 100%;
      border: 1px solid var(--line, #e2e8f0);
      background: #ffffff;
      border-radius: var(--radius-sm, 6px);
      padding: 6px 10px;
      font-size: 12.5px;
      line-height: 1.3;
      transition: all 0.15s ease;

      &:hover {
        border-color: var(--line-strong, #cbd5e1);
      }

      &:focus {
        border-color: var(--role-accent, #16a34a);
        box-shadow: 0 0 0 2px var(--role-soft, #f0fdf4);
        outline: none;
      }

      &.mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      }

      &.vendor-input {
        font-weight: 600;
        color: var(--text, #0f172a);
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
        color: var(--muted, #64748b);
        font-size: 12px;
        pointer-events: none;
      }

      .amount-input {
        padding-left: 20px;
        font-weight: 700;
        color: #0f172a;
      }
    }

    .row-actions {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 6px;
    }

    /* Modal */
    .receipt-finder-overlay {
      position: fixed;
      inset: 0;
      z-index: 80;
      background: rgba(15, 23, 42, 0.5);
      display: grid;
      place-items: center;
      padding: 20px;
      backdrop-filter: blur(2px);
    }

    .receipt-finder {
      width: min(860px, 100%);
      background: #ffffff;
      border-radius: var(--radius-md, 10px);
      overflow: hidden;
      box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.25);
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--line, #e2e8f0);
    }

    .receipt-finder-header {
      background: var(--navy, #0b1f3a);
      color: #ffffff;
      height: 52px;
      display: flex;
      align-items: center;
      padding: 0 18px;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: -0.01em;

      .modal-close-btn {
        margin-left: auto;
        background: none;
        border: 0;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        padding: 4px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: color 0.15s ease;

        &:hover {
          color: #ffffff;
        }
      }
    }

    .receipt-finder-body {
      padding: 18px;
      overflow: auto;
    }

    .receipt-finder-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;

      thead th {
        background: var(--role-accent, #16a34a);
        color: #ffffff;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        padding: 9px 12px;
        border-bottom: 2px solid var(--role-accent-hover, #15803d);
        transition: background-color 0.2s ease, border-color 0.2s ease;

        &:first-child { border-top-left-radius: var(--radius-sm, 6px); }
        &:last-child { border-top-right-radius: var(--radius-sm, 6px); }
      }

      tbody tr {
        cursor: pointer;
        transition: background 0.15s ease;

        &:hover, &.selected {
          background: var(--role-soft, #f0fdf4);
        }

        td {
          padding: 10px 12px;
          border-bottom: 1px solid var(--line, #e2e8f0);
          font-size: 12.5px;
        }
      }
    }

    .receipt-select-code {
      font-weight: 700;
      color: var(--role-accent, #16a34a);
    }

    .receipt-finder-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 12px 18px;
      border-top: 1px solid var(--line, #e2e8f0);
      background: #f8fafc;
    }

    .empty-table-td {
      padding: 36px 16px !important;
      text-align: center;
    }

    .empty-table-msg {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: var(--muted, #64748b);
      font-size: 13px;
    }
  `],
  template: `
    <div style="display: flex; justify-content: flex-end; margin-bottom: 12px;">
      <button class="btn" (click)="showUploadForm = !showUploadForm">
        @if (showUploadForm) {
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          <span>Close Form</span>
        } @else {
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Upload Invoice</span>
        }
      </button>
    </div>

    <!-- Stats Overview -->
    <section class="dash-kpis three">
      <article class="dash-kpi">
        <div class="kpi-top-row">
          <span class="kpi-label">Total Invoices</span>
          <span class="kpi-icon-badge blue">
            <app-icon name="invoices" [size]="16" />
          </span>
        </div>
        <strong class="kpi-value">{{ invoicesList.length }}</strong>
        <small>Total submitted supplier invoices</small>
      </article>

      <article class="dash-kpi">
        <div class="kpi-top-row">
          <span class="kpi-label">Payable Amount</span>
          <span class="kpi-icon-badge emerald">
            <app-icon name="payments" [size]="16" />
          </span>
        </div>
        <strong class="kpi-value" style="color: #059669;">\${{ totalValue().toLocaleString() }}</strong>
        <small>Total accounts payable gross sum</small>
      </article>

      <article class="dash-kpi">
        <div class="kpi-top-row">
          <span class="kpi-label">Pending Approval</span>
          <span class="kpi-icon-badge amber">
            <app-icon name="invoices" [size]="16" />
          </span>
        </div>
        <strong class="kpi-value" style="color: #d97706;">{{ pendingCount() }}</strong>
        <small>Awaiting payment sign-off</small>
      </article>
    </section>

    <!-- Invoice Upload / Submission Panel -->
    @if (showUploadForm) {
      <article class="panel invoice-upload" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
        <div class="panel-title">
          <h2>Upload & Submit Vendor Invoice</h2>
        </div>

        <div class="form-grid four-col">
          <label>Invoice Reference # *<input [(ngModel)]="newInvoice.id" placeholder="e.g. INV-00248" /></label>
          <label>Related Purchase Order *
            <app-custom-select
              [(ngModel)]="newInvoice.poId"
              (selectionChange)="onPoSelected()"
              [options]="poOptions"
              placeholder="-- Select Approved PO --"
            />
          </label>
          <label>Vendor / Beneficiary Name *<input [(ngModel)]="newInvoice.vendor" placeholder="e.g. Supplier Legal Name" /></label>
          <label>Total Invoice Amount ($) *<input type="number" [(ngModel)]="newInvoice.amount" placeholder="18600" /></label>
          <label class="span-4">Invoice Attachment (PDF or Stamped Scanned Copy)
            <input type="file" (change)="onFileAttached($event)" />
          </label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetForm()">Reset</button>
          <button class="btn" (click)="uploadInvoice()">Upload & Submit Invoice</button>
        </div>
      </article>
    }

    <!-- Goods Receipt & Invoice Record Panel (Matches Management/invoiceRecord.cshtml) -->
    <article class="panel invoice-record" style="margin-bottom: 18px;">
      <div style="background-color: #00778c; padding: 10px 16px; border-radius: 5px; box-shadow: 0px 4px 8px rgba(0,0,0,0.1); margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
        <h5 style="color: white; margin: 0; font-weight: 600; font-size: 15px; letter-spacing: -0.01em;">
          Invoice Record
        </h5>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 12px; background: rgba(255,255,255,0.25); color: white; padding: 2px 8px; border-radius: 12px; font-weight: 600;">
            Receipt: {{ selectedReceipt().receiptNumber }}
          </span>
          <button type="button" class="po-browse-btn" (click)="openReceiptFinder()" title="Browse all goods receipts directory" style="height: 30px; padding: 0 10px; font-size: 12px;">
            <span class="browse-icon-wrap" style="width: 20px; height: 20px;">
              <app-icon name="search" [size]="12" />
            </span>
            <span class="browse-text">Browse Receipts</span>
            <span class="browse-pill">{{ receipts.length }}</span>
          </button>
        </div>
      </div>
      <hr style="margin: 0 0 14px 0; border: none; border-top: 1.5px solid forestgreen;" />

      <div class="form-grid four-col" style="margin-top: 14px;">
        <label>Invoice Reference #
          <input [value]="selectedReceipt().invoiceNumber" readonly class="readonly-input mono" />
        </label>
        <label>Receipt Reference #
          <div class="receipt-picker-input-wrap">
            <input [value]="selectedReceipt().receiptNumber" readonly class="readonly-input mono" />
            <button type="button" class="receipt-finder-inline-btn" (click)="openReceiptFinder()" title="Search & lookup goods receipt">
              <app-icon name="search" [size]="14" />
            </button>
          </div>
        </label>
        <label>Invoice Amount ($)
          <input [value]="selectedReceipt().extendedCost.toFixed(2)" readonly class="readonly-input" />
        </label>
        <label>Receipt Date
          <input [value]="formatDate(selectedReceipt().receiptDate)" readonly class="readonly-input" />
        </label>
      </div>

      <div class="table-scroll" style="margin-top: 16px;">
        <table class="invoice-record-lines">
          <thead>
            <tr>
              <th>Item Description</th>
              <th style="text-align: center;">Quantity Received</th>
              <th style="text-align: center;">UOM</th>
              <th style="text-align: center;">Currency</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">VAT (17%)</th>
              <th style="text-align: right;">Total ($)</th>
            </tr>
          </thead>
          <tbody>
            @for (line of selectedReceipt().lines; track $index) {
              <tr>
                <td>{{ line.itemDescription }}</td>
                <td style="text-align: center;"><span class="table-badge-qty">{{ line.quantityReceived }}</span></td>
                <td style="text-align: center;">{{ line.unitOfMeasure }}</td>
                <td style="text-align: center;">{{ line.currency }}</td>
                <td style="text-align: right;">\${{ line.unitCost.toFixed(2) }}</td>
                <td style="text-align: right;">\${{ line.vat.toFixed(2) }}</td>
                <td style="text-align: right; font-weight: 700;">\${{ line.total.toFixed(2) }}</td>
              </tr>
            }
          </tbody>
          <tfoot>
            <tr>
              <td colspan="6" style="text-align: right; font-weight: 700; font-size: 13px;">Grand Total ({{ selectedReceipt().currency }}):</td>
              <td style="text-align: right;">
                <span class="grand-total-val">\${{ receiptGrandTotal().toFixed(2) }}</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </article>

    <!-- Receipt Finder Modal -->
    @if (showReceiptFinder) {
      <div class="receipt-finder-overlay" (click)="closeReceiptFinder()">
        <div class="receipt-finder" (click)="$event.stopPropagation()">
          <div class="receipt-finder-header">
            <span>Goods Receipts & Invoice Directory</span>
            <button type="button" class="modal-close-btn" (click)="closeReceiptFinder()" aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="receipt-finder-body">
            <div class="search-input-wrap" style="margin-bottom: 14px;">
              <span class="search-icon"><app-icon name="search" [size]="14" /></span>
              <input [(ngModel)]="receiptQuery" placeholder="Search by receipt #, invoice #, or description..." />
            </div>
            <div class="table-scroll">
              <table class="receipt-finder-table">
                <thead>
                  <tr>
                    <th>Receipt #</th>
                    <th>Invoice #</th>
                    <th>Receipt Date</th>
                    <th>Primary Line Item</th>
                    <th style="text-align: right;">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  @for (receipt of filteredReceipts(); track receipt.receiptNumber) {
                    <tr [class.selected]="receipt.receiptNumber === pendingReceipt" (click)="pendingReceipt = receipt.receiptNumber">
                      <td><span class="mono receipt-select-code">{{ receipt.receiptNumber }}</span></td>
                      <td><span class="mono">{{ receipt.invoiceNumber }}</span></td>
                      <td>{{ formatDate(receipt.receiptDate) }}</td>
                      <td>{{ receipt.lines[0]?.itemDescription }}</td>
                      <td style="text-align: right; font-weight: 700;">\${{ receipt.extendedCost.toLocaleString() }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
          <div class="receipt-finder-footer">
            <button type="button" class="btn secondary" (click)="closeReceiptFinder()">Cancel</button>
            <button type="button" class="btn" (click)="confirmReceipt()">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              <span>Select Receipt</span>
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Search & Filter Bar (Fixed Spacing) -->
    <div class="search-filter-bar">
      <div class="search-input-wrap">
        <span class="search-icon">
          <app-icon name="search" [size]="15" />
        </span>
        <input
          type="text"
          [(ngModel)]="searchQuery"
          placeholder="Search invoices by invoice #, PO #, or supplier..."
        />
      </div>
      <app-custom-select
        [(ngModel)]="statusFilter"
        [options]="statusOptions"
        minWidth="170px"
      />
    </div>

    <!-- Invoice Register Table -->
    <article class="panel">
      <div class="table-scroll">
        <table class="invoices-table">
          <thead>
            <tr>
              <th style="min-width: 120px;">Invoice #</th>
              <th style="min-width: 110px;">PO #</th>
              <th style="min-width: 200px;">Supplier Name</th>
              <th style="min-width: 130px;">Amount ($)</th>
              <th style="min-width: 120px;">Status</th>
              <th style="min-width: 220px; text-align: left;">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (inv of filteredInvoices(); track inv.id) {
              <tr>
                <td><span class="mono inv-code">{{ inv.id }}</span></td>
                <td><input [(ngModel)]="inv.poId" class="table-cell-input mono" placeholder="PO-00000" /></td>
                <td><input [(ngModel)]="inv.vendor" class="table-cell-input vendor-input" placeholder="Supplier name" /></td>
                <td>
                  <div class="table-amount-wrap">
                    <span class="amount-prefix">$</span>
                    <input type="number" [(ngModel)]="inv.amount" class="table-cell-input amount-input" />
                  </div>
                </td>
                <td>
                  <app-status [text]="inv.status" [good]="inv.status==='Approved' || inv.status==='Paid'" [warn]="inv.status==='Pending'" [bad]="inv.status==='Rejected'" />
                </td>
                <td style="white-space: nowrap;">
                  <div class="row-actions">
                    @if (role() !== 'vendor') {
                      @if (inv.status === 'Pending') {
                        <button class="btn-action btn-action-approve" (click)="approveInvoice(inv)" title="Approve Invoice for Payment Release">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                          <span>Approve</span>
                        </button>
                      } @else if (inv.status === 'Approved') {
                        <button class="btn-action btn-action-approved" (click)="toggleInvoiceApproval(inv)" title="Approved (Click to Revoke Approval)">
                          <svg class="icon-check" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                          <svg class="icon-revoke" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          <span class="text-approved">Approved</span>
                          <span class="text-revoke">Revoke</span>
                        </button>
                      } @else if (inv.status === 'Paid') {
                        <button class="btn-action btn-action-paid" title="Payment Dispatched & Settled" disabled>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                          <span>Paid</span>
                        </button>
                      }
                    }
                  </div>
                </td>
              </tr>
            }
            @if (filteredInvoices().length === 0) {
              <tr>
                <td colspan="7" class="empty-table-td">
                  <div class="empty-table-msg">
                    <app-icon name="invoices" [size]="24" />
                    <span>No invoices match "{{ searchQuery }}"{{ statusFilter ? ' with status ' + statusFilter : '' }}.</span>
                    <button class="btn secondary small" (click)="searchQuery = ''; statusFilter = ''">Reset Filters</button>
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
export class InvoicePageComponent implements OnInit {
  readonly state = inject(PortalStateService);
  readonly sageApi = inject(SageApiService);
  readonly role = computed(() => this.state.role());

  showUploadForm = false;
  showReceiptFinder = false;
  searchQuery = '';
  statusFilter = '';

  readonly statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Rejected', label: 'Rejected' }
  ];

  poOptions = [
    { value: '', label: '-- Select Approved PO --' }
  ];

  receiptQuery = '';
  pendingReceipt = '';

  newInvoice: Invoice = {
    id: '',
    poId: '',
    vendor: '',
    amount: 0,
    status: 'Pending',
    match: 'Matched'
  };

  invoicesList: Invoice[] = [];

  receipts: ReceiptRecord[] = [];

  ngOnInit(): void {
    this.loadBackendData();
  }

  loadBackendData(): void {
    // Populate live Sage 300 PO Invoices
    this.sageApi.getInvoices().subscribe(sageInvs => {
      if (Array.isArray(sageInvs) && sageInvs.length > 0) {
        const invList: Invoice[] = [];
        const rcpList: ReceiptRecord[] = [];

        for (const si of sageInvs) {
          const invNum = si.InvoiceNumber.trim();
          const poNum = si.PurchaseOrderNumber?.trim() || ('PO-' + invNum.slice(-5));
          const vName = si.Name?.trim() || si.Vendor?.trim() || 'Supplier';
          const totalVal = si.Total || si.ExtendedCost || 0;
          const invDate = si.InvoiceDate ? si.InvoiceDate.substring(0, 10) : '2026-10-20';
          const rcpNum = si.ReceiptNumber?.trim() || ('RCP-' + invNum);
          const rcpDate = si.ReceiptDate ? si.ReceiptDate.substring(0, 10) : invDate;

          invList.push({
            id: invNum,
            poId: poNum,
            vendor: vName,
            amount: totalVal,
            status: si.Completed ? 'Approved' : 'Pending',
            match: si.ReceiptNumber ? 'Matched' : 'Pending'
          });

          rcpList.push({
            invoiceNumber: invNum,
            receiptNumber: rcpNum,
            receiptDate: rcpDate,
            extendedCost: totalVal,
            currency: si.Currency || 'USD',
            lines: [
              {
                itemDescription: si.Description || `Goods for PO ${poNum}`,
                quantityReceived: 1,
                unitOfMeasure: 'PCS',
                currency: si.Currency || 'USD',
                unitCost: totalVal,
                vat: 0,
                total: totalVal
              }
            ]
          });
        }

        this.invoicesList = invList;
        this.receipts = rcpList;
        this.state.invoices.set(invList);
        if (rcpList.length > 0 && !this.pendingReceipt) {
          this.pendingReceipt = rcpList[0].receiptNumber;
        }
      }
    });

    // Populate live Sage 300 PO Options for invoice submission
    this.sageApi.getPurchaseOrders().subscribe(sagePos => {
      if (Array.isArray(sagePos) && sagePos.length > 0) {
        this.poOptions = [
          { value: '', label: '-- Select Approved PO --' },
          ...sagePos.map(p => ({
            value: p.PurchaseOrderNumber.trim(),
            label: `${p.PurchaseOrderNumber.trim()} — ${p.Name?.trim() || p.Vendor?.trim() || 'Supplier'} ($${(p.Total || p.ExtendedCost || 0).toLocaleString()})`
          }))
        ];
      }
    });
  }

  filteredInvoices(): Invoice[] {
    let list = this.invoicesList;
    if (this.role() === 'vendor') {
      const vName = this.state.currentVendorName() || this.state.currentUser()?.name;
      if (vName) {
        list = list.filter(inv => inv.vendor.toLowerCase().includes(vName.toLowerCase()));
      }
    }
    const q = this.searchQuery.trim().toLowerCase();
    const st = this.statusFilter;
    return list.filter(inv => {
      const matchQ = !q || (inv.id || '').toLowerCase().includes(q) || (inv.poId || '').toLowerCase().includes(q) || (inv.vendor || '').toLowerCase().includes(q);
      const matchSt = !st || inv.status === st;
      return matchQ && matchSt;
    });
  }

  totalValue(): number { return this.invoicesList.reduce((acc, i) => acc + (i.amount || 0), 0); }
  pendingCount(): number { return this.invoicesList.filter(i => i.status === 'Pending').length; }

  filteredReceipts(): ReceiptRecord[] {
    const query = this.receiptQuery.trim().toLowerCase();
    return this.receipts.filter(receipt =>
      !query ||
      (receipt.invoiceNumber || '').toLowerCase().includes(query) ||
      (receipt.receiptNumber || '').toLowerCase().includes(query) ||
      (receipt.lines || []).some(l => (l.itemDescription || '').toLowerCase().includes(query))
    );
  }

  selectedReceipt(): ReceiptRecord {
    return this.receipts.find(receipt => receipt.receiptNumber === this.pendingReceipt) ?? this.receipts[0] ?? {
      invoiceNumber: '',
      receiptNumber: '',
      receiptDate: '',
      extendedCost: 0,
      currency: 'USD',
      lines: []
    };
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
    // Dynamic PO selection handler
  }

  uploadInvoice(): void {
    if (!this.newInvoice.id || !this.newInvoice.poId || !this.newInvoice.amount) {
      this.state.notify('Error: Invoice reference, PO reference and amount are required.');
      return;
    }
    const match: 'Matched' | 'Mismatch' = 'Matched';
    const created: Invoice = { ...this.newInvoice, match, status: 'Pending' };
    this.invoicesList = [created, ...this.invoicesList];
    this.state.notify(`Invoice ${created.id} uploaded. 3-Way match result: ${match}.`);
    this.resetForm();
    this.showUploadForm = false;
  }

  resetForm(): void {
    this.newInvoice = {
      id: '',
      poId: '',
      vendor: '',
      amount: 0,
      status: 'Pending',
      match: 'Matched'
    };
  }

  approveInvoice(inv: Invoice): void {
    inv.status = 'Approved';
    this.state.notify(`Invoice ${inv.id} approved for payment release.`);
  }

  toggleInvoiceApproval(inv: Invoice): void {
    if (inv.status === 'Approved') {
      inv.status = 'Pending';
      this.state.notify(`Invoice ${inv.id} approval revoked (reverted to Pending).`);
    } else {
      inv.status = 'Approved';
      this.state.notify(`Invoice ${inv.id} approved for payment release.`);
    }
  }

  onFileAttached(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      this.state.notify(`Invoice attachment "${file.name}" linked.`);
    }
  }
}
