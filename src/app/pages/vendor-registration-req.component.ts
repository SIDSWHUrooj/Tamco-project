import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PortalStateService } from '../core/portal-state.service';
import { VendorApiService } from '../core/vendor-api.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';
import { IconComponent } from '../shared/icon.component';
import { VendorRegistrationReq } from '../core/models';

@Component({
  selector: 'app-vendor-registration-req',
  standalone: true,
  imports: [FormsModule, RouterLink, PageHeadingComponent, StatusComponent, IconComponent],
  template: `
    <app-page-heading
      eyebrow="Procurement Management"
      title="Vendor Registration Request"
      subtitle="Initiate vendor onboarding, assign initial credentials, and dispatch registration portal access links."
    >
      <div class="heading-actions">
        <a class="btn secondary" [routerLink]="['/', role(), 'vendors']">
          ← Back to Vendors
        </a>
      </div>
    </app-page-heading>

    <!-- Main Form Card (Mirrors legacy Vendor Registration) -->
    <article class="panel" style="margin-bottom: 18px; border-left: 4px solid var(--role-accent);">
      <div class="panel-title">
        <div class="panel-title-text">
          <h2>Vendor Registration Request</h2>
          <span class="badge-status">{{ vendorId === '*** NEW ***' ? 'New Request Draft' : 'Record Loaded: ' + vendorId }}</span>
        </div>
      </div>

      <div class="form-body">
        <!-- Row 1: Vendor ID & Vendor Name (same 3-col sizing as row 2) -->
        <div class="form-row three-col">
          <div class="col">
            <label for="vendorId">Vendor ID</label>
            <input
              id="vendorId"
              type="text"
              [value]="vendorId"
              placeholder="*** NEW ***"
              readonly
              class="form-control readonly-field"
            />
          </div>

          <div class="col">
            <label for="vendorName">Vendor Name <span class="required">*</span></label>
            <div class="input-with-actions">
              <div class="input-wrapper">
                <input
                  id="vendorName"
                  type="text"
                  [(ngModel)]="vendorName"
                  (input)="onVendorNameInput()"
                  placeholder="Enter Vendor Name"
                  autocomplete="off"
                  class="form-control"
                  [class.is-invalid]="nameError"
                />
                <!-- Live Suggestions Dropdown -->
                @if (showSuggestions && filteredSuggestions().length > 0) {
                  <div class="suggestions-dropdown">
                    @for (item of filteredSuggestions(); track item.id) {
                      <div class="suggestion-item" (click)="selectVendorRecord(item)">
                        <div class="item-main">
                          <strong>{{ item.name }}</strong>
                          <span class="item-id">{{ item.id }}</span>
                        </div>
                        <div class="item-sub">
                          <span>{{ item.bank || 'No bank assigned' }}</span>
                          <span>•</span>
                          <span>{{ item.location }}</span>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Attached Search button (Opens User List modal) -->
              <button
                type="button"
                class="btn-attached search-btn"
                (click)="openSearchModal()"
                title="Search Registered Vendors (User List)"
              >
                <app-icon name="search" [size]="16" />
              </button>

              <!-- Attached Refresh / Reset button (Green) -->
              <button
                type="button"
                class="btn-attached refresh-btn"
                (click)="resetForm()"
                title="Reset Form"
              >
                <app-icon name="refresh" [size]="16" />
              </button>
            </div>
            @if (nameError) {
              <small class="error-text">Please enter a valid vendor legal name.</small>
            }
          </div>

          <div class="col empty-col"></div>
        </div>

        <!-- Row 2: Email, Phone No & Contact Person Name in One Line -->
        <div class="form-row three-col">
          <div class="col">
            <label for="vendorEmail">Email <span class="required">*</span></label>
            <input
              id="vendorEmail"
              type="email"
              [(ngModel)]="vendorEmail"
              (input)="validateEmail()"
              placeholder="Enter Email"
              autocomplete="off"
              maxlength="60"
              class="form-control"
              [class.is-invalid]="emailTouched && !!emailError"
            />
            @if (emailTouched && emailError) {
              <small class="error-text">{{ emailError }}</small>
            }
          </div>

          <div class="col">
            <label for="vendorContact">Phone No</label>
            <input
              id="vendorContact"
              type="tel"
              [(ngModel)]="vendorContact"
              placeholder="Enter Mobile No."
              class="form-control"
              maxlength="35"
            />
          </div>

          <div class="col">
            <label for="contactPerson">Contact Person Name</label>
            <input
              id="contactPerson"
              type="text"
              [(ngModel)]="contactPerson"
              placeholder="Enter Contact Person Name"
              maxlength="60"
              autocomplete="off"
              class="form-control"
            />
          </div>
        </div>
      </div>

      <!-- Action Buttons Left-Aligned Bar -->
      <div class="form-actions-left">
        <button
          type="button"
          class="btn btn-save"
          (click)="saveRecord()"
          title="Save registration draft"
        >
          Save
        </button>

        <button
          type="button"
          class="btn btn-send-email"
          (click)="initiateSendEmail()"
          [disabled]="isSendingEmail"
          title="Save and transmit invitation email with portal credentials"
        >
          {{ isSendingEmail ? 'Sending...' : 'Send Email To Vendor' }}
        </button>

        <button
          type="button"
          class="btn secondary btn-skip-email"
          (click)="skipEmail()"
          title="Skip sending email and mark vendor active"
        >
          Skip Email
        </button>
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
  `,
  styles: [`
    :host {
      display: block;
      padding-bottom: 40px;
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
      gap: 18px;
    }

    .form-row {
      display: flex;
      gap: 20px;
      align-items: flex-start;

      &.two-col {
        .col {
          flex: 1;
        }
      }

      &.three-col {
        .col {
          flex: 1;
          min-width: 0;
        }
      }

      .col-id {
        width: 24%;
        min-width: 170px;
      }

      .col-name {
        flex: 1;
      }

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
      height: 42px;
      padding: 8px 12px;
      font-size: 14px;
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
        font-weight: 700;
        letter-spacing: 0.03em;
        cursor: not-allowed;
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

      .input-wrapper {
        position: relative;
        flex: 1;

        input {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
          border-right: none;
        }
      }

      .btn-attached {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        min-width: 44px;
        border: 1px solid var(--navy, #0b1f3a);
        background: var(--navy, #0b1f3a);
        color: #ffffff;
        cursor: pointer;
        transition: background 0.15s ease;

        &:hover {
          background: #1e3a5f;
        }

        &.refresh-btn {
          border-left: 1px solid rgba(255, 255, 255, 0.2);
          border-top-right-radius: var(--radius-sm, 6px);
          border-bottom-right-radius: var(--radius-sm, 6px);
          background: #16a34a !important;
          border-color: #16a34a !important;
          color: #ffffff !important;

          &:hover {
            background: #15803d !important;
            border-color: #15803d !important;
          }
        }
      }
    }

    /* Auto suggestions box */
    .suggestions-dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      background: #ffffff;
      border: 1px solid var(--line-strong, #cbd5e1);
      border-radius: var(--radius-sm, 6px);
      box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(15, 23, 42, 0.1));
      max-height: 220px;
      overflow-y: auto;
      z-index: 50;

      .suggestion-item {
        padding: 9px 12px;
        cursor: pointer;
        border-bottom: 1px solid var(--line, #e2e8f0);
        display: flex;
        flex-direction: column;
        gap: 2px;

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background: #f1f5f9;
        }

        .item-main {
          display: flex;
          justify-content: space-between;
          font-size: 13.5px;
          color: var(--text, #0f172a);

          .item-id {
            font-size: 11.5px;
            color: var(--muted, #64748b);
            font-family: monospace;
          }
        }

        .item-sub {
          display: flex;
          gap: 6px;
          font-size: 11.5px;
          color: var(--muted, #64748b);
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

    /* ACTION BUTTONS (LEFT-ALIGNED AS THEY WERE) */
    .form-actions-left {
      margin-top: 24px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 12px;
      flex-wrap: wrap;

      .btn {
        padding: 9px 20px;
        font-size: 13.5px;
        font-weight: 600;
        height: 38px;
        box-sizing: border-box;
      }

      .btn-save {
        background: #325c74;
        border-color: #325c74;
        color: #ffffff;

        &:hover {
          background: #27495d;
          border-color: #27495d;
        }
      }

      .btn-send-email {
        background: var(--role-accent, #2563eb);
        border-color: var(--role-accent, #2563eb);
        color: #ffffff;

        &:hover:not(:disabled) {
          background: var(--role-accent-hover, #1d4ed8);
          border-color: var(--role-accent-hover, #1d4ed8);
        }

        &:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
      }

      .btn-skip-email {
        background: #ffffff;
        border: 1px solid var(--line-strong, #cbd5e1);
        color: var(--text, #0f172a);

        &:hover {
          background: #f8fafc;
          border-color: #94a3b8;
          color: var(--role-accent, #2563eb);
        }
      }
    }

    .table-search-box {
      position: relative;
      display: flex;
      align-items: center;

      app-icon {
        position: absolute;
        left: 10px;
        color: var(--muted, #64748b);
        pointer-events: none;
      }

      input {
        padding: 6px 12px 6px 32px;
        font-size: 13px;
        border: 1px solid var(--line, #e2e8f0);
        border-radius: var(--radius-sm, 6px);
        width: 220px;
        outline: none;

        &:focus {
          border-color: var(--role-accent, #2563eb);
          width: 260px;
          transition: width 0.2s ease;
        }
      }
    }

    .table-responsive {
      overflow-x: auto;
    }

    .requests-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;

      th {
        background: #f8fafc;
        color: var(--muted, #64748b);
        font-weight: 600;
        text-align: left;
        padding: 10px 16px;
        border-bottom: 1px solid var(--line, #e2e8f0);
        white-space: nowrap;
      }

      td {
        padding: 12px 16px;
        border-bottom: 1px solid var(--line, #e2e8f0);
        color: var(--text, #0f172a);
        vertical-align: middle;
      }

      tr:hover td {
        background: #f8fafc;
      }

      tr.highlighted td {
        background: #eff6ff;
      }

      .req-id-cell strong {
        font-family: monospace;
        color: var(--navy, #0b1f3a);
      }

      .vendor-name-cell {
        font-weight: 600;
      }

      .date-cell {
        font-size: 12px;
        color: var(--muted, #64748b);
        white-space: nowrap;
      }

      .actions-cell {
        text-align: right;
        white-space: nowrap;

        button {
          margin-left: 6px;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 600;
          border-radius: 4px;
          cursor: pointer;
        }

        .table-btn-select {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #334155;

          &:hover {
            background: #f1f5f9;
            color: #0f172a;
          }
        }

        .table-btn-resend {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #2563eb;

          &:hover {
            background: #2563eb;
            color: #ffffff;
          }
        }
      }

      .empty-state {
        text-align: center;
        padding: 30px;
        color: var(--muted, #64748b);
      }
    }

    /* MODAL STYLES */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.55);
      backdrop-filter: blur(3px);
      z-index: 99999;
      display: grid;
      place-items: center;
      padding: 20px;
      animation: fadeIn 0.15s ease-out;
    }

    .modal-window {
      background: #ffffff;
      border-radius: var(--radius-md, 10px);
      width: min(850px, 100%);
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 40px -10px rgba(15, 23, 42, 0.3);
      overflow: hidden;
      border: 1px solid var(--line, #e2e8f0);

      .modal-header {
        background: var(--navy, #0b1f3a);
        color: #ffffff;
        padding: 12px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
        }

        .modal-close {
          background: transparent;
          border: none;
          color: #ffffff;
          font-size: 18px;
          cursor: pointer;
          opacity: 0.8;

          &:hover {
            opacity: 1;
          }
        }
      }

      .modal-search-bar {
        position: relative;
        padding: 14px 20px;
        border-bottom: 1px solid var(--line, #e2e8f0);
        display: flex;
        align-items: center;

        app-icon {
          position: absolute;
          left: 32px;
          color: var(--muted, #64748b);
        }

        input {
          width: 100%;
          padding: 8px 14px 8px 36px;
          font-size: 14px;
          border: 1px solid var(--line-strong, #cbd5e1);
          border-radius: var(--radius-sm, 6px);
          outline: none;

          &:focus {
            border-color: var(--role-accent, #2563eb);
          }
        }
      }

      .modal-table-wrap {
        padding: 0 20px;
        overflow-y: auto;
        flex: 1;
      }

      .modal-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;

        th {
          position: sticky;
          top: 0;
          background: #ffffff;
          padding: 10px 12px;
          border-bottom: 2px solid var(--line, #e2e8f0);
          color: var(--muted, #64748b);
          font-weight: 600;
          text-align: left;
        }

        td {
          padding: 10px 12px;
          border-bottom: 1px solid var(--line, #e2e8f0);
          color: var(--text, #0f172a);
        }

        .clickable-row {
          cursor: pointer;
          transition: background 0.12s ease;

          &:hover {
            background: #eff6ff;
          }
        }

        .vendor-tag {
          font-family: monospace;
          color: #2563eb;
        }
      }

      .modal-footer {
        padding: 12px 20px;
        background: #f8fafc;
        border-top: 1px solid var(--line, #e2e8f0);
        display: flex;
        align-items: center;
        justify-content: space-between;

        .modal-hint {
          font-size: 12px;
          color: var(--muted, #64748b);
        }
      }
    }

    /* LOADER MODAL */
    .loader-dialog {
      background: #ffffff;
      padding: 30px;
      border-radius: var(--radius-md, 10px);
      text-align: center;
      max-width: 400px;
      box-shadow: 0 20px 40px -10px rgba(15, 23, 42, 0.3);

      .spinner-circle {
        width: 48px;
        height: 48px;
        border: 4px solid #f1f5f9;
        border-top-color: var(--role-accent, #2563eb);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto 16px;
      }

      h4 {
        margin: 0 0 8px;
        font-size: 17px;
        color: var(--text, #0f172a);
      }

      p {
        margin: 0;
        font-size: 13px;
        color: var(--muted, #64748b);
        line-height: 1.5;
      }
    }

    /* SUCCESS MODAL */
    .success-dialog {
      background: #ffffff;
      border-radius: var(--radius-md, 10px);
      padding: 28px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 50px -10px rgba(15, 23, 42, 0.35);

      .success-icon-wrap {
        width: 56px;
        height: 56px;
        background: #f0fdf4;
        border: 2px solid #bbf7d0;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 14px;

        .check-icon {
          font-size: 28px;
          color: #16a34a;
          font-weight: 700;
        }
      }

      h3 {
        margin: 0 0 6px;
        font-size: 20px;
        font-weight: 700;
        color: var(--text, #0f172a);
      }

      .success-desc {
        font-size: 13.5px;
        color: var(--muted, #64748b);
        margin: 0 0 20px;
        line-height: 1.5;
      }

      .credentials-card {
        background: #f8fafc;
        border: 1px solid var(--line, #e2e8f0);
        border-radius: var(--radius-sm, 6px);
        padding: 14px;
        text-align: left;
        margin-bottom: 20px;

        .cred-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          font-weight: 700;
          color: var(--navy, #0b1f3a);
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.04em;

          .copy-pill {
            cursor: pointer;
            font-size: 11px;
            color: #2563eb;
            font-weight: 600;
            padding: 2px 6px;
            background: #eff6ff;
            border-radius: 4px;

            &:hover {
              background: #dbeafe;
            }
          }
        }

        .cred-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px dashed var(--line, #e2e8f0);
          font-size: 13px;

          &:last-child {
            border-bottom: none;
          }

          .cred-label {
            color: var(--muted, #64748b);
          }

          .cred-value {
            font-weight: 600;
            color: var(--text, #0f172a);

            &.link {
              color: #2563eb;
              font-family: monospace;
            }

            &.password-highlight {
              color: #dc2626;
              font-family: monospace;
              background: #fef2f2;
              padding: 1px 6px;
              border-radius: 4px;
              border: 1px solid #fecaca;
            }
          }
        }
      }

      .success-actions {
        display: flex;
        justify-content: center;

        button {
          min-width: 180px;
        }
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.98); }
      to { opacity: 1; transform: scale(1); }
    }

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
        gap: 14px;

        .col {
          width: 100% !important;
        }

        .empty-col {
          display: none;
        }
      }

      .toolbar,
      .form-actions-left {
        flex-direction: column;
        align-items: stretch;

        .btn, button {
          width: 100%;
          justify-content: center;
        }
      }
    }
  `]
})
export class VendorRegistrationReqComponent {
  private readonly state = inject(PortalStateService);
  private readonly router = inject(Router);
  readonly vendorApi = inject(VendorApiService);

  readonly role = this.state.role;
  readonly requests = this.state.vendorRegistrationRequests;
  readonly directoryVendors = this.state.vendors;

  // Form State
  vendorId = '*** NEW ***';
  vendorName = '';
  vendorEmail = '';
  vendorContact = '';
  contactPerson = '';

  isSaved = false;
  nameError = false;
  emailTouched = false;
  emailError = '';

  // Suggestions
  showSuggestions = false;

  // Modals
  showLookupModal = false;
  modalSearchQuery = '';
  isSendingEmail = false;
  showSuccessModal = false;
  lastGeneratedPassword = '';

  // Requests Table Filter
  logSearchQuery = '';

  // Computed Suggestions from existing vendors directory
  readonly filteredSuggestions = computed(() => {
    const q = this.vendorName.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    return this.directoryVendors().filter(v =>
      v.name.toLowerCase().includes(q) || v.id.toLowerCase().includes(q)
    );
  });

  // Computed modal lookup list combining existing vendors and past requests
  readonly lookupVendorList = computed(() => {
    const map = new Map<string, { id: string; name: string; email: string; contactPerson: string; phone: string }>();

    // From directory
    for (const v of this.directoryVendors()) {
      map.set(v.id, {
        id: v.id,
        name: v.name,
        email: `${v.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@supplier.com`,
        contactPerson: 'Authorized Rep',
        phone: '+971 50 ' + Math.floor(1000000 + Math.random() * 9000000)
      });
    }

    // From registration requests
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
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.vendorEmail.trim()) {
      this.emailError = 'Email is required.';
    } else if (!emailPattern.test(this.vendorEmail.trim())) {
      this.emailError = 'Please enter a valid email address.';
    } else {
      this.emailError = '';
    }
  }

  // Lookup modal open / close
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

    // Simulate sending email via backend (like legacy loader)
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
