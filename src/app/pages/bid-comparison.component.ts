import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PortalStateService } from '../core/portal-state.service';
import { VendorApiService, PCOMPAREModel } from '../core/vendor-api.service';
import { StatusComponent } from '../shared/ui.component';
import { IconComponent } from '../shared/icon.component';
import { ItemBidComparison, Requisition, VendorBidDetail, LogisticCost } from '../core/models';

@Component({
  selector: 'app-bid-comparison',
  standalone: true,
  imports: [FormsModule, StatusComponent, IconComponent],
  template: `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 12px; flex-wrap: wrap;">
      <!-- Option 6 Pill Capsule Tabs Navigation -->
      <div class="profile-tabs" style="margin-bottom: 0;">
      <button
        type="button"
        [class.active]="activeTab === 'evaluation'"
        (click)="switchTab('evaluation')"
      >
        <app-icon name="table" [size]="14" />
        <span>Bid Comparison</span>
      </button>

      <button
        type="button"
        [class.active]="activeTab === 'approval'"
        (click)="switchTab('approval')"
      >
        <app-icon name="check" [size]="14" />
        <span>Comparison Approval</span>
      </button>
    </div>

    <button
      type="button"
      class="btn"
      style="background-color: var(--role-accent, #2563eb); border-color: var(--role-accent, #2563eb); display: inline-flex; align-items: center; gap: 6px;"
      (click)="navigateToLogisticCosts()"
    >
      <app-icon name="logistic-cost" [size]="15" />
      <span>Assign Logistic Costs</span>
    </button>
  </div>

    <!-- REQUISITION DETAILS HEADER CARD (Matching Screenshots 1 & 2) -->
    <article class="panel req-header-panel">
      <div class="main-heading-banner">
        <h5>Requisition Details ({{ activeTab === 'approval' ? 'Comparison Approval' : 'Comparison' }})</h5>
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

    <!-- SOURCING ITEMS LIST TABLE (Matching Screenshots 1 & 2) -->
    <article class="panel" style="margin-bottom: 22px;">
      <div class="main-heading-banner">
        <h5>{{ activeTab === 'approval' ? 'Comparison Approval' : 'Comparison' }}</h5>
      </div>

      <div style="padding: 16px 20px;">
        <div class="table-responsive">
          <table class="procedural-table">
            <thead>
              <tr>
                <th style="width: 65px;">SrNo</th>
                <th style="min-width: 130px;">Item Number</th>
                <th style="min-width: 240px;">Description</th>
                <th style="min-width: 80px;">Qty</th>
                <th style="min-width: 130px;">Delivery Date</th>
                <th style="min-width: 140px;">Status</th>
                <th style="width: 120px; text-align: center;">Compare</th>
              </tr>
            </thead>
            <tbody>
              @for (item of comparisonItems(); track item.itemNo; let idx = $index) {
                <tr [class.highlighted]="activeDeckItem?.itemNo === item.itemNo">
                  <td><strong>{{ idx + 1 }}</strong></td>
                  <td><strong class="mono-tag">{{ item.itemNo }}</strong></td>
                  <td class="font-medium">{{ item.itemDesc }}</td>
                  <td><strong>{{ item.qty }}</strong></td>
                  <td>{{ item.deliveryDate }}</td>
                  <td>
                    <app-status
                      [text]="item.status === 'Approved' ? 'Approved (Winner: ' + (item.winningVendorId || 'Selected') + ')' : (item.winningVendorId ? 'Recommended: ' + item.winningVendorId : 'Pending Evaluation')"
                      [good]="item.status === 'Approved'"
                      [warn]="item.status === 'Pending'"
                    />
                  </td>
                  <td style="text-align: center;">
                    <button
                      type="button"
                      class="btn-compare"
                      (click)="openComparisonDeck(item)"
                      title="Open Vendors Comparison Deck"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="7" height="18" rx="1"/>
                        <rect x="14" y="3" width="7" height="18" rx="1"/>
                      </svg>
                      <span>Compare</span>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="empty-state">No line items found for {{ selectedReqNo }}.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
          <button
            type="button"
            class="btn"
            style="background-color: #007bff; border-color: #007bff; color: white;"
            (click)="activeTab === 'approval' ? submitApprovalBatch() : submitEvaluationBatch()"
          >
            {{ activeTab === 'approval' ? 'Submit Approval Batch' : 'Submit Comparison' }}
          </button>
        </div>
      </div>
    </article>

    <!-- VENDORS COMPARISON CARDS DECK (Matching VendorsComparison.cshtml & Screenshot 20) -->
    @if (activeDeckItem) {
      <article class="panel deck-panel" style="margin-bottom: 24px; border: 2px solid var(--role-accent, #2563eb);">
        <div class="deck-header-bar">
          <div>
            <h3 style="margin: 0; color: var(--role-accent, #2563eb); font-size: 17px; font-weight: 700;">
              {{ activeTab === 'approval' ? 'Vendors Comparison Approval (Manager Sign-Off)' : 'Vendors Cost Estimation & Comparison (Buyer)' }}
            </h3>
            <small style="color: #64748b; font-size: 12.5px;">
              Item No: <strong>{{ activeDeckItem.itemNo }}</strong> ·
              Description: <strong>{{ activeDeckItem.itemDesc }}</strong> ·
              Quantity: <strong>{{ activeDeckItem.qty }}</strong> ·
              Delivery Date Required: <strong>{{ activeDeckItem.deliveryDate }}</strong>
            </small>
          </div>
          <button type="button" class="btn secondary small" (click)="activeDeckItem = null">
            ✕ Close Comparison
          </button>
        </div>

        <!-- Horizontal Vendor Cards Deck Container -->
        <div class="vendor-container">
          @for (bid of activeDeckItem.bids; track bid.vendorId; let vIdx = $index) {
            <div class="vendor-card" [class.selected-card]="selectedWinnerVendorId === bid.vendorId">
              <!-- Badges Header & Selector Radio -->
              <div class="card-top-bar">
                <div class="badges-wrap">
                  @for (badge of getBadges(bid, activeDeckItem.bids); track badge.text) {
                    <span class="badge" [class]="badge.cssClass">{{ badge.text }}</span>
                  }
                </div>
                <label class="select-label">
                  <input
                    type="radio"
                    name="winnerVendorSelect"
                    [checked]="selectedWinnerVendorId === bid.vendorId"
                    (change)="selectedWinnerVendorId = bid.vendorId"
                  />
                  <span>Select</span>
                </label>
              </div>

              <!-- Vendor Title & Currency Switcher Dropdown -->
              <div class="vendor-title-row">
                <h4>{{ bid.vendorName }}</h4>
                <div class="currency-toggle-group">
                  <label class="small-label">Display Currency:</label>
                  <select
                    class="form-control form-control-sm currency-select"
                    [(ngModel)]="cardCurrencyMode[bid.vendorId]"
                  >
                    <option value="vendor">Vendor Currency ({{ bid.currency }})</option>
                    <option value="aed">Functional Currency (AED)</option>
                  </select>
                </div>
              </div>

              <!-- Financial Breakdown Rows -->
              <div class="breakdown-table">
                <div class="breakdown-row">
                  <span class="b-label">Base Currency</span>
                  <span class="b-val mono font-bold">{{ cardCurrencyMode[bid.vendorId] === 'aed' ? 'AED' : bid.currency }}</span>
                </div>

                <div class="breakdown-row">
                  <span class="b-label">Vendor Quoted Price</span>
                  <span class="b-val mono font-bold">
                    {{ formatPrice(getCardPrice(bid), cardCurrencyMode[bid.vendorId] === 'aed' ? 'AED' : bid.currency) }}
                  </span>
                </div>

                <div class="breakdown-row">
                  <span class="b-label">UAE VAT (5%)</span>
                  <span class="b-val mono">
                    {{ formatPrice(getCardVat(bid), cardCurrencyMode[bid.vendorId] === 'aed' ? 'AED' : bid.currency) }}
                  </span>
                </div>

                <div class="breakdown-row subtotal">
                  <span class="b-label">Vendor Subtotal</span>
                  <span class="b-val mono font-bold">
                    {{ formatPrice(getCardVendorTotal(bid), cardCurrencyMode[bid.vendorId] === 'aed' ? 'AED' : bid.currency) }}
                  </span>
                </div>

                <div class="breakdown-row">
                  <span class="b-label">Insurance (AED)</span>
                  <span class="b-val mono">{{ formatPrice(getLogisticsForBid(bid).insurance, 'AED') }}</span>
                </div>

                <div class="breakdown-row">
                  <span class="b-label">Freight (AED)</span>
                  <span class="b-val mono">{{ formatPrice(getLogisticsForBid(bid).freight, 'AED') }}</span>
                </div>

                <div class="breakdown-row">
                  <span class="b-label">Others (AED)</span>
                  <span class="b-val mono">{{ formatPrice(getLogisticsForBid(bid).other, 'AED') }}</span>
                </div>

                <div class="breakdown-row subtotal">
                  <span class="b-label">Additional Logistics Total</span>
                  <span class="b-val mono font-bold" style="color: #64748b;">
                    {{ formatPrice(getLogisticsForBid(bid).total, 'AED') }}
                  </span>
                </div>

                <div class="breakdown-row grand-total">
                  <span class="b-label">Total Landed Cost (AED)</span>
                  <span class="b-val mono grand-price">
                    {{ formatPrice(getGrandTotalAed(bid), 'AED') }}
                  </span>
                </div>
              </div>

              @if (bid.remarks) {
                <div class="bid-remarks">
                  <small>Remarks: {{ bid.remarks }}</small>
                </div>
              }
            </div>
          }
        </div>

        <!-- Bottom Approval Controls matching VendorsComparison.cshtml -->
        <div class="deck-actions-bar">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 13px; font-weight: 600; color: #1e293b;">
              Selected Winner:
            </span>
            <strong style="color: var(--role-accent, #2563eb); font-size: 14px;">
              {{ getWinningVendorName() || 'None Selected' }}
            </strong>
          </div>

          <div style="display: flex; gap: 10px;">
            @if (activeTab === 'evaluation') {
              <button
                type="button"
                class="btn"
                style="background-color: #007bff; border-color: #007bff; color: white; padding: 9px 24px;"
                [disabled]="!selectedWinnerVendorId"
                (click)="recommendWinner()"
              >
                ✓ Recommend Winning Bidder
              </button>
            } @else {
              <button
                type="button"
                class="btn"
                style="background-color: var(--role-accent, #2563eb); border-color: var(--role-accent, #2563eb); color: white; padding: 9px 24px;"
                [disabled]="!selectedWinnerVendorId"
                (click)="approveWinnerComparison()"
              >
                ✓ Approve & Award PO
              </button>
              <button
                type="button"
                class="btn secondary"
                style="background-color: #dc3545; border-color: #dc3545; color: white; padding: 9px 20px;"
                (click)="rejectComparison()"
              >
                ✕ Reject
              </button>
            }
          </div>
        </div>
      </article>
    }

    <!-- REQUISITION SEARCH LOOKUP MODAL (#searchReqheader) -->
    @if (showReqSearchModal) {
      <div class="modal-backdrop" (click)="closeReqSearchModal()">
        <div class="modal-window wide" (click)="$event.stopPropagation()">
          <div class="modal-header" style="background-color: var(--role-accent, #2563eb);">
            <h4 style="color: white; text-align: center; width: 100%;">Select Requisition</h4>
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

    .context-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 12px 18px;
      margin-bottom: 20px;

      .banner-text {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 13px;
        color: #1e3a8a;
      }

      .badge-pill {
        background: #1d4ed8;
        color: white;
        font-size: 10px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 9999px;
        letter-spacing: 0.04em;
      }

      .btn-text-action {
        background: transparent;
        border: none;
        color: #1d4ed8;
        font-weight: 700;
        font-size: 13px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        white-space: nowrap;

        &:hover {
          background: #dbeafe;
          text-decoration: underline;
        }
      }
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

    /* Procedural Table */
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

      tr.highlighted td {
        background: #eff6ff;
      }
    }

    .mono-tag {
      font-family: monospace;
      color: var(--role-accent, #2563eb);
      font-size: 13px;
    }

    .btn-compare {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background-color: var(--role-accent, #2563eb);
      color: white;
      border: none;
      padding: 6px 14px;
      border-radius: 5px;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease, opacity 0.15s ease;

      &:hover {
        opacity: 0.9;
      }
    }

    /* Vendors Comparison Deck Styling */
    .deck-panel {
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 14px rgba(0, 0, 139, 0.08);
    }

    .deck-header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f1f5f9;
      padding: 12px 20px;
      border-bottom: 1px solid #cbd5e1;
    }

    .vendor-container {
      display: flex;
      gap: 18px;
      padding: 20px;
      overflow-x: auto;
      background: #f8fafc;
    }

    .vendor-card {
      flex: 1 0 340px;
      max-width: 400px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      transition: all 0.2s ease;

      &.selected-card {
        border-color: var(--role-accent, #2563eb);
        box-shadow: 0 0 0 2px var(--role-accent, #2563eb), 0 6px 16px var(--role-glow, rgba(37, 99, 235, 0.2));
      }
    }

    .card-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      border-radius: 8px 8px 0 0;
    }

    .badges-wrap {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .badge {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      color: white;

      &.bg-success { background-color: #16a34a; }
      &.bg-danger { background-color: #dc2626; }
      &.bg-primary { background-color: #2563eb; }
      &.bg-info { background-color: #0284c7; }
    }

    .select-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 700;
      color: var(--role-accent, #2563eb);
      cursor: pointer;

      input { cursor: pointer; }
    }

    .vendor-title-row {
      padding: 12px 14px 6px;

      h4 {
        margin: 0 0 6px 0;
        font-size: 15px;
        color: #0f172a;
        font-weight: 700;
      }
    }

    .currency-toggle-group {
      display: flex;
      align-items: center;
      gap: 8px;

      .small-label {
        font-size: 11px;
        color: #64748b;
        margin: 0;
      }

      .currency-select {
        font-size: 11.5px;
        height: 28px;
        padding: 2px 6px;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
      }
    }

    .breakdown-table {
      padding: 10px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .breakdown-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12.5px;
      padding: 4px 0;
      border-bottom: 1px dashed #e2e8f0;

      .b-label { color: #475569; }
      .b-val { color: #0f172a; text-align: right; }

      &.subtotal {
        border-top: 1px solid #cbd5e1;
        border-bottom: 1px solid #cbd5e1;
        padding: 6px 0;
        font-weight: 700;
        .b-label { color: #1e293b; }
      }

      &.grand-total {
        border-top: 2px solid var(--role-accent, #2563eb);
        border-bottom: none;
        padding-top: 8px;
        font-size: 14px;
        font-weight: 800;
        .b-label { color: var(--role-accent, #2563eb); }
        .grand-price { color: var(--role-accent, #2563eb); font-size: 15px; }
      }
    }

    .bid-remarks {
      padding: 8px 14px;
      background: #f1f5f9;
      border-radius: 0 0 8px 8px;
      font-size: 11.5px;
      color: #64748b;
    }

    .deck-actions-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 20px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }

    /* Modal Styling */
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
export class BidComparisonComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly state = inject(PortalStateService);
  readonly vendorApi = inject(VendorApiService);

  // --- TAB NAVIGATION (Screenshots 1 & 2) ---
  // 'evaluation' -> Tab 1: Bid Comparison (Buyer - Comparison.cshtml - Photo 2)
  // 'approval'   -> Tab 2: Comparison Approval (Manager - ComparisonApproval.cshtml - Photo 1)
  activeTab: 'evaluation' | 'approval' = 'evaluation';

  switchTab(tab: 'evaluation' | 'approval'): void {
    this.activeTab = tab;
  }

  pendingApprovalCount = computed(() => {
    return this.comparisonItems().filter(c => c.status !== 'Approved').length;
  });

  // --- REQUISITION HEADER DATA ---
  selectedReqNo = '';
  showReqSearchModal = false;
  reqModalSearch = '';

  // --- BID COMPARISON DECK STATE ---
  activeDeckItem: ItemBidComparison | null = null;
  selectedWinnerVendorId = '';
  cardCurrencyMode: Record<string, 'vendor' | 'aed'> = {};

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['reqNo']) {
        this.selectedReqNo = params['reqNo'];
      }
    });

    this.loadRequisitions();
  }

  loadRequisitions(): void {
    this.vendorApi.getRequestHeaders().subscribe({
      next: (res) => {
        const headers = res?.reqH_List || res?.reqh_List || res?.reQH_List || res?.reqhList || res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(headers) && headers.length > 0) {
          if (!this.selectedReqNo) {
            this.selectedReqNo = headers[0].reQ_NO || headers[0].reqno || '';
          }
          this.loadComparisonData();
        }
      },
      error: (err) => console.warn('getRequestHeaders error:', err)
    });
  }

  loadComparisonData(): void {
    if (!this.selectedReqNo) return;

    // 1. Fetch live logistics from DB
    this.vendorApi.getLogisticsList(this.selectedReqNo).subscribe({
      next: (res) => {
        const list = res?.readdcostList || res?.data || [];
        if (Array.isArray(list) && list.length > 0) {
          const mappedCosts: LogisticCost[] = list.map((row: any) => ({
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
          this.state.logisticCosts.set(mappedCosts);
        }
      },
      error: (err) => console.warn('getLogisticsList error:', err)
    });

    // 2. Fetch live price comparisons from DB
    this.vendorApi.getPriceCompareList(this.selectedReqNo).subscribe({
      next: (res) => {
        const list = res?.pcomparE_List || res?.data || [];
        if (Array.isArray(list) && list.length > 0) {
          const itemMap = new Map<string, ItemBidComparison>();

          for (const row of list) {
            const itemNo = row.itemnum || 'General Item';
            let comp = itemMap.get(itemNo);
            if (!comp) {
              comp = {
                reqNo: row.reqno || this.selectedReqNo,
                itemNo: itemNo,
                itemDesc: `Item ${itemNo}`,
                qty: Number(row.qty || 1),
                deliveryDate: row.audtdate ? String(row.audtdate).substring(0, 10) : new Date().toISOString().substring(0, 10),
                winningVendorId: row.action === 1 ? (row.vendorid || row.vendoR_NAME) : undefined,
                status: row.action === 1 ? 'Approved' : 'Pending',
                bids: []
              };
              itemMap.set(itemNo, comp);
            }

            const vendorName = row.vendoR_NAME || row.vendorid || 'Vendor';
            const existingBid = comp.bids.find(b => b.vendorName === vendorName);
            if (!existingBid) {
              comp.bids.push({
                vendorId: row.vendorid || vendorName,
                vendorName: vendorName,
                currency: row.currency || 'AED',
                price: Number(row.price || 0),
                exchangeRateToAed: 1,
                validityDate: '',
                deliveryDate: '',
                insuranceCost: 0,
                insuranceCurrency: 'AED',
                freightCost: 0,
                freightCurrency: 'AED',
                otherCost: 0,
                otherCurrency: 'AED',
                selected: row.action === 1
              });
            }
          }

          const liveComps = Array.from(itemMap.values());
          if (liveComps.length > 0) {
            this.state.itemBidComparisons.set(liveComps);
            this.openComparisonDeck(liveComps[0]);
          }
        }
      },
      error: (err) => console.warn('getPriceCompareList error:', err)
    });
  }

  currentReq = computed<Requisition | undefined>(() => {
    return this.state.requisitions().find(r => r.header.documentNumber === this.selectedReqNo) || this.state.requisitions()[0];
  });

  comparisonItems = computed<ItemBidComparison[]>(() => {
    return this.state.itemBidComparisons().filter(c => c.reqNo === this.selectedReqNo);
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
    this.loadComparisonData();
    this.activeDeckItem = this.comparisonItems()[0] || null;
    this.state.notify(`Requisition ${docNo} loaded.`);
  }

  refreshRequisition(): void {
    this.loadRequisitions();
    this.loadComparisonData();
    this.state.notify(`Requisition ${this.selectedReqNo} refreshed from ERP database.`);
  }

  // --- COMPARISON DECK LOGIC ---
  openComparisonDeck(item: ItemBidComparison): void {
    this.activeDeckItem = item;
    this.selectedWinnerVendorId = item.winningVendorId || item.bids[0]?.vendorId || '';
    for (const b of item.bids) {
      if (!this.cardCurrencyMode[b.vendorId]) {
        this.cardCurrencyMode[b.vendorId] = 'vendor';
      }
    }
  }

  getLogisticsForBid(bid: VendorBidDetail): { freight: number; insurance: number; other: number; total: number } {
    if (!this.activeDeckItem) return { freight: 0, insurance: 0, other: 0, total: 0 };
    const costs = this.state.logisticCosts().filter(lc =>
      lc.reqNo === this.selectedReqNo &&
      lc.itemNo === this.activeDeckItem!.itemNo &&
      (lc.vendorName.toLowerCase().includes(bid.vendorName.toLowerCase()) || bid.vendorName.toLowerCase().includes(lc.vendorName.toLowerCase()))
    );

    let freight = bid.freightCost || 0;
    let insurance = bid.insuranceCost || 0;
    let other = bid.otherCost || 0;

    for (const c of costs) {
      if (c.type === 'Freight') freight = c.amount;
      if (c.type === 'Insurance') insurance = c.amount;
      if (c.type === 'Other') other = c.amount;
    }

    return { freight, insurance, other, total: freight + insurance + other };
  }

  getCardPrice(bid: VendorBidDetail): number {
    const isAed = this.cardCurrencyMode[bid.vendorId] === 'aed';
    if (!isAed) return bid.price;
    return bid.currency === 'AED' ? bid.price : Math.round(bid.price * (bid.exchangeRateToAed || 3.6725));
  }

  getCardVat(bid: VendorBidDetail): number {
    return Math.round(this.getCardPrice(bid) * 0.05);
  }

  getCardVendorTotal(bid: VendorBidDetail): number {
    return this.getCardPrice(bid) + this.getCardVat(bid);
  }

  getGrandTotalAed(bid: VendorBidDetail): number {
    const baseAed = bid.currency === 'AED' ? bid.price : Math.round(bid.price * (bid.exchangeRateToAed || 3.6725));
    const vatAed = Math.round(baseAed * 0.05);
    const logistics = this.getLogisticsForBid(bid);
    return baseAed + vatAed + logistics.total;
  }

  getBadges(bid: VendorBidDetail, allBids: VendorBidDetail[]): Array<{ text: string; cssClass: string }> {
    const badges: Array<{ text: string; cssClass: string }> = [];
    if (allBids.length <= 1) {
      badges.push({ text: 'Best', cssClass: 'bg-info' });
      return badges;
    }

    const totals = allBids.map(b => this.getGrandTotalAed(b));
    const minTotal = Math.min(...totals);
    const maxTotal = Math.max(...totals);
    const myTotal = this.getGrandTotalAed(bid);

    if (myTotal === minTotal) {
      badges.push({ text: 'Low Price', cssClass: 'bg-success' });
    }
    if (myTotal === maxTotal) {
      badges.push({ text: 'High Price', cssClass: 'bg-danger' });
    }

    if (bid.deliveryDate && this.currentReq()?.header.dateRequired) {
      if (bid.deliveryDate <= this.currentReq()!.header.dateRequired) {
        badges.push({ text: 'Fastest Delivery', cssClass: 'bg-primary' });
      }
    }

    if (badges.length === 0) {
      badges.push({ text: 'Best', cssClass: 'bg-info' });
    }

    return badges;
  }

  getWinningVendorName(): string {
    if (!this.activeDeckItem) return '';
    const b = this.activeDeckItem.bids.find(x => x.vendorId === this.selectedWinnerVendorId);
    return b ? b.vendorName : '';
  }

  recommendWinner(): void {
    if (!this.activeDeckItem || !this.selectedWinnerVendorId) return;
    this.activeDeckItem.winningVendorId = this.selectedWinnerVendorId;

    const payload: PCOMPAREModel = {
      coperation: 2,
      reqno: this.selectedReqNo,
      itemnum: this.activeDeckItem.itemNo,
      vendorid: this.selectedWinnerVendorId,
      vendoR_NAME: this.getWinningVendorName(),
      qty: this.activeDeckItem.qty,
      action: 0,
      isactive: 0
    };
    this.vendorApi.savePriceCompare(payload).subscribe({
      next: () => this.state.notify(`Winning recommendation (${this.getWinningVendorName()}) saved to database for ${this.activeDeckItem?.itemNo}.`),
      error: (err) => console.warn('savePriceCompare recommendation error:', err)
    });
  }

  submitEvaluationBatch(): void {
    this.state.notify(`Requisition ${this.selectedReqNo} evaluation batch submitted for Manager Sign-off.`);
    this.activeTab = 'approval';
  }

  submitApprovalBatch(): void {
    this.state.notify(`Requisition ${this.selectedReqNo} comparison approval batch signed off. Unlocked for PO Creation!`);
  }

  approveWinnerComparison(): void {
    if (!this.activeDeckItem || !this.selectedWinnerVendorId) return;
    this.state.approveItemComparison(this.selectedReqNo, this.activeDeckItem.itemNo, this.selectedWinnerVendorId);
    this.activeDeckItem.status = 'Approved';
    this.activeDeckItem.winningVendorId = this.selectedWinnerVendorId;

    const payload: PCOMPAREModel = {
      coperation: 2,
      reqno: this.selectedReqNo,
      itemnum: this.activeDeckItem.itemNo,
      vendorid: this.selectedWinnerVendorId,
      vendoR_NAME: this.getWinningVendorName(),
      qty: this.activeDeckItem.qty,
      action: 1,
      isactive: 1
    };
    this.vendorApi.savePriceCompare(payload).subscribe({
      next: () => {
        this.loadComparisonData();
        this.state.notify(`Comparison approval signed off and saved to database for ${this.activeDeckItem?.itemNo}.`);
      },
      error: (err) => console.warn('savePriceCompare approval error:', err)
    });
  }

  rejectComparison(): void {
    if (!this.activeDeckItem) return;
    this.state.notify(`Comparison rejected for item ${this.activeDeckItem.itemNo}. Re-sourcing requested.`);
  }

  formatPrice(val: number, currency: string): string {
    return `${currency} ${val.toLocaleString()}`;
  }

  navigateToLogisticCosts(): void {
    const role = this.state.role() || 'procurement';
    this.router.navigate([`/${role}/logistic-cost`], {
      queryParams: { reqNo: this.selectedReqNo }
    });
  }
}
