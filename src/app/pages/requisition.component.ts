import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PortalStateService } from '../core/portal-state.service';
import { VendorApiService, REQHModel, REQDModel } from '../core/vendor-api.service';
import { SageApiService } from '../core/sage-api.service';
import { StatusComponent } from '../shared/ui.component';
import { IconComponent } from '../shared/icon.component';
import { Requisition, RequisitionHeader, RequisitionLineItem, RequisitionAssignedVendor, Vendor } from '../core/models';

interface SageItem {
  itemNumber: string;
  description: string;
  uom: string;
}

interface BrandItem {
  id: string;
  name: string;
}

@Component({
  selector: 'app-requisition',
  standalone: true,
  imports: [FormsModule, StatusComponent, IconComponent, SlicePipe],
  template: `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 12px; flex-wrap: wrap;">
      <!-- Option 6 Pill Capsule Tabs Navigation -->
      <div class="profile-tabs" style="margin-bottom: 0;">
      <button
        type="button"
        [class.active]="activeTab === 'entry'"
        (click)="switchTab('entry')"
      >
        <app-icon name="file" [size]="14" />
        <span>Requisition Entry & Items</span>
      </button>

      <button
        type="button"
        [class.active]="activeTab === 'register'"
        (click)="switchTab('register')"
      >
        <app-icon name="table" [size]="14" />
        <span>Requisitions Register</span>
      </button>

      <button
        type="button"
        [class.active]="activeTab === 'selection'"
        (click)="switchTab('selection')"
      >
        <app-icon name="send" [size]="14" />
        <span>Vendor Selection</span>
      </button>

      <button
        type="button"
        [class.active]="activeTab === 'approval'"
        (click)="switchTab('approval')"
      >
        <app-icon name="check" [size]="14" />
        <span>Vendor Approval</span>
      </button>
    </div>

    <button class="btn" (click)="startNewRequisition()">
      + New Requisition
    </button>
  </div>

    <!-- ========================================================================= -->
    <!-- TAB 1: REQUISITION ENTRY & ITEMS (Requistion.cshtml & Select_correct_item) -->
    <!-- ========================================================================= -->
    @if (activeTab === 'entry') {
      <!-- Edit Mode Notification Banner if editing existing requisition -->
      @if (isEditMode) {
        <div class="edit-mode-banner">
          <div class="banner-content">
            <span class="edit-badge">Item Correction Mode</span>
            <span>
              Editing Requisition <strong>{{ header.documentNumber }}</strong>. You can correct item specifications, quantities, or header details.
            </span>
          </div>
          <button type="button" class="btn small secondary" (click)="startNewRequisition()">
            Exit to New Requisition
          </button>
        </div>
      }

      <!-- CARD 1: REQUISITION DETAILS (Header Details - REQHModel) -->
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
        <div class="panel-title">
          <div class="panel-title-text">
            <h2>Requisition Details</h2>
            <span class="badge-status">{{ header.documentNumber || 'New Draft' }} · {{ header.status || 'Draft' }}</span>
          </div>
          <span style="font-size: 12px; color: var(--muted);">Fields marked with <span class="required">*</span> are required</span>
        </div>

        <div class="form-body">
          <!-- Row 1: Document Number, Required For, Entered By, Date -->
          <div class="form-row four-col">
            <div class="col">
              <label for="docNumber">Document Number</label>
              <div class="input-with-actions">
                <input
                  id="docNumber"
                  type="text"
                  [value]="header.documentNumber"
                  placeholder="Enter Requisition Number"
                  readonly
                  class="form-control readonly-field"
                />
                <button
                  type="button"
                  class="btn-attached refresh-btn"
                  (click)="generateNewDocNumber()"
                  [disabled]="isEditMode"
                  title="{{ isEditMode ? 'Cannot regenerate number in edit mode' : 'Generate New Document Number / Reset' }}"
                >
                  <app-icon name="refresh" [size]="16" />
                </button>
              </div>
            </div>

            <div class="col">
              <label for="requiredFor">Required For <span class="required">*</span></label>
              <select
                id="requiredFor"
                [(ngModel)]="header.requiredFor"
                class="form-select form-control"
                [class.is-invalid]="headerErrors.requiredFor"
              >
                <option value="" disabled>---Select---</option>
                <option value="Tender Bidding">Tender Bidding</option>
                <option value="Job In Hand">Job In Hand</option>
                <option value="Inventory">Inventory</option>
                <option value="Other">Other</option>
              </select>
              @if (headerErrors.requiredFor) {
                <small class="error-text">Required For is mandatory.</small>
              }
            </div>

            <div class="col">
              <label for="enteredBy">Entered By</label>
              <input
                id="enteredBy"
                type="text"
                [(ngModel)]="header.enteredBy"
                placeholder="Enter Entered By"
                readonly
                class="form-control readonly-field"
              />
            </div>

            <div class="col">
              <label for="reqDate">Date</label>
              <input
                id="reqDate"
                type="date"
                [(ngModel)]="header.date"
                class="form-control"
              />
            </div>
          </div>

          <!-- Row 2: Date Required, Ship VIA, Location -->
          <div class="form-row three-col">
            <div class="col">
              <label for="headerDateRequired">Date Required</label>
              <input
                id="headerDateRequired"
                type="date"
                [(ngModel)]="header.dateRequired"
                (change)="onHeaderDateRequiredChange()"
                class="form-control"
              />
            </div>

            <div class="col">
              <label for="headerShipVia">Ship VIA</label>
              <select
                id="headerShipVia"
                [(ngModel)]="header.shipVia"
                (change)="onHeaderShipViaChange()"
                class="form-select form-control"
              >
                <option value="" disabled>---Select---</option>
                @for (opt of shipViaOptions; track opt) {
                  <option [value]="opt">{{ opt }}</option>
                }
              </select>
            </div>

            <div class="col">
              <label for="headerLocation">Location</label>
              <select
                id="headerLocation"
                [(ngModel)]="header.location"
                (change)="onHeaderLocationChange()"
                class="form-select form-control"
              >
                <option value="" disabled>---Select---</option>
                @for (loc of locations; track loc) {
                  <option [value]="loc">{{ loc }}</option>
                }
              </select>
            </div>
          </div>

          <!-- Row 3: Request Description, Comments -->
          <div class="form-row two-col">
            <div class="col">
              <label for="reqDesc">Request Description <span class="required">*</span></label>
              <textarea
                id="reqDesc"
                [(ngModel)]="header.requestDescription"
                placeholder="Enter Request Description (e.g. Electrical fittings for Phase 2 expansion)"
                rows="2"
                class="form-control textarea-field"
                [class.is-invalid]="headerErrors.requestDescription"
              ></textarea>
              @if (headerErrors.requestDescription) {
                <small class="error-text">Request Description is mandatory.</small>
              }
            </div>

            <div class="col">
              <label for="headerComments">Comments</label>
              <textarea
                id="headerComments"
                [(ngModel)]="header.comments"
                placeholder="Enter special handling instructions or procurement notes"
                rows="2"
                class="form-control textarea-field"
              ></textarea>
            </div>
          </div>
        </div>
      </article>

      <!-- CARD 2: REQUISITIONS LIST (Line Items Grid - REQDModel) -->
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
        <div class="panel-title">
          <div class="panel-title-text">
            <h2>Requisitions List (Line Items)</h2>
            <span class="badge-status">{{ items.length }} Line {{ items.length === 1 ? 'Item' : 'Items' }}</span>
          </div>
          <button
            type="button"
            class="btn small"
            style="background: #16a34a; border-color: #16a34a; color: #ffffff; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;"
            (click)="addRow()"
            title="Add Row to Requisitions List"
          >
            <span>+ Add Row</span>
          </button>
        </div>

        <div class="table-responsive">
          <table class="req-table">
            <thead>
              <tr>
                <th style="width: 40px;">Sr</th>
                <th style="min-width: 175px;">Item No <span class="required">*</span></th>
                <th style="min-width: 180px;">Item Desc</th>
                <th style="min-width: 80px;">UOM</th>
                <th style="min-width: 95px;">Quantity <span class="required">*</span></th>
                <th style="min-width: 170px;">Location</th>
                <th style="min-width: 160px;">Project</th>
                <th style="min-width: 160px;">Inco Term</th>
                <th style="min-width: 120px;">Ship Via</th>
                <th style="min-width: 160px;">Brand</th>
                <th style="min-width: 150px;">Country</th>
                <th style="min-width: 130px;">Date Required</th>
                <th style="min-width: 150px;">Comments</th>
                <th style="width: 50px; text-align: center;">Action</th>
              </tr>
            </thead>
            <tbody>
              @for (row of items; track row.sr; let idx = $index) {
                <tr>
                  <!-- Sr -->
                  <td class="text-center font-bold">{{ row.sr }}</td>

                  <!-- Item No with Lookup Modal -->
                  <td>
                    <div class="cell-input-group">
                      <input
                        type="text"
                        [value]="row.itemNo"
                        placeholder="Select Item"
                        readonly
                        class="cell-control readonly"
                      />
                      <button
                        type="button"
                        class="btn-cell-search"
                        (click)="openItemModal(idx)"
                        title="Search Sage Items"
                      >
                        <app-icon name="search" [size]="14" />
                      </button>
                    </div>
                  </td>

                  <!-- Item Desc -->
                  <td>
                    <input
                      type="text"
                      [value]="row.itemDesc"
                      placeholder="Item Description"
                      readonly
                      class="cell-control readonly"
                    />
                  </td>

                  <!-- UOM -->
                  <td>
                    <input
                      type="text"
                      [value]="row.uom"
                      placeholder="UOM"
                      readonly
                      class="cell-control readonly text-center"
                    />
                  </td>

                  <!-- Quantity -->
                  <td>
                    <input
                      type="number"
                      [(ngModel)]="row.quantity"
                      placeholder="Qty"
                      min="1"
                      class="cell-control text-right"
                    />
                  </td>

                  <!-- Location -->
                  <td>
                    <select [(ngModel)]="row.location" class="cell-control select">
                      <option value="" disabled>--Select--</option>
                      @for (loc of locations; track loc) {
                        <option [value]="loc">{{ loc }}</option>
                      }
                    </select>
                  </td>

                  <!-- Project Input -->
                  <td>
                    <input
                      type="text"
                      [(ngModel)]="row.projectId"
                      placeholder="Project ID"
                      class="cell-control"
                    />
                  </td>

                  <!-- Inco Term (11 Legacy Incoterms) -->
                  <td>
                    <select [(ngModel)]="row.incoTerm" class="cell-control select">
                      <option value="" disabled>--Select--</option>
                      @for (term of incoTerms; track term) {
                        <option [value]="term">{{ term }}</option>
                      }
                    </select>
                  </td>

                  <!-- Ship Via -->
                  <td>
                    <select [(ngModel)]="row.shipVia" class="cell-control select">
                      <option value="" disabled>--Select--</option>
                      @for (opt of shipViaOptions; track opt) {
                        <option [value]="opt">{{ opt }}</option>
                      }
                    </select>
                  </td>

                  <!-- Brand with Lookup Modal -->
                  <td>
                    <div class="cell-input-group">
                      <input
                        type="text"
                        [value]="row.brand"
                        placeholder="--Select Brand--"
                        readonly
                        class="cell-control readonly"
                      />
                      <button
                        type="button"
                        class="btn-cell-search"
                        (click)="openBrandModal(idx)"
                        title="Search Brand"
                      >
                        <app-icon name="search" [size]="14" />
                      </button>
                    </div>
                  </td>

                  <!-- Country (28 Legacy Countries) -->
                  <td>
                    <select [(ngModel)]="row.country" class="cell-control select">
                      <option value="" disabled>--Select--</option>
                      @for (c of countries; track c) {
                        <option [value]="c">{{ c }}</option>
                      }
                    </select>
                  </td>

                  <!-- Date Required -->
                  <td>
                    <input
                      type="date"
                      [(ngModel)]="row.dateRequired"
                      class="cell-control"
                    />
                  </td>

                  <!-- Comments -->
                  <td>
                    <input
                      type="text"
                      [(ngModel)]="row.comments"
                      placeholder="Line notes..."
                      class="cell-control"
                    />
                  </td>

                  <!-- Action: Remove Row -->
                  <td class="text-center">
                    <button
                      type="button"
                      class="btn-trash-row"
                      (click)="removeRow(idx)"
                      [disabled]="items.length <= 1"
                      title="Remove Row"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Submit Button Bar -->
        <div class="toolbar" style="margin-top: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
          <div class="footer-meta">
            <span>Total Items: <strong>{{ items.length }}</strong></span>
            <span style="margin: 0 8px; color: var(--line-strong);">·</span>
            <span>Total Quantity: <strong>{{ totalQuantity() }}</strong></span>
          </div>

          <div class="footer-actions" style="display: flex; gap: 10px;">
            <button
              type="button"
              class="btn"
              (click)="saveRequisition()"
              style="background: var(--role-accent); border-color: var(--role-accent);"
            >
              {{ isEditMode ? 'Update Requisition & Items' : 'Save Requisition' }}
            </button>
            <button
              type="button"
              class="btn secondary"
              (click)="proceedToSourcing()"
            >
              Proceed to Vendor Sourcing →
            </button>
          </div>
        </div>
      </article>
    }

    <!-- ========================================================================= -->
    <!-- TAB 2: REQUISITIONS REGISTER (GetREQHList & Lifecycle Status)             -->
    <!-- ========================================================================= -->
    @if (activeTab === 'register') {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
        <div class="panel-title">
          <div class="panel-title-text">
            <h2>Requisitions Register</h2>
            <span class="badge-status">{{ filteredRequisitions().length }} records</span>
          </div>
          <div class="table-search-box">
            <app-icon name="search" [size]="14" />
            <input
              type="text"
              [(ngModel)]="historySearch"
              placeholder="Search by REQ #, location, project..."
            />
          </div>
        </div>

        <div class="table-responsive">
          <table class="requests-table">
            <thead>
              <tr>
                <th style="min-width: 140px;">Document #</th>
                <th style="min-width: 130px;">Required For</th>
                <th style="min-width: 260px;">Description</th>
                <th style="min-width: 180px;">Location</th>
                <th style="min-width: 100px;">Line Items</th>
                <th style="min-width: 130px;">Sourced Vendors</th>
                <th style="min-width: 120px;">Date Required</th>
                <th style="min-width: 120px;">Status</th>
                <th style="text-align: right; min-width: 250px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (req of filteredRequisitions(); track req.header.documentNumber) {
                <tr [class.highlighted]="req.header.documentNumber === header.documentNumber">
                  <td class="req-id-cell">
                    <strong>{{ req.header.documentNumber }}</strong>
                    <small style="display: block; color: var(--muted); font-size: 11px;">{{ req.header.date }}</small>
                  </td>
                  <td>{{ req.header.requiredFor }}</td>
                  <td class="desc-cell">{{ req.header.requestDescription }}</td>
                  <td class="location-cell">{{ req.header.location }}</td>
                  <td>
                    <span class="badge-counter">{{ req.items.length }} items</span>
                  </td>
                  <td>
                    @let vCount = getAssignedVendorCount(req);
                    @if (vCount > 0) {
                      <span class="tag-assigned">{{ vCount }} vendor(s)</span>
                    } @else {
                      <span class="tag-unassigned">None</span>
                    }
                  </td>
                  <td class="date-cell">{{ req.header.dateRequired }}</td>
                  <td>
                    <app-status
                      [text]="req.header.status || 'Draft'"
                      [good]="req.header.status === 'Approved'"
                      [warn]="req.header.status === 'Submitted' || req.header.status === 'Vendors Assigned'"
                      [bad]="req.header.status === 'Rejected'"
                    />
                  </td>
                  <td class="actions-cell" style="text-align: right;">
                    <button
                      class="table-btn-edit"
                      style="background: #0284c7; border-color: #0284c7; color: white;"
                      (click)="openAuditHistoryModal(req.header.documentNumber)"
                      title="View Lifecycle Timeline & Audit Log"
                    >
                      <app-icon name="clock" [size]="12" />
                      <span>Audit Log</span>
                    </button>
                    <button
                      class="table-btn-edit"
                      (click)="editRequisition(req)"
                      title="Item Correction & Header Edit (Select_correct_item.cshtml)"
                    >
                      Edit / Correct
                    </button>
                    @if (req.header.status === 'Vendors Assigned') {
                      <button
                        class="table-btn-source"
                        style="background: #16a34a; border-color: #16a34a;"
                        (click)="goToApprovalForReq(req)"
                        title="Audit and approve vendor sourcing plan (Vendor_approval.cshtml)"
                      >
                        <app-icon name="check" [size]="12" />
                        <span>Sign-off</span>
                      </button>
                    } @else {
                      <button
                        class="table-btn-source"
                        (click)="goToSelectionForReq(req)"
                        title="Source & Assign Approved Vendors (Vendor_Sellection.cshtml)"
                      >
                        <app-icon name="send" [size]="12" />
                        <span>Selection</span>
                      </button>
                    }
                    <button
                      class="table-btn-delete"
                      (click)="deleteRequisition(req.header.documentNumber)"
                      title="Delete Requisition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="9" class="empty-state">No requisitions recorded. Click "+ New Requisition" to create one.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </article>
    }

    <!-- ========================================================================= -->
    <!-- TAB 3: VENDOR SELECTION (Legacy: Vendor_Sellection.cshtml)                -->
    <!-- ========================================================================= -->
    @if (activeTab === 'selection') {
      <div class="sourcing-layout">
        <!-- Requisition Selector & Overview Card -->
        <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
          <div class="panel-title">
            <div class="panel-title-text">
              <h2>Requisition Details (Vendor Selection)</h2>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <label for="selectSourcingReq" style="font-size: 13px; font-weight: 600;">Requisition:</label>
              <select
                id="selectSourcingReq"
                class="form-select form-control"
                style="width: 260px; height: 36px;"
                [ngModel]="sourcingRequisition?.header?.documentNumber"
                (ngModelChange)="onSourcingReqSelected($event)"
              >
                @for (r of requisitionsList(); track r.header.documentNumber) {
                  <option [value]="r.header.documentNumber">
                    {{ r.header.documentNumber }} ({{ r.header.status || 'Draft' }}) - {{ r.items.length }} lines
                  </option>
                }
              </select>
              @if (sourcingRequisition?.header?.documentNumber) {
                <button
                  type="button"
                  class="btn secondary small"
                  style="height: 36px;"
                  (click)="openAuditHistoryModal(sourcingRequisition!.header.documentNumber)"
                >
                  <app-icon name="clock" [size]="13" />
                  <span>Audit Trail</span>
                </button>
              }
            </div>
          </div>

          @if (sourcingRequisition) {
            <div class="sourcing-overview-grid">
              <div class="overview-item">
                <span class="overview-label">Document Number</span>
                <span class="overview-val font-bold">{{ sourcingRequisition.header.documentNumber }}</span>
              </div>
              <div class="overview-item">
                <span class="overview-label">Current Status</span>
                <span class="overview-val">
                  <app-status
                    [text]="sourcingRequisition.header.status || 'Draft'"
                    [good]="sourcingRequisition.header.status === 'Approved'"
                    [warn]="sourcingRequisition.header.status === 'Submitted' || sourcingRequisition.header.status === 'Vendors Assigned'"
                  />
                </span>
              </div>
              <div class="overview-item">
                <span class="overview-label">Required For</span>
                <span class="overview-val">{{ sourcingRequisition.header.requiredFor }}</span>
              </div>
              <div class="overview-item">
                <span class="overview-label">Delivery Location</span>
                <span class="overview-val">{{ sourcingRequisition.header.location }}</span>
              </div>
              <div class="overview-item">
                <span class="overview-label">Date Required</span>
                <span class="overview-val">{{ sourcingRequisition.header.dateRequired }}</span>
              </div>
              <div class="overview-item">
                <span class="overview-label">Entered By</span>
                <span class="overview-val">{{ sourcingRequisition.header.enteredBy }}</span>
              </div>
            </div>

            <p style="margin: 12px 0 0; padding: 10px 14px; background: #f8fafc; border-radius: 6px; font-size: 13px; color: var(--text);">
              <strong>Description:</strong> {{ sourcingRequisition.header.requestDescription }}
            </p>
          } @else {
            <p style="color: var(--muted); padding: 16px 0;">Please select a requisition from the dropdown above to manage vendor sourcing.</p>
          }
        </article>

        @if (sourcingRequisition) {
          <!-- SOURCING TABLE: Line Item by Line Item Vendor Assignment (Vendor_Sellection.cshtml) -->
          <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
            <div class="panel-title">
              <div class="panel-title-text">
                <h2>Vendor Selection List</h2>
                <span class="badge-status">{{ sourcingRequisition.items.length }} Line Items</span>
              </div>

            </div>

            <div class="table-responsive">
              <table class="sourcing-table">
                <thead>
                  <tr>
                    <th style="width: 50px;">Line #</th>
                    <th style="width: 130px;">Item No</th>
                    <th>Item Description</th>
                    <th style="width: 100px;">Qty & UOM</th>
                    <th style="width: 150px;">Project</th>
                    <th>Assigned Vendors</th>
                    <th style="width: 190px; text-align: right;">Sourcing Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of sourcingRequisition.items; track item.sr; let idx = $index) {
                    @let assigned = getAssignedVendorsForItem(item);
                    <tr>
                      <td class="font-bold text-center">{{ item.sr || (idx + 1) }}</td>
                      <td><strong class="vendor-tag">{{ item.itemNo }}</strong></td>
                      <td class="font-medium">{{ item.itemDesc }}</td>
                      <td>{{ item.quantity }} {{ item.uom }}</td>
                      <td>{{ item.projectId || 'General' }}</td>
                      <td>
                        <div class="vendor-chips-wrap">
                          @for (v of assigned; track v.vendorId) {
                            <span class="vendor-chip">
                              <span>{{ v.vendorName }}</span>
                              <button
                                type="button"
                                class="chip-remove"
                                (click)="removeVendorFromItem(item, v.vendorId)"
                                title="Remove Vendor"
                              >✕</button>
                            </span>
                          } @empty {
                            <span class="empty-badge">No vendors assigned</span>
                          }
                        </div>
                      </td>
                      <td style="text-align: right;">
                        <button
                          type="button"
                          class="table-btn-source"
                          (click)="openLineVendorSelectionModal(item)"
                          title="Assign Approved Vendors to this item"
                        >
                          + Assign
                        </button>
                        @if (assigned.length > 0) {
                          <button
                            type="button"
                            class="table-btn-select"
                            (click)="openViewAssignedModal(item)"
                            title="View Assigned Vendors"
                          >
                            View ({{ assigned.length }})
                          </button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Bottom Submit Action Bar for Buyer -->
            <div class="approval-action-bar" style="margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 16px; justify-content: flex-end;">
              <div class="approval-buttons">
                <button
                  type="button"
                  class="btn secondary"
                  (click)="saveCurrentAssignments()"
                  title="Save vendor assignments as draft"
                >
                  Save Sourcing Draft
                </button>
                <button
                  type="button"
                  class="btn"
                  style="background: var(--role-accent, #2563eb); border-color: var(--role-accent, #2563eb); font-weight: 700; padding: 10px 22px; display: inline-flex; align-items: center; gap: 8px;"
                  [disabled]="getUniqueAssignedVendorsCount() === 0"
                  (click)="submitSourcingForApproval()"
                  title="Submit vendor selection to Manager for Approval"
                >
                  <app-icon name="send" [size]="16" />
                  <span>Submit Sourcing Plan →</span>
                </button>
              </div>
            </div>
          </article>
        }
      </div>
    }

    <!-- ========================================================================= -->
    <!-- TAB 4: VENDOR APPROVAL (Legacy: Vendor_approval.cshtml)                   -->
    <!-- ========================================================================= -->
    @if (activeTab === 'approval') {
      <div class="sourcing-layout">
        <!-- Requisition Selector & Overview Card for Manager -->
        <article class="panel" style="margin-bottom: 18px; border-left: 4px solid #16a34a;">
          <div class="panel-title">
            <div class="panel-title-text">
              <h2>Requisition Details (Vendor Approval)</h2>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <label for="selectApprovalReq" style="font-size: 13px; font-weight: 600;">Requisition to Audit:</label>
              <select
                id="selectApprovalReq"
                class="form-select form-control"
                style="width: 260px; height: 36px;"
                [ngModel]="sourcingRequisition?.header?.documentNumber"
                (ngModelChange)="onSourcingReqSelected($event)"
              >
                @for (r of requisitionsList(); track r.header.documentNumber) {
                  <option [value]="r.header.documentNumber">
                    {{ r.header.documentNumber }} ({{ r.header.status || 'Draft' }}) - {{ (r.assignedVendors || []).length }} vendor link(s)
                  </option>
                }
              </select>
              @if (sourcingRequisition?.header?.documentNumber) {
                <button
                  type="button"
                  class="btn secondary small"
                  style="height: 36px;"
                  (click)="openAuditHistoryModal(sourcingRequisition!.header.documentNumber)"
                >
                  <app-icon name="clock" [size]="13" />
                  <span>Audit Trail</span>
                </button>
              }
            </div>
          </div>

          @if (sourcingRequisition) {
            <div class="sourcing-overview-grid">
              <div class="overview-item">
                <span class="overview-label">Document Number</span>
                <span class="overview-val font-bold">{{ sourcingRequisition.header.documentNumber }}</span>
              </div>
              <div class="overview-item">
                <span class="overview-label">Current Status</span>
                <span class="overview-val">
                  <app-status
                    [text]="sourcingRequisition.header.status || 'Draft'"
                    [good]="sourcingRequisition.header.status === 'Approved'"
                    [warn]="sourcingRequisition.header.status === 'Submitted' || sourcingRequisition.header.status === 'Vendors Assigned'"
                  />
                </span>
              </div>
              <div class="overview-item">
                <span class="overview-label">Required For</span>
                <span class="overview-val">{{ sourcingRequisition.header.requiredFor }}</span>
              </div>
              <div class="overview-item">
                <span class="overview-label">Delivery Location</span>
                <span class="overview-val">{{ sourcingRequisition.header.location }}</span>
              </div>
              <div class="overview-item">
                <span class="overview-label">Date Required</span>
                <span class="overview-val">{{ sourcingRequisition.header.dateRequired }}</span>
              </div>
              <div class="overview-item">
                <span class="overview-label">Entered By</span>
                <span class="overview-val">{{ sourcingRequisition.header.enteredBy }}</span>
              </div>
            </div>

            <p style="margin: 12px 0 0; padding: 10px 14px; background: #f8fafc; border-radius: 6px; font-size: 13px; color: var(--text);">
              <strong>Description:</strong> {{ sourcingRequisition.header.requestDescription }}
            </p>
          } @else {
            <p style="color: var(--muted); padding: 16px 0;">Please select a requisition from the dropdown above to audit vendor sourcing.</p>
          }
        </article>

        @if (sourcingRequisition) {
          <!-- AUDIT STATS & LIST -->
          <article class="panel" style="margin-bottom: 18px; border-left: 4px solid #16a34a; background: #fafdfb;">
            <div class="panel-title">
              <div class="panel-title-text">
                <h2 style="color: #15803d;">Vendor Approval List</h2>
                <span class="badge-status" style="background: #dcfce7; color: #15803d; border-color: #bbf7d0;">
                  Manager Sourcing Verification
                </span>
              </div>
            </div>

            <div class="sourcing-stats-bar">
              <div class="stat-box">
                <span class="stat-label">Total Line Items</span>
                <strong class="stat-number">{{ sourcingRequisition.items.length }}</strong>
              </div>
              <div class="stat-box">
                <span class="stat-label">Lines with Assigned Vendors</span>
                <strong class="stat-number" [style.color]="getLinesWithVendorsCount() === sourcingRequisition.items.length ? '#16a34a' : '#b45309'">
                  {{ getLinesWithVendorsCount() }} / {{ sourcingRequisition.items.length }}
                </strong>
              </div>
              <div class="stat-box">
                <span class="stat-label">Unique Vendors Selected</span>
                <strong class="stat-number">{{ getUniqueAssignedVendorsCount() }}</strong>
              </div>
              <div class="stat-box">
                <span class="stat-label">Two-Way Compliance</span>
                <strong class="stat-number" style="color: #16a34a; font-size: 13px;">✓ Procurement & Bank Approved</strong>
              </div>
            </div>

            <!-- Read-Only Audit Table -->
            <div class="table-responsive" style="margin-top: 16px;">
              <table class="sourcing-table">
                <thead>
                  <tr>
                    <th style="width: 50px;">Line #</th>
                    <th style="width: 130px;">Item No</th>
                    <th>Item Description</th>
                    <th style="width: 100px;">Qty & UOM</th>
                    <th style="width: 150px;">Project</th>
                    <th>Selected Vendors</th>
                    <th style="width: 140px; text-align: right;">Audit</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of sourcingRequisition.items; track item.sr; let idx = $index) {
                    @let assigned = getAssignedVendorsForItem(item);
                    <tr>
                      <td class="font-bold text-center">{{ item.sr || (idx + 1) }}</td>
                      <td><strong class="vendor-tag">{{ item.itemNo }}</strong></td>
                      <td class="font-medium">{{ item.itemDesc }}</td>
                      <td>{{ item.quantity }} {{ item.uom }}</td>
                      <td>{{ item.projectId || 'General' }}</td>
                      <td>
                        <div class="vendor-chips-wrap">
                          @for (v of assigned; track v.vendorId) {
                            <span class="vendor-chip" style="padding-right: 10px;">
                              <span>{{ v.vendorName }}</span>
                            </span>
                          } @empty {
                            <span class="empty-badge" style="color: #dc2626;">⚠ No vendors assigned</span>
                          }
                        </div>
                      </td>
                      <td style="text-align: right;">
                        <button
                          type="button"
                          class="table-btn-select"
                          (click)="openViewAssignedModal(item)"
                          title="View Assigned Vendors for this line"
                        >
                          View ({{ assigned.length }})
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="approval-action-bar" style="margin-top: 20px;">
              <div class="approval-note">
                <p>
                  <strong>Sign-Off Rule:</strong> Manager approval authorizes the requisition and automatically dispatches RFQs to all selected vendors. Only vendors with both Procurement and Finance approvals will be sent RFQ bid invitations.
                </p>
              </div>

              <div class="approval-buttons">
                <button
                  type="button"
                  class="btn secondary"
                  style="background-color: #fee2e2; border-color: #fca5a5; color: #991b1b;"
                  (click)="rejectCurrentSourcing()"
                  title="Return to buyer for revision"
                >
                  ✕ Return for Revision
                </button>
                <button
                  type="button"
                  class="btn"
                  style="background: #16a34a; border-color: #16a34a; font-weight: 700; padding: 10px 22px; display: inline-flex; align-items: center; gap: 8px;"
                  [disabled]="getUniqueAssignedVendorsCount() === 0 || sourcingRequisition.header.status === 'Approved'"
                  (click)="approveAndDispatchSourcing()"
                  title="Authorize Sourcing and Dispatch RFQs"
                >
                  <app-icon name="check" [size]="16" />
                  <span>{{ sourcingRequisition.header.status === 'Approved' ? 'Already Approved & Dispatched' : '✓ Approve Sourcing & Dispatch RFQs' }}</span>
                </button>
              </div>
            </div>
          </article>
        }
      </div>
    }

    <!-- ========================================================================= -->
    <!-- MODAL 1: SAGE ITEM LIST MODAL                                            -->
    <!-- ========================================================================= -->
    @if (showItemModal) {
      <div class="modal-backdrop" (click)="showItemModal = false">
        <div class="modal-window" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h4>Sage 300 Item Master</h4>
            <button type="button" class="modal-close" (click)="showItemModal = false">✕</button>
          </div>
          <div class="modal-search-bar">
            <app-icon name="search" [size]="16" />
            <input
              type="text"
              [(ngModel)]="itemSearchQuery"
              (keyup.enter)="loadSageItems(1)"
              placeholder="Search by Item Number or Description (Press Enter)..."
              autofocus
            />
            <button
              type="button"
              class="btn-pager-sm"
              (click)="loadSageItems(1)"
              title="Search Sage 300"
            >Search</button>
          </div>
          <div class="modal-table-wrap">
            <table class="modal-table">
              <thead>
                <tr>
                  <th style="width: 140px;">Item Number</th>
                  <th>Item Description</th>
                  <th style="width: 90px; text-align: center;">UOM</th>
                </tr>
              </thead>
              <tbody>
                @if (isLoadingSageItems) {
                  <tr>
                    <td colspan="3" class="empty-state">Loading items from Sage 300 ERP...</td>
                  </tr>
                } @else {
                  @for (item of filteredSageItems(); track item.itemNumber) {
                    <tr (click)="selectItem(item)" class="clickable-row">
                      <td><strong class="vendor-tag">{{ item.itemNumber }}</strong></td>
                      <td class="font-medium">{{ item.description }}</td>
                      <td class="text-center">{{ item.uom }}</td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="3" class="empty-state">No matching items found in Sage catalog.</td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
          <div class="modal-footer">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="modal-hint">Page {{ sageItemPage }} of {{ sageItemTotalPages }} ({{ sageItemTotalCount }} items)</span>
              <button
                type="button"
                class="btn-pager-sm"
                [disabled]="sageItemPage <= 1 || isLoadingSageItems"
                (click)="prevSageItemPage()"
              >◀ Prev</button>
              <button
                type="button"
                class="btn-pager-sm"
                [disabled]="sageItemPage >= sageItemTotalPages || isLoadingSageItems"
                (click)="nextSageItemPage()"
              >Next ▶</button>
            </div>
            <button type="button" class="btn secondary" (click)="showItemModal = false">Close</button>
          </div>
        </div>
      </div>
    }

    <!-- ========================================================================= -->
    <!-- MODAL 2: BRAND LIST MODAL                                                -->
    <!-- ========================================================================= -->
    @if (showBrandModal) {
      <div class="modal-backdrop" (click)="showBrandModal = false">
        <div class="modal-window modal-sm" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h4>Brand Directory</h4>
            <button type="button" class="modal-close" (click)="showBrandModal = false">✕</button>
          </div>
          <div class="modal-search-bar">
            <app-icon name="search" [size]="16" />
            <input
              type="text"
              [(ngModel)]="brandSearchQuery"
              placeholder="Search by Brand Name..."
              autofocus
            />
          </div>
          <div class="modal-table-wrap">
            <table class="modal-table">
              <thead>
                <tr>
                  <th style="width: 110px;">Brand ID</th>
                  <th>Brand Name</th>
                </tr>
              </thead>
              <tbody>
                @for (brand of filteredBrands(); track brand.id) {
                  <tr (click)="selectBrand(brand)" class="clickable-row">
                    <td><strong class="vendor-tag">{{ brand.id }}</strong></td>
                    <td class="font-medium">{{ brand.name }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="2" class="empty-state">No matching brands found.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="modal-footer">
            <span class="modal-hint">Click row to set brand</span>
            <button type="button" class="btn secondary" (click)="showBrandModal = false">Close</button>
          </div>
        </div>
      </div>
    }

    <!-- ========================================================================= -->
    <!-- MODAL 4: VENDOR SELECTION MODAL (Line Item or Batch - Vendor_Sellection)   -->
    <!-- ========================================================================= -->
    @if (showVendorSelectionModal) {
      <div class="modal-backdrop" (click)="showVendorSelectionModal = false">
        <div class="modal-window" (click)="$event.stopPropagation()" style="max-width: 920px; width: 95%;">
          <div class="modal-header">
            <div>
              <h4>
                {{ isBatchVendorSelection ? 'Batch Assign Vendors to All Lines' : 'Assign Vendors for Item' }}
              </h4>
              @if (!isBatchVendorSelection && activeSourcingItem) {
                <span style="font-size: 12px; color: var(--muted);">
                  Line {{ activeSourcingItem.sr }}: <strong>{{ activeSourcingItem.itemNo }}</strong> - {{ activeSourcingItem.itemDesc }}
                </span>
              }
            </div>
            <button type="button" class="modal-close" (click)="showVendorSelectionModal = false">✕</button>
          </div>

          <!-- Compliance Rule Alert -->
          <div style="padding: 10px 20px; background: #f0fdf4; border-bottom: 1px solid #bbf7d0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <span style="font-size: 12.5px; color: #166534; font-weight: 600;">
              ✓ Two-Way Approval Enforced: Only vendors with Procurement & Finance approval can be selected.
            </span>
            <button
              type="button"
              class="btn small ghost"
              (click)="selectAllApprovedVendorsInModal()"
              style="font-size: 12px;"
            >
              Select All Approved
            </button>
          </div>

          <!-- Vendors Table -->
          <div class="modal-table-wrap" style="max-height: 400px; overflow-y: auto; padding: 0 20px;">
            <table class="modal-table">
              <thead>
                <tr>
                  <th style="width: 50px; text-align: center;">Select</th>
                  <th style="width: 110px;">Vendor Code</th>
                  <th>Vendor Legal Name</th>
                  <th>Categories</th>
                  <th style="width: 110px;">Procurement</th>
                  <th style="width: 110px;">Finance</th>
                  <th style="width: 160px;">Status</th>
                </tr>
              </thead>
              <tbody>
                @for (v of state.vendors(); track v.id) {
                  @let isEligible = v.procurementStatus === 'Approved' && v.financeStatus === 'Approved';
                  <tr [class.disabled-row]="!isEligible" [class.selected-row]="selectedVendorMap[v.id]">
                    <td style="text-align: center;">
                      <input
                        type="checkbox"
                        [checked]="selectedVendorMap[v.id]"
                        (change)="toggleVendorInModal(v.id)"
                        [disabled]="!isEligible"
                        style="cursor: pointer; width: 16px; height: 16px;"
                      />
                    </td>
                    <td><strong class="vendor-tag">{{ v.id }}</strong></td>
                    <td class="font-medium">
                      {{ v.name }}
                      <small style="display: block; color: var(--muted); font-size: 11px;">{{ v.location }}</small>
                    </td>
                    <td>
                      <small style="color: #475569;">{{ v.categories.join(', ') }}</small>
                    </td>
                    <td>
                      <app-status [text]="v.procurementStatus" [good]="v.procurementStatus === 'Approved'" [warn]="v.procurementStatus === 'Pending'" />
                    </td>
                    <td>
                      <app-status [text]="v.financeStatus" [good]="v.financeStatus === 'Approved'" [warn]="v.financeStatus === 'Pending'" />
                    </td>
                    <td>
                      @if (isEligible) {
                        <span style="display: inline-flex; align-items: center; gap: 4px; color: var(--green); font-weight: 700; font-size: 11.5px;">
                          <app-icon name="check" [size]="12" />
                          <span>Eligible (Approved)</span>
                        </span>
                      } @else if (v.procurementStatus !== 'Approved') {
                        <span style="color: #b45309; font-size: 11px; font-weight: 600;">
                          Pending Procurement
                        </span>
                      } @else {
                        <span style="color: #b45309; font-size: 11px; font-weight: 600;">
                          Pending Bank Check
                        </span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="modal-footer" style="padding: 14px 20px; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <span style="font-size: 13px; font-weight: 600; color: var(--text);">
                {{ getModalSelectedVendorCount() }} vendor(s) selected
              </span>
            </div>
            <div style="display: flex; gap: 10px;">
              <button type="button" class="btn secondary" (click)="showVendorSelectionModal = false">
                Cancel
              </button>
              <button
                type="button"
                class="btn"
                (click)="applyVendorModalSelection()"
                style="background: var(--role-accent); border-color: var(--role-accent);"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- ========================================================================= -->
    <!-- MODAL 5: VIEW ASSIGNED VENDORS MODAL                                     -->
    <!-- ========================================================================= -->
    @if (showViewAssignedModal && activeSourcingItem) {
      <div class="modal-backdrop" (click)="showViewAssignedModal = false">
        <div class="modal-window modal-sm" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h4>Assigned Vendors</h4>
              <span style="font-size: 12px; color: var(--muted);">
                Item: <strong>{{ activeSourcingItem.itemNo }}</strong> (Line {{ activeSourcingItem.sr }})
              </span>
            </div>
            <button type="button" class="modal-close" (click)="showViewAssignedModal = false">✕</button>
          </div>

          <div class="modal-table-wrap" style="padding: 0 16px;">
            <table class="modal-table">
              <thead>
                <tr>
                  <th>Vendor Code</th>
                  <th>Vendor Name</th>
                  <th style="width: 50px; text-align: center;">Action</th>
                </tr>
              </thead>
              <tbody>
                @for (v of getAssignedVendorsForItem(activeSourcingItem); track v.vendorId) {
                  <tr>
                    <td><strong class="vendor-tag">{{ v.vendorId }}</strong></td>
                    <td class="font-medium">{{ v.vendorName }}</td>
                    <td class="text-center">
                      <button
                        type="button"
                        class="btn-trash-row"
                        (click)="removeVendorFromItem(activeSourcingItem, v.vendorId)"
                        title="Remove Assignment"
                      >✕</button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="3" class="empty-state">No vendors assigned yet.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn secondary" (click)="showViewAssignedModal = false">Close</button>
          </div>
        </div>
      </div>
    }

    <!-- MODAL: REQUISITION LIFECYCLE AUDIT & ACTIVITY TIMELINE -->
    @if (showAuditModal) {
      <div class="modal-backdrop" (click)="showAuditModal = false">
        <div class="modal-window modal-lg" (click)="$event.stopPropagation()" style="max-width: 850px;">
          <div class="modal-header">
            <div>
              <h4 style="display: flex; align-items: center; gap: 8px;">
                <app-icon name="clock" [size]="18" />
                <span>Lifecycle History & Audit Trail (Req #{{ auditModalDocNo }})</span>
              </h4>
              <span style="font-size: 12px; color: var(--muted);">
                Tracking current stage, change logs, and vendor milestones from database
              </span>
            </div>
            <button type="button" class="modal-close" (click)="showAuditModal = false">✕</button>
          </div>

          <div style="padding: 12px 16px 0; border-bottom: 1px solid var(--line);">
            <div style="display: flex; gap: 8px;">
              <button
                type="button"
                class="btn small"
                [style.background]="auditModalTab === 'curact' ? 'var(--role-accent, #50ae9b)' : '#f1f5f9'"
                [style.color]="auditModalTab === 'curact' ? '#fff' : '#475569'"
                (click)="auditModalTab = 'curact'"
              >
                Current Workflow Stage ({{ auditCuractList.length }})
              </button>
              <button
                type="button"
                class="btn small"
                [style.background]="auditModalTab === 'log' ? 'var(--role-accent, #50ae9b)' : '#f1f5f9'"
                [style.color]="auditModalTab === 'log' ? '#fff' : '#475569'"
                (click)="auditModalTab = 'log'"
              >
                Change Log ({{ auditLogList.length }})
              </button>
              <button
                type="button"
                class="btn small"
                [style.background]="auditModalTab === 'vendor' ? 'var(--role-accent, #50ae9b)' : '#f1f5f9'"
                [style.color]="auditModalTab === 'vendor' ? '#fff' : '#475569'"
                (click)="auditModalTab = 'vendor'"
              >
                Vendor Milestones ({{ auditVendorCuractList.length }})
              </button>
            </div>
          </div>

          <div class="modal-table-wrap" style="padding: 16px; max-height: 400px; overflow-y: auto;">
            @if (auditModalTab === 'curact') {
              <table class="modal-table">
                <thead>
                  <tr>
                    <th>Req #</th>
                    <th>Current Action</th>
                    <th>User</th>
                    <th>Date</th>
                    <th>Final Status</th>
                  </tr>
                </thead>
                <tbody>
                  @for (c of auditCuractList; track $index) {
                    <tr>
                      <td><strong>{{ c.reQ_NO }}</strong></td>
                      <td><span class="tag-assigned">{{ c.currenT_ACTION || 'In Progress' }}</span></td>
                      <td>{{ c.auduser || 'System' }}</td>
                      <td class="date-cell">{{ c.auddate ? (c.auddate | slice:0:19) : '' }}</td>
                      <td>
                        @if (c.isfinal === 1) {
                          <span class="badge-status" style="background: #dcfce7; color: #166534;">Final</span>
                        } @else {
                          <span class="badge-status" style="background: #f1f5f9; color: #475569;">Active</span>
                        }
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="5" class="empty-state">No workflow stage entries recorded.</td></tr>
                  }
                </tbody>
              </table>
            }

            @if (auditModalTab === 'log') {
              <table class="modal-table">
                <thead>
                  <tr>
                    <th>#Line</th>
                    <th>Action</th>
                    <th>Stage</th>
                    <th>User</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  @for (l of auditLogList; track $index) {
                    <tr>
                      <td>Line {{ l.linenum || 1 }}</td>
                      <td><strong>Action {{ l.action }}</strong></td>
                      <td><span class="tag-assigned">{{ l.currentaction }}</span></td>
                      <td>{{ l.auduser || 'System' }}</td>
                      <td class="date-cell">{{ l.auddate ? (l.auddate | slice:0:19) : '' }}</td>
                    </tr>
                  } @empty {
                    <tr><td colspan="5" class="empty-state">No audit log entries recorded.</td></tr>
                  }
                </tbody>
              </table>
            }

            @if (auditModalTab === 'vendor') {
              <table class="modal-table">
                <thead>
                  <tr>
                    <th>Vendor ID</th>
                    <th>Vendor Name</th>
                    <th>Milestone</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  @for (vc of auditVendorCuractList; track $index) {
                    <tr>
                      <td><strong>{{ vc.vendoR_ID }}</strong></td>
                      <td>{{ vc.vendoR_NAME }}</td>
                      <td><span class="tag-assigned">{{ vc.currentaction || 'RFQ Notification' }}</span></td>
                      <td class="date-cell">{{ vc.auddate ? (vc.auddate | slice:0:19) : '' }}</td>
                    </tr>
                  } @empty {
                    <tr><td colspan="4" class="empty-state">No vendor milestone entries recorded.</td></tr>
                  }
                </tbody>
              </table>
            }
          </div>

          <div class="modal-footer">
            <button type="button" class="btn secondary" (click)="showAuditModal = false">Close</button>
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

    /* OPTION 6 PILL CAPSULE TABS */
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

    /* EDIT MODE BANNER */
    .edit-mode-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 18px;
      margin-bottom: 16px;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 8px;

      .banner-content {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13.5px;
        color: #92400e;
      }

      .edit-badge {
        background: #f59e0b;
        color: #ffffff;
        padding: 3px 9px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
      }
    }

    /* PANEL & TITLE STYLING */
    .panel-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 18px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--line, #e2e8f0);

      .panel-title-text {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;

        h2 {
          font-size: 15px;
          font-weight: 700;
          color: var(--text, #0f172a);
          margin: 0;
        }
      }

      .badge-status {
        font-size: 11.5px;
        font-weight: 600;
        padding: 3px 9px;
        border-radius: 9999px;
        background: var(--role-soft, #eff6ff);
        color: var(--role-accent, #2563eb);
        border: 1px solid var(--role-border, #bfdbfe);
      }
    }

    .form-body {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* FORM ROWS & COLUMNS */
    .form-row {
      display: flex;
      gap: 18px;
      align-items: flex-start;

      &.four-col .col { flex: 1; min-width: 0; }
      &.three-col .col { flex: 1; min-width: 0; }
      &.two-col .col { flex: 1; min-width: 0; }

      label {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: var(--text, #0f172a);
        margin-bottom: 6px;

        .required {
          color: #dc2626;
          font-weight: 700;
        }
      }
    }

    .form-control {
      width: 100%;
      height: 40px;
      padding: 6px 12px;
      font-size: 13.5px;
      color: var(--text, #0f172a);
      background: #ffffff;
      border: 1px solid var(--line-strong, #cbd5e1);
      border-radius: var(--radius-sm, 6px);
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;

      &:focus {
        border-color: var(--role-accent, #2563eb);
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
      }

      &.readonly-field {
        background: #f1f5f9;
        color: #475569;
        font-weight: 600;
        cursor: not-allowed;
      }

      &.textarea-field {
        height: auto;
        resize: vertical;
      }

      &.is-invalid {
        border-color: #dc2626 !important;
        background-color: #fff8f8;
      }
    }

    .input-with-actions {
      display: flex;
      align-items: stretch;
      width: 100%;

      input {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        border-right: none;
      }

      .btn-attached.refresh-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        min-width: 40px;
        border: 1px solid #16a34a;
        background: #16a34a;
        color: #ffffff;
        border-top-right-radius: var(--radius-sm, 6px);
        border-bottom-right-radius: var(--radius-sm, 6px);
        cursor: pointer;
        transition: background 0.15s ease;

        &:hover:not(:disabled) {
          background: #15803d;
          border-color: #15803d;
        }

        &:disabled {
          background: #94a3b8;
          border-color: #94a3b8;
          cursor: not-allowed;
        }
      }
    }

    .error-text {
      color: #dc2626;
      font-size: 12px;
      margin-top: 4px;
      display: block;
      font-weight: 500;
    }

    /* REQUISITION LIST TABLE */
    .table-responsive {
      overflow-x: auto;
      border: 1px solid var(--line, #e2e8f0);
      border-radius: var(--radius-sm, 6px);
      max-height: 480px;
      overflow-y: auto;
    }

    .req-table {
      width: 100%;
      min-width: 1650px;
      border-collapse: collapse;
      font-size: 13px;
      text-align: left;

      th {
        position: sticky;
        top: 0;
        z-index: 10;
        background: #f8fafc;
        color: var(--muted, #64748b);
        font-weight: 600;
        padding: 9px 12px;
        border-bottom: 2px solid var(--line, #e2e8f0);
        white-space: nowrap;

        .required {
          color: #dc2626;
          font-weight: 700;
        }
      }

      td {
        padding: 6px 8px;
        border-bottom: 1px solid var(--line, #e2e8f0);
        vertical-align: middle;
      }

      tr:hover td {
        background-color: #fcfdfe;
      }
    }

    .cell-control {
      width: 100%;
      height: 32px;
      padding: 4px 8px;
      font-size: 12.5px;
      color: var(--text, #0f172a);
      background: #ffffff;
      border: 1px solid var(--line, #e2e8f0);
      border-radius: 4px;
      box-sizing: border-box;
      outline: none;

      &:focus {
        border-color: var(--role-accent, #2563eb);
      }

      &.readonly {
        background: #f8fafc;
        color: #334155;
      }

      &.text-center { text-align: center; }
      &.text-right { text-align: right; }
    }

    .cell-input-group {
      display: flex;
      align-items: stretch;

      input {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        border-right: none;
      }

      .btn-cell-search {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0 8px;
        background: #f1f5f9;
        border: 1px solid var(--line, #e2e8f0);
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
        cursor: pointer;
        color: #475569;

        &:hover {
          background: #e2e8f0;
          color: var(--role-accent, #2563eb);
        }
      }
    }

    .btn-trash-row {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 13px;
      font-weight: bold;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;

      &:hover:not(:disabled) {
        color: #dc2626;
        background: #fee2e2;
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }

    .footer-meta {
      font-size: 13px;
      color: var(--muted, #64748b);
    }

    /* REQUISITIONS REGISTER TABLE */
    .table-search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #ffffff;
      border: 1px solid var(--line, #cbd5e1);
      border-radius: 6px;
      padding: 4px 10px;
      width: 280px;

      input {
        border: none;
        outline: none;
        font-size: 13px;
        width: 100%;
        background: transparent;
      }
    }

    .requests-table {
      width: 100%;
      min-width: 1200px;
      border-collapse: collapse;
      font-size: 13px;

      th {
        background: #f8fafc;
        color: var(--muted);
        font-weight: 600;
        padding: 10px 14px;
        border-bottom: 1px solid var(--line);
        text-align: left;
        white-space: nowrap;
      }

      td {
        padding: 10px 14px;
        border-bottom: 1px solid var(--line);
        vertical-align: middle;
      }

      .desc-cell {
        min-width: 250px;
        max-width: 360px;
        white-space: normal;
        word-break: break-word;
        line-height: 1.45;
      }

      .location-cell {
        min-width: 180px;
        white-space: nowrap;
        font-weight: 500;
      }

      tr.highlighted td {
        background: #eff6ff;
      }

      tr:hover td {
        background: #f8fafc;
      }
    }

    .badge-counter {
      background: #f1f5f9;
      color: #475569;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 11.5px;
      font-weight: 600;
    }

    .tag-assigned {
      background: #dcfce7;
      color: #15803d;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
    }

    .tag-unassigned {
      background: #fef3c7;
      color: #92400e;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
    }

    .table-btn-edit {
      border: 1px solid var(--line);
      background: #ffffff;
      color: var(--text);
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      font-weight: 600;
      margin-right: 6px;

      &:hover {
        background: #f1f5f9;
        border-color: #cbd5e1;
      }
    }

    .table-btn-source {
      background: var(--role-soft, #eff6ff);
      border: 1px solid var(--role-border, #bfdbfe);
      color: var(--role-accent, #2563eb);
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-right: 6px;

      &:hover {
        background: var(--role-accent, #2563eb);
        color: #ffffff;
      }
    }

    .table-btn-select {
      border: 1px solid var(--line);
      background: #ffffff;
      color: var(--text);
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      font-weight: 500;
      margin-right: 6px;

      &:hover {
        background: #f1f5f9;
      }
    }

    .table-btn-delete {
      border: 1px solid #fecaca;
      background: #fef2f2;
      color: #dc2626;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      font-weight: 500;

      &:hover {
        background: #dc2626;
        color: #ffffff;
      }
    }

    /* SOURCING TAB STYLING */
    .sourcing-overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 14px;
      padding: 12px 14px;
      background: #f8fafc;
      border-radius: 6px;
      border: 1px solid var(--line);

      .overview-item {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .overview-label {
        font-size: 11.5px;
        color: var(--muted);
        text-transform: uppercase;
        font-weight: 600;
      }

      .overview-val {
        font-size: 13.5px;
        color: var(--text);
      }
    }

    .sourcing-table {
      width: 100%;
      min-width: 1100px;
      border-collapse: collapse;
      font-size: 13px;

      th {
        background: #f8fafc;
        color: var(--muted);
        font-weight: 600;
        padding: 10px 14px;
        border-bottom: 2px solid var(--line);
        text-align: left;
        white-space: nowrap;
      }

      td {
        padding: 10px 14px;
        border-bottom: 1px solid var(--line);
        vertical-align: middle;
      }

      tr:hover td {
        background: #fafbfc;
      }
    }

    .vendor-chips-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
    }

    .vendor-chip {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 11.5px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--text);

      .chip-remove {
        background: none;
        border: none;
        cursor: pointer;
        color: #94a3b8;
        font-size: 11px;
        padding: 0;

        &:hover {
          color: #dc2626;
        }
      }
    }

    .empty-badge {
      font-size: 11px;
      color: #94a3b8;
      font-style: italic;
    }

    .sourcing-stats-bar {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 16px;

      .stat-box {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .stat-label {
        font-size: 11.5px;
        color: var(--muted);
        font-weight: 600;
        text-transform: uppercase;
      }

      .stat-number {
        font-size: 18px;
        font-weight: 700;
        color: var(--text);
      }
    }

    .approval-action-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      background: #ffffff;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 16px;

      .approval-note {
        flex: 1;
        min-width: 280px;

        p {
          margin: 0;
          font-size: 12.5px;
          color: #166534;
          line-height: 1.5;
        }
      }

      .approval-buttons {
        display: flex;
        gap: 10px;
        align-items: center;
      }
    }

    /* MODAL WINDOWS */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(2px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      box-sizing: border-box;
    }

    .modal-window {
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 680px;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      &.modal-sm {
        max-width: 520px;
      }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      border-bottom: 1px solid var(--line, #e2e8f0);

      h4 {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
        color: var(--text, #0f172a);
      }

      .modal-close {
        background: transparent;
        border: none;
        font-size: 16px;
        color: #94a3b8;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;

        &:hover {
          color: #0f172a;
          background: #f1f5f9;
        }
      }
    }

    .modal-search-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 20px;
      border-bottom: 1px solid var(--line, #e2e8f0);
      background: #f8fafc;

      input {
        width: 100%;
        border: none;
        background: transparent;
        font-size: 13.5px;
        outline: none;
        color: var(--text, #0f172a);
      }
    }

    .modal-table-wrap {
      overflow-y: auto;
      max-height: 380px;
    }

    .modal-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;

      th {
        position: sticky;
        top: 0;
        background: #f8fafc;
        color: var(--muted, #64748b);
        font-weight: 600;
        padding: 9px 14px;
        border-bottom: 1px solid var(--line, #e2e8f0);
        text-align: left;
      }

      td {
        padding: 9px 14px;
        border-bottom: 1px solid var(--line, #e2e8f0);
      }

      tr.clickable-row {
        cursor: pointer;

        &:hover td {
          background: #f1f5f9;
        }
      }

      tr.disabled-row td {
        opacity: 0.55;
        background: #f8fafc;
      }

      tr.selected-row td {
        background: #eff6ff;
      }
    }

    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      border-top: 1px solid var(--line, #e2e8f0);
      background: #fafbfc;

      .modal-hint {
        font-size: 12px;
        color: var(--muted, #64748b);
      }
    }

    .btn-pager-sm {
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 5px;
      border: 1px solid var(--border, #cbd5e1);
      background: white;
      cursor: pointer;
      color: var(--text, #1e293b);
      transition: all 0.15s ease;
      &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
      &:not(:disabled):hover {
        background: #f1f5f9;
        border-color: #94a3b8;
      }
    }

    .vendor-tag {
      font-family: monospace;
      color: var(--role-accent, #2563eb);
    }

    .font-bold { font-weight: 700; }
    .font-medium { font-weight: 500; }
    .text-center { text-align: center; }
    .empty-state {
      text-align: center;
      color: #94a3b8;
      padding: 24px;
    }
  `]
})
export class RequisitionComponent implements OnInit {
  protected readonly state = inject(PortalStateService);
  protected readonly vendorApi = inject(VendorApiService);
  protected readonly sageApi = inject(SageApiService);

  readonly role = this.state.role;
  readonly requisitionsList = this.state.requisitions;

  // Tabs state: 'entry' | 'register' | 'selection' | 'approval'
  activeTab: 'entry' | 'register' | 'selection' | 'approval' = 'entry';

  // Mode: creating new vs editing/correcting existing
  isEditMode = false;

  // Header model (mirroring REQHModel)
  header: RequisitionHeader = {
    documentNumber: '',
    requiredFor: 'Tender Bidding',
    enteredBy: 'Procurement Specialist',
    date: this.getTodayDate(),
    dateRequired: this.getFutureDate(21),
    shipVia: 'By Air',
    location: 'Dubai HQ - Main Warehouse',
    requestDescription: '',
    comments: '',
    status: 'Draft'
  };

  headerErrors = {
    requiredFor: false,
    requestDescription: false
  };

  // Line items (mirroring REQDModel)
  items: RequisitionLineItem[] = [];

  // Sage IC Locations
  locations: string[] = [
    'Dubai HQ - Main Warehouse',
    'Abu Dhabi Logistics Hub',
    'Sharjah Depot Plant 3',
    'Jebel Ali Free Zone Store',
    'Ras Al Khaimah Depot'
  ];

  // 11 Legacy Incoterms
  readonly incoTerms = [
    'EXW - Ex Works',
    'FCA - Free Carrier',
    'FAS - Free Alongside Ship',
    'FOB - Free on Board',
    'CFR - Cost and Freight',
    'CIF - Cost Insurance and Freight',
    'CPT - Carriage Paid to',
    'CIP - Carriage and Insurance Paid To',
    'DAP - Delivered at Place',
    'DPU - Delivered at Place Unloaded',
    'DDP - Delivered Duty Paid'
  ];

  shipViaOptions: string[] = [
    'By Air',
    'By Sea',
    'By Cargo',
    'By Land',
    'Courier',
    'Vendor Delivery'
  ];

  // 28 Legacy Countries
  readonly countries = [
    'United Arab Emirates',
    'Saudi Arabia',
    'Oman',
    'Kuwait',
    'Bahrain',
    'Qatar',
    'United States',
    'United Kingdom',
    'Germany',
    'France',
    'Italy',
    'Japan',
    'China',
    'India',
    'South Korea',
    'Canada',
    'Australia',
    'Singapore',
    'Malaysia',
    'Turkey',
    'Spain',
    'Netherlands',
    'Sweden',
    'Switzerland',
    'Brazil',
    'Mexico',
    'Taiwan',
    'Egypt'
  ];

  // Sage Item Master database
  readonly sageItems = signal<SageItem[]>([]);
  isLoadingSageItems = false;
  sageItemPage = 1;
  sageItemTotalPages = 1;
  sageItemTotalCount = 0;

  // Brand database
  brands: BrandItem[] = [];

  // Modals state
  showItemModal = false;
  itemSearchQuery = '';

  showBrandModal = false;
  brandSearchQuery = '';

  showVendorSelectionModal = false;
  showViewAssignedModal = false;

  showAuditModal = false;
  auditModalDocNo = '';
  auditModalTab: 'curact' | 'log' | 'vendor' = 'curact';
  auditCuractList: any[] = [];
  auditLogList: any[] = [];
  auditVendorCuractList: any[] = [];

  activeRowIndex = 0;
  activeSourcingItem: RequisitionLineItem | null = null;
  isBatchVendorSelection = false;
  selectedVendorMap: { [vendorId: string]: boolean } = {};

  // Tab 3 Sourcing Requisition
  sourcingRequisition: Requisition | null = null;

  // History search query
  historySearch = '';

  ngOnInit(): void {
    if (this.requisitionsList().length > 0) {
      this.sourcingRequisition = this.requisitionsList()[0];
    }
    this.loadBackendRequisitions();
    this.loadBackendBrands();
    this.loadShipViaOptions();
    this.loadSageItems();
    this.loadSageVendors();
    this.loadSageLocations();
  }

  loadShipViaOptions(): void {
    this.vendorApi.getShipViaList().subscribe(res => {
      const list = res?.shipviaList || res?.shipviA_List || res?.data || (Array.isArray(res) ? res : []);
      if (Array.isArray(list) && list.length > 0) {
        const mapped = list.map((s: any) => s.shipviA_NAME || s.shipvia || s.name || String(s)).filter(Boolean);
        if (mapped.length > 0) {
          this.shipViaOptions = mapped;
          if (!this.header.shipVia && this.shipViaOptions.length > 0) {
            this.header.shipVia = this.shipViaOptions[0];
          }
        }
      }
    });
  }

  loadSageLocations(): void {
    this.sageApi.getLocations().subscribe(list => {
      if (Array.isArray(list) && list.length > 0) {
        const liveLocs = list.map(l => `${l.LocationKey} - ${l.Name}`);
        this.locations = liveLocs;
        if (!this.header.location && liveLocs.length > 0) {
          this.header.location = liveLocs[0];
        }
      }
    });
  }

  loadSageVendors(): void {
    this.sageApi.getVendors().subscribe(list => {
      if (Array.isArray(list) && list.length > 0) {
        for (const sv of list) {
          this.state.saveMasterVendor({
            vendorId: sv.VendorNumber,
            vendorName: sv.VendorName || sv.ShortName || sv.VendorNumber,
            shortName: sv.ShortName || '',
            vendorGroup: sv.GroupCode || 'General',
            status: sv.Status === 'Active' ? 'Active' : 'Inactive',
            country: sv.Country || 'United States',
            city: sv.City || '',
            stateProvince: sv.StateProvince || '',
            address: sv.AddressLine1 || '',
            contact: sv.PhoneNumber1 || '',
            telephone: sv.PhoneNumber1 || '',
            email: sv.Email || '',
            terms: 'Net 30 Days',
            website: '',
            contactName: sv.ShortName || '',
            bankCode: '',
            taxRegistrationCode: '',
            startDate: '',
            inactiveDate: ''
          });
        }
      }
    });
  }

  loadSageItems(page = 1): void {
    this.isLoadingSageItems = true;
    this.sageItemPage = page;
    this.sageApi.getItemsPage(page, 25, this.itemSearchQuery).subscribe({
      next: res => {
        this.isLoadingSageItems = false;
        this.sageItemTotalCount = res.total;
        this.sageItemTotalPages = res.totalPages;
        this.sageItemPage = res.page;
        if (res.items && res.items.length > 0) {
          this.sageItems.set(res.items.map(item => ({
            itemNumber: item.ItemNumber,
            description: item.Description,
            uom: item.StockingUnitOfMeasure || 'EA'
          })));
        } else {
          this.sageItems.set([]);
        }
      },
      error: () => {
        this.isLoadingSageItems = false;
      }
    });
  }

  nextSageItemPage(): void {
    if (this.sageItemPage < this.sageItemTotalPages) {
      this.loadSageItems(this.sageItemPage + 1);
    }
  }

  prevSageItemPage(): void {
    if (this.sageItemPage > 1) {
      this.loadSageItems(this.sageItemPage - 1);
    }
  }

  loadBackendBrands(): void {
    this.vendorApi.getBrands().subscribe(res => {
      const list = res?.data || (Array.isArray(res) ? res : []);
      if (Array.isArray(list) && list.length > 0) {
        const brandItems: BrandItem[] = list.map((b: any) => ({
          id: String(b.brandid || b.id || b.branD_ID || ''),
          name: String(b.brandname || b.name || b.branD_NAME || '')
        })).filter(b => b.name);
        if (brandItems.length > 0) {
          const existingNames = new Set(this.brands.map(b => b.name.toLowerCase()));
          for (const bi of brandItems) {
            if (!existingNames.has(bi.name.toLowerCase())) {
              this.brands.push(bi);
              existingNames.add(bi.name.toLowerCase());
            }
          }
        }
      }
    });
  }

  loadBackendRequisitions(): void {
    this.vendorApi.getRequestHeaders().subscribe(res => {
      console.log('Requisition Headers API response:', res);
      const list = res?.reqh_List
        || res?.reqH_List
        || res?.reQH_List
        || res?.reqhList
        || res?.reqHList
        || res?.requestHeader_List
        || res?.data
        || (Array.isArray(res) ? res : null);

      if (Array.isArray(list) && list.length > 0) {
        for (const h of list) {
          const reqNo = h.reQ_NO || h.reqno || h.reQ_No || '';
          if (!reqNo) continue;
          this.vendorApi.getRequestDetails(reqNo).subscribe(dRes => {
            console.log(`Requisition Details API response for ${reqNo}:`, dRes);
            const dList = dRes?.reqd_List
              || dRes?.reqD_List
              || dRes?.reQD_List
              || dRes?.reqdList
              || dRes?.reqDList
              || dRes?.requestDetail_List
              || dRes?.data
              || (Array.isArray(dRes) ? dRes : []);

            const mappedItems: RequisitionLineItem[] = Array.isArray(dList) && dList.length > 0
              ? dList.map((d: any, idx: number) => ({
                  sr: d.linenum || d.lineNum || idx + 1,
                  lineNum: d.linenum || d.lineNum || idx + 1,
                  itemNo: d.itemno || d.itemNo || '',
                  itemDesc: d.itemdesc || d.itemDesc || '',
                  uom: d.uom || 'EA',
                  quantity: Number(d.qty || d.quantity) || 1,
                  location: d.loc || h.loc || 'Dubai HQ - Main Warehouse',
                  projectId: String(d.project || ''),
                  incoTerm: d.incoterm || 'FCA - Free Carrier',
                  shipVia: d.shipvia || h.shipvia || 'By Air',
                  brand: d.brand || '',
                  country: d.mcountry || 'United Arab Emirates',
                  dateRequired: d.requiR_DATE ? String(d.requiR_DATE).substring(0, 10) : (h.requirE_DATE ? String(h.requirE_DATE).substring(0, 10) : ''),
                  comments: d.comments || ''
                }))
              : [];

            const existing = this.requisitionsList().find(r => r.header.documentNumber === reqNo);
            const saved = this.state.saveRequisition({
              header: {
                documentNumber: reqNo,
                requiredFor: h.reQ_FOR || h.reqfor || h.requiredFor || (existing?.header.requiredFor || 'Tender Bidding'),
                enteredBy: h.reQ_ENTER_BY || h.enterby || h.enteredBy || (existing?.header.enteredBy || 'Procurement Specialist'),
                date: h.reQ_DATE ? String(h.reQ_DATE).substring(0, 10) : (h.reqdate ? String(h.reqdate).substring(0, 10) : (existing?.header.date || new Date().toISOString().substring(0, 10))),
                dateRequired: h.requirE_DATE ? String(h.requirE_DATE).substring(0, 10) : (h.requiredate ? String(h.requiredate).substring(0, 10) : (existing?.header.dateRequired || '')),
                shipVia: h.shipvia || h.shipVia || (existing?.header.shipVia || 'By Air'),
                location: h.loc || h.location || (existing?.header.location || 'Dubai HQ - Main Warehouse'),
                requestDescription: h.reQ_DESC || h.reqdesc || h.requestDescription || (existing?.header.requestDescription || ''),
                comments: h.comments || (existing?.header.comments || ''),
                status: (h.action === 1 ? 'Approved' : (existing?.header.status || 'Submitted')) as any
              },
              items: mappedItems.length > 0 ? mappedItems : (existing?.items || []),
              assignedVendors: existing?.assignedVendors
            }, false);

            if (!this.sourcingRequisition && saved) {
              this.sourcingRequisition = saved;
            }

            // Load assigned vendors from backend DB via GetREVITEMSList
            this.vendorApi.getREVITEMSList(reqNo).subscribe(revList => {
              if (Array.isArray(revList) && revList.length > 0) {
                const mappedVendors: RequisitionAssignedVendor[] = revList.map((r: any) => ({
                  itemId: r.itemno || r.iteM_NO || '',
                  itemDesc: r.itemdesc || r.iteM_DESC || '',
                  lineNum: r.linenum || 1,
                  vendorId: r.vendoR_ID || r.vendorid || '',
                  vendorName: r.vendoR_NAME || r.vendorname || ''
                }));
                this.state.assignVendorsToRequisition(reqNo, mappedVendors);
                if (this.sourcingRequisition && this.sourcingRequisition.header.documentNumber === reqNo) {
                  this.sourcingRequisition.assignedVendors = mappedVendors;
                }
              }
            });
          });
        }
      }
    });
  }

  // Option 6 Pill Navigation
  switchTab(tab: 'entry' | 'register' | 'selection' | 'approval'): void {
    this.activeTab = tab;
    if ((tab === 'selection' || tab === 'approval') && !this.sourcingRequisition && this.requisitionsList().length > 0) {
      this.sourcingRequisition = this.requisitionsList()[0];
    }
  }

  // Computeds
  readonly totalQuantity = computed(() => {
    return this.items.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
  });

  readonly pendingSelectionCount = computed(() => {
    return this.requisitionsList().filter(r =>
      !r.header.status || r.header.status === 'Draft' || r.header.status === 'Submitted'
    ).length;
  });

  readonly pendingApprovalCount = computed(() => {
    return this.requisitionsList().filter(r =>
      r.header.status === 'Vendors Assigned'
    ).length;
  });

  readonly filteredSageItems = computed(() => {
    const items = this.sageItems();
    const q = this.itemSearchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(i =>
      i.itemNumber.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q)
    );
  });

  readonly filteredBrands = computed(() => {
    const q = this.brandSearchQuery.trim().toLowerCase();
    if (!q) return this.brands;
    return this.brands.filter(b =>
      b.id.toLowerCase().includes(q) ||
      b.name.toLowerCase().includes(q)
    );
  });

  readonly filteredRequisitions = computed(() => {
    const q = this.historySearch.trim().toLowerCase();
    if (!q) return this.requisitionsList();
    return this.requisitionsList().filter(r =>
      r.header.documentNumber.toLowerCase().includes(q) ||
      r.header.requiredFor.toLowerCase().includes(q) ||
      r.header.requestDescription.toLowerCase().includes(q) ||
      r.header.location.toLowerCase().includes(q) ||
      (r.header.status || '').toLowerCase().includes(q)
    );
  });

  // Table row management
  addRow(): void {
    const lastRow = this.items[this.items.length - 1];
    if (lastRow && (!lastRow.itemNo || !lastRow.quantity)) {
      this.state.notify('Please select an item and quantity in the current row before adding another.');
      return;
    }

    const nextSr = this.items.length + 1;
    this.items.push({
      sr: nextSr,
      itemNo: '',
      itemDesc: '',
      uom: '',
      quantity: 1,
      location: this.header.location,
      projectId: '',
      incoTerm: 'FCA - Free Carrier',
      shipVia: this.header.shipVia,
      brand: '',
      country: 'United Arab Emirates',
      dateRequired: this.header.dateRequired,
      comments: ''
    });
  }

  removeRow(index: number): void {
    if (this.items.length <= 1) {
      this.state.notify('At least one line item is required.');
      return;
    }
    const itemToRemove = this.items[index];
    if (this.isEditMode && itemToRemove?.itemNo && this.header.documentNumber) {
      this.vendorApi.deleteRequestDetail(this.header.documentNumber, itemToRemove.lineNum || itemToRemove.sr).subscribe({
        next: () => {},
        error: (err) => console.warn('deleteRequestDetail error:', err)
      });
    }
    this.items.splice(index, 1);
    this.items.forEach((row, i) => {
      row.sr = i + 1;
    });
  }

  // Header cascade changes
  onHeaderLocationChange(): void {
    const loc = this.header.location;
    for (const item of this.items) {
      if (!item.location || item.location === '--Select--') {
        item.location = loc;
      }
    }
  }

  onHeaderShipViaChange(): void {
    const ship = this.header.shipVia;
    for (const item of this.items) {
      if (!item.shipVia) {
        item.shipVia = ship;
      }
    }
  }

  onHeaderDateRequiredChange(): void {
    const d = this.header.dateRequired;
    for (const item of this.items) {
      if (!item.dateRequired) {
        item.dateRequired = d;
      }
    }
  }

  // Lookup Modals
  openItemModal(index: number): void {
    this.activeRowIndex = index;
    this.itemSearchQuery = '';
    this.showItemModal = true;
    if (this.sageItems().length === 0) {
      this.loadSageItems(1);
    }
  }

  selectItem(item: SageItem): void {
    if (this.items[this.activeRowIndex]) {
      this.items[this.activeRowIndex].itemNo = item.itemNumber;
      this.items[this.activeRowIndex].itemDesc = item.description;
      this.items[this.activeRowIndex].uom = item.uom;
    }
    this.showItemModal = false;
    this.state.notify(`Item selected: ${item.itemNumber} - ${item.description}`);
  }

  openBrandModal(index: number): void {
    this.activeRowIndex = index;
    this.brandSearchQuery = '';
    this.showBrandModal = true;
  }

  selectBrand(brand: BrandItem): void {
    if (this.items[this.activeRowIndex]) {
      this.items[this.activeRowIndex].brand = brand.name;
    }
    this.showBrandModal = false;
  }

  // Save / Update Requisition
  saveRequisition(): void {
    this.headerErrors.requiredFor = !this.header.requiredFor;
    this.headerErrors.requestDescription = !this.header.requestDescription.trim();

    if (this.headerErrors.requiredFor || this.headerErrors.requestDescription) {
      this.state.notify('Validation Error: Please fill in all required header fields (*).');
      return;
    }

    const validItems = this.items.filter(i => i.itemNo && Number(i.quantity) > 0);
    if (validItems.length === 0) {
      this.state.notify('Validation Error: At least one item with valid Item No and Quantity is required.');
      return;
    }

    const statusToSet = this.isEditMode ? (this.header.status || 'Submitted') : 'Submitted';

    const saved = this.state.saveRequisition({
      header: {
        ...this.header,
        status: statusToSet
      },
      items: [...this.items]
    });

    this.header.documentNumber = saved.header.documentNumber;
    this.header.status = statusToSet;
    this.sourcingRequisition = saved;
    this.state.notify(
      this.isEditMode
        ? `Requisition ${saved.header.documentNumber} updated successfully!`
        : `Requisition ${saved.header.documentNumber} saved and submitted!`
    );

    // Sync Header with Backend Request Controller (AUDRequestHeader)
    const headerPayload: Partial<REQHModel> = {
      reQ_NO: this.header.documentNumber,
      reQ_FOR: this.header.requiredFor,
      reQ_ENTER_BY: this.header.enteredBy || 'Procurement Specialist',
      reQ_DATE: this.header.date ? new Date(this.header.date).toISOString() : new Date().toISOString(),
      requirE_DATE: this.header.dateRequired ? new Date(this.header.dateRequired).toISOString() : new Date().toISOString(),
      loc: this.header.location,
      shipvia: this.header.shipVia,
      reQ_DESC: this.header.requestDescription,
      comments: this.header.comments || '',
      action: statusToSet === 'Approved' ? 1 : 0
    };

    const headerOp = this.isEditMode ? 3 : 2;
    this.vendorApi.saveRequestHeader(headerPayload, headerOp).subscribe({
      next: (res) => {
        console.log('AUDRequestHeader response:', res);
      },
      error: (err) => console.warn('AUDRequestHeader error:', err)
    });

    // Sync Details with Backend Request Controller (AUDRequestDetail)
    validItems.forEach((item, index) => {
      const itemPayload: Partial<REQDModel> = {
        reQ_NO: this.header.documentNumber,
        linenum: item.lineNum || item.sr || (index + 1),
        itemno: item.itemNo,
        itemdesc: item.itemDesc,
        uom: item.uom || 'EA',
        qty: Number(item.quantity) || 1,
        project: item.projectId ? Number(item.projectId) : null,
        loc: item.location || this.header.location,
        incoterm: item.incoTerm,
        shipvia: item.shipVia || this.header.shipVia,
        requiR_DATE: item.dateRequired ? new Date(item.dateRequired).toISOString() : new Date().toISOString(),
        comments: item.comments || '',
        brand: item.brand || '',
        mcountry: item.country || ''
      };
      const detailOp = this.isEditMode ? 3 : 2;
      this.vendorApi.saveRequestDetail(itemPayload, detailOp).subscribe({
        next: (dRes) => console.log('AUDRequestDetail response:', dRes),
        error: (dErr) => console.warn('AUDRequestDetail error:', dErr)
      });
    });
  }

  proceedToSourcing(): void {
    this.saveRequisition();
    this.activeTab = 'selection';
  }

  startNewRequisition(): void {
    this.isEditMode = false;
    const nextNum = this.requisitionsList().length + 1;
    this.header = {
      documentNumber: `REQ-2024-${String(nextNum).padStart(3, '0')}`,
      requiredFor: 'Tender Bidding',
      enteredBy: 'Procurement Specialist',
      date: this.getTodayDate(),
      dateRequired: this.getFutureDate(21),
      shipVia: 'By Air',
      location: 'Dubai HQ - Main Warehouse',
      requestDescription: '',
      comments: '',
      status: 'Draft'
    };
    this.items = [
      {
        sr: 1,
        itemNo: '',
        itemDesc: '',
        uom: '',
        quantity: 1,
        location: this.header.location,
        projectId: '',
        incoTerm: 'FCA - Free Carrier',
        shipVia: this.header.shipVia,
        brand: '',
        country: 'United Arab Emirates',
        dateRequired: this.header.dateRequired,
        comments: ''
      }
    ];
    this.headerErrors = {
      requiredFor: false,
      requestDescription: false
    };
    this.activeTab = 'entry';
  }

  editRequisition(req: Requisition): void {
    this.isEditMode = true;
    this.header = JSON.parse(JSON.stringify(req.header));
    this.items = JSON.parse(JSON.stringify(req.items));
    this.activeTab = 'entry';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.state.notify(`Loaded ${req.header.documentNumber} into Item Correction & Edit Mode.`);
  }

  deleteRequisition(docNo: string): void {
    if (confirm(`Are you sure you want to delete requisition ${docNo}?`)) {
      this.vendorApi.deleteRequestHeader(docNo).subscribe({
        next: (res) => console.log('Requisition deleted from backend:', res),
        error: (err) => console.warn('deleteRequestHeader error:', err)
      });
      this.state.deleteRequisition(docNo);
      if (this.sourcingRequisition?.header.documentNumber === docNo) {
        this.sourcingRequisition = this.requisitionsList()[0] || null;
      }
    }
  }

  generateNewDocNumber(): void {
    if (this.isEditMode) return;
    const nextNum = this.requisitionsList().length + 1;
    this.header.documentNumber = `REQ-2024-${String(nextNum).padStart(3, '0')}`;
    this.state.notify(`Document Number generated: ${this.header.documentNumber}`);
  }

  goToSelectionForReq(req: Requisition): void {
    this.sourcingRequisition = req;
    this.activeTab = 'selection';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToApprovalForReq(req: Requisition): void {
    this.sourcingRequisition = req;
    this.activeTab = 'approval';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSourcingReqSelected(docNo: string): void {
    const found = this.requisitionsList().find(r => r.header.documentNumber === docNo);
    if (found) {
      this.sourcingRequisition = found;
    }
  }

  // Sourcing & Vendor Assignment Helpers
  getAssignedVendorsForItem(item: RequisitionLineItem): RequisitionAssignedVendor[] {
    if (!this.sourcingRequisition?.assignedVendors) return [];
    const itemNo = item.itemNo;
    const sr = item.sr;
    return this.sourcingRequisition.assignedVendors.filter(
      a => (a.itemId === itemNo) || (a.lineNum === sr)
    );
  }

  getAssignedVendorCount(req: Requisition): number {
    return (req.assignedVendors || []).length;
  }

  getLinesWithVendorsCount(): number {
    if (!this.sourcingRequisition) return 0;
    let count = 0;
    for (const item of this.sourcingRequisition.items) {
      if (this.getAssignedVendorsForItem(item).length > 0) {
        count++;
      }
    }
    return count;
  }

  getUniqueAssignedVendorsCount(): number {
    if (!this.sourcingRequisition?.assignedVendors) return 0;
    const ids = new Set(this.sourcingRequisition.assignedVendors.map(a => a.vendorId));
    return ids.size;
  }

  openLineVendorSelectionModal(item: RequisitionLineItem): void {
    this.isBatchVendorSelection = false;
    this.activeSourcingItem = item;
    this.selectedVendorMap = {};

    // Pre-populate currently assigned vendors
    const assigned = this.getAssignedVendorsForItem(item);
    for (const a of assigned) {
      this.selectedVendorMap[a.vendorId] = true;
    }
    this.showVendorSelectionModal = true;
  }

  openBatchVendorSelectionModal(): void {
    this.isBatchVendorSelection = true;
    this.activeSourcingItem = null;
    this.selectedVendorMap = {};

    // Pre-select all fully approved vendors by default for convenience
    const approved = this.state.approvedVendors();
    for (const v of approved) {
      this.selectedVendorMap[v.id] = true;
    }
    this.showVendorSelectionModal = true;
  }

  openViewAssignedModal(item: RequisitionLineItem): void {
    this.activeSourcingItem = item;
    this.showViewAssignedModal = true;
  }

  toggleVendorInModal(vendorId: string): void {
    const v = this.state.vendors().find(item => item.id === vendorId);
    if (!v || v.procurementStatus !== 'Approved' || v.financeStatus !== 'Approved') {
      this.state.notify(`Cannot select ${v?.name || vendorId}: Vendor must be approved by both Procurement and Finance.`);
      return;
    }
    this.selectedVendorMap[vendorId] = !this.selectedVendorMap[vendorId];
  }

  selectAllApprovedVendorsInModal(): void {
    const approved = this.state.approvedVendors();
    for (const v of approved) {
      this.selectedVendorMap[v.id] = true;
    }
  }

  getModalSelectedVendorCount(): number {
    return Object.keys(this.selectedVendorMap).filter(id => this.selectedVendorMap[id]).length;
  }

  applyVendorModalSelection(): void {
    if (!this.sourcingRequisition) return;

    const selectedVendorIds = Object.keys(this.selectedVendorMap).filter(id => this.selectedVendorMap[id]);
    const allVendors = this.state.vendors();

    let currentAssignments: RequisitionAssignedVendor[] = [
      ...(this.sourcingRequisition.assignedVendors || [])
    ];

    if (this.isBatchVendorSelection) {
      // Assign selected vendors to EVERY line item in the requisition
      const newAssignments: RequisitionAssignedVendor[] = [];
      for (const item of this.sourcingRequisition.items) {
        for (const vId of selectedVendorIds) {
          const v = allVendors.find(vendor => vendor.id === vId);
          newAssignments.push({
            itemId: item.itemNo,
            itemDesc: item.itemDesc,
            lineNum: item.sr,
            vendorId: vId,
            vendorName: v ? v.name : vId
          });
        }
      }
      currentAssignments = newAssignments;
      this.state.notify(`Batch assigned ${selectedVendorIds.length} approved vendor(s) across all ${this.sourcingRequisition.items.length} line items.`);
    } else if (this.activeSourcingItem) {
      // Assign selected vendors to this specific line item only
      const targetItem = this.activeSourcingItem;
      // Remove previous assignments for this item
      currentAssignments = currentAssignments.filter(
        a => a.itemId !== targetItem.itemNo && a.lineNum !== targetItem.sr
      );
      // Add selected
      for (const vId of selectedVendorIds) {
        const v = allVendors.find(vendor => vendor.id === vId);
        currentAssignments.push({
          itemId: targetItem.itemNo,
          itemDesc: targetItem.itemDesc,
          lineNum: targetItem.sr,
          vendorId: vId,
          vendorName: v ? v.name : vId
        });
      }
      this.state.notify(`Assigned ${selectedVendorIds.length} vendor(s) to Line ${targetItem.sr} (${targetItem.itemNo}).`);
    }

    this.sourcingRequisition.assignedVendors = currentAssignments;
    this.showVendorSelectionModal = false;
    this.saveCurrentAssignments();
  }

  removeVendorFromItem(item: RequisitionLineItem, vendorId: string): void {
    if (!this.sourcingRequisition?.assignedVendors) return;
    const docNo = this.sourcingRequisition.header.documentNumber;
    this.sourcingRequisition.assignedVendors = this.sourcingRequisition.assignedVendors.filter(
      a => !( (a.itemId === item.itemNo || a.lineNum === item.sr) && a.vendorId === vendorId )
    );

    // Persist deletion to Database: /api/Request/AUDVendorItems (coperation: 3)
    this.vendorApi.saveVendorItems({
      coperation: 3,
      reQ_NO: docNo,
      linenum: item.sr,
      vendoR_ID: vendorId,
      itemno: item.itemNo
    }, 3).subscribe({
      next: (res) => console.log('AUDVendorItems deleted from DB:', res),
      error: (err) => console.warn('AUDVendorItems delete error:', err)
    });

    this.state.notify(`Removed vendor assignment from Line ${item.sr}.`);
  }

  saveCurrentAssignments(): void {
    if (!this.sourcingRequisition) return;
    const docNo = this.sourcingRequisition.header.documentNumber;
    const assignments = this.sourcingRequisition.assignedVendors || [];
    this.state.assignVendorsToRequisition(docNo, assignments);

    // Persist assignments to Database: /api/Request/AUDVendorItems (coperation: 2)
    for (const a of assignments) {
      this.vendorApi.saveVendorItems({
        coperation: 2,
        reQ_NO: docNo,
        linenum: a.lineNum,
        vendoR_ID: a.vendorId,
        vendoR_NAME: a.vendorName,
        itemno: a.itemId,
        itemdesc: a.itemDesc,
        qty: 1,
        action: 2
      }).subscribe({
        next: (res) => console.log('AUDVendorItems saved to DB:', res),
        error: (err) => console.warn('AUDVendorItems save error:', err)
      });
    }
  }

  submitSourcingForApproval(): void {
    if (!this.sourcingRequisition) return;
    const docNo = this.sourcingRequisition.header.documentNumber;

    if (this.getUniqueAssignedVendorsCount() === 0) {
      this.state.notify('Error: Please assign at least one vendor before submitting for manager approval.');
      return;
    }

    const assignments = this.sourcingRequisition.assignedVendors || [];
    this.state.assignVendorsToRequisition(docNo, assignments);

    // Audit logs to DB: AUDRequestCuract & AUDRequestLog
    this.vendorApi.saveRequestCuract({
      reQ_NO: docNo,
      action: 2,
      currenT_ACTION: 'Vendors Assigned',
      auduser: 'ADMIN'
    }).subscribe();

    this.vendorApi.saveRequestLog({
      reQ_NO: docNo,
      linenum: 1,
      action: 2,
      currentaction: 'Vendors Assigned'
    }).subscribe();

    this.state.notify(`Sourcing plan for ${docNo} submitted to Procurement Manager for sign-off!`);
  }

  rejectCurrentSourcing(): void {
    if (!this.sourcingRequisition) return;
    const docNo = this.sourcingRequisition.header.documentNumber;
    this.vendorApi.saveRequestHeader({
      reQ_NO: docNo,
      action: 0
    }, 3).subscribe({
      next: (res) => console.log('Requisition status updated to Draft/Rejected in backend:', res),
      error: (err) => console.warn('AUDRequestHeader reject error:', err)
    });

    // Audit logs to DB: AUDRequestCuract & AUDRequestLog
    this.vendorApi.saveRequestCuract({
      reQ_NO: docNo,
      action: 3,
      currenT_ACTION: 'Rejected',
      auduser: 'ADMIN'
    }).subscribe();

    this.vendorApi.saveRequestLog({
      reQ_NO: docNo,
      linenum: 1,
      action: 3,
      currentaction: 'Sourcing Rejected'
    }).subscribe();

    this.state.rejectRequisitionSourcing(docNo);
    const updated = this.requisitionsList().find(r => r.header.documentNumber === docNo);
    if (updated) {
      this.sourcingRequisition = updated;
    }
  }

  approveAndDispatchSourcing(): void {
    if (!this.sourcingRequisition) return;
    const docNo = this.sourcingRequisition.header.documentNumber;

    if (this.getUniqueAssignedVendorsCount() === 0) {
      this.state.notify('Error: You must assign at least one approved vendor before granting manager authorization.');
      return;
    }

    // Save assignments first
    const assignments = this.sourcingRequisition.assignedVendors || [];
    this.state.assignVendorsToRequisition(docNo, assignments);

    // Call Manager Approval and RFQ Dispatch
    this.state.approveRequisitionSourcing(docNo);

    // Sync status to backend
    this.vendorApi.saveRequestHeader({
      reQ_NO: docNo,
      action: 1
    }, 3).subscribe({
      next: (res) => console.log('Requisition approved in backend:', res),
      error: (err) => console.warn('AUDRequestHeader approval error:', err)
    });

    // Audit logs to DB: AUDRequestCuract, AUDRequestLog, AUDVendorCuractItems
    this.vendorApi.saveRequestCuract({
      reQ_NO: docNo,
      action: 4,
      currenT_ACTION: 'Vendor Approval',
      isfinal: 1,
      auduser: 'ADMIN'
    }).subscribe();

    this.vendorApi.saveRequestLog({
      reQ_NO: docNo,
      linenum: 1,
      action: 4,
      currentaction: 'Approved & Dispatched'
    }).subscribe();

    for (const a of assignments) {
      this.vendorApi.saveVendorCuractItems({
        reQ_NO: docNo,
        vendoR_ID: a.vendorId,
        vendoR_NAME: a.vendorName,
        action: 1,
        currentaction: 'RFQ Dispatched'
      }).subscribe();
    }

    // Refresh local copy
    const updated = this.requisitionsList().find(r => r.header.documentNumber === docNo);
    if (updated) {
      this.sourcingRequisition = updated;
    }
  }

  openAuditHistoryModal(docNo: string): void {
    this.auditModalDocNo = docNo;
    this.auditModalTab = 'curact';
    this.showAuditModal = true;
    this.auditCuractList = [];
    this.auditLogList = [];
    this.auditVendorCuractList = [];

    // 1. Fetch Current Action / Stage: POST /api/Request/GetRequestCuractList
    this.vendorApi.getRequestCuractList(docNo).subscribe(res => {
      this.auditCuractList = Array.isArray(res) ? res : (res?.reqcuracT_List || res?.reqcuracT_Details || []);
    });

    // 2. Fetch Change Log: POST /api/Request/GetRequestLogList
    this.vendorApi.getRequestLogList(docNo).subscribe(res => {
      this.auditLogList = Array.isArray(res) ? res : (res?.reqlogList || res?.reqlogDetails || []);
    });

    // 3. Fetch Vendor Milestones: POST /api/Request/GetVendorCuractList
    this.vendorApi.getVendorCuractList(docNo).subscribe(res => {
      this.auditVendorCuractList = Array.isArray(res) ? res : (res?.revcuracT_List || res?.revcuracT_Details || []);
    });
  }

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getFutureDate(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }
}
