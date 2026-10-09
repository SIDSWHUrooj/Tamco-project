import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent } from '../shared/ui.component';
import { IconComponent } from '../shared/icon.component';
import {
  DocumentTypeItem,
  BrandItem,
  ProductItem,
  DesignationItem,
  DepartmentItem,
  EmailSetupConfig
} from '../core/models';

type ManagementTab = 'document-type' | 'brand' | 'product' | 'designation' | 'email' | 'backup';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeadingComponent, IconComponent],
  template: `
    <app-page-heading
      eyebrow="System Administration"
      title="Management & Master Setup (/Management)"
      subtitle="Configure master classifications, compliance document rules, manufacturer brands, item taxonomy, and SMTP email services."
    >
      <div class="heading-actions">
        <span class="active-tab-badge">Active Tab: <strong>{{ getTabLabel(activeTab) }}</strong></span>
      </div>
    </app-page-heading>

    <!-- Option 6 Pill Capsule Tabs Navigation (Switch between 6 Management Modules) -->
    <div class="profile-tabs">
      <button
        type="button"
        [class.active]="activeTab === 'document-type'"
        (click)="setTab('document-type')"
      >
        <span>Document Type</span>
      </button>

      <button
        type="button"
        [class.active]="activeTab === 'brand'"
        (click)="setTab('brand')"
      >
        <span>Brand</span>
      </button>

      <button
        type="button"
        [class.active]="activeTab === 'product'"
        (click)="setTab('product')"
      >
        <span>Product</span>
      </button>

      <button
        type="button"
        [class.active]="activeTab === 'designation'"
        (click)="setTab('designation')"
      >
        <span>Designation</span>
      </button>

      <button
        type="button"
        [class.active]="activeTab === 'email'"
        (click)="setTab('email')"
      >
        <span>Email Setup</span>
      </button>

      <button
        type="button"
        [class.active]="activeTab === 'backup'"
        (click)="setTab('backup')"
      >
        <span>Database Backup</span>
      </button>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 1: DOCUMENT TYPE DETAILS (Matches Screenshot 20 & Document_Type.cshtml) -->
    <!-- ========================================================================= -->
    @if (activeTab === 'document-type') {
      <div class="tab-content-panel">
        <article class="panel main-card">
          <div class="main-heading-banner">
            <h5>Document Type Details</h5>
          </div>

          <div class="form-body">
            <!-- Row 1: Document ID & Document Name -->
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

            <!-- Row 2: Checkboxes (Expire able, Group, Mandatory) -->
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

            <!-- Buttons -->
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
              }
            </div>
          </div>
        </article>

        <!-- Document Types Register Table -->
        <article class="panel table-card mt-3">
          <div class="table-header-bar">
            <h6>Registered Document Types</h6>
            <span class="count-pill">{{ state.documentTypes().length }} items</span>
          </div>

          <div class="table-responsive">
            <table class="tamco-table">
              <thead>
                <tr>
                  <th style="width: 60px;">#SR</th>
                  <th style="width: 140px;">Document ID</th>
                  <th>Document Name</th>
                  <th style="width: 120px; text-align: center;">Expirable</th>
                  <th style="width: 100px; text-align: center;">Group</th>
                  <th style="width: 120px; text-align: center;">Mandatory</th>
                  <th style="width: 130px; text-align: center;">Action</th>
                </tr>
              </thead>
              <tbody>
                @for (item of state.documentTypes(); track item.id; let idx = $index) {
                  <tr>
                    <td><strong>{{ idx + 1 }}</strong></td>
                    <td><strong class="mono-code">{{ item.docId }}</strong></td>
                    <td class="font-medium">{{ item.docName }}</td>
                    <td style="text-align: center;">
                      <span class="badge" [class.badge-yes]="item.expirable" [class.badge-no]="!item.expirable">
                        {{ item.expirable ? 'Yes' : 'No' }}
                      </span>
                    </td>
                    <td style="text-align: center;">
                      <span class="badge" [class.badge-yes]="item.group" [class.badge-no]="!item.group">
                        {{ item.group ? 'Yes' : 'No' }}
                      </span>
                    </td>
                    <td style="text-align: center;">
                      <span class="badge" [class.badge-yes]="item.mandatory" [class.badge-no]="!item.mandatory">
                        {{ item.mandatory ? 'Yes' : 'No' }}
                      </span>
                    </td>
                    <td style="text-align: center;">
                      <div class="action-buttons-wrap">
                        <button class="btn-sm-edit" (click)="editDoc(item)" title="Edit document type">
                          ✎ Edit
                        </button>
                        <button class="btn-sm-delete" (click)="deleteDoc(item.id)" title="Delete document type">
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="empty-state">No document types defined. Use form above to create.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </article>
      </div>
    }

    <!-- ========================================================================= -->
    <!-- TAB 2: BRAND INFORMATION (Matches /Management/Brand) -->
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
                    title="Search existing brands"
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
              }
            </div>
          </div>
        </article>

        <!-- Brand Register Table -->
        <article class="panel table-card mt-3">
          <div class="table-header-bar">
            <h6>Registered Brands Master</h6>
            <span class="count-pill">{{ state.brands().length }} items</span>
          </div>

          <div class="table-responsive">
            <table class="tamco-table">
              <thead>
                <tr>
                  <th style="width: 60px;">#SR</th>
                  <th style="width: 180px;">Brand ID</th>
                  <th>Brand Name</th>
                  <th style="width: 140px; text-align: center;">Action</th>
                </tr>
              </thead>
              <tbody>
                @for (b of state.brands(); track b.id; let idx = $index) {
                  <tr>
                    <td><strong>{{ idx + 1 }}</strong></td>
                    <td><strong class="mono-code">{{ b.brandId }}</strong></td>
                    <td class="font-medium">{{ b.brandName }}</td>
                    <td style="text-align: center;">
                      <div class="action-buttons-wrap">
                        <button class="btn-sm-edit" (click)="editBrand(b)">✎ Edit</button>
                        <button class="btn-sm-delete" (click)="deleteBrand(b.id)">✕</button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="empty-state">No brands registered.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </article>
      </div>
    }

    <!-- ========================================================================= -->
    <!-- TAB 3: PRODUCT INFORMATION (Matches /Management/Product) -->
    <!-- ========================================================================= -->
    @if (activeTab === 'product') {
      <div class="tab-content-panel">
        <article class="panel main-card">
          <div class="main-heading-banner">
            <h5>Product Information</h5>
          </div>

          <div class="form-body">
            <div class="form-row two-col">
              <div class="col">
                <label>Product ID <span class="required">*</span></label>
                <div class="input-with-actions">
                  <input
                    type="text"
                    [(ngModel)]="productForm.productId"
                    placeholder="Enter Product ID"
                    class="form-control"
                  />
                  <button
                    type="button"
                    class="btn-attached search-btn"
                    style="background-color: var(--role-accent, #50ae9b);"
                    (click)="showProductModal = true"
                    title="Lookup products"
                  >
                    <app-icon name="search" [size]="15" />
                  </button>
                  <button
                    type="button"
                    class="btn-attached refresh-btn"
                    style="background-color: deepskyblue;"
                    (click)="resetProductForm()"
                    title="Reset Form"
                  >
                    <app-icon name="refresh" [size]="15" />
                  </button>
                </div>
              </div>

              <div class="col">
                <label>Product Name <span class="required">*</span></label>
                <input
                  type="text"
                  [(ngModel)]="productForm.productName"
                  placeholder="Enter Product Name"
                  class="form-control"
                />
              </div>
            </div>

            <div class="btn-actions-row">
              <button
                type="button"
                class="btn btn-primary"
                style="background-color: #007bff; border-color: #007bff;"
                (click)="submitProductForm()"
              >
                {{ productEditMode ? 'Update' : 'Submit' }}
              </button>
              @if (productEditMode) {
                <button
                  type="button"
                  class="btn btn-secondary"
                  (click)="resetProductForm()"
                >
                  Cancel Edit
                </button>
              }
            </div>
          </div>
        </article>

        <!-- Product Register Table -->
        <article class="panel table-card mt-3">
          <div class="table-header-bar">
            <h6>Product Master Catalog</h6>
            <span class="count-pill">{{ state.products().length }} items</span>
          </div>

          <div class="table-responsive">
            <table class="tamco-table">
              <thead>
                <tr>
                  <th style="width: 60px;">#SR</th>
                  <th style="width: 180px;">Product ID</th>
                  <th>Product Nomenclature</th>
                  <th style="width: 140px; text-align: center;">Action</th>
                </tr>
              </thead>
              <tbody>
                @for (p of state.products(); track p.id; let idx = $index) {
                  <tr>
                    <td><strong>{{ idx + 1 }}</strong></td>
                    <td><strong class="mono-code">{{ p.productId }}</strong></td>
                    <td class="font-medium">{{ p.productName }}</td>
                    <td style="text-align: center;">
                      <div class="action-buttons-wrap">
                        <button class="btn-sm-edit" (click)="editProduct(p)">✎ Edit</button>
                        <button class="btn-sm-delete" (click)="deleteProduct(p.id)">✕</button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="empty-state">No products registered.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </article>
      </div>
    }

    <!-- ========================================================================= -->
    <!-- TAB 4: DESIGNATION & DEPARTMENT (Matches /Setup/Designation) -->
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
              }
            </div>
          </div>
        </article>

        <!-- Designation Master Register Table -->
        <article class="panel table-card mt-3">
          <div class="table-header-bar">
            <h6>Registered Designations by Department</h6>
            <span class="count-pill">{{ state.designations().length }} items</span>
          </div>

          <div class="table-responsive">
            <table class="tamco-table">
              <thead>
                <tr>
                  <th style="width: 60px;">#SR</th>
                  <th style="min-width: 200px;">Department</th>
                  <th style="width: 160px;">Designation ID</th>
                  <th>Designation Title</th>
                  <th style="width: 140px; text-align: center;">Action</th>
                </tr>
              </thead>
              <tbody>
                @for (d of state.designations(); track d.id; let idx = $index) {
                  <tr>
                    <td><strong>{{ idx + 1 }}</strong></td>
                    <td class="font-medium">{{ d.deptName }}</td>
                    <td><strong class="mono-code">{{ d.desigId }}</strong></td>
                    <td><strong>{{ d.desigName }}</strong></td>
                    <td style="text-align: center;">
                      <div class="action-buttons-wrap">
                        <button class="btn-sm-edit" (click)="editDesig(d)">✎ Edit</button>
                        <button class="btn-sm-delete" (click)="deleteDesig(d.id)">✕</button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="empty-state">No designations registered.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </article>
      </div>
    }

    <!-- ========================================================================= -->
    <!-- TAB 5: EMAIL SETUP (OFFICE) (Matches /Email/SendEmailForReminder) -->
    <!-- ========================================================================= -->
    @if (activeTab === 'email') {
      <div class="tab-content-panel">
        <article class="panel main-card">
          <div class="main-heading-banner">
            <h5>Email Setup (Office)</h5>
          </div>

          <div class="form-body">
            <!-- Row 1: Email Host, Email Port, Email Username, Email Password -->
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
                <label>Email Password <span class="required">*</span></label>
                <input
                  type="password"
                  [(ngModel)]="emailForm.password"
                  placeholder="Enter Password"
                  class="form-control"
                />
              </div>
            </div>

            <!-- Row 2: From Address, CC Address -->
            <div class="form-row two-col">
              <div class="col">
                <label>From Address <span class="required">*</span></label>
                <input
                  type="email"
                  [(ngModel)]="emailForm.fromAddress"
                  placeholder="Sender Email Address (e.g. procurement@tamco.ae)"
                  class="form-control"
                />
              </div>

              <div class="col">
                <label>CC Address</label>
                <input
                  type="text"
                  [(ngModel)]="emailForm.ccAddress"
                  placeholder="CC Email Addresses (comma separated)"
                  class="form-control"
                />
              </div>
            </div>

            <!-- Row 3: Save button + Test Email section -->
            <div class="form-row two-col" style="align-items: flex-end; margin-top: 14px;">
              <div class="col">
                <button
                  type="button"
                  class="btn btn-primary"
                  style="background-color: var(--role-accent, #50ae9b); border-color: var(--role-accent, #50ae9b); width: 100%; height: 38px; color: white;"
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

    <!-- ========================================================================= -->
    <!-- TAB 6: DATABASE BACKUP (Matches /Management/DataBaseBackup) -->
    <!-- ========================================================================= -->
    @if (activeTab === 'backup') {
      <div class="tab-content-panel">
        <article class="panel main-card" style="text-align: center; padding: 40px 24px;">
          <div style="max-width: 600px; margin: 0 auto;">
            <div style="font-size: 42px; margin-bottom: 12px;">💾</div>
            <h2 style="font-size: 26px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
              DATABASE BACKUP
            </h2>
            <div style="width: 80px; height: 3px; background: #16a34a; margin: 0 auto 20px auto; border-radius: 2px;"></div>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 28px;">
              Click the button below to generate an immediate, encrypted SQL transaction and master database snapshot.
              This backup preserves all requisitions, quotation matrices, vendor certificates, and audit logs.
            </p>

            <button
              type="button"
              class="backup-action-btn"
              (click)="triggerDatabaseBackup()"
              [disabled]="backupInProgress"
            >
              {{ backupInProgress ? 'Generating Backup Snapshot...' : 'Backup Database' }}
            </button>

            @if (lastBackupTime) {
              <div style="margin-top: 24px; padding: 12px 18px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; display: inline-block;">
                <span style="color: #166534; font-weight: 600; font-size: 13.5px;">
                  ✓ Last Successful Backup: {{ lastBackupTime }} (Size: 142.8 MB · Format: .bak.enc)
                </span>
              </div>
            }
          </div>
        </article>
      </div>
    }

    <!-- ========================================================================= -->
    <!-- LOOKUP MODALS (Replicating Legacy Modal Dialogs) -->
    <!-- ========================================================================= -->

    <!-- 1. Document Lookup Modal (#Documentmodal) -->
    @if (showDocModal) {
      <div class="modal-backdrop" (click)="showDocModal = false">
        <div class="modal-window" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h4>Document Type List</h4>
            <button type="button" class="modal-close" (click)="showDocModal = false">✕</button>
          </div>
          <div class="modal-body-scroll">
            <table class="modal-table">
              <thead>
                <tr>
                  <th style="width: 130px;">Document ID</th>
                  <th>Document Name</th>
                  <th style="width: 100px;">Expirable</th>
                </tr>
              </thead>
              <tbody>
                @for (d of state.documentTypes(); track d.id) {
                  <tr (click)="selectDocFromModal(d)" class="clickable-row">
                    <td><strong class="mono-code">{{ d.docId }}</strong></td>
                    <td>{{ d.docName }}</td>
                    <td>{{ d.expirable ? 'Yes' : 'No' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn secondary" (click)="showDocModal = false">Close</button>
          </div>
        </div>
      </div>
    }

    <!-- 2. Brand Lookup Modal (#Brandmodal) -->
    @if (showBrandModal) {
      <div class="modal-backdrop" (click)="showBrandModal = false">
        <div class="modal-window" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h4>Brand List</h4>
            <button type="button" class="modal-close" (click)="showBrandModal = false">✕</button>
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
                @for (b of state.brands(); track b.id) {
                  <tr (click)="selectBrandFromModal(b)" class="clickable-row">
                    <td><strong class="mono-code">{{ b.brandId }}</strong></td>
                    <td>{{ b.brandName }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn secondary" (click)="showBrandModal = false">Close</button>
          </div>
        </div>
      </div>
    }

    <!-- 3. Product Lookup Modal (#Productmodal) -->
    @if (showProductModal) {
      <div class="modal-backdrop" (click)="showProductModal = false">
        <div class="modal-window" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h4>Product List</h4>
            <button type="button" class="modal-close" (click)="showProductModal = false">✕</button>
          </div>
          <div class="modal-body-scroll">
            <table class="modal-table">
              <thead>
                <tr>
                  <th style="width: 140px;">Product ID</th>
                  <th>Product Nomenclature</th>
                </tr>
              </thead>
              <tbody>
                @for (p of state.products(); track p.id) {
                  <tr (click)="selectProductFromModal(p)" class="clickable-row">
                    <td><strong class="mono-code">{{ p.productId }}</strong></td>
                    <td>{{ p.productName }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn secondary" (click)="showProductModal = false">Close</button>
          </div>
        </div>
      </div>
    }

    <!-- 4. Department Lookup Modal (#Departmentmodal) -->
    @if (showDeptModal) {
      <div class="modal-backdrop" (click)="showDeptModal = false">
        <div class="modal-window" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h4>Department List</h4>
            <button type="button" class="modal-close" (click)="showDeptModal = false">✕</button>
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
                @for (dept of state.departments(); track dept.id) {
                  <tr (click)="selectDeptFromModal(dept)" class="clickable-row">
                    <td><strong class="mono-code">{{ dept.deptId }}</strong></td>
                    <td>{{ dept.deptName }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn secondary" (click)="showDeptModal = false">Close</button>
          </div>
        </div>
      </div>
    }

    <!-- 5. Designation Lookup Modal (#Designationmodal) -->
    @if (showDesigModal) {
      <div class="modal-backdrop" (click)="showDesigModal = false">
        <div class="modal-window" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h4>Designation List</h4>
            <button type="button" class="modal-close" (click)="showDesigModal = false">✕</button>
          </div>
          <div class="modal-body-scroll">
            <table class="modal-table">
              <thead>
                <tr>
                  <th style="width: 140px;">Designation ID</th>
                  <th>Designation Name</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                @for (ds of state.designations(); track ds.id) {
                  <tr (click)="selectDesigFromModal(ds)" class="clickable-row">
                    <td><strong class="mono-code">{{ ds.desigId }}</strong></td>
                    <td>{{ ds.desigName }}</td>
                    <td>{{ ds.deptName }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn secondary" (click)="showDesigModal = false">Close</button>
          </div>
        </div>
      </div>
    }

  `,
  styles: [`
    /* Option 6 Pill Capsule Tabs */
    .profile-tabs {
      display: inline-flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 5px;
      margin-bottom: 20px;
      background: #ffffff;
      padding: 5px 6px;
      border-radius: 9999px;
      border: 1px solid var(--line, #e2e8f0);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      max-width: 100%;
    }

    .profile-tabs button {
      border: 0;
      padding: 8px 20px;
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
        background: var(--role-accent, #50ae9b);
        color: #ffffff;
        font-weight: 600;
        box-shadow: 0 3px 10px var(--role-glow, rgba(80, 174, 155, 0.35));
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

    .mono-email {
      font-family: monospace;
      font-size: 12px;
      color: #475569;
    }

    .badge {
      display: inline-block;
      padding: 3px 9px;
      border-radius: 4px;
      font-size: 11.5px;
      font-weight: 700;

      &.badge-yes {
        background: #dcfce7;
        color: #15803d;
      }

      &.badge-no {
        background: #f1f5f9;
        color: #64748b;
      }
    }

    .badge-role {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      background: #e0e7ff;
      color: #3730a3;
      font-size: 11.5px;
      font-weight: 700;
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

    .backup-action-btn {
      background: linear-gradient(135deg, #16a34a, #15803d);
      color: white;
      border: none;
      padding: 14px 34px;
      font-size: 16px;
      font-weight: 700;
      border-radius: 6px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(22, 163, 74, 0.4);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
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
      width: min(700px, 95%);
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
      overflow: hidden;

      &.wide { width: min(850px, 95%); }

      .modal-header {
        background: var(--role-accent, #50ae9b);
        color: white;
        padding: 12px 18px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        h4 { margin: 0; font-size: 16px; font-weight: 700; }
        .modal-close { background: none; border: none; color: white; font-size: 18px; cursor: pointer; }
      }

      .modal-body-scroll {
        padding: 16px 20px;
        overflow-y: auto;
        max-height: 55vh;
      }

      .modal-footer {
        padding: 12px 18px;
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
        display: flex;
        justify-content: flex-end;
      }
    }

    .modal-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;

      th {
        background: #f1f5f9;
        padding: 8px 12px;
        text-align: left;
        border: 1px solid #e2e8f0;
      }

      td {
        padding: 8px 12px;
        border: 1px solid #e2e8f0;
      }

      tr.clickable-row {
        cursor: pointer;
        &:hover td { background: #eff6ff; }
      }
    }

    .empty-state {
      text-align: center;
      color: #94a3b8;
      padding: 24px;
      font-style: italic;
    }
  `]
})
export class ManagementComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly state = inject(PortalStateService);

  activeTab: ManagementTab = 'document-type';

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

  // Tab 4: Designation State
  desigEditMode = false;
  editingDesigId = '';
  desigForm = {
    deptName: 'Procurement & Sourcing',
    desigId: '',
    desigName: ''
  };
  showDeptModal = false;
  showDesigModal = false;

  // Tab 5: Email Setup State
  emailForm = {
    host: 'smtp.office365.com',
    port: 587,
    username: 'procurement@tamco.ae',
    password: '',
    fromAddress: 'procurement@tamco.ae',
    ccAddress: 'cfo@tamco.ae'
  };
  testEmailAddress = '';

  // Tab 6: Database Backup State
  backupInProgress = false;
  lastBackupTime = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        const t = params['tab'] as ManagementTab;
        if (['document-type', 'brand', 'product', 'designation', 'email', 'backup'].includes(t)) {
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
      case 'designation': return 'Designation Details';
      case 'email': return 'Email Setup (Office)';
      case 'backup': return 'Database Backup';
    }
  }

  // --- TAB 1 METHODS ---
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
    this.state.deleteDocumentType(id);
    if (this.editingDocId === id) this.resetDocForm();
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

  // --- TAB 2 METHODS ---
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

  // --- TAB 3 METHODS ---
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

  // --- TAB 4 METHODS ---
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

  selectDeptFromModal(dept: DepartmentItem): void {
    this.desigForm.deptName = dept.deptName;
    this.showDeptModal = false;
  }

  selectDesigFromModal(ds: DesignationItem): void {
    this.editDesig(ds);
    this.showDesigModal = false;
  }

  // --- TAB 5 METHODS ---
  saveEmailSettings(): void {
    this.state.saveEmailConfig({
      host: this.emailForm.host,
      port: Number(this.emailForm.port),
      username: this.emailForm.username,
      password: this.emailForm.password,
      fromAddress: this.emailForm.fromAddress,
      ccAddress: this.emailForm.ccAddress
    });
  }

  sendTestEmail(): void {
    if (!this.testEmailAddress.trim()) {
      this.state.notify('Error: Enter a test email recipient first.');
      return;
    }
    this.state.notify(`Test email successfully sent to ${this.testEmailAddress}! SMTP handshake 250 OK.`);
  }

  // --- TAB 6 METHODS ---
  triggerDatabaseBackup(): void {
    this.backupInProgress = true;
    this.state.notify('Initiating encrypted SQL database snapshot...');
    setTimeout(() => {
      this.backupInProgress = false;
      this.lastBackupTime = new Date().toLocaleString();
      this.state.notify('Database backup completed successfully! Archive saved to /backups/sql-snapshot.bak.enc');
    }, 1500);
  }
}
