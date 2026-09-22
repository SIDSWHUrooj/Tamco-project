import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';
import { IconComponent } from '../shared/icon.component';
import { CustomSelectComponent } from '../shared/custom-select.component';
import { CustomDatePickerComponent } from '../shared/custom-date-picker.component';
import { PurchaseOrder } from '../core/models';

export interface DeliveryShipment {
  id: string;
  poId: string;
  vendor: string;
  requiredDate: string;
  arrivalDate: string;
  carrier: string;
  trackingNo: string;
  grn: 'Passed' | 'Pending';
  qc: 'Passed' | 'Pending' | 'Rejected';
  destination: string;
}

@Component({
  selector: 'app-delivery-page',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent, StatusComponent, IconComponent, CustomSelectComponent, CustomDatePickerComponent],
  template: `
    <app-page-heading eyebrow="Fulfilment & Warehouse" title="Delivery & GRN Tracking" subtitle="Supplier arrival commitments are compared with contract dates; ERP Good Receipt Notes (GRN) and QC inspection follow the delivery.">
      <div class="heading-actions">
        <button class="btn" (click)="showAddShipment = !showAddShipment">
          @if (showAddShipment) {
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            <span>Close Form</span>
          } @else {
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Log Dispatch</span>
          }
        </button>
        <button class="btn secondary" (click)="exportDeliveries()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span>Export Schedule</span>
        </button>
      </div>
    </app-page-heading>

    <!-- Stats Overview -->
    <section class="dash-kpis three">
      <article class="dash-kpi">
        <div class="kpi-top-row">
          <span class="kpi-label">Active Consignments</span>
          <span class="kpi-icon-badge blue">
            <app-icon name="deliveries" [size]="16" />
          </span>
        </div>
        <strong class="kpi-value">{{ deliveries.length }}</strong>
        <small>Total dispatches tracked</small>
      </article>

      <article class="dash-kpi">
        <div class="kpi-top-row">
          <span class="kpi-label">On-Time Fulfilment</span>
          <span class="kpi-icon-badge emerald">
            <app-icon name="approval-matrix" [size]="16" />
          </span>
        </div>
        <strong class="kpi-value" style="color: #059669;">{{ onTrackCount() }}</strong>
        <small>Delivering on / ahead of schedule</small>
      </article>

      <article class="dash-kpi">
        <div class="kpi-top-row">
          <span class="kpi-label">Delay Escalations</span>
          <span class="kpi-icon-badge amber">
            <app-icon name="audit" [size]="16" />
          </span>
        </div>
        <strong class="kpi-value" [style.color]="delayedCount() > 0 ? '#dc2626' : 'var(--text)'">{{ delayedCount() }}</strong>
        <small>Flagged for procurement expedite</small>
      </article>
    </section>

    <div class="callout warn">
      <b>Late-delivery automation active:</b> If expected arrival exceeds contractual required date, an automatic internal delay escalation is flagged to Procurement.
    </div>

    <!-- Add Shipment Form -->
    @if (showAddShipment) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
        <div class="panel-title">
          <h2>Log New Dispatch / Delivery Consignment</h2>
        </div>

        <div class="form-grid">
          <label>PO Reference # *<input [(ngModel)]="newShipment.poId" placeholder="e.g. PO-002349" /></label>
          <label>Supplier Name *<input [(ngModel)]="newShipment.vendor" placeholder="e.g. ABC Supplies Pvt. Ltd." /></label>
          <label>Required Contract Date *
            <app-custom-date-picker [(ngModel)]="newShipment.requiredDate" />
          </label>
          <label>Committed Arrival Date *
            <app-custom-date-picker [(ngModel)]="newShipment.arrivalDate" />
          </label>
          <label>Carrier / Logistics Provider<input [(ngModel)]="newShipment.carrier" placeholder="e.g. TCS Logistics / Road Freight" /></label>
          <label>Consignment / Waybill #<input [(ngModel)]="newShipment.trackingNo" placeholder="e.g. TRK-9821734" /></label>
          <label class="span-2">Destination Receiving Warehouse<input [(ngModel)]="newShipment.destination" placeholder="e.g. Karachi Central Warehouse (Plant 101)" /></label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetShipmentForm()">Reset</button>
          <button class="btn" (click)="addShipment()">Schedule Consignment</button>
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
          placeholder="Search deliveries by PO#, vendor, tracking # or destination..."
        />
      </div>
      <app-custom-select
        [(ngModel)]="statusFilter"
        [options]="statusOptions"
        minWidth="170px"
      />
    </div>

    <!-- Live Deliveries Grid -->
    <section class="delivery-grid">
      @for (po of filteredDeliveries(); track po.id) {
        <article class="panel delivery-card" [class.is-late]="po.arrivalDate > po.requiredDate">
          <div class="card-header">
            <div class="header-left">
              <span class="mono po-tag">{{ po.poId }}</span>
              <h3 class="vendor-name">{{ po.vendor }}</h3>
            </div>
            <app-status
              [text]="po.arrivalDate > po.requiredDate ? '⚠️ Delayed' : '✓ On Track'"
              [bad]="po.arrivalDate > po.requiredDate"
              [good]="po.arrivalDate <= po.requiredDate"
            />
          </div>

          <div class="delivery-timeline" [class.is-late]="po.arrivalDate > po.requiredDate">
            <div class="timeline-step">
              <span class="step-lbl">Contract Required</span>
              <app-custom-date-picker [(ngModel)]="po.requiredDate" (ngModelChange)="saveDelivery(po)" [compact]="true" />
            </div>
            <div class="timeline-divider">
              <span class="divider-arrow">→</span>
            </div>
            <div class="timeline-step">
              <span class="step-lbl">Committed Arrival</span>
              <app-custom-date-picker [(ngModel)]="po.arrivalDate" (ngModelChange)="saveDelivery(po)" [compact]="true" />
            </div>
          </div>

          <div class="logistics-box">
            <div class="logistics-item">
              <span class="logistics-label">Carrier & Waybill</span>
              <div class="logistics-val">
                <span class="carrier-title">{{ po.carrier }}</span>
                <span class="tracking-tag mono">{{ po.trackingNo }}</span>
              </div>
            </div>
            <div class="logistics-item">
              <span class="logistics-label">Destination Warehouse</span>
              <span class="dest-text" [title]="po.destination">{{ po.destination }}</span>
            </div>
          </div>

          <div class="verification-box">
            <div class="verif-item">
              <span class="verif-lbl">ERP GRN:</span>
              <app-status [text]="po.grn" [good]="po.grn==='Passed'" [warn]="po.grn==='Pending'" />
            </div>
            <div class="verif-item">
              <span class="verif-lbl">QC Status:</span>
              <app-status [text]="po.qc" [good]="po.qc==='Passed'" [warn]="po.qc==='Pending'" [bad]="po.qc==='Rejected'" />
            </div>
          </div>

          @if (role() !== 'vendor') {
            <div class="card-actions">
              <div class="action-buttons">
                @if (po.grn === 'Pending') {
                  <button class="btn-action btn-action-execute" (click)="setGrn(po, 'Passed')">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    <span>GRN Pass</span>
                  </button>
                }
                @if (po.qc === 'Pending') {
                  <button class="btn-action btn-action-execute" (click)="setQc(po, 'Passed')">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    <span>QC Pass</span>
                  </button>
                  <button class="btn-action btn-action-reject" (click)="setQc(po, 'Rejected')">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    <span>QC Reject</span>
                  </button>
                }
              </div>
              <button class="btn-action btn-action-delete" (click)="deleteShipment(po.id)" title="Delete shipment record">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
              </button>
            </div>
          }
        </article>
      }

      @if (filteredDeliveries().length === 0) {
        <div class="empty-state-card">
          <div class="empty-icon-wrap">
            <app-icon name="deliveries" [size]="28" />
          </div>
          <h3>No shipments found</h3>
          <p>No consignments match "{{ searchQuery }}"{{ statusFilter ? ' with status ' + statusFilter : '' }}.</p>
          <button class="btn secondary small" (click)="searchQuery = ''; statusFilter = ''">Reset Filters</button>
        </div>
      }
    </section>
  `,
  styles: [`
    .delivery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .delivery-card {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 12px;
      border-left: 4px solid var(--green);
      transition: box-shadow 0.18s ease, border-color 0.18s ease;

      &.is-late {
        border-left: 4px solid var(--red);
      }

      &:hover {
        box-shadow: 0 6px 18px -2px rgba(15, 23, 42, 0.1), 0 2px 6px -1px rgba(15, 23, 42, 0.05);
        border-color: var(--line-strong, #cbd5e1);
      }
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
    }

    .header-left {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .po-tag {
      font-size: 12px;
      font-weight: 700;
      color: var(--role-accent);
    }

    .vendor-name {
      font-size: 15px;
      font-weight: 700;
      color: var(--text);
      margin: 0;
      line-height: 1.25;
    }

    .delivery-timeline {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      background: #f8fafc;
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      padding: 10px 12px;
      transition: background 0.15s ease, border-color 0.15s ease;

      &.is-late {
        background: #fef2f2;
        border-color: var(--red-border);
      }
    }

    .timeline-step {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      min-width: 0;
    }

    .step-lbl {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--muted);
    }

    .timeline-divider {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--muted);
      font-size: 14px;
      font-weight: 700;
      padding-top: 14px;
      user-select: none;
    }

    .logistics-box {
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 12px;
      background: #ffffff;
    }

    .logistics-item {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .logistics-label {
      font-size: 10.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--muted);
    }

    .logistics-val {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      color: var(--text);
      font-size: 12px;
    }

    .carrier-title {
      font-weight: 600;
      color: var(--text);
    }

    .tracking-tag {
      font-size: 11px;
      padding: 2px 7px;
      background: #f1f5f9;
      border: 1px solid var(--line);
      border-radius: 4px;
      color: var(--navy);
    }

    .dest-text {
      color: #475569;
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .verification-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-top: 10px;
      border-top: 1px dashed var(--line);
    }

    .verif-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .verif-lbl {
      font-size: 11px;
      font-weight: 600;
      color: var(--muted);
    }

    .card-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-top: auto;
      padding-top: 10px;
      border-top: 1px solid var(--line);
    }

    .action-buttons {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .del-btn {
      width: 26px;
      height: 26px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
    }

    .empty-state-card {
      grid-column: 1 / -1;
      padding: 40px 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      background: #ffffff;
      border: 1px dashed var(--line-strong);
      border-radius: var(--radius-md);

      .empty-icon-wrap {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: var(--role-soft);
        color: var(--role-accent);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      h3 {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
        color: var(--text);
      }

      p {
        margin: 0;
        font-size: 13px;
        color: var(--muted);
      }
    }
  `]
})
export class DeliveryPageComponent {
  readonly state = inject(PortalStateService);
  readonly role = computed(() => this.state.role());

  showAddShipment = false;
  searchQuery = '';
  statusFilter = '';

  readonly statusOptions = [
    { value: '', label: 'All Deliveries' },
    { value: 'On track', label: 'On Track' },
    { value: 'Late', label: 'Delayed / Late' }
  ];

  newShipment: DeliveryShipment = {
    id: 'SHP-005',
    poId: 'PO-002349',
    vendor: 'ABC Supplies Pvt. Ltd.',
    requiredDate: '2026-09-05',
    arrivalDate: '2026-09-04',
    carrier: 'TCS Cargo Express',
    trackingNo: 'TCS-9988123',
    grn: 'Pending',
    qc: 'Pending',
    destination: 'Karachi Central Warehouse (Plant 101)'
  };

  deliveries: DeliveryShipment[] = [
    { id: 'SHP-001', poId: 'PO-002345', vendor: 'ABC Supplies Pvt. Ltd.', requiredDate: '2026-08-25', arrivalDate: '2026-08-27', carrier: 'TCS Freight Express', trackingNo: 'TRK-887123', grn: 'Pending', qc: 'Pending', destination: 'Karachi Warehouse' },
    { id: 'SHP-002', poId: 'PO-002334', vendor: 'ABC Supplies Pvt. Ltd.', requiredDate: '2026-08-22', arrivalDate: '2026-08-22', carrier: 'Leopard Cargo', trackingNo: 'LEO-441299', grn: 'Passed', qc: 'Passed', destination: 'Karachi Substation' },
    { id: 'SHP-003', poId: 'PO-002321', vendor: 'Perfect Industrial', requiredDate: '2026-08-19', arrivalDate: '2026-08-21', carrier: 'Pakistan Post Road Express', trackingNo: 'PPR-112344', grn: 'Passed', qc: 'Pending', destination: 'Korangi Plant' }
  ];

  onTrackCount(): number { return this.deliveries.filter(d => d.arrivalDate <= d.requiredDate).length; }
  delayedCount(): number { return this.deliveries.filter(d => d.arrivalDate > d.requiredDate).length; }

  filteredDeliveries(): DeliveryShipment[] {
    let list = this.deliveries;
    if (this.role() === 'vendor') {
      list = list.filter(d => d.vendor.includes('ABC Supplies'));
    }
    const q = this.searchQuery.trim().toLowerCase();
    const st = this.statusFilter;
    return list.filter(d => {
      const matchQ = !q || (d.poId || '').toLowerCase().includes(q) || (d.vendor || '').toLowerCase().includes(q) || (d.trackingNo || '').toLowerCase().includes(q) || (d.destination || '').toLowerCase().includes(q) || (d.carrier || '').toLowerCase().includes(q) || (d.id || '').toLowerCase().includes(q);
      const isLate = d.arrivalDate > d.requiredDate;
      const matchSt = !st || (st === 'Late' && isLate) || (st === 'On track' && !isLate);
      return matchQ && matchSt;
    });
  }

  addShipment(): void {
    if (!this.newShipment.poId || !this.newShipment.vendor) {
      this.state.notify('Error: PO number and Supplier are required.');
      return;
    }
    const created: DeliveryShipment = { ...this.newShipment, id: `SHP-${Math.floor(100 + Math.random() * 900)}` };
    this.deliveries = [created, ...this.deliveries];
    this.state.notify(`Shipment for ${created.poId} logged into tracking queue.`);
    this.resetShipmentForm();
    this.showAddShipment = false;
  }

  resetShipmentForm(): void {
    this.newShipment = {
      id: '',
      poId: '',
      vendor: '',
      requiredDate: '2026-09-10',
      arrivalDate: '2026-09-08',
      carrier: 'TCS Cargo',
      trackingNo: '',
      grn: 'Pending',
      qc: 'Pending',
      destination: 'Karachi Central Warehouse'
    };
  }

  setGrn(po: DeliveryShipment, status: 'Passed' | 'Pending'): void {
    po.grn = status;
    this.state.notify(`ERP GRN marked as ${status} for ${po.poId}.`);
  }

  setQc(po: DeliveryShipment, status: 'Passed' | 'Rejected'): void {
    po.qc = status;
    this.state.notify(`Quality inspection status updated to ${status} for ${po.poId}.`);
  }

  saveDelivery(po: DeliveryShipment): void {
    const isLate = po.arrivalDate > po.requiredDate;
    this.state.notify(isLate ? `Arrival date updated. Delay alert flagged for ${po.poId}.` : `Delivery date updated for ${po.poId}.`);
  }

  deleteShipment(id: string): void {
    this.deliveries = this.deliveries.filter(d => d.id !== id);
    this.state.notify('Delivery consignment record deleted.');
  }

  exportDeliveries(): void {
    this.state.notify('Exporting delivery & GRN schedule (Excel)...');
  }
}
