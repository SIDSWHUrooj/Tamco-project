import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';
import { Vendor } from '../core/models';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent, StatusComponent],
  template: `
    <app-page-heading eyebrow="Procurement control" title="Vendor Management & Verification" subtitle="Pre-qualify vendors, evaluate commercial capability, review documents and approve eligible categories.">
      <div class="heading-actions">
        <button class="btn" (click)="showAddForm = !showAddForm">
          {{ showAddForm ? '✕ Close Form' : '+ Add New Vendor' }}
        </button>
        <button class="btn secondary" (click)="exportList()">Export Excel</button>
      </div>
    </app-page-heading>

    <!-- Stats Overview -->
    <section class="stats-grid compact">
      <div class="stat-card">
        <span>Total Registered Vendors</span>
        <strong>{{ vendorsList.length }}</strong>
        <small>Active in master directory</small>
      </div>
      <div class="stat-card">
        <span>Pending Procurement</span>
        <strong style="color: #b56b05;">{{ pendingCount() }}</strong>
        <small>Requires capability audit</small>
      </div>
      <div class="stat-card">
        <span>Fully Approved</span>
        <strong style="color: #16855b;">{{ approvedCount() }}</strong>
        <small>Eligible for RFQs & Bidding</small>
      </div>
    </section>

    <!-- Add New Vendor Form Panel -->
    @if (showAddForm) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid #1769e0;">
        <div class="panel-title">
          <div>
            <h2>Register & Onboard New Vendor</h2>
            <p>Enter company details, category specialization and banking info.</p>
          </div>
        </div>

        <div class="form-grid">
          <label>Company Legal Name *<input [(ngModel)]="newVendor.name" placeholder="Enter company legal name" /></label>
          <label>Vendor Code *<input [(ngModel)]="newVendor.id" placeholder="e.g. VEN-10024" /></label>
          <label>Location / City *<input [(ngModel)]="newVendor.location" placeholder="e.g. Karachi / Lahore / Islamabad" /></label>
          <label>Primary Categories (comma separated) *<input [(ngModel)]="categoriesInput" placeholder="e.g. Electrical, Mechanical" /></label>
          <label>Assigned Bank<input [(ngModel)]="newVendor.bank" placeholder="e.g. HBL / Meezan Bank" /></label>
          <label>Initial Quality Pass %<input type="number" [(ngModel)]="newVendor.qcPass" placeholder="e.g. 95" /></label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetNewVendorForm()">Reset</button>
          <button class="btn" (click)="addVendor()">Save & Add Vendor</button>
        </div>
      </article>
    }

    <!-- Search & Filter Bar -->
    <div style="display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap;">
      <input
        style="flex: 1; min-width: 240px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px;"
        [(ngModel)]="searchQuery"
        placeholder="🔍 Search vendor by name, code, or location..."
      />
      <select
        style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; background: #fff;"
        [(ngModel)]="categoryFilter"
      >
        <option value="">All Categories</option>
        <option value="Electrical">Electrical</option>
        <option value="Mechanical">Mechanical</option>
        <option value="Safety Equipment">Safety Equipment</option>
        <option value="IT & Hardware">IT & Hardware</option>
        <option value="Raw Materials">Raw Materials</option>
      </select>
    </div>

    <!-- Live Vendor Table -->
    <article class="panel">
      <div class="panel-title">
        <div>
          <h2>Vendor Directory & Verification Queue</h2>
          <p>Update information in-place, approve capabilities, and manage vendor records.</p>
        </div>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Vendor ID</th>
              <th>Company Name</th>
              <th>Location</th>
              <th>Approved Categories</th>
              <th>Bank</th>
              <th>Procurement</th>
              <th>Finance</th>
              <th>Score / QC</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @if (filteredVendors().length === 0) {
              <tr>
                <td colspan="9" style="text-align: center; color: #94a3b8; padding: 28px;">
                  No vendor records found. Click "<strong>+ Add New Vendor</strong>" above to add your first vendor.
                </td>
              </tr>
            }
            @for (v of filteredVendors(); track v.id; let idx = $index) {
              <tr>
                <td><span class="mono">{{ v.id }}</span></td>
                <td><input [(ngModel)]="v.name" style="font-weight: 600;" /></td>
                <td><input [(ngModel)]="v.location" /></td>
                <td><input [value]="v.categories.join(', ')" (input)="updateCategories(v, $any($event.target).value)" /></td>
                <td><input [(ngModel)]="v.bank" /></td>
                <td>
                  <app-status [text]="v.procurementStatus" [good]="v.procurementStatus==='Approved'" [warn]="v.procurementStatus==='Pending'" />
                </td>
                <td>
                  <app-status [text]="v.financeStatus" [good]="v.financeStatus==='Approved'" [warn]="v.financeStatus==='Pending'" />
                </td>
                <td>
                  <div style="display: flex; gap: 4px; align-items: center;">
                    <input type="number" step="0.1" [(ngModel)]="v.rating" style="width: 55px;" />
                    <small style="color: #64748b;">★</small>
                    <input type="number" [(ngModel)]="v.qcPass" style="width: 55px;" />
                    <small style="color: #64748b;">%</small>
                  </div>
                </td>
                <td>
                  <div style="display: flex; gap: 6px;">
                    @if (v.procurementStatus === 'Pending') {
                      <button class="btn small" (click)="approveVendor(v.id)">Approve</button>
                    }
                    <button class="btn small ghost" (click)="saveVendor(v)">Update</button>
                    <button class="btn small danger-btn" (click)="deleteVendor(v.id)">Delete</button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </article>
  `
})
export class VendorsComponent {
  readonly state = inject(PortalStateService);

  showAddForm = true;
  searchQuery = '';
  categoryFilter = '';

  newVendor: Vendor = {
    id: 'VEN-10028',
    name: 'Horizon Power Systems',
    location: 'Islamabad',
    categories: ['Electrical', 'IT & Hardware'],
    procurementStatus: 'Pending',
    financeStatus: 'Pending',
    bank: 'Meezan Bank',
    rating: 4.6,
    onTime: 94,
    qcPass: 97
  };
  categoriesInput = 'Electrical, IT & Hardware';

  vendorsList: Vendor[] = [
    { id: 'VEN-10024', name: 'ABC Supplies Pvt. Ltd.', location: 'Karachi', categories: ['Electrical', 'Safety Equipment'], procurementStatus: 'Approved', financeStatus: 'Approved', bank: 'Habib Bank Limited', rating: 4.8, onTime: 96, qcPass: 98 },
    { id: 'VEN-10025', name: 'Global Traders', location: 'Lahore', categories: ['Raw Materials', 'Mechanical'], procurementStatus: 'Approved', financeStatus: 'Approved', bank: 'MCB Bank', rating: 4.4, onTime: 91, qcPass: 94 },
    { id: 'VEN-10026', name: 'Perfect Industrial', location: 'Karachi', categories: ['Mechanical'], procurementStatus: 'Approved', financeStatus: 'Pending', bank: 'Allied Bank', rating: 4.2, onTime: 88, qcPass: 92 },
    { id: 'VEN-10027', name: 'Tech Solutions', location: 'Islamabad', categories: ['IT & Hardware'], procurementStatus: 'Pending', financeStatus: 'Pending', bank: 'HBL', rating: 4.0, onTime: 85, qcPass: 90 }
  ];

  filteredVendors = computed(() => {
    const q = this.searchQuery.trim().toLowerCase();
    const cat = this.categoryFilter;
    return this.vendorsList.filter(v => {
      const matchQuery = !q || v.name.toLowerCase().includes(q) || v.id.toLowerCase().includes(q) || v.location.toLowerCase().includes(q);
      const matchCat = !cat || v.categories.includes(cat);
      return matchQuery && matchCat;
    });
  });

  pendingCount = computed(() => this.vendorsList.filter(v => v.procurementStatus === 'Pending').length);
  approvedCount = computed(() => this.vendorsList.filter(v => v.procurementStatus === 'Approved' && v.financeStatus === 'Approved').length);

  addVendor(): void {
    if (!this.newVendor.name || !this.newVendor.id) {
      this.state.notify('Error: Company name and vendor code are required.');
      return;
    }
    const categories = this.categoriesInput.split(',').map(s => s.trim()).filter(Boolean);
    const added: Vendor = { ...this.newVendor, categories: categories.length ? categories : ['General'] };
    this.vendorsList = [added, ...this.vendorsList];
    this.state.notify(`Vendor "${added.name}" registered successfully.`);
    this.resetNewVendorForm();
  }

  resetNewVendorForm(): void {
    this.newVendor = {
      id: `VEN-100${Math.floor(29 + Math.random() * 20)}`,
      name: 'Horizon Power Systems',
      location: 'Islamabad',
      categories: ['Electrical', 'IT & Hardware'],
      procurementStatus: 'Pending',
      financeStatus: 'Pending',
      bank: 'Meezan Bank',
      rating: 4.6,
      onTime: 94,
      qcPass: 97
    };
    this.categoriesInput = 'Electrical, IT & Hardware';
  }

  updateCategories(v: Vendor, rawVal: string): void {
    v.categories = rawVal.split(',').map(s => s.trim()).filter(Boolean);
  }

  approveVendor(id: string): void {
    this.vendorsList = this.vendorsList.map(v => v.id === id ? { ...v, procurementStatus: 'Approved' } : v);
    this.state.notify(`Procurement verification approved for vendor ${id}.`);
  }

  saveVendor(v: Vendor): void {
    this.state.notify(`Vendor details for "${v.name}" updated successfully.`);
  }

  deleteVendor(id: string): void {
    const item = this.vendorsList.find(v => v.id === id);
    this.vendorsList = this.vendorsList.filter(v => v.id !== id);
    this.state.notify(`Vendor ${item ? item.name : id} removed.`);
  }

  exportList(): void {
    this.state.notify('Exporting vendor register (Excel format)...');
  }
}
