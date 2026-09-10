import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { StatusComponent } from '../shared/ui.component';

export interface BiddingLineItem {
  id: string;
  itemCode: string;
  description: string;
  vendor: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  days: number;
  status: string;
}

@Component({
  selector: 'app-bidding',
  standalone: true,
  imports: [FormsModule, StatusComponent],
  template: `
    <div class="bidding-screen">
      <!-- Main Title -->
      <h1 class="page-main-title">Vendor Bidding & Requisition Form</h1>

      <!-- Top Requisition Card -->
      <div class="bidding-panel main-form-panel">
        
        <!-- Header Banner with Logo, Meta, Status and Actions -->
        <div class="requisition-header">
          <div class="req-identity">
            <div class="logo-box">
              <span>Logo</span>
            </div>
            <div class="req-text-info">
              <h2>Requisition # {{ form.documentNumber || 'REQ-1023' }}</h2>
              <div class="req-meta">
                <span class="req-by">Requested By: <strong>{{ form.enteredBy || 'Ali Khan' }}</strong></span>
                <span class="req-sub">{{ form.date || '12 May, 2024' }} · {{ form.location || 'Karachi' }}</span>
              </div>
            </div>
          </div>

          <div class="req-actions-group">
            <div class="status-wrap">
              <span class="new-badge">{{ formStatus }}</span>
            </div>
            <div class="buttons-row">
              <button type="button" class="btn-download" (click)="download()">Download PDF</button>
              <button type="button" class="btn-save" (click)="saveChanges()">Save Changes</button>
            </div>
          </div>
        </div>

        <!-- Form Fields -->
        <form class="bidding-form" (ngSubmit)="saveChanges()">

          <!-- Document Number with right-side Toggle -->
          <div class="bidding-field-group">
            <label class="bidding-label">
              Document Number <span class="asterisk">*</span>
            </label>
            <div class="input-with-toggle">
              <input
                type="text"
                [(ngModel)]="form.documentNumber"
                name="documentNumber"
                placeholder="Enter Requisition Number"
              />
              <button
                type="button"
                class="dual-toggle-pill"
                [class.switched]="toggleActive"
                (click)="toggleSwitch()"
                title="Toggle Active Mode"
              >
                <span class="toggle-dark"></span>
                <span class="toggle-cyan"></span>
              </button>
            </div>
          </div>

          <!-- Required For -->
          <div class="bidding-field-group">
            <label class="bidding-label">
              Required For <span class="asterisk">*</span>
            </label>
            <input
              type="text"
              [(ngModel)]="form.requiredFor"
              name="requiredFor"
              placeholder="e.g. Substation Switchgear Upgrade Phase 2"
            />
          </div>

          <!-- Entered By -->
          <div class="bidding-field-group">
            <label class="bidding-label">
              Entered By
            </label>
            <input
              type="text"
              [(ngModel)]="form.enteredBy"
              name="enteredBy"
              placeholder="e.g. Ali Khan (Procurement Engineer)"
            />
          </div>

          <!-- Date -->
          <div class="bidding-field-group">
            <label class="bidding-label">
              Date
            </label>
            <input
              type="date"
              [(ngModel)]="form.date"
              name="date"
              placeholder="Requisition Date"
            />
          </div>

          <!-- Date Required -->
          <div class="bidding-field-group">
            <label class="bidding-label">
              Date Required
            </label>
            <input
              type="date"
              [(ngModel)]="form.dateRequired"
              name="dateRequired"
              placeholder="Enter Date Required"
            />
          </div>

          <!-- Ship VIA -->
          <div class="bidding-field-group">
            <label class="bidding-label">
              Ship VIA
            </label>
            <input
              type="text"
              [(ngModel)]="form.shipVia"
              name="shipVia"
              placeholder="e.g. Road Freight / Air Express / TCS Logistics"
            />
          </div>

          <!-- Location -->
          <div class="bidding-field-group">
            <label class="bidding-label">
              Location
            </label>
            <input
              type="text"
              [(ngModel)]="form.location"
              name="location"
              placeholder="e.g. Karachi Central Facility"
            />
          </div>

          <!-- Request Description -->
          <div class="bidding-field-group">
            <label class="bidding-label">
              Request Description <span class="asterisk">*</span>
            </label>
            <textarea
              rows="2"
              [(ngModel)]="form.requestDescription"
              name="requestDescription"
              placeholder="Enter detailed technical description of goods/services required..."
            ></textarea>
          </div>

          <!-- Comments -->
          <div class="bidding-field-group">
            <label class="bidding-label">
              Comments
            </label>
            <textarea
              rows="2"
              [(ngModel)]="form.comments"
              name="comments"
              placeholder="Enter internal comments, delivery instructions, or special terms..."
            ></textarea>
          </div>

        </form>

      </div>

      <!-- Bottom Card: Vendor Bidding List -->
      <div class="bidding-list-section">
        <h2 class="section-title">Vendor Bidding List & Line Items</h2>
        
        <div class="bidding-panel list-panel">
          <div class="list-top-action" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <button type="button" class="btn-create" (click)="createBid()">+ Create Item</button>
            <span style="font-size: 11px; color: #64748b;">Total Line Items: <strong>{{ biddingItems.length }}</strong></span>
          </div>

          <!-- Dynamic Bidding List Items Table -->
          @if (biddingItems.length > 0) {
            <div class="table-scroll" style="margin: 8px 0 16px;">
              <table>
                <thead>
                  <tr>
                    <th>Item Code</th>
                    <th>Description</th>
                    <th>Vendor Name</th>
                    <th>Qty</th>
                    <th>Unit Price ($)</th>
                    <th>Total ($)</th>
                    <th>Delivery</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of biddingItems; track item.id; let idx = $index) {
                    <tr>
                      <td><input [(ngModel)]="item.itemCode" style="font-family: monospace; font-size: 11px; width: 90px;" /></td>
                      <td><input [(ngModel)]="item.description" style="min-width: 160px;" /></td>
                      <td><input [(ngModel)]="item.vendor" style="font-weight: 600; min-width: 140px;" /></td>
                      <td><input type="number" [(ngModel)]="item.quantity" (ngModelChange)="recalc(item)" style="width: 55px;" /></td>
                      <td><input type="number" [(ngModel)]="item.unitPrice" (ngModelChange)="recalc(item)" style="width: 80px;" /></td>
                      <td><strong style="color: #1769e0;">\${{ item.amount.toLocaleString() }}</strong></td>
                      <td><input type="number" [(ngModel)]="item.days" style="width: 50px;" /> d</td>
                      <td><app-status [text]="item.status" [good]="item.status === 'Active' || item.status === 'Approved'" /></td>
                      <td>
                        <button class="btn small danger-btn" (click)="deleteItem(item.id)">✕</button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="empty-list-space">
              <p style="text-align: center; color: #94a3b8; font-size: 11px; padding: 18px 0;">No bid items added yet. Click "+ Create Item" above to add items.</p>
            </div>
          }

          <div class="list-bottom-actions">
            <button type="button" class="btn-submit" (click)="submitBidding()">Submit Bidding</button>
            <button type="button" class="btn-delete" (click)="deleteBidding()">Delete Last</button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .bidding-screen {
      padding: 6px 4px 30px;
      max-width: 1560px;
      margin: 0 auto;
      font-family: inherit;
    }

    .page-main-title {
      font-size: 16px;
      font-weight: 800;
      color: #17263c;
      margin: 0 0 14px;
      letter-spacing: -0.01em;
    }

    .section-title {
      font-size: 14px;
      font-weight: 800;
      color: #17263c;
      margin: 18px 0 10px;
      letter-spacing: -0.01em;
    }

    .bidding-panel {
      background: #ffffff;
      border: 1px solid #e1e7f0;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(15, 34, 58, 0.04);
      padding: 16px 20px;
    }

    .requisition-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 14px;
      margin-bottom: 16px;
      border-bottom: 1px solid #f0f4f8;
      gap: 16px;
      flex-wrap: wrap;
    }

    .req-identity {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .logo-box {
      width: 44px;
      height: 44px;
      border-radius: 6px;
      background: #eef4fc;
      border: 1px solid #d4e2f5;
      display: grid;
      place-items: center;
      color: #2b6cb0;
      font-weight: 700;
      font-size: 11px;
    }

    .req-text-info h2 {
      margin: 0 0 3px;
      font-size: 13px;
      font-weight: 800;
      color: #18273d;
    }

    .req-meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 10px;
      color: #718096;
    }

    .req-by strong {
      color: #2d3748;
    }

    .req-actions-group {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }

    .new-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 99px;
      background: #e9f2fe;
      color: #1d72b8;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .buttons-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-download {
      padding: 6px 14px;
      font-size: 11px;
      font-weight: 600;
      color: #4a5568;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-download:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }

    .btn-save {
      padding: 6px 16px;
      font-size: 11px;
      font-weight: 700;
      color: #ffffff;
      background: #1769e0;
      border: 1px solid #1769e0;
      border-radius: 5px;
      cursor: pointer;
      box-shadow: 0 2px 5px rgba(23, 105, 224, 0.2);
      transition: all 0.15s;
    }

    .btn-save:hover {
      background: #1157be;
      border-color: #1157be;
    }

    .bidding-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .bidding-field-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .bidding-label {
      font-size: 10.5px;
      font-weight: 700;
      color: #4a5568;
    }

    .asterisk {
      color: #e53e3e;
      font-weight: 800;
    }

    .bidding-field-group input,
    .bidding-field-group textarea {
      width: 100%;
      box-sizing: border-box;
      padding: 7px 12px;
      font-size: 11px;
      color: #1a202c;
      background: #ffffff;
      border: 1px solid #d9e2ec;
      border-radius: 5px;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      font-family: inherit;
    }

    .bidding-field-group input::placeholder,
    .bidding-field-group textarea::placeholder {
      color: #a0aec0;
      font-size: 10.5px;
    }

    .bidding-field-group input:focus,
    .bidding-field-group textarea:focus {
      border-color: #2b6cb0;
      box-shadow: 0 0 0 2px rgba(43, 108, 176, 0.12);
    }

    .input-with-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .input-with-toggle input {
      flex: 1;
    }

    .dual-toggle-pill {
      display: flex;
      width: 38px;
      height: 24px;
      border-radius: 4px;
      overflow: hidden;
      border: none;
      padding: 0;
      cursor: pointer;
      flex-shrink: 0;
    }

    .toggle-dark {
      flex: 1;
      height: 100%;
      background: #002244;
      transition: background 0.2s;
    }

    .toggle-cyan {
      flex: 1;
      height: 100%;
      background: #00a0e9;
      transition: background 0.2s;
    }

    .dual-toggle-pill.switched .toggle-dark {
      background: #00a0e9;
    }

    .dual-toggle-pill.switched .toggle-cyan {
      background: #002244;
    }

    .bidding-list-section {
      margin-top: 10px;
    }

    .list-panel {
      min-height: 130px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .btn-create {
      padding: 5px 16px;
      font-size: 11px;
      font-weight: 600;
      color: #2d3748;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-create:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }

    .empty-list-space {
      min-height: 48px;
    }

    .list-bottom-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 8px;
      margin-top: auto;
      padding-top: 12px;
    }

    .btn-submit {
      padding: 6px 18px;
      font-size: 11px;
      font-weight: 700;
      color: #ffffff;
      background: #1769e0;
      border: 1px solid #1769e0;
      border-radius: 5px;
      cursor: pointer;
      box-shadow: 0 2px 5px rgba(23, 105, 224, 0.2);
      transition: all 0.15s;
    }

    .btn-submit:hover {
      background: #1157be;
    }

    .btn-delete {
      padding: 6px 18px;
      font-size: 11px;
      font-weight: 700;
      color: #ffffff;
      background: #1769e0;
      border: 1px solid #1769e0;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-delete:hover {
      background: #c53030;
      border-color: #c53030;
    }
  `]
})
export class BiddingComponent {
  private readonly state = inject(PortalStateService);

  toggleActive = false;
  formStatus = 'New';

  form = {
    documentNumber: 'REQ-1023',
    requiredFor: 'Main Substation 11kV Switchgear Project',
    enteredBy: 'Ali Khan',
    date: '2024-05-12',
    dateRequired: '2024-06-15',
    shipVia: 'Road Logistics (Korangi Warehouse)',
    location: 'Karachi',
    requestDescription: 'Supply and installation of 11kV gas-insulated vacuum circuit breakers with auxiliary relays.',
    comments: 'Strict adherence to IEEE and IEC-62271 standards is mandatory. Origin inspection required.'
  };

  biddingItems: BiddingLineItem[] = [
    { id: '1', itemCode: 'ITM-EL-01', description: '11kV Vacuum Circuit Breaker', vendor: 'ABC Supplies Pvt. Ltd.', quantity: 4, unitPrice: 13000, amount: 52000, days: 7, status: 'Active' },
    { id: '2', itemCode: 'ITM-EL-02', description: 'Busbar Insulators & Connectors', vendor: 'Perfect Industrial', quantity: 12, unitPrice: 3650, amount: 43800, days: 5, status: 'Active' }
  ];

  toggleSwitch(): void {
    this.toggleActive = !this.toggleActive;
    this.formStatus = this.toggleActive ? 'Priority' : 'New';
    this.state.notify(`Requisition mode switched to: ${this.formStatus}`);
  }

  recalc(item: BiddingLineItem): void {
    item.amount = (item.quantity || 0) * (item.unitPrice || 0);
  }

  saveChanges(): void {
    this.state.notify(`Requisition ${this.form.documentNumber} saved successfully.`);
  }

  download(): void {
    this.state.notify(`Downloading Requisition ${this.form.documentNumber} PDF export.`);
  }

  createBid(): void {
    const newItem: BiddingLineItem = {
      id: String(Date.now()),
      itemCode: `ITM-EL-0${this.biddingItems.length + 1}`,
      description: 'Auxiliary Protection Relay Panel',
      vendor: 'Global Traders Sourcing',
      quantity: 2,
      unitPrice: 8500,
      amount: 17000,
      days: 6,
      status: 'Active'
    };
    this.biddingItems = [...this.biddingItems, newItem];
    this.state.notify(`Line item ${newItem.itemCode} added to bidding list.`);
  }

  deleteItem(id: string): void {
    this.biddingItems = this.biddingItems.filter(i => i.id !== id);
    this.state.notify('Line item removed from bidding list.');
  }

  submitBidding(): void {
    this.formStatus = 'Submitted';
    this.state.notify(`Bidding list for ${this.form.documentNumber} officially submitted to Procurement.`);
  }

  deleteBidding(): void {
    if (this.biddingItems.length > 0) {
      const popped = this.biddingItems[this.biddingItems.length - 1];
      this.biddingItems = this.biddingItems.slice(0, -1);
      this.state.notify(`Item ${popped.itemCode} removed.`);
    } else {
      this.state.notify('No items to delete.');
    }
  }
}
