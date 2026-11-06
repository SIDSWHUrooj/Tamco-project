import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PortalStateService } from '../core/portal-state.service';
import { VendorApiService } from '../core/vendor-api.service';
import { SageApiService } from '../core/sage-api.service';
import { IconComponent } from '../shared/icon.component';
import { LogisticCost, Requisition } from '../core/models';

@Component({
  selector: 'app-logistic-cost',
  standalone: true,
  imports: [FormsModule, DecimalPipe, IconComponent],
  template: `
    <div style="display: flex; justify-content: flex-end; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
      <button
        type="button"
        class="btn"
        style="background-color: var(--role-accent, #2563eb); border-color: var(--role-accent, #2563eb); display: inline-flex; align-items: center; gap: 6px;"
        (click)="openAssignModal(null)"
      >
        + Assign Logistic Cost
      </button>
      <button
        type="button"
        class="btn secondary"
        (click)="navigateToComparison()"
        style="display: inline-flex; align-items: center; gap: 6px;"
      >
        <span>Go to Bid Comparison</span>
        <span>➔</span>
      </button>
    </div>

    <!-- REQUISITION DETAILS HEADER CARD (Matching Screenshot 18 & Logistic_Cost.cshtml) -->
    <article class="panel req-header-panel" style="margin-bottom: 22px;">
      <div class="main-heading-banner">
        <h5>Requisition Details (Logistic Costs)</h5>
      </div>

      <div class="form-body" style="padding: 18px 20px;">
        <!-- Row 1: Document Number, Required For, Entered By, Date -->
        <div class="form-row four-col">
          <div class="col">
            <label for="docNumber">Document Number <span class="required">*</span></label>
            <div class="input-with-actions">
              <input
                id="docNumber"
                type="text"
                [value]="selectedReqNo"
                placeholder="Enter Requisition Number"
                readonly
                class="form-control readonly-field"
              />
              <button
                type="button"
                class="btn-attached search-btn"
                style="background-color: var(--role-accent, #2563eb);"
                (click)="openReqSearchModal()"
                title="Search Requisition (Lookup Modal)"
              >
                <app-icon name="search" [size]="15" />
              </button>
              <button
                type="button"
                class="btn-attached refresh-btn"
                style="background-color: deepskyblue !important; border-color: deepskyblue !important;"
                (click)="refreshRequisition()"
                title="Reload Requisition Data"
              >
                <app-icon name="refresh" [size]="15" />
              </button>
            </div>
          </div>

          <div class="col">
            <label for="reqFor">Required For <span class="required">*</span></label>
            <input
              id="reqFor"
              type="text"
              [value]="currentReq()?.header?.requiredFor || 'Job In Hand'"
              placeholder="Required For"
              readonly
              class="form-control readonly-field"
            />
          </div>

          <div class="col">
            <label for="enteredBy">Entered By</label>
            <input
              id="enteredBy"
              type="text"
              [value]="currentReq()?.header?.enteredBy || 'Procurement Officer'"
              placeholder="Entered By"
              readonly
              class="form-control readonly-field"
            />
          </div>

          <div class="col">
            <label for="reqDate">Date</label>
            <input
              id="reqDate"
              type="text"
              [value]="currentReq()?.header?.date || '2026-09-18'"
              placeholder="Requisition Date"
              readonly
              class="form-control readonly-field"
            />
          </div>
        </div>

        <!-- Row 2: Date Required, Ship VIA, Location -->
        <div class="form-row three-col">
          <div class="col" style="flex: 1;">
            <label for="dateRequired">Date Required</label>
            <input
              id="dateRequired"
              type="text"
              [value]="currentReq()?.header?.dateRequired || '2026-10-15'"
              placeholder="Enter Date Required"
              readonly
              class="form-control readonly-field"
            />
          </div>

          <div class="col" style="flex: 1.5;">
            <label for="shipVia">Ship VIA</label>
            <input
              id="shipVia"
              type="text"
              [value]="currentReq()?.header?.shipVia || 'By Air'"
              placeholder="Ship VIA"
              readonly
              class="form-control readonly-field"
            />
          </div>

          <div class="col" style="flex: 2;">
            <label for="loc">Location</label>
            <input
              id="loc"
              type="text"
              [value]="currentReq()?.header?.location || 'Dubai HQ - Main Warehouse'"
              placeholder="Location"
              readonly
              class="form-control readonly-field"
            />
          </div>
        </div>

        <!-- Row 3: Request Description, Comments -->
        <div class="form-row two-col">
          <div class="col">
            <label for="reqDesc">Request Description <span class="required">*</span></label>
            <textarea
              id="reqDesc"
              rows="2"
              readonly
              class="form-control readonly-field"
              style="height: 44px; resize: none;"
            >{{ currentReq()?.header?.requestDescription || 'Urgent electrical switchgear and panel accessories for Terminal Expansion.' }}</textarea>
          </div>

          <div class="col">
            <label for="comments">Comments</label>
            <textarea
              id="comments"
              rows="2"
              readonly
              class="form-control readonly-field"
              style="height: 44px; resize: none;"
            >{{ currentReq()?.header?.comments || 'Deliver directly to Bay 4 with QC certificates.' }}</textarea>
          </div>
        </div>
      </div>
    </article>

    <!-- LOGISTIC COST LIST CARD (Matching Screenshot 18 & Logistic_Cost.cshtml) -->
    <article class="panel" style="margin-bottom: 22px;">
      <div class="main-heading-banner">
        <h5>Logistic Cost List</h5>
      </div>

      <div style="padding: 16px 20px;">
        <div class="table-responsive">
          <table class="procedural-table">
            <thead>
              <tr>
                <th style="width: 65px;">SrNo</th>
                <th style="min-width: 170px;">Vendor</th>
                <th style="min-width: 120px;">Item No</th>
                <th style="min-width: 75px;">Qty</th>
                <th style="min-width: 110px;">Freight</th>
                <th style="min-width: 110px;">Insurance</th>
                <th style="min-width: 110px;">Other</th>
                <th style="min-width: 120px;">Logistics Total</th>
                <th style="width: 130px; text-align: center;">Action</th>
              </tr>
            </thead>
            <tbody>
              @for (item of currentLogisticItemList(); track item.id; let idx = $index) {
                <tr>
                  <td><strong>{{ idx + 1 }}</strong></td>
                  <td class="font-medium">{{ item.vendorName }}</td>
                  <td><strong class="mono-tag">{{ item.itemNo }}</strong></td>
                  <td><strong>{{ item.qty }}</strong></td>
                  <td class="mono">{{ item.freight ? (item.freight | number) + ' AED' : '-' }}</td>
                  <td class="mono">{{ item.insurance ? (item.insurance | number) + ' AED' : '-' }}</td>
                  <td class="mono">{{ item.other ? (item.other | number) + ' AED' : '-' }}</td>
                  <td class="mono font-bold" style="color: #0b1f3a;">
                    {{ (item.total | number) + ' AED' }}
                  </td>
                  <td style="text-align: center;">
                    <button
                      type="button"
                      class="btn btn-secondary btn-sm"
                      style="background-color: #6c757d; border-color: #6c757d; color: white; border-radius: 5px; padding: 4px 12px; font-size: 12px; display: inline-flex; align-items: center; gap: 6px;"
                      (click)="openAssignModal(item)"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 11 12 14 22 4"/>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                      </svg>
                      <span>Assign</span>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="9" class="empty-state">No logistic cost associations created yet for {{ selectedReqNo }}.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
          <button
            type="button"
            class="btn btn-primary"
            style="background-color: #007bff; border-color: #007bff; color: white; padding: 10px 24px;"
            (click)="state.notify('All assigned logistic costs committed to Sage ERP.')"
          >
            Submit
          </button>
        </div>
      </div>
    </article>

    <!-- ASSIGN MODAL (#Assignmodal Matching Screenshot 18 & Logistic_Cost.cshtml) -->
    @if (showAssignModal) {
      <div class="modal-backdrop" (click)="closeAssignModal()">
        <div class="modal-window wide" (click)="$event.stopPropagation()">
          <div class="modal-header" style="background-color: var(--role-accent, #2563eb);">
            <h4 style="color: white; text-align: center; width: 100%;">Assign Logistic Costs</h4>
            <button type="button" class="modal-close" style="color: white;" (click)="closeAssignModal()">✕</button>
          </div>

          <div class="modal-table-wrap" style="padding: 16px 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 13.5px; color: #475569;">
                Vendor: <strong style="color: var(--role-accent, #2563eb); font-weight: 700; font-size: 14px;">{{ modalVendorName }}</strong> &nbsp;·&nbsp;
                Item: <strong class="mono" style="color: #0b1f3a;">{{ modalItemNo }}</strong> &nbsp;·&nbsp;
                Requisition: <strong class="mono" style="color: var(--role-accent, #2563eb);">{{ selectedReqNo }}</strong>
              </span>
              <button
                type="button"
                class="btn small"
                style="background-color: var(--role-accent, #2563eb); border-color: var(--role-accent, #2563eb); font-size: 12px;"
                (click)="addAssignModalRow()"
              >
                + Add Cost Component
              </button>
            </div>

            <table class="modal-table">
              <thead>
                <tr>
                  <th style="width: 55px;">#SR</th>
                  <th style="min-width: 170px;">Vendor Name</th>
                  <th style="width: 130px;">Type</th>
                  <th style="width: 100px;">Currency</th>
                  <th style="width: 120px;">Amount</th>
                  <th>Remarks</th>
                  <th style="width: 75px; text-align: center;">Action</th>
                </tr>
              </thead>
              <tbody>
                @for (row of assignModalRows; track row.id; let idx = $index) {
                  <tr>
                    <td><strong>{{ idx + 1 }}</strong></td>
                    <td>
                      <input
                        type="text"
                        [value]="modalVendorName"
                        readonly
                        class="form-control form-control-sm readonly-field"
                        style="font-weight: 600; color: #1e293b; background: #f8fafc;"
                        title="Assigned to {{ modalVendorName }}"
                      />
                    </td>
                    <td>
                      <select [(ngModel)]="row.type" class="form-control form-control-sm form-select">
                        <option value="Freight">Freight</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Other">Other</option>
                      </select>
                    </td>
                    <td>
                      <select [(ngModel)]="row.currency" class="form-control form-control-sm form-select">
                        @for (c of currencyOptions; track c) {
                          <option [value]="c">{{ c }}</option>
                        }
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        [(ngModel)]="row.amount"
                        placeholder="Amount"
                        class="form-control form-control-sm"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        [(ngModel)]="row.remarks"
                        placeholder="Remarks"
                        class="form-control form-control-sm"
                      />
                    </td>
                    <td style="text-align: center;">
                      <button
                        type="button"
                        class="btn-action-delete"
                        style="background: #dc3545; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer;"
                        (click)="removeAssignModalRow(row.id)"
                        title="Delete row"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="empty-state">No cost entries. Click "+ Add Cost Component" above.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="modal-footer">
            <span class="modal-hint">Assigned costs automatically apply to Bid Landed Cost comparisons.</span>
            <div style="display: flex; gap: 8px;">
              <button
                type="button"
                class="btn"
                style="background-color: var(--role-accent, #2563eb); border-color: var(--role-accent, #2563eb);"
                (click)="saveAssignModal()"
              >
                Submit & Save
              </button>
              <button type="button" class="btn secondary" (click)="closeAssignModal()">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- REQUISITION SEARCH LOOKUP MODAL (#searchReqheader) -->
    @if (showReqSearchModal) {
      <div class="modal-backdrop" (click)="closeReqSearchModal()">
        <div class="modal-window wide" (click)="$event.stopPropagation()">
          <div class="modal-header" style="background-color: var(--role-accent, #2563eb);">
            <h4 style="color: white; text-align: center; width: 100%;">Select Requisition (Logistic Costs)</h4>
            <button type="button" class="modal-close" style="color: white;" (click)="closeReqSearchModal()">✕</button>
          </div>

          <div class="modal-search-bar" style="padding: 12px 20px; border-bottom: 1px solid #e2e8f0;">
            <input
              type="text"
              [(ngModel)]="reqModalSearch"
              placeholder="Search by Document Number, Required For, or Location..."
              style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px;"
              autofocus
            />
          </div>

          <div class="modal-table-wrap" style="padding: 0 20px; max-height: 50vh; overflow-y: auto;">
            <table class="modal-table">
              <thead>
                <tr>
                  <th style="width: 130px;">Request No</th>
                  <th>Req For</th>
                  <th>Date Required</th>
                  <th>Ship VIA</th>
                  <th>Location</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                @for (req of filteredModalRequisitions(); track req.header.documentNumber) {
                  <tr (click)="selectRequisitionFromModal(req.header.documentNumber)" class="clickable-row">
                    <td><strong class="mono" style="color: var(--role-accent, #2563eb);">{{ req.header.documentNumber }}</strong></td>
                    <td>{{ req.header.requiredFor }}</td>
                    <td>{{ req.header.dateRequired }}</td>
                    <td>{{ req.header.shipVia }}</td>
                    <td>{{ req.header.location }}</td>
                    <td style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      {{ req.header.requestDescription }}
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="empty-state">No requisitions found.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="modal-footer">
            <span class="modal-hint">Click any row to select and load requisition items.</span>
            <button type="button" class="btn secondary" (click)="closeReqSearchModal()">Close</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
      padding-bottom: 40px;
    }

    /* Legacy Banner */
    .main-heading-banner {
      background-color: var(--role-accent, #2563eb);
      color: white;
      padding: 9px 18px;
      border-radius: var(--radius-md, 8px) var(--radius-md, 8px) 0 0;
      h5 {
        margin: 0;
        font-size: 14.5px;
        font-weight: 700;
        letter-spacing: 0.02em;
        text-align: center;
      }
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 14px;

      &.four-col {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
        @media (max-width: 500px) { grid-template-columns: 1fr; }
      }

      &.three-col {
        display: flex;
        @media (max-width: 768px) { flex-direction: column; }
      }

      &.two-col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        @media (max-width: 768px) { grid-template-columns: 1fr; }
      }

      label {
        display: block;
        font-size: 12.5px;
        font-weight: 600;
        color: #0f172a;
        margin-bottom: 5px;

        .required { color: #dc2626; }
      }
    }

    .form-control {
      width: 100%;
      height: 38px;
      padding: 6px 12px;
      font-size: 13.5px;
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      box-sizing: border-box;
      outline: none;

      &.readonly-field {
        background: #f1f5f9;
        color: #334155;
        font-weight: 500;
      }

      &.form-control-sm {
        height: 32px;
        padding: 4px 8px;
        font-size: 12.5px;
      }
    }

    .input-with-actions {
      display: flex;
      width: 100%;

      input {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }

      .btn-attached {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        border: none;
        color: white;
        cursor: pointer;

        &.refresh-btn {
          border-top-right-radius: 5px;
          border-bottom-right-radius: 5px;
        }
      }
    }

    .procedural-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;

      th {
        background: #f8fafc;
        color: #475569;
        font-weight: 600;
        text-align: left;
        padding: 10px 14px;
        border: 1px solid #e2e8f0;
      }

      td {
        padding: 10px 14px;
        border: 1px solid #e2e8f0;
        vertical-align: middle;
      }

      tr:hover td {
        background: #f8fafc;
      }
    }

    .mono-tag {
      font-family: monospace;
      color: var(--role-accent, #2563eb);
      font-size: 13px;
    }

    /* Modal Styles */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      z-index: 1000;
      display: grid;
      place-items: center;
      padding: 20px;
    }

    .modal-window {
      background: #ffffff;
      border-radius: 8px;
      width: min(850px, 100%);
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 40px -10px rgba(15, 23, 42, 0.3);
      overflow: hidden;

      &.wide {
        width: min(1050px, 96%);
        max-width: 1050px;
      }

      .modal-header {
        color: #ffffff;
        padding: 12px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        h4 { margin: 0; font-size: 16px; font-weight: 700; }
        .modal-close {
          background: transparent;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
        }
      }

      .modal-footer {
        padding: 12px 20px;
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }

    .modal-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;

      th {
        background: #f8fafc;
        color: #475569;
        font-weight: 600;
        text-align: left;
        padding: 8px 12px;
        border-bottom: 1px solid #e2e8f0;
      }

      td {
        padding: 8px 12px;
        border-bottom: 1px solid #e2e8f0;
        vertical-align: middle;
      }

      .clickable-row {
        cursor: pointer;
        &:hover { background: #eff6ff; }
      }
    }

    .mono { font-family: monospace; }
  `]
})
export class LogisticCostComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly state = inject(PortalStateService);
  readonly vendorApi = inject(VendorApiService);
  readonly sageApi = inject(SageApiService);

  selectedReqNo = '';
  showReqSearchModal = false;
  reqModalSearch = '';

  showAssignModal = false;
  modalItemNo = '';
  modalVendorName = '';
  currencyOptions: string[] = [];
  assignModalRows: Array<{ id: string; reqNo: string; itemNo: string; vendorName: string; type: 'Freight' | 'Insurance' | 'Other'; currency: string; amount: number; remarks: string }> = [];

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['reqNo']) {
        this.selectedReqNo = params['reqNo'];
      }
    });

    this.loadSageCurrencies();
    this.loadRequisitions();
    this.loadLogistics();
  }

  loadSageCurrencies(): void {
    this.sageApi.getCurrencies().subscribe({
      next: (currencies) => {
        if (currencies && currencies.length > 0) {
          this.currencyOptions = currencies.map(c => c.CurrencyCodeKey);
        }
      },
      error: (err) => console.error('Failed to load Sage currencies in logistic-cost:', err)
    });
  }

  loadRequisitions(): void {
    this.vendorApi.getRequestHeaders().subscribe({
      next: (res) => {
        const headers = res?.reqH_List || res?.reqh_List || res?.reQH_List || res?.reqhList || res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(headers) && headers.length > 0) {
          if (!this.selectedReqNo) {
            this.selectedReqNo = headers[0].reQ_NO || headers[0].reqno || '';
          }
          this.loadLogistics();
        }
      },
      error: (err) => console.warn('getRequestHeaders error:', err)
    });
  }

  loadLogistics(): void {
    this.vendorApi.getLogisticsList(this.selectedReqNo).subscribe({
      next: (res) => {
        const list = res?.readdcostList || res?.data || [];
        if (Array.isArray(list) && list.length > 0) {
          const mapped: LogisticCost[] = list.map((row: any) => ({
            id: `${row.reQ_NO || row.reqno}_${row.itemnum}_${row.linenum || Math.random()}`,
            reqNo: row.reQ_NO || row.reqno || '',
            itemNo: row.itemnum || '',
            vendorName: row.vendoR_ID || row.vendorname || '',
            type: (row.type?.toLowerCase().includes('freight') || row.type?.toLowerCase().includes('frieght'))
              ? 'Freight'
              : (row.type?.toLowerCase().includes('insur') ? 'Insurance' : 'Other'),
            currency: (row.currency || 'AED') as any,
            amount: Number(row.samount || row.famount || 0),
            remarks: row.remarks || ''
          }));
          this.state.logisticCosts.set(mapped);
        }
      },
      error: (err) => console.warn('getLogisticsList error:', err)
    });
  }

  currentReq = computed<Requisition | undefined>(() => {
    return this.state.requisitions().find(r => r.header.documentNumber === this.selectedReqNo) || this.state.requisitions()[0];
  });

  currentLogisticItemList = computed(() => {
    const req = this.currentReq();
    if (!req) return [];

    const costs = this.state.logisticCosts().filter(c => c.reqNo === this.selectedReqNo);

    // Group items by itemNo & vendor
    const itemsMap = new Map<string, {
      id: string;
      itemNo: string;
      vendorName: string;
      qty: number;
      freight: number;
      insurance: number;
      other: number;
      total: number;
    }>();

    // From comparison items & existing assigned costs
    for (const comp of this.state.itemBidComparisons().filter(c => c.reqNo === this.selectedReqNo)) {
      for (const bid of comp.bids) {
        const key = `${comp.itemNo}_${bid.vendorName}`;
        if (!itemsMap.has(key)) {
          itemsMap.set(key, {
            id: key,
            itemNo: comp.itemNo,
            vendorName: bid.vendorName,
            qty: comp.qty,
            freight: 0,
            insurance: 0,
            other: 0,
            total: 0
          });
        }
      }
    }

    for (const c of costs) {
      const key = `${c.itemNo}_${c.vendorName}`;
      let existing = itemsMap.get(key);
      if (!existing) {
        existing = {
          id: key,
          itemNo: c.itemNo,
          vendorName: c.vendorName,
          qty: 1,
          freight: 0,
          insurance: 0,
          other: 0,
          total: 0
        };
        itemsMap.set(key, existing);
      }
      if (c.type === 'Freight') existing.freight += c.amount;
      if (c.type === 'Insurance') existing.insurance += c.amount;
      if (c.type === 'Other') existing.other += c.amount;
      existing.total = existing.freight + existing.insurance + existing.other;
    }

    return Array.from(itemsMap.values());
  });

  openReqSearchModal(): void {
    this.reqModalSearch = '';
    this.showReqSearchModal = true;
  }

  closeReqSearchModal(): void {
    this.showReqSearchModal = false;
  }

  filteredModalRequisitions = computed(() => {
    const q = this.reqModalSearch.trim().toLowerCase();
    if (!q) return this.state.requisitions();
    return this.state.requisitions().filter(r =>
      r.header.documentNumber.toLowerCase().includes(q) ||
      r.header.requiredFor.toLowerCase().includes(q) ||
      (r.header.location || '').toLowerCase().includes(q) ||
      (r.header.requestDescription || '').toLowerCase().includes(q)
    );
  });

  selectRequisitionFromModal(docNo: string): void {
    this.selectedReqNo = docNo;
    this.showReqSearchModal = false;
    this.loadLogistics();
    this.state.notify(`Requisition ${docNo} loaded.`);
  }

  refreshRequisition(): void {
    this.loadRequisitions();
    this.loadLogistics();
    this.state.notify(`Requisition ${this.selectedReqNo} refreshed from ERP database.`);
  }

  openAssignModal(item: any): void {
    this.modalItemNo = item ? item.itemNo : (this.currentReq()?.items[0]?.itemNo || '');
    this.modalVendorName = item ? item.vendorName : '';

    // Filter costs strictly for THIS vendor and THIS item
    const existing = this.state.logisticCosts().filter(c =>
      c.reqNo === this.selectedReqNo &&
      c.itemNo === this.modalItemNo &&
      c.vendorName.trim().toLowerCase() === this.modalVendorName.trim().toLowerCase()
    );

    if (existing.length > 0) {
      this.assignModalRows = existing.map(x => ({ ...x, vendorName: this.modalVendorName }));
    } else {
      // Clean starter template for this specific vendor
      this.assignModalRows = [
        { id: `temp_${Date.now()}_1`, reqNo: this.selectedReqNo, itemNo: this.modalItemNo, vendorName: this.modalVendorName, type: 'Freight', currency: 'AED', amount: 0, remarks: 'Freight delivery' },
        { id: `temp_${Date.now()}_2`, reqNo: this.selectedReqNo, itemNo: this.modalItemNo, vendorName: this.modalVendorName, type: 'Insurance', currency: 'AED', amount: 0, remarks: 'Transit insurance coverage' }
      ];
    }
    this.showAssignModal = true;
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
  }

  addAssignModalRow(): void {
    const defaultCurr = this.currencyOptions[0] || 'AED';
    this.assignModalRows.push({
      id: `temp_${Date.now()}_${Math.random()}`,
      reqNo: this.selectedReqNo,
      itemNo: this.modalItemNo,
      vendorName: this.modalVendorName,
      type: 'Freight',
      currency: defaultCurr,
      amount: 0,
      remarks: 'Added logistic charge'
    });
  }

  removeAssignModalRow(id: string): void {
    const target = this.assignModalRows.find(r => r.id === id);
    this.assignModalRows = this.assignModalRows.filter(r => r.id !== id);
    if (!id.startsWith('temp_')) {
      this.state.deleteLogisticCost(id);
      if (target) {
        this.vendorApi.deleteLogistics(this.selectedReqNo, target.vendorName || this.modalVendorName, target.itemNo || this.modalItemNo).subscribe({
          next: () => this.loadLogistics(),
          error: (err) => console.warn('deleteLogistics error:', err)
        });
      }
    }
  }

  saveAssignModal(): void {
    const validRows = this.assignModalRows.filter(r => Number(r.amount) > 0);
    if (validRows.length === 0) {
      this.showAssignModal = false;
      return;
    }

    let completed = 0;
    for (const row of validRows) {
      this.state.saveLogisticCost({
        id: row.id,
        reqNo: this.selectedReqNo,
        itemNo: this.modalItemNo,
        vendorName: this.modalVendorName,
        type: row.type,
        currency: row.currency,
        amount: Number(row.amount),
        remarks: row.remarks
      });

      const payload = {
        coperation: 2,
        reQ_NO: this.selectedReqNo,
        vendoR_ID: this.modalVendorName,
        vendorname: this.modalVendorName,
        itemnum: this.modalItemNo,
        type: row.type,
        currency: row.currency,
        scurrency: row.currency,
        famount: Number(row.amount),
        samount: Number(row.amount),
        remarks: row.remarks
      };

      this.vendorApi.saveLogistics(payload).subscribe({
        next: () => {
          completed++;
          if (completed >= validRows.length) {
            this.loadLogistics();
            this.state.notify(`Logistic costs for ${this.modalVendorName} saved to database.`);
          }
        },
        error: (err) => {
          console.warn('saveLogistics error:', err);
          completed++;
        }
      });
    }

    this.showAssignModal = false;
  }

  navigateToComparison(): void {
    this.router.navigate(['/', this.state.role(), 'bid-comparison'], {
      queryParams: { reqNo: this.selectedReqNo }
    });
  }
}
