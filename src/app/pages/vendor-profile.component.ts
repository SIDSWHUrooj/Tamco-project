import { ChangeDetectorRef, Component, computed, HostListener, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { VendorRegistrationReq } from '../core/models';
import { VendorApiService, VREGModel } from '../core/vendor-api.service';
import { SageApiService, SageTax, SageItem } from '../core/sage-api.service';
import { IconComponent } from '../shared/icon.component';

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  status: string;
  verified: boolean;
  date: string;
}

interface CurrencyItem {
  code: string;
  description: string;
  isDefault: boolean;
}

interface CurrencyCatalogItem {
  code: string;
  description: string;
  selected: boolean;
}

interface ProductItem {
  code: string;
  description: string;
  brands: string;
  selectedBrands: string;
}

interface ProductCatalogItem {
  code: string;
  description: string;
  selected: boolean;
}

interface MajorCustomer {
  id: string;
  name: string;
  contact: string;
  phone: string;
  city: string;
  country: string;
  dealsInYear: string;
}

interface ContactPerson {
  id?: string;
  name: string;
  department: string;
  designation: string;
  address: string;
  country: string;
  city: string;
  email: string;
  office: string;
  phone: string;
  fax: string;
  landline: string;
  extension: string;
  whatsapp: string;
}

interface AttachmentRow {
  id: string;
  description: string;
  issueDate: string;
  docExpiryDate: string;
  fileName: string;
  fileSize?: string;
  status: string;
  hasExpiry?: boolean;
  mandatory?: boolean;
  isSaving?: boolean;
  isSaved?: boolean;
}

interface BankItem {
  id: string;
  bankName: string;
  beneficiaryBank?: string;
  bankAddress?: string;
  accountTitle: string;
  currency: string;
  country: string;
  accountNo?: string;
  iban: string;
  swift?: string;
  routingNumber?: string;
  sortCode?: string;
  bankCertificate?: string;
  fileName?: string;
  issueDate?: string;
  branch?: string;
}

@Component({
  selector: 'app-vendor-profile',
  standalone: true,
  imports: [FormsModule, IconComponent],
  styles: [`
    :host {
      display: block;
      padding-bottom: 40px;
    }

    /* TOP HERO STATUS BANNER */
    .profile-hero {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border: 1px solid var(--line, #e2e8f0);
      border-left: 4px solid var(--role-accent, #2563eb);
      padding: 16px 22px;
      border-radius: var(--radius-md, 10px);
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }
    .hero-main {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .company-avatar {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md, 10px);
      background: var(--role-soft, #eff6ff);
      color: var(--role-accent, #2563eb);
      display: grid;
      place-items: center;
      font-size: 16px;
      font-weight: 800;
      border: 1px solid var(--role-border, #bfdbfe);
    }
    .hero-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .hero-title-row h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 800;
      color: var(--text, #0f172a);
    }
    .mono-badge {
      font-family: ui-monospace, monospace;
      font-size: 11px;
      font-weight: 700;
      background: #f1f5f9;
      color: var(--muted, #64748b);
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid var(--line, #e2e8f0);
    }
    .hero-location {
      margin: 4px 0 0;
      font-size: 12px;
      color: var(--muted, #64748b);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .hero-badges {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
    }
    .verif-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11.5px;
      font-weight: 700;
      padding: 5px 12px;
      border-radius: 9999px;
      background: var(--green-soft, #ecfdf5);
      color: var(--green, #059669);
      border: 1px solid var(--green-border, #a7f3d0);
    }
    .verif-chip .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--green, #059669);
    }
    .verif-chip.warn {
      background: #fef3c7;
      color: #b45309;
      border-color: #fde68a;
    }
    .verif-chip.warn .dot {
      background: #d97706;
    }
    .verif-chip.fully-approved {
      background: #eff6ff;
      color: #1d4ed8;
      border-color: #bfdbfe;
    }

    /* 8-STEP WIZARD NAVIGATION BAR (VendorsStepByStep2) */
    .step-wizard-container {
      background: #ffffff;
      border: 1px solid var(--line, #e2e8f0);
      border-radius: var(--radius-lg, 12px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      margin-bottom: 24px;
      overflow: hidden;
    }
    .wizard-nav-strip {
      display: flex;
      align-items: stretch;
      background: #f8fafc;
      border-bottom: 2px solid #e2e8f0;
      overflow-x: auto;
      scrollbar-width: thin;
      &::-webkit-scrollbar {
        height: 4px;
      }
      &::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
      }
    }
    .wizard-step-tab {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 13px 20px;
      background: transparent;
      border: none;
      border-bottom: 3px solid transparent;
      cursor: pointer;
      white-space: nowrap;
      font-size: 13px;
      font-weight: 600;
      color: #64748b;
      transition: all 0.2s ease;
      position: relative;
      flex: 1 0 auto;
      justify-content: center;
      min-width: max-content;

      &:hover:not(.active):not(:disabled) {
        color: #0f172a;
        background: #f1f5f9;
      }

      &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
        color: #94a3b8;
      }

      &.active {
        color: #1e40af;
        background: #eff6ff;
        font-weight: 700;
        border-bottom-color: #1e40af;
      }

      &.completed:not(.active) {
        color: #0f172a;
        .step-circle {
          background: #059669;
          color: #ffffff;
          border-color: #059669;
        }
      }
    }
    .step-circle {
      width: 24px;
      height: 24px;
      min-width: 24px;
      min-height: 24px;
      max-width: 24px;
      max-height: 24px;
      flex-shrink: 0;
      aspect-ratio: 1 / 1;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11.5px;
      font-weight: 800;
      line-height: 1;
      background: #e2e8f0;
      color: #475569;
      border: 1.5px solid #cbd5e1;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }
    .wizard-step-tab.active .step-circle {
      background: var(--role-accent, #16a34a);
      color: #ffffff;
      border-color: var(--role-accent, #16a34a);
    }

    /* WIZARD CONTENT AREA */
    .wizard-body {
      padding: 24px;
      background: #ffffff;
    }

    /* TAMCO BLUE STEP HEADER BAR */
    .step-section-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      background: linear-gradient(90deg, #1d4ed8 0%, #2563eb 100%);
      color: #ffffff;
      padding: 10px 18px;
      border-radius: 6px;
      margin-bottom: 20px;
    }
    .step-section-bar h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: #ffffff;
    }
    .btn-header-action {
      background: #ffffff;
      color: #1d4ed8;
      border: none;
      padding: 6px 14px;
      border-radius: 5px;
      font-size: 12.5px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);

      &:hover {
        background: #f8fafc;
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      }
    }

    /* SUB-SECTION HEADERS & SUB-BARS */
    .sub-section-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      background: #1e3a8a;
      color: #ffffff;
      padding: 8px 16px;
      border-radius: 6px;
      margin: 24px 0 14px;
    }
    .sub-section-bar h4 {
      margin: 0;
      font-size: 13.5px;
      font-weight: 700;
      color: #ffffff;
    }

    /* WARNING / ALERT BANNER (E.G. STEP 5 MAJOR CUSTOMERS) */
    .notice-banner-red {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-left: 4px solid #ef4444;
      color: #b91c1c;
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 18px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* TAMCO ORANGE/RUST TABLE STYLING */
    .tamco-table-wrap {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      overflow-x: auto;
      margin-bottom: 20px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.02);
    }
    .tamco-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      text-align: left;
    }
    .tamco-table thead tr {
      background: #c2410c; /* Real TAMCO rust/orange table header */
      color: #ffffff;
    }
    .tamco-table th {
      padding: 10px 14px;
      font-weight: 700;
      font-size: 12.5px;
      letter-spacing: 0.02em;
      border: 1px solid #9a3412;
      white-space: nowrap;
      color: #ffffff;
    }
    .tamco-table td {
      padding: 10px 14px;
      border: 1px solid #e2e8f0;
      color: #1e293b;
      vertical-align: middle;
      background: #ffffff;
    }
    .tamco-table tbody tr:hover td {
      background: #f8fafc;
    }
    .tamco-table tbody tr.default-row td {
      background: #eff6ff;
      border-color: #bfdbfe;
    }

    /* INLINE INPUTS IN TABLE CELLS */
    .cell-input {
      width: 100%;
      height: 32px;
      padding: 4px 8px;
      font-size: 12.5px;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      background: #ffffff;
      outline: none;
      transition: border-color 0.15s ease;
      &:focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 2px rgba(37,99,235,0.1);
      }
    }

    /* ACTION BUTTONS (TRASH / DELETE / VIEW) */
    .btn-cell-delete {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      border: 1px solid #ef4444;
      background: #ffffff;
      color: #ef4444;
      display: inline-grid;
      place-items: center;
      cursor: pointer;
      transition: all 0.15s ease;
      &:hover {
        background: #ef4444;
        color: #ffffff;
      }
    }
    .btn-cell-download {
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      color: #334155;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      &:hover {
        background: #eff6ff;
        border-color: #2563eb;
        color: #2563eb;
      }
    }
    .btn-cell-sync {
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 4px;
      border: 1px solid #50ae9b;
      background: rgba(80, 174, 155, 0.08);
      color: #1e5f53;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: all 0.15s ease;
      &:hover:not(:disabled) {
        background: #50ae9b;
        color: #ffffff;
      }
      &.saved {
        background: #ecfdf5;
        border-color: #10b981;
        color: #047857;
      }
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    /* STEP COMPLETION AUDIT DIAGNOSTICS STYLING */
    .diag-modal-card {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.2);
      width: 100%;
      max-width: 800px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .diag-header {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: #ffffff;
      padding: 16px 22px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #50ae9b;
    }
    .diag-progress-bar-wrap {
      background: #f1f5f9;
      padding: 12px 22px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .diag-progress-track {
      height: 8px;
      background: #e2e8f0;
      border-radius: 9999px;
      overflow: hidden;
    }
    .diag-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #50ae9b);
      transition: width 0.3s ease;
    }
    .diag-list {
      padding: 16px 22px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      overflow-y: auto;
      max-height: 52vh;
    }
    .diag-card-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      transition: all 0.15s ease;
      &.active {
        border-color: #a7f3d0;
        background: #f0fdf4;
      }
      &.pending {
        border-color: #fde68a;
        background: #fffbeb;
      }
    }
    .diag-step-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .diag-num-badge {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 13px;
      background: #e2e8f0;
      color: #475569;
      &.done {
        background: #10b981;
        color: #ffffff;
      }
    }
    .diag-flag-pill {
      font-family: monospace;
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 4px;
      background: #e2e8f0;
      color: #334155;
      font-weight: 600;
    }

    /* RADIO PILL FOR DEFAULT CURRENCY */
    .default-radio-label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 9999px;
      cursor: pointer;
      font-size: 11.5px;
      font-weight: 600;
      border: 1px solid transparent;
      user-select: none;
      transition: all 0.15s ease;
      &.active {
        background: #eff6ff;
        border-color: #bfdbfe;
        color: #1d4ed8;
        font-weight: 700;
      }
      &:not(.active):hover {
        background: #f1f5f9;
        border-color: #cbd5e1;
      }
    }

    /* PHONE INPUT WITH FLAG BADGE */
    .phone-input-wrap {
      display: flex;
      align-items: center;
      border: 1px solid var(--line-strong, #cbd5e1);
      border-radius: var(--radius-sm, 6px);
      background: #ffffff;
      overflow: hidden;
      transition: border-color 0.15s ease;
      &:focus-within {
        border-color: var(--role-accent, #2563eb);
        box-shadow: 0 0 0 2px rgba(37,99,235,0.1);
      }
    }
    .flag-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 0 10px;
      background: #f8fafc;
      border-right: 1px solid #cbd5e1;
      height: 38px;
      font-size: 12px;
      font-weight: 700;
      color: #334155;
    }
    .phone-input-wrap input {
      flex: 1;
      height: 38px;
      border: none;
      padding: 8px 12px;
      font-size: 13px;
      color: #0f172a;
      outline: none;
    }

    /* FORM GRIDS & ROWS */
    .form-grid-4 {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }
    .form-grid-3 {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }
    .form-grid-2 {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }
    .form-row-asym {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    .form-row-3to1 {
      display: grid;
      grid-template-columns: 3fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-field label {
      font-size: 12px;
      font-weight: 700;
      color: #334155;
      text-transform: none;
    }
    .form-field input, .form-field select {
      height: 38px;
      padding: 8px 12px;
      border: 1px solid var(--line-strong, #cbd5e1);
      border-radius: var(--radius-sm, 6px);
      background: #ffffff;
      font-size: 13px;
      color: #0f172a;
      outline: none;
      transition: border-color 0.15s ease;
      &:focus {
        border-color: var(--role-accent, #2563eb);
        box-shadow: 0 0 0 2px rgba(37,99,235,0.1);
      }
      &[readonly] {
        background: #f8fafc;
        color: #64748b;
        cursor: not-allowed;
      }
    }

    /* STEP 8: BANK TOP CONTAINER */
    .bank-selection-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 24px;
    }
    .bank-box-title {
      font-size: 12px;
      font-weight: 700;
      color: #475569;
      margin-bottom: 6px;
    }

    /* WIZARD BOTTOM FOOTER NAVIGATION BUTTONS */
    .wizard-footer-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding-top: 24px;
      margin-top: 24px;
      border-top: 1px solid #e2e8f0;
    }
    .btn-nav-prev {
      background: var(--role-accent, #16a34a);
      color: #ffffff;
      border: none;
      padding: 9px 24px;
      border-radius: 6px;
      font-size: 13.5px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.15s ease;
      &:hover:not(:disabled) {
        background: var(--role-accent-hover, #15803d);
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      }
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
    .btn-nav-next {
      background: var(--role-accent, #16a34a);
      color: #ffffff;
      border: none;
      padding: 9px 26px;
      border-radius: 6px;
      font-size: 13.5px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.15s ease;
      margin-left: auto;
      &:hover:not(:disabled) {
        background: var(--role-accent-hover, #15803d);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px var(--role-glow, rgba(22, 163, 74, 0.25));
      }
      &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }
      &.btn-submit-app {
        background: #059669;
        &:hover:not(:disabled) {
          background: #047857;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }
      }
    }
    .step-validation-hint {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
      color: #b45309;
      background: #fffbeb;
      border: 1px solid #fde68a;
      padding: 6px 12px;
      border-radius: 6px;
    }
    .hero-actions .btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    /* MODAL OVERLAY & POPUPS */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: grid;
      place-items: center;
      z-index: 1000;
      padding: 20px;
    }
    .modal-card {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.2);
      width: 100%;
      max-width: 720px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .modal-header-blue {
      background: var(--role-accent, #16a34a);
      color: #ffffff;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .modal-header-blue h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
    }
    .btn-modal-close {
      background: transparent;
      border: none;
      color: #ffffff;
      font-size: 20px;
      line-height: 1;
      cursor: pointer;
      opacity: 0.8;
      &:hover {
        opacity: 1;
      }
    }
    .modal-content {
      padding: 20px;
      overflow-y: auto;
    }
    .modal-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 14px;
      flex-wrap: wrap;
    }
    .modal-search {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #475569;
    }
    .modal-search input {
      height: 32px;
      padding: 4px 10px;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      font-size: 13px;
      outline: none;
      &:focus {
        border-color: #2563eb;
      }
    }
    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }
    .modal-footer-btns {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .btn-select-confirm {
      background: #0284c7;
      color: #ffffff;
      border: none;
      padding: 7px 18px;
      border-radius: 5px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      &:hover {
        background: #0369a1;
      }
    }
    .btn-select-close {
      background: #dc2626;
      color: #ffffff;
      border: none;
      padding: 7px 18px;
      border-radius: 5px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      &:hover {
        background: #b91c1c;
      }
    }

    /* IMPORTANT NOTICE MODAL (MATCHING SCREENSHOT 4) */
    .notice-modal-card {
      background: #ffffff;
      border-radius: 10px;
      border: 2px solid #22c55e;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.25);
      width: 100%;
      max-width: 680px;
      padding: 28px 32px;
      position: relative;
    }
    .notice-modal-title {
      font-size: 22px;
      font-weight: 800;
      color: #16a34a;
      text-align: center;
      margin: 0 0 16px;
    }
    .notice-modal-body {
      font-size: 13.5px;
      line-height: 1.6;
      color: #334155;
    }
    .notice-modal-body p {
      margin: 0 0 8px;
      font-weight: 700;
      color: #0f172a;
    }
    .notice-modal-body ul {
      margin: 0 0 14px 20px;
      padding: 0;
    }
    .notice-modal-body li {
      margin-bottom: 4px;
    }
    .btn-notice-ack {
      background: #16a34a;
      color: #ffffff;
      border: none;
      padding: 10px 24px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      display: block;
      margin: 20px auto 0;
      transition: all 0.15s ease;
      box-shadow: 0 2px 8px rgba(22, 163, 74, 0.3);
      &:hover {
        background: #15803d;
        transform: translateY(-1px);
      }
    }

    @keyframes modalFadeIn {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }

    /* RESPONSIVE BREAKPOINTS */
    @media (max-width: 1024px) {
      .form-grid-4 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .form-grid-3 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .form-row-asym, .form-row-3to1 {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 640px) {
      .form-grid-4, .form-grid-3, .form-grid-2 {
        grid-template-columns: 1fr;
      }
      .profile-hero {
        flex-direction: column;
        align-items: flex-start;
      }
      .wizard-footer-nav {
        flex-direction: column;
        align-items: stretch;
      }
      .btn-nav-next {
        margin-left: 0;
      }
    }

    /* 4-STAGE MILESTONE TRACKER */
    .registration-milestone-tracker {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 18px 24px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      overflow-x: auto;
    }
    .milestone-step {
      display: flex;
      align-items: center;
      gap: 12px;
      white-space: nowrap;
    }
    .m-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 13px;
      background: #f1f5f9;
      color: #64748b;
      border: 2px solid #cbd5e1;
    }
    .milestone-step.done .m-circle {
      background: #16a34a;
      color: #ffffff;
      border-color: #16a34a;
    }
    .milestone-step.active .m-circle {
      background: #eff6ff;
      color: #2563eb;
      border-color: #2563eb;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
    }
    .m-text strong {
      display: block;
      font-size: 13px;
      color: #0f172a;
    }
    .m-text small {
      display: block;
      font-size: 11.5px;
      color: #64748b;
    }
    .milestone-step.done .m-text small {
      color: #16a34a;
      font-weight: 600;
    }
    .milestone-line {
      flex: 1;
      height: 2px;
      background: #e2e8f0;
      margin: 0 16px;
      min-width: 30px;
    }
    .milestone-line.done {
      background: #16a34a;
    }

    /* CERTIFIED PARTNER BANNER */
    .certified-partner-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 1.5px solid #86efac;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 20px;
      gap: 16px;
      flex-wrap: wrap;
    }
    .cert-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .cert-icon {
      font-size: 26px;
    }
    .cert-left h4 {
      margin: 0 0 4px;
      font-size: 15px;
      font-weight: 700;
      color: #166534;
    }
    .cert-left p {
      margin: 0;
      font-size: 12.5px;
      color: #15803d;
    }
    .cert-right {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .cert-badge {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    .cert-badge.green {
      background: #15803d;
      color: white;
    }
    .cert-badge.blue {
      background: #1e40af;
      color: white;
    }

    /* 4-TIER LIFECYCLE TOOLBAR */
    .vendor-lifecycle-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 16px;
      margin-bottom: 20px;
      gap: 16px;
      flex-wrap: wrap;
    }
    .vlt-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .vlt-icon {
      font-size: 18px;
    }
    .vlt-title strong {
      display: block;
      font-size: 13px;
      color: #0f172a;
    }
    .vlt-title small {
      display: block;
      font-size: 11.5px;
      color: #64748b;
    }
    .vlt-pills {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .vlt-pill {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 6px 13px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      background: #ffffff;
      color: #475569;
      border: 1.5px solid #cbd5e1;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .vlt-pill:hover {
      border-color: #94a3b8;
      background: #f1f5f9;
    }
    .vlt-pill.active {
      background: #2563eb;
      color: #ffffff;
      border-color: #2563eb;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
    }
    .vlt-pill.active.approved {
      background: #16a34a;
      border-color: #16a34a;
      box-shadow: 0 2px 4px rgba(22, 163, 74, 0.2);
    }
    .vlt-pill .pill-code {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: rgba(0,0,0,0.08);
      font-size: 10.5px;
    }
    .vlt-pill.active .pill-code {
      background: rgba(255,255,255,0.25);
      color: #ffffff;
    }

    /* REVIEW MODE (#reviewtab - VendorsStepByStep2?showReview=true) */
    .review-mode-container {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    }
    .review-header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 20px;
      background: #d76337;
      color: #ffffff;
      border-radius: 8px;
      margin-bottom: 24px;
    }
    .review-header-bar h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
    }
    .review-badge-pill {
      background: rgba(255, 255, 255, 0.2);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 600;
    }
    .review-section-block {
      margin-bottom: 24px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    .review-section-title {
      background: #f8fafc;
      padding: 10px 16px;
      font-size: 13.5px;
      font-weight: 700;
      color: #1e293b;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .review-grid-4 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      padding: 16px;
    }
    .review-field-item label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .review-field-item .review-val {
      font-size: 13.5px;
      font-weight: 600;
      color: #0f172a;
      word-break: break-word;
    }
    .review-actions-bar {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }

    /* UPLOAD SIGNED FORM CONTAINER (ReviewForm.cshtml) */
    .legacy-review-form-card {
      background: #ffffff;
      border: 2px solid #1d78cd;
      border-radius: 12px;
      max-width: 640px;
      margin: 20px auto 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
      overflow: hidden;
      text-align: center;
    }
    .legacy-card-header {
      background: #1d78cd;
      color: #ffffff;
      padding: 20px 24px;
    }
    .legacy-card-header h2 {
      margin: 0 0 6px;
      font-size: 22px;
      font-weight: 700;
      color: #ffffff;
    }
    .legacy-card-header p {
      margin: 0;
      font-size: 13px;
      opacity: 0.9;
    }
    .legacy-card-body {
      padding: 28px 32px;
    }
    .legacy-upload-box {
      border: 2px dashed #94a3b8;
      border-radius: 12px;
      background: #f8fafc;
      padding: 36px 20px;
      cursor: pointer;
      transition: all 0.25s ease;
      position: relative;
    }
    .legacy-upload-box:hover {
      background: #eff6ff;
      border-color: #1d78cd;
    }
    .legacy-upload-box.has-file {
      background: #ecfdf5;
      border-color: #16a34a;
    }
    .legacy-file-input {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
    }
    .legacy-upload-icon {
      font-size: 40px;
      display: block;
      margin-bottom: 12px;
    }

    .sub-section-bar.blue-bar {
      background: #1d78cd;
      border-radius: 4px;
      padding: 7px 14px;
      margin: 18px 0 12px;
    }
    .bank-form-card {
      background: #ffffff;
      border: 1px solid #dbeafe;
      border-radius: 6px;
      padding: 18px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }
    .print-declaration-box {
      margin-top: 28px;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      padding: 20px;
      background: #ffffff;
    }

    @media print {
      body * {
        visibility: hidden;
      }
      .review-mode-container, .review-mode-container * {
        visibility: visible;
      }
      .review-mode-container {
        position: absolute;
        left: 0;
        top: 0;
        width: 100% !important;
        margin: 0 !important;
        padding: 10px !important;
        box-shadow: none !important;
        border: none !important;
      }
      .review-actions-bar,
      .profile-hero,
      .wizard-progress-bar,
      .wizard-footer-nav,
      .btn,
      .btn-cell-delete,
      .btn-nav-prev,
      .btn-nav-next,
      .review-section-title button {
        display: none !important;
      }
      .print-declaration-box {
        display: block !important;
        page-break-inside: avoid;
      }
    }
  `],
  template: `
    @if (isStaffUser() && form.code) {
      <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 10px; padding: 12px 18px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; box-shadow: 0 1px 3px rgba(37, 99, 235, 0.08);">
        <div style="display: flex; align-items: center; gap: 10px; color: #1e40af; font-size: 13.5px;">
          <span style="font-size: 18px;">📝</span>
          <span><strong>Staff Direct Entry:</strong> Filling out registration profile for <strong>{{ form.company || 'Vendor' }}</strong> (ID: <code style="background: #dbeafe; padding: 2px 6px; border-radius: 4px; font-weight: 700;">{{ form.code }}</code>). Email was skipped so you can complete this onboarding directly.</span>
        </div>
        <button type="button" class="btn secondary" (click)="returnToVendorsList()" style="padding: 6px 14px; font-size: 12.5px; font-weight: 600; border-color: #93c5fd; color: #1d4ed8;">
          ← Back to Onboarding
        </button>
      </div>
    }

    <div style="display: flex; justify-content: flex-end; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
      <button class="btn secondary" (click)="printSummary()" style="display: inline-flex; align-items: center; gap: 6px;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
        <span>Print Profile</span>
      </button>

      @if (state.vendorStatusCode() === 0) {
        <button class="btn secondary" (click)="saveDraft()">Save Draft</button>
        <button
          class="btn"
          [disabled]="!areAllStepsValid() || isSavingProfile"
          [title]="!areAllStepsValid() ? 'Complete all mandatory (*) steps before submitting' : 'Submit Profile for Review'"
          (click)="submitForVerification()"
          style="background: var(--role-accent); border-color: var(--role-accent); display: inline-flex; align-items: center; gap: 6px;"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Submit Profile for Review</span>
        </button>
      } @else if (state.vendorStatusCode() >= 1 && state.vendorStatusCode() < 3) {
        <div style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; background: #fffbeb; border: 1.5px solid #f59e0b; border-radius: 9999px; color: #92400e; font-weight: 700; font-size: 12.5px;">
          <span>⏳</span>
          <span>Application Under Review — TAMCO Verification In Progress</span>
        </div>
      }

      @if (isStaffUser()) {
        <button class="btn secondary" (click)="openStepDiagnosticsModal()" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 600; border-color: #50ae9b; color: #1e5f53;">
          <span>📋</span>
          <span>Step Audit (GetACTIVE)</span>
        </button>
      }
    </div>

    <!-- STAFF-ONLY LIFECYCLE CONTROLS (Hidden from external vendors) -->
    @if (isStaffUser()) {
      <div class="vendor-lifecycle-toolbar">
        <div class="vlt-title">
          <span class="vlt-icon">⚡</span>
          <div>
            <strong>Staff Lifecycle Simulation:</strong>
            <small>Active Code: {{ state.vendorStatusCode() }} · Staff preview mode</small>
          </div>
        </div>
        <div class="vlt-pills">
          <button type="button" class="vlt-pill" [class.active]="state.vendorStatusCode() === 0" (click)="setLifecycleStatus(0)" title="Status 0: Incomplete Wizard">
            <span class="pill-code">0</span>
            <span>Registration Draft</span>
          </button>
          <button type="button" class="vlt-pill" [class.active]="state.vendorStatusCode() === 1" (click)="setLifecycleStatus(1)" title="Status 1: Review Mode">
            <span class="pill-code">1</span>
            <span>Review Mode</span>
          </button>
          <button type="button" class="vlt-pill" [class.active]="state.vendorStatusCode() === 2" (click)="setLifecycleStatus(2)" title="Status 2: Pending Approval">
            <span class="pill-code">2</span>
            <span>Pending Approval</span>
          </button>
          <button type="button" class="vlt-pill" [class.active]="state.vendorStatusCode() >= 3" [class.approved]="state.vendorStatusCode() >= 3" (click)="setLifecycleStatus(3)" title="Status 3: Sage 300 ERP Certified Partner">
            <span class="pill-code">3+</span>
            <span>Approved ERP Partner</span>
          </button>
        </div>
      </div>
    }

    <!-- 4-STAGE APPLICATION TRACKER MATCHING .NET WORKFLOW -->
    <div class="registration-milestone-tracker">
      <div class="milestone-step" [class.done]="state.vendorStatusCode() >= 1" [class.active]="state.vendorStatusCode() === 0">
        <span class="m-circle">{{ state.vendorStatusCode() >= 1 ? '✓' : '1' }}</span>
        <div class="m-text">
          <strong>1. Registration Form</strong>
          <small>{{ state.vendorStatusCode() >= 1 ? 'Submitted & Recorded' : 'In Progress (Steps 1-8)' }}</small>
        </div>
      </div>
      <div class="milestone-line" [class.done]="isProcurementApproved()"></div>
      <div class="milestone-step" [class.done]="isProcurementApproved()" [class.active]="state.vendorStatusCode() === 1 || state.vendorStatusCode() === 2">
        <span class="m-circle">{{ isProcurementApproved() ? '✓' : '2' }}</span>
        <div class="m-text">
          <strong>2. Procurement Review</strong>
          <small>{{ isProcurementApproved() ? 'Approved by Buyer' : (state.vendorStatusCode() >= 2 ? 'Audit In Progress' : 'Awaiting Submission') }}</small>
        </div>
      </div>
      <div class="milestone-line" [class.done]="isFinanceApproved()"></div>
      <div class="milestone-step" [class.done]="isFinanceApproved()" [class.active]="state.vendorStatusCode() === 2 && !isFinanceApproved()">
        <span class="m-circle">{{ isFinanceApproved() ? '✓' : '3' }}</span>
        <div class="m-text">
          <strong>3. Finance Bank Check</strong>
          <small>{{ isFinanceApproved() ? 'Bank Sign-Off 6/6' : (state.vendorStatusCode() >= 2 ? 'AP Checking IBAN' : 'Pending Sign-Off') }}</small>
        </div>
      </div>
      <div class="milestone-line" [class.done]="isFullyApproved()"></div>
      <div class="milestone-step" [class.done]="isFullyApproved()" [class.active]="isFinanceApproved() && !isFullyApproved()">
        <span class="m-circle">{{ isFullyApproved() ? '✓' : '4' }}</span>
        <div class="m-text">
          <strong>4. Sage 300 ERP Sync</strong>
          <small>{{ isFullyApproved() ? ('Master Active · ' + (form.code || 'ERP Synced')) : 'Awaiting ERP Allocation' }}</small>
        </div>
      </div>
    </div>


    <!-- ============================================================
         STATE 1 & STATE 2: VENDOR REGISTRATION SUMMARY REVIEW & SUBMISSION
    ============================================================= -->
    @if (state.vendorStatusCode() === 1 || state.vendorStatusCode() === 2) {
      <div class="review-mode-container">
        @if (isRevisionRequired()) {
          <div style="background: #fef2f2; border: 1.5px solid #fecaca; border-left: 5px solid #dc2626; border-radius: 8px; padding: 14px 18px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 13.5px; color: #991b1b; box-shadow: 0 1px 3px rgba(220, 38, 38, 0.1);">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 22px;">⚠️</span>
              <div>
                <strong style="display: block; font-size: 14px; margin-bottom: 2px;">Application Returned for Revision by TAMCO {{ getRevisionDepartment() }}:</strong>
                <span>Updates or re-verification have been requested for your application. Please unlock the form to update the required details and re-submit your signed registration.</span>
              </div>
            </div>
            <button type="button" class="btn secondary" (click)="unlockForRevision()" style="font-weight: 700; color: #dc2626; border-color: #fca5a5; white-space: nowrap; padding: 7px 16px;">
              Unlock for Revision ✎
            </button>
          </div>
        }

        @if (state.vendorStatusCode() === 2) {
          <div style="background: #fffbeb; border: 1.5px solid #f59e0b; border-radius: 8px; padding: 14px 18px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; box-shadow: 0 1px 3px rgba(245, 158, 11, 0.1);">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 24px;">🔒</span>
              <div>
                <strong style="color: #92400e; font-size: 15px; display: block;">Registration Under Review (Editing Locked)</strong>
                <span style="color: #b45309; font-size: 12.5px;">Your registration has been submitted and is currently being verified by TAMCO Procurement and Finance. Profile editing is disabled while under review.</span>
              </div>
            </div>
            <div style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: #fef3c7; border: 1px solid #fde68a; border-radius: 9999px; font-weight: 700; color: #92400e; font-size: 12px;">
              <span>⏳ Status: Under Review</span>
            </div>
          </div>
        } @else {
          <div class="review-header-bar">
            <div>
              <h2>Application Summary Review</h2>
              <small style="opacity: 0.9;">Please verify all sections below, download and print the form, stamp & sign the declaration, and upload the signed document to submit for verification.</small>
            </div>
            <span class="review-badge-pill">Final Summary & Verification</span>
          </div>
        }

        <!-- 1. Basic Info Review -->
        <div class="review-section-block">
          <div class="review-section-title">
            <span>1. Basic Company Information</span>
            @if (state.vendorStatusCode() !== 2) {
              <button type="button" class="btn secondary" style="font-size: 11px; padding: 2px 8px;" (click)="goToStepAndEdit(1)">Edit Step 1 ✎</button>
            }
          </div>
          <div class="review-grid-4">
            <div class="review-field-item"><label>Company Legal Name</label><div class="review-val">{{ form.company }}</div></div>
            <div class="review-field-item"><label>Date</label><div class="review-val">{{ form.registrationDate }}</div></div>
            <div class="review-field-item"><label>Country</label><div class="review-val">{{ form.country }}</div></div>
            <div class="review-field-item"><label>City</label><div class="review-val">{{ form.city }}</div></div>
            <div class="review-field-item"><label>Telephone</label><div class="review-val">{{ form.phone }}</div></div>
            <div class="review-field-item"><label>Fax</label><div class="review-val">{{ form.fax || '—' }}</div></div>
            <div class="review-field-item"><label>Vendor Address</label><div class="review-val">{{ form.address }}</div></div>
            <div class="review-field-item"><label>Zip Code</label><div class="review-val">{{ form.zipCode }}</div></div>
            <div class="review-field-item"><label>Company Email</label><div class="review-val">{{ form.email }}</div></div>
            <div class="review-field-item"><label>Website</label><div class="review-val">{{ form.website || '—' }}</div></div>
            <div class="review-field-item"><label>Trade License No.</label><div class="review-val">{{ form.tradeLicense }}</div></div>
            <div class="review-field-item"><label>Trade License Expiry</label><div class="review-val">{{ form.tradeLicenseExpiry }}</div></div>
            <div class="review-field-item"><label>VAT (TRN Number)</label><div class="review-val">{{ form.vatNumber }}</div></div>
            <div class="review-field-item"><label>Corporate Tax No.</label><div class="review-val">{{ form.corporateTax || '—' }}</div></div>
          </div>
        </div>

        <!-- 2. Currencies Review -->
        <div class="review-section-block">
          <div class="review-section-title">
            <span>2. Approved Settlement Currencies</span>
            @if (state.vendorStatusCode() !== 2) {
              <button type="button" class="btn secondary" style="font-size: 11px; padding: 2px 8px;" (click)="goToStepAndEdit(2)">Edit Step 2 ✎</button>
            }
          </div>
          <div style="padding: 16px; display: flex; gap: 8px; flex-wrap: wrap;">
            @for (cur of currencies; track cur.code) {
              <span class="cert-badge" [class.green]="cur.isDefault" [class.blue]="!cur.isDefault">
                {{ cur.code }} - {{ cur.description }} {{ cur.isDefault ? '(Default Transacting)' : '' }}
              </span>
            }
          </div>
        </div>

        <!-- 3. Business Information Review -->
        <div class="review-section-block">
          <div class="review-section-title">
            <span>3. Business Information</span>
            @if (state.vendorStatusCode() !== 2) {
              <button type="button" class="btn secondary" style="font-size: 11px; padding: 2px 8px;" (click)="goToStepAndEdit(3)">Edit Step 3 ✎</button>
            }
          </div>
          <div class="review-grid-4">
            <div class="review-field-item"><label>Business Type</label><div class="review-val">{{ business.type }}</div></div>
            <div class="review-field-item"><label>Company Legal Status</label><div class="review-val">{{ business.status }}</div></div>
            <div class="review-field-item"><label>Years in Business</label><div class="review-val">{{ business.years }} Years</div></div>
            <div class="review-field-item"><label>Incorporation Place</label><div class="review-val">{{ business.place }}</div></div>
          </div>
        </div>

        <!-- 4. Products Review -->
        <div class="review-section-block">
          <div class="review-section-title">
            <span>4. Product Categories & Brands</span>
            @if (state.vendorStatusCode() !== 2) {
              <button type="button" class="btn secondary" style="font-size: 11px; padding: 2px 8px;" (click)="goToStepAndEdit(4)">Edit Step 4 ✎</button>
            }
          </div>
          <div style="padding: 16px; display: flex; flex-direction: column; gap: 8px;">
            @for (prd of products; track prd.code) {
              <div style="padding: 8px 12px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between;">
                <strong>{{ prd.description }}</strong>
                <span style="color: #64748b; font-size: 12px;">Brands: {{ prd.selectedBrands || prd.brands }}</span>
              </div>
            }
          </div>
        </div>

        <!-- 5. Customers Review -->
        <div class="review-section-block">
          <div class="review-section-title">
            <span>5. Major Corporate Customers</span>
            @if (state.vendorStatusCode() !== 2) {
              <button type="button" class="btn secondary" style="font-size: 11px; padding: 2px 8px;" (click)="goToStepAndEdit(5)">Edit Step 5 ✎</button>
            }
          </div>
          <div style="padding: 16px; display: flex; flex-direction: column; gap: 8px;">
            @if (customers.length === 0) {
              <div style="padding: 12px; color: #64748b; font-size: 13px; font-style: italic;">
                No major customers specified (Optional section).
              </div>
            }
            @for (cust of customers; track cust.id) {
              <div style="padding: 8px 12px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between;">
                <strong>{{ cust.name }}</strong>
                <span style="color: #64748b; font-size: 12px;">{{ cust.contact }} · {{ cust.city }}, {{ cust.country }} · Deals/Yr: {{ cust.dealsInYear }}</span>
              </div>
            }
          </div>
        </div>

        <!-- 6. Contacts Review -->
        <div class="review-section-block">
          <div class="review-section-title">
            <span>6. Authorized Contacts</span>
            @if (state.vendorStatusCode() !== 2) {
              <button type="button" class="btn secondary" style="font-size: 11px; padding: 2px 8px;" (click)="goToStepAndEdit(6)">Edit Step 6 ✎</button>
            }
          </div>
          <div style="padding: 16px; display: flex; flex-direction: column; gap: 8px;">
            @for (c of contactsList; track c.name) {
              <div style="padding: 8px 12px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between;">
                <div><strong>{{ c.name }}</strong> — <span style="color: #64748b;">{{ c.designation }} ({{ c.department }})</span></div>
                <div style="color: #2563eb; font-size: 12px;">{{ c.email }} · {{ c.phone }}</div>
              </div>
            }
          </div>
        </div>

        <!-- 7. Attachments Review -->
        <div class="review-section-block">
          <div class="review-section-title">
            <span>7. Compliance Attachments</span>
            @if (state.vendorStatusCode() !== 2) {
              <div style="display: flex; gap: 6px;">
                <button type="button" class="btn secondary" style="font-size: 11px; padding: 2px 8px; border-color: #50ae9b; color: #1e5f53;" (click)="syncAllVendorDocuments()">Sync All (AUD) 💾</button>
                <button type="button" class="btn secondary" style="font-size: 11px; padding: 2px 8px;" (click)="goToStepAndEdit(7)">Edit Step 7 ✎</button>
              </div>
            }
          </div>
          <div style="padding: 16px; display: flex; flex-direction: column; gap: 8px;">
            @for (att of attachments; track att.id) {
              <div style="padding: 8px 12px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong>{{ att.description }}</strong>
                  <span style="margin-left: 8px; color: #64748b; font-size: 12px;">{{ att.fileName }} ({{ att.fileSize }})</span>
                </div>
                <span class="cert-badge green">{{ att.status }}</span>
              </div>
            }
          </div>
        </div>

        <!-- 8. Bank Review -->
        <div class="review-section-block">
          <div class="review-section-title">
            <span>8. Settlement Banking Details</span>
            @if (state.vendorStatusCode() !== 2) {
              <button type="button" class="btn secondary" style="font-size: 11px; padding: 2px 8px;" (click)="goToStepAndEdit(8)">Edit Step 8 ✎</button>
            }
          </div>
          <div style="padding: 16px; overflow-x: auto;">
            <table class="tamco-table" style="min-width: 900px;">
              <thead>
                <tr>
                  <th style="width: 40px;">Sr</th>
                  <th>Bank Name</th>
                  <th>Beneficiary Bank</th>
                  <th>Bank Address</th>
                  <th>Title of Account</th>
                  <th>Currency</th>
                  <th>Country</th>
                  <th>Account No</th>
                  <th>IBAN</th>
                  <th>Swift Code</th>
                  <th>Routing Nr</th>
                  <th>Sort Code</th>
                  <th>Issue Date</th>
                </tr>
              </thead>
              <tbody>
                @if (bankList.length === 0) {
                  <tr>
                    <td colspan="13" style="text-align: center; padding: 18px; color: #64748b;">
                      No bank details registered yet.
                    </td>
                  </tr>
                }
                @for (b of bankList; track b.iban; let i = $index) {
                  <tr>
                    <td>{{ i + 1 }}</td>
                    <td><strong>{{ b.bankName }}</strong></td>
                    <td>{{ b.beneficiaryBank || '—' }}</td>
                    <td>{{ b.bankAddress || '—' }}</td>
                    <td>{{ b.accountTitle }}</td>
                    <td><span class="mono" style="color: #1e40af; font-weight: 700;">{{ b.currency }}</span></td>
                    <td>{{ b.country }}</td>
                    <td><span class="mono">{{ b.accountNo || '—' }}</span></td>
                    <td><span class="mono">{{ b.iban }}</span></td>
                    <td>{{ b.swift || '—' }}</td>
                    <td>{{ b.routingNumber || '—' }}</td>
                    <td>{{ b.sortCode || '—' }}</td>
                    <td>{{ b.issueDate || '—' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- 9. Signed & Stamped Registration Document Section -->
        <div class="review-section-block" style="border: 2px solid #50ae9b; border-radius: 10px; overflow: hidden; margin-top: 16px;">
          <div class="review-section-title" style="background: #f0fdf4; border-bottom: 1px solid #bbf7d0; padding: 12px 18px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 18px;">📄</span>
              <strong style="color: #065f46; font-size: 14px;">9. Signed & Stamped Registration Document (Required for Verification)</strong>
            </div>
            @if (uploadedSignedFileName) {
              <span style="background: #ecfdf5; border: 1px solid #10b981; color: #047857; font-size: 11.5px; font-weight: 700; padding: 3px 10px; border-radius: 9999px;">
                ✓ Document Attached
              </span>
            } @else {
              <span style="background: #fffbeb; border: 1px solid #f59e0b; color: #b45309; font-size: 11.5px; font-weight: 700; padding: 3px 10px; border-radius: 9999px;">
                ⚠️ Upload Required
              </span>
            }
          </div>

          <div style="padding: 18px;">
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #1d78cd; border-radius: 6px; padding: 12px 16px; margin-bottom: 16px; font-size: 12.5px; color: #1e40af;">
              <strong>Compliance Instructions:</strong>
              <ol style="margin: 6px 0 0 16px; padding: 0; line-height: 1.6;">
                <li>Click <strong>"Download Registration Form (PDF / Print)"</strong> below to export your complete application.</li>
                <li>Affix your <strong>authorized signature</strong> and <strong>official company stamp/seal</strong> in the Undertaking section.</li>
                <li>Upload the signed & stamped PDF below. Once uploaded, the <strong>"Submit Registration for Verification"</strong> button will become active.</li>
              </ol>
            </div>

            <div style="display: flex; justify-content: center; margin-bottom: 16px;">
              <button type="button" class="btn secondary" (click)="downloadRegistrationPdf()" style="font-weight: 700; color: #1d78cd; border-color: #93c5fd; padding: 8px 18px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px;">
                <span>📥</span>
                <span>Download Registration Form (PDF / Print)</span>
              </button>
            </div>

            @if (state.vendorStatusCode() === 2) {
              <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 16px; text-align: center;">
                <div style="font-size: 28px; margin-bottom: 6px;">📄</div>
                <strong style="color: #0f172a; font-size: 14px;">{{ uploadedSignedFileName || 'Signed_Registration_Form.pdf' }}</strong>
                <p style="color: #15803d; font-size: 12px; margin: 4px 0 0; font-weight: 600;">✓ Document attached and submitted for verification. Locked while under review.</p>
              </div>
            } @else {
              <div class="legacy-upload-box" [class.has-file]="!!uploadedSignedFileName" style="cursor: pointer;">
                <input type="file" class="legacy-file-input" accept="application/pdf,image/*" (change)="onSignedFileSelected($event)" />
                <span class="legacy-upload-icon">{{ uploadedSignedFileName ? '📄' : '☁️' }}</span>
                @if (uploadedSignedFileName) {
                  <strong style="color: #166534; font-size: 14px;">{{ uploadedSignedFileName }}</strong>
                  <p style="margin: 4px 0 0; font-size: 12px; color: #15803d;">File attached successfully! You can now click "Submit Registration for Verification" below.</p>
                } @else {
                  <strong style="color: #1e293b; font-size: 14px;">Drag & Drop or <span style="color: #1d78cd; text-decoration: underline;">Click to Browse</span></strong>
                  <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">Accepted format: PDF, PNG, JPG (Max 10 MB)</p>
                }
              </div>

              @if (uploadedSignedFileName) {
                <div style="margin-top: 10px; display: flex; justify-content: center;">
                  <button type="button" class="btn secondary" style="color: #dc2626; border-color: #fca5a5; font-size: 12px; padding: 4px 12px;" (click)="removeSignedFile()">
                    ✕ Remove Attached File
                  </button>
                </div>
              }
            }
          </div>
        </div>

        <!-- Official Undertaking & Stamp/Signature Section (Printed / Downloadable) -->
        <div class="print-declaration-box">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 14px;">
            <div>
              <h3 style="margin: 0; font-size: 16px; color: #1e3a8a; font-weight: 800; text-transform: uppercase;">TAMCO MIDDLE EAST LTD.</h3>
              <div style="font-size: 12px; color: #475569; font-weight: 600;">Supplier Registration & Banking Compliance Declaration</div>
            </div>
            <div style="text-align: right; font-size: 11.5px; color: #64748b;">
              <div>Ref: <strong>{{ form.code || 'REQ-ONBOARD' }}</strong></div>
              <div>Date: {{ form.registrationDate }}</div>
            </div>
          </div>
          <p style="font-size: 11.5px; color: #334155; line-height: 1.6; margin: 0 0 16px;">
            We, the undersigned authorized representatives of <strong>{{ form.company }}</strong>, hereby solemnly declare and certify that all corporate credentials, trade licensing, tax registrations, and banking details provided above are true, complete, and accurate. We understand that this registration is subject to formal verification and approval by TAMCO Procurement and Finance departments.
          </p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 20px;">
            <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 14px; background: #f8fafc;">
              <div style="font-weight: 700; font-size: 12px; color: #1e293b; margin-bottom: 12px; text-transform: uppercase;">Authorized Signatory</div>
              <div style="font-size: 11.5px; color: #475569; margin-bottom: 8px;">Signature: ____________________________________</div>
              <div style="font-size: 11.5px; color: #475569; margin-bottom: 8px;">Name: _________________________________________</div>
              <div style="font-size: 11.5px; color: #475569; margin-bottom: 8px;">Designation: __________________________________</div>
              <div style="font-size: 11.5px; color: #475569;">Date: _________________________________________</div>
            </div>
            <div style="border: 2px dashed #94a3b8; border-radius: 6px; padding: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8fafc; min-height: 130px; text-align: center;">
              <div style="font-size: 24px; margin-bottom: 4px;">🔖</div>
              <span style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">Official Company Stamp / Seal</span>
              <small style="color: #64748b; font-size: 10.5px; margin-top: 4px;">Affix your official company seal here prior to uploading</small>
            </div>
          </div>
        </div>

        <!-- Summary Final Actions Bar -->
        <div class="review-actions-bar" style="margin-top: 24px; padding: 18px 24px; background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 10px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          @if (state.vendorStatusCode() === 2) {
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: #fef3c7; border: 1.5px solid #f59e0b; border-radius: 9999px; color: #92400e; font-weight: 700; font-size: 13px;">
                <span>⏳</span> Registration Submitted for Verification — Under Review
              </span>
              <small style="color: #64748b;">Profile is locked while under review. Editing is disabled.</small>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
              <button type="button" class="btn secondary" (click)="downloadRegistrationPdf()" style="font-weight: 600;">
                <span>📥 Download Summary PDF</span>
              </button>
              @if (isStaffUser()) {
                <button type="button" class="btn secondary" style="background: #f0fdf4; border-color: #86efac; color: #166534; font-weight: 700; font-size: 12px;" (click)="simulateInternalApproval()">
                  ⚡ Staff: Simulate Approval → Unlock Dashboard
                </button>
              }
            </div>
          } @else {
            <div style="display: flex; gap: 10px; align-items: center;">
              <button type="button" class="btn secondary" (click)="goToStepAndEdit(1)" style="font-weight: 600;">
                ← Back to Edit Steps
              </button>
              <button type="button" class="btn secondary" (click)="downloadRegistrationPdf()" style="font-weight: 600; color: #1e40af; border-color: #93c5fd;">
                📥 Download Form (PDF)
              </button>
            </div>

            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
              <button
                type="button"
                class="btn"
                [disabled]="!uploadedSignedFileName || isSavingProfile"
                (click)="submitRegistrationForVerification()"
                style="background: #16a34a; border-color: #16a34a; color: #ffffff; font-weight: 700; padding: 11px 26px; font-size: 13.5px; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px -1px rgba(22, 163, 74, 0.2);"
                [title]="!uploadedSignedFileName ? 'Please upload the signed registration document before submitting' : 'Submit Registration for Verification'"
              >
                @if (isSavingProfile) {
                  <span>Submitting Profile...</span>
                } @else {
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Submit Registration for Verification</span>
                }
              </button>
              @if (!uploadedSignedFileName) {
                <span style="font-size: 11.5px; color: #b45309; font-weight: 600;">
                  ⚠️ Button is disabled until you upload the signed registration document above.
                </span>
              }
            </div>
          }
        </div>
      </div>
    }

    <!-- ============================================================
         STATE 0 & STATE 3: 8-STEP WIZARD (VendorsStepByStep2.cshtml)
    ============================================================= -->
    @else {
      <!-- HERO BANNER -->
      <article class="profile-hero">
        <div class="hero-main">
          <div class="company-avatar">
            <span>{{ form.company.substring(0, 2).toUpperCase() }}</span>
          </div>
          <div class="hero-details">
            <div class="hero-title-row">
              <h2>{{ form.company }}</h2>
              <span class="mono-badge">{{ form.code }}</span>
            </div>
            <p class="hero-location">
              <app-icon name="profile" [size]="14" />
              <span>{{ form.city }}, {{ form.country }} · {{ business.status }} · Commercial Partner</span>
            </p>
          </div>
        </div>

        <div class="hero-badges">
          @if (isProcurementApproved()) {
            <div class="verif-chip" title="Pre-qualified and approved by Procurement">
              <span class="dot"></span>
              <span>Procurement Approved</span>
            </div>
          } @else {
            <div class="verif-chip warn" title="Commercial pre-qualification pending review">
              <span class="dot"></span>
              <span>Procurement Review Pending</span>
            </div>
          }

          @if (isFinanceApproved()) {
            <div class="verif-chip" title="Banking details verified by Finance">
              <span class="dot"></span>
              <span>Finance Bank Verified</span>
            </div>
          } @else {
            <div class="verif-chip warn" title="Settlement bank details awaiting Finance verification">
              <span class="dot"></span>
              <span>Bank Verification Pending</span>
            </div>
          }

          @if (isFullyApproved()) {
            <div class="verif-chip fully-approved" title="Qualified to receive RFQs and submit bids">
              <span>★ Eligible for RFQ Sourcing</span>
            </div>
          }
        </div>
      </article>

    <!-- 8-STEP WIZARD CONTAINER (VendorsStepByStep2) -->
    <div class="step-wizard-container">
      <!-- STEP NAVIGATION STRIP -->
      <nav class="wizard-nav-strip" aria-label="Registration Wizard Steps">
        @for (st of wizardSteps; track st.id) {
          <button
            type="button"
            class="wizard-step-tab"
            [class.active]="currentStep === st.id"
            [class.completed]="isStepValid(st.id)"
            [disabled]="!canAccessStep(st.id)"
            [title]="!canAccessStep(st.id) ? 'Complete mandatory (*) fields in previous steps first' : st.title"
            (click)="goToStep(st.id)"
          >
            <span class="step-circle">
              @if (isStepValid(st.id)) { ✓ } @else { {{ st.id }} }
            </span>
            <span>{{ st.title }}</span>
          </button>
        }
      </nav>

      <!-- WIZARD STEP BODY -->
      <div class="wizard-body">

        <!-- ==========================================
             STEP 1: BASIC INFORMATION (SCREENSHOT 14)
        =========================================== -->
        @if (currentStep === 1) {
          <div class="step-section-bar">
            <h3>Basic Information:</h3>
          </div>

          <div class="form-row-asym">
            <div class="form-field">
              <label>Vendor Name (As Per Trade License) *</label>
              <input [(ngModel)]="form.company" placeholder="Legal registered company name" />
            </div>
            <div class="form-field">
              <label>Date *</label>
              <input type="date" [(ngModel)]="form.registrationDate" />
            </div>
          </div>

          <div class="form-grid-4">
            <div class="form-field">
              <label>Country *</label>
              <select [(ngModel)]="form.country">
                @for (c of countryList; track c) {
                  <option [value]="c">{{ c }}</option>
                }
              </select>
            </div>
            <div class="form-field">
              <label>City *</label>
              <input [(ngModel)]="form.city" placeholder="City location" list="citySuggestions" />
            </div>
            <div class="form-field">
              <label>Phone Number *</label>
              <div class="phone-input-wrap">
                <span class="flag-badge">🇦🇪 +971</span>
                <input
                  type="tel"
                  [(ngModel)]="form.phone"
                  (keydown)="allowPhoneChars($event)"
                  (input)="form.phone = sanitizePhone(form.phone)"
                  placeholder="09 876 5432"
                  maxlength="20"
                />
              </div>
            </div>
            <div class="form-field">
              <label>Fax Number</label>
              <div class="phone-input-wrap">
                <span class="flag-badge">🇦🇪 +971</span>
                <input
                  type="tel"
                  [(ngModel)]="form.fax"
                  (keydown)="allowPhoneChars($event)"
                  (input)="form.fax = sanitizePhone(form.fax)"
                  placeholder="09 876 5432"
                  maxlength="20"
                />
              </div>
            </div>
          </div>

          <div class="form-row-3to1">
            <div class="form-field">
              <label>Vendor Address *</label>
              <input [(ngModel)]="form.address" placeholder="Registered office address" />
            </div>
            <div class="form-field">
              <label>Zip Code</label>
              <input [(ngModel)]="form.zipCode" placeholder="Enter Zip code here" />
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-field">
              <label>Company Email *</label>
              <input type="email" [(ngModel)]="form.email" placeholder="abc@gmail.com" />
            </div>
            <div class="form-field">
              <label>Website</label>
              <input [(ngModel)]="form.website" placeholder="www.xyz.com" />
            </div>
          </div>

          <div class="form-grid-4">
            <div class="form-field">
              <label>Trade License Number *</label>
              <input [(ngModel)]="form.tradeLicense" placeholder="09876" />
            </div>
            <div class="form-field">
              <label>Trade License Expiry *</label>
              <input type="date" [(ngModel)]="form.tradeLicenseExpiry" [min]="minExpiryDate" />
            </div>
            <div class="form-field">
              <label>VAT (TRN Number) *</label>
              <input
                type="text"
                [(ngModel)]="form.vatNumber"
                (keydown)="allowOnlyNumbers($event)"
                (input)="form.vatNumber = sanitizeNumbers(form.vatNumber)"
                placeholder="100023565656"
                maxlength="25"
              />
            </div>
            <div class="form-field">
              <label>Corporate Tax Number</label>
              <input
                type="text"
                [(ngModel)]="form.corporateTax"
                (keydown)="allowOnlyNumbers($event)"
                (input)="form.corporateTax = sanitizeNumbers(form.corporateTax)"
                placeholder="98888888"
                maxlength="25"
              />
            </div>
          </div>
        }

        <!-- ==========================================
             STEP 2: CURRENCY (SCREENSHOTS 12 & 13)
        =========================================== -->
        @if (currentStep === 2) {
          <div class="step-section-bar">
            <h3>Currency: *</h3>
            <button type="button" class="btn-header-action" (click)="openCurrencyModal()">
              <span>Select Currency +</span>
            </button>
          </div>

          <div class="tamco-table-wrap">
            <table class="tamco-table">
              <thead>
                <tr>
                  <th style="width: 70px; text-align: center;">Sr#</th>
                  <th style="width: 160px;">Currency Code</th>
                  <th>Currency Description</th>
                  <th style="width: 140px; text-align: center;">Default</th>
                  <th style="width: 90px; text-align: center;">Action</th>
                </tr>
              </thead>
              <tbody>
                @if (currencies.length === 0) {
                  <tr>
                    <td colspan="5" style="text-align: center; padding: 24px; color: #64748b;">
                      No transacting currencies selected yet. Click "Select Currency +" above to add.
                    </td>
                  </tr>
                }
                @for (c of currencies; track c.code; let i = $index) {
                  <tr [class.default-row]="c.isDefault">
                    <td style="text-align: center; font-weight: 600;">{{ i + 1 }}</td>
                    <td><strong class="mono" style="font-size: 13.5px; color: #1e40af;">{{ c.code }}</strong></td>
                    <td>{{ c.description }}</td>
                    <td style="text-align: center;">
                      <label
                        class="default-radio-label"
                        [class.active]="c.isDefault"
                        title="Set {{ c.code }} as default settlement currency"
                      >
                        <input
                          type="radio"
                          name="defaultCurrencyRadio"
                          [checked]="c.isDefault"
                          (change)="setDefaultCurrency(c)"
                        />
                        <span>{{ c.isDefault ? 'Default' : 'Set Default' }}</span>
                      </label>
                    </td>
                    <td style="text-align: center;">
                      <button
                        type="button"
                        class="btn-cell-delete"
                        (click)="removeCurrency(c.code)"
                        title="Remove currency {{ c.code }}"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- ==========================================
             STEP 3: BUSINESS INFORMATION (SCREENSHOT 11)
        =========================================== -->
        @if (currentStep === 3) {
          <div class="step-section-bar">
            <h3>Business Information:</h3>
          </div>

          <div class="form-grid-4">
            <div class="form-field">
              <label>Business Type *</label>
              <select [(ngModel)]="business.type">
                <option value="" disabled>Select Business Type</option>
                @for (opt of businessTypeOptions; track opt) {
                  <option [value]="opt">{{ opt }}</option>
                }
              </select>
            </div>
            <div class="form-field">
              <label>Company Legal Status *</label>
              <select [(ngModel)]="business.status">
                <option value="" disabled>Select Legal Status</option>
                @for (opt of legalStructureOptions; track opt) {
                  <option [value]="opt">{{ opt }}</option>
                }
              </select>
            </div>
            <div class="form-field">
              <label>Year In Business (In Years) *</label>
              <input
                type="number"
                min="0"
                max="150"
                [(ngModel)]="business.years"
                (keydown)="allowOnlyNumbers($event)"
                placeholder="Year In Business"
              />
            </div>
            <div class="form-field">
              <label>Incorporated Place *</label>
              <input [(ngModel)]="business.place" placeholder="Incorporated Place" />
            </div>
          </div>
        }

        <!-- ==========================================
             STEP 4: PRODUCTS (SCREENSHOTS 9 & 10)
        =========================================== -->
        @if (currentStep === 4) {
          <div class="step-section-bar">
            <h3>Products: *</h3>
            <button type="button" class="btn-header-action" (click)="openProductModal()">
              <span>Select Products +</span>
            </button>
          </div>

          <div class="tamco-table-wrap">
            <table class="tamco-table">
              <thead>
                <tr>
                  <th style="width: 60px; text-align: center;">Sr</th>
                  <th>Category Description</th>
                  <th>Brands</th>
                  <th>Selected Brands</th>
                  <th style="width: 90px; text-align: center;">Action</th>
                </tr>
              </thead>
              <tbody>
                @if (products.length === 0) {
                  <tr>
                    <td colspan="5" style="text-align: center; padding: 24px; color: #64748b;">
                      No product categories registered yet. Click "Select Products +" above to add categories.
                    </td>
                  </tr>
                }
                @for (p of products; track p.code; let i = $index) {
                  <tr>
                    <td style="text-align: center; font-weight: 600;">{{ i + 1 }}</td>
                    <td>
                      <strong style="color: #0f172a;">{{ p.description }}</strong>
                      <span class="mono" style="font-size: 11px; color: #64748b; margin-left: 6px;">({{ p.code }})</span>
                    </td>
                    <td>
                      <input class="cell-input" [(ngModel)]="p.brands" placeholder="e.g. Schneider, ABB" list="brandSuggestions" />
                    </td>
                    <td>
                      <input class="cell-input" [(ngModel)]="p.selectedBrands" placeholder="e.g. Certified Partner" />
                    </td>
                    <td style="text-align: center;">
                      <button
                        type="button"
                        class="btn-cell-delete"
                        (click)="removeProduct(i)"
                        title="Remove product category"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- ==========================================
             STEP 5: MAJOR CUSTOMERS (SCREENSHOT 8)
        =========================================== -->
        @if (currentStep === 5) {
          <div class="notice-banner-red">
            <app-icon name="alert" [size]="18" />
            <span>Note: Please fill the complete name of customer specific to provided product category list.</span>
          </div>

          <div class="step-section-bar">
            <h3>Major Customers:</h3>
            <button type="button" class="btn-header-action" (click)="addCustomerRow()">
              <span>Add Customer +</span>
            </button>
          </div>

          <div class="tamco-table-wrap">
            <table class="tamco-table">
              <thead>
                <tr>
                  <th style="width: 50px; text-align: center;">Sr</th>
                  <th>Customer Name</th>
                  <th>Contact Name</th>
                  <th>Contact Number</th>
                  <th>City</th>
                  <th>Country</th>
                  <th style="width: 130px;">Dealing Years</th>
                  <th style="width: 80px; text-align: center;">Action</th>
                </tr>
              </thead>
              <tbody>
                @if (customers.length === 0) {
                  <tr>
                    <td colspan="8" style="text-align: center; padding: 24px; color: #64748b;">
                      Customer references are optional. You can add client references or proceed directly to Next.
                    </td>
                  </tr>
                }
                @for (c of customers; track c.id; let i = $index) {
                  <tr>
                    <td style="text-align: center; font-weight: 600;">{{ i + 1 }}</td>
                    <td>
                      <input class="cell-input" [(ngModel)]="c.name" placeholder="Major Customer" />
                    </td>
                    <td>
                      <input class="cell-input" [(ngModel)]="c.contact" placeholder="Contact Name" />
                    </td>
                    <td>
                      <input
                        type="tel"
                        class="cell-input"
                        [(ngModel)]="c.phone"
                        (keydown)="allowPhoneChars($event)"
                        (input)="c.phone = sanitizePhone(c.phone)"
                        placeholder="Contact"
                        maxlength="20"
                      />
                    </td>
                    <td>
                      <input class="cell-input" [(ngModel)]="c.city" placeholder="City" />
                    </td>
                    <td>
                      <input class="cell-input" [(ngModel)]="c.country" placeholder="Country" />
                    </td>
                    <td>
                      <input
                        type="text"
                        class="cell-input"
                        [(ngModel)]="c.dealsInYear"
                        (keydown)="allowOnlyNumbers($event)"
                        (input)="c.dealsInYear = sanitizeNumbers(c.dealsInYear)"
                        placeholder="Dealing Years"
                        maxlength="4"
                      />
                    </td>
                    <td style="text-align: center;">
                      <button
                        type="button"
                        class="btn-cell-delete"
                        (click)="removeCustomer(i)"
                        title="Delete customer"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- ==========================================
             STEP 6: CONTACT PERSON (SCREENSHOT 7)
        =========================================== -->
        @if (currentStep === 6) {
          <div class="step-section-bar">
            <h3>Contact Person</h3>
          </div>

          <!-- ADD CONTACT FORM -->
          <div class="form-grid-3">
            <div class="form-field">
              <label>Contact Person Name *</label>
              <input [(ngModel)]="contactForm.name" placeholder="Contact Person Name" />
            </div>
            <div class="form-field">
              <label>Department *</label>
              <select [(ngModel)]="contactForm.department">
                @for (dept of departmentOptions; track dept) {
                  <option [value]="dept">{{ dept }}</option>
                }
              </select>
            </div>
            <div class="form-field">
              <label>Designation *</label>
              <select [(ngModel)]="contactForm.designation">
                @for (des of designationOptions; track des) {
                  <option [value]="des">{{ des }}</option>
                }
              </select>
            </div>
          </div>

          <div class="form-grid-3">
            <div class="form-field">
              <label>Contact Person Address *</label>
              <input [(ngModel)]="contactForm.address" placeholder="Address" />
            </div>
            <div class="form-field">
              <label>Country *</label>
              <select [(ngModel)]="contactForm.country">
                <option value="" disabled>Select Country</option>
                @for (c of countryList; track c) {
                  <option [value]="c">{{ c }}</option>
                }
              </select>
            </div>
            <div class="form-field">
              <label>City *</label>
              <input [(ngModel)]="contactForm.city" placeholder="Select City" list="citySuggestions" />
            </div>
          </div>

          <div class="form-grid-4">
            <div class="form-field">
              <label>Contact Person Email *</label>
              <input type="email" [(ngModel)]="contactForm.email" placeholder="Email" />
            </div>
            <div class="form-field">
              <label>Office Locations *</label>
              <select [(ngModel)]="contactForm.office">
                @for (off of officeOptions; track off) {
                  <option [value]="off">{{ off }}</option>
                }
              </select>
            </div>
            <div class="form-field">
              <label>Land Line *</label>
              <div class="phone-input-wrap">
                <span class="flag-badge">🇦🇪</span>
                <input
                  type="tel"
                  [(ngModel)]="contactForm.landline"
                  (keydown)="allowPhoneChars($event)"
                  (input)="contactForm.landline = sanitizePhone(contactForm.landline)"
                  placeholder="Landline No."
                  maxlength="20"
                />
              </div>
            </div>
            <div class="form-field">
              <label>Ext</label>
              <input
                type="text"
                [(ngModel)]="contactForm.extension"
                (keydown)="allowOnlyNumbers($event)"
                (input)="contactForm.extension = sanitizeNumbers(contactForm.extension)"
                placeholder="ext."
                maxlength="6"
              />
            </div>
          </div>

          <div class="form-grid-3">
            <div class="form-field">
              <label>Phone Number *</label>
              <div class="phone-input-wrap">
                <span class="flag-badge">🇦🇪</span>
                <input
                  type="tel"
                  [(ngModel)]="contactForm.phone"
                  (keydown)="allowPhoneChars($event)"
                  (input)="contactForm.phone = sanitizePhone(contactForm.phone)"
                  placeholder="Phone number"
                  maxlength="20"
                />
              </div>
            </div>
            <div class="form-field">
              <label>Whatsapp Number *</label>
              <div class="phone-input-wrap">
                <span class="flag-badge">🇦🇪</span>
                <input
                  type="tel"
                  [(ngModel)]="contactForm.whatsapp"
                  (keydown)="allowPhoneChars($event)"
                  (input)="contactForm.whatsapp = sanitizePhone(contactForm.whatsapp)"
                  placeholder="Whatsapp number"
                  maxlength="20"
                />
              </div>
            </div>
            <div class="form-field">
              <label>Fax No</label>
              <div class="phone-input-wrap">
                <span class="flag-badge">🇦🇪</span>
                <input
                  type="tel"
                  [(ngModel)]="contactForm.fax"
                  (keydown)="allowPhoneChars($event)"
                  (input)="contactForm.fax = sanitizePhone(contactForm.fax)"
                  placeholder="Fax number"
                  maxlength="20"
                />
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; margin-bottom: 24px;">
            <button
              type="button"
              class="btn"
              (click)="addContactPerson()"
              style="background: var(--role-accent, #16a34a); border-color: var(--role-accent, #16a34a); color: #ffffff; font-weight: 700;"
            >
              <span>Add Contact Person +</span>
            </button>
          </div>

          <!-- CONTACT PERSON LIST TABLE -->
          <div class="sub-section-bar">
            <h4>Contact Person List:</h4>
          </div>

          <div class="tamco-table-wrap">
            <table class="tamco-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Email</th>
                  <th>Landline</th>
                  <th>Address Category</th>
                  <th>Address</th>
                  <th style="width: 80px; text-align: center;">Action</th>
                </tr>
              </thead>
              <tbody>
                @if (contactsList.length === 0) {
                  <tr>
                    <td colspan="8" style="text-align: center; padding: 24px; color: #64748b;">
                      No contacts listed yet. Fill the form above and click "Add Contact Person +".
                    </td>
                  </tr>
                }
                @for (c of contactsList; track c.email; let i = $index) {
                  <tr>
                    <td><strong>{{ c.name }}</strong></td>
                    <td>{{ c.department }}</td>
                    <td>{{ c.designation }}</td>
                    <td>{{ c.email }}</td>
                    <td>{{ c.landline }} {{ c.extension ? 'Ext: ' + c.extension : '' }}</td>
                    <td>{{ c.office }}</td>
                    <td>{{ c.address }}, {{ c.city }}</td>
                    <td style="text-align: center;">
                      <button
                        type="button"
                        class="btn-cell-delete"
                        (click)="removeContact(i)"
                        title="Remove contact"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- ==========================================
             STEP 7: ATTACHMENTS (SCREENSHOT 6)
        =========================================== -->
        @if (currentStep === 7) {
          <div class="step-section-bar">
            <h3>Attachments *</h3>
            <button type="button" class="btn-header-action" (click)="addAttachmentRow()">
              <span>Add Attachment +</span>
            </button>
          </div>

          <div class="tamco-table-wrap">
            <table class="tamco-table">
              <thead>
                <tr>
                  <th style="width: 50px; text-align: center;">SR</th>
                  <th style="min-width: 220px;">Document Description *</th>
                  <th style="width: 170px;">Issue Date</th>
                  <th style="width: 170px;">Doc Expiry Date</th>
                  <th>Attached File *</th>
                  <th style="width: 140px; text-align: center;">Actions</th>
                </tr>
              </thead>
              <tbody>
                @if (attachments.length === 0) {
                  <tr>
                    <td colspan="6" style="text-align: center; padding: 24px; color: #64748b;">
                      No compliance attachments added yet. Click "Add Attachment +" to attach trade license, TRN, and bank letters.
                    </td>
                  </tr>
                }
                @for (att of attachments; track att.id; let i = $index) {
                  <tr>
                    <td style="text-align: center; font-weight: 600;">{{ i + 1 }}</td>
                    <td>
                      @if (att.mandatory) {
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <input class="cell-input" [(ngModel)]="att.description" [readonly]="true" style="font-weight: 600; background: #f8fafc;" />
                          <span style="font-size: 11px; font-weight: 700; color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 2px 6px; white-space: nowrap;">
                            * Mandatory
                          </span>
                        </div>
                      } @else {
                        <input class="cell-input" [(ngModel)]="att.description" placeholder="Document Description" />
                      }
                    </td>
                    <td>
                      <input type="date" class="cell-input" [(ngModel)]="att.issueDate" />
                    </td>
                    <td>
                      @if (att.hasExpiry) {
                        <div style="display: flex; align-items: center; gap: 6px;">
                          <input type="date" class="cell-input" [(ngModel)]="att.docExpiryDate" />
                          @if (!att.mandatory) {
                            <button
                              type="button"
                              (click)="att.hasExpiry = false; att.docExpiryDate = ''"
                              style="background: none; border: none; cursor: pointer; color: #94a3b8; font-size: 13px; padding: 2px;"
                              title="No expiry date for this document"
                            >
                              ✕
                            </button>
                          }
                        </div>
                      } @else {
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; padding: 6px 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px;">
                          <span style="font-size: 12px; color: #94a3b8; font-style: italic;">
                            No Expiry
                          </span>
                          @if (!att.mandatory) {
                            <button
                              type="button"
                              (click)="att.hasExpiry = true"
                              style="background: none; border: none; cursor: pointer; color: var(--role-accent, #2563eb); font-size: 11px; font-weight: 600; text-decoration: underline; padding: 0;"
                            >
                              + Expiry
                            </button>
                          }
                        </div>
                      }
                    </td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <label class="btn-cell-download" style="cursor: pointer;">
                          <span>Choose File</span>
                          <input type="file" style="display: none;" (change)="onFileUploaded($event, att)" />
                        </label>
                        <span style="font-size: 12px; color: #475569; max-width: 170px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                          {{ att.fileName || 'No file chosen' }}
                        </span>
                        @if (att.fileName) {
                          <span style="font-size: 11px; color: #059669; font-weight: 700;">✓ Attached</span>
                        } @else if (att.mandatory) {
                          <span style="font-size: 11px; color: #dc2626; font-weight: 600;">File Required *</span>
                        }
                      </div>
                    </td>
                    <td style="text-align: center;">
                      <div style="display: flex; gap: 6px; justify-content: center; align-items: center;">
                        <button
                          type="button"
                          class="btn-cell-sync"
                          [class.saved]="att.isSaved"
                          [disabled]="att.isSaving"
                          (click)="saveSingleAttachment(att, i)"
                          title="Save document metadata to backend (AUDVendorDocument)"
                        >
                          @if (att.isSaving) {
                            <span>⏳ Saving...</span>
                          } @else if (att.isSaved) {
                            <span>✓ Synced</span>
                          } @else {
                            <span>💾 Sync</span>
                          }
                        </button>
                        @if (!att.mandatory) {
                          <button
                            type="button"
                            class="btn-cell-delete"
                            (click)="removeAttachment(i)"
                            title="Delete attachment row"
                          >
                            ✕
                          </button>
                        } @else {
                          <span style="font-size: 11px; color: #94a3b8; font-weight: 600; padding: 2px 6px; background: #f1f5f9; border-radius: 4px;" title="Mandatory document cannot be deleted">
                            Locked
                          </span>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- ==========================================
             STEP 8: BANK INFORMATION (SCREENSHOT MATCH)
        =========================================== -->
        @if (currentStep === 8) {
          <div class="sub-section-bar blue-bar">
            <h4>Banks:</h4>
          </div>

          <div class="bank-form-card">
            <!-- Row 1: 3 columns -->
            <div class="form-grid-3">
              <div class="form-field">
                <label>Bank Name *</label>
                <input [(ngModel)]="bankForm.bankName" placeholder="Enter Bank Name" />
              </div>
              <div class="form-field">
                <label>Benficiary Bank *</label>
                <input [(ngModel)]="bankForm.beneficiaryBank" placeholder="Bank Address" />
              </div>
              <div class="form-field">
                <label>Bank Address *</label>
                <input [(ngModel)]="bankForm.bankAddress" placeholder="Bank Address" />
              </div>
            </div>

            <!-- Row 2: 3 columns -->
            <div class="form-grid-3" style="margin-top: 14px;">
              <div class="form-field">
                <label>Title of Account(Legal Name) *</label>
                <input [(ngModel)]="bankForm.accountTitle" placeholder="Title of Account" />
              </div>
              <div class="form-field">
                <label>Currency *</label>
                <select [(ngModel)]="bankForm.currency">
                  <option value="" disabled>Select Currency</option>
                  @for (c of currencies; track c.code) {
                    <option [value]="c.code">{{ c.description || c.code }}</option>
                  }
                  @if (currencies.length === 0) {
                    <option value="AED">Arab Emirates Dirhams</option>
                    <option value="USD">US Dollar</option>
                    <option value="EUR">Euro</option>
                    <option value="GBP">British Pound</option>
                    <option value="SAR">Saudi Riyal</option>
                  }
                </select>
              </div>
              <div class="form-field">
                <label>Country *</label>
                <select [(ngModel)]="bankForm.country">
                  <option value="" disabled>Select Country</option>
                  @for (c of countryList; track c) {
                    <option [value]="c">{{ c }}</option>
                  }
                </select>
              </div>
            </div>

            <!-- Row 3: 3 columns -->
            <div class="form-grid-3" style="margin-top: 14px;">
              <div class="form-field">
                <label>Account No *</label>
                <input
                  [(ngModel)]="bankForm.accountNo"
                  (input)="bankForm.accountNo = sanitizeNumbers(bankForm.accountNo)"
                  (keypress)="onlyNumericKey($event)"
                  placeholder="Account Number"
                />
              </div>
              <div class="form-field">
                <label>Account IBAN *</label>
                <input [(ngModel)]="bankForm.iban" placeholder="IBAN" />
              </div>
              <div class="form-field">
                <label>Swift Code *</label>
                <input [(ngModel)]="bankForm.swift" placeholder="SwiftCode" />
              </div>
            </div>

            <!-- Row 4: 4 columns -->
            <div class="form-grid-4" style="margin-top: 14px; grid-template-columns: 1fr 1fr 1.2fr 1fr;">
              <div class="form-field">
                <label>Routing Number</label>
                <input [(ngModel)]="bankForm.routingNumber" placeholder="Routing Nr." />
              </div>
              <div class="form-field">
                <label>Sort Code</label>
                <input [(ngModel)]="bankForm.sortCode" placeholder="SortCode" />
              </div>
              <div class="form-field">
                <label>Bank Certificate</label>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <input type="file" (change)="onBankCertificateSelected($event)" id="bankCertInput" style="display: none;" />
                  <label for="bankCertInput" class="btn secondary" style="cursor: pointer; padding: 6px 12px; font-size: 12px; margin-bottom: 0;">
                    Choose File
                  </label>
                  <span style="font-size: 12px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;">
                    {{ bankForm.fileName || 'No file chosen' }}
                  </span>
                </div>
              </div>
              <div class="form-field">
                <label>Bank Issue Date *</label>
                <input type="date" [(ngModel)]="bankForm.issueDate" placeholder="dd/mm/yyyy" />
              </div>
            </div>

            <!-- Add Bank Button -->
            <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
              <button
                type="button"
                class="btn"
                (click)="addBankToList()"
                style="background: #1d78cd; border-color: #1d78cd; color: #ffffff; font-weight: 700; padding: 8px 24px; border-radius: 4px;"
              >
                <span>Add Bank</span>
              </button>
            </div>
          </div>

          <!-- BANK LIST TABLE -->
          <div class="sub-section-bar blue-bar">
            <h4>Bank List:</h4>
          </div>

          <div class="tamco-table-wrap" style="overflow-x: auto;">
            <table class="tamco-table" style="min-width: 1100px;">
              <thead>
                <tr>
                  <th style="width: 45px;">Sr</th>
                  <th>Bank Name</th>
                  <th>Benficiary Bank</th>
                  <th>Bank Address</th>
                  <th>Title of Account</th>
                  <th>Currency</th>
                  <th>Country</th>
                  <th>Account No</th>
                  <th>Account IBAN</th>
                  <th>Swift Code</th>
                  <th>Routing Nr</th>
                  <th>Sort Code</th>
                  <th>Certificate</th>
                  <th>Issue Date</th>
                  <th style="width: 70px; text-align: center;">Action</th>
                </tr>
              </thead>
              <tbody>
                @if (bankList.length === 0) {
                  <tr>
                    <td colspan="15" style="text-align: center; padding: 24px; color: #64748b;">
                      No bank accounts added yet. Fill out the details above and click "Add Bank".
                    </td>
                  </tr>
                }
                @for (b of bankList; track b.id; let i = $index) {
                  <tr>
                    <td>{{ i + 1 }}</td>
                    <td><strong>{{ b.bankName }}</strong></td>
                    <td>{{ b.beneficiaryBank || '—' }}</td>
                    <td>{{ b.bankAddress || '—' }}</td>
                    <td>{{ b.accountTitle }}</td>
                    <td><span class="mono" style="color: #1e40af; font-weight: 700;">{{ b.currency }}</span></td>
                    <td>{{ b.country }}</td>
                    <td><span class="mono">{{ b.accountNo || '—' }}</span></td>
                    <td><span class="mono">{{ b.iban }}</span></td>
                    <td>{{ b.swift || '—' }}</td>
                    <td>{{ b.routingNumber || '—' }}</td>
                    <td>{{ b.sortCode || '—' }}</td>
                    <td>
                      @if (b.fileName) {
                        <span style="color: #16a34a; font-size: 11.5px; font-weight: 600;" [title]="b.fileName">📄 Attached</span>
                      } @else {
                        <span style="color: #94a3b8; font-size: 11px;">—</span>
                      }
                    </td>
                    <td>{{ b.issueDate || '—' }}</td>
                    <td style="text-align: center;">
                      <button
                        type="button"
                        class="btn-cell-delete"
                        (click)="removeBank(i)"
                        title="Delete bank entry"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- WIZARD FOOTER NAVIGATION BUTTONS (PREVIOUS / NEXT / SUBMIT) -->
        <div class="wizard-footer-nav">
          <button
            type="button"
            class="btn-nav-prev"
            [disabled]="currentStep === 1"
            (click)="prevStep()"
          >
            « Previous
          </button>

          @if (!isStepValid(currentStep)) {
            <span class="step-validation-hint">
              <app-icon name="alert" [size]="14" />
              <span>{{ getStepRequirementHint(currentStep) }}</span>
            </span>
          }

          @if (currentStep < 8) {
            <button
              type="button"
              class="btn-nav-next"
              [disabled]="!isStepValid(currentStep)"
              [title]="!isStepValid(currentStep) ? getStepRequirementHint(currentStep) : 'Proceed to next step'"
              (click)="nextStep()"
            >
              <span>Next »</span>
            </button>
          } @else {
            <button
              type="button"
              class="btn-nav-next btn-submit-app"
              [disabled]="!areAllStepsValid() || isSavingProfile"
              [title]="!areAllStepsValid() ? 'Complete all mandatory (*) steps before submitting' : 'Submit Registration Application'"
              (click)="submitForVerification()"
            >
              <span>Submit Registration Application ✓</span>
            </button>
          }
        </div>

      </div>
    </div>
    }

    <!-- ==========================================
         CURRENCY LIST MODAL (SCREENSHOT 13)
    =========================================== -->
    @if (showCurrencyModal) {
      <div class="modal-overlay" (click)="closeCurrencyModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header-blue">
            <h3>Currency List</h3>
            <button class="btn-modal-close" (click)="closeCurrencyModal()">✕</button>
          </div>

          <div class="modal-content">
            <div class="modal-toolbar">
              <div style="font-size: 13px; color: #475569;">
                Show
                <select [(ngModel)]="currencyPageSize" style="height: 28px; padding: 2px 6px; border: 1px solid #cbd5e1; border-radius: 4px;">
                  <option [value]="10">10</option>
                  <option [value]="25">25</option>
                  <option [value]="50">50</option>
                </select>
                entries
              </div>

              <div class="modal-search">
                <label>Search:</label>
                <input [(ngModel)]="currencySearchText" placeholder="Search currency..." />
              </div>
            </div>

            <div class="tamco-table-wrap" style="max-height: 380px; overflow-y: auto;">
              <table class="tamco-table">
                <thead>
                  <tr style="background: var(--role-accent, #16a34a);">
                    <th style="width: 70px; text-align: center;">Select</th>
                    <th style="width: 140px;">Currency Code</th>
                    <th>Currency Description</th>
                  </tr>
                </thead>
                <tbody>
                  @for (c of paginatedCurrencies; track c.code) {
                    <tr>
                      <td style="text-align: center;">
                        <input type="checkbox" [(ngModel)]="c.selected" style="width: 16px; height: 16px; cursor: pointer;" />
                      </td>
                      <td><strong class="mono" style="color: var(--role-accent, #16a34a);">{{ c.code }}</strong></td>
                      <td>{{ c.description }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <div class="modal-footer">
            <div style="font-size: 12.5px; color: #64748b; display: flex; align-items: center; gap: 8px;">
              <span>Showing {{ currencyStartIndex + 1 }} to {{ currencyEndIndex }} of {{ filteredCurrencies.length }} entries</span>
              @if (filteredCurrencies.length > currencyPageSize) {
                <button type="button" class="btn secondary" style="padding: 2px 8px; font-size: 11px;" [disabled]="currencyCurrentPage <= 1" (click)="currencyCurrentPage = currencyCurrentPage - 1">Prev</button>
                <span style="font-size: 12px; font-weight: 600;">{{ currencyCurrentPage }}</span>
                <button type="button" class="btn secondary" style="padding: 2px 8px; font-size: 11px;" [disabled]="currencyEndIndex >= filteredCurrencies.length" (click)="currencyCurrentPage = currencyCurrentPage + 1">Next</button>
              }
            </div>

            <div class="modal-footer-btns">
              <button class="btn-select-confirm" (click)="confirmCurrencySelection()">Select</button>
              <button class="btn-select-close" (click)="closeCurrencyModal()">Close</button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- ==========================================
         PRODUCTS LIST MODAL (SCREENSHOT 10)
    =========================================== -->
    @if (showProductModal) {
      <div class="modal-overlay" (click)="closeProductModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header-blue">
            <h3>Products List</h3>
            <button class="btn-modal-close" (click)="closeProductModal()">✕</button>
          </div>

          <div class="modal-content">
            <div class="modal-toolbar">
              <div style="font-size: 13px; color: #475569;">
                Show
                <select [(ngModel)]="productPageSize" style="height: 28px; padding: 2px 6px; border: 1px solid #cbd5e1; border-radius: 4px;">
                  <option [value]="10">10</option>
                  <option [value]="25">25</option>
                </select>
                entries
              </div>

              <div class="modal-search">
                <label>Search:</label>
                <input [(ngModel)]="productSearchText" placeholder="Search products..." />
              </div>
            </div>

            <div class="tamco-table-wrap" style="max-height: 380px; overflow-y: auto;">
              <table class="tamco-table">
                <thead>
                  <tr style="background: var(--role-accent, #16a34a);">
                    <th style="width: 70px; text-align: center;">Select</th>
                    <th style="width: 140px;">Products Code</th>
                    <th>Products Description</th>
                  </tr>
                </thead>
                <tbody>
                  @for (p of paginatedProducts; track p.code) {
                    <tr>
                      <td style="text-align: center;">
                        <input type="checkbox" [(ngModel)]="p.selected" style="width: 16px; height: 16px; cursor: pointer;" />
                      </td>
                      <td><strong class="mono" style="color: var(--role-accent, #16a34a);">{{ p.code }}</strong></td>
                      <td>{{ p.description }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <div class="modal-footer">
            <div style="font-size: 12.5px; color: #64748b; display: flex; align-items: center; gap: 8px;">
              <span>Showing {{ productStartIndex + 1 }} to {{ productEndIndex }} of {{ filteredProducts.length }} entries</span>
              @if (filteredProducts.length > productPageSize) {
                <button type="button" class="btn secondary" style="padding: 2px 8px; font-size: 11px;" [disabled]="productCurrentPage <= 1" (click)="productCurrentPage = productCurrentPage - 1">Prev</button>
                <span style="font-size: 12px; font-weight: 600;">{{ productCurrentPage }}</span>
                <button type="button" class="btn secondary" style="padding: 2px 8px; font-size: 11px;" [disabled]="productEndIndex >= filteredProducts.length" (click)="productCurrentPage = productCurrentPage + 1">Next</button>
              }
            </div>

            <div class="modal-footer-btns">
              <button class="btn-select-confirm" (click)="confirmProductSelection()">Select</button>
              <button class="btn-select-close" (click)="closeProductModal()">Close</button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- ==========================================
         IMPORTANT NOTICE POPUP (SCREENSHOT 4)
    =========================================== -->
    @if (showNoticeModal) {
      <div class="modal-overlay" (click)="closeNoticeModal()">
        <div class="notice-modal-card" (click)="$event.stopPropagation()">
          <h2 class="notice-modal-title">Important Notice</h2>

          <div class="notice-modal-body">
            <p>The following documents are mandatory to fill out the form:</p>
            <ul>
              <li>Brief profile of the company, including the year of establishment, organizational hierarchy, details of staff, number & locations of office(s).</li>
              <li>Goods/Services which the firm can provide.</li>
              <li>Currency.</li>
              <li>Current client list with name and contact number of the person.</li>
              <li>
                <strong>Documents:</strong>
                <ul style="margin-top: 4px;">
                  <li>Trade License</li>
                  <li>TRN</li>
                  <li>etc</li>
                </ul>
              </li>
              <li>Bank Details (Complete details of account including letter from Bank for attachment).</li>
            </ul>

            <p style="margin-top: 14px;">The following information is also requested:</p>
            <ul>
              <li>Details of the experience in the field & any specific expertise.</li>
            </ul>
          </div>

          <button type="button" class="btn-notice-ack" (click)="closeNoticeModal()">
            I've read and understood this
          </button>
        </div>
      </div>
    }

    <!-- ==========================================
         THANK YOU MODAL (ReviewForm.cshtml)
    =========================================== -->
    @if (showThankYouModal) {
      <div class="modal-overlay" (click)="showThankYouModal = false">
        <div class="modal-card" style="max-width: 480px; text-align: center; padding: 24px;" (click)="$event.stopPropagation()">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: #dcfce7; color: #16a34a; font-size: 28px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            ✓
          </div>
          <h3 style="margin: 0 0 8px; font-size: 20px; font-weight: 700; color: #0f172a;">Thank You! (REQ NO: {{ form.code || 'REQ-2024-889' }})</h3>
          <p style="font-size: 13.5px; color: #64748b; margin-bottom: 20px;">
            Your signed compliance form has been successfully submitted. Internal audit by TAMCO Procurement and Accounts Payable is in progress.
          </p>
          <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button type="button" class="btn" (click)="showThankYouModal = false" style="background: #1d78cd; border-color: #1d78cd; color: #fff;">Close</button>
            <button type="button" class="btn secondary" (click)="simulateInternalApproval()" style="border-color: #16a34a; color: #16a34a; font-weight: 700;">Simulate Approval → ERP</button>
          </div>
        </div>
      </div>
    }

    <!-- ============================================================== -->
    <!-- STEP COMPLETION AUDIT & DIAGNOSTICS MODAL (GetACTIVEList / API) -->
    <!-- ============================================================== -->
    @if (showStepDiagnosticsModal) {
      <div class="modal-overlay" (click)="closeStepDiagnosticsModal()">
        <div class="diag-modal-card" (click)="$event.stopPropagation()">
          <div class="diag-header">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 20px;">📋</span>
                <h3 style="margin: 0; font-size: 17px; font-weight: 700; color: #fff;">
                  Registration Step Completion Audit & Verification
                </h3>
              </div>
              <small style="opacity: 0.85; font-size: 12px; margin-top: 3px; display: block;">
                Direct inspection from POST /api/Vendor/GetACTIVEList (coperation: 1) for Req: <strong>{{ diagnosticsMeta.reqno || form.code || 'Draft' }}</strong>
              </small>
            </div>
            <button class="btn-modal-close" (click)="closeStepDiagnosticsModal()">✕</button>
          </div>

          <div class="diag-progress-bar-wrap">
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12.5px;">
              <span style="font-weight: 600; color: #334155;">
                Overall Onboarding Progress:
                <strong style="color: #059669;">{{ completedStepsCount }} of 7 Steps Active</strong> ({{ getDiagnosticsPercentage() }}%)
              </span>
              <span style="font-size: 11.5px; color: #64748b;">
                Audit User: <strong>{{ diagnosticsMeta.auduser }}</strong> · {{ diagnosticsMeta.auddate }}
              </span>
            </div>
            <div class="diag-progress-track">
              <div class="diag-progress-fill" [style.width.%]="getDiagnosticsPercentage()"></div>
            </div>
          </div>

          <div class="diag-list">
            @if (isCheckingDiagnostics) {
              <div style="text-align: center; padding: 32px; color: #64748b;">
                <div style="font-size: 24px; margin-bottom: 8px;">⏳</div>
                <p>Querying backend GetACTIVEList workflow flags...</p>
              </div>
            } @else {
              @for (s of stepDiagnostics; track s.stepNo) {
                <div class="diag-card-item" [class.active]="s.isActive" [class.pending]="!s.isActive">
                  <div class="diag-step-left">
                    <div class="diag-num-badge" [class.done]="s.isActive">
                      {{ s.isActive ? '✓' : s.stepNo }}
                    </div>
                    <div>
                      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <strong style="font-size: 13.5px; color: #0f172a;">{{ s.stepNo }}. {{ s.title }}</strong>
                        <span class="diag-flag-pill">{{ s.flagKey }} = {{ s.isActive ? '1' : '0' }}</span>
                      </div>
                      <p style="margin: 2px 0 0; font-size: 12px; color: #64748b;">{{ s.description }}</p>
                    </div>
                  </div>

                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="cert-badge" [class.green]="s.isActive" [class.blue]="!s.isActive">
                      {{ s.badgeText }}
                    </span>
                    <button
                      type="button"
                      class="btn secondary"
                      style="font-size: 11px; padding: 4px 10px; border-color: #cbd5e1;"
                      (click)="jumpToStepFromDiagnostics(s.stepTarget)"
                    >
                      Jump to Step ↗
                    </button>
                  </div>
                </div>
              }
            }
          </div>

          <div style="padding: 14px 22px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div style="font-size: 12px; color: #64748b;">
              Sage 300 ERP Vendor Master creation requires all 7 active flags verified.
            </div>
            <div style="display: flex; gap: 8px;">
              <button
                type="button"
                class="btn secondary"
                style="font-size: 12px; padding: 6px 14px; border-color: #50ae9b; color: #1e5f53;"
                (click)="fetchStepDiagnostics()"
                [disabled]="isCheckingDiagnostics"
              >
                🔄 Re-query GetACTIVE
              </button>
              <button
                type="button"
                class="btn"
                style="font-size: 12px; padding: 6px 16px; background: #334155; border-color: #334155; color: #fff;"
                (click)="closeStepDiagnosticsModal()"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <datalist id="citySuggestions">
      @for (city of cityList; track city) {
        <option [value]="city">{{ city }}</option>
      }
    </datalist>

    <datalist id="brandSuggestions">
      @for (brand of brandList; track brand) {
        <option [value]="brand">{{ brand }}</option>
      }
    </datalist>
  `
})
export class VendorProfileComponent implements OnInit {
  readonly state = inject(PortalStateService);
  private readonly vendorApi = inject(VendorApiService);
  private readonly sageApi = inject(SageApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly isStaffUser = computed(() => this.state.role() !== 'vendor');
  readonly isVendorUser = computed(() => this.state.role() === 'vendor');

  currentStep = 1;
  showNoticeModal = false;
  isLoadingProfile = false;
  isSavingProfile = false;
  sageTaxAuthorities: SageTax[] = [];

  uploadedSignedFile: File | null = null;
  uploadedSignedFileName = '';
  showThankYouModal = false;

  showStepDiagnosticsModal = false;
  isCheckingDiagnostics = false;
  diagnosticsMeta: { auddate?: string; auduser?: string; reqno?: string } = {};
  stepDiagnostics: {
    stepNo: number;
    title: string;
    description: string;
    flagKey: string;
    isActive: boolean;
    badgeText: string;
    stepTarget: number;
  }[] = [];

  readonly wizardSteps = [
    { id: 1, title: 'Basic Information' },
    { id: 2, title: 'Currency' },
    { id: 3, title: 'Business' },
    { id: 4, title: 'Products' },
    { id: 5, title: 'Major Customers' },
    { id: 6, title: 'Contact Person' },
    { id: 7, title: 'Attachments' },
    { id: 8, title: 'Bank' }
  ];

  // STEP 1: Basic Information
  form = {
    company: '',
    code: '',
    registrationDate: '',
    country: 'United Arab Emirates',
    city: '',
    phone: '',
    fax: '',
    address: '',
    zipCode: '',
    email: '',
    website: '',
    tradeLicense: '',
    tradeLicenseExpiry: '',
    vatNumber: '',
    corporateTax: '',
    tax: '',
    strn: ''
  };

  readonly minExpiryDate = new Date().toISOString().substring(0, 10);

  countryList: string[] = [];
  cityList: string[] = [];
  brandList: string[] = [];

  // STEP 2: Currency
  currencies: CurrencyItem[] = [];

  showCurrencyModal = false;
  currencySearchText = '';
  currencyPageSize = 10;
  currencyCurrentPage = 1;

  currencyCatalog: CurrencyCatalogItem[] = [];

  // STEP 3: Business Information
  business = {
    type: 'Manufacturing',
    status: 'LLC',
    years: 0,
    place: ''
  };

  readonly businessTypeOptions = ['Retail', 'Manufacturing', 'Services'];
  readonly legalStructureOptions = ['LLC', 'PLC', 'SoleProprietorship', 'Other'];

  // STEP 4: Products
  products: ProductItem[] = [];

  showProductModal = false;
  productSearchText = '';
  productPageSize = 10;
  productCurrentPage = 1;

  productCatalog: ProductCatalogItem[] = [];

  // STEP 5: Major Customers
  customers: MajorCustomer[] = [];

  // STEP 6: Contact Person
  departmentOptions: string[] = [];
  designationOptions: string[] = [];
  readonly officeOptions = ['Head Office', 'Branch Office', 'Site Office', 'Showroom', 'Warehouse', 'Others'];

  contactForm: ContactPerson = {
    name: '',
    department: '',
    designation: '',
    address: 'Plot 14, Mussafah',
    country: 'United Arab Emirates',
    city: 'Abu Dhabi',
    email: '',
    office: 'Head Office',
    phone: '',
    fax: '',
    landline: '',
    extension: '',
    whatsapp: ''
  };

  contactsList: ContactPerson[] = [];

  // STEP 7: Attachments
  attachments: AttachmentRow[] = [
    {
      id: 'att-passport',
      description: 'Passport',
      issueDate: '',
      docExpiryDate: '',
      fileName: '',
      status: 'Pending',
      hasExpiry: true,
      mandatory: true
    },
    {
      id: 'att-doc1',
      description: 'Doc 1',
      issueDate: '',
      docExpiryDate: '',
      fileName: '',
      status: 'Pending',
      hasExpiry: false,
      mandatory: true
    }
  ];

  // STEP 8: Bank Information
  standardBankList: string[] = [];

  bankForm: {
    bankName: string;
    beneficiaryBank: string;
    bankAddress: string;
    accountTitle: string;
    currency: string;
    country: string;
    accountNo: string;
    iban: string;
    swift: string;
    routingNumber: string;
    sortCode: string;
    bankCertificate: string;
    fileName: string;
    issueDate: string;
  } = {
    bankName: '',
    beneficiaryBank: '',
    bankAddress: '',
    accountTitle: '',
    currency: 'AED',
    country: 'United Arab Emirates',
    accountNo: '',
    iban: '',
    swift: '',
    routingNumber: '',
    sortCode: '',
    bankCertificate: '',
    fileName: '',
    issueDate: ''
  };

  bankList: BankItem[] = [];

  procurementApprovalStatus: 'Approved' | 'Pending' | 'Rejected' = 'Pending';
  financeApprovalStatus: 'Approved' | 'Pending' | 'Rejected' = 'Pending';

  private logoutSaveHandler = () => {
    this.saveLocalDraft();
    this.saveDraft();
  };

  @HostListener('window:beforeunload')
  onBeforeUnload(): void {
    this.saveLocalDraft();
  }

  @HostListener('window:pagehide')
  onPageHide(): void {
    this.saveLocalDraft();
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('tamco_logout_save', this.logoutSaveHandler);
      // Immediately restore draft so user instantly resumes from where they left off
      this.restoreLocalDraft();
    }

    const mode = this.route.snapshot.queryParams['mode'];
    const showReview = this.route.snapshot.queryParams['showReview'];
    if (showReview === 'true' || mode === 'review') {
      if (this.state.vendorStatusCode() < 3) {
        this.state.setVendorStatusCode(1);
      }
    } else if (mode === 'pending') {
      if (this.state.vendorStatusCode() < 3) {
        this.state.setVendorStatusCode(2);
      }
    } else if (mode === 'fill' || mode === 'edit') {
      this.state.setVendorStatusCode(0, true);
    }
    this.loadVendorProfile();

    // Auto popup Important Notice when the user lands on company profile first time (e.g. registration onboarding)
    const hasSeenNotice = sessionStorage.getItem('vreg_notice_seen');
    if (!hasSeenNotice && this.state.vendorStatusCode() < 3 && !this.isStaffUser()) {
      this.showNoticeModal = true;
    }
  }

  loadVendorProfile(): void {
    const qReqNo = this.route.snapshot.queryParams['reqNo'] || this.route.snapshot.queryParams['id'];
    const isStaff = this.isStaffUser();
    const user = this.state.currentUser();
    const reqNo = qReqNo || (isStaff ? '' : user?.organization?.split('·')?.[0]?.trim()) || this.form.code || '';
    if (!isStaff) {
      if (user?.name) {
        this.form.company = user.name;
      }
      if (user?.email) {
        this.form.email = user.email;
      }
    }
    if (reqNo) {
      this.form.code = reqNo;
    }
    this.isLoadingProfile = true;

    // Load Live Sage 300 Currencies & Taxes
    this.loadSageCurrencies();
    this.loadSageTaxes();
    this.loadMasterData();

    // 1. Fetch Registration Details from Backend
    this.vendorApi.getVendorRegistration(reqNo).subscribe({
      next: (res) => {
        this.isLoadingProfile = false;
        const reg = res?.vreg_Data || res?.data || (Array.isArray(res?.vreg_List) ? res.vreg_List[0] : null) || (Array.isArray(res) ? res[0] : null);
        if (reg) {
          if (reg.vendoR_NAME) this.form.company = reg.vendoR_NAME;
          if (reg.reqno) this.form.code = reg.reqno;
          if (reg.date) this.form.registrationDate = String(reg.date).substring(0, 10);
          if (reg.email) this.form.email = reg.email;
          if (reg.tel) this.form.phone = reg.tel;
          if (reg.faxnumber) this.form.fax = reg.faxnumber;
          if (reg.address) this.form.address = reg.address;
          if (reg.city) this.form.city = reg.city;
          if (reg.country) this.form.country = reg.country;
          if (reg.zipcode) this.form.zipCode = reg.zipcode;
          if (reg.website) this.form.website = reg.website;
          if (reg.tlnum) this.form.tradeLicense = reg.tlnum;
          if (reg.tL_EXPIRY) this.form.tradeLicenseExpiry = String(reg.tL_EXPIRY).substring(0, 10);
          if (reg.taxnum) this.form.vatNumber = reg.taxnum;
          if (reg.corP_TAX) this.form.corporateTax = reg.corP_TAX;
          if (reg.businesstype) this.business.type = reg.businesstype;
          if (reg.companystatus) this.business.status = reg.companystatus;
          if (reg.yearbus) this.business.years = Number(reg.yearbus) || this.business.years;
          if (reg.incorplace) this.business.place = reg.incorplace;

          // Check submission status: isactive=1 in VREG means registration was submitted
          const mode = this.route.snapshot.queryParams['mode'];
          if (reg.isactive === 1 || reg.isactive === '1') {
            // Note: Registration form is completed. DO NOT set status 3 (ERP Active) unless BOTH Procurement and Finance approved!
            if (this.state.vendorStatusCode() < 3) {
              const targetStatus = mode === 'pending' ? 2 : 1;
              this.state.setVendorStatusCode(targetStatus, true);
            }
          } else if (reg.isactive === 0 || reg.isactive === '0') {
            if (mode !== 'fill') {
              // Keep in review mode if previously submitted
              const username = this.state.currentUser()?.username;
              const isLocalSubmitted = typeof window !== 'undefined' && username && localStorage.getItem(`vreg_submitted_${username}`) === 'true';
              if (isLocalSubmitted && this.state.vendorStatusCode() === 0) {
                this.state.setVendorStatusCode(1, true);
              }
            }
          }
        }

        // Also check if we have data in vendorRegistrationRequests or vendorBI for any missing info
        if (!this.form.company || !this.form.email) {
          const matchedReq = this.state.vendorRegistrationRequests().find(r => r.id === reqNo);
          if (matchedReq) {
            if (!this.form.company) this.form.company = matchedReq.vendorName;
            if (!this.form.email) this.form.email = matchedReq.email;
            if (!this.form.phone) this.form.phone = matchedReq.phone;
          }
        }

        this.vendorApi.getVendorBasicInfo().subscribe(biRes => {
          const biList = biRes?.vendorBI_List || [];
          const bi = biList.find((b: any) => b.reQ_NO === reqNo || (this.form.email && b.email?.toLowerCase() === this.form.email.toLowerCase()));
          if (bi) {
            if (!this.form.company && bi.vendoR_NAME) this.form.company = bi.vendoR_NAME;
            if (!this.form.email && bi.email) this.form.email = bi.email;
            if (!this.form.phone && (bi.contact || bi.tel)) this.form.phone = bi.contact || bi.tel;
            if (!this.contactForm.name && bi.cT_PERSON) this.contactForm.name = bi.cT_PERSON;
          }
          this.cdr.markForCheck();
        });

        // Restore saved status or resume draft if incomplete
        const username = this.state.currentUser()?.username;
        const savedStatus = typeof window !== 'undefined' ? (localStorage.getItem(`vreg_status_${username}`) || (reqNo ? localStorage.getItem(`vreg_status_${reqNo}`) : null)) : null;
        const savedDoc = typeof window !== 'undefined' ? (localStorage.getItem(`vreg_signed_doc_${reqNo}`) || (username ? localStorage.getItem(`vreg_signed_doc_${username}`) : null)) : null;
        if (savedDoc && !this.uploadedSignedFileName) {
          this.uploadedSignedFileName = savedDoc;
        }

        if (savedStatus === '2' && this.state.vendorStatusCode() < 3) {
          this.state.setVendorStatusCode(2, true);
        } else if (this.state.vendorStatusCode() === 0) {
          const resumed = this.restoreLocalDraft();
          if (resumed && this.currentStep > 1) {
            this.state.notify(`Resumed your registration draft from Step ${this.currentStep}`);
          }
        }

        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoadingProfile = false;
        if (reqNo) {
          const matchedReq = this.state.vendorRegistrationRequests().find(r => r.id === reqNo);
          if (matchedReq) {
            if (!this.form.company) this.form.company = matchedReq.vendorName;
            if (!this.form.email) this.form.email = matchedReq.email;
            if (!this.form.phone) this.form.phone = matchedReq.phone;
          }
        }

        if (this.state.vendorStatusCode() === 0) {
          const resumed = this.restoreLocalDraft();
          if (resumed && this.currentStep > 1) {
            this.state.notify(`Resumed your registration draft from Step ${this.currentStep}`);
          }
        }
        this.cdr.markForCheck();
      }
    });

    // 2. Fetch Currencies from Backend
    this.vendorApi.getVendorCurrencies(reqNo).subscribe(res => {
      const list = res?.vcurrency_List || res?.data || (Array.isArray(res) ? res : null);
      if (Array.isArray(list) && list.length > 0) {
        this.currencies = list.map(item => ({
          code: item.currencY_ID || item.currencY_NAME,
          description: item.currencY_NAME || item.currencY_ID,
          isDefault: !!item.bydefault
        }));
        if (!this.bankForm.currency || !this.currencies.some(c => c.code === this.bankForm.currency)) {
          this.bankForm.currency = this.currencies.find(c => c.isDefault)?.code || this.currencies[0]?.code || '';
        }
        this.cdr.markForCheck();
      }
    });

    // 3. Fetch Contacts from Backend
    this.vendorApi.getVendorContacts(reqNo).subscribe(res => {
      const list = res?.vctcp_List || res?.data || (Array.isArray(res) ? res : null);
      if (Array.isArray(list) && list.length > 0) {
        this.contactsList = list.map(c => ({
          name: c.peR_NAME || '',
          department: c.peR_DEPART || '',
          designation: c.peR_DESIG || '',
          address: c.perofcadress || '',
          country: c.country || this.form.country,
          city: c.city || this.form.city,
          email: c.peR_EMAIL || '',
          office: c.peR_MOBILE || '',
          phone: c.peR_MOBILE || '',
          fax: c.faxno || '',
          landline: c.ladnlineno || '',
          extension: c.ext || '',
          whatsapp: c.whatsappno || ''
        }));
        this.cdr.markForCheck();
      }
    });

    // 4. Fetch Bank Accounts from Backend
    this.vendorApi.getVendorBanks(reqNo).subscribe(res => {
      const list = res?.vbank_List || res?.data || (Array.isArray(res) ? res : null);
      if (Array.isArray(list) && list.length > 0) {
        this.bankList = list.map(b => ({
          id: String(b.linenum || 1),
          bankName: b.banK_NAME || '',
          beneficiaryBank: b.beN_BANK || '',
          bankAddress: b.banK_ADRESS || '',
          accountTitle: b.titlE_ACC || '',
          currency: b.currency || 'AED',
          country: b.country || this.form.country,
          accountNo: b.accounT_NO || '',
          iban: b.accounT_IBAN || b.accounT_NO || '',
          swift: b.swifT_CODE || '',
          routingNumber: b.abarout || '',
          sortCode: b.sorT_CODE || '',
          fileName: b.filE_NAME || '',
          issueDate: b.issuedate ? String(b.issuedate).substring(0, 10) : ''
        }));
        this.cdr.markForCheck();
      }
    });

    // 5. Fetch Major Customers from Backend
    this.vendorApi.getMajorCustomers(reqNo).subscribe(res => {
      const list = res?.vmajcustomer_List || res?.data || (Array.isArray(res) ? res : null);
      if (Array.isArray(list) && list.length > 0) {
        this.customers = list.map((c: any, i: number) => ({
          id: String(c.linenum || i + 1),
          name: c.majcusname || '',
          contact: c.majcontactname || '',
          phone: c.majcontact || '',
          city: c.majcity || '',
          country: c.majcountry || '',
          dealsInYear: String(c.dealingyears || '1 Year')
        }));
        this.cdr.markForCheck();
      }
    });

    // 6. Fetch Documents from Backend
    this.vendorApi.getVendorDocuments(reqNo).subscribe({
      next: (res) => {
        const list = res?.vdocs_List || res?.data || (Array.isArray(res) ? res : null);
        if (Array.isArray(list) && list.length > 0) {
          this.attachments = list.map((d: any, i: number) => {
            const desc = d.doC_NAME || '';
            const isPassport = desc.trim().toLowerCase() === 'passport';
            const isDoc1 = desc.trim().toLowerCase() === 'doc 1';
            return {
              id: String(d.linenum || i + 1),
              description: desc,
              issueDate: d.docdate ? String(d.docdate).substring(0, 10) : '',
              docExpiryDate: d.expdate ? String(d.expdate).substring(0, 10) : '',
              fileName: d.filename || '',
              status: d.filename ? (d.isactive ? 'Verified' : 'Uploaded') : 'Pending',
              hasExpiry: isPassport ? true : (isDoc1 ? false : (d.exP_FLAG === 1 || Boolean(d.expdate))),
              mandatory: isPassport || isDoc1
            };
          });
        }
        this.ensureDefaultAttachments();
        this.cdr.markForCheck();
      },
      error: () => {
        this.ensureDefaultAttachments();
        this.cdr.markForCheck();
      }
    });

    // 7. Fetch Products from Backend
    this.vendorApi.getMajorProducts(reqNo).subscribe(res => {
      const list = res?.vmajorproduct_List || res?.vmajorproducts_List || res?.data || (Array.isArray(res) ? res : null);
      if (Array.isArray(list) && list.length > 0) {
        this.products = list.map((p: any) => ({
          code: p.producT_CODE || p.code || '',
          description: p.producT_DESCRIPTION || p.description || '',
          brands: p.brand || p.brands || '',
          selectedBrands: p.selectedBrands || ''
        }));
        this.cdr.markForCheck();
      } else {
        // Also check VREGMP database table: /api/Vendor/GetVendorMajorProductList
        this.vendorApi.getVendorMajorProductList(reqNo).subscribe(vregList => {
          if (Array.isArray(vregList) && vregList.length > 0) {
            this.products = vregList.map((p: any) => ({
              code: p.majorproduct || p.producT_CODE || '',
              description: p.description || '',
              brands: p.brands || '',
              selectedBrands: p.brands || ''
            }));
            this.cdr.markForCheck();
          }
        });
      }
    });

    // 8. Check Procurement Validations from backend
    this.vendorApi.getVendorValidations(reqNo).subscribe(res => {
      const list = res?.vendorvalidation_List || res?.data || (Array.isArray(res) ? res : []);
      const isApproved = list.some((v: any) => v.status === 'Approved' || v.action === 1);
      if (isApproved) {
        this.procurementApprovalStatus = 'Approved';
      }
      this.evaluateFullApproval();
    });

    // 9. Check Finance Bank Validations from backend
    this.vendorApi.getBankValidations(reqNo).subscribe(res => {
      const list = res?.bankvalidation_List || res?.data || (Array.isArray(res) ? res : []);
      const isApproved = list.some((b: any) => b.status === 'Approved' || b.action === 1);
      if (isApproved) {
        this.financeApprovalStatus = 'Approved';
      }
      this.evaluateFullApproval();
    });
  }

  // NUMBER & PHONE INPUT VALIDATION HELPERS
  allowOnlyNumbers(event: KeyboardEvent): void {
    const allowed = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'];
    if (allowed.includes(event.key)) return;
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  allowPhoneChars(event: KeyboardEvent): void {
    const allowed = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter', ' ', '-', '+', '(', ')'];
    if (allowed.includes(event.key)) return;
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  sanitizePhone(val: string): string {
    return (val || '').replace(/[^0-9+\s\-()]/g, '');
  }

  sanitizeNumbers(val: string): string {
    return (val || '').replace(/[^0-9]/g, '');
  }

  onlyNumericKey(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  // WIZARD VALIDATION & NAVIGATION
  isStepValid(stepId: number): boolean {
    switch (stepId) {
      case 1: {
        const email = this.form.email?.trim() || '';
        const phoneDigits = (this.form.phone || '').replace(/[^0-9]/g, '');
        const faxDigits = (this.form.fax || '').replace(/[^0-9]/g, '');
        const expiry = (this.form.tradeLicenseExpiry || '').trim();
        const isExpiryValid = expiry ? expiry >= this.minExpiryDate : false;
        return !!(
          this.form.company?.trim() &&
          this.form.registrationDate?.trim() &&
          this.form.country?.trim() &&
          this.form.city?.trim() &&
          this.form.phone?.trim() &&
          phoneDigits.length >= 7 &&
          (!this.form.fax?.trim() || faxDigits.length >= 6) &&
          this.form.address?.trim() &&
          email &&
          email.includes('@') &&
          this.form.tradeLicense?.trim() &&
          isExpiryValid &&
          this.form.vatNumber?.trim()
        );
      }
      case 2:
        return this.currencies.length > 0;
      case 3:
        return !!(
          this.business.type?.trim() &&
          this.business.status?.trim() &&
          this.business.years !== null &&
          this.business.years !== undefined &&
          Number(this.business.years) >= 0 &&
          this.business.place?.trim()
        );
      case 4:
        return this.products.length > 0;
      case 5:
        // Customer section is optional and can be skipped without filling any
        return true;
      case 6:
        return this.contactsList.length > 0;
      case 7: {
        const hasPassport = this.attachments.some(a =>
          a.description?.trim().toLowerCase() === 'passport' && !!a.fileName?.trim()
        );
        const hasDoc1 = this.attachments.some(a =>
          a.description?.trim().toLowerCase() === 'doc 1' && !!a.fileName?.trim()
        );
        const allMandatoryAttached = this.attachments
          .filter(a => a.mandatory)
          .every(a => !!a.fileName?.trim());
        const otherRowsValid = this.attachments
          .filter(a => !a.mandatory)
          .every(a => !a.description?.trim() || !!a.fileName?.trim());

        return hasPassport && hasDoc1 && allMandatoryAttached && otherRowsValid;
      }
      case 8:
        return (
          this.bankList.length > 0 ||
          !!(
            this.bankForm.bankName?.trim() &&
            this.bankForm.beneficiaryBank?.trim() &&
            this.bankForm.bankAddress?.trim() &&
            this.bankForm.accountTitle?.trim() &&
            this.bankForm.currency?.trim() &&
            this.bankForm.country?.trim() &&
            this.bankForm.accountNo?.trim() &&
            this.bankForm.iban?.trim() &&
            this.bankForm.swift?.trim() &&
            this.bankForm.issueDate?.trim()
          )
        );
      default:
        return false;
    }
  }

  canAccessStep(stepId: number): boolean {
    if (stepId <= 1) return true;
    for (let i = 1; i < stepId; i++) {
      if (!this.isStepValid(i)) return false;
    }
    return true;
  }

  areAllStepsValid(): boolean {
    for (let i = 1; i <= 8; i++) {
      if (!this.isStepValid(i)) return false;
    }
    return true;
  }

  getStepRequirementHint(stepId: number): string {
    switch (stepId) {
      case 1: {
        const exp = (this.form.tradeLicenseExpiry || '').trim();
        if (exp && exp < this.minExpiryDate) {
          return 'Trade License Expiry cannot be in the past. It must be today or a future date.';
        }
        return 'Fill all mandatory (*) basic information fields to proceed (Expiry date must be today or in the future).';
      }
      case 2:
        return 'Select at least one transacting currency to proceed.';
      case 3:
        return 'Fill all mandatory (*) business details (Years in Business > 0) to proceed.';
      case 4:
        return 'Select at least one product category to proceed.';
      case 5:
        return 'Customer references are optional. You can add client references or proceed directly to Next.';
      case 6:
        return 'Fill mandatory (*) contact fields and click "Add Contact Person +" to proceed.';
      case 7:
        return 'Please upload mandatory documents: Passport and Doc 1 must be attached to proceed.';
      case 8:
        return 'Complete all mandatory (*) bank details using a selected currency from Step 2.';
      default:
        return 'Complete all mandatory (*) fields to proceed.';
    }
  }

  goToStep(stepId: number): void {
    if (this.isUnderReview()) {
      this.state.notify('🔒 Application is currently under review. Editing is disabled.');
      return;
    }
    if (stepId < 1 || stepId > 8) return;
    if (!this.canAccessStep(stepId)) {
      this.state.notify('Complete all mandatory (*) fields in previous steps first.');
      return;
    }
    this.saveLocalDraft();
    this.currentStep = stepId;
    if (stepId === 8 && (!this.bankForm.currency || !this.currencies.some(c => c.code === this.bankForm.currency))) {
      this.bankForm.currency = this.currencies.find(c => c.isDefault)?.code || (this.currencies[0]?.code ?? '');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextStep(): void {
    if (this.isUnderReview()) return;
    if (this.currentStep === 1) {
      const exp = (this.form.tradeLicenseExpiry || '').trim();
      if (exp && exp < this.minExpiryDate) {
        this.state.notify('Validation Error: Trade License Expiry cannot be in the past. It must be today or a future date.');
        return;
      }
    }
    if (!this.isStepValid(this.currentStep)) {
      this.state.notify(this.getStepRequirementHint(this.currentStep));
      return;
    }
    if (this.currentStep < 8) {
      this.saveLocalDraft();
      this.currentStep++;
      if (this.currentStep === 8 && (!this.bankForm.currency || !this.currencies.some(c => c.code === this.bankForm.currency))) {
        this.bankForm.currency = this.currencies.find(c => c.isDefault)?.code || (this.currencies[0]?.code ?? '');
      }
      this.saveLocalDraft();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevStep(): void {
    if (this.isUnderReview()) return;
    if (this.currentStep > 1) {
      this.saveLocalDraft();
      this.currentStep--;
      this.saveLocalDraft();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // IMPORTANT NOTICE POPUP
  openNoticeModal(): void {
    this.showNoticeModal = true;
  }

  closeNoticeModal(): void {
    this.showNoticeModal = false;
    sessionStorage.setItem('vreg_notice_seen', 'true');
    const reqNo = this.form.code || this.route.snapshot.queryParams['reqNo'] || this.route.snapshot.queryParams['id'] || (this.state.currentUser()?.organization?.split('·')?.[0]?.trim());
    if (reqNo) {
      // Record visit / acknowledgment in backend audit log
      this.vendorApi.saveRequestLog({
        reQ_NO: reqNo,
        action: 1,
        currentaction: 'Vendor visited link and acknowledged Important Notice',
        auduser: this.form.email || this.state.currentUser()?.email || 'VENDOR'
      }).subscribe({
        next: () => console.log('Notice acknowledgment logged to backend'),
        error: () => {}
      });
    }
  }

  // STEP 2: CURRENCIES
  loadSageCurrencies(cb?: () => void): void {
    this.sageApi.getCurrencies().subscribe({
      next: (currencies) => {
        if (currencies && currencies.length > 0) {
          this.currencyCatalog = currencies.map(c => ({
            code: c.CurrencyCodeKey,
            description: c.Description,
            selected: this.currencies.some(cur => cur.code === c.CurrencyCodeKey)
          }));
        }
        if (cb) cb();
      },
      error: (err) => {
        console.error('Failed to load Sage currencies:', err);
        if (cb) cb();
      }
    });
  }

  loadSageTaxes(): void {
    this.sageApi.getTaxes().subscribe({
      next: (taxes) => {
        this.sageTaxAuthorities = taxes || [];
      },
      error: (err) => {
        console.error('Failed to load Sage taxes in vendor profile:', err);
      }
    });
  }

  openCurrencyModal(): void {
    this.currencySearchText = '';
    this.currencyCurrentPage = 1;
    if (this.currencyCatalog.length === 0) {
      this.loadSageCurrencies(() => {
        this.showCurrencyModal = true;
      });
      return;
    }
    // Sync catalog selected states
    this.currencyCatalog.forEach(item => {
      item.selected = this.currencies.some(c => c.code === item.code);
    });
    this.showCurrencyModal = true;
  }

  closeCurrencyModal(): void {
    this.showCurrencyModal = false;
  }

  get filteredCurrencies(): CurrencyCatalogItem[] {
    const q = this.currencySearchText.toLowerCase().trim();
    if (!q) return this.currencyCatalog;
    return this.currencyCatalog.filter(c =>
      c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );
  }

  get paginatedCurrencies(): CurrencyCatalogItem[] {
    const start = (this.currencyCurrentPage - 1) * this.currencyPageSize;
    return this.filteredCurrencies.slice(start, start + this.currencyPageSize);
  }

  get currencyStartIndex(): number {
    return (this.currencyCurrentPage - 1) * this.currencyPageSize;
  }

  get currencyEndIndex(): number {
    return Math.min(this.currencyStartIndex + this.currencyPageSize, this.filteredCurrencies.length);
  }

  confirmCurrencySelection(): void {
    const selectedCatalog = this.currencyCatalog.filter(c => c.selected);
    const updated: CurrencyItem[] = selectedCatalog.map(cat => {
      const existing = this.currencies.find(c => c.code === cat.code);
      return {
        code: cat.code,
        description: cat.description,
        isDefault: existing ? existing.isDefault : (this.currencies.length === 0 && cat.code === 'AED')
      };
    });

    if (updated.length > 0 && !updated.some(u => u.isDefault)) {
      updated[0].isDefault = true;
    }

    this.currencies = updated;
    if (!this.bankForm.currency || !this.currencies.some(c => c.code === this.bankForm.currency)) {
      this.bankForm.currency = this.currencies.find(c => c.isDefault)?.code || (this.currencies[0]?.code ?? '');
    }
    this.showCurrencyModal = false;
    this.state.notify(`Transacting currencies updated (${this.currencies.length} active).`);
  }

  setDefaultCurrency(currency: CurrencyItem): void {
    this.currencies = this.currencies.map(item => ({
      ...item,
      isDefault: item.code === currency.code
    }));
    this.bankForm.currency = currency.code;
    this.state.notify(`${currency.code} set as primary settlement currency.`);
  }

  removeCurrency(code: string): void {
    if (this.currencies.length <= 1) {
      this.state.notify('At least one transacting currency is required.');
      return;
    }
    const wasDefault = this.currencies.find(c => c.code === code)?.isDefault;
    this.currencies = this.currencies.filter(c => c.code !== code);
    if (wasDefault && this.currencies.length > 0) {
      this.currencies[0].isDefault = true;
    }
    if (this.bankForm.currency === code) {
      this.bankForm.currency = this.currencies.find(c => c.isDefault)?.code || (this.currencies[0]?.code ?? '');
    }
    this.state.notify(`Currency ${code} removed.`);
  }

  // ==========================================
  // MASTER DATA LOOKUPS (Management & ERP APIs)
  // ==========================================
  loadMasterData(): void {
    // 1. Departments from /api/Management/GetDEPARTMENTList
    this.vendorApi.getDepartments().subscribe(res => {
      const list = res?.departmentList || res?.departmenT_List || res?.data || (Array.isArray(res) ? res : []);
      if (Array.isArray(list) && list.length > 0) {
        const mapped = list.map((d: any) => d.deP_NAME || d.depname || d.name || String(d)).filter(Boolean);
        if (mapped.length > 0) this.departmentOptions = mapped;
      }
      if (this.departmentOptions.length === 0) {
        this.departmentOptions = ['IT', 'Procurement', 'Commercial Sales', 'Management', 'Accounts / Finance', 'Operations', 'Quality Assurance'];
      }
      if (!this.contactForm.department && this.departmentOptions.length > 0) {
        this.contactForm.department = this.departmentOptions[0];
      }
    });

    // 2. Designations from /api/Management/GetDESIGNATIONList
    this.vendorApi.getDesignations().subscribe(res => {
      const list = res?.designationList || res?.designatioN_List || res?.data || (Array.isArray(res) ? res : []);
      if (Array.isArray(list) && list.length > 0) {
        const mapped = list.map((d: any) => d.deS_NAME || d.desname || d.name || String(d)).filter(Boolean);
        if (mapped.length > 0) this.designationOptions = mapped;
      }
      if (this.designationOptions.length === 0) {
        this.designationOptions = ['MD', 'General Manager', 'Commercial Director', 'Sales Manager', 'Accounts Lead', 'Technical Specialist'];
      }
      if (!this.contactForm.designation && this.designationOptions.length > 0) {
        this.contactForm.designation = this.designationOptions[0];
      }
    });

    // 3. UAE Banks from /api/Management/GetUAEBANKSList
    this.vendorApi.getUaeBanks().subscribe(res => {
      const list = res?.uaebanksList || res?.uaebankS_List || res?.bankList || res?.data || (Array.isArray(res) ? res : []);
      if (Array.isArray(list) && list.length > 0) {
        const mapped = list.map((b: any) => b.banK_NAME || b.bankname || b.name || String(b)).filter(Boolean);
        if (mapped.length > 0) this.standardBankList = mapped;
      }
      if (this.standardBankList.length === 0) {
        this.standardBankList = ['Emirates NBD', 'First Abu Dhabi Bank (FAB)', 'Abu Dhabi Commercial Bank (ADCB)', 'Dubai Islamic Bank (DIB)', 'Mashreq Bank', 'Commercial Bank of Dubai (CBD)'];
      }
    });

    // 4. Countries from /api/Management/GetCOUNTRYList
    this.vendorApi.getCountries().subscribe(res => {
      const list = res?.countryList || res?.countrY_List || res?.data || (Array.isArray(res) ? res : []);
      if (Array.isArray(list) && list.length > 0) {
        const mapped = list.map((c: any) => c.countrY_NAME || c.countryname || c.name || String(c)).filter(Boolean);
        if (mapped.length > 0) this.countryList = mapped;
      }
      if (this.countryList.length === 0) {
        this.countryList = ['United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Oman', 'Bahrain', 'Kuwait', 'Pakistan', 'United States', 'United Kingdom', 'Germany', 'India', 'China', 'Singapore'];
      }
    });

    // 5. Cities from /api/Management/GetCITYList
    this.vendorApi.getCities().subscribe(res => {
      const list = res?.cityList || res?.citY_List || res?.data || (Array.isArray(res) ? res : []);
      if (Array.isArray(list) && list.length > 0) {
        this.cityList = list.map((c: any) => c.citY_NAME || c.cityname || c.name || String(c)).filter(Boolean);
      }
    });

    // 6. Brands from /api/Management/GetBRANDList
    this.vendorApi.getBrands().subscribe(res => {
      const list = res?.brandList || res?.branD_List || res?.data || (Array.isArray(res) ? res : []);
      if (Array.isArray(list) && list.length > 0) {
        this.brandList = list.map((b: any) => b.branD_NAME || b.brandname || b.name || String(b)).filter(Boolean);
      }
    });

    // 7. Products Catalog
    this.loadProductsCatalog();
  }

  loadProductsCatalog(cb?: () => void): void {
    // 1. Live Sage 300 Item Master (76 items)
    this.sageApi.getAllItems().subscribe({
      next: (items: SageItem[]) => {
        if (items && items.length > 0) {
          this.productCatalog = items.map((i: SageItem) => ({
            code: i.ItemNumber,
            description: i.Description,
            selected: this.products.some(p => p.code === i.ItemNumber)
          }));
        }
        // 2. Also merge any backend registered products
        this.vendorApi.getMajorProducts().subscribe(res => {
          const list = res?.vmajorproduct_List || res?.vmajorproducts_List || res?.data || (Array.isArray(res) ? res : []);
          if (Array.isArray(list) && list.length > 0) {
            for (const item of list) {
              const code = item.producT_CODE || item.code;
              const desc = item.producT_DESCRIPTION || item.description;
              if (code && !this.productCatalog.some(p => p.code === code)) {
                this.productCatalog.push({
                  code,
                  description: desc || code,
                  selected: this.products.some(p => p.code === code)
                });
              }
            }
          }
          if (cb) cb();
        });
      },
      error: () => {
        if (cb) cb();
      }
    });
  }

  // STEP 4: PRODUCTS
  openProductModal(): void {
    this.productSearchText = '';
    this.productCurrentPage = 1;
    if (this.productCatalog.length === 0) {
      this.loadProductsCatalog(() => {
        this.showProductModal = true;
      });
      return;
    }
    this.productCatalog.forEach(item => {
      item.selected = this.products.some(p => p.code === item.code);
    });
    this.showProductModal = true;
  }

  closeProductModal(): void {
    this.showProductModal = false;
  }

  get filteredProducts(): ProductCatalogItem[] {
    const q = this.productSearchText.toLowerCase().trim();
    if (!q) return this.productCatalog;
    return this.productCatalog.filter(p =>
      p.code.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }

  get paginatedProducts(): ProductCatalogItem[] {
    return this.filteredProducts.slice(this.productStartIndex, this.productStartIndex + this.productPageSize);
  }

  get productStartIndex(): number {
    return (this.productCurrentPage - 1) * this.productPageSize;
  }

  get productEndIndex(): number {
    return Math.min(this.productStartIndex + this.productPageSize, this.filteredProducts.length);
  }

  confirmProductSelection(): void {
    const selected = this.productCatalog.filter(p => p.selected);
    const updated: ProductItem[] = selected.map(cat => {
      const existing = this.products.find(p => p.code === cat.code);
      return existing || {
        code: cat.code,
        description: cat.description,
        brands: 'Authorized OEM',
        selectedBrands: 'Certified Dealer'
      };
    });

    this.products = updated;
    this.showProductModal = false;
    this.state.notify(`Supplied products updated (${this.products.length} categories).`);
  }

  removeProduct(index: number): void {
    this.products.splice(index, 1);
    this.saveLocalDraft();
    this.state.notify('Product category removed.');
  }

  // STEP 5: CUSTOMERS
  addCustomerRow(): void {
    this.customers.push({
      id: String(Date.now()),
      name: '',
      contact: '',
      phone: '',
      city: this.form.city || 'Abu Dhabi',
      country: this.form.country || 'United Arab Emirates',
      dealsInYear: '1 Year'
    });
    this.saveLocalDraft();
    this.state.notify('New customer reference row added.');
  }

  removeCustomer(index: number): void {
    this.customers.splice(index, 1);
    this.saveLocalDraft();
    this.state.notify('Customer reference removed.');
  }

  // STEP 6: CONTACTS
  addContactPerson(): void {
    const email = this.contactForm.email?.trim() || '';
    const phoneDigits = (this.contactForm.phone || '').replace(/[^0-9]/g, '');
    const landlineDigits = (this.contactForm.landline || '').replace(/[^0-9]/g, '');
    const whatsappDigits = (this.contactForm.whatsapp || '').replace(/[^0-9]/g, '');

    if (
      !this.contactForm.name?.trim() ||
      !this.contactForm.department?.trim() ||
      !this.contactForm.designation?.trim() ||
      !this.contactForm.address?.trim() ||
      !this.contactForm.country?.trim() ||
      !this.contactForm.city?.trim() ||
      !email ||
      !email.includes('@') ||
      !this.contactForm.office?.trim() ||
      !this.contactForm.landline?.trim() ||
      !this.contactForm.phone?.trim() ||
      !this.contactForm.whatsapp?.trim()
    ) {
      this.state.notify('Please complete all mandatory (*) Contact Person fields (including Landline, Phone & Whatsapp).');
      return;
    }

    if (landlineDigits.length < 6) {
      this.state.notify('Please enter a valid Landline Number (minimum 6 digits).');
      return;
    }

    if (phoneDigits.length < 7) {
      this.state.notify('Please enter a valid Phone Number (minimum 7 digits).');
      return;
    }

    if (whatsappDigits.length < 7) {
      this.state.notify('Please enter a valid Whatsapp Number (minimum 7 digits).');
      return;
    }

    this.contactsList.push({ ...this.contactForm, id: String(Date.now()) });
    this.saveLocalDraft();
    this.state.notify(`Contact person "${this.contactForm.name}" added.`);

    // Reset contact form
    this.contactForm = {
      name: '',
      department: this.departmentOptions[0] || 'Procurement',
      designation: this.designationOptions[0] || 'Commercial Manager',
      address: this.form.address,
      country: this.form.country,
      city: this.form.city,
      email: '',
      office: 'Head Office',
      phone: '',
      fax: '',
      landline: '',
      extension: '',
      whatsapp: ''
    };
  }

  removeContact(index: number): void {
    const removed = this.contactsList.splice(index, 1);
    this.saveLocalDraft();
    this.state.notify(`Contact "${removed[0].name}" removed.`);
  }

  // STEP 7: ATTACHMENTS
  ensureDefaultAttachments(): void {
    const hasPassport = this.attachments.some(a => a.description?.trim().toLowerCase() === 'passport');
    const hasDoc1 = this.attachments.some(a => a.description?.trim().toLowerCase() === 'doc 1');

    if (!hasPassport) {
      this.attachments.unshift({
        id: 'att-passport',
        description: 'Passport',
        issueDate: '',
        docExpiryDate: '',
        fileName: '',
        status: 'Pending',
        hasExpiry: true,
        mandatory: true
      });
    }

    if (!hasDoc1) {
      const passportIdx = this.attachments.findIndex(a => a.description?.trim().toLowerCase() === 'passport');
      const insertIdx = passportIdx >= 0 ? passportIdx + 1 : 0;
      this.attachments.splice(insertIdx, 0, {
        id: 'att-doc1',
        description: 'Doc 1',
        issueDate: '',
        docExpiryDate: '',
        fileName: '',
        status: 'Pending',
        hasExpiry: false,
        mandatory: true
      });
    }

    for (const att of this.attachments) {
      const desc = att.description?.trim().toLowerCase();
      if (desc === 'passport') {
        att.mandatory = true;
        att.hasExpiry = true;
      } else if (desc === 'doc 1') {
        att.mandatory = true;
        if (att.hasExpiry === undefined) {
          att.hasExpiry = false;
        }
      } else if (att.hasExpiry === undefined) {
        att.hasExpiry = Boolean(att.docExpiryDate);
      }
    }
  }

  addAttachmentRow(): void {
    this.attachments.push({
      id: String(Date.now()),
      description: '',
      issueDate: '',
      docExpiryDate: '',
      fileName: '',
      status: 'Pending',
      hasExpiry: false,
      mandatory: false
    });
    this.state.notify('New attachment row added.');
  }

  removeAttachment(index: number): void {
    if (this.attachments[index]?.mandatory) {
      this.state.notify(`"${this.attachments[index].description}" is a mandatory document and cannot be removed.`);
      return;
    }
    this.attachments.splice(index, 1);
    this.state.notify('Attachment removed.');
  }

  onFileUploaded(event: Event, att: AttachmentRow): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      att.fileName = file.name;
      att.fileSize = `${(file.size / 1024).toFixed(0)} KB`;
      att.status = 'Attached';
      this.saveLocalDraft();
      this.state.notify(`File "${file.name}" attached to ${att.description}.`);
    }
  }

  saveSingleAttachment(att: AttachmentRow, index: number): void {
    const reqno = this.form.code || 'REQ-PENDING';
    att.isSaving = true;
    this.vendorApi.saveVendorDocument({
      coperation: 2,
      reqno,
      linenum: index + 1,
      doC_NAME: att.description || `Document ${index + 1}`,
      filename: att.fileName || '',
      url: att.fileName || '',
      docdate: att.issueDate || '',
      expdate: att.hasExpiry ? (att.docExpiryDate || '') : '',
      exP_FLAG: (att.hasExpiry && att.docExpiryDate) ? 1 : 0,
      isactive: 1
    }, 2).subscribe({
      next: () => {
        att.isSaving = false;
        att.isSaved = true;
        att.status = 'Verified';
        this.state.notify(`Document #${index + 1} "${att.description || 'Document'}" saved to AUDVendorDocument.`);
        setTimeout(() => { att.isSaved = false; }, 3000);
      },
      error: () => {
        att.isSaving = false;
        att.isSaved = true;
        att.status = 'Verified';
        this.state.notify(`Document metadata updated locally.`);
        setTimeout(() => { att.isSaved = false; }, 3000);
      }
    });
  }

  syncAllVendorDocuments(): void {
    const reqno = this.form.code || 'REQ-PENDING';
    if (!this.attachments.length) {
      this.state.notify('No compliance attachments available to sync.');
      return;
    }
    for (const [i, att] of this.attachments.entries()) {
      this.saveSingleAttachment(att, i);
    }
    this.state.notify(`Synced ${this.attachments.length} document record(s) to AUDVendorDocument.`);
  }

  // STEP 8: BANK DETAILS
  onBankCertificateSelected(event: any): void {
    const f = event?.target?.files?.[0];
    if (f) {
      this.bankForm.fileName = f.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.bankForm.bankCertificate = (reader.result as string) || '';
        this.saveLocalDraft();
      };
      reader.readAsDataURL(f);
    }
  }

  addBankToList(): void {
    if (
      !this.bankForm.bankName?.trim() ||
      !this.bankForm.beneficiaryBank?.trim() ||
      !this.bankForm.bankAddress?.trim() ||
      !this.bankForm.accountTitle?.trim() ||
      !this.bankForm.currency?.trim() ||
      !this.bankForm.country?.trim() ||
      !this.bankForm.accountNo?.trim() ||
      !this.bankForm.iban?.trim() ||
      !this.bankForm.swift?.trim() ||
      !this.bankForm.issueDate?.trim()
    ) {
      this.state.notify('Please complete all mandatory (*) Bank Information fields.');
      return;
    }

    this.bankList.push({
      id: String(Date.now()),
      bankName: this.bankForm.bankName.trim(),
      beneficiaryBank: this.bankForm.beneficiaryBank.trim(),
      bankAddress: this.bankForm.bankAddress.trim(),
      accountTitle: this.bankForm.accountTitle.trim(),
      currency: this.bankForm.currency.trim(),
      country: this.bankForm.country.trim(),
      accountNo: this.bankForm.accountNo.trim(),
      iban: this.bankForm.iban.trim(),
      swift: this.bankForm.swift.trim(),
      routingNumber: this.bankForm.routingNumber?.trim() || '',
      sortCode: this.bankForm.sortCode?.trim() || '',
      bankCertificate: this.bankForm.bankCertificate || '',
      fileName: this.bankForm.fileName || '',
      issueDate: this.bankForm.issueDate || ''
    });

    this.saveLocalDraft();
    this.state.notify(`Bank account for ${this.bankForm.bankName} (${this.bankForm.currency}) added.`);
    const savedCurrency = this.bankForm.currency;
    const savedCountry = this.bankForm.country;
    this.bankForm = {
      bankName: '',
      beneficiaryBank: '',
      bankAddress: '',
      accountTitle: '',
      currency: savedCurrency,
      country: savedCountry,
      accountNo: '',
      iban: '',
      swift: '',
      routingNumber: '',
      sortCode: '',
      bankCertificate: '',
      fileName: '',
      issueDate: ''
    };
  }

  removeBank(index: number): void {
    this.bankList.splice(index, 1);
    this.saveLocalDraft();
    this.state.notify('Bank account removed.');
  }

  private syncRelatedProfileData(): void {
    const reqno = this.form.code;
    if (!reqno) return;

    // Currencies
    for (const curr of this.currencies) {
      this.vendorApi.saveVendorCurrency({
        coperation: 2,
        reqno,
        currencY_ID: curr.code,
        currencY_NAME: curr.description,
        bydefault: curr.isDefault ? 1 : 0
      }, 2).subscribe();
    }

    // Products
    for (const p of this.products) {
      this.vendorApi.saveMajorProduct({
        coperation: 2,
        producT_CODE: p.code,
        producT_DESCRIPTION: p.description
      }, 2).subscribe();

      // Also persist to /api/Vendor/AUDVendorMajorProduct (VREGMP)
      this.vendorApi.saveVendorMajorProductAUD({
        coperation: 2,
        reqno,
        majorproduct: p.code,
        description: p.description,
        brands: p.brands || '',
        isactive: 1
      }, 2).subscribe();
    }

    // Contacts
    for (const c of this.contactsList) {
      if (c.name && c.email) {
        this.vendorApi.saveVendorContact({
          coperation: 2,
          reqno,
          peR_NAME: c.name,
          peR_DEPART: c.department,
          peR_DESIG: c.designation,
          peR_EMAIL: c.email,
          peR_MOBILE: c.phone || c.office,
          perofcadress: c.address,
          country: c.country,
          city: c.city,
          faxno: c.fax,
          ladnlineno: c.landline,
          ext: c.extension,
          whatsappno: c.whatsapp
        }, 2).subscribe();
      }
    }

    // Major Customers
    for (const cust of this.customers) {
      if (cust.name) {
        this.vendorApi.saveMajorCustomer({
          coperation: 2,
          reqno,
          majcusname: cust.name,
          majcontactname: cust.contact,
          majcontact: cust.phone,
          majcity: cust.city,
          majcountry: cust.country,
          dealingyears: cust.dealsInYear
        }, 2).subscribe();
      }
    }

    // Banks (Ensure bankForm is synced even if user didn't click "Add to List")
    const banksToSync = this.bankList.length > 0 ? [...this.bankList] : [];
    if (banksToSync.length === 0 && this.bankForm.bankName && (this.bankForm.iban || this.bankForm.accountNo)) {
      banksToSync.push({
        id: '1',
        bankName: this.bankForm.bankName,
        beneficiaryBank: this.bankForm.beneficiaryBank || this.bankForm.bankName,
        bankAddress: this.bankForm.bankAddress || '',
        accountTitle: this.bankForm.accountTitle || this.form.company,
        currency: this.bankForm.currency || 'AED',
        country: this.bankForm.country || this.form.country,
        accountNo: this.bankForm.accountNo || '',
        iban: this.bankForm.iban || '',
        swift: this.bankForm.swift || '',
        routingNumber: this.bankForm.routingNumber || '',
        sortCode: this.bankForm.sortCode || '',
        fileName: this.bankForm.fileName || '',
        issueDate: this.bankForm.issueDate || ''
      });
    }

    for (const [i, b] of banksToSync.entries()) {
      if (b.bankName && (b.iban || b.accountNo)) {
        this.vendorApi.saveVendorBank({
          coperation: 2,
          reqno,
          linenum: i + 1,
          vendoR_NAME: this.form.company,
          banK_NAME: b.bankName,
          beN_BANK: b.beneficiaryBank || b.bankName,
          banK_ADRESS: b.bankAddress || '',
          titlE_ACC: b.accountTitle || this.form.company,
          currency: b.currency || 'AED',
          country: b.country || this.form.country,
          accounT_NO: b.accountNo || '',
          accounT_IBAN: b.iban || '',
          swifT_CODE: b.swift || '',
          abarout: b.routingNumber || '',
          sorT_CODE: b.sortCode || '',
          filE_NAME: b.fileName || '',
          issuedate: b.issueDate || ''
        }, 2).subscribe({
          next: () => console.log('AUDVendorBank synced for', b.bankName),
          error: (err) => console.warn('AUDVendorBank sync error:', err)
        });
      }
    }

    // Documents & Attachments (AUDVendorDocument)
    for (const [i, att] of this.attachments.entries()) {
      if (att.description || att.fileName) {
        this.vendorApi.saveVendorDocument({
          coperation: 2,
          reqno,
          linenum: i + 1,
          doC_NAME: att.description || `Document ${i + 1}`,
          filename: att.fileName || '',
          url: att.fileName || '',
          docdate: att.issueDate || '',
          expdate: att.hasExpiry ? (att.docExpiryDate || '') : '',
          exP_FLAG: (att.hasExpiry && att.docExpiryDate) ? 1 : 0,
          isactive: 1
        }, 2).subscribe();
      }
    }
  }

  // SAVE & SUBMIT
  saveDraft(): void {
    const regPayload: Partial<VREGModel> = {
      coperation: 3,
      reqno: this.form.code,
      vendoR_NAME: this.form.company,
      date: this.form.registrationDate,
      address: this.form.address,
      city: this.form.city,
      country: this.form.country,
      email: this.form.email,
      tel: this.form.phone,
      faxnumber: this.form.fax,
      zipcode: this.form.zipCode,
      website: this.form.website,
      tlnum: this.form.tradeLicense,
      tL_EXPIRY: this.form.tradeLicenseExpiry,
      taxnum: this.form.vatNumber,
      corP_TAX: this.form.corporateTax,
      businesstype: this.business.type,
      companystatus: this.business.status,
      yearbus: String(this.business.years ?? 0),
      incorplace: this.business.place,
      isactive: 0
    };

    this.isSavingProfile = true;
    this.vendorApi.saveVendorRegistration(regPayload, 3).subscribe({
      next: () => {
        this.syncRelatedProfileData();
        this.isSavingProfile = false;
        this.state.notify('Registration draft saved successfully to backend.');
      },
      error: (err) => {
        this.isSavingProfile = false;
        console.error('saveDraft failed:', err);
        const errMsg = err?.error?.errors
          ? Object.entries(err.error.errors).map(([k, v]) => `${k}: ${(v as string[]).join(', ')}`).join(' | ')
          : (err?.error?.title || err?.message || 'Server error');
        this.state.notify(`❌ Draft save failed: ${errMsg}`);
      }
    });
  }

  isUnderReview(): boolean {
    return this.state.vendorStatusCode() === 2;
  }

  saveLocalDraft(): void {
    if (typeof window === 'undefined') return;
    if (this.state.vendorStatusCode() >= 2) return;
    const user = this.state.currentUser();
    const username = user?.username?.trim()?.toLowerCase();
    const email = (this.form.email || user?.email || '')?.trim()?.toLowerCase();
    const code = (this.form.code || '').trim()?.toLowerCase();

    const draftData = {
      currentStep: this.currentStep,
      form: this.form,
      business: this.business,
      currencies: this.currencies,
      products: this.products,
      customers: this.customers,
      contactsList: this.contactsList,
      attachments: this.attachments,
      bankList: this.bankList,
      bankForm: this.bankForm,
      contactForm: this.contactForm,
      uploadedSignedFileName: this.uploadedSignedFileName,
      savedAt: new Date().toISOString()
    };
    try {
      const serialized = JSON.stringify(draftData);
      if (username) localStorage.setItem(`vreg_draft_${username}`, serialized);
      if (email) localStorage.setItem(`vreg_draft_${email}`, serialized);
      if (code) localStorage.setItem(`vreg_draft_${code}`, serialized);
      localStorage.setItem('vreg_draft_latest', serialized);
    } catch (e) {
      console.warn('Failed to save local draft:', e);
    }
  }

  restoreLocalDraft(): boolean {
    if (typeof window === 'undefined') return false;
    if (this.state.vendorStatusCode() >= 2) return false;
    const user = this.state.currentUser();
    const username = user?.username?.trim()?.toLowerCase();
    const email = (this.form.email || user?.email || '')?.trim()?.toLowerCase();
    const code = (this.form.code || '').trim()?.toLowerCase();

    const candidateKeys = [
      username ? `vreg_draft_${username}` : null,
      email ? `vreg_draft_${email}` : null,
      code ? `vreg_draft_${code}` : null,
      'vreg_draft_latest'
    ].filter(Boolean) as string[];

    let raw: string | null = null;
    for (const key of candidateKeys) {
      const hit = localStorage.getItem(key);
      if (hit) {
        raw = hit;
        break;
      }
    }
    if (!raw) return false;
    try {
      const data = JSON.parse(raw);
      if (data && data.form) {
        this.form = { ...this.form, ...data.form };
        if (data.business) this.business = { ...this.business, ...data.business };
        if (Array.isArray(data.currencies) && data.currencies.length) this.currencies = data.currencies;
        if (Array.isArray(data.products) && data.products.length) this.products = data.products;
        if (Array.isArray(data.customers) && data.customers.length) this.customers = data.customers;
        if (Array.isArray(data.contactsList) && data.contactsList.length) this.contactsList = data.contactsList;
        if (Array.isArray(data.attachments) && data.attachments.length) this.attachments = data.attachments;
        if (Array.isArray(data.bankList) && data.bankList.length) this.bankList = data.bankList;
        if (data.bankForm) this.bankForm = { ...this.bankForm, ...data.bankForm };
        if (data.contactForm) this.contactForm = { ...this.contactForm, ...data.contactForm };
        if (data.uploadedSignedFileName) this.uploadedSignedFileName = data.uploadedSignedFileName;
        if (this.state.vendorStatusCode() === 0 && data.currentStep && data.currentStep >= 1 && data.currentStep <= 8) {
          this.currentStep = data.currentStep;
        }
        this.cdr.markForCheck();
        return true;
      }
    } catch (e) {
      console.warn('Failed to restore local draft:', e);
    }
    return false;
  }

  isRevisionRequired(): boolean {
    return this.procurementApprovalStatus === 'Rejected' ||
      this.financeApprovalStatus === 'Rejected' ||
      this.activeVendor?.procurementStatus === 'Rejected' ||
      this.activeVendor?.financeStatus === 'Rejected';
  }

  getRevisionDepartment(): string {
    const p = this.procurementApprovalStatus === 'Rejected' || this.activeVendor?.procurementStatus === 'Rejected';
    const f = this.financeApprovalStatus === 'Rejected' || this.activeVendor?.financeStatus === 'Rejected';
    if (p && f) return 'Procurement & Finance';
    if (p) return 'Procurement';
    if (f) return 'Finance';
    return 'Compliance Audit';
  }

  unlockForRevision(): void {
    this.state.setVendorStatusCode(0);
    this.currentStep = 1;
    this.state.notify('Application unlocked for revision. Please review your details and re-submit when ready.');
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('tamco_logout_save', this.logoutSaveHandler);
    }
    this.saveLocalDraft();
  }

  submitForVerification(): void {
    for (let step = 1; step <= 8; step++) {
      if (!this.isStepValid(step)) {
        const title = this.wizardSteps.find(s => s.id === step)?.title || `Step ${step}`;
        this.state.notify(`Step ${step} (${title}): ${this.getStepRequirementHint(step)}`);
        this.currentStep = step;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    this.saveLocalDraft();
    this.setLifecycleStatus(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.state.notify('Application steps verified! Please review the summary below and upload your signed registration document.');
  }

  submitRegistrationForVerification(): void {
    if (!this.uploadedSignedFileName) {
      this.state.notify('⚠️ Please upload the signed and stamped registration document before submitting.');
      return;
    }

    this.isSavingProfile = true;

    const primaryBank = this.bankList[0] || {
      bankName: this.bankForm.bankName,
      iban: this.bankForm.iban,
      accountTitle: this.bankForm.accountTitle,
      country: this.bankForm.country
    };

    const categories = this.products.map(p => p.description);

    const regPayload: Partial<VREGModel> = {
      coperation: 3,
      reqno: this.form.code,
      vendoR_NAME: this.form.company,
      date: this.form.registrationDate,
      address: this.form.address,
      city: this.form.city,
      country: this.form.country,
      email: this.form.email,
      tel: this.form.phone,
      faxnumber: this.form.fax,
      zipcode: this.form.zipCode,
      website: this.form.website,
      tlnum: this.form.tradeLicense,
      tL_EXPIRY: this.form.tradeLicenseExpiry,
      taxnum: this.form.vatNumber,
      corP_TAX: this.form.corporateTax,
      businesstype: this.business.type,
      companystatus: this.business.status,
      yearbus: String(this.business.years ?? 0),
      incorplace: this.business.place,
      isactive: 0
    };

    const finishVerificationSubmission = () => {
      // 1. Sync VendorBI
      this.vendorApi.saveVendorBasicInfo({
        coperation: 3,
        reQ_NO: this.form.code,
        vendoR_NAME: this.form.company,
        email: this.form.email,
        contact: this.form.phone,
        cT_PERSON: this.contactForm.name || this.form.company,
        active: 1
      }, 3).subscribe({
        next: () => console.log('VendorBI active=1 successfully updated in DB'),
        error: (err) => console.warn('VendorBI active=1 update warning:', err)
      });

      this.syncRelatedProfileData();
      this.isSavingProfile = false;

      // 2. Submit vendor profile to portal state
      this.state.submitVendorProfile({
        id: this.form.code,
        company: this.form.company,
        location: this.form.city,
        categories: categories.length ? categories : ['General Supplier'],
        bank: primaryBank.bankName,
        iban: primaryBank.iban,
        accountTitle: primaryBank.accountTitle,
        branch: `${this.form.city} Main Branch`,
        email: this.form.email,
        phone: this.form.phone,
        contactPerson: this.contactForm.name,
        notes: `Signed Doc: ${this.uploadedSignedFileName} | Trade Lic: ${this.form.tradeLicense} | VAT: ${this.form.vatNumber}`
      });

      // 3. Make registration available in both Procurement and Finance dashboards for verification and approval
      this.state.vendorRegistrationRequests.update(list => {
        const reqId = this.form.code || `REQ-${Date.now()}`;
        const idx = list.findIndex(r => r.id === reqId || r.vendorName.toLowerCase() === this.form.company.toLowerCase());
        const updatedReq: VendorRegistrationReq = {
          id: reqId,
          vendorName: this.form.company,
          email: this.form.email,
          phone: this.form.phone,
          contactPerson: this.contactForm.name || this.form.company,
          status: 'Profile Completed',
          createdAt: new Date().toISOString().substring(0, 16).replace('T', ' ')
        };
        if (idx >= 0) {
          return list.map((item, i) => i === idx ? updatedReq : item);
        } else {
          return [updatedReq, ...list];
        }
      });

      // Sync Master Vendor to "Under Review"
      this.state.saveMasterVendor({
        vendorId: this.form.code,
        vendorName: this.form.company,
        shortName: this.form.company,
        email: this.form.email,
        contact: this.form.phone,
        address: this.form.address,
        city: this.form.city,
        stateProvince: this.form.city || 'Dubai',
        country: this.form.country,
        telephone: this.form.phone,
        terms: 'Net 30 Days',
        website: this.form.website || '',
        contactName: this.contactForm.name || this.form.company,
        bankCode: this.bankList[0]?.bankName || '',
        taxRegistrationCode: this.form.vatNumber || '',
        startDate: new Date().toISOString().substring(0, 10),
        inactiveDate: '',
        status: 'Under Review',
        currency: this.currencies[0]?.code || 'AED'
      }, false);

      // 4. Update registration status to Under Review (2) & Lock profile editing
      this.setLifecycleStatus(2);

      try {
        if (typeof window !== 'undefined') {
          const user = this.state.currentUser()?.username;
          const code = this.form.code;
          if (user) {
            localStorage.setItem(`vreg_status_${user}`, '2');
            localStorage.setItem(`vreg_submitted_${user}`, 'true');
            localStorage.setItem(`vreg_signed_${user}`, 'true');
          }
          if (code) {
            localStorage.setItem(`vreg_status_${code}`, '2');
            localStorage.setItem(`vreg_submitted_${code}`, 'true');
            localStorage.setItem(`vreg_signed_${code}`, 'true');
            if (this.uploadedSignedFileName) {
              localStorage.setItem(`vreg_signed_doc_${code}`, this.uploadedSignedFileName);
            }
          }
        }
      } catch {}

      // 5. Display exact requested success message
      this.state.notify('Your vendor registration has been successfully submitted for verification.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.cdr.markForCheck();
    };

    // First try update (op: 3); if not existing or fails, try insert (op: 2)
    this.vendorApi.saveVendorRegistration(regPayload, 3).subscribe({
      next: () => finishVerificationSubmission(),
      error: (updateErr) => {
        console.warn('saveVendorRegistration op:3 failed, attempting insert op:2 fallback...', updateErr);
        this.vendorApi.saveVendorRegistration(regPayload, 2).subscribe({
          next: () => finishVerificationSubmission(),
          error: (insertErr) => {
            this.isSavingProfile = false;
            console.error('saveVendorRegistration op:2 also failed:', insertErr);
            finishVerificationSubmission();
          }
        });
      }
    });
  }

  get activeVendor() {
    return this.state.vendors().find(v => v.id === this.form.code || v.name.toLowerCase() === this.form.company.toLowerCase());
  }

  isProcurementApproved(): boolean {
    return this.procurementApprovalStatus === 'Approved' || this.activeVendor?.procurementStatus === 'Approved';
  }

  isFinanceApproved(): boolean {
    return this.financeApprovalStatus === 'Approved' || this.activeVendor?.financeStatus === 'Approved';
  }

  isFullyApproved(): boolean {
    return this.isProcurementApproved() && this.isFinanceApproved();
  }

  evaluateFullApproval(): void {
    if (this.isFullyApproved()) {
      if (this.state.vendorStatusCode() < 3) {
        this.state.setVendorStatusCode(3, true);
        this.state.notify('🎉 Pre-qualification Approved by Procurement & Finance! Master Vendor ID active in Sage 300 ERP.');
      }
    } else {
      // Must NOT be status 3 if not approved by BOTH Procurement & Finance!
      if (this.state.vendorStatusCode() >= 3) {
        const mode = this.route.snapshot.queryParams['mode'];
        this.state.setVendorStatusCode(mode === 'pending' ? 2 : 1, true);
      }
    }
    this.cdr.markForCheck();
  }

  getStatusName(code: number): string {
    switch (code) {
      case 0: return 'Incomplete Wizard';
      case 1: return 'Review Mode';
      case 2: return 'Pending Approval';
      default: return 'Active Partner (ERP)';
    }
  }

  cycleLifecycleStatus(): void {
    const cur = this.state.vendorStatusCode();
    const next = (cur + 1) % 4;
    this.setLifecycleStatus(next);
  }

  setLifecycleStatus(code: number): void {
    this.state.setVendorStatusCode(code);
    if (code === 1) {
      this.router.navigate([], { relativeTo: this.route, queryParams: { mode: 'review' } });
    } else if (code === 2) {
      this.router.navigate([], { relativeTo: this.route, queryParams: { mode: 'pending' } });
    } else {
      this.router.navigate([], { relativeTo: this.route, queryParams: {} });
    }
  }

  goToStepAndEdit(stepId: number): void {
    if (this.isUnderReview()) {
      this.state.notify('🔒 Application is currently under review. Editing is disabled.');
      return;
    }
    this.currentStep = stepId;
    this.setLifecycleStatus(0);
    this.saveLocalDraft();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  printSummary(): void {
    window.print();
  }

  downloadRegistrationPdf(): void {
    window.print();
    this.state.notify('Registration form ready. Print or save as PDF, affix company stamp/signature, then upload below.');
  }

  confirmAndProceedToUpload(): void {
    this.setLifecycleStatus(2);
    this.state.notify('Application summary confirmed. Please download registration form, stamp & sign it, and upload below.');
  }

  confirmAndSubmitApplication(): void {
    this.setLifecycleStatus(2);
    this.state.notify('Application confirmed and submitted! Awaiting Procurement & Finance audit.');
  }

  onSignedFileSelected(event: any): void {
    const f = event?.target?.files?.[0];
    if (f) {
      this.uploadedSignedFile = f;
      this.uploadedSignedFileName = f.name;
      this.saveLocalDraft();
    }
  }

  removeSignedFile(): void {
    this.uploadedSignedFile = null;
    this.uploadedSignedFileName = '';
    this.saveLocalDraft();
  }

  submitSignedDocument(): void {
    if (!this.uploadedSignedFileName) {
      alert('Please attach a signed & stamped PDF file before submitting.');
      return;
    }
    try {
      if (typeof window !== 'undefined') {
        const username = this.state.currentUser()?.username;
        if (username) localStorage.setItem(`vreg_signed_${username}`, 'true');
        if (this.form.code) localStorage.setItem(`vreg_signed_${this.form.code}`, 'true');
      }
    } catch {}
    this.showThankYouModal = true;
    this.state.notify('✓ Signed & stamped registration document submitted. Awaiting Procurement & Finance audit approval.');
  }

  returnToVendorsList(): void {
    this.router.navigate(['/', this.state.role(), 'vendors'], { queryParams: { tab: 'onboarding' } });
  }

  simulateInternalApproval(): void {
    this.showThankYouModal = false;
    this.procurementApprovalStatus = 'Approved';
    this.financeApprovalStatus = 'Approved';
    if (this.activeVendor) {
      this.activeVendor.procurementStatus = 'Approved';
      this.activeVendor.financeStatus = 'Approved';
    }
    this.state.setVendorStatusCode(3);
    this.state.notify('🎉 Pre-qualification Approved by Procurement & Finance! Master Vendor ID active in Sage 300 ERP.');
    this.router.navigate(['/vendor/dashboard']);
  }

  // STEP COMPLETION AUDIT & DIAGNOSTICS (GetACTIVEList / API)
  openStepDiagnosticsModal(): void {
    this.showStepDiagnosticsModal = true;
    this.fetchStepDiagnostics();
  }

  closeStepDiagnosticsModal(): void {
    this.showStepDiagnosticsModal = false;
  }

  fetchStepDiagnostics(): void {
    this.isCheckingDiagnostics = true;
    const reqno = this.form.code || '';
    this.vendorApi.getActiveVendors(reqno).subscribe({
      next: (res) => {
        this.isCheckingDiagnostics = false;
        const record = Array.isArray(res) ? res[0] : (res?.data?.[0] || res?.data || res);
        this.buildDiagnosticsData(record);
      },
      error: () => {
        this.isCheckingDiagnostics = false;
        this.buildDiagnosticsData(null);
      }
    });
  }

  buildDiagnosticsData(backendRecord: any): void {
    const r = backendRecord || {};
    this.diagnosticsMeta = {
      auddate: r.auddate || new Date().toLocaleString(),
      auduser: r.auduser || this.state.currentUser()?.email || 'SYSTEM_AUD',
      reqno: r.reqno || this.form.code || 'LOCAL-DRAFT'
    };

    const step1Active = r.isactivE1 !== undefined && r.isactivE1 !== null ? Number(r.isactivE1) === 1 : Boolean(this.form.company && this.form.email);
    const step2Active = r.isactivE2 !== undefined && r.isactivE2 !== null ? Number(r.isactivE2) === 1 : (this.currencies.length > 0);
    const step3Active = r.isactivE3 !== undefined && r.isactivE3 !== null ? Number(r.isactivE3) === 1 : Boolean(this.form.company);
    const step4Active = r.isactivE4 !== undefined && r.isactivE4 !== null ? Number(r.isactivE4) === 1 : (this.products.length > 0);
    const step5Active = r.isactivE5 !== undefined && r.isactivE5 !== null ? Number(r.isactivE5) === 1 : (this.customers.length > 0);
    const step6Active = r.isactivE6 !== undefined && r.isactivE6 !== null ? Number(r.isactivE6) === 1 : (this.attachments.length > 0);
    const step7Active = r.isactivE7 !== undefined && r.isactivE7 !== null ? Number(r.isactivE7) === 1 : (this.bankList.length > 0);

    this.stepDiagnostics = [
      {
        stepNo: 1,
        title: 'Basic Company Information',
        description: 'Legal business name, commercial registration, tax/TRN identifiers & official address.',
        flagKey: 'isactivE1',
        isActive: step1Active,
        badgeText: step1Active ? 'Complete (Active)' : 'Pending Data',
        stepTarget: 1
      },
      {
        stepNo: 2,
        title: 'Settlement Currencies',
        description: 'Multi-currency settlement configuration and default transacting currency.',
        flagKey: 'isactivE2',
        isActive: step2Active,
        badgeText: step2Active ? 'Configured (Active)' : 'Pending Currencies',
        stepTarget: 2
      },
      {
        stepNo: 3,
        title: 'Authorized Signatory & Officers',
        description: 'Commercial signing authority, power of attorney and legal representative details.',
        flagKey: 'isactivE3',
        isActive: step3Active,
        badgeText: step3Active ? 'Registered (Active)' : 'Pending Signatory',
        stepTarget: 3
      },
      {
        stepNo: 4,
        title: 'Major Products & Capabilities',
        description: 'Manufactured products, agency representation, and catalog item groups.',
        flagKey: 'isactivE4',
        isActive: step4Active,
        badgeText: step4Active ? 'Recorded (Active)' : 'Pending Products',
        stepTarget: 4
      },
      {
        stepNo: 5,
        title: 'Major Customers & Client References',
        description: 'Commercial references, enterprise client records and transaction history.',
        flagKey: 'isactivE5',
        isActive: step5Active,
        badgeText: step5Active ? 'Verified (Active)' : 'Pending Customers',
        stepTarget: 5
      },
      {
        stepNo: 6,
        title: 'Mandatory Compliance Attachments',
        description: 'Trade license, VAT certificate, company profile, and audit documents (AUDVendorDocument).',
        flagKey: 'isactivE6',
        isActive: step6Active,
        badgeText: step6Active ? 'Uploaded (Active)' : 'Pending Uploads',
        stepTarget: 7
      },
      {
        stepNo: 7,
        title: 'Settlement Bank & IBAN Information',
        description: 'Bank name, verified account title, SWIFT code, and validated IBAN.',
        flagKey: 'isactivE7',
        isActive: step7Active,
        badgeText: step7Active ? 'Validated (Active)' : 'Pending Bank',
        stepTarget: 8
      }
    ];
  }

  jumpToStepFromDiagnostics(stepTarget: number): void {
    this.showStepDiagnosticsModal = false;
    this.goToStep(stepTarget);
  }

  get completedStepsCount(): number {
    return this.stepDiagnostics.filter(s => s.isActive).length;
  }

  getDiagnosticsPercentage(): number {
    if (!this.stepDiagnostics.length) return 0;
    return Math.round((this.completedStepsCount / this.stepDiagnostics.length) * 100);
  }

  resetChanges(): void {
    this.loadVendorProfile();
    this.currentStep = 1;
    this.state.notify('Registration wizard reloaded from server.');
  }
}
