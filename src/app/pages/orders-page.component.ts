import { Component, OnInit, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { VendorApiService } from '../core/vendor-api.service';
import { SageApiService } from '../core/sage-api.service';
import { StatusComponent } from '../shared/ui.component';
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

export interface CreatePoItem {
  srNo: number;
  itemNumber: string;
  description: string;
  price: number;
  qty: number;
}

export interface DetailedPoItem {
  srNo: number;
  itemNumber: string;
  description: string;
  qty: number;
  uom: string;
  cost: number;
}

export interface DetailedPurchaseOrder {
  purchaseOrderNumber: string;
  vendorId: string;
  vendorName: string;
  purchaseOrderDate: string;
  arrivalDate: string;
  paymentTerm: string;
  description: string;
  comments: string;
  items: DetailedPoItem[];
}

export interface VendorCatalogEntry {
  vendorId: string;
  vendorName: string;
  category: string;
  contactPerson: string;
  items: {
    itemNumber: string;
    description: string;
    price: number;
    qty: number;
  }[];
}

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [FormsModule, StatusComponent, IconComponent, CustomSelectComponent, CustomDatePickerComponent],
  styles: [`
    /* Option 6 Pill Capsule Tabs */
    .profile-tabs {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      margin-bottom: 20px;
      background: #ffffff;
      padding: 5px 6px;
      border-radius: 9999px;
      border: 1px solid var(--line, #e2e8f0);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      max-width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .profile-tabs button {
      border: 0;
      padding: 8px 22px;
      background: transparent;
      color: var(--muted, #64748b);
      font-weight: 600;
      font-size: 13.5px;
      cursor: pointer;
      border-radius: 9999px;
      white-space: nowrap;
      transition: all 0.2s ease;
      outline: none;
      line-height: 1.4;
      display: inline-flex;
      align-items: center;
      gap: 7px;

      &:hover:not(.active) {
        color: var(--text, #0f172a);
        background: #f1f5f9;
      }

      &.active {
        background: var(--role-accent, #2563eb);
        color: #ffffff;
        font-weight: 600;
        box-shadow: 0 3px 10px var(--role-glow, rgba(37, 99, 235, 0.35));
      }
    }

    /* Heading Banners */
    .po-main-heading {
      background-color: var(--role-accent, #2563eb);
      color: #ffffff;
      padding: 8px 16px;
      border-radius: 5px;
      text-align: center;
      width: 100%;
      margin-bottom: 14px;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: -0.01em;
      box-shadow: 0 2px 6px var(--role-glow, rgba(37, 99, 235, 0.2));
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    /* Screen Card Wrap */
    .screen-card {
      background-color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border: 1px solid var(--line, #e2e8f0);
      margin-bottom: 20px;
    }

    /* Form Grids */
    .form-grid-create {
      display: grid;
      grid-template-columns: minmax(260px, 1.4fr) minmax(220px, 1.4fr) minmax(170px, 1fr) auto;
      gap: 16px;
      align-items: flex-end;
    }

    .form-grid-viewer-row1 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 16px;
      margin-bottom: 14px;
    }

    .form-grid-viewer-row2 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
    }

    @media (max-width: 992px) {
      .form-grid-create { grid-template-columns: 1fr 1fr; }
      .form-grid-viewer-row1 { grid-template-columns: 1fr 1fr; }
      .form-grid-viewer-row2 { grid-template-columns: 1fr; }
    }

    @media (max-width: 640px) {
      .form-grid-create { grid-template-columns: 1fr; }
      .form-grid-viewer-row1 { grid-template-columns: 1fr; }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group label {
      font-size: 13px;
      font-weight: 600;
      color: #000000;
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .req-star {
      color: #dc3545;
      font-weight: 700;
    }

    .input-group-custom {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .form-control-custom {
      width: 100%;
      height: 38px;
      padding: 6px 12px;
      font-size: 13px;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      background-color: #ffffff;
      color: #0f172a;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
      box-sizing: border-box;

      &:focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        outline: none;
      }

      &[readonly] {
        background-color: #f8fafc;
        color: #334155;
      }
    }

    .btn-search-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      flex-shrink: 0;
      border: 0;
      border-radius: 4px;
      background-color: var(--role-accent, #2563eb);
      color: #ffffff;
      cursor: pointer;
      transition: background-color 0.2s ease, transform 0.1s ease;

      &:hover {
        background-color: #1e3a8a;
        transform: translateY(-1px);
      }
    }

    .btn-refresh-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      flex-shrink: 0;
      border: 0;
      border-radius: 4px;
      background-color: #16a34a;
      color: #ffffff;
      cursor: pointer;
      transition: background-color 0.2s ease, transform 0.1s ease;

      &:hover {
        background-color: #15803d;
        transform: translateY(-1px);
      }
    }

    .btn-create-po-action {
      height: 38px;
      padding: 0 20px;
      background-color: #007bff;
      border: 1px solid #007bff;
      color: #ffffff;
      font-weight: 600;
      font-size: 13.5px;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: background-color 0.2s ease, box-shadow 0.2s ease;
      white-space: nowrap;

      &:hover {
        background-color: #0069d9;
        border-color: #0062cc;
        box-shadow: 0 2px 6px rgba(0, 123, 255, 0.3);
      }
    }

    /* Enterprise Data Tables */
    .legacy-datatable {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      font-size: 13px;
    }

    .legacy-datatable thead th {
      background-color: #f1f5f9;
      color: #0b1f3a;
      font-weight: 700;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      padding: 10px 12px;
      border: 1px solid #dee2e6;
      text-align: left;
    }

    .legacy-datatable thead th.text-center { text-align: center; }
    .legacy-datatable thead th.text-right { text-align: right; }

    .legacy-datatable tbody td {
      padding: 8px 12px;
      border: 1px solid #dee2e6;
      vertical-align: middle;
      color: #1e293b;
    }

    .legacy-datatable tbody tr:hover {
      background-color: #f8fafc;
    }

    .legacy-datatable tbody input {
      width: 100%;
      height: 32px;
      box-sizing: border-box;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 12.5px;
      background: #ffffff;

      &:focus {
        border-color: #2563eb;
        outline: none;
      }
    }

    .legacy-datatable tfoot td {
      padding: 10px 12px;
      background-color: #f8fafc;
      border: 1px solid #dee2e6;
      font-weight: 700;
    }

    /* Modal Overlays */
    .po-modal-overlay {
      position: fixed; inset: 0; z-index: 90; background: rgba(15, 23, 42, 0.55);
      display: grid; place-items: center; padding: 20px;
      backdrop-filter: blur(2px);
    }

    .po-modal-dialog {
      width: min(880px, 100%); background: #ffffff; border-radius: 8px; overflow: hidden;
      box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.25); max-height: 90vh; display: flex; flex-direction: column;
      border: 1px solid #cbd5e1;
    }

    .po-modal-header {
      background-color: var(--role-accent, #2563eb); color: #ffffff; height: 50px; display: flex; align-items: center;
      padding: 0 18px; font-size: 15px; font-weight: 700; justify-content: space-between;
    }

    .po-modal-header button.btn-close-modal {
      background: none; border: 0; color: #ffffff; font-size: 22px; cursor: pointer; opacity: 0.8;
      &:hover { opacity: 1; }
    }

    .po-modal-body { padding: 18px; overflow-y: auto; }
    .po-modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 18px; border-top: 1px solid #e2e8f0; background: #f8fafc; }

    /* PO Register & Badges */
    .po-active-badge {
      font-size: 12px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 6px;
      background: var(--role-soft, #eff6ff);
      color: var(--role-accent, #2563eb);
      border: 1px solid var(--role-border, #bfdbfe);
    }
  `],
  template: `
    <!-- Option 6 Pill Capsule Tabs Navigation -->
    <div class="profile-tabs">
      @if (role() !== 'vendor') {
        <button
          type="button"
          [class.active]="activeTab === 'create'"
          (click)="switchTab('create')">
          <app-icon name="plus" [size]="14" />
          <span>Create PO</span>
        </button>
      }

      <button
        type="button"
        [class.active]="activeTab === 'viewer'"
        (click)="switchTab('viewer')">
        <app-icon name="search" [size]="14" />
        <span>Purchase Order</span>
      </button>

      <button
        type="button"
        [class.active]="activeTab === 'register'"
        (click)="switchTab('register')">
        <app-icon name="table" [size]="14" />
        <span>Purchase Orders Register</span>
      </button>
    </div>

    <!-- ========================================================================= -->
    <!-- SCREEN 1: CREATE PO (Legacy PO_vendor_Create.cshtml - Photo 2)             -->
    <!-- ========================================================================= -->
    @if (activeTab === 'create' && role() !== 'vendor') {
      <!-- Top Card: Create PO Input Bar -->
      <section class="screen-card">
        <h5 class="po-main-heading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
          <span>Create PO</span>
        </h5>

        <div class="form-grid-create">
          <!-- Vendor ID Field with Search and Refresh -->
          <div class="form-group">
            <label>Vendor ID <span class="req-star">*</span></label>
            <div class="input-group-custom">
              <input
                type="text"
                [(ngModel)]="createVendorId"
                placeholder="Enter Vendor ID"
                class="form-control-custom"
              />
              <button
                type="button"
                class="btn-search-icon"
                (click)="openVendorLookup()"
                title="Search Vendor List Lookup">
                <app-icon name="search" [size]="14" />
              </button>
              <button
                type="button"
                class="btn-refresh-icon"
                (click)="refreshPoCreate()"
                title="Refresh / Reload Form">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Vendor Name Field -->
          <div class="form-group">
            <label>Vendor Name <span class="req-star">*</span></label>
            <input
              type="text"
              [(ngModel)]="createVendorName"
              placeholder="Enter Vendor Name"
              class="form-control-custom"
            />
          </div>

          <!-- Date Field -->
          <div class="form-group">
            <label>Date</label>
            <input
              type="date"
              [(ngModel)]="createPoDate"
              class="form-control-custom"
            />
          </div>

          <!-- Action Button: Create PO -->
          <div>
            <button
              type="button"
              class="btn-create-po-action"
              (click)="submitCreatePo()"
              title="Click to generate and release PO">
              <span>Create PO</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Bottom Card: PO Vendor List (Table of line items) -->
      <section class="screen-card">
        <h5 class="po-main-heading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          <span>PO Vendor List</span>
        </h5>

        <div class="table-scroll">
          <table class="legacy-datatable">
            <thead>
              <tr>
                <th style="width: 70px;" class="text-center">SrNo</th>
                <th style="width: 250px;">Item Number</th>
                <th style="width: 150px;" class="text-right">Price</th>
                <th style="width: 120px;" class="text-center">Qty</th>
                <th style="width: 150px;" class="text-right">Subtotal ($)</th>
                <th style="width: 80px;" class="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              @if (createPoItems.length === 0) {
                <tr>
                  <td colspan="6" style="text-align: center; color: #94a3b8; padding: 24px;">
                    No line items added yet. Click Search 🔍 above to pick an awarded vendor with items, or add lines below.
                  </td>
                </tr>
              }
              @for (item of createPoItems; track item.srNo; let idx = $index) {
                <tr>
                  <td class="text-center" style="font-weight: 700; color: #64748b;">{{ item.srNo }}</td>
                  <td>
                    <input [(ngModel)]="item.itemNumber" placeholder="Item Code / Number" style="font-weight: 600;" />
                  </td>
                  <td>
                    <input type="number" [(ngModel)]="item.price" style="text-align: right;" />
                  </td>
                  <td>
                    <input type="number" [(ngModel)]="item.qty" style="text-align: center;" />
                  </td>
                  <td class="text-right" style="font-weight: 700; color: var(--role-accent);">
                    \${{ ((item.price || 0) * (item.qty || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                  </td>
                  <td class="text-center">
                    <button
                      type="button"
                      class="btn-action btn-action-delete"
                      (click)="removePoItemRow(idx)"
                      title="Remove Item">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" style="text-align: right; font-weight: 700;">Total PO Order Value:</td>
                <td class="text-right" style="font-size: 15px; font-weight: 800; color: #007bff;">
                  \${{ createPoTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px; padding-top: 10px; border-top: 1px solid #e2e8f0;">
          <button type="button" class="btn secondary small" (click)="addPoItemRow()">
            <app-icon name="plus" [size]="12" />
            <span>+ Add Row</span>
          </button>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn secondary small" (click)="clearPoCreateForm()">Clear</button>
            <button type="button" class="btn small" (click)="submitCreatePo()" style="background: #007bff; border-color: #007bff;">Create PO</button>
          </div>
        </div>
      </section>
    }

    <!-- ========================================================================= -->
    <!-- SCREEN 2: PURCHASE ORDER VIEWER & LOOKUP (Purchase_Order.cshtml - Photo 1) -->
    <!-- ========================================================================= -->
    @if (activeTab === 'viewer') {
      <!-- Top Card: Purchase Order 7-Field Header -->
      <section class="screen-card">
        <div style="text-align: left; background-color: #67008a; padding: 10px 16px; border-radius: 5px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); margin-bottom: 8px;">
          <h5 style="color: white; margin: 0; font-weight: 600; font-size: 15px;">
            Purchase Order
          </h5>
        </div>
        <hr style="margin: 0 0 14px 0; border: none; border-top: 1.5px solid forestgreen;" />

        <!-- Row 1: Purchase Number*, Vendor ID*, PO Date*, Arrival Date* -->
        <div class="form-grid-viewer-row1">
          <div class="form-group">
            <label>Purchase Number <span class="req-star">*</span></label>
            <div class="input-group-custom">
              <input
                type="text"
                [(ngModel)]="currentPoNumber"
                placeholder="Enter Purchase Number"
                class="form-control-custom"
                readonly
              />
              <button
                type="button"
                class="btn-search-icon"
                (click)="openPoSearchModal()"
                title="Search Purchase Orders">
                <app-icon name="search" [size]="14" />
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>Vendor ID <span class="req-star">*</span></label>
            <input
              type="text"
              [(ngModel)]="currentPoVendorId"
              placeholder="Enter Vendor ID"
              class="form-control-custom"
              readonly
            />
          </div>

          <div class="form-group">
            <label>Purchase Order Date <span class="req-star">*</span></label>
            <input
              type="date"
              [(ngModel)]="currentPoDate"
              class="form-control-custom"
              readonly
            />
          </div>

          <div class="form-group">
            <label>Arrival Date <span class="req-star">*</span></label>
            <input
              type="date"
              [(ngModel)]="currentPoArrivalDate"
              class="form-control-custom"
              readonly
            />
          </div>
        </div>

        <!-- Row 2: Payment Term, Description, Comments -->
        <div class="form-grid-viewer-row2">
          <div class="form-group">
            <label>Payment Term</label>
            <input
              type="text"
              [(ngModel)]="currentPoPaymentTerm"
              placeholder="Enter Payment Term"
              class="form-control-custom"
              readonly
            />
          </div>

          <div class="form-group">
            <label>Description</label>
            <input
              type="text"
              [(ngModel)]="currentPoDescription"
              placeholder="Enter Description"
              class="form-control-custom"
              readonly
            />
          </div>

          <div class="form-group">
            <label>Comments</label>
            <input
              type="text"
              [(ngModel)]="currentPoComments"
              placeholder="Enter Comments"
              class="form-control-custom"
              readonly
            />
          </div>
        </div>
      </section>

      <!-- Bottom Card: Purchase Order List (Table of line items) -->
      <section class="screen-card">
        <div style="text-align: left; background-color: #67008a; padding: 10px 16px; border-radius: 5px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); margin-bottom: 8px;">
          <h5 style="color: white; margin: 0; font-weight: 600; font-size: 15px;">
            Purchase Order List
          </h5>
        </div>
        <hr style="margin: 0 0 14px 0; border: none; border-top: 1.5px solid forestgreen;" />

        <div class="table-scroll">
          <table class="legacy-datatable">
            <thead>
              <tr>
                <th style="width: 70px;" class="text-center">SrNo</th>
                <th style="width: 180px;">Item Number</th>
                <th>Description</th>
                <th style="width: 100px;" class="text-center">Qty</th>
                <th style="width: 90px;" class="text-center">UOM</th>
                <th style="width: 130px;" class="text-right">Cost</th>
                <th style="width: 140px;" class="text-right">Line Total ($)</th>
              </tr>
            </thead>
            <tbody>
              @if (currentPoItems.length === 0) {
                <tr>
                  <td colspan="7" style="text-align: center; color: #94a3b8; padding: 24px;">
                    Select a purchase order using the search button 🔍 above to display line items.
                  </td>
                </tr>
              }
              @for (item of currentPoItems; track item.srNo) {
                <tr>
                  <td class="text-center" style="font-weight: 700; color: #64748b;">{{ item.srNo }}</td>
                  <td><strong style="color: var(--role-accent);">{{ item.itemNumber }}</strong></td>
                  <td>{{ item.description }}</td>
                  <td class="text-center font-bold">{{ item.qty }}</td>
                  <td class="text-center"><span class="badge" style="background: #f1f5f9; padding: 2px 6px;">{{ item.uom }}</span></td>
                  <td class="text-right">\${{ item.cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
                  <td class="text-right font-bold" style="color: var(--role-accent);">
                    \${{ (item.cost * item.qty).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                  </td>
                </tr>
              }
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" style="text-align: right; font-weight: 700;">Purchase Order Total:</td>
                <td class="text-right" style="font-size: 15px; font-weight: 800; color: #007bff;">
                  \${{ currentPoGrandTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px; padding-top: 10px; border-top: 1px solid #e2e8f0; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 13px; font-weight: 700; color: #0b1f3a;">Order Status:</span>
            <app-status [text]="currentPoStatus()" [good]="currentPoStatus()==='Approved'" [warn]="currentPoStatus()==='Pending'" />
          </div>

          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn secondary small" (click)="openPoSearchModal()">
              <app-icon name="search" [size]="12" />
              <span>Browse / Search Other POs</span>
            </button>
            <button type="button" class="btn secondary small" (click)="switchTab('register')">
              <app-icon name="table" [size]="12" />
              <span>View in Register</span>
            </button>
            @if (role() === 'vendor') {
              @if (!isVendorAcknowledged()) {
                <button type="button" class="btn small" (click)="acknowledgeCurrentPo()" style="background: #004225; border-color: #004225; color: #ffffff; display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>Acknowledge PO Acceptance</span>
                </button>
              } @else {
                <span style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: #f0fdf4; color: #16a34a; font-weight: 700; border-radius: 4px; border: 1px solid #bbf7d0; font-size: 12.5px;">
                  ✓ PO Accepted by Vendor
                </span>
              }
            }
          </div>
        </div>
      </section>
    }

    <!-- ========================================================================= -->
    <!-- SCREEN 3: PURCHASE ORDERS REGISTER (Master Orders Register & Approvals)  -->
    <!-- ========================================================================= -->
    @if (activeTab === 'register') {
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
                <tr [class.highlight]="po.id === currentPoNumber">
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
                      <button class="btn-action btn-action-view" (click)="inspectPo(po.id)" title="View PO Details in Inspector">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        <span>View</span>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </article>
    }

    <!-- ========================================================================= -->
    <!-- MODAL: VENDOR LIST LOOKUP (Matching Legacy #purchaseorderlist in Create)   -->
    <!-- ========================================================================= -->
    @if (showVendorLookup) {
      <div class="po-modal-overlay" (click)="closeVendorLookup()">
        <div class="po-modal-dialog" (click)="$event.stopPropagation()">
          <div class="po-modal-header">
            <span>Vendor List</span>
            <button type="button" class="btn-close-modal" (click)="closeVendorLookup()">&times;</button>
          </div>
          <div class="po-modal-body">
            <input
              [(ngModel)]="vendorLookupQuery"
              placeholder="Search vendor by ID, Name or Quoted Category..."
              style="width: 100%; margin-bottom: 12px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 13px;"
            />
            <table class="legacy-datatable">
              <thead>
                <tr>
                  <th style="width: 140px;">Vendor ID</th>
                  <th>Vendor Name</th>
                  <th style="width: 140px;">Category</th>
                  <th style="width: 100px; text-align: center;">Action</th>
                </tr>
              </thead>
              <tbody>
                @for (vendor of filteredVendorCatalog(); track vendor.vendorId) {
                  <tr (click)="selectLookupVendor(vendor)" style="cursor: pointer;">
                    <td><strong style="color: var(--role-accent);">{{ vendor.vendorId }}</strong></td>
                    <td style="font-weight: 600;">{{ vendor.vendorName }}</td>
                    <td>{{ vendor.category }}</td>
                    <td style="text-align: center;">
                      <button type="button" class="btn small" (click)="selectLookupVendor(vendor); $event.stopPropagation()" style="background: #007bff; border-color: #007bff; padding: 3px 10px; font-size: 11.5px;">
                        Select
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="po-modal-footer">
            <button type="button" class="btn secondary small" (click)="closeVendorLookup()" style="background: #dc3545; color: #fff; border-color: #dc3545;">Close</button>
          </div>
        </div>
      </div>
    }

    <!-- ========================================================================= -->
    <!-- MODAL: PURCHASE ORDER LIST LOOKUP (Matching Legacy #purchaseorderlist)     -->
    <!-- ========================================================================= -->
    @if (showPoSearchModal) {
      <div class="po-modal-overlay" (click)="closePoSearchModal()">
        <div class="po-modal-dialog" (click)="$event.stopPropagation()">
          <div class="po-modal-header">
            <span>Purchase Order List</span>
            <button type="button" class="btn-close-modal" (click)="closePoSearchModal()">&times;</button>
          </div>
          <div class="po-modal-body">
            <input
              [(ngModel)]="poSearchQuery"
              placeholder="Search PO Number, Vendor ID or Description..."
              style="width: 100%; margin-bottom: 12px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 13px;"
            />
            <table class="legacy-datatable">
              <thead>
                <tr>
                  <th style="width: 150px;">PO Number</th>
                  <th style="width: 150px;">Vendor ID</th>
                  <th>Name / Description</th>
                  <th style="width: 100px; text-align: center;">Action</th>
                </tr>
              </thead>
              <tbody>
                @for (po of filteredDetailedPos(); track po.purchaseOrderNumber) {
                  <tr (click)="selectDetailedPo(po)" style="cursor: pointer;">
                    <td><strong style="color: var(--role-accent);">{{ po.purchaseOrderNumber }}</strong></td>
                    <td>{{ po.vendorId }}</td>
                    <td>{{ po.vendorName }} — {{ po.description }}</td>
                    <td style="text-align: center;">
                      <button type="button" class="btn small" (click)="selectDetailedPo(po); $event.stopPropagation()" style="background: #007bff; border-color: #007bff; padding: 3px 10px; font-size: 11.5px;">
                        Select
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="po-modal-footer">
            <button type="button" class="btn secondary small" (click)="closePoSearchModal()" style="background: #dc3545; color: #fff; border-color: #dc3545;">Close</button>
          </div>
        </div>
      </div>
    }
  `
})
export class OrdersPageComponent implements OnInit {
  readonly state = inject(PortalStateService);
  readonly vendorApi = inject(VendorApiService);
  readonly sageApi = inject(SageApiService);
  readonly role = computed(() => this.state.role());

  // Active Tab:
  // 'create'  -> Screen 1: Create PO (PO_vendor_Create.cshtml - Photo 2)
  // 'viewer'  -> Screen 2: Purchase Order Viewer & Lookup (Purchase_Order.cshtml - Photo 1)
  // 'register' -> Master Purchase Orders Register with approval workflows
  activeTab: 'create' | 'viewer' | 'register' = 'create';

  // Modal controls
  showVendorLookup = false;
  vendorLookupQuery = '';

  showPoSearchModal = false;
  poSearchQuery = '';

  // Search & Filters for Tab 3 (Register)
  searchQuery = '';
  approvalFilter = '';

  readonly approvalOptions = [
    { value: '', label: 'All Approvals' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Pending', label: 'Pending' }
  ];

  // ---------------------------------------------------------------------------
  // SCREEN 1 (Create PO) State
  // ---------------------------------------------------------------------------
  createVendorId = '';
  createVendorName = '';
  createPoDate = '';
  createPoCategory = '';

  createPoItems: CreatePoItem[] = [];

  vendorCatalog: VendorCatalogEntry[] = [];

  ngOnInit(): void {
    this.loadBackendData();
  }

  loadBackendData(): void {
    this.vendorApi.getVendorBasicInfo().subscribe(res => {
      const list = res?.vendorBI_List || res?.data || (Array.isArray(res) ? res : []);
      if (Array.isArray(list) && list.length > 0) {
        for (const v of list) {
          const vId = v.reQ_NO || v.vendorid || '';
          const vName = v.vendoR_NAME || 'Unknown Supplier';
          if (!vId) continue;
          if (!this.vendorCatalog.some(e => e.vendorId === vId)) {
            this.vendorCatalog.push({
              vendorId: vId,
              vendorName: vName,
              category: v.category || 'Procurement Partner',
              contactPerson: v.cT_PERSON || v.contact || 'Account Representative',
              items: [
                { itemNumber: 'GEN-001', description: `${vName} Contract Supply`, price: 1500, qty: 1 }
              ]
            });
          }
        }
      }
    });

    // Also populate live Sage 300 ERP vendors
    this.sageApi.getVendors().subscribe(sList => {
      if (Array.isArray(sList) && sList.length > 0) {
        for (const sv of sList) {
          if (!this.vendorCatalog.some(e => e.vendorId === sv.VendorNumber)) {
            this.vendorCatalog.push({
              vendorId: sv.VendorNumber,
              vendorName: sv.VendorName || sv.ShortName || sv.VendorNumber,
              category: sv.GroupCode || 'ERP Partner',
              contactPerson: sv.ShortName || 'Sales Representative',
              items: [
                { itemNumber: 'ERP-001', description: `${sv.VendorName} General Supply`, price: 2000, qty: 1 }
              ]
            });
          }
        }
      }
    });

    // Populate live Sage 300 Purchase Orders
    this.sageApi.getPurchaseOrders().subscribe(sagePos => {
      if (Array.isArray(sagePos) && sagePos.length > 0) {
        const detailed: DetailedPurchaseOrder[] = [];
        const master: PurchaseOrder[] = [];

        for (const sp of sagePos) {
          const poNum = sp.PurchaseOrderNumber.trim();
          const vName = sp.Name?.trim() || sp.Vendor?.trim() || 'Supplier';
          const poDate = sp.PurchaseOrderDate ? sp.PurchaseOrderDate.substring(0, 10) : (sp.OrderDate ? sp.OrderDate.substring(0, 10) : '2026-10-20');
          const arrDate = sp.ExpectedArrivalDate ? sp.ExpectedArrivalDate.substring(0, 10) : poDate;
          const totalVal = sp.Total || sp.ExtendedCost || 0;
          const statusApproval: 'Approved' | 'Pending' = sp.Completed ? 'Approved' : 'Pending';

          detailed.push({
            purchaseOrderNumber: poNum,
            vendorId: sp.Vendor?.trim() || '',
            vendorName: vName,
            purchaseOrderDate: poDate,
            arrivalDate: arrDate,
            paymentTerm: sp.TermsCode || 'Net 30 Days',
            description: sp.Description || `PO for ${vName}`,
            comments: sp.Comment || '',
            items: [
              {
                srNo: 1,
                itemNumber: poNum,
                description: sp.Description || `${vName} Contract Supply`,
                qty: sp.QuantityOrdered || 1,
                uom: 'PCS',
                cost: totalVal
              }
            ]
          });

          master.push({
            id: poNum,
            vendor: vName,
            category: sp.Description || 'Procurement',
            amount: totalVal,
            requiredDate: arrDate,
            arrivalDate: poDate,
            approval: statusApproval,
            grn: sp.Completed ? 'Passed' : 'Pending',
            qc: sp.Completed ? 'Passed' : 'Pending'
          });
        }

        this.detailedPos = detailed;
        this.poList = master;
        this.state.purchaseOrders.set(master);

        // Pre-select first PO in viewer if none selected yet
        if (!this.currentPoNumber && detailed.length > 0) {
          this.selectDetailedPo(detailed[0]);
        }
      }
    });
  }

  // ---------------------------------------------------------------------------
  // SCREEN 2 (Purchase Order Inspector) State
  // ---------------------------------------------------------------------------
  currentPoNumber = '';
  currentPoVendorId = '';
  currentPoDate = '';
  currentPoArrivalDate = '';
  currentPoPaymentTerm = '';
  currentPoDescription = '';
  currentPoComments = '';

  currentPoItems: DetailedPoItem[] = [];

  detailedPos: DetailedPurchaseOrder[] = [];

  // ---------------------------------------------------------------------------
  // SCREEN 3 (Master PO Register) State
  // ---------------------------------------------------------------------------
  poList: PurchaseOrder[] = [];

  constructor() {
    if (this.role() === 'vendor') {
      this.activeTab = 'viewer';
    }
  }

  switchTab(tab: 'create' | 'viewer' | 'register'): void {
    if (this.role() === 'vendor' && tab === 'create') return;
    this.activeTab = tab;
  }

  // ---------------------------------------------------------------------------
  // ACTIONS FOR SCREEN 1 (Create PO)
  // ---------------------------------------------------------------------------
  openVendorLookup(): void {
    this.vendorLookupQuery = '';
    this.showVendorLookup = true;
  }

  closeVendorLookup(): void {
    this.showVendorLookup = false;
  }

  filteredVendorCatalog(): VendorCatalogEntry[] {
    const q = this.vendorLookupQuery.trim().toLowerCase();
    if (!q) return this.vendorCatalog;
    return this.vendorCatalog.filter(v =>
      v.vendorId.toLowerCase().includes(q) ||
      v.vendorName.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q)
    );
  }

  selectLookupVendor(vendor: VendorCatalogEntry): void {
    this.createVendorId = vendor.vendorId;
    this.createVendorName = vendor.vendorName;
    this.createPoCategory = vendor.category;
    this.createPoItems = vendor.items.map((it, idx) => ({
      srNo: idx + 1,
      itemNumber: it.itemNumber,
      description: it.description,
      price: it.price,
      qty: it.qty
    }));
    this.closeVendorLookup();
    this.state.notify(`Vendor ${vendor.vendorName} and items loaded.`);
  }

  refreshPoCreate(): void {
    this.createVendorId = '';
    this.createVendorName = '';
    this.createPoDate = new Date().toISOString().substring(0, 10);
    this.createPoCategory = '';
    this.createPoItems = [];
    this.state.notify('Create PO form refreshed.');
  }

  clearPoCreateForm(): void {
    this.createVendorId = '';
    this.createVendorName = '';
    this.createPoItems = [];
    this.state.notify('Create PO form cleared.');
  }

  addPoItemRow(): void {
    const nextSr = this.createPoItems.length + 1;
    this.createPoItems = [
      ...this.createPoItems,
      { srNo: nextSr, itemNumber: `ITM-00${nextSr}`, description: 'Material Line Item', price: 100, qty: 1 }
    ];
  }

  removePoItemRow(index: number): void {
    this.createPoItems = this.createPoItems
      .filter((_, idx) => idx !== index)
      .map((item, idx) => ({ ...item, srNo: idx + 1 }));
  }

  createPoTotal(): number {
    return this.createPoItems.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.qty) || 0)), 0);
  }

  submitCreatePo(): void {
    if (!this.createVendorId.trim() || !this.createVendorName.trim()) {
      this.state.notify('Vendor ID and Vendor Name are required.');
      return;
    }

    if (this.createPoItems.length === 0) {
      this.state.notify('Please add line items to the PO Vendor List.');
      return;
    }

    const nextPoNum = `PO-00${Math.floor(2350 + Math.random() * 50)}`;
    const totalAmount = this.createPoTotal();

    const createdPo: PurchaseOrder = {
      id: nextPoNum,
      vendor: this.createVendorName,
      category: this.createPoCategory || 'Electrical',
      amount: totalAmount,
      requiredDate: '2026-10-25',
      arrivalDate: '2026-10-22',
      approval: 'Pending',
      grn: 'Pending',
      qc: 'Pending'
    };

    const newDetailedPo: DetailedPurchaseOrder = {
      purchaseOrderNumber: nextPoNum,
      vendorId: this.createVendorId,
      vendorName: this.createVendorName,
      purchaseOrderDate: this.createPoDate,
      arrivalDate: '2026-10-22',
      paymentTerm: 'Net 30 Days',
      description: `${this.createPoCategory} — ${this.createPoItems[0]?.itemNumber || 'Procurement Batch'}`,
      comments: 'Generated from Vendor Sourcing. Released for manager approval.',
      items: this.createPoItems.map((item, idx) => ({
        srNo: idx + 1,
        itemNumber: item.itemNumber,
        description: item.description || item.itemNumber,
        qty: item.qty,
        uom: 'PCS',
        cost: item.price
      }))
    };

    // Prepend to lists
    this.poList = [createdPo, ...this.poList];
    this.detailedPos = [newDetailedPo, ...this.detailedPos];
    this.state.purchaseOrders.update(list => [createdPo, ...list]);

    // Switch to Viewer tab to inspect newly created PO
    this.selectDetailedPo(newDetailedPo);
    this.activeTab = 'viewer';
    this.state.notify(`Purchase Order ${nextPoNum} generated successfully!`);
  }

  // ---------------------------------------------------------------------------
  // ACTIONS FOR SCREEN 2 (Purchase Order Viewer)
  // ---------------------------------------------------------------------------
  openPoSearchModal(): void {
    this.poSearchQuery = '';
    this.showPoSearchModal = true;
  }

  closePoSearchModal(): void {
    this.showPoSearchModal = false;
  }

  filteredDetailedPos(): DetailedPurchaseOrder[] {
    const q = this.poSearchQuery.trim().toLowerCase();
    if (!q) return this.detailedPos;
    return this.detailedPos.filter(po =>
      po.purchaseOrderNumber.toLowerCase().includes(q) ||
      po.vendorId.toLowerCase().includes(q) ||
      po.vendorName.toLowerCase().includes(q) ||
      po.description.toLowerCase().includes(q)
    );
  }

  selectDetailedPo(po: DetailedPurchaseOrder): void {
    this.currentPoNumber = po.purchaseOrderNumber;
    this.currentPoVendorId = po.vendorId;
    this.currentPoDate = po.purchaseOrderDate;
    this.currentPoArrivalDate = po.arrivalDate;
    this.currentPoPaymentTerm = po.paymentTerm;
    this.currentPoDescription = po.description;
    this.currentPoComments = po.comments;
    this.currentPoItems = po.items.map(it => ({ ...it }));
    this.closePoSearchModal();
    this.state.notify(`Purchase Order ${po.purchaseOrderNumber} loaded.`);
  }

  inspectPo(poNumber: string): void {
    const match = this.detailedPos.find(p => p.purchaseOrderNumber === poNumber);
    if (match) {
      this.selectDetailedPo(match);
      this.activeTab = 'viewer';
    } else {
      this.state.notify(`Details for ${poNumber} loaded.`);
    }
  }

  currentPoGrandTotal(): number {
    return this.currentPoItems.reduce((sum, item) => sum + (item.cost * item.qty), 0);
  }

  currentPoStatus(): string {
    const match = this.poList.find(p => p.id === this.currentPoNumber);
    return match ? match.approval : 'Pending';
  }

  isVendorAcknowledged(): boolean {
    const match = this.poList.find(p => p.id === this.currentPoNumber);
    return match ? match.approval === 'Approved' : false;
  }

  acknowledgeCurrentPo(): void {
    const po = this.poList.find(p => p.id === this.currentPoNumber);
    if (po) {
      po.approval = 'Approved';
    }
    this.state.acknowledgePurchaseOrder(this.currentPoNumber);
    this.state.notify(`Purchase Order ${this.currentPoNumber} accepted and acknowledged by Vendor.`);
  }

  // ---------------------------------------------------------------------------
  // ACTIONS FOR SCREEN 3 (PO Register)
  // ---------------------------------------------------------------------------
  filteredPos(): PurchaseOrder[] {
    let list = this.poList;
    if (this.role() === 'vendor') {
      const vName = this.state.currentVendorName() || this.state.currentUser()?.name;
      if (vName) {
        list = list.filter(po => (po.vendor || '').toLowerCase().includes(vName.toLowerCase()));
      }
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

  totalValue(): number {
    return this.poList.reduce((acc, po) => acc + (po.amount || 0), 0);
  }

  pendingApprovalCount(): number {
    return this.poList.filter(po => po.approval === 'Pending').length;
  }
}
