import { Component, OnInit, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PortalStateService } from '../core/portal-state.service';
import { VendorApiService } from '../core/vendor-api.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';
import { IconComponent } from '../shared/icon.component';
import { MasterVendor, VendorRegistrationReq } from '../core/models';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent, StatusComponent, IconComponent],
  template: `
    <app-page-heading
      eyebrow="Vendors Control"
      title="Vendors Control Hub"
      subtitle="Manage master vendor profiles, SAGE ERP details, contact persons, compliance documents, and vendor onboarding invitations."
    />

    <!-- Option 6 Pill Capsule Tabs Navigation (Vendor Master vs Onboarding) -->
    <div class="profile-tabs">
      <button
        type="button"
        [class.active]="activeTab === 'master'"
        (click)="switchTab('master')"
      >
        <span>Vendor Master</span>
      </button>
      <button
        type="button"
        [class.active]="activeTab === 'onboarding'"
        (click)="switchTab('onboarding')"
      >
        <span>Onboarding & Invitations</span>
      </button>
    </div>

    <!-- ======================================================== -->
    <!-- TAB 1 (PRIMARY): VENDOR MASTER (17 FIELDS)              -->
    <!-- ======================================================== -->
    @if (activeTab === 'master') {
      <!-- Main Vendor Master Form Card (Matching Legacy & Screenshot 17) -->
      <article class="panel" style="margin-bottom: 22px; border-left: 4px solid var(--role-accent);">
        <div class="main-heading-banner">
          <h5>Vendor List</h5>
        </div>

        <div class="form-body" style="padding: 18px 20px;">
          <!-- Row 1: Vendor ID, Vendor Name, Email -->
          <div class="form-row three-col">
            <div class="col">
              <label for="mvVendorId">Vendor ID <span class="required">*</span></label>
              <div class="input-with-actions">
                <input
                  id="mvVendorId"
                  type="text"
                  [value]="masterVendor.vendorId"
                  placeholder="Enter Vendor ID"
                  readonly
                  class="form-control readonly-field"
                />
                <button
                  type="button"
                  class="btn-attached search-btn"
                  style="background-color: var(--role-accent);"
                  (click)="openMasterLookup()"
                  title="Search Master Vendor (Sage / Database Lookup Modal)"
                >
                  <app-icon name="search" [size]="15" />
                </button>
                <button
                  type="button"
                  class="btn-attached refresh-btn"
                  style="background-color: #28a745;"
                  (click)="newMasterVendor()"
                  title="Add New Master Vendor"
                >
                  <span style="font-size: 16px; font-weight: bold; line-height: 1; color: white;">+</span>
                </button>
              </div>
            </div>

            <div class="col">
              <label for="mvVendorName">Vendor Name <span class="required">*</span></label>
              <input
                id="mvVendorName"
                type="text"
                [(ngModel)]="masterVendor.vendorName"
                placeholder="Enter Vendor Name"
                class="form-control"
              />
            </div>

            <div class="col">
              <label for="mvEmail">Email</label>
              <input
                id="mvEmail"
                type="email"
                [(ngModel)]="masterVendor.email"
                placeholder="Enter Email Address"
                class="form-control"
              />
            </div>
          </div>

          <!-- Row 2: Contact, Address, City -->
          <div class="form-row three-col">
            <div class="col">
              <label for="mvContact">Contact</label>
              <input
                id="mvContact"
                type="text"
                [(ngModel)]="masterVendor.contact"
                placeholder="Enter Contact Number"
                class="form-control"
              />
            </div>

            <div class="col" style="flex: 2;">
              <label for="mvAddress">Address <span class="required">*</span></label>
              <input
                id="mvAddress"
                type="text"
                [(ngModel)]="masterVendor.address"
                placeholder="Enter Address"
                class="form-control"
              />
            </div>

            <div class="col">
              <label for="mvCity">City <span class="required">*</span></label>
              <input
                id="mvCity"
                type="text"
                [(ngModel)]="masterVendor.city"
                placeholder="Enter City"
                class="form-control"
              />
            </div>
          </div>

          <!-- Row 3: State/Province, Country, Telephone, Terms -->
          <div class="form-row four-col">
            <div class="col">
              <label for="mvState">State/Province <span class="required">*</span></label>
              <input
                id="mvState"
                type="text"
                [(ngModel)]="masterVendor.stateProvince"
                placeholder="Enter State/Province"
                class="form-control"
              />
            </div>

            <div class="col">
              <label for="mvCountry">Country <span class="required">*</span></label>
              <input
                id="mvCountry"
                type="text"
                [(ngModel)]="masterVendor.country"
                placeholder="Enter Country"
                class="form-control"
              />
            </div>

            <div class="col">
              <label for="mvTelephone">Telephone</label>
              <input
                id="mvTelephone"
                type="tel"
                [(ngModel)]="masterVendor.telephone"
                placeholder="Enter Telephone"
                class="form-control"
              />
            </div>

            <div class="col">
              <label for="mvTerms">Terms</label>
              <input
                id="mvTerms"
                type="text"
                [(ngModel)]="masterVendor.terms"
                placeholder="Enter Terms (e.g. Net 30 Days)"
                class="form-control"
              />
            </div>
          </div>

          <!-- Row 4: Website, Contact Name, Bank Code -->
          <div class="form-row three-col">
            <div class="col" style="flex: 2;">
              <label for="mvWebsite">Website <span class="required">*</span></label>
              <input
                id="mvWebsite"
                type="text"
                [(ngModel)]="masterVendor.website"
                placeholder="Enter Website URL"
                class="form-control"
              />
            </div>

            <div class="col">
              <label for="mvContactName">Contact Name</label>
              <input
                id="mvContactName"
                type="text"
                [(ngModel)]="masterVendor.contactName"
                placeholder="Enter Contact Name"
                class="form-control"
              />
            </div>

            <div class="col">
              <label for="mvBankCode">Bank Code</label>
              <input
                id="mvBankCode"
                type="text"
                [(ngModel)]="masterVendor.bankCode"
                placeholder="Enter Bank Code"
                class="form-control"
              />
            </div>
          </div>

          <!-- Row 5: Tax Registration Code, Start Date, Inactive Date, Status -->
          <div class="form-row four-col">
            <div class="col">
              <label for="mvTaxCode">Tax Registration Code</label>
              <input
                id="mvTaxCode"
                type="text"
                [(ngModel)]="masterVendor.taxRegistrationCode"
                placeholder="Enter Tax Reg Code"
                class="form-control"
              />
            </div>

            <div class="col">
              <label for="mvStartDate">Start Date</label>
              <input
                id="mvStartDate"
                type="date"
                [(ngModel)]="masterVendor.startDate"
                class="form-control"
              />
            </div>

            <div class="col">
              <label for="mvInactiveDate">Inactive Date</label>
              <input
                id="mvInactiveDate"
                type="date"
                [(ngModel)]="masterVendor.inactiveDate"
                class="form-control"
              />
            </div>

            <div class="col">
              <label for="mvStatus">Status</label>
              <select id="mvStatus" [(ngModel)]="masterVendor.status" class="form-control form-select">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-actions-left" style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 20px; display: flex; gap: 10px; justify-content: flex-end;">
          <button type="button" class="btn" style="background: var(--role-accent); border-color: var(--role-accent);" (click)="saveMasterVendor()">Save Master Record</button>
        </div>
      </article>

      <!-- Section 1: Basic Information -->
      <article class="panel" style="margin-bottom: 22px;">
        <div class="section-heading-banner purple">
          <h5>Basic Information</h5>
        </div>
        <div class="form-body" style="padding: 18px 20px;">
          <div class="form-row two-col">
            <div class="col" style="flex: 2;">
              <label>Vendor Name (As Per Trade License) <span class="required">*</span></label>
              <input type="text" [(ngModel)]="masterVendor.vendorName" class="form-control" />
            </div>
            <div class="col">
              <label>Trade License Expiry Date <span class="required">*</span></label>
              <input type="date" [(ngModel)]="masterVendor.tradeLicenseExpiry" class="form-control" />
            </div>
          </div>

          <div class="form-row four-col">
            <div class="col">
              <label>Country <span class="required">*</span></label>
              <input type="text" [(ngModel)]="masterVendor.country" class="form-control" />
            </div>
            <div class="col">
              <label>City <span class="required">*</span></label>
              <input type="text" [(ngModel)]="masterVendor.city" class="form-control" />
            </div>
            <div class="col">
              <label>Phone Number <span class="required">*</span></label>
              <input type="tel" [(ngModel)]="masterVendor.contact" class="form-control" />
            </div>
            <div class="col">
              <label>Telephone</label>
              <input type="tel" [(ngModel)]="masterVendor.telephone" class="form-control" />
            </div>
          </div>

          <div class="form-row two-col">
            <div class="col" style="flex: 3;">
              <label>Vendor Address <span class="required">*</span></label>
              <input type="text" [(ngModel)]="masterVendor.address" class="form-control" />
            </div>
            <div class="col">
              <label>State / Province</label>
              <input type="text" [(ngModel)]="masterVendor.stateProvince" class="form-control" />
            </div>
          </div>

          <div class="form-row four-col">
            <div class="col">
              <label>Trade License Number <span class="required">*</span></label>
              <input type="text" [(ngModel)]="masterVendor.tradeLicenseNumber" class="form-control" />
            </div>
            <div class="col">
              <label>Trade License Expiry <span class="required">*</span></label>
              <input type="date" [(ngModel)]="masterVendor.tradeLicenseExpiry" class="form-control" />
            </div>
            <div class="col">
              <label>VAT (TRN Number) <span class="required">*</span></label>
              <input type="text" [(ngModel)]="masterVendor.vatTrn" class="form-control" />
            </div>
            <div class="col">
              <label>Corporate Tax Number</label>
              <input type="text" [(ngModel)]="masterVendor.corporateTax" class="form-control" />
            </div>
          </div>
        </div>
      </article>

      <!-- Section 2: Contact Person List -->
      <article class="panel" style="margin-bottom: 22px;">
        <div class="section-heading-banner purple">
          <h5>Contact Person List</h5>
        </div>
        <div style="padding: 16px 20px;">
          <div class="table-responsive">
            <table class="requests-table">
              <thead>
                <tr>
                  <th style="width: 70px;">#Sr</th>
                  <th>Person Name</th>
                  <th>Email</th>
                  <th>Number</th>
                  <th>Designation</th>
                </tr>
              </thead>
              <tbody>
                @for (c of (masterVendor.contacts || []); track $index) {
                  <tr>
                    <td><strong>{{ $index + 1 }}</strong></td>
                    <td><strong>{{ c.name }}</strong></td>
                    <td>{{ c.email }}</td>
                    <td>{{ c.number }}</td>
                    <td><span class="badge-status">{{ c.designation || 'Representative' }}</span></td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="empty-state">No contacts registered for this vendor yet.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </article>

      <!-- Section 3: Document List -->
      <article class="panel" style="margin-bottom: 22px;">
        <div class="section-heading-banner purple">
          <h5>Document List</h5>
        </div>
        <div style="padding: 16px 20px;">
          <div class="table-responsive">
            <table class="requests-table">
              <thead>
                <tr>
                  <th style="width: 70px;">#Sr</th>
                  <th>Document Name</th>
                  <th>Document Type</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                @for (doc of (masterVendor.documents || []); track $index) {
                  <tr>
                    <td><strong>{{ $index + 1 }}</strong></td>
                    <td><strong>{{ doc.name }}</strong></td>
                    <td>{{ doc.type }}</td>
                    <td>{{ doc.expiry || 'Permanent / No Expiry' }}</td>
                    <td><span class="badge-status" style="background: #e6f4ea; color: #137333;">Verified</span></td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="empty-state">No documents attached for this vendor.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Bottom Approval Controls -->
          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
            <button type="button" class="btn" style="background-color: var(--role-accent); border-color: var(--role-accent); color: white; padding: 10px 24px;" (click)="approveCurrentMasterVendor()">
              ✓ Approve Vendor
            </button>
            <button type="button" class="btn secondary" style="background-color: #dc3545; border-color: #dc3545; color: white; padding: 10px 24px;" (click)="rejectCurrentMasterVendor()">
              ✕ Reject Vendor
            </button>
          </div>
        </div>
      </article>

      <!-- Modal: Master Vendor Lookup Modal -->
      @if (showMasterLookupModal) {
        <div class="modal-backdrop" (click)="closeMasterLookup()">
          <div class="modal-window wide" (click)="$event.stopPropagation()">
            <div class="modal-header" style="background-color: var(--role-accent);">
              <h4 style="color: white; text-align: center; width: 100%;">Vendor List (Sage / ERP Master Lookup)</h4>
              <button type="button" class="modal-close" style="color: white;" (click)="closeMasterLookup()">✕</button>
            </div>

            <div class="modal-search-bar" style="padding: 12px 20px; border-bottom: 1px solid #e2e8f0;">
              <input
                type="text"
                [(ngModel)]="masterModalSearchQuery"
                placeholder="Search vendor by ID, Name, Location, TRN, or Bank..."
                style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px;"
                autofocus
              />
            </div>

            <div class="modal-table-wrap" style="padding: 0 20px; max-height: 50vh; overflow-y: auto;">
              <table class="modal-table">
                <thead>
                  <tr>
                    <th style="width: 120px;">Vendor ID</th>
                    <th>Vendor Name</th>
                    <th>Email</th>
                    <th>City / Location</th>
                    <th>Bank Code</th>
                    <th>TRN Code</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  @for (v of filteredMasterLookupList(); track v.vendorId) {
                    <tr (click)="selectMasterVendorRow(v)" class="clickable-row">
                      <td><strong class="vendor-tag" style="color: var(--role-accent);">{{ v.vendorId }}</strong></td>
                      <td class="font-medium"><strong>{{ v.vendorName }}</strong></td>
                      <td>{{ v.email }}</td>
                      <td>{{ v.city }}, {{ v.country }}</td>
                      <td><span class="mono">{{ v.bankCode }}</span></td>
                      <td><span class="mono">{{ v.taxRegistrationCode }}</span></td>
                      <td>
                        <app-status
                          [text]="v.status"
                          [good]="v.status === 'Active' || v.status === 'Approved'"
                          [warn]="v.status === 'Under Review'"
                          [bad]="v.status === 'Inactive'"
                        />
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="7" class="empty-state">No master vendor records found.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="modal-footer">
              <span class="modal-hint">Click any row to load full 17-field vendor record into form.</span>
              <button type="button" class="btn secondary" (click)="closeMasterLookup()">Close</button>
            </div>
          </div>
        </div>
      }
    }

    <!-- ======================================================== -->
    <!-- TAB 2: ONBOARDING & REGISTRATION                        -->
    <!-- ======================================================== -->
    @if (activeTab === 'onboarding') {
      <article class="panel req-form-panel">
        <div class="panel-header">
          <div>
            <h3>Send Vendor Registration Invitation</h3>
            <p>Generate invitation token and dispatch onboarding link to a supplier.</p>
          </div>
          <div class="header-badges">
            <span class="badge-tag">REQUEST: {{ vendorId }}</span>
          </div>
        </div>

        <div class="form-grid">
          <!-- Vendor Name with Search Modal trigger -->
          <div class="form-group">
            <label for="reqVendorName">
              Vendor Legal Name <span class="required">*</span>
            </label>
            <div class="input-with-actions">
              <input
                id="reqVendorName"
                type="text"
                [(ngModel)]="vendorName"
                (input)="onVendorNameInput()"
                placeholder="Enter Vendor Legal Name"
                [class.is-invalid]="nameError"
                class="form-control"
              />
              <button
                type="button"
                class="btn-attached search-btn"
                (click)="openSearchModal()"
                title="Lookup Existing Vendor"
              >
                <app-icon name="search" [size]="15" />
              </button>
              <button
                type="button"
                class="btn-attached refresh-btn"
                (click)="resetForm()"
                title="Clear and Reset Form"
              >
                <app-icon name="refresh" [size]="15" />
              </button>
            </div>
            @if (nameError) {
              <span class="field-error">Vendor Name is required.</span>
            }

            @if (showSuggestions && filteredSuggestions().length > 0) {
              <div class="suggestions-dropdown">
                @for (sug of filteredSuggestions(); track sug.id) {
                  <div class="suggestion-item" (click)="selectVendorRecord(sug)">
                    <strong>{{ sug.name }}</strong>
                    <small>ID: {{ sug.id }} · {{ sug.location }}</small>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Vendor Email -->
          <div class="form-group">
            <label for="reqVendorEmail">
              Official Email Address <span class="required">*</span>
            </label>
            <input
              id="reqVendorEmail"
              type="email"
              [(ngModel)]="vendorEmail"
              (blur)="validateEmail()"
              placeholder="e.g. contact@supplier.com"
              [class.is-invalid]="emailTouched && emailError"
              class="form-control"
            />
            @if (emailTouched && emailError) {
              <span class="field-error">{{ emailError }}</span>
            }
          </div>

          <!-- Contact Person -->
          <div class="form-group">
            <label for="reqContactPerson">Contact Person Name</label>
            <input
              id="reqContactPerson"
              type="text"
              [(ngModel)]="contactPerson"
              placeholder="e.g. Tariq Mehmood"
              class="form-control"
            />
          </div>

          <!-- Contact Number -->
          <div class="form-group">
            <label for="reqVendorContact">Contact Phone / Landline</label>
            <input
              id="reqVendorContact"
              type="tel"
              [(ngModel)]="vendorContact"
              placeholder="e.g. +971 4 398 2211"
              class="form-control"
            />
          </div>
        </div>

        <div class="form-actions-bar">
          <div class="action-info">
            <span class="info-dot"></span>
            <small>Dispatching will email the vendor a temporary credential token.</small>
          </div>
          <div class="action-buttons">
            <button type="button" class="btn secondary" (click)="saveRecord()">
              Save Draft
            </button>
            <button
              type="button"
              class="btn primary-accent"
              (click)="initiateSendEmail()"
              [disabled]="isSendingEmail"
            >
              @if (isSendingEmail) {
                <span>Sending Email...</span>
              } @else {
                <span>Send Registration Email</span>
              }
            </button>
            <button type="button" class="btn ghost-btn" (click)="skipEmail()">
              Skip Email
            </button>
          </div>
        </div>
      </article>

      <!-- Live Requests Log Table -->
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
        <div class="panel-title">
          <div class="panel-title-text">
            <h2>Recent Vendor Registration Requests</h2>
            <span class="badge-status">{{ requests().length }} records</span>
          </div>
          <div class="table-search-box">
            <app-icon name="search" [size]="14" />
            <input
              type="text"
              [(ngModel)]="logSearchQuery"
              placeholder="Filter requests..."
            />
          </div>
        </div>

        <div class="table-responsive">
          <table class="requests-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Vendor Name</th>
                <th>Email</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Created / Sent</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (req of filteredRequests(); track req.id) {
                <tr [class.highlighted]="req.id === vendorId">
                  <td class="req-id-cell">
                    <strong>{{ req.id }}</strong>
                  </td>
                  <td class="vendor-name-cell">{{ req.vendorName }}</td>
                  <td>{{ req.email }}</td>
                  <td>{{ req.contactPerson || '-' }}</td>
                  <td>{{ req.phone || '-' }}</td>
                  <td>
                    <app-status
                      [text]="req.status"
                      [good]="req.status === 'Profile Completed'"
                      [warn]="req.status === 'Email Sent'"
                      [bad]="req.status === 'Draft'"
                    />
                  </td>
                  <td class="date-cell">{{ req.createdAt }}</td>
                  <td class="actions-cell">
                    <button
                      class="table-btn-select"
                      (click)="loadRequestIntoForm(req)"
                      title="Load into Form"
                    >
                      Edit / View
                    </button>
                    @if (req.status === 'Email Sent' || req.status === 'Draft') {
                      <button
                        class="table-btn-resend"
                        (click)="resendEmail(req)"
                        title="Resend Invitation Email"
                      >
                        Resend
                      </button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="empty-state">
                    No registration requests match your search criteria.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </article>

      <!-- Modal 1: GuaranteeSearchModal (User List Lookup Modal) -->
      @if (showLookupModal) {
        <div class="modal-backdrop" (click)="closeSearchModal()">
          <div class="modal-window" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h4>User List</h4>
              <button type="button" class="modal-close" (click)="closeSearchModal()">✕</button>
            </div>

            <div class="modal-search-bar">
              <app-icon name="search" [size]="16" />
              <input
                type="text"
                [(ngModel)]="modalSearchQuery"
                placeholder="Filter by Vendor ID, Name, Email, or Contact..."
                autofocus
              />
            </div>

            <div class="modal-table-wrap">
              <table class="modal-table">
                <thead>
                  <tr>
                    <th style="width: 120px;">Vendor ID</th>
                    <th>Vendor Name</th>
                    <th>Email</th>
                    <th>Contact Person</th>
                    <th>Contact Number</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of filteredLookupList(); track item.id) {
                    <tr (click)="selectLookupRow(item)" class="clickable-row">
                      <td><strong class="vendor-tag">{{ item.id }}</strong></td>
                      <td class="font-medium">{{ item.name }}</td>
                      <td>{{ item.email }}</td>
                      <td>{{ item.contactPerson }}</td>
                      <td>{{ item.phone }}</td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="empty-state">No matching vendors found.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="modal-footer">
              <span class="modal-hint">Click any row to populate the registration form.</span>
              <button type="button" class="btn secondary" (click)="closeSearchModal()">
                Close
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Modal 2: Loader Modal (Sending Email Animation) -->
      @if (isSendingEmail) {
        <div class="modal-backdrop">
          <div class="loader-dialog">
            <div class="spinner-circle"></div>
            <h4>Sending Email...</h4>
            <p>Generating temporary vendor credentials and dispatching invitation link to <strong>{{ vendorEmail }}</strong>.</p>
          </div>
        </div>
      }

      <!-- Modal 3: Email Sent Success Modal -->
      @if (showSuccessModal) {
        <div class="modal-backdrop" (click)="closeSuccessModal()">
          <div class="success-dialog" (click)="$event.stopPropagation()">
            <div class="success-icon-wrap">
              <span class="check-icon">✓</span>
            </div>
            <h3>Email Sent!</h3>
            <p class="success-desc">
              An invitation email has been dispatched to <strong>{{ vendorEmail }}</strong> with portal login instructions.
            </p>

            <div class="credentials-card">
              <div class="cred-header">
                <span>Vendor Access Credentials</span>
                <span class="copy-pill" (click)="copyCredentials()">Copy</span>
              </div>
              <div class="cred-row">
                <span class="cred-label">Portal URL:</span>
                <span class="cred-value link">http://localhost:4200/login</span>
              </div>
              <div class="cred-row">
                <span class="cred-label">Login Email:</span>
                <span class="cred-value">{{ vendorEmail }}</span>
              </div>
              <div class="cred-row">
                <span class="cred-label">Temporary Password:</span>
                <span class="cred-value password-highlight">{{ lastGeneratedPassword }}</span>
              </div>
            </div>

            <div class="success-actions">
              <button class="btn" (click)="closeSuccessModal()">
                Done & Reset Form
              </button>
            </div>
          </div>
        </div>
      }
    }
  `,
  styles: [`
    :host {
      display: block;
      padding-bottom: 40px;
    }

    /* Option 6 Pill Navigation */
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

    .section-heading-banner {
      background-color: var(--role-accent, #2563eb);
      color: white;
      padding: 7px 16px;
      border-radius: var(--radius-md, 8px) var(--radius-md, 8px) 0 0;
      h5 {
        margin: 0;
        font-size: 13.5px;
        font-weight: 700;
      }

      &.purple {
        background-color: var(--role-accent, #2563eb);
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

      &.is-invalid {
        border-color: #ef4444;
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

        &.search-btn {
          background-color: var(--role-accent, #2563eb);
        }

        &.refresh-btn {
          background-color: #28a745;
          border-top-right-radius: 5px;
          border-bottom-right-radius: 5px;
          transition: background-color 0.15s ease-in-out;

          &:hover {
            background-color: #218838;
          }
        }
      }
    }

    /* Requests Table */
    .requests-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;

      th {
        background: #f8fafc;
        color: #475569;
        font-weight: 600;
        text-align: left;
        padding: 10px 14px;
        border-bottom: 1px solid #e2e8f0;
      }

      td {
        padding: 10px 14px;
        border-bottom: 1px solid #f1f5f9;
        vertical-align: middle;
      }

      tr:hover td {
        background: #f8fafc;
      }

      tr.highlighted td {
        background: #eff6ff;
      }
    }

    .req-form-panel {
      padding: 24px;
      margin-bottom: 22px;
      background: #ffffff;
      border: 1px solid var(--line, #e2e8f0);
      border-radius: var(--radius-md, 8px);
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 1px solid #f1f5f9;

      h3 { margin: 0 0 4px; font-size: 17px; font-weight: 700; color: #0f172a; }
      p { margin: 0; font-size: 13px; color: #64748b; }
    }

    .badge-tag {
      font-size: 11px;
      font-weight: 700;
      background: #e0e7ff;
      color: #3730a3;
      padding: 4px 10px;
      border-radius: 6px;
      font-family: monospace;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px 20px;
      margin-bottom: 24px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .form-group {
      position: relative;
      label {
        display: block;
        font-size: 12.5px;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 5px;
        .required { color: #dc2626; }
      }
    }

    .field-error {
      display: block;
      color: #dc2626;
      font-size: 11.5px;
      margin-top: 4px;
    }

    .suggestions-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      box-shadow: 0 8px 16px rgba(0,0,0,0.08);
      z-index: 100;
      max-height: 200px;
      overflow-y: auto;
    }

    .suggestion-item {
      padding: 8px 12px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      border-bottom: 1px solid #f1f5f9;

      &:hover { background: #eff6ff; }
      strong { font-size: 13px; color: #0f172a; }
      small { color: #64748b; font-size: 11px; }
    }

    .form-actions-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid #f1f5f9;

      @media (max-width: 650px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
    }

    .action-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #64748b;
      .info-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #0284c7;
      }
    }

    .action-buttons {
      display: flex;
      gap: 10px;
    }

    .table-search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 4px 10px;
      border-radius: 6px;

      input {
        border: none;
        background: transparent;
        font-size: 12.5px;
        outline: none;
        width: 140px;
      }
    }

    .table-btn-select, .table-btn-resend {
      padding: 3px 9px;
      font-size: 12px;
      border-radius: 4px;
      cursor: pointer;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      font-weight: 600;
      margin-left: 5px;
    }

    .table-btn-select { color: var(--role-accent, #2563eb); }
    .table-btn-resend { color: #b45309; }

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
        width: min(1000px, 95%);
        max-width: 1000px;
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

    .loader-dialog, .success-dialog {
      background: #ffffff;
      border-radius: 12px;
      padding: 28px;
      text-align: center;
      max-width: 440px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .spinner-circle {
      width: 44px;
      height: 44px;
      border: 4px solid #e2e8f0;
      border-top-color: var(--role-accent, #2563eb);
      border-radius: 50%;
      margin: 0 auto 16px;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .credentials-card {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 12px;
      margin: 16px 0 20px;
      text-align: left;
    }

    .cred-header {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      margin-bottom: 8px;
    }

    .cred-row {
      display: flex;
      justify-content: space-between;
      font-size: 12.5px;
      padding: 4px 0;
      .cred-label { color: #64748b; }
      .cred-value { font-family: monospace; font-weight: 600; }
    }

    .password-highlight {
      background: #e0e7ff;
      color: #3730a3;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .mono { font-family: monospace; }
  `]
})
export class VendorsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly state = inject(PortalStateService);
  readonly vendorApi = inject(VendorApiService);
  readonly role = this.state.role;

  // Active Tab: 'master' (default) or 'onboarding'
  activeTab: 'master' | 'onboarding' = 'master';

  // --- TAB 2: ONBOARDING & REGISTRATION STATE ---
  readonly requests = this.state.vendorRegistrationRequests;
  readonly directoryVendors = this.state.vendors;

  vendorId = '*** NEW ***';
  vendorName = '';
  vendorEmail = '';
  vendorContact = '';
  contactPerson = '';

  isSaved = false;
  nameError = false;
  emailTouched = false;
  emailError = '';

  showSuggestions = false;
  showLookupModal = false;
  modalSearchQuery = '';
  isSendingEmail = false;
  showSuccessModal = false;
  lastGeneratedPassword = '';
  logSearchQuery = '';

  // --- TAB 1 (PRIMARY): VENDOR MASTER STATE ---
  masterVendor: MasterVendor = {
    vendorId: 'VEN-10024',
    vendorName: 'ABC Supplies Pvt. Ltd.',
    email: 'info@abcsupplies.com',
    contact: '+971 4 398 2211',
    address: 'Street 14, Al Quoz Industrial Area 1',
    city: 'Dubai',
    stateProvince: 'Dubai',
    country: 'United Arab Emirates',
    telephone: '+971 4 398 2200',
    terms: 'Net 30 Days',
    website: 'https://www.abcsupplies.com',
    contactName: 'Tariq Mehmood',
    bankCode: 'HABB-AE',
    taxRegistrationCode: '100293847200003',
    startDate: '2024-01-15',
    inactiveDate: '',
    status: 'Active',
    tradeLicenseNumber: 'CN-1029384',
    tradeLicenseExpiry: '2027-05-30',
    vatTrn: '100293847200003',
    corporateTax: 'CT-992014',
    contacts: [
      { id: 1, name: 'Tariq Mehmood', email: 'tariq@abcsupplies.com', number: '+971 50 123 4567', designation: 'Managing Director' },
      { id: 2, name: 'Imran Bashir', email: 'imran@abcsupplies.com', number: '+971 52 345 6789', designation: 'Sales Manager' }
    ],
    documents: [
      { id: 1, name: 'Trade License Copy 2026.pdf', type: 'Trade License', expiry: '2027-05-30' },
      { id: 2, name: 'FTA TRN Certificate.pdf', type: 'TRN Certificate', expiry: '2028-12-31' },
      { id: 3, name: 'HBL Official Bank Verification Letter.pdf', type: 'Bank Letter', expiry: '' }
    ]
  };

  showMasterLookupModal = false;
  masterModalSearchQuery = '';

  readonly filteredMasterLookupList = computed(() => {
    const q = this.masterModalSearchQuery.trim().toLowerCase();
    if (!q) return this.state.masterVendors();
    return this.state.masterVendors().filter(v =>
      v.vendorId.toLowerCase().includes(q) ||
      v.vendorName.toLowerCase().includes(q) ||
      (v.email || '').toLowerCase().includes(q) ||
      (v.city || '').toLowerCase().includes(q) ||
      (v.country || '').toLowerCase().includes(q) ||
      (v.bankCode || '').toLowerCase().includes(q) ||
      (v.taxRegistrationCode || '').toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'onboarding') {
        this.activeTab = 'onboarding';
      } else {
        this.activeTab = 'master';
      }
    });

    if (this.router.url.includes('vendor-registration-req')) {
      this.activeTab = 'onboarding';
    }

    this.loadBackendVendors();
  }

  loadBackendVendors(): void {
    // 1. Fetch live registrations from backend
    this.vendorApi.getAllVendorRegistrations().subscribe(res => {
      const list = res?.vreg_List || res?.data || (Array.isArray(res) ? res : null);
      if (Array.isArray(list) && list.length > 0) {
        for (const reg of list) {
          const reqNo = reg.reqno || reg.reQ_NO || '';
          if (!reqNo) continue;
          const status = reg.isactive === 1 ? 'Active' : (reg.isactive === 0 ? 'Under Review' : 'Active');
          const existing = this.state.masterVendors().find(v => v.vendorId === reqNo);
          if (!existing) {
            this.state.saveMasterVendor({
              vendorId: reqNo,
              vendorName: reg.vendoR_NAME || reqNo,
              email: reg.email || '',
              contact: reg.tel || '',
              address: reg.address || '',
              city: reg.city || 'Dubai',
              stateProvince: reg.city || 'Dubai',
              country: reg.country || 'United Arab Emirates',
              telephone: reg.tel || '',
              terms: 'Net 30 Days',
              website: reg.website || '',
              contactName: reg.cT_PERSON || '',
              bankCode: '',
              taxRegistrationCode: reg.taxnum || '',
              startDate: new Date().toISOString().substring(0, 10),
              inactiveDate: '',
              status: status,
              tradeLicenseNumber: reg.tlnum || '',
              tradeLicenseExpiry: reg.tL_EXPIRY ? String(reg.tL_EXPIRY).substring(0, 10) : '',
              vatTrn: reg.taxnum || '',
              corporateTax: reg.corP_TAX || '',
              contacts: [],
              documents: []
            });
          }
        }
      }
    });

    // 2. Fetch live vendor validation statuses
    this.vendorApi.getVendorValidations().subscribe(res => {
      const list = res?.vendorvalidation_List || res?.data || (Array.isArray(res) ? res : null);
      if (Array.isArray(list) && list.length > 0) {
        for (const val of list) {
          const reqNo = val.reqno || '';
          if (!reqNo) continue;
          if (val.status === 'Approved' || val.action === 1) {
            this.state.approveMasterVendor(reqNo);
          } else if (val.status === 'Rejected' || val.action === 2) {
            this.state.rejectMasterVendor(reqNo);
          }
        }
      }
    });
  }

  switchTab(tab: 'master' | 'onboarding'): void {
    this.activeTab = tab;
    this.router.navigate(['/', this.role(), 'vendors'], {
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });
  }

  exportList(): void {
    this.state.notify('Exporting master vendor register (Excel format)...');
  }

  // --- TAB 1 (PRIMARY): VENDOR MASTER METHODS ---
  openMasterLookup(): void {
    this.masterModalSearchQuery = '';
    this.showMasterLookupModal = true;
  }

  closeMasterLookup(): void {
    this.showMasterLookupModal = false;
  }

  selectMasterVendorRow(v: MasterVendor): void {
    this.masterVendor = { ...v, contacts: [...(v.contacts || [])], documents: [...(v.documents || [])] };
    this.showMasterLookupModal = false;
    this.state.notify(`Master record loaded for ${v.vendorName} (${v.vendorId})`);
  }

  newMasterVendor(): void {
    this.masterVendor = {
      vendorId: '*** NEW ***',
      vendorName: '',
      email: '',
      contact: '',
      address: '',
      city: 'Dubai',
      stateProvince: 'Dubai',
      country: 'United Arab Emirates',
      telephone: '',
      terms: 'Net 30 Days',
      website: '',
      contactName: '',
      bankCode: '',
      taxRegistrationCode: '',
      startDate: new Date().toISOString().substring(0, 10),
      inactiveDate: '',
      status: 'Under Review',
      tradeLicenseNumber: '',
      tradeLicenseExpiry: '',
      vatTrn: '',
      corporateTax: '',
      contacts: [],
      documents: []
    };
    this.state.notify('New Vendor Master form ready. Enter details and click Save.');
  }

  saveMasterVendor(): void {
    if (!this.masterVendor.vendorName.trim()) {
      this.state.notify('Validation Error: Vendor Name is required.');
      return;
    }
    this.state.saveMasterVendor({ ...this.masterVendor });

    // Sync to live backend API: AUDVendorRegistration
    this.vendorApi.saveVendorRegistration({
      coperation: 2,
      reqno: this.masterVendor.vendorId === '*** NEW ***' ? undefined : this.masterVendor.vendorId,
      vendoR_NAME: this.masterVendor.vendorName,
      email: this.masterVendor.email,
      tel: this.masterVendor.telephone || this.masterVendor.contact,
      address: this.masterVendor.address,
      city: this.masterVendor.city,
      country: this.masterVendor.country,
      website: this.masterVendor.website,
      tlnum: this.masterVendor.tradeLicenseNumber,
      tL_EXPIRY: this.masterVendor.tradeLicenseExpiry,
      taxnum: this.masterVendor.vatTrn,
      corP_TAX: this.masterVendor.corporateTax,
      isactive: this.masterVendor.status === 'Active' ? 1 : 0
    }).subscribe({
      next: () => this.state.notify(`✓ Backend: Master record saved for ${this.masterVendor.vendorName}`),
      error: () => this.state.notify(`Master record saved locally for ${this.masterVendor.vendorName}`)
    });
  }

  approveCurrentMasterVendor(): void {
    if (!this.masterVendor.vendorId || this.masterVendor.vendorId === '*** NEW ***') {
      this.saveMasterVendor();
    }
    this.state.approveMasterVendor(this.masterVendor.vendorId);
    this.masterVendor.status = 'Active';

    // Sync to live backend API: AUDVENDORVALIDATION
    this.vendorApi.saveVendorValidation({
      coperation: 2,
      reqno: this.masterVendor.vendorId,
      vendoR_NAME: this.masterVendor.vendorName,
      status: 'Approved',
      action: 1,
      remark: 'Procurement partner approval granted',
      date: new Date().toISOString()
    }).subscribe({
      next: () => this.state.notify(`✓ Backend: Vendor ${this.masterVendor.vendorName} approved successfully.`),
      error: () => this.state.notify(`Vendor ${this.masterVendor.vendorName} approved locally.`)
    });

    // Also update AUDVendorRegistration isactive = 1
    this.vendorApi.saveVendorRegistration({
      coperation: 2,
      reqno: this.masterVendor.vendorId,
      vendoR_NAME: this.masterVendor.vendorName,
      isactive: 1
    }).subscribe();
  }

  rejectCurrentMasterVendor(): void {
    if (!this.masterVendor.vendorId || this.masterVendor.vendorId === '*** NEW ***') return;
    this.state.rejectMasterVendor(this.masterVendor.vendorId);
    this.masterVendor.status = 'Inactive';

    // Sync to live backend API: AUDVENDORVALIDATION
    this.vendorApi.saveVendorValidation({
      coperation: 2,
      reqno: this.masterVendor.vendorId,
      vendoR_NAME: this.masterVendor.vendorName,
      status: 'Rejected',
      action: 2,
      remark: 'Rejected by Procurement Review',
      date: new Date().toISOString()
    }).subscribe({
      next: () => this.state.notify(`✓ Backend: Vendor ${this.masterVendor.vendorName} marked Rejected.`),
      error: () => this.state.notify(`Vendor ${this.masterVendor.vendorName} rejected locally.`)
    });

    // Also update AUDVendorRegistration isactive = 0
    this.vendorApi.saveVendorRegistration({
      coperation: 2,
      reqno: this.masterVendor.vendorId,
      vendoR_NAME: this.masterVendor.vendorName,
      isactive: 0
    }).subscribe();
  }

  // --- TAB 2: ONBOARDING & INVITATION METHODS ---
  readonly filteredSuggestions = computed(() => {
    const q = this.vendorName.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    return this.directoryVendors().filter(v =>
      v.name.toLowerCase().includes(q) || v.id.toLowerCase().includes(q)
    );
  });

  readonly lookupVendorList = computed(() => {
    const map = new Map<string, { id: string; name: string; email: string; contactPerson: string; phone: string }>();

    for (const v of this.directoryVendors()) {
      map.set(v.id, {
        id: v.id,
        name: v.name,
        email: `${v.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@supplier.com`,
        contactPerson: 'Authorized Rep',
        phone: '+971 50 ' + Math.floor(1000000 + Math.random() * 9000000)
      });
    }

    for (const r of this.requests()) {
      map.set(r.id, {
        id: r.id,
        name: r.vendorName,
        email: r.email,
        contactPerson: r.contactPerson,
        phone: r.phone
      });
    }

    return Array.from(map.values());
  });

  readonly filteredLookupList = computed(() => {
    const q = this.modalSearchQuery.trim().toLowerCase();
    if (!q) return this.lookupVendorList();
    return this.lookupVendorList().filter(v =>
      v.id.toLowerCase().includes(q) ||
      v.name.toLowerCase().includes(q) ||
      v.email.toLowerCase().includes(q) ||
      v.contactPerson.toLowerCase().includes(q) ||
      v.phone.toLowerCase().includes(q)
    );
  });

  readonly filteredRequests = computed(() => {
    const q = this.logSearchQuery.trim().toLowerCase();
    if (!q) return this.requests();
    return this.requests().filter(r =>
      r.id.toLowerCase().includes(q) ||
      r.vendorName.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.contactPerson.toLowerCase().includes(q) ||
      r.phone.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q)
    );
  });

  onVendorNameInput(): void {
    this.nameError = false;
    this.showSuggestions = this.vendorName.trim().length >= 2;
  }

  validateEmail(): void {
    this.emailTouched = true;
    const emailPattern = /^[^\s@]+@[^\s@]+$/;
    if (!this.vendorEmail.trim()) {
      this.emailError = 'Email is required.';
    } else if (!emailPattern.test(this.vendorEmail.trim())) {
      this.emailError = 'Please enter a valid email address.';
    } else {
      this.emailError = '';
    }
  }

  openSearchModal(): void {
    this.modalSearchQuery = '';
    this.showLookupModal = true;
  }

  closeSearchModal(): void {
    this.showLookupModal = false;
  }

  selectLookupRow(item: { id: string; name: string; email: string; contactPerson: string; phone: string }): void {
    this.vendorId = item.id;
    this.vendorName = item.name;
    this.vendorEmail = item.email;
    this.vendorContact = item.phone;
    this.contactPerson = item.contactPerson;
    this.isSaved = true;
    this.nameError = false;
    this.emailError = '';
    this.showLookupModal = false;
    this.state.notify(`Vendor loaded: ${item.name} (${item.id})`);
  }

  selectVendorRecord(vendor: { id: string; name: string }): void {
    this.vendorId = vendor.id;
    this.vendorName = vendor.name;
    this.vendorEmail = `${vendor.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@supplier.com`;
    this.contactPerson = 'Operations Lead';
    this.vendorContact = '+971 50 892 1042';
    this.isSaved = true;
    this.showSuggestions = false;
    this.nameError = false;
    this.emailError = '';
  }

  saveRecord(): void {
    if (!this.vendorName.trim()) {
      this.nameError = true;
      this.state.notify('Validation Error: Vendor Name is required.');
      return;
    }

    this.validateEmail();
    if (this.emailError) {
      this.state.notify('Validation Error: Valid email address is required.');
      return;
    }

    const saved = this.state.saveVendorRegistrationReq({
      id: this.vendorId === '*** NEW ***' ? undefined : this.vendorId,
      vendorName: this.vendorName.trim(),
      email: this.vendorEmail.trim(),
      phone: this.vendorContact.trim(),
      contactPerson: this.contactPerson.trim()
    });

    this.vendorApi.saveVendorRegistration({
      coperation: 1,
      reqno: saved.id,
      vendoR_NAME: saved.vendorName,
      email: saved.email,
      tel: saved.phone,
      isactive: 0
    }).subscribe();

    this.vendorId = saved.id;
    this.isSaved = true;
  }

  initiateSendEmail(): void {
    if (!this.vendorName.trim()) {
      this.nameError = true;
      this.state.notify('Validation Error: Vendor Name is required.');
      return;
    }

    this.validateEmail();
    if (this.emailError) {
      this.state.notify('Validation Error: Valid email address is required.');
      return;
    }

    if (this.vendorId === '*** NEW ***') {
      this.saveRecord();
      if (this.vendorId === '*** NEW ***') {
        return;
      }
    }

    this.isSendingEmail = true;

    setTimeout(() => {
      this.isSendingEmail = false;
      const res = this.state.sendVendorInvitationEmail(this.vendorId);
      this.lastGeneratedPassword = res.password;
      this.showSuccessModal = true;
    }, 900);
  }

  skipEmail(): void {
    if (!this.vendorName.trim()) {
      this.nameError = true;
      this.state.notify('Validation Error: Vendor Name is required.');
      return;
    }

    this.validateEmail();
    if (this.emailError) {
      this.state.notify('Validation Error: Valid email address is required.');
      return;
    }

    if (this.vendorId === '*** NEW ***') {
      this.saveRecord();
      if (this.vendorId === '*** NEW ***') {
        return;
      }
    }

    this.state.skipVendorInvitation(this.vendorId);
    this.resetForm();
  }

  loadRequestIntoForm(req: VendorRegistrationReq): void {
    this.vendorId = req.id;
    this.vendorName = req.vendorName;
    this.vendorEmail = req.email;
    this.vendorContact = req.phone;
    this.contactPerson = req.contactPerson;
    this.isSaved = true;
    this.nameError = false;
    this.emailError = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.state.notify(`Loaded ${req.id} into registration form`);
  }

  resendEmail(req: VendorRegistrationReq): void {
    this.vendorId = req.id;
    this.vendorName = req.vendorName;
    this.vendorEmail = req.email;
    this.vendorContact = req.phone;
    this.contactPerson = req.contactPerson;
    this.isSaved = true;
    this.initiateSendEmail();
  }

  resetForm(): void {
    this.vendorId = '*** NEW ***';
    this.vendorName = '';
    this.vendorEmail = '';
    this.vendorContact = '';
    this.contactPerson = '';
    this.isSaved = false;
    this.nameError = false;
    this.emailTouched = false;
    this.emailError = '';
    this.showSuggestions = false;
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.resetForm();
  }

  copyCredentials(): void {
    const text = `TAMCO Vendor Portal Credentials\nURL: http://localhost:4200/login\nEmail: ${this.vendorEmail}\nPassword: ${this.lastGeneratedPassword}`;
    navigator.clipboard.writeText(text);
    this.state.notify('Credentials copied to clipboard!');
  }
}
