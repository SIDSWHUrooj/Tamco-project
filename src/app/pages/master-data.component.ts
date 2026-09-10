import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalStateService } from '../core/portal-state.service';
import { PageHeadingComponent, StatusComponent } from '../shared/ui.component';

export interface MasterDataItem {
  id: string;
  code: string;
  name: string;
  type: string;
  parentUnit: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-master-data',
  standalone: true,
  imports: [FormsModule, PageHeadingComponent, StatusComponent],
  template: `
    <app-page-heading eyebrow="System Core" title="Enterprise Master Data Directory" subtitle="Maintain shared procurement categories, plant locations, corporate legal entities and standardized payment terms.">
      <div class="heading-actions">
        <button class="btn" (click)="showAddEntry = !showAddEntry">
          {{ showAddEntry ? '✕ Close Form' : '+ Add Master Entry' }}
        </button>
        <button class="btn secondary" (click)="saveAll()">Save All Entries</button>
      </div>
    </app-page-heading>

    <!-- Add Master Data Form -->
    @if (showAddEntry) {
      <article class="panel" style="margin-bottom: 18px; border-left: 4px solid #1769e0;">
        <div class="panel-title">
          <div>
            <h2>Register Master Data Record</h2>
            <p>Define taxonomy code, nomenclature, category classification and parent operating entity.</p>
          </div>
        </div>

        <div class="form-grid">
          <label>Taxonomy Code *<input [(ngModel)]="newEntry.code" placeholder="e.g. CAT-SOLAR" /></label>
          <label>Nomenclature / Full Name *<input [(ngModel)]="newEntry.name" placeholder="e.g. Solar Photovoltaic Equipment" /></label>
          <label>Record Classification Type *
            <select [(ngModel)]="newEntry.type" style="width: 100%; border: 1px solid #dbe3ed; border-radius: 8px; padding: 10px;">
              <option value="Procurement Category">Procurement Category</option>
              <option value="Plant / Receiving Location">Plant / Receiving Location</option>
              <option value="Operating Entity">Operating Entity</option>
              <option value="Standard Payment Term">Standard Payment Term</option>
            </select>
          </label>
          <label>Parent Operating Entity<input [(ngModel)]="newEntry.parentUnit" placeholder="e.g. TAMCO Middle East Ltd." /></label>
        </div>

        <div class="toolbar" style="margin-top: 16px;">
          <button class="btn secondary" (click)="resetForm()">Reset</button>
          <button class="btn" (click)="addEntry()">Save Master Record</button>
        </div>
      </article>
    }

    <!-- Search & Filter Bar -->
    <div style="display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap;">
      <input
        style="flex: 1; min-width: 240px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px;"
        [(ngModel)]="searchQuery"
        placeholder="🔍 Search master data by code, name, or parent..."
      />
      <select
        style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; background: #fff;"
        [(ngModel)]="typeFilter"
      >
        <option value="">All Classification Types</option>
        <option value="Procurement Category">Procurement Category</option>
        <option value="Plant / Receiving Location">Plant / Receiving Location</option>
        <option value="Standard Payment Term">Standard Payment Term</option>
      </select>
    </div>

    <!-- Live Master Data Table -->
    <article class="panel">
      <div class="panel-title">
        <div>
          <h2>Enterprise Reference Data Taxonomy</h2>
          <p>Global master categories synchronized across ERP and portal</p>
        </div>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Full Nomenclature</th>
              <th>Classification Type</th>
              <th>Parent Unit</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (m of filteredData(); track m.id) {
              <tr>
                <td><input [(ngModel)]="m.code" style="font-family: monospace; font-weight: 700; width: 110px;" /></td>
                <td><input [(ngModel)]="m.name" style="font-weight: 600; min-width: 230px;" /></td>
                <td><input [(ngModel)]="m.type" style="min-width: 190px;" /></td>
                <td><input [(ngModel)]="m.parentUnit" style="min-width: 170px;" /></td>
                <td>
                  <app-status [text]="m.status" [good]="m.status==='Active'" [bad]="m.status==='Inactive'" />
                </td>
                <td>
                  <div style="display: flex; gap: 5px;">
                    <button class="btn small ghost" (click)="saveEntry(m)">Save</button>
                    <button class="btn small danger-btn" (click)="deleteEntry(m.id)">✕</button>
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
export class MasterDataComponent {
  readonly state = inject(PortalStateService);

  showAddEntry = false;
  searchQuery = '';
  typeFilter = '';

  newEntry: MasterDataItem = {
    id: 'MD-005',
    code: 'CAT-SOLAR',
    name: 'Solar Photovoltaic Systems',
    type: 'Procurement Category',
    parentUnit: 'Technical Procurement Vertical',
    status: 'Active'
  };

  masterData: MasterDataItem[] = [
    { id: 'MD-001', code: 'CAT-ELEC', name: 'Electrical & Power Systems', type: 'Procurement Category', parentUnit: 'Technical Vertical', status: 'Active' },
    { id: 'MD-002', code: 'CAT-MECH', name: 'Mechanical & Fabrication Equipment', type: 'Procurement Category', parentUnit: 'Technical Vertical', status: 'Active' },
    { id: 'MD-003', code: 'LOC-KHI', name: 'Karachi Central Logistics & Plant 101', type: 'Plant / Receiving Location', parentUnit: 'TAMCO ME Ltd.', status: 'Active' },
    { id: 'MD-004', code: 'LOC-LHR', name: 'Lahore Regional Distribution Hub', type: 'Plant / Receiving Location', parentUnit: 'TAMCO ME Ltd.', status: 'Active' }
  ];

  filteredData = computed(() => {
    const q = this.searchQuery.trim().toLowerCase();
    const tf = this.typeFilter;
    return this.masterData.filter(m => {
      const matchQ = !q || m.code.toLowerCase().includes(q) || m.name.toLowerCase().includes(q) || m.parentUnit.toLowerCase().includes(q);
      const matchT = !tf || m.type === tf;
      return matchQ && matchT;
    });
  });

  addEntry(): void {
    if (!this.newEntry.code || !this.newEntry.name) {
      this.state.notify('Error: Code and name are required.');
      return;
    }
    const created: MasterDataItem = { ...this.newEntry, id: `MD-${Math.floor(100 + Math.random() * 900)}` };
    this.masterData = [...this.masterData, created];
    this.state.notify(`Master record "${created.name}" created.`);
    this.resetForm();
    this.showAddEntry = false;
  }

  resetForm(): void {
    this.newEntry = {
      id: '',
      code: '',
      name: '',
      type: 'Procurement Category',
      parentUnit: 'TAMCO ME Ltd.',
      status: 'Active'
    };
  }

  saveEntry(m: MasterDataItem): void {
    this.state.notify(`Master data record "${m.name}" updated.`);
  }

  deleteEntry(id: string): void {
    this.masterData = this.masterData.filter(m => m.id !== id);
    this.state.notify('Master data entry removed.');
  }

  saveAll(): void {
    this.state.notify('Master data taxonomy published to all internal systems.');
  }
}
