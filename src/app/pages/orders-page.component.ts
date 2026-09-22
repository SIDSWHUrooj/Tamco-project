import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';
import { IconComponent } from '../shared/icon.component';
import { CustomSelectComponent } from '../shared/custom-select.component';
import { CustomDatePickerComponent } from '../shared/custom-date-picker.component';
import { PurchaseOrder } from '../core/models';

export interface PoLine {
  itemDescription: string;
  quantityOrdered: number;
  unitOfMeasure: string;
  currency: string;
  unitCost: number;
  vat: number;
  total: number;
}

export interface SagePurchaseOrder {
  purchaseOrderNumber: string;
  purchaseOrderDate: string;
  description: string;
  vendor: string;
  currency: string;
  lines: PoLine[];
}

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent, StatusComponent, IconComponent, CustomSelectComponent, CustomDatePickerComponent],
  styles: [`
    .po-active-badge {
      font-size: 12px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 6px;
      background: var(--role-soft, #eff6ff);
      color: var(--role-accent, #2563eb);
      border: 1px solid var(--role-border, #bfdbfe);
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
        background: var(--role-soft, #eff6ff);
        color: var(--role-accent, #2563eb);
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
        border-color: var(--role-accent, #2563eb);
        color: var(--role-accent, #2563eb);
        background: #ffffff;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px -2px rgba(37, 99, 235, 0.16);

        .browse-icon-wrap {
          background: var(--role-accent, #2563eb);
          color: #ffffff;
        }

        .browse-pill {
          background: var(--role-soft, #eff6ff);
          color: var(--role-accent, #2563eb);
        }
      }

      &:active {
        transform: translateY(0);
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
      }
    }

    /* Fixed-Width Perfectly Aligned Line Items Table */
    .po-lines {
      width: 100%;
      min-width: 780px;
      border-collapse: separate;
      border-spacing: 0;
      table-layout: fixed;
    }
    .po-lines thead th {
      background: var(--role-accent, #16a34a);
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-size: 11.5px;
      font-weight: 700;
      padding: 10px 12px;
      border-bottom: 2px solid var(--role-accent-hover, #15803d);
      transition: background-color 0.2s ease, border-color 0.2s ease;

      &:first-child {
        border-top-left-radius: var(--radius-sm, 6px);
      }
      &:last-child {
        border-top-right-radius: var(--radius-sm, 6px);
      }
    }
    .po-lines tbody td {
      padding: 6px 10px;
      border-bottom: 1px solid var(--line, #e2e8f0);
      vertical-align: middle;
    }

    /* Column Width Distribution */
    .po-lines .col-desc {
      width: auto;
      text-align: left;
    }
    .po-lines .col-qty {
      width: 95px;
      text-align: center;
    }
    .po-lines .col-uom {
      width: 75px;
      text-align: center;
    }
    .po-lines .col-curr {
      width: 80px;
      text-align: center;
    }
    .po-lines .col-price {
      width: 110px;
      text-align: right;
    }
    .po-lines .col-vat {
      width: 100px;
      text-align: right;
    }
    .po-lines .col-total {
      width: 130px;
      text-align: right;
      padding-right: 14px;
    }

    /* Crisp Modern Input Fields inside Line Item Cells */
    .po-lines tbody input {
      width: 100%;
      height: 36px;
      box-sizing: border-box;
      border: 1px solid var(--line-strong, #cbd5e1);
      border-radius: var(--radius-sm, 6px);
      padding: 6px 10px;
      font-size: 12.5px;
      color: var(--text, #0f172a);
      background: #ffffff;
      transition: all 0.15s ease;

      &:focus {
        border-color: var(--role-accent, #2563eb);
        box-shadow: 0 0 0 3px var(--role-soft, #eff6ff);
        outline: none;
      }
    }
    .po-lines .col-qty input,
    .po-lines .col-uom input,
    .po-lines .col-curr input {
      text-align: center;
    }
    .po-lines .col-price input,
    .po-lines .col-vat input {
      text-align: right;
    }
    .po-lines .col-total input {
      text-align: right;
      font-weight: 700;
    }

    /* Grand Total Row */
    .po-lines tfoot td {
      padding: 10px 10px;
      border-top: 2px solid var(--line, #e2e8f0);
      background: #f8fafc;
      vertical-align: middle;
    }
    .po-lines .grand-total-label {
      text-align: right;
      padding-right: 16px;
      font-weight: 700;
      font-size: 12.5px;
      color: var(--text, #0f172a);
    }
    .po-lines .grand-total-input {
      width: 100%;
      height: 38px;
      box-sizing: border-box;
      text-align: right;
      font-weight: 800;
      font-size: 14px;
      color: var(--role-accent, #2563eb);
      border: 1.5px solid var(--role-accent, #2563eb);
      border-radius: var(--radius-sm, 6px);
      padding: 6px 12px;
      background: var(--role-soft, #eff6ff);
    }

    .po-finder-overlay {
      position: fixed; inset: 0; z-index: 80; background: rgba(15, 23, 42, 0.5);
      display: grid; place-items: center; padding: 20px;
      backdrop-filter: blur(2px);
    }
    .po-finder {
      width: min(860px, 100%); background: #ffffff; border-radius: var(--radius-md, 10px); overflow: hidden;
      box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.25); max-height: 90vh; display: flex; flex-direction: column;
      border: 1px solid var(--line, #e2e8f0);
    }
    .po-finder-header {
      background: var(--navy, #0b1f3a); color: #ffffff; height: 52px; display: flex; align-items: center;
      padding: 0 18px; font-size: 16px; font-weight: 700; letter-spacing: -0.01em;
    }
    .po-finder-header button {
      margin-left: auto; background: none; border: 0; color: rgba(255, 255, 255, 0.7); font-size: 20px; cursor: pointer;
      &:hover { color: #ffffff; }
    }
    .po-finder-body { padding: 18px; overflow: auto; }
    .po-finder tbody tr { cursor: pointer; transition: background 0.15s ease; }
    .po-finder tbody tr:hover, .po-finder tbody tr.selected { background: var(--role-soft, #eff6ff); }
    .po-finder-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 18px; border-top: 1px solid var(--line, #e2e8f0); background: #f8fafc; }
  `],
  template: `
    <app-page-heading eyebrow="Purchase orders" [title]="role()==='vendor' ? 'My Purchase Orders' : 'Purchase Order Management'" [subtitle]="role()==='vendor' ? 'Review released orders, milestone dates, GRN acceptances and QC inspection results.' : 'Issue, approve, route and release purchase orders to qualified suppliers.'">
      <div class="heading-actions">
        @if (role() !== 'vendor') {
          <button class="btn" (click)="showNewPo = !showNewPo">
            @if (showNewPo) {
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              <span>Close Form</span>
            } @else {
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>Issue New PO</span>
            }
          </button>
        }
        <button class="btn secondary" (click)="exportPos()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span>Export PO Log</span>
        </button>
      </div>
    </app-page-heading>

    <section class="dash-kpis three">
      <article class="dash-kpi">
        <div class="kpi-top-row">
          <span class="kpi-label">Total POs</span>
          <span class="kpi-icon-badge blue">
            <app-icon name="orders" [size]="16" />
          </span>
        </div>
        <strong class="kpi-value">{{ poList.length }}</strong>
        <small>Active procurement purchase orders</small>
      </article>

      <article class="dash-kpi">
        <div class="kpi-top-row">
          <span class="kpi-label">Committed Spend</span>
          <span class="kpi-icon-badge emerald">
            <app-icon name="payments" [size]="16" />
          </span>
        </div>
        <strong class="kpi-value" style="color: #059669;">\${{ totalValue().toLocaleString() }}</strong>
        <small>Total order value commitment</small>
      </article>

      <article class="dash-kpi">
        <div class="kpi-top-row">
          <span class="kpi-label">Pending Approval</span>
          <span class="kpi-icon-badge amber">
            <app-icon name="approval-matrix" [size]="16" />
          </span>
        </div>
        <strong class="kpi-value" style="color: #d97706;">{{ pendingApprovalCount() }}</strong>
        <small>Awaiting manager authorization</small>
      </article>
    </section>

    @if (showNewPo && role() !== 'vendor') {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
        <div class="panel-title">
          <h2>Issue New Purchase Order</h2>
        </div>

        <div class="form-grid">
          <label>PO Reference # *<input [(ngModel)]="newPo.id" placeholder="e.g. PO-002350" /></label>
          <label>Awarded Supplier *<input [(ngModel)]="newPo.vendor" placeholder="e.g. ABC Supplies Pvt. Ltd." /></label>
          <label>Category *
            <app-custom-select [(ngModel)]="newPo.category" [options]="categoryOptions" />
          </label>
          <label>Total PO Amount ($) *<input type="number" [(ngModel)]="newPo.amount" placeholder="52000" /></label>
          <label>Required Delivery Date *
            <app-custom-date-picker [(ngModel)]="newPo.requiredDate" />
          </label>
          <label>Committed Arrival Date *
            <app-custom-date-picker [(ngModel)]="newPo.arrivalDate" />
          </label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetPoForm()">Reset</button>
          <button class="btn" (click)="createPo()">Create & Route for Approval</button>
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
          placeholder="Search POs by number, supplier, or category..."
        />
      </div>
      <app-custom-select
        [(ngModel)]="approvalFilter"
        [options]="approvalOptions"
        minWidth="170px"
      />
    </div>

    <article class="panel" style="margin-bottom: 18px;">
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>PO #</th>
              <th>Supplier Name</th>
              <th>Category</th>
              <th>Amount ($)</th>
              <th>Required Date</th>
              <th>Approval</th>
              <th>GRN</th>
              <th>QC Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (po of filteredPos(); track po.id) {
              <tr [class.highlight]="po.id === selectedPoNumber">
                <td><span class="mono">{{ po.id }}</span></td>
                <td><input [(ngModel)]="po.vendor" style="font-weight: 600;" /></td>
                <td><input [(ngModel)]="po.category" /></td>
                <td><input type="number" [(ngModel)]="po.amount" style="width: 85px;" /></td>
                <td>
                  <app-custom-date-picker [(ngModel)]="po.requiredDate" [compact]="true" minWidth="135px" />
                </td>
                <td>
                  <app-status [text]="po.approval" [good]="po.approval==='Approved'" [warn]="po.approval==='Pending'" />
                </td>
                <td>
                  <app-status [text]="po.grn" [good]="po.grn==='Passed'" [warn]="po.grn==='Pending'" />
                </td>
                <td>
                  <app-status [text]="po.qc" [good]="po.qc==='Passed'" [warn]="po.qc==='Pending'" [bad]="po.qc==='Rejected'" />
                </td>
                <td>
                  <div style="display: flex; gap: 5px; align-items: center;">
                    <button class="btn-action btn-action-view" (click)="loadPo(po.id)" title="View PO Details">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      <span>View</span>
                    </button>
                    @if (role() !== 'vendor') {
                      @if (po.approval === 'Pending') {
                        <button class="btn-action btn-action-approve" (click)="toggleApproval(po.id)" title="Click to Approve Purchase Order">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                          <span>Approve</span>
                        </button>
                      } @else {
                        <button class="btn-action btn-action-approved" (click)="toggleApproval(po.id)" title="Approved (Click to Revoke Approval)">
                          <svg class="icon-check" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                          <svg class="icon-revoke" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          <span class="text-approved">Approved</span>
                          <span class="text-revoke">Revoke</span>
                        </button>
                      }
                    }
                    <button class="btn-action btn-action-save" (click)="savePo(po)" title="Save changes">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                      <span>Save</span>
                    </button>
                    @if (role() !== 'vendor') {
                      <button class="btn-action btn-action-delete" (click)="deletePo(po.id)" title="Delete Purchase Order">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                      </button>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </article>

    <article class="panel" style="margin-bottom: 18px;">
      <div class="panel-title" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <h2>Purchase Order Line Items</h2>
          <span class="mono po-active-badge">{{ selectedPoNumber }}</span>
          <span class="po-date-badge">Order Date: {{ selectedPoDate }}</span>
        </div>
        <button type="button" class="po-browse-btn" (click)="openFinder()" title="Browse all purchase orders directory">
          <span class="browse-icon-wrap">
            <app-icon name="search" [size]="14" />
          </span>
          <span class="browse-text">Browse All POs</span>
          <span class="browse-pill">{{ sagePos.length }}</span>
        </button>
      </div>

      <div class="table-scroll" style="margin-top: 14px;">
        <table class="po-lines">
          <thead>
            <tr>
              <th class="col-desc">Item Description</th>
              <th class="col-qty">PO Quantity</th>
              <th class="col-uom">UOM</th>
              <th class="col-curr">Currency</th>
              <th class="col-price">Unit Price</th>
              <th class="col-vat">VAT</th>
              <th class="col-total">Total</th>
            </tr>
          </thead>
          <tbody>
            @if (selectedLines.length === 0) {
              <tr>
                <td colspan="7" style="text-align: center; color: #94a3b8; padding: 24px;">Select a purchase order above to view line items.</td>
              </tr>
            }
            @for (line of selectedLines; track $index) {
              <tr>
                <td class="col-desc"><input [(ngModel)]="line.itemDescription" /></td>
                <td class="col-qty"><input type="number" [(ngModel)]="line.quantityOrdered" (ngModelChange)="recalcLine(line)" /></td>
                <td class="col-uom"><input [(ngModel)]="line.unitOfMeasure" /></td>
                <td class="col-curr"><input [(ngModel)]="line.currency" /></td>
                <td class="col-price"><input type="number" [(ngModel)]="line.unitCost" (ngModelChange)="recalcLine(line)" /></td>
                <td class="col-vat"><input type="number" [(ngModel)]="line.vat" /></td>
                <td class="col-total"><input type="number" [(ngModel)]="line.total" /></td>
              </tr>
            }
          </tbody>
          <tfoot>
            <tr>
              <td colspan="6" class="grand-total-label">Grand Total ({{ selectedCurrency }}):</td>
              <td class="col-total">
                <input type="text" [value]="grandTotal().toFixed(2)" readonly class="grand-total-input" />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </article>



    @if (showFinder) {
      <div class="po-finder-overlay" (click)="closeFinder()">
        <div class="po-finder" (click)="$event.stopPropagation()">
          <div class="po-finder-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <app-icon name="search" [size]="16" />
              <span>Purchase Order Catalog Directory</span>
            </div>
            <button type="button" (click)="closeFinder()" aria-label="Close" style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; background: rgba(255,255,255,0.1); color: #ffffff; border: none; cursor: pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="po-finder-body">
            <input
              [(ngModel)]="finderQuery"
              placeholder="Search by PO number or description..."
              style="width: 100%; margin-bottom: 12px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px;"
            />
            <table>
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>PO Date</th>
                  <th>PO Description</th>
                </tr>
              </thead>
              <tbody>
                @for (po of filteredFinderPos(); track po.purchaseOrderNumber) {
                  <tr class="po-row" [class.selected]="po.purchaseOrderNumber === pendingFinderPo" (click)="highlightFinderPo(po.purchaseOrderNumber)">
                    <td class="mono">{{ po.purchaseOrderNumber }}</td>
                    <td>{{ formatDate(po.purchaseOrderDate) }}</td>
                    <td>{{ po.description }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="po-finder-footer">
            <button type="button" class="btn secondary small" (click)="closeFinder()">Close</button>
            <button type="button" class="btn small" (click)="confirmFinderPo()" style="display: inline-flex; align-items: center; gap: 6px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Select Purchase Order</span>
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class OrdersPageComponent {
  readonly state = inject(PortalStateService);
  readonly role = computed(() => this.state.role());

  showNewPo = false;
  showFinder = false;
  searchQuery = '';
  approvalFilter = '';

  readonly approvalOptions = [
    { value: '', label: 'All Approvals' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Pending', label: 'Pending' }
  ];

  readonly categoryOptions = [
    'Electrical',
    'Safety Equipment',
    'Mechanical',
    'IT & Hardware',
    'Raw Materials'
  ];

  finderQuery = '';
  pendingFinderPo = '';

  selectedPoNumber = 'PO-002345';
  selectedPoDate = '12/08/2026';
  selectedCurrency = 'USD';
  selectedLines: PoLine[] = [];

  newPo: PurchaseOrder = {
    id: 'PO-002348',
    vendor: 'ABC Supplies Pvt. Ltd.',
    category: 'Electrical',
    amount: 64000,
    requiredDate: '2026-09-12',
    arrivalDate: '2026-09-10',
    approval: 'Pending',
    grn: 'Pending',
    qc: 'Pending'
  };

  poList: PurchaseOrder[] = [
    { id: 'PO-002345', vendor: 'ABC Supplies Pvt. Ltd.', category: 'Electrical', amount: 52000, requiredDate: '2026-08-25', arrivalDate: '2026-08-27', approval: 'Pending', grn: 'Pending', qc: 'Pending' },
    { id: 'PO-002334', vendor: 'ABC Supplies Pvt. Ltd.', category: 'Safety Equipment', amount: 18600, requiredDate: '2026-08-22', arrivalDate: '2026-08-22', approval: 'Approved', grn: 'Passed', qc: 'Passed' },
    { id: 'PO-002321', vendor: 'Perfect Industrial', category: 'Mechanical', amount: 43800, requiredDate: '2026-08-19', arrivalDate: '2026-08-21', approval: 'Approved', grn: 'Passed', qc: 'Pending' },
    { id: 'PO-002315', vendor: 'Global Traders', category: 'Raw Materials', amount: 31500, requiredDate: '2026-08-15', arrivalDate: '2026-08-14', approval: 'Approved', grn: 'Passed', qc: 'Passed' }
  ];

  sagePos: SagePurchaseOrder[] = [
    {
      purchaseOrderNumber: 'PO-002345',
      purchaseOrderDate: '2026-08-12',
      description: 'Electrical — LV Switchgear & Control Cable',
      vendor: 'ABC Supplies Pvt. Ltd.',
      currency: 'USD',
      lines: [
        this.makeLine('11kV GIS Incoming Panel', 2, 'SET', 'USD', 18500),
        this.makeLine('Control Cable 4C 2.5mm', 500, 'MTR', 'USD', 12),
        this.makeLine('Spare MCCB 250A', 8, 'PCS', 'USD', 420)
      ]
    },
    {
      purchaseOrderNumber: 'PO-002334',
      purchaseOrderDate: '2026-08-04',
      description: 'Safety Equipment — PPE Lot',
      vendor: 'ABC Supplies Pvt. Ltd.',
      currency: 'USD',
      lines: [
        this.makeLine('FR Coverall — Arc Rated', 40, 'SET', 'USD', 185),
        this.makeLine('Safety Helmet with Visor', 40, 'PCS', 'USD', 42),
        this.makeLine('Insulated Gloves Class 2', 20, 'PAIR', 'USD', 68)
      ]
    },
    {
      purchaseOrderNumber: 'PO-002321',
      purchaseOrderDate: '2026-07-28',
      description: 'Mechanical Parts — Pump Spares',
      vendor: 'Perfect Industrial',
      currency: 'USD',
      lines: [
        this.makeLine('Pump Mechanical Seal Kit', 6, 'PCS', 'USD', 1450),
        this.makeLine('Impeller Assembly 150mm', 2, 'SET', 'USD', 12800)
      ]
    },
    {
      purchaseOrderNumber: 'PO-002315',
      purchaseOrderDate: '2026-07-18',
      description: 'Raw Materials — Copper Cable',
      vendor: 'Global Traders',
      currency: 'USD',
      lines: [
        this.makeLine('XLPE Copper Cable 120mm²', 800, 'MTR', 'USD', 28),
        this.makeLine('Steel Cable Drum', 4, 'PCS', 'USD', 2150)
      ]
    }
  ];

  constructor() {
    this.loadPo(this.selectedPoNumber);
  }

  filteredPos(): PurchaseOrder[] {
    let list = this.poList;
    if (this.role() === 'vendor') {
      list = list.filter(po => (po.vendor || '').includes('ABC Supplies'));
    }
    const q = this.searchQuery.trim().toLowerCase();
    const af = this.approvalFilter;
    return list.filter(po => {
      const matchQ = !q ||
        (po.id || '').toLowerCase().includes(q) ||
        (po.vendor || '').toLowerCase().includes(q) ||
        (po.category || '').toLowerCase().includes(q) ||
        (po.qc || '').toLowerCase().includes(q) ||
        (po.grn || '').toLowerCase().includes(q) ||
        (po.requiredDate || '').toLowerCase().includes(q);
      const matchA = !af || po.approval === af;
      return matchQ && matchA;
    });
  }

  filteredFinderPos(): SagePurchaseOrder[] {
    let list = this.sagePos;
    if (this.role() === 'vendor') {
      list = list.filter(po => (po.vendor || '').includes('ABC Supplies'));
    }
    const q = this.finderQuery.trim().toLowerCase();
    return list.filter(po =>
      !q ||
      (po.purchaseOrderNumber || '').toLowerCase().includes(q) ||
      (po.description || '').toLowerCase().includes(q) ||
      (po.vendor || '').toLowerCase().includes(q)
    );
  }

  totalValue(): number {
    return this.poList.reduce((acc, po) => acc + (po.amount || 0), 0);
  }

  pendingApprovalCount(): number {
    return this.poList.filter(po => po.approval === 'Pending').length;
  }

  grandTotal(): number {
    return this.selectedLines.reduce(
      (sum, line) => sum + (Number(line.total) || 0) + (Number(line.vat) || 0),
      0
    );
  }

  formatDate(date: string): string {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return date;
    return `${String(parsedDate.getDate()).padStart(2, '0')}/${String(parsedDate.getMonth() + 1).padStart(2, '0')}/${parsedDate.getFullYear()}`;
  }

  makeLine(itemDescription: string, quantityOrdered: number, unitOfMeasure: string, currency: string, unitCost: number): PoLine {
    const total = +(unitCost * quantityOrdered).toFixed(2);
    const vat = +(total * 0.17).toFixed(2);
    return { itemDescription, quantityOrdered, unitOfMeasure, currency, unitCost, vat, total };
  }

  recalcLine(line: PoLine): void {
    line.total = +((Number(line.unitCost) || 0) * (Number(line.quantityOrdered) || 0)).toFixed(2);
    line.vat = +(line.total * 0.17).toFixed(2);
  }

  loadPo(poNumber: string): void {
    const po = this.sagePos.find(p => p.purchaseOrderNumber === poNumber);
    if (!po) {
      this.state.notify(`No line items found for ${poNumber}.`);
      return;
    }
    this.selectedPoNumber = po.purchaseOrderNumber;
    this.selectedPoDate = this.formatDate(po.purchaseOrderDate);
    this.selectedCurrency = po.currency;
    this.selectedLines = po.lines.map(line => ({ ...line }));
    this.state.notify(`Purchase Order ${po.purchaseOrderNumber} loaded.`);
  }

  openFinder(): void {
    this.finderQuery = '';
    this.pendingFinderPo = this.selectedPoNumber;
    this.showFinder = true;
  }

  closeFinder(): void {
    this.showFinder = false;
  }

  highlightFinderPo(poNumber: string): void {
    this.pendingFinderPo = poNumber;
  }

  confirmFinderPo(): void {
    if (!this.pendingFinderPo) {
      this.state.notify('Select a purchase order first.');
      return;
    }
    this.loadPo(this.pendingFinderPo);
    this.closeFinder();
  }

  createPo(): void {
    if (!this.newPo.id || !this.newPo.vendor || !this.newPo.amount) {
      this.state.notify('Error: PO number, vendor, and amount are required.');
      return;
    }
    const created: PurchaseOrder = { ...this.newPo };
    this.poList = [created, ...this.poList];
    this.state.notify(`Purchase Order ${created.id} created and routed for approval.`);
    this.resetPoForm();
    this.showNewPo = false;
  }

  resetPoForm(): void {
    this.newPo = {
      id: `PO-00${Math.floor(2350 + Math.random() * 50)}`,
      vendor: 'ABC Supplies Pvt. Ltd.',
      category: 'Electrical',
      amount: 45000,
      requiredDate: '2026-09-25',
      arrivalDate: '2026-09-22',
      approval: 'Pending',
      grn: 'Pending',
      qc: 'Pending'
    };
  }

  toggleApproval(id: string): void {
    const po = this.poList.find(p => p.id === id);
    if (!po) return;

    if (po.approval === 'Pending') {
      po.approval = 'Approved';
      this.state.notify(`Purchase Order ${id} approved and released to vendor.`);
    } else {
      po.approval = 'Pending';
      this.state.notify(`Purchase Order ${id} approval revoked (reverted to Pending).`);
    }
  }

  approvePo(id: string): void {
    this.toggleApproval(id);
  }

  savePo(po: PurchaseOrder): void {
    this.state.notify(`PO ${po.id} changes saved.`);
  }

  deletePo(id: string): void {
    this.poList = this.poList.filter(po => po.id !== id);
    this.state.notify(`PO ${id} cancelled and deleted.`);
  }

  exportPos(): void {
    this.state.notify('Exporting Purchase Order register (Excel)...');
  }
}
