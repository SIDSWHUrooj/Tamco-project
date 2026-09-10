import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';
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
  imports: [FormsModule, PageHeadingComponent, StatusComponent],
  styles: [`
    .po-input-group { display: flex; align-items: stretch; }
    .po-input-group input { border-top-right-radius: 0; border-bottom-right-radius: 0; }
    .po-search-btn {
      width: 42px; border: 1px solid #0b1f6b; background: #00008B; color: #fff;
      border-radius: 0 8px 8px 0; font-size: 16px;
    }
    .po-detail-head {
      background: #67008a; color: #fff; padding: 10px 14px; border-radius: 5px;
      font-size: 15px; font-weight: 600; margin-bottom: 10px;
    }
    .po-detail-rule { margin: 0 0 16px; border: 0; border-top: 1px solid forestgreen; }
    .po-lines thead th { background: #8100ad; color: #fff; text-transform: none; letter-spacing: 0; font-size: 12px; }
    .po-lines tfoot td { border-bottom: 0; font-weight: 700; }
    .po-lines tfoot input { width: 100%; text-align: right; font-weight: 700; border: 1px solid #dbe3ed; border-radius: 6px; padding: 8px; }
    .po-finder-overlay {
      position: fixed; inset: 0; z-index: 80; background: rgba(7, 18, 40, .45);
      display: grid; place-items: center; padding: 20px;
    }
    .po-finder {
      width: min(860px, 100%); background: #fff; border-radius: 10px; overflow: hidden;
      box-shadow: 0 18px 50px rgba(7, 22, 43, .28); max-height: 90vh; display: flex; flex-direction: column;
    }
    .po-finder-header {
      background: #00008B; color: #fff; height: 50px; display: flex; align-items: center;
      padding: 0 16px; font-size: 18px; font-weight: 600;
    }
    .po-finder-header button { margin-left: auto; background: none; border: 0; color: #fff; font-size: 22px; }
    .po-finder-body { padding: 16px; overflow: auto; }
    .po-finder tbody tr { cursor: pointer; }
    .po-finder tbody tr:hover, .po-finder tbody tr.selected { background: #eef5ff; }
    .po-finder-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 16px; border-top: 1px solid #edf1f6; }
  `],
  template: `
    <app-page-heading eyebrow="Purchase orders" [title]="role()==='vendor' ? 'My Purchase Orders' : 'Purchase Order Management'" [subtitle]="role()==='vendor' ? 'Review released orders, milestone dates, GRN acceptances and QC inspection results.' : 'Issue, approve, route and release purchase orders to qualified suppliers.'">
      <div class="heading-actions">
        @if (role() !== 'vendor') {
          <button class="btn" (click)="showNewPo = !showNewPo">
            {{ showNewPo ? '✕ Close Form' : '+ Issue New PO' }}
          </button>
        }
        <button class="btn secondary" (click)="exportPos()">Export PO Log</button>
      </div>
    </app-page-heading>

    <section class="stats-grid compact">
      <div class="stat-card">
        <span>Total POs</span>
        <strong>{{ poList.length }}</strong>
        <small>Active procurement orders</small>
      </div>
      <div class="stat-card">
        <span>Total Value ($)</span>
        <strong style="color: #1769e0;">\${{ totalValue().toLocaleString() }}</strong>
        <small>Committed spend</small>
      </div>
      <div class="stat-card">
        <span>Pending Approval</span>
        <strong style="color: #b56b05;">{{ pendingApprovalCount() }}</strong>
        <small>Awaiting manager sign-off</small>
      </div>
    </section>

    @if (showNewPo && role() !== 'vendor') {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid #1769e0;">
        <div class="panel-title">
          <div>
            <h2>Issue New Purchase Order</h2>
            <p>Generate paperless PO from RFQ award or direct procurement requisition.</p>
          </div>
        </div>

        <div class="form-grid">
          <label>PO Reference # *<input [(ngModel)]="newPo.id" placeholder="e.g. PO-002350" /></label>
          <label>Awarded Supplier *<input [(ngModel)]="newPo.vendor" placeholder="e.g. ABC Supplies Pvt. Ltd." /></label>
          <label>Category *
            <select [(ngModel)]="newPo.category" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="Electrical">Electrical</option>
              <option value="Safety Equipment">Safety Equipment</option>
              <option value="Mechanical">Mechanical</option>
              <option value="IT & Hardware">IT & Hardware</option>
              <option value="Raw Materials">Raw Materials</option>
            </select>
          </label>
          <label>Total PO Amount ($) *<input type="number" [(ngModel)]="newPo.amount" placeholder="52000" /></label>
          <label>Required Delivery Date *<input type="date" [(ngModel)]="newPo.requiredDate" /></label>
          <label>Committed Arrival Date *<input type="date" [(ngModel)]="newPo.arrivalDate" /></label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetPoForm()">Reset</button>
          <button class="btn" (click)="createPo()">Create & Route for Approval</button>
        </div>
      </article>
    }

    <article class="panel" style="margin-bottom: 18px;">
      <div class="po-detail-head">Purchase Order</div>
      <hr class="po-detail-rule" />

      <div class="form-grid">
        <label>PO Number
          <div class="po-input-group">
            <input [(ngModel)]="selectedPoNumber" readonly />
            <button type="button" class="po-search-btn" (click)="openFinder()" title="Find Purchase Order">⌕</button>
          </div>
        </label>
        <label>PO Date
          <input type="text" [(ngModel)]="selectedPoDate" readonly />
        </label>
      </div>

      <div class="table-scroll" style="margin-top: 16px;">
        <table class="po-lines">
          <thead>
            <tr>
              <th>Item Description</th>
              <th>PO Quantity</th>
              <th>UOM</th>
              <th>Currency</th>
              <th>Unit Price</th>
              <th>VAT</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            @if (selectedLines.length === 0) {
              <tr>
                <td colspan="7" style="text-align: center; color: #94a3b8;">Select a purchase order to view line items.</td>
              </tr>
            }
            @for (line of selectedLines; track $index) {
              <tr>
                <td><input [(ngModel)]="line.itemDescription" style="min-width: 220px;" /></td>
                <td><input type="number" [(ngModel)]="line.quantityOrdered" (ngModelChange)="recalcLine(line)" style="width: 80px;" /></td>
                <td><input [(ngModel)]="line.unitOfMeasure" style="width: 70px;" /></td>
                <td><input [(ngModel)]="line.currency" style="width: 70px;" /></td>
                <td><input type="number" [(ngModel)]="line.unitCost" (ngModelChange)="recalcLine(line)" style="width: 90px;" /></td>
                <td><input type="number" [(ngModel)]="line.vat" style="width: 90px;" /></td>
                <td><input type="number" [(ngModel)]="line.total" style="width: 100px; font-weight: 700;" /></td>
              </tr>
            }
          </tbody>
          <tfoot>
            <tr>
              <td id="grandTotalLabel" colspan="6" style="text-align: right;">Grand Total ({{ selectedCurrency }}):</td>
              <td>
                <input type="text" [value]="grandTotal().toFixed(2)" readonly />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </article>

    <div style="display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap;">
      <input
        style="flex: 1; min-width: 240px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px;"
        [(ngModel)]="searchQuery"
        placeholder="🔍 Search POs by number, supplier, or category..."
      />
      <select
        style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; background: #fff;"
        [(ngModel)]="approvalFilter"
      >
        <option value="">All Approvals</option>
        <option value="Approved">Approved</option>
        <option value="Pending">Pending</option>
      </select>
    </div>

    <article class="panel">
      <div class="panel-title">
        <div>
          <h2>Purchase Order Register</h2>
          <p>Approval chains, delivery arrival tracking, ERP GRN and QC acceptance</p>
        </div>
      </div>

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
                <td><input type="date" [(ngModel)]="po.requiredDate" /></td>
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
                  <div style="display: flex; gap: 5px;">
                    <button class="btn small" (click)="loadPo(po.id)">View</button>
                    @if (role() !== 'vendor' && po.approval === 'Pending') {
                      <button class="btn small" (click)="approvePo(po.id)">Approve</button>
                    }
                    <button class="btn small ghost" (click)="savePo(po)">Save</button>
                    @if (role() !== 'vendor') {
                      <button class="btn small danger-btn" (click)="deletePo(po.id)">✕</button>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </article>

    @if (role() === 'procurement') {
      <section class="dashboard-grid two" style="margin-top: 18px;">
        <article class="panel">
          <div class="panel-title"><div><h2>Approval Routing Matrix</h2><p>Spending limit workflow</p></div></div>
          <div class="approval-flow">
            <span>Buyer</span><i>→</i><span>Procurement Manager</span><i>→</i><span>Financial Controller</span><i>→</i><strong>Release</strong>
          </div>
        </article>
        <article class="panel">
          <div class="panel-title"><div><h2>Automated Release Policy</h2><p>Internal controls</p></div></div>
          <div class="callout info">
            <b>Zero Supplier Visibility before Approval:</b> Purchase orders become visible in the vendor portal only after complete electronic sign-off.
          </div>
        </article>
      </section>
    }

    @if (showFinder) {
      <div class="po-finder-overlay" (click)="closeFinder()">
        <div class="po-finder" (click)="$event.stopPropagation()">
          <div class="po-finder-header">
            Purchase Order
            <button type="button" (click)="closeFinder()" aria-label="Close">&times;</button>
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
            <button type="button" class="btn danger-btn" (click)="closeFinder()">Close</button>
            <button type="button" class="btn" (click)="confirmFinderPo()">Select</button>
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
      list = list.filter(po => po.vendor.includes('ABC Supplies'));
    }
    const q = this.searchQuery.trim().toLowerCase();
    const af = this.approvalFilter;
    return list.filter(po => {
      const matchQ = !q || po.id.toLowerCase().includes(q) || po.vendor.toLowerCase().includes(q) || po.category.toLowerCase().includes(q);
      const matchA = !af || po.approval === af;
      return matchQ && matchA;
    });
  }

  filteredFinderPos(): SagePurchaseOrder[] {
    let list = this.sagePos;
    if (this.role() === 'vendor') {
      list = list.filter(po => po.vendor.includes('ABC Supplies'));
    }
    const q = this.finderQuery.trim().toLowerCase();
    return list.filter(po =>
      !q ||
      po.purchaseOrderNumber.toLowerCase().includes(q) ||
      po.description.toLowerCase().includes(q)
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

  approvePo(id: string): void {
    this.poList = this.poList.map(po => po.id === id ? { ...po, approval: 'Approved' } : po);
    this.state.notify(`Purchase Order ${id} approved and released to vendor.`);
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
