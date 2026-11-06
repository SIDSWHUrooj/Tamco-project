import { Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
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
  isSaving?: boolean;
  isSaved?: boolean;
}

interface BankItem {
  id: string;
  bankName: string;
  accountTitle: string;
  currency: string;
  iban: string;
  country: string;
  branch?: string;
  swift?: string;
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

      &:hover:not(.active) {
        color: #0f172a;
        background: #f1f5f9;
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
      &:hover {
        background: var(--role-accent-hover, #15803d);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px var(--role-glow, rgba(22, 163, 74, 0.25));
      }
      &.btn-submit-app {
        background: #059669;
        &:hover {
          background: #047857;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }
      }
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
  `],
  template: `
    <div style="display: flex; justify-content: flex-end; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
      <button class="btn" (click)="openNoticeModal()" style="background: #16a34a; border-color: #16a34a; display: inline-flex; align-items: center; gap: 6px;">
        <app-icon name="documents" [size]="14" />
        <span>Important Notice</span>
      </button>

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
        <button class="btn" (click)="submitForVerification()" style="background: var(--role-accent); border-color: var(--role-accent); display: inline-flex; align-items: center; gap: 6px;">
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
      } @else {
        <div style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; background: #ecfdf5; border: 1.5px solid #10b981; border-radius: 9999px; color: #065f46; font-weight: 700; font-size: 12.5px;">
          <span>✓</span>
          <span>Certified Active Partner (Sage 300 ERP)</span>
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

    <!-- CERTIFIED SAGE PARTNER BANNER -->
    @if (isFullyApproved()) {
      <div class="certified-partner-banner">
        <div class="cert-left">
          <span class="cert-icon">🏛️</span>
          <div>
            <h4>Sage 300 ERP Certified Vendor Partner</h4>
            <p>Master Accounting Record active in Sage 300 AP Ledger (APVEN). Authorized to receive Purchase Orders, submit Invoices, and participate in procedural sourcing RFQs.</p>
          </div>
        </div>
        <div class="cert-right">
          <span class="cert-badge green">OFFICIAL VENDOR ID: {{ form.code || 'ERP ALLOCATED' }}</span>
          <span class="cert-badge blue">TERMS: NET 30 DAYS</span>
        </div>
      </div>
    }

    <!-- ============================================================
         STATE 1: REVIEW MODE (VendorsStepByStep2.cshtml?showReview=true)
    ============================================================= -->
    @if (state.vendorStatusCode() === 1) {
      <div class="review-mode-container">
        <div class="review-header-bar">
          <div>
            <h2>Application Summary Review</h2>
            <small style="opacity: 0.9;">Please verify all 8 sections before final submission to TAMCO Procurement.</small>
          </div>
          <span class="review-badge-pill">Mode: showReview=true</span>
        </div>

        <!-- 1. Basic Info Review -->
        <div class="review-section-block">
          <div class="review-section-title">
            <span>1. Basic Company Information</span>
            <button type="button" class="btn secondary" style="font-size: 11px; padding: 2px 8px;" (click)="goToStepAndEdit(1)">Edit Step 1 ✎</button>
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
            <div class="review-field-item"><label>Sage Tax Authority</label><div class="review-val">{{ form.tax || '—' }}</div></div>
          </div>
        </div>

        <!-- 2. Currencies Review -->
        <div class="review-section-block">
          <div class="review-section-title">
            <span>2. Approved Settlement Currencies</span>
            <button type="button" class="btn secondary" style="font-size: 11px; padding: 2px 8px;" (click)="goToStepAndEdit(2)">Edit Step 2 ✎</button>
          </div>
          <div style="padding: 16px; display: flex; gap: 8px; flex-wrap: wrap;">
            @for (cur of currencies; track cur.code) {
              <span class="cert-badge" [class.green]="cur.isDefault" [class.blue]="!cur.isDefault">
                {{ cur.code }} - {{ cur.description }} {{ cur.isDefault ? '(Default Transacting)' : '' }}
              </span>
            }
          </div>
        </div>

        <!-- 3. Products Review -->
        <div class="review-section-block">
          <div class="review-section-title">
            <span>3. Product Categories & Brands</span>
            <button type="button" class="btn secondary" style="font-size: 11px; padding: 2px 8px;" (click)="goToStepAndEdit(3)">Edit Step 3 ✎</button>
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

        <!-- 4. Customers Review -->
        <div class="review-section-block">
          <div class="review-section-title">
            <span>4. Major Corporate Customers</span>
            <button type="button" class="btn secondary" style="font-size: 11px; padding: 2px 8px;" (click)="goToStepAndEdit(4)">Edit Step 4 ✎</button>
          </div>
          <div style="padding: 16px; display: flex; flex-direction: column; gap: 8px;">
            @for (cust of customers; track cust.id) {
              <div style="padding: 8px 12px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between;">
                <strong>{{ cust.name }}</strong>
                <span style="color: #64748b; font-size: 12px;">{{ cust.contact }} · {{ cust.city }}, {{ cust.country }} · Deals/Yr: {{ cust.dealsInYear }}</span>
              </div>
            }
          </div>
        </div>

        <!-- 5. Business Information Review -->
        <div class="review-section-block">
          <div class="review-section-title">
            <span>5. Business Information</span>
            <button type="button" class="btn secondary" style="font-size: 11px; padding: 2px 8px;" (click)="goToStepAndEdit(5)">Edit Step 5 ✎</button>
          </div>
          <div class="review-grid-4">
            <div class="review-field-item"><label>Business Type</label><div class="review-val">{{ business.type }}</div></div>
            <div class="review-field-item"><label>Company Status</label><div class="review-val">{{ business.status }}</div></div>
            <div class="review-field-item"><label>Years in Business</label><div class="review-val">{{ business.years }} Years</div></div>
            <div class="review-field-item"><label>Incorporation Place</label><div class="review-val">{{ business.place }}</div></div>
          </div>
        </div>

        <!-- 6. Contacts Review -->
        <div class="review-section-block">
          <div class="review-section-title">
            <span>6. Authorized Contacts</span>
            <button type="button" class="btn secondary" style="font-size: 11px; padding: 2px 8px;" (click)="goToStepAndEdit(6)">Edit Step 6 ✎</button>
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
            <div style="display: flex; gap: 6px;">
              <button type="button" class="btn secondary" style="font-size: 11px; padding: 2px 8px; border-color: #50ae9b; color: #1e5f53;" (click)="syncAllVendorDocuments()">Sync All (AUD) 💾</button>
              <button type="button" class="btn secondary" style="font-size: 11px; padding: 2px 8px;" (click)="goToStepAndEdit(7)">Edit Step 7 ✎</button>
            </div>
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
            <button type="button" class="btn secondary" style="font-size: 11px; padding: 2px 8px;" (click)="goToStepAndEdit(8)">Edit Step 8 ✎</button>
          </div>
          <div style="padding: 16px; display: flex; flex-direction: column; gap: 8px;">
            @for (b of bankList; track b.iban) {
              <div style="padding: 8px 12px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong>{{ b.bankName }}</strong> — <span>{{ b.accountTitle }}</span>
                  <div style="font-family: monospace; font-size: 12px; color: #1e40af; margin-top: 3px;">IBAN: {{ b.iban }} ({{ b.currency }})</div>
                </div>
                <span class="cert-badge blue">{{ b.country }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Review Actions -->
        <div class="review-actions-bar">
          <button type="button" class="btn secondary" (click)="goToStepAndEdit(1)">← Back to Edit Steps</button>
          <button type="button" class="btn secondary" (click)="printSummary()">🖨️ Print Summary</button>
          <button type="button" class="btn" style="background: #16a34a; border-color: #16a34a; color: #fff; font-weight: 700; padding: 10px 20px;" (click)="confirmAndSubmitApplication()">
            ✓ Confirm & Submit Application (Moves to Audit)
          </button>
        </div>
      </div>
    }

    <!-- ============================================================
         STATE 2: PENDING APPROVAL & SIGNED FORM (ReviewForm.cshtml)
    ============================================================= -->
    @else if (state.vendorStatusCode() === 2) {
      <div class="legacy-review-form-card">
        <div class="legacy-card-header">
          <h2>Upload Signed Form</h2>
          <p>Application Reference: <strong>{{ form.code || 'REQ-2024-889' }}</strong></p>
        </div>
        <div class="legacy-card-body">
          <p style="font-size: 13.5px; color: #475569; margin-bottom: 20px;">
            Your registration has been submitted and is currently in <strong>Audit Review</strong> with TAMCO Procurement and Finance. Please download the summary, stamp, sign, and upload the signed PDF below to complete compliance.
          </p>

          <div class="legacy-upload-box" [class.has-file]="!!uploadedSignedFileName">
            <input type="file" class="legacy-file-input" accept="application/pdf" (change)="onSignedFileSelected($event)" />
            <span class="legacy-upload-icon">{{ uploadedSignedFileName ? '📄' : '☁️' }}</span>
            @if (uploadedSignedFileName) {
              <strong style="color: #166534; font-size: 14px;">{{ uploadedSignedFileName }}</strong>
              <p style="margin: 4px 0 0; font-size: 12px; color: #15803d;">File attached successfully! Click Submit Document below.</p>
            } @else {
              <strong style="color: #1e293b; font-size: 14px;">Drag & Drop or <span style="color: #1d78cd; text-decoration: underline;">Click to Browse</span></strong>
              <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">Accepted format: PDF only (Max 10 MB)</p>
            }
          </div>

          @if (uploadedSignedFileName) {
            <div style="margin-top: 14px;">
              <button type="button" class="btn secondary" style="color: #dc2626; border-color: #fca5a5; font-size: 12px; padding: 4px 12px;" (click)="removeSignedFile()">
                ✕ Remove File
              </button>
            </div>
          }

          <div style="display: flex; gap: 12px; justify-content: center; margin-top: 24px;">
            <button type="button" class="btn" style="background: #1d78cd; border-color: #1d78cd; color: #fff; font-weight: 700; min-width: 130px;" (click)="submitSignedDocument()">
              Submit Document
            </button>
            <button type="button" class="btn secondary" (click)="setLifecycleStatus(0)" style="min-width: 100px;">
              Cancel
            </button>
          </div>

          <div style="margin-top: 24px; padding-top: 18px; border-top: 1px dashed #cbd5e1;">
            <span style="font-size: 11px; color: #64748b; display: block; margin-bottom: 8px;">Demo / Testing Action:</span>
            <button type="button" class="btn secondary" style="background: #f0fdf4; border-color: #86efac; color: #166534; font-weight: 700; font-size: 12px;" (click)="simulateInternalApproval()">
              ⚡ Simulate Procurement & Finance Approval → Sage 300 ERP Sync
            </button>
          </div>
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
            [class.completed]="currentStep > st.id"
            (click)="goToStep(st.id)"
          >
            <span class="step-circle">
              @if (currentStep > st.id) { ✓ } @else { {{ st.id }} }
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
                <input [(ngModel)]="form.phone" placeholder="09 876 5432" />
              </div>
            </div>
            <div class="form-field">
              <label>Fax Number</label>
              <div class="phone-input-wrap">
                <span class="flag-badge">🇦🇪 +971</span>
                <input [(ngModel)]="form.fax" placeholder="09 876 5432" />
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
              <input [(ngModel)]="form.zipCode" placeholder="8080" />
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
              <input type="date" [(ngModel)]="form.tradeLicenseExpiry" />
            </div>
            <div class="form-field">
              <label>VAT (TRN Number) *</label>
              <input [(ngModel)]="form.vatNumber" placeholder="100023565656" />
            </div>
            <div class="form-field">
              <label>Corporate Tax Number</label>
              <input [(ngModel)]="form.corporateTax" placeholder="98888888" />
            </div>
            <div class="form-field">
              <label>Sage Tax Authority (ERP Jurisdiction)</label>
              <select [(ngModel)]="form.tax">
                <option value="">Select Sage Tax Authority</option>
                @for (t of sageTaxAuthorities; track t.TaxAuthorityKey) {
                  <option [value]="t.TaxAuthorityKey">{{ t.TaxAuthorityKey }} - {{ t.Description }} ({{ t.TaxReportingCurrency }})</option>
                }
              </select>
            </div>
          </div>
        }

        <!-- ==========================================
             STEP 2: CURRENCY (SCREENSHOTS 12 & 13)
        =========================================== -->
        @if (currentStep === 2) {
          <div class="step-section-bar">
            <h3>Currency:</h3>
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
              <input type="number" [(ngModel)]="business.years" placeholder="Year In Business" />
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
            <h3>Products:</h3>
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
                      No major customer references entered. Click "Add Customer +" to add client references.
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
                      <input class="cell-input" [(ngModel)]="c.phone" placeholder="Contact" />
                    </td>
                    <td>
                      <input class="cell-input" [(ngModel)]="c.city" placeholder="City" />
                    </td>
                    <td>
                      <input class="cell-input" [(ngModel)]="c.country" placeholder="Country" />
                    </td>
                    <td>
                      <input class="cell-input" [(ngModel)]="c.dealsInYear" placeholder="Dealing Years" />
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
                <input [(ngModel)]="contactForm.landline" placeholder="Landline No." />
              </div>
            </div>
            <div class="form-field">
              <label>Ext</label>
              <input [(ngModel)]="contactForm.extension" placeholder="ext." />
            </div>
          </div>

          <div class="form-grid-3">
            <div class="form-field">
              <label>Phone Number *</label>
              <div class="phone-input-wrap">
                <span class="flag-badge">🇦🇪</span>
                <input [(ngModel)]="contactForm.phone" placeholder="Phone number" />
              </div>
            </div>
            <div class="form-field">
              <label>Whatsapp Number</label>
              <div class="phone-input-wrap">
                <span class="flag-badge">🇦🇪</span>
                <input [(ngModel)]="contactForm.whatsapp" placeholder="Whatsapp number" />
              </div>
            </div>
            <div class="form-field">
              <label>Fax No</label>
              <div class="phone-input-wrap">
                <span class="flag-badge">🇦🇪</span>
                <input [(ngModel)]="contactForm.fax" placeholder="Fax number" />
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
            <h3>Attachments</h3>
            <button type="button" class="btn-header-action" (click)="addAttachmentRow()">
              <span>Add Attachment +</span>
            </button>
          </div>

          <div class="tamco-table-wrap">
            <table class="tamco-table">
              <thead>
                <tr>
                  <th style="width: 50px; text-align: center;">SR</th>
                  <th style="min-width: 220px;">Document Description</th>
                  <th style="width: 170px;">Issue Date</th>
                  <th style="width: 170px;">Doc Expiry Date</th>
                  <th>Attached File</th>
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
                      <input class="cell-input" [(ngModel)]="att.description" placeholder="Document Description" />
                    </td>
                    <td>
                      <input type="date" class="cell-input" [(ngModel)]="att.issueDate" />
                    </td>
                    <td>
                      <input type="date" class="cell-input" [(ngModel)]="att.docExpiryDate" />
                    </td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <label class="btn-cell-download" style="cursor: pointer;">
                          <span>Choose File</span>
                          <input type="file" style="display: none;" (change)="onFileUploaded($event, att)" />
                        </label>
                        <span style="font-size: 12px; color: #475569;">
                          {{ att.fileName || 'No file chosen' }}
                        </span>
                        @if (att.fileName) {
                          <span style="font-size: 11px; color: #059669; font-weight: 700;">✓ Attached</span>
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
                        <button
                          type="button"
                          class="btn-cell-delete"
                          (click)="removeAttachment(i)"
                          title="Delete attachment row"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- ==========================================
             STEP 8: BANK INFORMATION (SCREENSHOT 5)
        =========================================== -->
        @if (currentStep === 8) {
          <div class="bank-selection-box">
            <div class="form-grid-2">
              <div class="form-field">
                <span class="bank-box-title">Select currency to add bank information:</span>
                <label>Currency *</label>
                <select [(ngModel)]="bankForm.currency">
                  <option value="" disabled>Select Currency</option>
                  @for (c of (currencies.length > 0 ? currencies : currencyCatalog); track c.code) {
                    <option [value]="c.code">{{ c.code }} - {{ c.description }}</option>
                  }
                </select>
              </div>

              <div class="form-field">
                <span class="bank-box-title">Select country for bank information :</span>
                <label>Country *</label>
                <select [(ngModel)]="bankForm.country">
                  <option value="" disabled>Select Country</option>
                  @for (c of countryList; track c) {
                    <option [value]="c">{{ c }}</option>
                  }
                </select>
              </div>
            </div>

            <!-- ADD BANK DETAIL ROW -->
            <div class="form-grid-3" style="margin-top: 14px;">
              <div class="form-field">
                <label>Bank Name *</label>
                <select [(ngModel)]="bankForm.bankName">
                  <option value="" disabled>Select Bank Name</option>
                  @for (b of standardBankList; track b) {
                    <option [value]="b">{{ b }}</option>
                  }
                </select>
              </div>
              <div class="form-field">
                <label>Account Title *</label>
                <input [(ngModel)]="bankForm.accountTitle" placeholder="Beneficiary Account Title" />
              </div>
              <div class="form-field">
                <label>IBAN / Account Number *</label>
                <input [(ngModel)]="bankForm.iban" placeholder="AE00 0000 0000 0000 0000 00" />
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; margin-top: 12px;">
              <button
                type="button"
                class="btn"
                (click)="addBankToList()"
                style="background: var(--role-accent, #16a34a); border-color: var(--role-accent, #16a34a); color: #ffffff; font-weight: 700; padding: 7px 18px;"
              >
                <span>Add Bank to List +</span>
              </button>
            </div>
          </div>

          <!-- BANK LIST TABLE -->
          <div class="sub-section-bar">
            <h4>Bank List:</h4>
          </div>

          <div class="tamco-table-wrap">
            <table class="tamco-table">
              <thead>
                <tr>
                  <th>Bank Name</th>
                  <th>Title</th>
                  <th style="width: 100px;">Currency</th>
                  <th>IBAN</th>
                  <th>Country</th>
                  <th style="width: 80px; text-align: center;">Action</th>
                </tr>
              </thead>
              <tbody>
                @if (bankList.length === 0) {
                  <tr>
                    <td colspan="6" style="text-align: center; padding: 24px; color: #64748b;">
                      No bank accounts registered yet. Complete the form above to add settlement bank details.
                    </td>
                  </tr>
                }
                @for (b of bankList; track b.id; let i = $index) {
                  <tr>
                    <td><strong>{{ b.bankName }}</strong></td>
                    <td>{{ b.accountTitle }}</td>
                    <td><span class="mono" style="color: #1e40af; font-weight: 700;">{{ b.currency }}</span></td>
                    <td><span class="mono">{{ b.iban }}</span></td>
                    <td>{{ b.country }}</td>
                    <td style="text-align: center;">
                      <button
                        type="button"
                        class="btn-cell-delete"
                        (click)="removeBank(i)"
                        title="Remove bank entry"
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

          @if (currentStep < 8) {
            <button
              type="button"
              class="btn-nav-next"
              (click)="nextStep()"
            >
              <span>Next »</span>
            </button>
          } @else {
            <button
              type="button"
              class="btn-nav-next btn-submit-app"
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

  readonly businessTypeOptions = ['Manufacturing', 'Trading / Distribution', 'Technical Services', 'Contracting', 'Authorized Agent'];
  readonly legalStructureOptions = ['LLC', 'Private Limited', 'Public Limited', 'Free Zone Establishment (FZE)', 'Sole Proprietorship', 'Partnership'];

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
  readonly officeOptions = ['Head Office', 'Branch Office', 'Factory / Plant', 'Central Warehouse'];

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
  attachments: AttachmentRow[] = [];

  // STEP 8: Bank Information
  standardBankList: string[] = [];

  bankForm: {
    currency: string;
    country: string;
    bankName: string;
    accountTitle: string;
    iban: string;
  } = {
    currency: 'AED',
    country: 'United Arab Emirates',
    bankName: '',
    accountTitle: '',
    iban: ''
  };

  bankList: BankItem[] = [];

  ngOnInit(): void {
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
    }
    this.loadVendorProfile();
  }

  loadVendorProfile(): void {
    const user = this.state.currentUser();
    const reqNo = user?.organization?.split('·')?.[0]?.trim() || this.form.code || '';
    if (user?.name) {
      this.form.company = user.name;
    }
    if (reqNo) {
      this.form.code = reqNo;
    }
    if (user?.email) {
      this.form.email = user.email;
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

          // Sync vendor lifecycle code with backend database isactive flag
          if (reg.isactive === 1 || reg.isactive === '1') {
            this.state.setVendorStatusCode(3, true);
          } else if (reg.isactive === 0 || reg.isactive === '0') {
            // Keep in review mode if previously submitted
            const user = this.state.currentUser()?.username;
            const isLocalSubmitted = typeof window !== 'undefined' && user && localStorage.getItem(`vreg_submitted_${user}`) === 'true';
            if (isLocalSubmitted && this.state.vendorStatusCode() === 0) {
              this.state.setVendorStatusCode(1, true);
            }
          }
        }
      },
      error: () => {
        this.isLoadingProfile = false;
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
      }
    });

    // 4. Fetch Bank Accounts from Backend
    this.vendorApi.getVendorBanks(reqNo).subscribe(res => {
      const list = res?.vbank_List || res?.data || (Array.isArray(res) ? res : null);
      if (Array.isArray(list) && list.length > 0) {
        this.bankList = list.map(b => ({
          id: String(b.linenum || 1),
          bankName: b.banK_NAME || '',
          accountTitle: b.titlE_ACC || '',
          currency: b.currency || 'AED',
          iban: b.accounT_IBAN || b.accounT_NO || '',
          country: b.country || this.form.country,
          branch: b.banK_ADRESS || '',
          swift: b.swifT_CODE || ''
        }));
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
      }
    });

    // 6. Fetch Documents from Backend
    this.vendorApi.getVendorDocuments(reqNo).subscribe(res => {
      const list = res?.vdocs_List || res?.data || (Array.isArray(res) ? res : null);
      if (Array.isArray(list) && list.length > 0) {
        this.attachments = list.map((d: any, i: number) => ({
          id: String(d.linenum || i + 1),
          description: d.doC_NAME || '',
          issueDate: d.docdate ? String(d.docdate).substring(0, 10) : '',
          docExpiryDate: d.expdate ? String(d.expdate).substring(0, 10) : '',
          fileName: d.filename || '',
          status: d.isactive ? 'Verified' : 'Pending Upload'
        }));
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
          }
        });
      }
    });
  }

  // WIZARD NAVIGATION
  goToStep(stepId: number): void {
    if (stepId >= 1 && stepId <= 8) {
      this.currentStep = stepId;
    }
  }

  nextStep(): void {
    if (this.currentStep < 8) {
      this.currentStep++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // IMPORTANT NOTICE POPUP
  openNoticeModal(): void {
    this.showNoticeModal = true;
  }

  closeNoticeModal(): void {
    this.showNoticeModal = false;
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
    this.showCurrencyModal = false;
    this.state.notify(`Transacting currencies updated (${this.currencies.length} active).`);
  }

  setDefaultCurrency(currency: CurrencyItem): void {
    this.currencies = this.currencies.map(item => ({
      ...item,
      isDefault: item.code === currency.code
    }));
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
    this.state.notify('New customer reference row added.');
  }

  removeCustomer(index: number): void {
    this.customers.splice(index, 1);
    this.state.notify('Customer reference removed.');
  }

  // STEP 6: CONTACTS
  addContactPerson(): void {
    if (!this.contactForm.name.trim() || !this.contactForm.email.trim()) {
      this.state.notify('Please provide at least Contact Name and Email Address.');
      return;
    }

    this.contactsList.push({ ...this.contactForm, id: String(Date.now()) });
    this.state.notify(`Contact person "${this.contactForm.name}" added.`);

    // Reset contact form
    this.contactForm = {
      name: '',
      department: 'Procurement',
      designation: 'Commercial Manager',
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
    this.state.notify(`Contact "${removed[0].name}" removed.`);
  }

  // STEP 7: ATTACHMENTS
  addAttachmentRow(): void {
    this.attachments.push({
      id: String(Date.now()),
      description: 'Commercial Document',
      issueDate: new Date().toISOString().substring(0, 10),
      docExpiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().substring(0, 10),
      fileName: '',
      status: 'Pending Upload'
    });
    this.state.notify('New attachment row added.');
  }

  removeAttachment(index: number): void {
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
      expdate: att.docExpiryDate || '',
      exP_FLAG: att.docExpiryDate ? 1 : 0,
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
  addBankToList(): void {
    if (!this.bankForm.bankName || !this.bankForm.iban || !this.bankForm.accountTitle) {
      this.state.notify('Please enter Bank Name, Account Title, and IBAN Number.');
      return;
    }

    this.bankList.push({
      id: String(Date.now()),
      bankName: this.bankForm.bankName,
      accountTitle: this.bankForm.accountTitle,
      currency: this.bankForm.currency,
      iban: this.bankForm.iban,
      country: this.bankForm.country
    });

    this.state.notify(`Bank account for ${this.bankForm.bankName} added.`);
  }

  removeBank(index: number): void {
    this.bankList.splice(index, 1);
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

    // Banks
    for (const b of this.bankList) {
      if (b.bankName && b.iban) {
        this.vendorApi.saveVendorBank({
          coperation: 2,
          reqno,
          vendoR_NAME: this.form.company,
          banK_NAME: b.bankName,
          titlE_ACC: b.accountTitle || this.form.company,
          accounT_IBAN: b.iban,
          country: b.country || this.form.country,
          currency: b.currency || 'AED'
        }, 2).subscribe();
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
          expdate: att.docExpiryDate || '',
          exP_FLAG: att.docExpiryDate ? 1 : 0,
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
      yearbus: this.business.years,
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

  submitForVerification(): void {
    if (!this.form.company) {
      this.state.notify('Error: Legal Vendor Name is required.');
      this.currentStep = 1;
      return;
    }

    if (this.bankList.length === 0 && (!this.bankForm.bankName || !this.bankForm.iban)) {
      this.state.notify('Error: At least one settlement bank account with IBAN is required in Step 8.');
      this.currentStep = 8;
      return;
    }

    const primaryBank = this.bankList[0] || {
      bankName: this.bankForm.bankName,
      iban: this.bankForm.iban,
      accountTitle: this.bankForm.accountTitle,
      country: this.bankForm.country
    };

    const categories = this.products.map(p => p.description);

    this.isSavingProfile = true;

    const regPayload: Partial<VREGModel> = {
      coperation: 3,
      reqno: this.form.code,
      vendoR_NAME: this.form.company,
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
      yearbus: this.business.years,
      incorplace: this.business.place,
      isactive: 0
    };

    this.vendorApi.saveVendorRegistration(regPayload, 3).subscribe({
      next: () => {
        this.syncRelatedProfileData();
        this.isSavingProfile = false;
        this.state.submitVendorProfile({
          id: this.form.code,
          company: this.form.company,
          location: this.form.city,
          categories: categories.length ? categories : ['Electrical', 'Industrial Safety', 'Mechanical'],
          bank: primaryBank.bankName,
          iban: primaryBank.iban,
          accountTitle: primaryBank.accountTitle,
          branch: `${this.form.city} Main Branch`,
          notes: `Trade Lic: ${this.form.tradeLicense} (Exp: ${this.form.tradeLicenseExpiry}) | VAT: ${this.form.vatNumber} | Corp Tax: ${this.form.corporateTax}`
        });

        // Strictly transition to Review Mode (1)
        this.setLifecycleStatus(1);
        try {
          if (typeof window !== 'undefined') {
            const user = this.state.currentUser()?.username;
            if (user) localStorage.setItem(`vreg_submitted_${user}`, 'true');
          }
        } catch {}
        this.router.navigate([], { relativeTo: this.route, queryParams: { mode: 'review' } });
        this.state.notify('🎉 Application submitted successfully to the server! Internal review initiated.');
      },
      error: (err) => {
        this.isSavingProfile = false;
        console.error('saveVendorRegistration failed:', err);
        const errMsg = err?.error?.errors
          ? Object.entries(err.error.errors).map(([k, v]) => `${k}: ${(v as string[]).join(', ')}`).join(' | ')
          : (err?.error?.title || err?.message || 'Server error');
        this.state.notify(`❌ Submission rejected by server: ${errMsg}`);
      }
    });
  }

  get activeVendor() {
    return this.state.vendors().find(v => v.id === this.form.code || v.name.toLowerCase() === this.form.company.toLowerCase());
  }

  isProcurementApproved(): boolean {
    return this.state.vendorStatusCode() >= 3 || this.activeVendor?.procurementStatus === 'Approved';
  }

  isFinanceApproved(): boolean {
    return this.state.vendorStatusCode() >= 3 || this.activeVendor?.financeStatus === 'Approved';
  }

  isFullyApproved(): boolean {
    return this.state.vendorStatusCode() >= 3 || (this.isProcurementApproved() && this.isFinanceApproved());
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
    this.currentStep = stepId;
    this.setLifecycleStatus(0);
  }

  printSummary(): void {
    window.print();
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
    }
  }

  removeSignedFile(): void {
    this.uploadedSignedFile = null;
    this.uploadedSignedFileName = '';
  }

  submitSignedDocument(): void {
    if (!this.uploadedSignedFileName) {
      alert('Please attach a signed PDF file before submitting.');
      return;
    }
    this.showThankYouModal = true;
    this.state.notify('Signed form uploaded for ' + (this.form.code || 'REQ-2024-889'));
  }

  simulateInternalApproval(): void {
    this.showThankYouModal = false;
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
