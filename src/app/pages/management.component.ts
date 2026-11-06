import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PortalStateService } from '../core/portal-state.service';
import { VendorApiService } from '../core/vendor-api.service';
import { IconComponent } from '../shared/icon.component';
import {
  DocumentTypeItem,
  BrandItem,
  ProductItem,
  DesignationItem,
  DepartmentItem,
  DocNumberItem,
  ShipViaItem,
  ASTypeItem,
  CurrencyItem,
  SecurityModuleItem,
  CountryIbanItem,
  EmailSetupConfig
} from '../core/models';

type ManagementTab =
  | 'document-type'
  | 'brand'
  | 'product'
  | 'department'
  | 'designation'
  | 'doc-number'
  | 'ship-via'
  | 'as-type'
  | 'currency'
  | 'module'
  | 'iban-rules'
  | 'email';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <!-- 2-Column Split Master Settings Layout (Matching Screenshot) -->
    <div class="management-split-layout">
      <!-- Vertical Settings Subnav Sidebar -->
      <aside class="management-subnav">
        <div class="subnav-header">
          <div class="subnav-title-group">
            <h3 class="subnav-title">Settings</h3>
          </div>
          <div class="subnav-search-bar">
            <svg class="subnav-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              [(ngModel)]="sidebarFilter"
              placeholder="Search settings..."
              class="subnav-search-input"
            />
            @if (sidebarFilter) {
              <button type="button" class="subnav-search-clear" (click)="sidebarFilter = ''">✕</button>
            }
          </div>
        </div>

        <nav class="subnav-menu">
          @if (matchesFilter('document-type', 'Document Type Details')) {
            <button
              type="button"
              class="subnav-item"
              [class.active]="activeTab === 'document-type'"
              (click)="setTab('document-type')"
            >
              <svg class="subnav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span class="subnav-label">Document Type</span>
            </button>
          }

          @if (matchesFilter('brand', 'Brand Setup Information')) {
            <button
              type="button"
              class="subnav-item"
              [class.active]="activeTab === 'brand'"
              (click)="setTab('brand')"
            >
              <svg class="subnav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
              </svg>
              <span class="subnav-label">Brand</span>
            </button>
          }

          @if (matchesFilter('department', 'Department Master Setup')) {
            <button
              type="button"
              class="subnav-item"
              [class.active]="activeTab === 'department'"
              (click)="setTab('department')"
            >
              <svg class="subnav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                <line x1="9" y1="22" x2="9" y2="22.01"></line>
                <line x1="15" y1="22" x2="15" y2="22.01"></line>
                <line x1="9" y1="18" x2="9" y2="18.01"></line>
                <line x1="15" y1="18" x2="15" y2="18.01"></line>
                <line x1="9" y1="14" x2="9" y2="14.01"></line>
                <line x1="15" y1="14" x2="15" y2="14.01"></line>
                <line x1="9" y1="10" x2="9" y2="10.01"></line>
                <line x1="15" y1="10" x2="15" y2="10.01"></line>
              </svg>
              <span class="subnav-label">Department</span>
            </button>
          }

          @if (matchesFilter('designation', 'Designation Details')) {
            <button
              type="button"
              class="subnav-item"
              [class.active]="activeTab === 'designation'"
              (click)="setTab('designation')"
            >
              <svg class="subnav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span class="subnav-label">Designation</span>
            </button>
          }

          @if (matchesFilter('doc-number', 'Doc Numbering Sequences')) {
            <button
              type="button"
              class="subnav-item"
              [class.active]="activeTab === 'doc-number'"
              (click)="setTab('doc-number')"
            >
              <svg class="subnav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="10" y1="6" x2="21" y2="6"></line>
                <line x1="10" y1="12" x2="21" y2="12"></line>
                <line x1="10" y1="18" x2="21" y2="18"></line>
                <path d="M4 6h1v4"></path>
                <path d="M4 10h2"></path>
                <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
              </svg>
              <span class="subnav-label">Doc Numbering</span>
            </button>
          }

          @if (matchesFilter('ship-via', 'Ship Via Carriers Setup')) {
            <button
              type="button"
              class="subnav-item"
              [class.active]="activeTab === 'ship-via'"
              (click)="setTab('ship-via')"
            >
              <svg class="subnav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
              <span class="subnav-label">Ship Via</span>
            </button>
          }

          @if (matchesFilter('as-type', 'Asset & Expense Types Classification')) {
            <button
              type="button"
              class="subnav-item"
              [class.active]="activeTab === 'as-type'"
              (click)="setTab('as-type')"
            >
              <svg class="subnav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
              <span class="subnav-label">Asset Types</span>
            </button>
          }

          @if (matchesFilter('currency', 'Custom Currency Master Details')) {
            <button
              type="button"
              class="subnav-item"
              [class.active]="activeTab === 'currency'"
              (click)="setTab('currency')"
            >
              <svg class="subnav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              <span class="subnav-label">Currencies</span>
            </button>
          }

          @if (matchesFilter('module', 'System Security Modules Configuration')) {
            <button
              type="button"
              class="subnav-item"
              [class.active]="activeTab === 'module'"
              (click)="setTab('module')"
            >
              <svg class="subnav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span class="subnav-label">Security Modules</span>
            </button>
          }

          @if (matchesFilter('iban-rules', 'Country IBAN Character Length Standards')) {
            <button
              type="button"
              class="subnav-item"
              [class.active]="activeTab === 'iban-rules'"
              (click)="setTab('iban-rules')"
            >
              <svg class="subnav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <span class="subnav-label">IBAN Rules</span>
            </button>
          }

          @if (matchesFilter('email', 'Email Setup SMTP')) {
            <button
              type="button"
              class="subnav-item"
              [class.active]="activeTab === 'email'"
              (click)="setTab('email')"
            >
              <svg class="subnav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span class="subnav-label">Email Setup</span>
            </button>
          }
        </nav>
      </aside>

      <!-- Right Main Content Workspace Panel -->
      <main class="management-workspace">

    <!-- ========================================================================= -->
    <!-- TAB 1: DOCUMENT TYPE DETAILS (Document_Type.cshtml) -->
    <!-- ========================================================================= -->
    @if (activeTab === 'document-type') {
      <div class="tab-content-panel">
        <article class="panel main-card">
          <div class="main-heading-banner">
            <h5>Document Type Details</h5>
          </div>

          <div class="form-body">
            <div class="form-row two-col">
              <div class="col">
                <label>Document ID <span class="required">*</span></label>
                <div class="input-with-actions">
                  <input
                    type="text"
                    [(ngModel)]="docForm.docId"
                    placeholder="Enter Document ID"
                    class="form-control"
                  />
                  <button
                    type="button"
                    class="btn-attached search-btn"
                    style="background-color: var(--role-accent, #50ae9b);"
                    (click)="showDocModal = true"
                    title="Lookup existing document types"
                  >
                    <app-icon name="search" [size]="15" />
                  </button>
                  <button
                    type="button"
                    class="btn-attached refresh-btn"
                    style="background-color: deepskyblue;"
                    (click)="resetDocForm()"
                    title="Reset Form"
                  >
                    <app-icon name="refresh" [size]="15" />
                  </button>
                </div>
              </div>

              <div class="col">
                <label>Document Name <span class="required">*</span></label>
                <input
                  type="text"
                  [(ngModel)]="docForm.docName"
                  placeholder="Enter Document Name"
                  class="form-control"
                />
              </div>
            </div>

            <div class="form-row checkbox-row">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="docForm.expirable" />
                <span>Expire able</span>
              </label>

              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="docForm.group" />
                <span>Group</span>
              </label>

              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="docForm.mandatory" />
                <span>Mandatory</span>
              </label>
            </div>

            <div class="btn-actions-row">
              <button
                type="button"
                class="btn btn-primary"
                style="background-color: #007bff; border-color: #007bff;"
                (click)="submitDocForm()"
              >
                {{ docEditMode ? 'Update' : 'Submit' }}
              </button>
              @if (docEditMode) {
                <button
                  type="button"
                  class="btn btn-secondary"
                  (click)="resetDocForm()"
                >
                  Cancel Edit
                </button>
                <button
                  type="button"
                  class="btn"
                  style="background-color: #dc3545; color: #fff; border-color: #dc3545;"
                  (click)="deleteDoc(editingDocId); resetDocForm()"
                >
                  Delete
                </button>
              }
            </div>
          </div>
        </article>
      </div>
    }

    <!-- ========================================================================= -->
    <!-- TAB 2: BRAND INFORMATION (Brand.cshtml) -->
    <!-- ========================================================================= -->
    @if (activeTab === 'brand') {
      <div class="tab-content-panel">
        <article class="panel main-card">
          <div class="main-heading-banner">
            <h5>Brand Information</h5>
          </div>

          <div class="form-body">
            <div class="form-row two-col">
              <div class="col">
                <label>Brand ID <span class="required">*</span></label>
                <div class="input-with-actions">
                  <input
                    type="text"
                    [(ngModel)]="brandForm.brandId"
                    placeholder="Enter Brand ID"
                    class="form-control"
                  />
                  <button
                    type="button"
                    class="btn-attached search-btn"
                    style="background-color: var(--role-accent, #50ae9b);"
                    (click)="showBrandModal = true"
                    title="Lookup existing brands"
                  >
                    <app-icon name="search" [size]="15" />
                  </button>
                  <button
                    type="button"
                    class="btn-attached refresh-btn"
                    style="background-color: deepskyblue;"
                    (click)="resetBrandForm()"
                    title="Reset Form"
                  >
                    <app-icon name="refresh" [size]="15" />
                  </button>
                </div>
              </div>

              <div class="col">
                <label>Brand Name <span class="required">*</span></label>
                <input
                  type="text"
                  [(ngModel)]="brandForm.brandName"
                  placeholder="Enter Brand Name"
                  class="form-control"
                />
              </div>
            </div>

            <div class="btn-actions-row">
              <button
                type="button"
                class="btn btn-primary"
                style="background-color: #007bff; border-color: #007bff;"
                (click)="submitBrandForm()"
              >
                {{ brandEditMode ? 'Update' : 'Submit' }}
              </button>
              @if (brandEditMode) {
                <button
                  type="button"
                  class="btn btn-secondary"
                  (click)="resetBrandForm()"
                >
                  Cancel Edit
                </button>
                <button
                  type="button"
                  class="btn"
                  style="background-color: #dc3545; color: #fff; border-color: #dc3545;"
                  (click)="deleteBrand(editingBrandId); resetBrandForm()"
                >
                  Delete
                </button>
              }
            </div>
          </div>
        </article>
      </div>
    }

    <!-- ========================================================================= -->
    <!-- TAB 4: DEPARTMENT MASTER (Department.cshtml) -->
    <!-- ========================================================================= -->
    @if (activeTab === 'department') {
      <div class="tab-content-panel">
        <article class="panel main-card">
          <div class="main-heading-banner">
            <h5>Department Master Setup</h5>
          </div>

          <div class="form-body">
            <div class="form-row two-col">
              <div class="col">
                <label>Department ID <span class="required">*</span></label>
                <div class="input-with-actions">
                  <input
                    type="text"
                    [(ngModel)]="deptForm.deptId"
                    placeholder="e.g. DEP-01"
                    class="form-control"
                  />
                  <button
                    type="button"
                    class="btn-attached search-btn"
                    style="background-color: var(--role-accent, #50ae9b);"
                    (click)="showDeptModal = true"
                    title="Lookup existing departments"
                  >
                    <app-icon name="search" [size]="15" />
                  </button>
                  <button
                    type="button"
                    class="btn-attached refresh-btn"
                    style="background-color: deepskyblue;"
                    (click)="resetDeptForm()"
                    title="Reset Form"
                  >
                    <app-icon name="refresh" [size]="15" />
                  </button>
                </div>
              </div>

              <div class="col">
                <label>Department Name <span class="required">*</span></label>
                <input
                  type="text"
                  [(ngModel)]="deptForm.deptName"
                  placeholder="Enter Department Name"
                  class="form-control"
                />
              </div>
            </div>

            <div class="btn-actions-row">
              <button
                type="button"
                class="btn btn-primary"
                style="background-color: #007bff; border-color: #007bff;"
                (click)="submitDeptForm()"
              >
                {{ deptEditMode ? 'Update Department' : 'Submit Department' }}
              </button>
              @if (deptEditMode) {
                <button
                  type="button"
                  class="btn btn-secondary"
                  (click)="resetDeptForm()"
                >
                  Cancel Edit
                </button>
                <button
                  type="button"
                  class="btn"
                  style="background-color: #dc3545; color: #fff; border-color: #dc3545;"
                  (click)="deleteDepartment(editingDeptId); resetDeptForm()"
                >
                  Delete
                </button>
              }
            </div>
          </div>
        </article>
      </div>
    }

    <!-- ========================================================================= -->
    <!-- TAB 5: DESIGNATION & DEPARTMENT (Designation.cshtml) -->
    <!-- ========================================================================= -->
    @if (activeTab === 'designation') {
      <div class="tab-content-panel">
        <article class="panel main-card">
          <div class="main-heading-banner">
            <h5>Designation Details</h5>
          </div>

          <div class="form-body">
            <div class="form-row three-col">
              <div class="col" style="flex: 1.2;">
                <label>Department Name <span class="required">*</span></label>
                <div class="input-with-actions">
                  <input
                    type="text"
                    [(ngModel)]="desigForm.deptName"
                    placeholder="Enter Department Name"
                    class="form-control"
                  />
                  <button
                    type="button"
                    class="btn-attached search-btn"
                    style="background-color: var(--role-accent, #50ae9b);"
                    (click)="showDeptModal = true"
                    title="Lookup departments"
                  >
                    <app-icon name="search" [size]="15" />
                  </button>
                </div>
              </div>

              <div class="col" style="flex: 1;">
                <label>Designation ID <span class="required">*</span></label>
                <div class="input-with-actions">
                  <input
                    type="text"
                    [(ngModel)]="desigForm.desigId"
                    placeholder="Enter Designation ID"
                    class="form-control"
                  />
                  <button
                    type="button"
                    class="btn-attached search-btn"
                    style="background-color: var(--role-accent, #50ae9b);"
                    (click)="showDesigModal = true"
                    title="Lookup designations"
                  >
                    <app-icon name="search" [size]="15" />
                  </button>
                  <button
                    type="button"
                    class="btn-attached refresh-btn"
                    style="background-color: deepskyblue;"
                    (click)="resetDesigForm()"
                    title="Reset Form"
                  >
                    <app-icon name="refresh" [size]="15" />
                  </button>
                </div>
              </div>

              <div class="col" style="flex: 1.5;">
                <label>Designation Name <span class="required">*</span></label>
                <input
                  type="text"
                  [(ngModel)]="desigForm.desigName"
                  placeholder="Enter Designation Name"
                  class="form-control"
                />
              </div>
            </div>

            <div class="btn-actions-row">
              <button
                type="button"
                class="btn btn-primary"
                style="background-color: #007bff; border-color: #007bff;"
                (click)="submitDesigForm()"
              >
                {{ desigEditMode ? 'Update' : 'Submit' }}
              </button>
              @if (desigEditMode) {
                <button
                  type="button"
                  class="btn btn-secondary"
                  (click)="resetDesigForm()"
                >
                  Cancel Edit
                </button>
                <button
                  type="button"
                  class="btn"
                  style="background-color: #dc3545; color: #fff; border-color: #dc3545;"
                  (click)="deleteDesig(editingDesigId); resetDesigForm()"
                >
                  Delete
                </button>
              }
            </div>
          </div>
        </article>
      </div>
    }

    <!-- ========================================================================= -->
    <!-- TAB 6: DOCUMENT NUMBERING SEQUENCE (Doc_Number.cshtml) -->
    <!-- ========================================================================= -->
    @if (activeTab === 'doc-number') {
      <div class="tab-content-panel">
        <article class="panel main-card">
          <div class="main-heading-banner">
            <h5>Document Numbering Sequences (Doc_Number)</h5>
          </div>

          <div class="form-body">
            <div class="form-row four-col">
              <div class="col">
                <label>Module Code <span class="required">*</span></label>
                <div class="input-with-actions">
                  <input
                    type="text"
                    [(ngModel)]="docNumForm.module"
                    placeholder="e.g. REQ, PO, INV"
                    class="form-control"
                  />
                  <button
                    type="button"
                    class="btn-attached search-btn"
                    style="background-color: var(--role-accent, #50ae9b);"
                    (click)="showDocNumModal = true"
                    title="Lookup numbering sequences"
                  >
                    <app-icon name="search" [size]="15" />
                  </button>
                  <button
                    type="button"
                    class="btn-attached refresh-btn"
                    style="background-color: deepskyblue;"
                    (click)="resetDocNumForm()"
                    title="Reset Form"
                  >
                    <app-icon name="refresh" [size]="15" />
                  </button>
                </div>
              </div>

              <div class="col">
                <label>Prefix Format <span class="required">*</span></label>
                <input
                  type="text"
                  [(ngModel)]="docNumForm.prefix"
                  placeholder="e.g. REQ-2026-, PO-"
                  class="form-control"
                />
              </div>

              <div class="col">
                <label>Starting / Next Number <span class="required">*</span></label>
                <input
                  type="number"
                  [(ngModel)]="docNumForm.number"
                  placeholder="e.g. 101"
                  class="form-control"
                />
              </div>

              <div class="col">
                <label>Zero-Pad Length <span class="required">*</span></label>
                <input
                  type="text"
                  [(ngModel)]="docNumForm.length"
                  placeholder="e.g. 4 or 5"
                  class="form-control"
                />
              </div>
            </div>

            <div class="btn-actions-row">
              <button
                type="button"
                class="btn btn-primary"
                style="background-color: #007bff; border-color: #007bff;"
                (click)="submitDocNumForm()"
              >
                {{ docNumEditMode ? 'Update Sequence' : 'Register Sequence' }}
              </button>
              @if (docNumEditMode) {
                <button
                  type="button"
                  class="btn btn-secondary"
                  (click)="resetDocNumForm()"
                >
                  Cancel Edit
                </button>
                <button
                  type="button"
                  class="btn"
                  style="background-color: #dc3545; color: #fff; border-color: #dc3545;"
                  (click)="deleteDocNum(editingDocNumId); resetDocNumForm()"
                >
                  Delete
                </button>
              }
            </div>
          </div>
        </article>
      </div>
    }

    <!-- ========================================================================= -->
    <!-- TAB 7: SHIP VIA & FREIGHT CARRIERS (ShipVia.cshtml) -->
    <!-- ========================================================================= -->
    @if (activeTab === 'ship-via') {
      <div class="tab-content-panel">
        <article class="panel main-card">
          <div class="main-heading-banner">
            <h5>Ship Via & Logistics Carriers Setup (ShipVia)</h5>
          </div>

          <div class="form-body">
            <div class="form-row two-col">
              <div class="col">
                <label>Ship Via Code <span class="required">*</span></label>
                <div class="input-with-actions">
                  <input
                    type="text"
                    [(ngModel)]="shipViaForm.shipViaCode"
                    placeholder="e.g. SV-01, DHL, ARX"
                    class="form-control"
                  />
                  <button
                    type="button"
                    class="btn-attached search-btn"
                    style="background-color: var(--role-accent, #50ae9b);"
                    (click)="showShipViaModal = true"
                    title="Lookup shipping carriers"
                  >
                    <app-icon name="search" [size]="15" />
                  </button>
                  <button
                    type="button"
                    class="btn-attached refresh-btn"
                    style="background-color: deepskyblue;"
                    (click)="resetShipViaForm()"
                    title="Reset Form"
                  >
                    <app-icon name="refresh" [size]="15" />
                  </button>
                </div>
              </div>

              <div class="col">
                <label>Carrier / Dispatch Name <span class="required">*</span></label>
                <input
                  type="text"
                  [(ngModel)]="shipViaForm.shipViaName"
                  placeholder="e.g. DHL Express Worldwide, Aramex Priority"
                  class="form-control"
                />
              </div>
            </div>

            <div class="btn-actions-row">
              <button
                type="button"
                class="btn btn-primary"
                style="background-color: #007bff; border-color: #007bff;"
                (click)="submitShipViaForm()"
              >
                {{ shipViaEditMode ? 'Update Carrier' : 'Register Carrier' }}
              </button>
              @if (shipViaEditMode) {
                <button
                  type="button"
                  class="btn btn-secondary"
                  (click)="resetShipViaForm()"
                >
                  Cancel Edit
                </button>
                <button
                  type="button"
                  class="btn"
                  style="background-color: #dc3545; color: #fff; border-color: #dc3545;"
                  (click)="deleteShipVia(editingShipViaId); resetShipViaForm()"
                >
                  Delete
                </button>
              }
            </div>
          </div>
        </article>
      </div>
    }

    <!-- ========================================================================= -->
    <!-- TAB 8: ASSET & EXPENSE CATEGORY TYPES (ASType.cshtml) -->
    <!-- ========================================================================= -->
    @if (activeTab === 'as-type') {
      <div class="tab-content-panel">
        <article class="panel main-card">
          <div class="main-heading-banner">
            <h5>Asset & Expense Types Classification (ASType)</h5>
          </div>

          <div class="form-body">
            <div class="form-row two-col">
              <div class="col">
                <label>Asset Type ID (TID) <span class="required">*</span></label>
                <div class="input-with-actions">
                  <input
                    type="text"
                    [(ngModel)]="asTypeForm.tid"
                    placeholder="e.g. AST-01, CAPEX, OPEX"
                    class="form-control"
                  />
                  <button
                    type="button"
                    class="btn-attached search-btn"
                    style="background-color: var(--role-accent, #50ae9b);"
                    (click)="showAsTypeModal = true"
                    title="Lookup asset categories"
                  >
                    <app-icon name="search" [size]="15" />
                  </button>
                  <button
                    type="button"
                    class="btn-attached refresh-btn"
                    style="background-color: deepskyblue;"
                    (click)="resetAsTypeForm()"
                    title="Reset Form"
                  >
                    <app-icon name="refresh" [size]="15" />
                  </button>
                </div>
              </div>

              <div class="col">
                <label>Classification Title / Category Name <span class="required">*</span></label>
                <input
                  type="text"
                  [(ngModel)]="asTypeForm.tname"
                  placeholder="e.g. Capital Assets, Machinery, IT Infrastructure"
                  class="form-control"
                />
              </div>
            </div>

            <div class="btn-actions-row">
              <button
                type="button"
                class="btn btn-primary"
                style="background-color: #007bff; border-color: #007bff;"
                (click)="submitAsTypeForm()"
              >
                {{ asTypeEditMode ? 'Update Classification' : 'Register Classification' }}
              </button>
              @if (asTypeEditMode) {
                <button
                  type="button"
                  class="btn btn-secondary"
                  (click)="resetAsTypeForm()"
                >
                  Cancel Edit
                </button>
                <button
                  type="button"
                  class="btn"
                  style="background-color: #dc3545; color: #fff; border-color: #dc3545;"
                  (click)="deleteAsType(editingAsTypeId); resetAsTypeForm()"
                >
                  Delete
                </button>
              }
            </div>
          </div>
        </article>
      </div>
    }

    <!-- ========================================================================= -->
    <!-- TAB: CUSTOM CURRENCY MASTER (AUDCURRENCYDETAILS / GetCURRENCYList) -->
    <!-- ========================================================================= -->
    @if (activeTab === 'currency') {
      <div class="tab-content-panel">
        <article class="panel main-card">
          <div class="main-heading-banner">
            <h5>Custom Currency Master Details</h5>
          </div>

          <div class="form-body">
            <div class="form-row three-col">
              <div class="col" style="flex: 1;">
                <label>Currency Code (ISO) <span class="required">*</span></label>
                <div class="input-with-actions">
                  <input
                    type="text"
                    [(ngModel)]="currencyForm.currencyId"
                    placeholder="e.g. AED, USD, EUR, GBP"
                    class="form-control"
                  />
                  <button
                    type="button"
                    class="btn-attached search-btn"
                    style="background-color: var(--role-accent, #50ae9b);"
                    (click)="showCurrencyModal = true"
                    title="Lookup currencies"
                  >
                    <app-icon name="search" [size]="15" />
                  </button>
                  <button
                    type="button"
                    class="btn-attached refresh-btn"
                    style="background-color: deepskyblue;"
                    (click)="resetCurrencyForm()"
                    title="Reset Form"
                  >
                    <app-icon name="refresh" [size]="15" />
                  </button>
                </div>
              </div>

              <div class="col" style="flex: 1.5;">
                <label>Currency Full Name <span class="required">*</span></label>
                <input
                  type="text"
                  [(ngModel)]="currencyForm.currencyName"
                  placeholder="e.g. UAE Dirham, US Dollar"
                  class="form-control"
                />
              </div>

              <div class="col" style="flex: 0.8;">
                <label>Currency Symbol</label>
                <input
                  type="text"
                  [(ngModel)]="currencyForm.symbol"
                  placeholder="e.g. AED, $, €"
                  class="form-control"
                />
              </div>
            </div>

            <div class="btn-actions-row">
              <button
                type="button"
                class="btn btn-primary"
                style="background-color: #007bff; border-color: #007bff;"
                (click)="submitCurrencyForm()"
              >
                {{ currencyEditMode ? 'Update Currency' : 'Register Currency' }}
              </button>
              @if (currencyEditMode) {
                <button
                  type="button"
                  class="btn btn-secondary"
                  (click)="resetCurrencyForm()"
                >
                  Cancel Edit
                </button>
                <button
                  type="button"
                  class="btn"
                  style="background-color: #dc3545; color: #fff; border-color: #dc3545;"
                  (click)="deleteCurrency(editingCurrencyId); resetCurrencyForm()"
                >
                  Delete
                </button>
              }
            </div>
          </div>
        </article>
      </div>
    }

    <!-- ========================================================================= -->
    <!-- TAB: SYSTEM SECURITY MODULES (AUDCSMODULE / GetCSMODULEList) -->
    <!-- ========================================================================= -->
    @if (activeTab === 'module') {
      <div class="tab-content-panel">
        <article class="panel main-card">
          <div class="main-heading-banner">
            <h5>System Security Modules Configuration</h5>
          </div>

          <div class="form-body">
            <div class="form-row three-col">
              <div class="col" style="flex: 0.8;">
                <label>Module ID <span class="required">*</span></label>
                <div class="input-with-actions">
                  <input
                    type="number"
                    [(ngModel)]="moduleForm.moduleId"
                    placeholder="e.g. 1, 2, 3"
                    class="form-control"
                  />
                  <button
                    type="button"
                    class="btn-attached search-btn"
                    style="background-color: var(--role-accent, #50ae9b);"
                    (click)="showModuleModal = true"
                    title="Lookup security modules"
                  >
                    <app-icon name="search" [size]="15" />
                  </button>
                  <button
                    type="button"
                    class="btn-attached refresh-btn"
                    style="background-color: deepskyblue;"
                    (click)="resetModuleForm()"
                    title="Reset Form"
                  >
                    <app-icon name="refresh" [size]="15" />
                  </button>
                </div>
              </div>

              <div class="col" style="flex: 1.5;">
                <label>Module Name <span class="required">*</span></label>
                <input
                  type="text"
                  [(ngModel)]="moduleForm.moduleName"
                  placeholder="e.g. Vendor Registration & KYC"
                  class="form-control"
                />
              </div>

              <div class="col" style="flex: 1;">
                <label>Short Identifier (Code) <span class="required">*</span></label>
                <input
                  type="text"
                  [(ngModel)]="moduleForm.moduleShortName"
                  placeholder="e.g. VREG, REQ, PO"
                  class="form-control"
                />
              </div>
            </div>

            <div class="form-row checkbox-row">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="moduleForm.isActive" />
                <span>Active Module for Role-Based Access Control</span>
              </label>
            </div>

            <div class="btn-actions-row">
              <button
                type="button"
                class="btn btn-primary"
                style="background-color: #007bff; border-color: #007bff;"
                (click)="submitModuleForm()"
              >
                {{ moduleEditMode ? 'Update Module' : 'Register Module' }}
              </button>
              @if (moduleEditMode) {
                <button
                  type="button"
                  class="btn btn-secondary"
                  (click)="resetModuleForm()"
                >
                  Cancel Edit
                </button>
                <button
                  type="button"
                  class="btn"
                  style="background-color: #dc3545; color: #fff; border-color: #dc3545;"
                  (click)="deleteModule(editingModuleId); resetModuleForm()"
                >
                  Delete
                </button>
              }
            </div>
          </div>
        </article>
      </div>
    }

    <!-- ========================================================================= -->
    <!-- TAB: COUNTRY IBAN LENGTH RULES (GetCOUNTRYIBANList) -->
    <!-- ========================================================================= -->
    @if (activeTab === 'iban-rules') {
      <div class="tab-content-panel">
        <article class="panel main-card">
          <div class="main-heading-banner">
            <h5>Country IBAN Character Length Standards (GetCOUNTRYIBANList)</h5>
          </div>

          <div class="form-body">
            <div class="form-row three-col">
              <div class="col" style="flex: 1.1;">
                <label>Country ID</label>
                <div class="input-with-actions">
                  <input
                    type="number"
                    [(ngModel)]="ibanForm.countryId"
                    placeholder="Auto ID"
                    class="form-control"
                  />
                  <button
                    type="button"
                    class="btn-attached search-btn"
                    style="background-color: var(--role-accent, #50ae9b);"
                    (click)="showIbanModal = true"
                    title="Lookup country IBAN rules"
                  >
                    <app-icon name="search" [size]="15" />
                  </button>
                  <button
                    type="button"
                    class="btn-attached refresh-btn"
                    style="background-color: deepskyblue;"
                    (click)="resetIbanForm()"
                    title="Reset Form"
                  >
                    <app-icon name="refresh" [size]="15" />
                  </button>
                </div>
              </div>

              <div class="col" style="flex: 1.5;">
                <label>Country Name <span class="required">*</span></label>
                <input
                  type="text"
                  [(ngModel)]="ibanForm.countryName"
                  placeholder="e.g. United Arab Emirates, Saudi Arabia"
                  class="form-control"
                />
              </div>

              <div class="col" style="flex: 1;">
                <label>Standard IBAN Length (Digits) <span class="required">*</span></label>
                <input
                  type="number"
                  [(ngModel)]="ibanForm.ibanLength"
                  placeholder="e.g. 23 (UAE), 24 (KSA)"
                  class="form-control"
                />
              </div>
            </div>

            <div class="btn-actions-row">
              <button
                type="button"
                class="btn btn-primary"
                style="background-color: #007bff; border-color: #007bff;"
                (click)="submitIbanForm()"
              >
                {{ ibanEditMode ? 'Update Rule' : 'Save IBAN Rule' }}
              </button>
              @if (ibanEditMode) {
                <button
                  type="button"
                  class="btn btn-secondary"
                  (click)="resetIbanForm()"
                >
                  Cancel Edit
                </button>
                <button
                  type="button"
                  class="btn"
                  style="background-color: #dc3545; color: #fff; border-color: #dc3545;"
                  (click)="deleteIban(editingIbanId); resetIbanForm()"
                >
                  Delete
                </button>
              }
            </div>
          </div>
        </article>
      </div>
    }

    <!-- ========================================================================= -->
    <!-- TAB 9: EMAIL SETUP (SendEmailForReminder.cshtml) -->
    <!-- ========================================================================= -->
    @if (activeTab === 'email') {
      <div class="tab-content-panel">
        <article class="panel main-card">
          <div class="main-heading-banner">
            <h5>Email Setup (Office)</h5>
          </div>

          <div class="form-body">
            <div class="form-row four-col">
              <div class="col">
                <label>Email Host <span class="required">*</span></label>
                <input
                  type="text"
                  [(ngModel)]="emailForm.host"
                  placeholder="e.g. smtp.office365.com"
                  class="form-control"
                />
              </div>

              <div class="col">
                <label>Email Port <span class="required">*</span></label>
                <input
                  type="number"
                  [(ngModel)]="emailForm.port"
                  placeholder="e.g. 587"
                  class="form-control"
                />
              </div>

              <div class="col">
                <label>Email Username <span class="required">*</span></label>
                <input
                  type="text"
                  [(ngModel)]="emailForm.username"
                  placeholder="Email Username / Account"
                  class="form-control"
                />
              </div>

              <div class="col">
                <label>Email Password</label>
                <input
                  type="password"
                  [(ngModel)]="emailForm.password"
                  placeholder="Account Password"
                  class="form-control"
                />
              </div>
            </div>

            <div class="form-row two-col">
              <div class="col">
                <label>From Address</label>
                <input
                  type="email"
                  [(ngModel)]="emailForm.fromAddress"
                  placeholder="e.g. procurement@tamco.ae"
                  class="form-control"
                />
              </div>

              <div class="col">
                <label>CC Address (Admin/Audit)</label>
                <input
                  type="email"
                  [(ngModel)]="emailForm.ccAddress"
                  placeholder="e.g. cfo@tamco.ae, audit@tamco.ae"
                  class="form-control"
                />
              </div>
            </div>

            <div class="form-row two-col" style="align-items: flex-end; margin-top: 10px;">
              <div class="col">
                <button
                  type="button"
                  class="btn btn-primary"
                  style="background-color: var(--role-accent, #50ae9b); border-color: var(--role-accent, #50ae9b); height: 38px; padding: 0 24px; font-weight: 600;"
                  (click)="saveEmailSettings()"
                >
                  Save Email Configuration
                </button>
              </div>

              <div class="col">
                <label>Test Email</label>
                <div class="input-with-actions">
                  <input
                    type="email"
                    [(ngModel)]="testEmailAddress"
                    placeholder="Enter test recipient (e.g. sid@tech.com)"
                    class="form-control"
                  />
                  <button
                    type="button"
                    class="btn-attached"
                    style="background-color: #6c757d; width: 75px; font-weight: 600;"
                    (click)="sendTestEmail()"
                  >
                    Test
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    }
    </main>
  </div>

    <!-- ========================================================================= -->
    <!-- LOOKUP MODALS (Replicating Legacy Modal Dialogs) -->
    <!-- ========================================================================= -->

    <!-- 1. Document Lookup Modal (#Documentmodal) -->
    @if (showDocModal) {
      <div class="modal-backdrop" (click)="showDocModal = false">
        <div class="modal-window" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <div class="modal-icon-badge">
                <app-icon name="search" [size]="16" />
              </div>
              <div>
                <h4>Document Type Lookup</h4>
                <span class="modal-subtitle">Select an existing document type classification</span>
              </div>
            </div>
            <button type="button" class="modal-close" (click)="showDocModal = false" title="Close modal">✕</button>
          </div>

          <div class="modal-search-bar">
            <div class="search-input-wrap">
              <app-icon name="search" [size]="15" class="search-icon" />
              <input
                type="text"
                [(ngModel)]="docModalSearch"
                placeholder="Search by Document ID or Description..."
                class="modal-search-input"
              />
              @if (docModalSearch) {
                <button type="button" class="clear-search-btn" (click)="docModalSearch = ''">✕</button>
              }
            </div>
            <span class="count-pill">{{ filteredDocModal().length }} records</span>
          </div>

          <div class="modal-body-scroll">
            <table class="modal-table">
              <thead>
                <tr>
                  <th style="width: 130px;">Document ID</th>
                  <th>Document Name</th>
                  <th style="width: 100px; text-align: center;">Expirable</th>
                  <th style="width: 100px; text-align: center;">Mandatory</th>
                </tr>
              </thead>
              <tbody>
                @for (d of filteredDocModal(); track d.id) {
                  <tr (click)="selectDocFromModal(d)" class="clickable-row" title="Click to select {{ d.docName }}">
                    <td><strong class="mono-code">{{ d.docId }}</strong></td>
                    <td class="font-medium">{{ d.docName }}</td>
                    <td style="text-align: center;">
                      <span class="badge" [class.badge-yes]="d.expirable" [class.badge-no]="!d.expirable">
                        {{ d.expirable ? 'Yes' : 'No' }}
                      </span>
                    </td>
                    <td style="text-align: center;">
                      <span class="badge" [class.badge-yes]="d.mandatory" [class.badge-no]="!d.mandatory">
                        {{ d.mandatory ? 'Yes' : 'No' }}
                      </span>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="empty-state">No matching document types found.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="modal-footer">
            <span class="modal-tip">💡 Click any row to populate the form</span>
            <button type="button" class="btn btn-secondary" (click)="showDocModal = false">Close</button>
          </div>
        </div>
      </div>
    }

    <!-- 2. Brand Lookup Modal (#Brandmodal) -->
    @if (showBrandModal) {
      <div class="modal-backdrop" (click)="showBrandModal = false">
        <div class="modal-window" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <div class="modal-icon-badge">
                <app-icon name="search" [size]="16" />
              </div>
              <div>
                <h4>Brand Master Lookup</h4>
                <span class="modal-subtitle">Select an authorized manufacturer / brand record</span>
              </div>
            </div>
            <button type="button" class="modal-close" (click)="showBrandModal = false" title="Close modal">✕</button>
          </div>

          <div class="modal-search-bar">
            <div class="search-input-wrap">
              <app-icon name="search" [size]="15" class="search-icon" />
              <input
                type="text"
                [(ngModel)]="brandModalSearch"
                placeholder="Search by Brand ID or Brand Name..."
                class="modal-search-input"
              />
              @if (brandModalSearch) {
                <button type="button" class="clear-search-btn" (click)="brandModalSearch = ''">✕</button>
              }
            </div>
            <span class="count-pill">{{ filteredBrandModal().length }} records</span>
          </div>

          <div class="modal-body-scroll">
            <table class="modal-table">
              <thead>
                <tr>
                  <th style="width: 140px;">Brand ID</th>
                  <th>Brand Name</th>
                </tr>
              </thead>
              <tbody>
                @for (b of filteredBrandModal(); track b.id) {
                  <tr (click)="selectBrandFromModal(b)" class="clickable-row" title="Click to select {{ b.brandName }}">
                    <td><strong class="mono-code">{{ b.brandId }}</strong></td>
                    <td class="font-medium">{{ b.brandName }}</td>
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
            <span class="modal-tip">💡 Click any row to populate the form</span>
            <button type="button" class="btn btn-secondary" (click)="showBrandModal = false">Close</button>
          </div>
        </div>
      </div>
    }

    <!-- 3. Product Lookup Modal (#Productmodal) -->
    @if (showProductModal) {
      <div class="modal-backdrop" (click)="showProductModal = false">
        <div class="modal-window wide" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <div class="modal-icon-badge">
                <app-icon name="search" [size]="16" />
              </div>
              <div>
                <h4>Product Taxonomy Lookup</h4>
                <span class="modal-subtitle">Select an item category or technical product nomenclature</span>
              </div>
            </div>
            <button type="button" class="modal-close" (click)="showProductModal = false" title="Close modal">✕</button>
          </div>

          <div class="modal-search-bar">
            <div class="search-input-wrap">
              <app-icon name="search" [size]="15" class="search-icon" />
              <input
                type="text"
                [(ngModel)]="productModalSearch"
                placeholder="Search by Product ID, Name or Category..."
                class="modal-search-input"
              />
              @if (productModalSearch) {
                <button type="button" class="clear-search-btn" (click)="productModalSearch = ''">✕</button>
              }
            </div>
            <span class="count-pill">{{ filteredProductModal().length }} records</span>
          </div>

          <div class="modal-body-scroll">
            <table class="modal-table">
              <thead>
                <tr>
                  <th style="width: 140px;">Product ID</th>
                  <th>Product Nomenclature</th>
                  <th style="width: 150px;">Category</th>
                </tr>
              </thead>
              <tbody>
                @for (p of filteredProductModal(); track p.id) {
                  <tr (click)="selectProductFromModal(p)" class="clickable-row" title="Click to select {{ p.productName }}">
                    <td><strong class="mono-code">{{ p.productId }}</strong></td>
                    <td class="font-medium">{{ p.productName }}</td>
                    <td><span class="badge badge-info">{{ p.category || 'General' }}</span></td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="3" class="empty-state">No matching products found.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="modal-footer">
            <span class="modal-tip">💡 Click any row to populate the form</span>
            <button type="button" class="btn btn-secondary" (click)="showProductModal = false">Close</button>
          </div>
        </div>
      </div>
    }

    <!-- 4. Department Lookup Modal (#Departmentmodal) -->
    @if (showDeptModal) {
      <div class="modal-backdrop" (click)="showDeptModal = false">
        <div class="modal-window" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <div class="modal-icon-badge">
                <app-icon name="search" [size]="16" />
              </div>
              <div>
                <h4>Department Lookup</h4>
                <span class="modal-subtitle">Select an internal department</span>
              </div>
            </div>
            <button type="button" class="modal-close" (click)="showDeptModal = false" title="Close modal">✕</button>
          </div>

          <div class="modal-search-bar">
            <div class="search-input-wrap">
              <app-icon name="search" [size]="15" class="search-icon" />
              <input
                type="text"
                [(ngModel)]="deptModalSearch"
                placeholder="Search by Department ID or Department Name..."
                class="modal-search-input"
              />
              @if (deptModalSearch) {
                <button type="button" class="clear-search-btn" (click)="deptModalSearch = ''">✕</button>
              }
            </div>
            <span class="count-pill">{{ filteredDeptModal().length }} records</span>
          </div>

          <div class="modal-body-scroll">
            <table class="modal-table">
              <thead>
                <tr>
                  <th style="width: 140px;">Department ID</th>
                  <th>Department Name</th>
                </tr>
              </thead>
              <tbody>
                @for (dept of filteredDeptModal(); track dept.id) {
                  <tr (click)="selectDeptFromModal(dept)" class="clickable-row" title="Click to select {{ dept.deptName }}">
                    <td><strong class="mono-code">{{ dept.deptId }}</strong></td>
                    <td class="font-medium">{{ dept.deptName }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="2" class="empty-state">No matching departments found.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="modal-footer">
            <span class="modal-tip">💡 Click any row to populate the form</span>
            <button type="button" class="btn btn-secondary" (click)="showDeptModal = false">Close</button>
          </div>
        </div>
      </div>
    }

    <!-- 5. Designation Lookup Modal (#Designationmodal) -->
    @if (showDesigModal) {
      <div class="modal-backdrop" (click)="showDesigModal = false">
        <div class="modal-window wide" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <div class="modal-icon-badge">
                <app-icon name="search" [size]="16" />
              </div>
              <div>
                <h4>Designation Master Lookup</h4>
                <span class="modal-subtitle">Select an authorized employee designation & department title</span>
              </div>
            </div>
            <button type="button" class="modal-close" (click)="showDesigModal = false" title="Close modal">✕</button>
          </div>

          <div class="modal-search-bar">
            <div class="search-input-wrap">
              <app-icon name="search" [size]="15" class="search-icon" />
              <input
                type="text"
                [(ngModel)]="desigModalSearch"
                placeholder="Search by Designation ID, Title or Department..."
                class="modal-search-input"
              />
              @if (desigModalSearch) {
                <button type="button" class="clear-search-btn" (click)="desigModalSearch = ''">✕</button>
              }
            </div>
            <span class="count-pill">{{ filteredDesigModal().length }} records</span>
          </div>

          <div class="modal-body-scroll">
            <table class="modal-table">
              <thead>
                <tr>
                  <th style="width: 140px;">Designation ID</th>
                  <th>Designation Title</th>
                  <th style="min-width: 180px;">Department</th>
                </tr>
              </thead>
              <tbody>
                @for (ds of filteredDesigModal(); track ds.id) {
                  <tr (click)="selectDesigFromModal(ds)" class="clickable-row" title="Click to select {{ ds.desigName }}">
                    <td><strong class="mono-code">{{ ds.desigId }}</strong></td>
                    <td class="font-medium">{{ ds.desigName }}</td>
                    <td>{{ ds.deptName }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="3" class="empty-state">No matching designations found.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="modal-footer">
            <span class="modal-tip">💡 Click any row to populate the form</span>
            <button type="button" class="btn btn-secondary" (click)="showDesigModal = false">Close</button>
          </div>
        </div>
      </div>
    }

    <!-- 6. Document Numbering Lookup Modal (#DocNumbermodal) -->
    @if (showDocNumModal) {
      <div class="modal-backdrop" (click)="showDocNumModal = false">
        <div class="modal-window wide" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <div class="modal-icon-badge">
                <app-icon name="search" [size]="16" />
              </div>
              <div>
                <h4>Document Number Sequence Lookup</h4>
                <span class="modal-subtitle">Select an existing module sequence rule</span>
              </div>
            </div>
            <button type="button" class="modal-close" (click)="showDocNumModal = false" title="Close modal">✕</button>
          </div>

          <div class="modal-search-bar">
            <div class="search-input-wrap">
              <app-icon name="search" [size]="15" class="search-icon" />
              <input
                type="text"
                [(ngModel)]="docNumModalSearch"
                placeholder="Search by Module or Prefix..."
                class="modal-search-input"
              />
              @if (docNumModalSearch) {
                <button type="button" class="clear-search-btn" (click)="docNumModalSearch = ''">✕</button>
              }
            </div>
            <span class="count-pill">{{ filteredDocNumModal().length }} records</span>
          </div>

          <div class="modal-body-scroll">
            <table class="modal-table">
              <thead>
                <tr>
                  <th style="width: 140px;">Module Code</th>
                  <th style="width: 160px;">Prefix</th>
                  <th>Current / Next Number</th>
                  <th style="width: 120px; text-align: center;">Digit Length</th>
                </tr>
              </thead>
              <tbody>
                @for (dn of filteredDocNumModal(); track dn.id) {
                  <tr (click)="selectDocNumFromModal(dn)" class="clickable-row" title="Click to select sequence {{ dn.module }}">
                    <td><strong class="mono-code">{{ dn.module }}</strong></td>
                    <td class="font-medium">{{ dn.prefix }}</td>
                    <td>#{{ dn.number }}</td>
                    <td style="text-align: center;"><span class="badge badge-info">{{ dn.length }} Digits</span></td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="empty-state">No matching document sequences found.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="modal-footer">
            <span class="modal-tip">💡 Click any row to populate the form</span>
            <button type="button" class="btn btn-secondary" (click)="showDocNumModal = false">Close</button>
          </div>
        </div>
      </div>
    }

    <!-- 7. Ship Via Lookup Modal (#ShipViamodal) -->
    @if (showShipViaModal) {
      <div class="modal-backdrop" (click)="showShipViaModal = false">
        <div class="modal-window" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <div class="modal-icon-badge">
                <app-icon name="search" [size]="16" />
              </div>
              <div>
                <h4>Ship Via & Carrier Lookup</h4>
                <span class="modal-subtitle">Select an authorized freight carrier or shipping method</span>
              </div>
            </div>
            <button type="button" class="modal-close" (click)="showShipViaModal = false" title="Close modal">✕</button>
          </div>

          <div class="modal-search-bar">
            <div class="search-input-wrap">
              <app-icon name="search" [size]="15" class="search-icon" />
              <input
                type="text"
                [(ngModel)]="shipViaModalSearch"
                placeholder="Search by Ship Via Code or Carrier Name..."
                class="modal-search-input"
              />
              @if (shipViaModalSearch) {
                <button type="button" class="clear-search-btn" (click)="shipViaModalSearch = ''">✕</button>
              }
            </div>
            <span class="count-pill">{{ filteredShipViaModal().length }} records</span>
          </div>

          <div class="modal-body-scroll">
            <table class="modal-table">
              <thead>
                <tr>
                  <th style="width: 140px;">Ship Via Code</th>
                  <th>Carrier & Shipping Method</th>
                </tr>
              </thead>
              <tbody>
                @for (sv of filteredShipViaModal(); track sv.id) {
                  <tr (click)="selectShipViaFromModal(sv)" class="clickable-row" title="Click to select carrier {{ sv.shipViaName }}">
                    <td><strong class="mono-code">{{ sv.shipViaCode }}</strong></td>
                    <td class="font-medium">{{ sv.shipViaName }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="2" class="empty-state">No matching carriers found.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="modal-footer">
            <span class="modal-tip">💡 Click any row to populate the form</span>
            <button type="button" class="btn btn-secondary" (click)="showShipViaModal = false">Close</button>
          </div>
        </div>
      </div>
    }

    <!-- 8. Asset Type Lookup Modal (#ASTypemodal) -->
    @if (showAsTypeModal) {
      <div class="modal-backdrop" (click)="showAsTypeModal = false">
        <div class="modal-window" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <div class="modal-icon-badge">
                <app-icon name="search" [size]="16" />
              </div>
              <div>
                <h4>Asset & Expense Type Lookup</h4>
                <span class="modal-subtitle">Select an asset or expense classification</span>
              </div>
            </div>
            <button type="button" class="modal-close" (click)="showAsTypeModal = false" title="Close modal">✕</button>
          </div>

          <div class="modal-search-bar">
            <div class="search-input-wrap">
              <app-icon name="search" [size]="15" class="search-icon" />
              <input
                type="text"
                [(ngModel)]="asTypeModalSearch"
                placeholder="Search by Asset Type ID or Name..."
                class="modal-search-input"
              />
              @if (asTypeModalSearch) {
                <button type="button" class="clear-search-btn" (click)="asTypeModalSearch = ''">✕</button>
              }
            </div>
            <span class="count-pill">{{ filteredAsTypeModal().length }} records</span>
          </div>

          <div class="modal-body-scroll">
            <table class="modal-table">
              <thead>
                <tr>
                  <th style="width: 140px;">Asset Type ID</th>
                  <th>Classification Title</th>
                </tr>
              </thead>
              <tbody>
                @for (ast of filteredAsTypeModal(); track ast.id) {
                  <tr (click)="selectAsTypeFromModal(ast)" class="clickable-row" title="Click to select {{ ast.tname }}">
                    <td><strong class="mono-code">{{ ast.tid }}</strong></td>
                    <td class="font-medium">{{ ast.tname }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="2" class="empty-state">No matching asset categories found.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="modal-footer">
            <span class="modal-tip">💡 Click any row to populate the form</span>
            <button type="button" class="btn btn-secondary" (click)="showAsTypeModal = false">Close</button>
          </div>
        </div>
      </div>
    }

    <!-- 9. Currency Lookup Modal (#Currencymodal) -->
    @if (showCurrencyModal) {
      <div class="modal-backdrop" (click)="showCurrencyModal = false">
        <div class="modal-window" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <div class="modal-icon-badge">
                <app-icon name="search" [size]="16" />
              </div>
              <div>
                <h4>Currency Master Lookup</h4>
                <span class="modal-subtitle">Select an authorized enterprise currency</span>
              </div>
            </div>
            <button type="button" class="modal-close" (click)="showCurrencyModal = false" title="Close modal">✕</button>
          </div>

          <div class="modal-search-bar">
            <div class="search-input-wrap">
              <app-icon name="search" [size]="15" class="search-icon" />
              <input
                type="text"
                [(ngModel)]="currencyModalSearch"
                placeholder="Search by Currency Code or Name..."
                class="modal-search-input"
              />
              @if (currencyModalSearch) {
                <button type="button" class="clear-search-btn" (click)="currencyModalSearch = ''">✕</button>
              }
            </div>
            <span class="count-pill">{{ filteredCurrencyModal().length }} records</span>
          </div>

          <div class="modal-body-scroll">
            <table class="modal-table">
              <thead>
                <tr>
                  <th style="width: 140px;">Currency Code</th>
                  <th>Currency Name</th>
                  <th style="width: 100px; text-align: center;">Symbol</th>
                </tr>
              </thead>
              <tbody>
                @for (c of filteredCurrencyModal(); track c.id) {
                  <tr (click)="selectCurrencyFromModal(c)" class="clickable-row" title="Click to select {{ c.currencyName }}">
                    <td><strong class="mono-code">{{ c.currencyId }}</strong></td>
                    <td class="font-medium">{{ c.currencyName }}</td>
                    <td style="text-align: center;"><span class="badge badge-info">{{ c.symbol || c.currencyId }}</span></td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="3" class="empty-state">No matching currencies found.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="modal-footer">
            <span class="modal-tip">💡 Click any row to populate the form</span>
            <button type="button" class="btn btn-secondary" (click)="showCurrencyModal = false">Close</button>
          </div>
        </div>
      </div>
    }

    <!-- 10. Security Module Lookup Modal (#CSMODULEmodal) -->
    @if (showModuleModal) {
      <div class="modal-backdrop" (click)="showModuleModal = false">
        <div class="modal-window wide" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <div class="modal-icon-badge">
                <app-icon name="search" [size]="16" />
              </div>
              <div>
                <h4>System Security Module Lookup</h4>
                <span class="modal-subtitle">Select an authorized permission module</span>
              </div>
            </div>
            <button type="button" class="modal-close" (click)="showModuleModal = false" title="Close modal">✕</button>
          </div>

          <div class="modal-search-bar">
            <div class="search-input-wrap">
              <app-icon name="search" [size]="15" class="search-icon" />
              <input
                type="text"
                [(ngModel)]="moduleModalSearch"
                placeholder="Search by Module Name or Code..."
                class="modal-search-input"
              />
              @if (moduleModalSearch) {
                <button type="button" class="clear-search-btn" (click)="moduleModalSearch = ''">✕</button>
              }
            </div>
            <span class="count-pill">{{ filteredModuleModal().length }} records</span>
          </div>

          <div class="modal-body-scroll">
            <table class="modal-table">
              <thead>
                <tr>
                  <th style="width: 120px;">Module ID</th>
                  <th>Module Name</th>
                  <th style="width: 140px;">Short Code</th>
                  <th style="width: 120px; text-align: center;">Status</th>
                </tr>
              </thead>
              <tbody>
                @for (m of filteredModuleModal(); track m.id) {
                  <tr (click)="selectModuleFromModal(m)" class="clickable-row" title="Click to select {{ m.moduleName }}">
                    <td><strong class="mono-code">MOD-0{{ m.moduleId }}</strong></td>
                    <td class="font-medium">{{ m.moduleName }}</td>
                    <td><span class="badge badge-info">{{ m.moduleShortName }}</span></td>
                    <td style="text-align: center;">
                      <span class="badge" [class.badge-yes]="m.isActive" [class.badge-no]="!m.isActive">
                        {{ m.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="empty-state">No matching security modules found.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="modal-footer">
            <span class="modal-tip">💡 Click any row to populate the form</span>
            <button type="button" class="btn btn-secondary" (click)="showModuleModal = false">Close</button>
          </div>
        </div>
      </div>
    }

    <!-- 11. Country IBAN Rules Lookup Modal (#CountryIbanmodal) -->
    @if (showIbanModal) {
      <div class="modal-backdrop" (click)="showIbanModal = false">
        <div class="modal-window wide" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <div class="modal-icon-badge">
                <app-icon name="search" [size]="16" />
              </div>
              <div>
                <h4>Country IBAN Length Standards Lookup</h4>
                <span class="modal-subtitle">Select an authorized country IBAN rule</span>
              </div>
            </div>
            <button type="button" class="modal-close" (click)="showIbanModal = false" title="Close modal">✕</button>
          </div>

          <div class="modal-search-bar">
            <div class="search-input-wrap">
              <app-icon name="search" [size]="15" class="search-icon" />
              <input
                type="text"
                [(ngModel)]="ibanModalSearch"
                placeholder="Search by Country Name or ID..."
                class="modal-search-input"
              />
              @if (ibanModalSearch) {
                <button type="button" class="clear-search-btn" (click)="ibanModalSearch = ''">✕</button>
              }
            </div>
            <span class="count-pill">{{ filteredIbanModal().length }} records</span>
          </div>

          <div class="modal-body-scroll">
            <table class="modal-table">
              <thead>
                <tr>
                  <th style="width: 140px;">Country ID</th>
                  <th>Country Name</th>
                  <th style="width: 180px; text-align: center;">Required IBAN Length</th>
                </tr>
              </thead>
              <tbody>
                @for (rule of filteredIbanModal(); track rule.id) {
                  <tr (click)="selectIbanFromModal(rule)" class="clickable-row" title="Click to select {{ rule.countryName }}">
                    <td><strong class="mono-code">C-{{ rule.countryId }}</strong></td>
                    <td class="font-medium">{{ rule.countryName }}</td>
                    <td style="text-align: center;">
                      <span class="badge badge-info">{{ rule.ibanLength }} Characters</span>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="3" class="empty-state">No matching country IBAN rules found.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="modal-footer">
            <span class="modal-tip">💡 Click any row to populate the form</span>
            <button type="button" class="btn btn-secondary" (click)="showIbanModal = false">Close</button>
          </div>
        </div>
      </div>
    }

  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    /* 2-Column Split Settings Layout (Matching Reference Screenshot) */
    .management-split-layout {
      display: flex;
      align-items: flex-start;
      gap: 20px;
      margin-top: 0;
      width: 100%;
    }

    /* Left Settings Subnav Sidebar */
    .management-subnav {
      width: 250px;
      flex-shrink: 0;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
      position: sticky;
      top: 62px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .subnav-header {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 0 4px 6px 4px;
      border-bottom: 1px solid #e2e8f0;
    }

    .subnav-title-group {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .subnav-title {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.01em;
    }

    .subnav-pill {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 9999px;
      background: #e2e8f0;
      color: #475569;
    }

    .subnav-search-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 0 10px;
      height: 36px;
      box-sizing: border-box;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;

      &:focus-within {
        border-color: var(--role-accent, #50ae9b);
        box-shadow: 0 0 0 2px rgba(80, 174, 155, 0.15);
      }
    }

    .subnav-search-icon {
      color: #94a3b8;
      flex-shrink: 0;
    }

    .subnav-search-input {
      border: none !important;
      outline: none !important;
      background: transparent !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      padding: 0 !important;
      height: 100% !important;
      font-size: 13px !important;
      line-height: normal !important;
      width: 100% !important;
      color: #0f172a !important;

      &::placeholder {
        color: #94a3b8;
      }

      &:focus {
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
      }
    }

    .subnav-search-clear {
      background: transparent;
      border: 0;
      color: #94a3b8;
      cursor: pointer;
      font-size: 11px;
      padding: 0;
      &:hover { color: #0f172a; }
    }

    /* Menu Vertical List */
    .subnav-menu {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .subnav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 9px 12px;
      border-radius: 8px;
      border: 1px solid transparent;
      background: transparent;
      color: #475569;
      font-size: 13.5px;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s ease;
      user-select: none;

      .subnav-icon {
        color: #64748b;
        flex-shrink: 0;
        transition: color 0.15s ease, transform 0.15s ease;
      }

      .subnav-label {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Hover Effect */
      &:hover:not(.active) {
        background: #f1f5f9;
        color: #0f172a;
        transform: translateX(2px);

        .subnav-icon {
          color: #0f172a;
        }
      }

      /* Active State (Card Highlight Matching Screenshot) */
      &.active {
        background: #ffffff;
        color: #0f172a;
        font-weight: 700;
        border-color: #e2e8f0;
        border-left: 3.5px solid var(--role-accent, #50ae9b);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);

        .subnav-icon {
          color: var(--role-accent, #50ae9b);
        }
      }
    }

    /* Right Main Content Workspace */
    .management-workspace {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    @media (max-width: 992px) {
      .management-split-layout {
        flex-direction: column;
      }
      .management-subnav {
        width: 100%;
        position: static;
      }
    }

    .active-tab-badge {
      font-size: 13px;
      color: #475569;
      strong { color: var(--role-accent, #50ae9b); }
    }

    .panel {
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }

    .main-heading-banner {
      background-color: var(--role-accent, #50ae9b);
      color: #ffffff;
      padding: 9px 16px;
      text-align: center;
      width: 100%;

      h5 {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
        letter-spacing: 0.02em;
      }
    }

    .form-body {
      padding: 20px 22px;
    }

    .form-row {
      display: flex;
      gap: 18px;
      margin-bottom: 16px;

      &.two-col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        @media (max-width: 768px) { grid-template-columns: 1fr; }
      }

      &.three-col {
        display: flex;
        @media (max-width: 768px) { flex-direction: column; }
      }

      &.four-col {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        @media (max-width: 992px) { grid-template-columns: repeat(2, 1fr); }
        @media (max-width: 576px) { grid-template-columns: 1fr; }
      }

      &.checkbox-row {
        display: flex;
        gap: 30px;
        align-items: center;
        padding: 6px 0;
      }

      label {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: #0f172a;
        margin-bottom: 6px;

        .required { color: #dc2626; }
      }
    }

    .checkbox-label {
      display: inline-flex !important;
      align-items: center;
      gap: 8px;
      font-size: 13.5px !important;
      font-weight: 600 !important;
      color: #1e293b !important;
      cursor: pointer;
      margin-bottom: 0 !important;

      input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
        accent-color: var(--role-accent, #50ae9b);
      }
    }

    .form-control {
      width: 100%;
      height: 38px;
      padding: 6px 12px;
      font-size: 13.5px;
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      outline: none;
      box-sizing: border-box;

      &:focus {
        border-color: var(--role-accent, #50ae9b);
        box-shadow: 0 0 0 2px var(--role-glow, rgba(80, 174, 155, 0.2));
      }

      &.form-select {
        background-color: white;
        cursor: pointer;
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
        width: 40px;
        border: none;
        color: white;
        cursor: pointer;
        transition: opacity 0.2s;

        &:hover { opacity: 0.9; }

        &.refresh-btn {
          border-top-right-radius: 5px;
          border-bottom-right-radius: 5px;
        }
      }
    }

    .btn-actions-row {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 18px;
    }

    .table-header-bar {
      padding: 12px 18px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h6 {
        margin: 0;
        font-size: 14px;
        font-weight: 700;
        color: #1e293b;
      }

      .count-pill {
        font-size: 12px;
        font-weight: 600;
        padding: 3px 10px;
        background: #e2e8f0;
        color: #334155;
        border-radius: 20px;
      }
    }

    .table-title-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .table-filter-wrap {
      position: relative;
      display: flex;
      align-items: center;
      width: 240px;
    }

    .table-search-input {
      width: 100%;
      height: 32px;
      padding: 4px 26px 4px 10px;
      font-size: 12.5px;
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      outline: none;
      background: #ffffff;
      transition: all 0.2s;

      &:focus {
        border-color: var(--role-accent, #50ae9b);
        box-shadow: 0 0 0 2px var(--role-glow, rgba(80, 174, 155, 0.15));
      }
    }

    .clear-filter-btn {
      position: absolute;
      right: 6px;
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 12px;
      cursor: pointer;
      padding: 2px 4px;
      line-height: 1;

      &:hover { color: #475569; }
    }

    .tamco-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;

      th {
        background: #f1f5f9;
        color: #334155;
        font-weight: 700;
        text-align: left;
        padding: 10px 14px;
        border: 1px solid #e2e8f0;
      }

      td {
        padding: 9px 14px;
        border: 1px solid #e2e8f0;
        vertical-align: middle;
      }

      tr:hover td {
        background: #f8fafc;
      }
    }

    .mono-code {
      font-family: monospace;
      color: var(--role-accent, #50ae9b);
      font-size: 13px;
    }

    .badge {
      display: inline-block;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 700;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .badge-yes { background: #dcfce7; color: #15803d; }
    .badge-no { background: #f1f5f9; color: #64748b; }
    .badge-info {
      background: #e0f2fe;
      color: #0369a1;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11.5px;
    }

    .action-buttons-wrap {
      display: inline-flex;
      gap: 6px;
      align-items: center;
    }

    .btn-sm-edit {
      background: #0284c7;
      color: white;
      border: none;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 4px;
      cursor: pointer;

      &:hover { background: #0369a1; }
    }

    .btn-sm-delete {
      background: #ef4444;
      color: white;
      border: none;
      padding: 4px 8px;
      font-size: 12px;
      font-weight: 700;
      border-radius: 4px;
      cursor: pointer;

      &:hover { background: #dc2626; }
    }

    /* Modal & Lookup Dialog Styles */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(2px);
      z-index: 1000;
      display: grid;
      place-items: center;
      padding: 20px;
    }

    .modal-window {
      background: #ffffff;
      border-radius: 10px;
      width: min(720px, 95%);
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      border: 1px solid #cbd5e1;
      overflow: hidden;

      &.wide { width: min(880px, 95%); }

      .modal-header {
        background: var(--role-accent, #50ae9b);
        color: white;
        padding: 14px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        h4 { margin: 0; font-size: 16px; font-weight: 700; letter-spacing: 0.01em; }
        .modal-close {
          background: rgba(255, 255, 255, 0.15);
          border: none;
          color: white;
          font-size: 16px;
          cursor: pointer;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;

          &:hover { background: rgba(255, 255, 255, 0.3); }
        }
      }

      .modal-title-wrap {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .modal-icon-badge {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.2);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: white;
      }

      .modal-subtitle {
        display: block;
        font-size: 11.5px;
        opacity: 0.9;
        font-weight: 400;
        margin-top: 1px;
      }

      .modal-search-bar {
        padding: 12px 18px;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .search-input-wrap {
        position: relative;
        flex: 1;
        display: flex;
        align-items: center;
      }

      .search-input-wrap .search-icon {
        position: absolute;
        left: 10px;
        color: #94a3b8;
        pointer-events: none;
        display: flex;
        align-items: center;
      }

      .modal-search-input {
        width: 100%;
        height: 36px;
        padding: 6px 32px 6px 32px;
        font-size: 13px;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        outline: none;
        background: #ffffff;
        transition: all 0.2s;

        &:focus {
          border-color: var(--role-accent, #50ae9b);
          box-shadow: 0 0 0 3px var(--role-glow, rgba(80, 174, 155, 0.15));
        }
      }

      .clear-search-btn {
        position: absolute;
        right: 8px;
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 13px;
        cursor: pointer;
        padding: 4px;
        line-height: 1;

        &:hover { color: #475569; }
      }

      .modal-body-scroll {
        padding: 0;
        overflow-y: auto;
        max-height: 52vh;
      }

      .modal-footer {
        padding: 12px 18px;
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .modal-tip {
        font-size: 12px;
        color: #64748b;
      }
    }

    .modal-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;

      thead th {
        position: sticky;
        top: 0;
        background: #f1f5f9;
        color: #334155;
        font-weight: 700;
        font-size: 11.5px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        padding: 10px 14px;
        text-align: left;
        border-bottom: 2px solid #cbd5e1;
        z-index: 2;
      }

      td {
        padding: 10px 14px;
        border-bottom: 1px solid #e2e8f0;
        vertical-align: middle;
      }

      tr.clickable-row {
        cursor: pointer;
        transition: background 0.15s ease;

        &:hover td {
          background: #f0fdf9;
        }
      }
    }

    .empty-state {
      text-align: center;
      color: #94a3b8;
      padding: 28px 16px;
      font-style: italic;
      font-size: 13px;
    }
  `]
})
export class ManagementComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly state = inject(PortalStateService);
  readonly vendorApi = inject(VendorApiService);

  activeTab: ManagementTab = 'document-type';
  sidebarFilter = '';

  matchesFilter(id: string, label: string): boolean {
    if (!this.sidebarFilter.trim()) return true;
    const q = this.sidebarFilter.toLowerCase();
    return id.toLowerCase().includes(q) || label.toLowerCase().includes(q);
  }

  // Modal search filters
  docModalSearch = '';
  brandModalSearch = '';
  productModalSearch = '';
  deptModalSearch = '';
  desigModalSearch = '';
  docNumModalSearch = '';
  shipViaModalSearch = '';
  asTypeModalSearch = '';
  currencyModalSearch = '';
  moduleModalSearch = '';

  // Registered table search filters
  docTableSearch = '';
  brandTableSearch = '';
  productTableSearch = '';
  deptTableSearch = '';
  desigTableSearch = '';
  docNumTableSearch = '';
  shipViaTableSearch = '';
  asTypeTableSearch = '';
  currencyTableSearch = '';
  moduleTableSearch = '';
  ibanTableSearch = '';

  // Tab 1: Document Type State
  docEditMode = false;
  editingDocId = '';
  docForm = {
    docId: '',
    docName: '',
    expirable: false,
    group: false,
    mandatory: false
  };
  showDocModal = false;

  // Tab 2: Brand State
  brandEditMode = false;
  editingBrandId = '';
  brandForm = {
    brandId: '',
    brandName: ''
  };
  showBrandModal = false;

  // Tab 3: Product State
  productEditMode = false;
  editingProductId = '';
  productForm = {
    productId: '',
    productName: '',
    category: 'General'
  };
  showProductModal = false;

  // Tab 4: Department State (Department.cshtml)
  deptEditMode = false;
  editingDeptId = '';
  deptForm = {
    deptId: '',
    deptName: ''
  };
  showDeptModal = false;

  // Tab 5: Designation State (Designation.cshtml)
  desigEditMode = false;
  editingDesigId = '';
  desigForm = {
    deptName: 'Procurement & Sourcing',
    desigId: '',
    desigName: ''
  };
  showDesigModal = false;

  // Tab 6: Document Numbering State (Doc_Number.cshtml)
  docNumEditMode = false;
  editingDocNumId = '';
  docNumForm = {
    module: '',
    prefix: '',
    number: 1,
    length: '4'
  };
  showDocNumModal = false;

  // Tab 7: Ship Via State (ShipVia.cshtml)
  shipViaEditMode = false;
  editingShipViaId = '';
  shipViaForm = {
    shipViaCode: '',
    shipViaName: ''
  };
  showShipViaModal = false;

  // Tab 8: Asset Type State (ASType.cshtml)
  asTypeEditMode = false;
  editingAsTypeId = '';
  asTypeForm = {
    tid: '',
    tname: ''
  };
  showAsTypeModal = false;

  // Tab: Custom Currency State (AUDCURRENCYDETAILS)
  currencyEditMode = false;
  editingCurrencyId = '';
  currencyForm = {
    currencyId: '',
    currencyName: '',
    symbol: ''
  };
  showCurrencyModal = false;

  // Tab: Security Module State (AUDCSMODULE)
  moduleEditMode = false;
  editingModuleId = '';
  moduleForm = {
    moduleId: 1,
    moduleName: '',
    moduleShortName: '',
    isActive: true
  };
  showModuleModal = false;

  // Tab: Country IBAN Rules State (GetCOUNTRYIBANList)
  ibanEditMode = false;
  editingIbanId = '';
  ibanForm = {
    countryId: 1,
    countryName: '',
    ibanLength: 23
  };
  showIbanModal = false;
  ibanModalSearch = '';

  // Tab 9: Email Setup State
  emailForm = {
    host: 'smtp.office365.com',
    port: 587,
    username: 'procurement@tamco.ae',
    password: '',
    fromAddress: 'procurement@tamco.ae',
    ccAddress: 'cfo@tamco.ae'
  };
  testEmailAddress = '';

  // Filter methods for Lookup Modals
  filteredDocModal(): DocumentTypeItem[] {
    const q = this.docModalSearch.trim().toLowerCase();
    if (!q) return this.state.documentTypes();
    return this.state.documentTypes().filter(d =>
      d.docId.toLowerCase().includes(q) || d.docName.toLowerCase().includes(q)
    );
  }

  filteredBrandModal(): BrandItem[] {
    const q = this.brandModalSearch.trim().toLowerCase();
    if (!q) return this.state.brands();
    return this.state.brands().filter(b =>
      b.brandId.toLowerCase().includes(q) || b.brandName.toLowerCase().includes(q)
    );
  }

  filteredProductModal(): ProductItem[] {
    const q = this.productModalSearch.trim().toLowerCase();
    if (!q) return this.state.products();
    return this.state.products().filter(p =>
      p.productId.toLowerCase().includes(q) ||
      p.productName.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  }

  filteredDeptModal(): DepartmentItem[] {
    const q = this.deptModalSearch.trim().toLowerCase();
    if (!q) return this.state.departments();
    return this.state.departments().filter(d =>
      d.deptId.toLowerCase().includes(q) || d.deptName.toLowerCase().includes(q)
    );
  }

  filteredDesigModal(): DesignationItem[] {
    const q = this.desigModalSearch.trim().toLowerCase();
    if (!q) return this.state.designations();
    return this.state.designations().filter(ds =>
      ds.desigId.toLowerCase().includes(q) ||
      ds.desigName.toLowerCase().includes(q) ||
      ds.deptName.toLowerCase().includes(q)
    );
  }

  filteredDocNumModal(): DocNumberItem[] {
    const q = this.docNumModalSearch.trim().toLowerCase();
    if (!q) return this.state.docNumbers();
    return this.state.docNumbers().filter(dn =>
      dn.module.toLowerCase().includes(q) ||
      dn.prefix.toLowerCase().includes(q)
    );
  }

  filteredShipViaModal(): ShipViaItem[] {
    const q = this.shipViaModalSearch.trim().toLowerCase();
    if (!q) return this.state.shipViaList();
    return this.state.shipViaList().filter(sv =>
      sv.shipViaCode.toLowerCase().includes(q) ||
      sv.shipViaName.toLowerCase().includes(q)
    );
  }

  filteredAsTypeModal(): ASTypeItem[] {
    const q = this.asTypeModalSearch.trim().toLowerCase();
    if (!q) return this.state.asTypes();
    return this.state.asTypes().filter(ast =>
      ast.tid.toLowerCase().includes(q) ||
      ast.tname.toLowerCase().includes(q)
    );
  }

  filteredCurrencyModal(): CurrencyItem[] {
    const q = this.currencyModalSearch.trim().toLowerCase();
    if (!q) return this.state.currencies();
    return this.state.currencies().filter(c =>
      c.currencyId.toLowerCase().includes(q) ||
      c.currencyName.toLowerCase().includes(q) ||
      (c.symbol && c.symbol.toLowerCase().includes(q))
    );
  }

  filteredModuleModal(): SecurityModuleItem[] {
    const q = this.moduleModalSearch.trim().toLowerCase();
    if (!q) return this.state.securityModules();
    return this.state.securityModules().filter(m =>
      m.moduleName.toLowerCase().includes(q) ||
      m.moduleShortName.toLowerCase().includes(q) ||
      String(m.moduleId).includes(q)
    );
  }

  filteredIbanModal(): CountryIbanItem[] {
    const q = this.ibanModalSearch.trim().toLowerCase();
    if (!q) return this.state.countryIbans();
    return this.state.countryIbans().filter(r =>
      String(r.countryId).includes(q) ||
      r.countryName.toLowerCase().includes(q)
    );
  }

  // Filter methods for Registered Tables
  filteredDocTable(): DocumentTypeItem[] {
    const q = this.docTableSearch.trim().toLowerCase();
    if (!q) return this.state.documentTypes();
    return this.state.documentTypes().filter(d =>
      d.docId.toLowerCase().includes(q) || d.docName.toLowerCase().includes(q)
    );
  }

  filteredBrandTable(): BrandItem[] {
    const q = this.brandTableSearch.trim().toLowerCase();
    if (!q) return this.state.brands();
    return this.state.brands().filter(b =>
      b.brandId.toLowerCase().includes(q) || b.brandName.toLowerCase().includes(q)
    );
  }

  filteredProductTable(): ProductItem[] {
    const q = this.productTableSearch.trim().toLowerCase();
    if (!q) return this.state.products();
    return this.state.products().filter(p =>
      p.productId.toLowerCase().includes(q) ||
      p.productName.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  }

  filteredDeptTable(): DepartmentItem[] {
    const q = this.deptTableSearch.trim().toLowerCase();
    if (!q) return this.state.departments();
    return this.state.departments().filter(d =>
      d.deptId.toLowerCase().includes(q) || d.deptName.toLowerCase().includes(q)
    );
  }

  filteredDesigTable(): DesignationItem[] {
    const q = this.desigTableSearch.trim().toLowerCase();
    if (!q) return this.state.designations();
    return this.state.designations().filter(ds =>
      ds.desigId.toLowerCase().includes(q) ||
      ds.desigName.toLowerCase().includes(q) ||
      ds.deptName.toLowerCase().includes(q)
    );
  }

  filteredDocNumTable(): DocNumberItem[] {
    const q = this.docNumTableSearch.trim().toLowerCase();
    if (!q) return this.state.docNumbers();
    return this.state.docNumbers().filter(dn =>
      dn.module.toLowerCase().includes(q) ||
      dn.prefix.toLowerCase().includes(q)
    );
  }

  filteredShipViaTable(): ShipViaItem[] {
    const q = this.shipViaTableSearch.trim().toLowerCase();
    if (!q) return this.state.shipViaList();
    return this.state.shipViaList().filter(sv =>
      sv.shipViaCode.toLowerCase().includes(q) ||
      sv.shipViaName.toLowerCase().includes(q)
    );
  }

  filteredAsTypeTable(): ASTypeItem[] {
    const q = this.asTypeTableSearch.trim().toLowerCase();
    if (!q) return this.state.asTypes();
    return this.state.asTypes().filter(ast =>
      ast.tid.toLowerCase().includes(q) ||
      ast.tname.toLowerCase().includes(q)
    );
  }

  filteredCurrencyTable(): CurrencyItem[] {
    const q = this.currencyTableSearch.trim().toLowerCase();
    if (!q) return this.state.currencies();
    return this.state.currencies().filter(c =>
      c.currencyId.toLowerCase().includes(q) ||
      c.currencyName.toLowerCase().includes(q) ||
      (c.symbol && c.symbol.toLowerCase().includes(q))
    );
  }

  filteredModuleTable(): SecurityModuleItem[] {
    const q = this.moduleTableSearch.trim().toLowerCase();
    if (!q) return this.state.securityModules();
    return this.state.securityModules().filter(m =>
      m.moduleName.toLowerCase().includes(q) ||
      m.moduleShortName.toLowerCase().includes(q) ||
      String(m.moduleId).includes(q)
    );
  }

  filteredIbanTable(): CountryIbanItem[] {
    const q = this.ibanTableSearch.trim().toLowerCase();
    if (!q) return this.state.countryIbans();
    return this.state.countryIbans().filter(r =>
      r.countryName.toLowerCase().includes(q) ||
      String(r.ibanLength).includes(q) ||
      String(r.countryId).includes(q)
    );
  }

  formatDocNumSample(dn: DocNumberItem): string {
    const pad = parseInt(dn.length, 10) || 4;
    return `${dn.prefix || ''}${String(dn.number || 0).padStart(pad, '0')}`;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        const t = params['tab'] as ManagementTab;
        if (['document-type', 'brand', 'department', 'designation', 'doc-number', 'ship-via', 'as-type', 'currency', 'module', 'iban-rules', 'email'].includes(t)) {
          this.activeTab = t;
        }
      }
    });

    const cfg = this.state.emailConfig();
    if (cfg) {
      this.emailForm = {
        host: cfg.host,
        port: cfg.port,
        username: cfg.username,
        password: cfg.password || '••••••••',
        fromAddress: cfg.fromAddress,
        ccAddress: cfg.ccAddress
      };
    }

    this.loadLiveManagementData();
  }

  private extractApiList(res: any, candidateKeys: string[]): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (typeof res !== 'object') return [];

    for (const k of candidateKeys) {
      if (Array.isArray(res[k])) return res[k];
    }

    const lowerCandidates = candidateKeys.map(k => k.toLowerCase());
    const objKeys = Object.keys(res);
    for (const key of objKeys) {
      const lower = key.toLowerCase();
      if (lowerCandidates.includes(lower) && Array.isArray(res[key])) {
        return res[key];
      }
      if (lower.includes('list') && Array.isArray(res[key])) {
        return res[key];
      }
    }

    if (Array.isArray(res.data)) return res.data;
    return [];
  }

  loadLiveManagementData(): void {
    // 1. Brands: POST /api/Management/GetBRANDList
    this.vendorApi.getBrands().subscribe({
      next: (res) => {
        const list = this.extractApiList(res, ['brand_List', 'branD_List', 'BRAND_List', 'brandList', 'brands', 'data']);
        if (Array.isArray(list) && list.length > 0) {
          for (const b of list) {
            const bid = b.branD_ID || b.brand_id || b.brandId || b.id || b.code || '';
            const bname = b.branD_NAME || b.brand_name || b.brandName || b.name || b.description || bid;
            if (!bid) continue;
            const existing = this.state.brands().find(x => x.brandId.toLowerCase() === String(bid).toLowerCase());
            if (!existing) {
              this.state.brands.update(prev => [...prev, { id: `br_${bid}`, brandId: String(bid), brandName: String(bname) }]);
            }
          }
        }
      },
      error: (err) => console.warn('Live brands load notice:', err?.message || err)
    });

    // 2. Departments: POST /api/Management/GetDEPARTMENTList
    this.vendorApi.getDepartments().subscribe({
      next: (res) => {
        const list = this.extractApiList(res, ['department_List', 'deP_List', 'DEP_List', 'departmentList', 'departments', 'data']);
        if (Array.isArray(list) && list.length > 0) {
          for (const d of list) {
            const did = d.deP_ID || d.dep_id || d.deptId || d.id || '';
            const dname = d.deP_NAME || d.dep_name || d.deptName || d.name || did;
            if (!did) continue;
            const existing = this.state.departments().find(x => x.deptId.toLowerCase() === String(did).toLowerCase() || x.deptName.toLowerCase() === String(dname).toLowerCase());
            if (!existing) {
              this.state.departments.update(prev => [...prev, { id: `dep-${did}`, deptId: String(did), deptName: String(dname) }]);
            }
          }
        }
      },
      error: (err) => console.warn('Live departments load notice:', err?.message || err)
    });

    // 3. Designations: POST /api/Management/GetDESIGNATIONList
    this.vendorApi.getDesignations().subscribe({
      next: (res) => {
        const list = this.extractApiList(res, ['designation_List', 'deS_List', 'DES_List', 'designationList', 'designations', 'data']);
        if (Array.isArray(list) && list.length > 0) {
          for (const d of list) {
            const desId = d.deS_ID || d.des_id || d.desigId || d.id || '';
            const desName = d.deS_NAME || d.des_name || d.desigName || d.name || desId;
            if (!desId) continue;
            const existing = this.state.designations().find(x => x.desigId.toLowerCase() === String(desId).toLowerCase());
            if (!existing) {
              this.state.designations.update(prev => [...prev, {
                id: `des_${desId}`,
                desigId: String(desId),
                desigName: String(desName),
                deptId: d.deP_ID || d.deptId || 'DEP-01',
                deptName: d.deP_NAME || d.deptName || 'Procurement & Sourcing'
              }]);
            }
          }
        }
      },
      error: (err) => console.warn('Live designations load notice:', err?.message || err)
    });

    // 4. Document Types: POST /api/Management/GetCSDOCTYPEList
    this.vendorApi.getDocumentTypeList().subscribe({
      next: (res) => {
        const list = this.extractApiList(res, ['csdoctype_List', 'CSDoctype_List', 'csDoctypeList', 'documentTypes', 'data']);
        if (Array.isArray(list) && list.length > 0) {
          for (const dt of list) {
            const code = dt.doC_TYPECODE || dt.doc_typecode || dt.docId || dt.code || '';
            const desc = dt.doC_TYPEDESC || dt.doc_typedesc || dt.docName || dt.description || code;
            if (!code) continue;
            const existing = this.state.documentTypes().find(x => x.docId.toLowerCase() === String(code).toLowerCase());
            if (!existing) {
              this.state.documentTypes.update(prev => [...prev, {
                id: `dt_${code}`,
                docId: String(code),
                docName: String(desc),
                expirable: dt.expireablE_FLAG === 1 || dt.expirable === true,
                group: dt.doC_TYPEGROUP === '1' || dt.group === true,
                mandatory: dt.mandatory === 1 || dt.mandatory === true
              }]);
            }
          }
        }
      },
      error: (err) => console.warn('Live document types load notice:', err?.message || err)
    });

    // 5. Products / Major Products: POST /api/Vendor/GetVMajorProductList
    this.vendorApi.getMajorProducts().subscribe({
      next: (res) => {
        const list = this.extractApiList(res, ['vmajorproduct_List', 'vmajorproducts_List', 'MajorProducts_List', 'majorProducts', 'products', 'data']);
        if (Array.isArray(list) && list.length > 0) {
          for (const p of list) {
            const pcode = p.producT_CODE || p.product_code || p.productId || p.code || '';
            const pdesc = p.producT_DESCRIPTION || p.product_description || p.productName || p.description || pcode;
            if (!pcode) continue;
            const existing = this.state.products().find(x => x.productId.toLowerCase() === String(pcode).toLowerCase());
            if (!existing) {
              this.state.products.update(prev => [...prev, {
                id: `prd_${pcode}`,
                productId: String(pcode),
                productName: String(pdesc),
                category: p.brands || p.category || 'General'
              }]);
            }
          }
        }
      },
      error: (err) => console.warn('Live products load notice:', err?.message || err)
    });

    // 6. Document Numbering: POST /api/Management/GetDOCNUMBERList
    this.vendorApi.getDocumentNumberList().subscribe({
      next: (res) => {
        const list = this.extractApiList(res, ['asdocnum_List', 'docNumberList', 'docNumbers', 'data']);
        if (Array.isArray(list) && list.length > 0) {
          for (const dn of list) {
            const mod = dn.module || dn.modulename || '';
            if (!mod) continue;
            const existing = this.state.docNumbers().find(x => x.module.toLowerCase() === String(mod).toLowerCase());
            if (!existing) {
              this.state.docNumbers.update(prev => [...prev, {
                id: `dn_${mod}`,
                module: String(mod),
                prefix: String(dn.prefix || `${mod}-`),
                number: Number(dn.number) || 1,
                length: String(dn.length || '4')
              }]);
            }
          }
        }
      },
      error: (err) => console.warn('Live doc numbers load notice:', err?.message || err)
    });

    // 7. Ship Via & Carriers: POST /api/Management/GetSHIPVIAList
    this.vendorApi.getShipViaList().subscribe({
      next: (res) => {
        const list = this.extractApiList(res, ['shipvia_List', 'shipviA_List', 'shipViaList', 'data']);
        if (Array.isArray(list) && list.length > 0) {
          for (const sv of list) {
            const code = sv.shipviA_CODE || sv.shipViaCode || sv.code || '';
            const name = sv.shipviA_NAME || sv.shipViaName || sv.name || code;
            if (!code) continue;
            const existing = this.state.shipViaList().find(x => x.shipViaCode.toLowerCase() === String(code).toLowerCase());
            if (!existing) {
              this.state.shipViaList.update(prev => [...prev, {
                id: `sv_${code}`,
                shipViaCode: String(code),
                shipViaName: String(name)
              }]);
            }
          }
        }
      },
      error: (err) => console.warn('Live ship via load notice:', err?.message || err)
    });

    // 8. Asset & Expense Types: POST /api/Management/GetASTYPEList
    this.vendorApi.getASTYPEList().subscribe({
      next: (res) => {
        const list = this.extractApiList(res, ['astypE_List', 'asType_List', 'asTypes', 'data']);
        if (Array.isArray(list) && list.length > 0) {
          for (const ast of list) {
            const tid = ast.tid || ast.tId || ast.id || '';
            const tname = ast.tname || ast.tName || ast.name || tid;
            if (!tid) continue;
            const existing = this.state.asTypes().find(x => x.tid.toLowerCase() === String(tid).toLowerCase());
            if (!existing) {
              this.state.asTypes.update(prev => [...prev, {
                id: `ast_${tid}`,
                tid: String(tid),
                tname: String(tname)
              }]);
            }
          }
        }
      },
      error: (err) => console.warn('Live asset types load notice:', err?.message || err)
    });

    // 9. Email SMTP Configuration: POST /api/Management/GetEMAILList
    this.vendorApi.getEmailList().subscribe({
      next: (res) => {
        const list = this.extractApiList(res, ['emaiL_LIST', 'emaiL_DETAILS', 'emailList', 'data']);
        if (Array.isArray(list) && list.length > 0) {
          const cfg = list[0];
          this.emailForm = {
            host: cfg.emailhost || '',
            port: Number(cfg.emailport) || 587,
            username: cfg.emailusername || '',
            password: cfg.emailpass || '',
            fromAddress: cfg.emailfromaddress || cfg.emailusername || '',
            ccAddress: cfg.emailccaddress || ''
          };
          if (cfg.testemail) {
            this.testEmailAddress = cfg.testemail;
          }
          this.state.saveEmailConfig({
            host: this.emailForm.host,
            port: Number(this.emailForm.port) || 587,
            username: this.emailForm.username,
            password: this.emailForm.password,
            fromAddress: this.emailForm.fromAddress,
            ccAddress: this.emailForm.ccAddress
          });
        }
      },
      error: (err) => console.warn('Live email config notice:', err?.message || err)
    });
    // 10. Currencies: POST /api/Management/GetCURRENCYList
    this.vendorApi.getCurrencies().subscribe({
      next: (res) => {
        const list = this.extractApiList(res, ['currency_List', 'curreny_List', 'currencies', 'data']);
        if (Array.isArray(list) && list.length > 0) {
          for (const c of list) {
            const cid = c.currencyid || c.currencY_ID || c.currencyCode || c.id || '';
            const cname = c.currencyname || c.currencY_NAME || cid;
            const sym = c.symbol || cid;
            if (!cid) continue;
            const existing = this.state.currencies().find(x => x.currencyId.toLowerCase() === String(cid).toLowerCase());
            if (!existing) {
              this.state.currencies.update(prev => [...prev, {
                id: `cur_${cid}`,
                currencyId: String(cid),
                currencyName: String(cname),
                symbol: String(sym)
              }]);
            }
          }
        }
      },
      error: (err) => console.warn('Live currencies load notice:', err?.message || err)
    });

    // 11. Security Modules: POST /api/Management/GetCSMODULEList
    this.vendorApi.getModules().subscribe({
      next: (res) => {
        const list = this.extractApiList(res, ['csmodule_List', 'modules', 'data']);
        if (Array.isArray(list) && list.length > 0) {
          for (const m of list) {
            const mid = m.moduleid !== undefined ? Number(m.moduleid) : null;
            const mname = m.modulename || '';
            const mshort = m.moduleshortname || mname.substring(0, 4).toUpperCase();
            if (mid === null || !mname) continue;
            const existing = this.state.securityModules().find(x => x.moduleId === mid);
            if (!existing) {
              this.state.securityModules.update(prev => [...prev, {
                id: `mod_${mid}`,
                moduleId: mid,
                moduleName: String(mname),
                moduleShortName: String(mshort),
                isActive: m.isactive === 1 || m.isactive === true
              }]);
            }
          }
        }
      },
      error: (err) => console.warn('Live security modules load notice:', err?.message || err)
    });

    // 12. Country IBAN Rules: POST /api/Vendor/GetCOUNTRYIBANList
    this.vendorApi.getCountryIbans().subscribe({
      next: (res) => {
        const list = this.extractApiList(res, ['countriban_List', 'countrY_IBAN_List', 'ibans', 'data']);
        if (Array.isArray(list) && list.length > 0) {
          for (const r of list) {
            const cname = r.countrY_NAME || r.countryName || '';
            const len = Number(r.ibaN_LENGTH || r.ibanLength) || 23;
            const cid = Number(r.countrY_ID || r.countryId) || 1;
            if (!cname) continue;
            const existing = this.state.countryIbans().find(x => x.countryName.toLowerCase() === cname.toLowerCase());
            if (!existing) {
              this.state.countryIbans.update(prev => [...prev, {
                id: `iban_${cid}`,
                countryId: cid,
                countryName: String(cname),
                ibanLength: len
              }]);
            }
          }
        }
      },
      error: (err) => console.warn('Live country IBAN rules load notice:', err?.message || err)
    });
  }

  setTab(tab: ManagementTab): void {
    this.activeTab = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });
  }

  getTabLabel(tab: ManagementTab): string {
    switch (tab) {
      case 'document-type': return 'Document Type Details';
      case 'brand': return 'Brand Information';
      case 'product': return 'Product Information';
      case 'department': return 'Department Master';
      case 'designation': return 'Designation Details';
      case 'doc-number': return 'Document Numbering Sequences';
      case 'ship-via': return 'Ship Via & Freight Carriers';
      case 'as-type': return 'Asset & Expense Types';
      case 'currency': return 'Custom Currency Master';
      case 'module': return 'System Security Modules';
      case 'iban-rules': return 'Country IBAN Length Rules';
      case 'email': return 'Email Setup (Office)';
    }
  }

  // --- TAB 1: DOCUMENT TYPE METHODS ---
  submitDocForm(): void {
    if (!this.docForm.docId.trim() || !this.docForm.docName.trim()) {
      this.state.notify('Error: Document ID and Document Name are required.');
      return;
    }

    const doc: DocumentTypeItem = {
      id: this.docEditMode && this.editingDocId ? this.editingDocId : `dt_${Date.now()}`,
      docId: this.docForm.docId.trim(),
      docName: this.docForm.docName.trim(),
      expirable: this.docForm.expirable,
      group: this.docForm.group,
      mandatory: this.docForm.mandatory
    };

    this.state.saveDocumentType(doc);

    // Sync to backend AUDCSDOCTYPEDETAILS
    this.vendorApi.saveDocumentType({
      doC_TYPECODE: doc.docId,
      doC_TYPEDESC: doc.docName,
      expireablE_FLAG: doc.expirable ? 1 : 0,
      doC_TYPEGROUP: doc.group ? '1' : '0',
      mandatory: doc.mandatory ? 1 : 0
    }, this.docEditMode ? 3 : 2).subscribe({
      next: () => this.state.notify(`Document Type synced to server.`),
      error: () => console.warn('Document Type saved locally')
    });

    this.resetDocForm();
  }

  editDoc(item: DocumentTypeItem): void {
    this.docEditMode = true;
    this.editingDocId = item.id;
    this.docForm = {
      docId: item.docId,
      docName: item.docName,
      expirable: item.expirable,
      group: item.group,
      mandatory: item.mandatory
    };
  }

  deleteDoc(id: string): void {
    const item = this.state.documentTypes().find(x => x.id === id || x.docId === id);
    this.state.deleteDocumentType(id);
    if (this.editingDocId === id) this.resetDocForm();
    if (item?.docId) {
      this.vendorApi.deleteDocumentType(item.docId).subscribe({
        next: () => this.state.notify('Document Type removed from server.'),
        error: () => console.warn('Document Type deleted locally')
      });
    }
  }

  resetDocForm(): void {
    this.docEditMode = false;
    this.editingDocId = '';
    this.docForm = {
      docId: '',
      docName: '',
      expirable: false,
      group: false,
      mandatory: false
    };
  }

  selectDocFromModal(item: DocumentTypeItem): void {
    this.editDoc(item);
    this.showDocModal = false;
  }

  // --- TAB 2: BRAND METHODS ---
  submitBrandForm(): void {
    if (!this.brandForm.brandId.trim() || !this.brandForm.brandName.trim()) {
      this.state.notify('Error: Brand ID and Brand Name are required.');
      return;
    }

    const b: BrandItem = {
      id: this.brandEditMode && this.editingBrandId ? this.editingBrandId : `br_${Date.now()}`,
      brandId: this.brandForm.brandId.trim(),
      brandName: this.brandForm.brandName.trim()
    };

    this.state.saveBrand(b);

    // Sync to live backend API: AUDBRAND
    this.vendorApi.saveBrand({
      coperation: this.brandEditMode ? 3 : 2,
      branD_ID: b.brandId,
      branD_NAME: b.brandName
    }, this.brandEditMode ? 3 : 2).subscribe({
      next: () => this.state.notify(`✓ Backend: Brand ${b.brandName} saved.`),
      error: () => this.state.notify(`Brand ${b.brandName} saved locally.`)
    });

    this.resetBrandForm();
  }

  editBrand(b: BrandItem): void {
    this.brandEditMode = true;
    this.editingBrandId = b.id;
    this.brandForm = {
      brandId: b.brandId,
      brandName: b.brandName
    };
  }

  deleteBrand(id: string): void {
    this.state.deleteBrand(id);
    if (this.editingBrandId === id) this.resetBrandForm();
  }

  resetBrandForm(): void {
    this.brandEditMode = false;
    this.editingBrandId = '';
    this.brandForm = { brandId: '', brandName: '' };
  }

  selectBrandFromModal(b: BrandItem): void {
    this.editBrand(b);
    this.showBrandModal = false;
  }

  // --- TAB 3: PRODUCT METHODS ---
  submitProductForm(): void {
    if (!this.productForm.productId.trim() || !this.productForm.productName.trim()) {
      this.state.notify('Error: Product ID and Product Name are required.');
      return;
    }

    const p: ProductItem = {
      id: this.productEditMode && this.editingProductId ? this.editingProductId : `prd_${Date.now()}`,
      productId: this.productForm.productId.trim(),
      productName: this.productForm.productName.trim(),
      category: this.productForm.category
    };

    this.state.saveProduct(p);

    // Save to Database: /api/Vendor/AUDVMajorProductsDetails & /api/Vendor/AUDVendorMajorProduct
    this.vendorApi.saveMajorProduct({
      coperation: 2,
      producT_CODE: p.productId,
      producT_DESCRIPTION: p.productName
    }, 2).subscribe({
      next: (res) => console.log('saveMajorProduct to DB:', res),
      error: (err) => console.warn('saveMajorProduct error:', err)
    });

    this.vendorApi.saveVendorMajorProductAUD({
      coperation: 2,
      majorproduct: p.productId,
      description: p.productName,
      brands: p.category || '',
      isactive: 1
    }, 2).subscribe({
      next: (res) => console.log('saveVendorMajorProductAUD to DB:', res),
      error: (err) => console.warn('saveVendorMajorProductAUD error:', err)
    });

    this.resetProductForm();
  }

  editProduct(p: ProductItem): void {
    this.productEditMode = true;
    this.editingProductId = p.id;
    this.productForm = {
      productId: p.productId,
      productName: p.productName,
      category: p.category || 'General'
    };
  }

  deleteProduct(id: string): void {
    this.state.deleteProduct(id);
    if (this.editingProductId === id) this.resetProductForm();
  }

  resetProductForm(): void {
    this.productEditMode = false;
    this.editingProductId = '';
    this.productForm = { productId: '', productName: '', category: 'General' };
  }

  selectProductFromModal(p: ProductItem): void {
    this.editProduct(p);
    this.showProductModal = false;
  }

  // --- TAB 4: DEPARTMENT METHODS (Department.cshtml) ---
  submitDeptForm(): void {
    if (!this.deptForm.deptId.trim() || !this.deptForm.deptName.trim()) {
      this.state.notify('Error: Department ID and Name are required.');
      return;
    }

    const d: DepartmentItem = {
      id: this.deptEditMode && this.editingDeptId ? this.editingDeptId : `dep-${this.deptForm.deptId.trim()}`,
      deptId: this.deptForm.deptId.trim(),
      deptName: this.deptForm.deptName.trim()
    };

    this.state.saveDepartment(d);

    // Sync to live backend API: POST /api/Management/AUDDEPARTMENT
    this.vendorApi.saveDepartment({
      coperation: this.deptEditMode ? 3 : 2,
      deP_ID: d.deptId,
      deP_NAME: d.deptName
    }, this.deptEditMode ? 3 : 2).subscribe({
      next: () => this.state.notify(`✓ Backend: Department ${d.deptName} saved.`),
      error: () => this.state.notify(`Department ${d.deptName} saved locally.`)
    });

    this.resetDeptForm();
  }

  editDepartment(d: DepartmentItem): void {
    this.deptEditMode = true;
    this.editingDeptId = d.id;
    this.deptForm = {
      deptId: d.deptId,
      deptName: d.deptName
    };
  }

  deleteDepartment(id: string): void {
    const item = this.state.departments().find(x => x.id === id || x.deptId === id);
    this.state.deleteDepartment(id);
    if (this.editingDeptId === id) this.resetDeptForm();
    if (item?.deptId) {
      this.vendorApi.saveDepartment({ deP_ID: item.deptId }, 4).subscribe({
        next: () => this.state.notify(`Department ${item.deptName} removed from server.`),
        error: () => console.warn('Department deleted locally')
      });
    }
  }

  resetDeptForm(): void {
    this.deptEditMode = false;
    this.editingDeptId = '';
    this.deptForm = { deptId: '', deptName: '' };
  }

  selectDeptFromModal(dept: DepartmentItem): void {
    if (this.activeTab === 'department') {
      this.editDepartment(dept);
    } else {
      this.desigForm.deptName = dept.deptName;
    }
    this.showDeptModal = false;
  }

  // --- TAB 5: DESIGNATION METHODS (Designation.cshtml) ---
  submitDesigForm(): void {
    if (!this.desigForm.desigId.trim() || !this.desigForm.desigName.trim()) {
      this.state.notify('Error: Designation ID and Name are required.');
      return;
    }

    const d: DesignationItem = {
      id: this.desigEditMode && this.editingDesigId ? this.editingDesigId : `des_${Date.now()}`,
      desigId: this.desigForm.desigId.trim(),
      desigName: this.desigForm.desigName.trim(),
      deptId: 'DEP-01',
      deptName: this.desigForm.deptName.trim()
    };

    this.state.saveDesignation(d);

    // Sync to live backend API: AUDDESIGNATION
    this.vendorApi.saveDesignation({
      coperation: this.desigEditMode ? 3 : 2,
      deS_ID: d.desigId,
      deS_NAME: d.desigName,
      deP_NAME: d.deptName
    }, this.desigEditMode ? 3 : 2).subscribe({
      next: () => this.state.notify(`✓ Backend: Designation ${d.desigName} saved.`),
      error: () => this.state.notify(`Designation ${d.desigName} saved locally.`)
    });

    this.resetDesigForm();
  }

  editDesig(d: DesignationItem): void {
    this.desigEditMode = true;
    this.editingDesigId = d.id;
    this.desigForm = {
      deptName: d.deptName,
      desigId: d.desigId,
      desigName: d.desigName
    };
  }

  deleteDesig(id: string): void {
    this.state.deleteDesignation(id);
    if (this.editingDesigId === id) this.resetDesigForm();
  }

  resetDesigForm(): void {
    this.desigEditMode = false;
    this.editingDesigId = '';
    this.desigForm = {
      deptName: 'Procurement & Sourcing',
      desigId: '',
      desigName: ''
    };
  }

  selectDesigFromModal(ds: DesignationItem): void {
    this.editDesig(ds);
    this.showDesigModal = false;
  }

  // --- TAB 6: DOCUMENT NUMBERING METHODS (Doc_Number.cshtml) ---
  submitDocNumForm(): void {
    if (!this.docNumForm.module.trim() || !this.docNumForm.prefix.trim()) {
      this.state.notify('Error: Module and Prefix are required.');
      return;
    }

    const dn: DocNumberItem = {
      id: this.docNumEditMode && this.editingDocNumId ? this.editingDocNumId : `dn_${Date.now()}`,
      module: this.docNumForm.module.trim().toUpperCase(),
      prefix: this.docNumForm.prefix.trim(),
      number: Number(this.docNumForm.number) || 1,
      length: String(this.docNumForm.length || '4')
    };

    this.state.saveDocNumber(dn);

    // Sync to backend: POST /api/Management/AUDDOCNUMBERDETAILS
    this.vendorApi.saveDocumentNumber({
      coperation: this.docNumEditMode ? 3 : 2,
      module: dn.module,
      prefix: dn.prefix,
      number: dn.number,
      length: dn.length
    }, this.docNumEditMode ? 3 : 2).subscribe({
      next: () => this.state.notify(`✓ Backend: Document Numbering for ${dn.module} saved.`),
      error: () => this.state.notify(`Document Numbering for ${dn.module} saved locally.`)
    });

    this.resetDocNumForm();
  }

  editDocNum(dn: DocNumberItem): void {
    this.docNumEditMode = true;
    this.editingDocNumId = dn.id;
    this.docNumForm = {
      module: dn.module,
      prefix: dn.prefix,
      number: dn.number,
      length: dn.length
    };
  }

  deleteDocNum(id: string): void {
    const item = this.state.docNumbers().find(x => x.id === id || x.module === id);
    this.state.deleteDocNumber(id);
    if (this.editingDocNumId === id) this.resetDocNumForm();
    if (item?.module) {
      this.vendorApi.deleteDocumentNumber(item.module).subscribe({
        next: () => this.state.notify(`Document numbering for ${item.module} removed from server.`),
        error: () => console.warn('Document numbering deleted locally')
      });
    }
  }

  resetDocNumForm(): void {
    this.docNumEditMode = false;
    this.editingDocNumId = '';
    this.docNumForm = { module: '', prefix: '', number: 1, length: '4' };
  }

  selectDocNumFromModal(dn: DocNumberItem): void {
    this.editDocNum(dn);
    this.showDocNumModal = false;
  }

  // --- TAB 7: SHIP VIA & FREIGHT METHODS (ShipVia.cshtml) ---
  submitShipViaForm(): void {
    if (!this.shipViaForm.shipViaCode.trim() || !this.shipViaForm.shipViaName.trim()) {
      this.state.notify('Error: Ship Via Code and Carrier Name are required.');
      return;
    }

    const sv: ShipViaItem = {
      id: this.shipViaEditMode && this.editingShipViaId ? this.editingShipViaId : `sv_${Date.now()}`,
      shipViaCode: this.shipViaForm.shipViaCode.trim().toUpperCase(),
      shipViaName: this.shipViaForm.shipViaName.trim()
    };

    this.state.saveShipVia(sv);

    // Sync to backend: POST /api/Management/AUDSHIPVIA
    this.vendorApi.saveShipVia({
      coperation: this.shipViaEditMode ? 3 : 2,
      shipviA_CODE: sv.shipViaCode,
      shipviA_NAME: sv.shipViaName
    }, this.shipViaEditMode ? 3 : 2).subscribe({
      next: () => this.state.notify(`✓ Backend: Carrier ${sv.shipViaName} saved.`),
      error: () => this.state.notify(`Carrier ${sv.shipViaName} saved locally.`)
    });

    this.resetShipViaForm();
  }

  editShipVia(sv: ShipViaItem): void {
    this.shipViaEditMode = true;
    this.editingShipViaId = sv.id;
    this.shipViaForm = {
      shipViaCode: sv.shipViaCode,
      shipViaName: sv.shipViaName
    };
  }

  deleteShipVia(id: string): void {
    const item = this.state.shipViaList().find(x => x.id === id || x.shipViaCode === id);
    this.state.deleteShipVia(id);
    if (this.editingShipViaId === id) this.resetShipViaForm();
    if (item?.shipViaCode) {
      this.vendorApi.saveShipVia({ shipviA_CODE: item.shipViaCode }, 4).subscribe({
        next: () => this.state.notify(`Carrier ${item.shipViaName} removed from server.`),
        error: () => console.warn('Carrier deleted locally')
      });
    }
  }

  resetShipViaForm(): void {
    this.shipViaEditMode = false;
    this.editingShipViaId = '';
    this.shipViaForm = { shipViaCode: '', shipViaName: '' };
  }

  selectShipViaFromModal(sv: ShipViaItem): void {
    this.editShipVia(sv);
    this.showShipViaModal = false;
  }

  // --- TAB 8: ASSET TYPE METHODS (ASType.cshtml) ---
  submitAsTypeForm(): void {
    if (!this.asTypeForm.tid.trim() || !this.asTypeForm.tname.trim()) {
      this.state.notify('Error: Asset Type ID and Classification Title are required.');
      return;
    }

    const ast: ASTypeItem = {
      id: this.asTypeEditMode && this.editingAsTypeId ? this.editingAsTypeId : `ast_${Date.now()}`,
      tid: this.asTypeForm.tid.trim().toUpperCase(),
      tname: this.asTypeForm.tname.trim()
    };

    this.state.saveASType(ast);

    // Sync to backend: POST /api/Management/AUDASTYPE
    this.vendorApi.saveASTYPE({
      coperation: this.asTypeEditMode ? 3 : 2,
      tid: ast.tid,
      tname: ast.tname
    }, this.asTypeEditMode ? 3 : 2).subscribe({
      next: () => this.state.notify(`✓ Backend: Asset category ${ast.tname} saved.`),
      error: () => this.state.notify(`Asset category ${ast.tname} saved locally.`)
    });

    this.resetAsTypeForm();
  }

  editAsType(ast: ASTypeItem): void {
    this.asTypeEditMode = true;
    this.editingAsTypeId = ast.id;
    this.asTypeForm = {
      tid: ast.tid,
      tname: ast.tname
    };
  }

  deleteAsType(id: string): void {
    const item = this.state.asTypes().find(x => x.id === id || x.tid === id);
    this.state.deleteASType(id);
    if (this.editingAsTypeId === id) this.resetAsTypeForm();
    if (item?.tid) {
      this.vendorApi.saveASTYPE({ tid: item.tid }, 4).subscribe({
        next: () => this.state.notify(`Asset category ${item.tname} removed from server.`),
        error: () => console.warn('Asset category deleted locally')
      });
    }
  }

  resetAsTypeForm(): void {
    this.asTypeEditMode = false;
    this.editingAsTypeId = '';
    this.asTypeForm = { tid: '', tname: '' };
  }

  selectAsTypeFromModal(ast: ASTypeItem): void {
    this.editAsType(ast);
    this.showAsTypeModal = false;
  }

  // --- TAB: CURRENCY METHODS ---
  submitCurrencyForm(): void {
    if (!this.currencyForm.currencyId.trim() || !this.currencyForm.currencyName.trim()) {
      this.state.notify('Error: Currency Code and Name are required.');
      return;
    }

    const cur: CurrencyItem = {
      id: this.currencyEditMode && this.editingCurrencyId ? this.editingCurrencyId : `cur_${Date.now()}`,
      currencyId: this.currencyForm.currencyId.trim().toUpperCase(),
      currencyName: this.currencyForm.currencyName.trim(),
      symbol: this.currencyForm.symbol.trim() || this.currencyForm.currencyId.trim().toUpperCase()
    };

    this.state.saveCurrency(cur);

    // Sync to backend: POST /api/Management/AUDCURRENCYDETAILS
    this.vendorApi.saveCurrency({
      coperation: this.currencyEditMode ? 3 : 2,
      currencyid: cur.currencyId,
      currencyname: cur.currencyName,
      symbol: cur.symbol
    }, this.currencyEditMode ? 3 : 2).subscribe({
      next: () => this.state.notify(`✓ Backend: Currency ${cur.currencyName} saved.`),
      error: () => this.state.notify(`Currency ${cur.currencyName} saved locally.`)
    });

    this.resetCurrencyForm();
  }

  editCurrency(c: CurrencyItem): void {
    this.currencyEditMode = true;
    this.editingCurrencyId = c.id;
    this.currencyForm = {
      currencyId: c.currencyId,
      currencyName: c.currencyName,
      symbol: c.symbol
    };
  }

  deleteCurrency(id: string): void {
    const item = this.state.currencies().find(x => x.id === id || x.currencyId === id);
    this.state.deleteCurrency(id);
    if (this.editingCurrencyId === id) this.resetCurrencyForm();
    if (item?.currencyId) {
      this.vendorApi.saveCurrency({ currencyid: item.currencyId }, 4).subscribe({
        next: () => this.state.notify(`Currency ${item.currencyName} removed from server.`),
        error: () => console.warn('Currency deleted locally')
      });
    }
  }

  resetCurrencyForm(): void {
    this.currencyEditMode = false;
    this.editingCurrencyId = '';
    this.currencyForm = { currencyId: '', currencyName: '', symbol: '' };
  }

  selectCurrencyFromModal(c: CurrencyItem): void {
    this.editCurrency(c);
    this.showCurrencyModal = false;
  }

  // --- TAB: SECURITY MODULE METHODS ---
  submitModuleForm(): void {
    if (!this.moduleForm.moduleName.trim() || !this.moduleForm.moduleShortName.trim()) {
      this.state.notify('Error: Module Name and Short Code are required.');
      return;
    }

    const mod: SecurityModuleItem = {
      id: this.moduleEditMode && this.editingModuleId ? this.editingModuleId : `mod_${Date.now()}`,
      moduleId: Number(this.moduleForm.moduleId) || (this.state.securityModules().length + 1),
      moduleName: this.moduleForm.moduleName.trim(),
      moduleShortName: this.moduleForm.moduleShortName.trim().toUpperCase(),
      isActive: this.moduleForm.isActive
    };

    this.state.saveSecurityModule(mod);

    // Sync to backend: POST /api/Management/AUDCSMODULE
    this.vendorApi.saveModule({
      coperation: this.moduleEditMode ? 3 : 2,
      moduleid: mod.moduleId,
      modulename: mod.moduleName,
      moduleshortname: mod.moduleShortName,
      isactive: mod.isActive ? 1 : 0
    }, this.moduleEditMode ? 3 : 2).subscribe({
      next: () => this.state.notify(`✓ Backend: Module ${mod.moduleName} saved.`),
      error: () => this.state.notify(`Module ${mod.moduleName} saved locally.`)
    });

    this.resetModuleForm();
  }

  editModule(m: SecurityModuleItem): void {
    this.moduleEditMode = true;
    this.editingModuleId = m.id;
    this.moduleForm = {
      moduleId: m.moduleId,
      moduleName: m.moduleName,
      moduleShortName: m.moduleShortName,
      isActive: m.isActive
    };
  }

  deleteModule(id: string): void {
    const item = this.state.securityModules().find(x => x.id === id || String(x.moduleId) === id);
    this.state.deleteSecurityModule(id);
    if (this.editingModuleId === id) this.resetModuleForm();
    if (item?.moduleId) {
      this.vendorApi.saveModule({ moduleid: item.moduleId }, 4).subscribe({
        next: () => this.state.notify(`Security module ${item.moduleName} removed from server.`),
        error: () => console.warn('Module deleted locally')
      });
    }
  }

  resetModuleForm(): void {
    this.moduleEditMode = false;
    this.editingModuleId = '';
    this.moduleForm = {
      moduleId: this.state.securityModules().length + 1,
      moduleName: '',
      moduleShortName: '',
      isActive: true
    };
  }

  selectModuleFromModal(m: SecurityModuleItem): void {
    this.editModule(m);
    this.showModuleModal = false;
  }

  // --- TAB: COUNTRY IBAN METHODS ---
  submitIbanForm(): void {
    if (!this.ibanForm.countryName.trim() || !this.ibanForm.ibanLength) {
      this.state.notify('Error: Country Name and IBAN Length are required.');
      return;
    }

    const rule: CountryIbanItem = {
      id: this.ibanEditMode && this.editingIbanId ? this.editingIbanId : `iban_${Date.now()}`,
      countryId: Number(this.ibanForm.countryId) || (this.state.countryIbans().length + 1),
      countryName: this.ibanForm.countryName.trim(),
      ibanLength: Number(this.ibanForm.ibanLength) || 23
    };

    this.state.saveCountryIban(rule);
    this.resetIbanForm();
  }

  editIban(rule: CountryIbanItem): void {
    this.ibanEditMode = true;
    this.editingIbanId = rule.id;
    this.ibanForm = {
      countryId: rule.countryId,
      countryName: rule.countryName,
      ibanLength: rule.ibanLength
    };
  }

  selectIbanFromModal(rule: CountryIbanItem): void {
    this.editIban(rule);
    this.showIbanModal = false;
  }

  deleteIban(id: string): void {
    this.state.deleteCountryIban(id);
    if (this.editingIbanId === id) this.resetIbanForm();
  }

  resetIbanForm(): void {
    this.ibanEditMode = false;
    this.editingIbanId = '';
    this.ibanForm = {
      countryId: this.state.countryIbans().length + 1,
      countryName: '',
      ibanLength: 23
    };
  }

  // --- TAB 9: EMAIL METHODS (SendEmailForReminder.cshtml) ---
  saveEmailSettings(): void {
    if (!this.emailForm.host || !this.emailForm.username) {
      this.state.notify('Error: Host and username are required.');
      return;
    }

    const payload = {
      coperation: 2,
      emailhost: this.emailForm.host,
      emailport: String(this.emailForm.port || '587'),
      emailusername: this.emailForm.username,
      emailpass: this.emailForm.password,
      emailfromaddress: this.emailForm.fromAddress || this.emailForm.username,
      emailccaddress: this.emailForm.ccAddress || '',
      testemail: this.testEmailAddress || ''
    };

    // Save to Database: POST /api/Management/AUDEMAIL
    this.vendorApi.saveEmailConfig(payload).subscribe({
      next: (res) => {
        this.state.saveEmailConfig({
          host: this.emailForm.host,
          port: Number(this.emailForm.port) || 587,
          username: this.emailForm.username,
          password: this.emailForm.password,
          fromAddress: this.emailForm.fromAddress,
          ccAddress: this.emailForm.ccAddress
        });
        this.state.notify(`Email SMTP configuration saved to database successfully! (${res?.message || 'OK'})`);
      },
      error: (err) => {
        console.warn('saveEmailConfig error:', err);
        this.state.notify('Error saving email configuration to database.');
      }
    });
  }

  sendTestEmail(): void {
    if (!this.testEmailAddress.trim()) {
      this.state.notify('Error: Enter a test email recipient first.');
      return;
    }

    const payload = {
      coperation: 1,
      emailhost: this.emailForm.host,
      emailport: String(this.emailForm.port || '587'),
      emailusername: this.emailForm.username,
      emailpass: this.emailForm.password,
      emailfromaddress: this.emailForm.fromAddress || this.emailForm.username,
      emailccaddress: this.emailForm.ccAddress || '',
      testemail: this.testEmailAddress.trim()
    };

    // Dispatch Live Test Email via Backend: POST /api/Management/AUDEMAIL
    this.vendorApi.saveEmailConfig(payload).subscribe({
      next: (res) => {
        this.state.notify(`Test email request dispatched to ${this.testEmailAddress}! (${res?.message || 'Handshake OK'})`);
      },
      error: (err) => {
        this.state.notify(`Test email dispatch error: ${err?.message || 'SMTP Connection failed'}`);
      }
    });
  }
}
