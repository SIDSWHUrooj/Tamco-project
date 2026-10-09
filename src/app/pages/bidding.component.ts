import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent } from '../shared/ui.component';
import { IconComponent } from '../shared/icon.component';

export interface BiddingLineItem {
  sr: number;
  price: number | null;
  cost?: number;
  itemNo: string;
  dateRequired: string;
  itemDesc: string;
  uom: string;
  qty: number;
  loc: string;
  project: string;
  incoterm: string;
  shipvia: string;
  comments: string;
}

export interface BiddingRequestHeader {
  reqNo: string;
  reqFor: string;
  enteredBy: string;
  date: string;
  dateRequired: string;
  shipVia: string;
  location: string;
  description: string;
  comments: string;
  items: BiddingLineItem[];
}

@Component({
  selector: 'app-bidding',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeadingComponent, IconComponent],
  template: `
    <app-page-heading
      eyebrow="Commercial Sourcing"
      title="Vendor Bidding"
      subtitle="Submit formal quotation unit prices for active TAMCO RFQs and Procurement requisitions.">
    </app-page-heading>

    <div class="bidding-container">
      <!-- TOP CARD: REQUISITION HEADER DETAILS (Matches Bidding/BiddinView.cshtml) -->
      <div class="card-body-box">
        <div class="row-header">
          <h5 class="main-heading">Vendor Bidding</h5>
        </div>

        <div class="form-row form-row-4">
          <!-- Document Number with Search and Refresh buttons -->
          <div class="form-group">
            <label class="form-label">Document Number <span class="req-star">*</span></label>
            <div class="input-group-custom">
              <input
                type="text"
                [(ngModel)]="header.reqNo"
                placeholder="Enter Requisition Number"
                class="form-control-legacy"
                readonly
              />
              <button
                type="button"
                class="btn-search-blue"
                (click)="openReqModal()"
                title="Select Bidding Request Lookup">
                <app-icon name="search" [size]="14" />
              </button>
              <button
                type="button"
                class="btn-refresh-sky"
                (click)="refreshCurrentReq()"
                title="Reload / Reset Form">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Required For -->
          <div class="form-group">
            <label class="form-label">Required For <span class="req-star">*</span></label>
            <input
              type="text"
              [(ngModel)]="header.reqFor"
              placeholder="Required For"
              class="form-control-legacy"
              readonly
            />
          </div>

          <!-- Entered By -->
          <div class="form-group">
            <label class="form-label">Entered By</label>
            <input
              type="text"
              [(ngModel)]="header.enteredBy"
              placeholder="Entered By"
              class="form-control-legacy"
              readonly
            />
          </div>

          <!-- Date -->
          <div class="form-group">
            <label class="form-label">Date</label>
            <input
              type="text"
              [(ngModel)]="header.date"
              placeholder="Requisition Date"
              class="form-control-legacy"
              readonly
            />
          </div>
        </div>

        <div class="form-row form-row-3">
          <!-- Date Required -->
          <div class="form-group">
            <label class="form-label">Date Required</label>
            <input
              type="text"
              [(ngModel)]="header.dateRequired"
              placeholder="Enter Date Required"
              class="form-control-legacy"
              readonly
            />
          </div>

          <!-- Ship VIA -->
          <div class="form-group">
            <label class="form-label">Ship VIA</label>
            <input
              type="text"
              [(ngModel)]="header.shipVia"
              placeholder="Ship VIA"
              class="form-control-legacy"
              readonly
            />
          </div>

          <!-- Location -->
          <div class="form-group">
            <label class="form-label">Location</label>
            <input
              type="text"
              [(ngModel)]="header.location"
              placeholder="Location"
              class="form-control-legacy"
              readonly
            />
          </div>
        </div>

        <div class="form-row form-row-2">
          <!-- Request Description -->
          <div class="form-group">
            <label class="form-label">Request Description <span class="req-star">*</span></label>
            <textarea
              rows="2"
              [(ngModel)]="header.description"
              placeholder="Enter Request Description"
              class="form-control-legacy textarea-fixed"
              readonly></textarea>
          </div>

          <!-- Comments -->
          <div class="form-group">
            <label class="form-label">Comments</label>
            <textarea
              rows="2"
              [(ngModel)]="header.comments"
              placeholder="Enter your comments"
              class="form-control-legacy textarea-fixed"
              readonly></textarea>
          </div>
        </div>
      </div>

      <!-- BOTTOM CARD: VENDOR BIDDING LIST TABLE (Matches Bidding/BiddinView.cshtml) -->
      <div class="card-body-box mt-3">
        <div class="row-header">
          <h5 class="main-heading">Vendor Bidding List</h5>
        </div>

        <div class="table-responsive-wrap">
          <table class="legacy-datatable">
            <thead>
              <tr>
                <th style="width: 50px;">Sr</th>
                <th style="width: 140px; background: #e0e7ff; color: #1e1b4b;">Price (Quote) <span class="req-star">*</span></th>
                <th style="width: 120px;">Item No</th>
                <th style="width: 120px;">Date Required</th>
                <th style="min-width: 160px;">Item Desc</th>
                <th style="width: 80px;">UOM</th>
                <th style="width: 90px; text-align: center;">Quantity</th>
                <th style="width: 110px;">Location</th>
                <th style="width: 110px;">Project</th>
                <th style="width: 100px;">Inco Term</th>
                <th style="width: 110px;">Ship Via</th>
                <th style="min-width: 140px;">Comments</th>
              </tr>
            </thead>
            <tbody>
              @if (items.length === 0) {
                <tr>
                  <td colspan="12" style="text-align: center; color: #94a3b8; padding: 28px;">
                    No line items available. Click the search button 🔍 above to pick an open RFQ / Bidding Request.
                  </td>
                </tr>
              }
              @for (item of items; track item.sr; let idx = $index) {
                <tr>
                  <td style="text-align: center; font-weight: 700; color: #64748b;">{{ item.sr }}</td>
                  <!-- Price editable input matching .NET: <input id="price" type="number" name="price" /> -->
                  <td>
                    <div class="price-input-wrapper">
                      <span class="currency-tag">AED</span>
                      <input
                        type="number"
                        [(ngModel)]="item.price"
                        name="price-{{ idx }}"
                        placeholder="0.00"
                        class="price-input-control"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </td>
                  <td><strong style="color: #4338ca;">{{ item.itemNo }}</strong></td>
                  <td>{{ item.dateRequired }}</td>
                  <td>{{ item.itemDesc }}</td>
                  <td style="text-align: center;"><span class="uom-pill">{{ item.uom }}</span></td>
                  <td style="text-align: center; font-weight: 700;">{{ item.qty }}</td>
                  <td>{{ item.loc }}</td>
                  <td>{{ item.project }}</td>
                  <td>{{ item.incoterm }}</td>
                  <td>{{ item.shipvia }}</td>
                  <td>{{ item.comments }}</td>
                </tr>
              }
            </tbody>
            @if (items.length > 0) {
              <tfoot>
                <tr>
                  <td colspan="1" style="text-align: center; font-weight: 700;">Total</td>
                  <td style="font-weight: 800; color: #16a34a; font-size: 13.5px;">
                    {{ totalQuotationValue().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} AED
                  </td>
                  <td colspan="10" style="color: #64748b; font-size: 12px;">
                    * All unit prices are binding and inclusive of specified delivery terms.
                  </td>
                </tr>
              </tfoot>
            }
          </table>
        </div>

        <!-- Action Buttons matching .NET: Submit (#007bff) and Delete (#dc3545) -->
        <div class="action-footer">
          <button
            type="button"
            class="btn-submit-dotnet"
            (click)="submitBidding()"
            title="Submit Quotation to Procurement">
            Submit
          </button>
          <button
            type="button"
            class="btn-delete-dotnet"
            (click)="clearQuotes()"
            title="Clear Quoted Prices">
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL: SELECT BIDDING REQUEST (Matches #searchReqheader in Bidding/BiddinView.cshtml) -->
    @if (showReqModal) {
      <div class="req-modal-overlay" (click)="closeReqModal()">
        <div class="req-modal-content" (click)="$event.stopPropagation()">
          <div class="req-modal-header">
            <h5 class="req-modal-title">Select Bidding Request</h5>
            <button type="button" class="btn-close-modal" (click)="closeReqModal()">&times;</button>
          </div>

          <div class="req-modal-body">
            <table class="modal-table">
              <thead>
                <tr>
                  <th>Request No</th>
                  <th>Req For</th>
                  <th>Date Required</th>
                  <th>Ship VIA</th>
                  <th>Loc</th>
                  <th style="text-align: center; width: 90px;">Action</th>
                </tr>
              </thead>
              <tbody>
                @for (req of availableRequests; track req.reqNo) {
                  <tr (click)="selectRequest(req)" style="cursor: pointer;">
                    <td><strong style="color: #1e40af;">{{ req.reqNo }}</strong></td>
                    <td>{{ req.reqFor }}</td>
                    <td>{{ req.dateRequired }}</td>
                    <td>{{ req.shipVia }}</td>
                    <td>{{ req.location }}</td>
                    <td style="text-align: center;">
                      <button
                        type="button"
                        class="btn-select-pill"
                        (click)="selectRequest(req); $event.stopPropagation()">
                        Select
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="req-modal-footer">
            <button type="button" class="btn-modal-close" (click)="closeReqModal()">Close</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .bidding-container {
      max-width: 100%;
      margin-bottom: 40px;
    }

    .card-body-box {
      background-color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
    }

    .mt-3 {
      margin-top: 18px;
    }

    /* .NET Main Heading: #887bb5 */
    .row-header {
      margin-bottom: 16px;
    }

    .main-heading {
      background-color: #887bb5;
      color: #ffffff;
      padding: 8px 16px;
      border-radius: 5px;
      text-align: center;
      width: 100%;
      margin: 0;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: -0.01em;
      box-shadow: 0 2px 6px rgba(136, 123, 181, 0.25);
    }

    /* Form Layouts */
    .form-row {
      display: grid;
      gap: 16px;
      margin-bottom: 14px;
    }

    .form-row-4 {
      grid-template-columns: 1.4fr 1.6fr 1.2fr 1fr;
    }

    .form-row-3 {
      grid-template-columns: 1fr 1.5fr 1.5fr;
    }

    .form-row-2 {
      grid-template-columns: 1fr 1fr;
    }

    @media (max-width: 992px) {
      .form-row-4 { grid-template-columns: 1fr 1fr; }
      .form-row-3 { grid-template-columns: 1fr; }
      .form-row-2 { grid-template-columns: 1fr; }
    }

    @media (max-width: 640px) {
      .form-row-4 { grid-template-columns: 1fr; }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .form-label {
      font-size: 13px;
      font-weight: 600;
      color: #000000;
      display: flex;
      align-items: center;
      gap: 3px;
    }

    .req-star {
      color: #dc3545;
      font-weight: 700;
    }

    .form-control-legacy {
      width: 100%;
      height: 38px;
      padding: 6px 12px;
      font-size: 13px;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      background-color: #f8fafc;
      color: #1e293b;
      box-sizing: border-box;

      &:focus {
        border-color: #887bb5;
        outline: none;
      }
    }

    .textarea-fixed {
      height: 48px;
      resize: none;
    }

    .input-group-custom {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* .NET Search button: #00008B */
    .btn-search-blue {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      flex-shrink: 0;
      border: 0;
      border-radius: 3px;
      background-color: #00008B;
      color: #ffffff;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #000066;
      }
    }

    /* .NET Refresh button: deepskyblue */
    .btn-refresh-sky {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      flex-shrink: 0;
      border: 0;
      border-radius: 3px;
      background-color: deepskyblue;
      color: #ffffff;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #0099cc;
      }
    }

    /* Data Table */
    .table-responsive-wrap {
      max-height: 440px;
      overflow-y: auto;
      overflow-x: auto;
      border: 1px solid #dee2e6;
      border-radius: 4px;
    }

    .legacy-datatable {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
      white-space: nowrap;
    }

    .legacy-datatable thead th {
      background-color: #f8fafc;
      color: #0f172a;
      font-weight: 700;
      padding: 9px 12px;
      border: 1px solid #dee2e6;
      text-align: left;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .legacy-datatable tbody td {
      padding: 7px 12px;
      border: 1px solid #dee2e6;
      vertical-align: middle;
      color: #1e293b;
    }

    .legacy-datatable tbody tr:hover {
      background-color: #f1f5f9;
    }

    .legacy-datatable tfoot td {
      background-color: #f8fafc;
      border: 1px solid #dee2e6;
      padding: 9px 12px;
    }

    .price-input-wrapper {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .currency-tag {
      font-size: 11px;
      font-weight: 700;
      color: #475569;
    }

    .price-input-control {
      width: 90px;
      height: 30px;
      padding: 2px 8px;
      border: 1.5px solid #6366f1;
      border-radius: 4px;
      font-size: 12.5px;
      font-weight: 700;
      color: #1e1b4b;
      background: #ffffff;
      box-sizing: border-box;

      &:focus {
        border-color: #4338ca;
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        outline: none;
      }
    }

    .uom-pill {
      display: inline-block;
      padding: 1px 6px;
      font-size: 11px;
      font-weight: 700;
      border-radius: 4px;
      background: #f1f5f9;
      color: #475569;
    }

    /* Action Footer Buttons */
    .action-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 16px;
      padding-top: 12px;
    }

    .btn-submit-dotnet {
      background-color: #007bff;
      border: 1px solid #007bff;
      color: #ffffff;
      border-radius: 5px;
      padding: 9px 24px;
      font-weight: 700;
      font-size: 13.5px;
      cursor: pointer;
      transition: background-color 0.2s, box-shadow 0.2s;

      &:hover {
        background-color: #0069d9;
        box-shadow: 0 2px 8px rgba(0, 123, 255, 0.35);
      }
    }

    .btn-delete-dotnet {
      background-color: #dc3545;
      border: 1px solid #dc3545;
      color: #ffffff;
      border-radius: 5px;
      padding: 9px 24px;
      font-weight: 700;
      font-size: 13.5px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #c82333;
      }
    }

    /* Modal Structure */
    .req-modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 100;
      background: rgba(15, 23, 42, 0.55);
      display: grid;
      place-items: center;
      padding: 20px;
      backdrop-filter: blur(2px);
    }

    .req-modal-content {
      width: min(840px, 100%);
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.25);
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      border: 1px solid #cbd5e1;
    }

    .req-modal-header {
      background-color: #00008B;
      color: #ffffff;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 18px;
    }

    .req-modal-title {
      font-size: 15px;
      font-weight: 700;
      margin: 0;
      color: #ffffff;
      text-align: center;
      width: 100%;
    }

    .btn-close-modal {
      background: none;
      border: 0;
      color: #ffffff;
      font-size: 26px;
      cursor: pointer;
      line-height: 1;
      opacity: 0.85;
      &:hover { opacity: 1; }
    }

    .req-modal-body {
      padding: 16px;
      overflow-y: auto;
    }

    .modal-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .modal-table thead th {
      padding: 8px 10px;
      background: #f8fafc;
      border: 1px solid #dee2e6;
      text-align: left;
      font-weight: 700;
    }

    .modal-table tbody td {
      padding: 8px 10px;
      border: 1px solid #dee2e6;
      vertical-align: middle;
    }

    .modal-table tbody tr:hover {
      background: #eff6ff;
    }

    .btn-select-pill {
      background-color: #007bff;
      color: #ffffff;
      border: none;
      padding: 3px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;

      &:hover {
        background-color: #0056b3;
      }
    }

    .req-modal-footer {
      display: flex;
      justify-content: flex-end;
      padding: 10px 18px;
      background: #f8fafc;
      border-top: 1px solid #dee2e6;
    }

    .btn-modal-close {
      background-color: #dc3545;
      border: 1px solid #dc3545;
      color: #ffffff;
      padding: 6px 18px;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;

      &:hover {
        background-color: #c82333;
      }
    }
  `]
})
export class BiddingComponent implements OnInit {
  private readonly state = inject(PortalStateService);
  private readonly route = inject(ActivatedRoute);

  showReqModal = false;

  header: BiddingRequestHeader = {
    reqNo: 'RFQ-0061',
    reqFor: 'Main Substation 11kV Switchgear Project',
    enteredBy: 'Tariq Mehmood (Procurement)',
    date: '2026-08-10',
    dateRequired: '2026-08-26',
    shipVia: 'Road Logistics (Korangi Warehouse)',
    location: 'Dubai Warehouse 2',
    description: 'Supply and installation of 11kV gas-insulated vacuum circuit breakers with auxiliary protection relays.',
    comments: 'Strict adherence to IEEE and IEC-62271 standards is mandatory. Origin inspection required.',
    items: []
  };

  items: BiddingLineItem[] = [
    {
      sr: 1,
      price: 18500,
      itemNo: 'SWG-GIS-11KV',
      dateRequired: '2026-08-26',
      itemDesc: '11kV GIS Incoming Panel',
      uom: 'SET',
      qty: 2,
      loc: 'WH-02',
      project: 'Substation Ph2',
      incoterm: 'DDP',
      shipvia: 'Road Freight',
      comments: 'Factory Acceptance Test (FAT) witness required'
    },
    {
      sr: 2,
      price: 12,
      itemNo: 'CBL-CTL-4C',
      dateRequired: '2026-08-26',
      itemDesc: 'Control Cable 4C 2.5mm',
      uom: 'MTR',
      qty: 500,
      loc: 'WH-02',
      project: 'Substation Ph2',
      incoterm: 'DDP',
      shipvia: 'Road Freight',
      comments: 'Drums of 250m each'
    },
    {
      sr: 3,
      price: 420,
      itemNo: 'MCCB-250A-4P',
      dateRequired: '2026-08-26',
      itemDesc: 'Spare MCCB 250A 4-Pole',
      uom: 'PCS',
      qty: 8,
      loc: 'WH-02',
      project: 'Substation Ph2',
      incoterm: 'DDP',
      shipvia: 'Road Freight',
      comments: 'Including auxiliary contacts'
    }
  ];

  readonly availableRequests: BiddingRequestHeader[] = [
    {
      reqNo: 'RFQ-0061',
      reqFor: 'Main Substation 11kV Switchgear Project',
      enteredBy: 'Tariq Mehmood (Procurement)',
      date: '2026-08-10',
      dateRequired: '2026-08-26',
      shipVia: 'Road Logistics',
      location: 'Dubai Warehouse 2',
      description: 'Supply and installation of 11kV gas-insulated vacuum circuit breakers with auxiliary relays.',
      comments: 'Strict adherence to IEEE and IEC-62271 standards is mandatory. Origin inspection required.',
      items: [
        { sr: 1, price: 18500, itemNo: 'SWG-GIS-11KV', dateRequired: '2026-08-26', itemDesc: '11kV GIS Incoming Panel', uom: 'SET', qty: 2, loc: 'WH-02', project: 'Substation Ph2', incoterm: 'DDP', shipvia: 'Road Freight', comments: 'FAT witness required' },
        { sr: 2, price: 12, itemNo: 'CBL-CTL-4C', dateRequired: '2026-08-26', itemDesc: 'Control Cable 4C 2.5mm', uom: 'MTR', qty: 500, loc: 'WH-02', project: 'Substation Ph2', incoterm: 'DDP', shipvia: 'Road Freight', comments: 'Drums of 250m each' },
        { sr: 3, price: 420, itemNo: 'MCCB-250A-4P', dateRequired: '2026-08-26', itemDesc: 'Spare MCCB 250A 4-Pole', uom: 'PCS', qty: 8, loc: 'WH-02', project: 'Substation Ph2', incoterm: 'DDP', shipvia: 'Road Freight', comments: 'Including aux contacts' }
      ]
    },
    {
      reqNo: 'RFQ-0060',
      reqFor: 'Safety Equipment — Substation PPE Lot',
      enteredBy: 'Procurement Safety Div',
      date: '2026-08-05',
      dateRequired: '2026-08-23',
      shipVia: 'Air Express',
      location: 'Abu Dhabi Central',
      description: 'High voltage flash PPE, arc-rated suits, insulated safety boots and helmets.',
      comments: 'Arc-rated EN standards compliance certificate attached.',
      items: [
        { sr: 1, price: 850, itemNo: 'PPE-ARC-40CAL', dateRequired: '2026-08-23', itemDesc: 'Arc Flash Suit 40 Cal/cm²', uom: 'SET', qty: 15, loc: 'AD-01', project: 'Safety Upgrade', incoterm: 'CIP', shipvia: 'Air Express', comments: 'Sizes: L & XL' },
        { sr: 2, price: 180, itemNo: 'BOOTS-HV-1000V', dateRequired: '2026-08-23', itemDesc: 'Dielectric HV Safety Boots 1kV', uom: 'PRS', qty: 30, loc: 'AD-01', project: 'Safety Upgrade', incoterm: 'CIP', shipvia: 'Air Express', comments: 'EN ISO 20345' }
      ]
    },
    {
      reqNo: 'RFQ-0059',
      reqFor: 'Mechanical Heavy Pump Seals & Impellers',
      enteredBy: 'Farhan Zaidi',
      date: '2026-07-28',
      dateRequired: '2026-08-15',
      shipVia: 'Sea Freight Logistics',
      location: 'Jebel Ali Facility',
      description: 'Replacement impellers and cartridge mechanical seals for primary cooling pumps.',
      comments: 'Hydrostatic pressure test report and material cert 3.1 mandatory.',
      items: [
        { sr: 1, price: 1450, itemNo: 'PUMP-SEAL-150', dateRequired: '2026-08-15', itemDesc: 'Pump Mechanical Seal Kit 150mm', uom: 'SET', qty: 6, loc: 'JA-03', project: 'Cooling Plant', incoterm: 'FOB', shipvia: 'Sea Freight', comments: 'Silicon carbide faces' },
        { sr: 2, price: 12800, itemNo: 'IMP-ASSY-150', dateRequired: '2026-08-15', itemDesc: 'Bronze Impeller Assembly 150mm', uom: 'SET', qty: 2, loc: 'JA-03', project: 'Cooling Plant', incoterm: 'FOB', shipvia: 'Sea Freight', comments: 'Dynamically balanced ISO G2.5' }
      ]
    }
  ];

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const rfqId = params['rfq'] || params['reqNo'];
      if (rfqId) {
        const found = this.availableRequests.find(r => r.reqNo.toLowerCase() === rfqId.toLowerCase());
        if (found) {
          this.selectRequest(found);
        }
      }
    });
  }

  openReqModal(): void {
    this.showReqModal = true;
  }

  closeReqModal(): void {
    this.showReqModal = false;
  }

  selectRequest(req: BiddingRequestHeader): void {
    this.header = { ...req };
    this.items = req.items.map(it => ({ ...it }));
    this.closeReqModal();
    this.state.notify(`Bidding request ${req.reqNo} loaded successfully.`);
  }

  refreshCurrentReq(): void {
    const defaultReq = this.availableRequests[0];
    this.selectRequest(defaultReq);
  }

  totalQuotationValue(): number {
    return this.items.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.qty) || 0)), 0);
  }

  clearQuotes(): void {
    this.items.forEach(it => it.price = null);
    this.state.notify('Quoted prices cleared.');
  }

  submitBidding(): void {
    const unquoted = this.items.filter(it => it.price === null || it.price === undefined || it.price <= 0);
    if (unquoted.length > 0) {
      this.state.notify(`Please enter unit price for line item #${unquoted[0].sr} before submitting.`);
      return;
    }

    const total = this.totalQuotationValue();
    this.state.submitVendorBid(this.header.reqNo, total, 7);
    this.state.notify(`Quotation for ${this.header.reqNo} (${total.toLocaleString()} AED) submitted successfully to TAMCO Procurement!`);
  }
}
