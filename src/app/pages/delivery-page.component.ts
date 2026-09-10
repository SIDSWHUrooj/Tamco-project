import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';
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
  imports: [FormsModule, PageHeadingComponent, StatusComponent],
  template: `
    <app-page-heading eyebrow="Fulfilment & Warehouse" title="Delivery & GRN Tracking" subtitle="Supplier arrival commitments are compared with contract dates; ERP Good Receipt Notes (GRN) and QC inspection follow the delivery.">
      <div class="heading-actions">
        <button class="btn" (click)="showAddShipment = !showAddShipment">
          {{ showAddShipment ? '✕ Close Form' : '+ Log Shipment / Dispatch' }}
        </button>
        <button class="btn secondary" (click)="exportDeliveries()">Export Schedule</button>
      </div>
    </app-page-heading>

    <div class="callout warn">
      <b>Late-delivery automation active:</b> If expected arrival exceeds contractual required date, an automatic internal delay escalation is flagged to Procurement.
    </div>

    <!-- Add Shipment Form -->
    @if (showAddShipment) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid #1769e0;">
        <div class="panel-title">
          <div>
            <h2>Log New Dispatch / Delivery Consignment</h2>
            <p>Enter tracking waybill, carrier details and committed warehouse delivery date.</p>
          </div>
        </div>

        <div class="form-grid">
          <label>PO Reference # *<input [(ngModel)]="newShipment.poId" placeholder="e.g. PO-002349" /></label>
          <label>Supplier Name *<input [(ngModel)]="newShipment.vendor" placeholder="e.g. ABC Supplies Pvt. Ltd." /></label>
          <label>Required Contract Date *<input type="date" [(ngModel)]="newShipment.requiredDate" /></label>
          <label>Committed Arrival Date *<input type="date" [(ngModel)]="newShipment.arrivalDate" /></label>
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
    <div style="display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap;">
      <input
        style="flex: 1; min-width: 240px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px;"
        [(ngModel)]="searchQuery"
        placeholder="🔍 Search deliveries by PO#, vendor, tracking # or destination..."
      />
      <select
        style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; background: #fff;"
        [(ngModel)]="statusFilter"
      >
        <option value="">All Deliveries</option>
        <option value="On track">On Track</option>
        <option value="Late">Delayed / Late</option>
      </select>
    </div>

    <!-- Live Deliveries Grid -->
    <section class="delivery-grid">
      @for (po of filteredDeliveries(); track po.id) {
        <article class="panel delivery-card">
          <div class="panel-title">
            <div>
              <span class="mono">{{ po.poId }}</span>
              <h2>{{ po.vendor }}</h2>
            </div>
            <app-status
              [text]="po.arrivalDate > po.requiredDate ? '⚠️ Late' : '✓ On track'"
              [bad]="po.arrivalDate > po.requiredDate"
              [good]="po.arrivalDate <= po.requiredDate"
            />
          </div>

          <div class="date-track">
            <label><small>Required Date</small><input type="date" [(ngModel)]="po.requiredDate" (ngModelChange)="saveDelivery(po)" /></label>
            <span>→</span>
            <label><small>Supplier Arrival</small><input type="date" [(ngModel)]="po.arrivalDate" (ngModelChange)="saveDelivery(po)" /></label>
          </div>

          <div style="font-size: 11px; color: #475569; margin: 8px 0;">
            <span>Carrier: <strong>{{ po.carrier }}</strong> ({{ po.trackingNo }})</span><br />
            <small style="color: #64748b;">Destination: {{ po.destination }}</small>
          </div>

          <div class="mini-status">
            <span>ERP GRN: <app-status [text]="po.grn" [good]="po.grn==='Passed'" [warn]="po.grn==='Pending'" /></span>
            <span>QC: <app-status [text]="po.qc" [good]="po.qc==='Passed'" [warn]="po.qc==='Pending'" [bad]="po.qc==='Rejected'" /></span>
          </div>

          @if (role() !== 'vendor') {
            <div class="toolbar" style="margin-top: 10px; justify-content: space-between;">
              <div style="display: flex; gap: 6px;">
                @if (po.grn === 'Pending') {
                  <button class="btn small" (click)="setGrn(po, 'Passed')">GRN Pass</button>
                }
                @if (po.qc === 'Pending') {
                  <button class="btn small" (click)="setQc(po, 'Passed')">QC Pass</button>
                  <button class="btn small danger-btn" (click)="setQc(po, 'Rejected')">QC Reject</button>
                }
              </div>
              <button class="btn small danger-btn" (click)="deleteShipment(po.id)">✕</button>
            </div>
          }
        </article>
      }
    </section>
  `
})
export class DeliveryPageComponent {
  readonly state = inject(PortalStateService);
  readonly role = computed(() => this.state.role());

  showAddShipment = false;
  searchQuery = '';
  statusFilter = '';

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

  filteredDeliveries = computed(() => {
    let list = this.deliveries;
    if (this.role() === 'vendor') {
      list = list.filter(d => d.vendor.includes('ABC Supplies'));
    }
    const q = this.searchQuery.trim().toLowerCase();
    const st = this.statusFilter;
    return list.filter(d => {
      const matchQ = !q || d.poId.toLowerCase().includes(q) || d.vendor.toLowerCase().includes(q) || d.trackingNo.toLowerCase().includes(q) || d.destination.toLowerCase().includes(q);
      const isLate = d.arrivalDate > d.requiredDate;
      const matchSt = !st || (st === 'Late' && isLate) || (st === 'On track' && !isLate);
      return matchQ && matchSt;
    });
  });

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
