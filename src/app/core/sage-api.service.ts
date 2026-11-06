import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, map, catchError, of } from 'rxjs';

export interface SageItem {
  ItemNumber: string;
  UnformattedItemNumber?: string;
  Description: string;
  StockingUnitOfMeasure: string;
  Category: string;
  Status: boolean;
  PreferredVendor?: string;
  DefaultPriceListCode?: string;
  QuantityOnHand?: number;
}

export interface SageVendor {
  VendorNumber: string;
  ShortName?: string;
  VendorName: string;
  GroupCode?: string;
  Status: string; // 'Active' | 'Inactive'
  AddressLine1?: string;
  AddressLine2?: string;
  AddressLine3?: string;
  City?: string;
  StateProvince?: string;
  ZipPostalCode?: string;
  Country?: string;
  PhoneNumber1?: string;
  Email?: string;
  CurrencyCode?: string;
}

export interface SageLocation {
  LocationKey: string;
  Name: string;
  AddressLine1?: string;
  City?: string;
  StateProvince?: string;
  Country?: string;
  ZipPostalCode?: string;
  TelephoneNumber?: string;
}

export interface SageCurrency {
  CurrencyCodeKey: string;
  Description: string;
  Symbol?: string;
  DecimalPlaces?: string;
}

export interface SageTax {
  TaxAuthorityKey: string;
  Description: string;
  TaxReportingCurrency?: string;
  MaximumTaxAllowable?: number;
}

export interface SagePOPurchaseOrder {
  PurchaseOrderSequenceKey?: number;
  PurchaseOrderNumber: string;
  PurchaseOrderDate: string;
  OrderDate?: string;
  ExpectedArrivalDate?: string;
  Vendor: string;
  Name: string;
  Description?: string;
  Comment?: string;
  TermsCode?: string;
  Total: number;
  ExtendedCost: number;
  Currency: string;
  OnHold?: boolean;
  Completed?: boolean;
  QuantityOrdered?: number;
}

export interface SagePOInvoice {
  InvoiceSequenceKey?: number;
  InvoiceNumber: string;
  InvoiceDate: string;
  PurchaseOrderNumber?: string;
  ReceiptNumber?: string;
  ReceiptDate?: string;
  Vendor: string;
  Name: string;
  Description?: string;
  Comment?: string;
  TermsCode?: string;
  Currency: string;
  Total: number;
  ExtendedCost: number;
  TotalTermsAmountDue?: number;
  Completed?: boolean;
}

export interface SageODataResponse<T> {
  '@odata.context'?: string;
  '@odata.count'?: number;
  value: T[];
}

export interface SageConfig {
  baseUrl: string;
  tenant: string;
  company: string;
  username: string;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SageApiService {
  private http = inject(HttpClient);

  // Default configuration discovered from Sage 300 Web API IIS setup
  private config: SageConfig = {
    baseUrl: '/Sage300WebApi', // Uses Angular dev proxy or direct URL
    tenant: '-',
    company: 'SAMDAT',
    username: 'ADMIN',
    password: 'Admin@123'
  };

  // Connection state
  private isConnectedSubject = new BehaviorSubject<boolean>(true);
  isConnected$ = this.isConnectedSubject.asObservable();

  // In-memory caches for Master Data
  private allCachedItems: SageItem[] = [];
  private allCachedVendors: SageVendor[] = [];
  private allCachedLocations: SageLocation[] = [];
  private allCachedCurrencies: SageCurrency[] = [];
  private allCachedTaxes: SageTax[] = [];
  private allCachedPurchaseOrders: SagePOPurchaseOrder[] = [];
  private allCachedInvoices: SagePOInvoice[] = [];

  constructor() {
    const saved = localStorage.getItem('sage_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.password) {
          delete parsed.password;
        }
        this.config = { ...this.config, ...parsed };
      } catch (e) {
        console.warn('Failed to parse saved sage_config');
      }
    }
  }

  setConfig(cfg: Partial<SageConfig>): void {
    this.config = { ...this.config, ...cfg };
    localStorage.setItem('sage_config', JSON.stringify({
      baseUrl: this.config.baseUrl,
      tenant: this.config.tenant,
      company: this.config.company,
      username: this.config.username,
      password: this.config.password
    }));
    this.clearCache();
  }

  getConfig(): SageConfig {
    return { ...this.config };
  }

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });

    if (this.config.username) {
      const basicAuth = btoa(`${this.config.username}:${this.config.password || ''}`);
      headers = headers.set('Authorization', `Basic ${basicAuth}`);
    }

    return headers;
  }

  private buildUrl(module: string, entity: string): string {
    const base = this.config.baseUrl.replace(/\/+$/, '');
    const tenant = encodeURIComponent(this.config.tenant || '-');
    const company = encodeURIComponent(this.config.company || 'SAMDAT');
    return `${base}/v1.0/${tenant}/${company}/${module}/${entity}`;
  }

  /**
   * Test connection to Sage 300 Web API
   */
  testConnection(): Observable<{ success: boolean; message: string; sampleItem?: SageItem }> {
    const url = this.buildUrl('IC', 'ICItems');

    return this.http.get<SageODataResponse<SageItem>>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        this.isConnectedSubject.next(true);
        const items = res.value || [];
        this.allCachedItems = items;
        const sample = items[0];
        return {
          success: true,
          message: `Connected successfully to Sage 300 (${this.config.company})! Found ${items.length} items.`,
          sampleItem: sample
        };
      }),
      catchError(err => {
        this.isConnectedSubject.next(false);
        let msg = 'Failed to connect to Sage 300.';
        if (err.status === 401) {
          msg = 'Sage 300 Authentication failed: Invalid username or password.';
        } else if (err.status === 404) {
          msg = `Sage 300 Endpoint not found. Verify company code "${this.config.company}".`;
        } else if (err.status === 0) {
          msg = 'Network error / CORS issue connecting to Sage 300 Web API.';
        }
        return of({ success: false, message: msg });
      })
    );
  }

  // ==========================================
  // 1. ICItems (Items Catalog)
  // ==========================================

  getItemsPage(page = 1, pageSize = 25, search = ''): Observable<{
    items: SageItem[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    if (this.allCachedItems.length > 0) {
      return of(this.sliceItems(this.allCachedItems, page, pageSize, search));
    }

    const url = this.buildUrl('IC', 'ICItems');

    return this.http.get<SageODataResponse<SageItem>>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        this.allCachedItems = res.value || [];
        this.isConnectedSubject.next(true);
        return this.sliceItems(this.allCachedItems, page, pageSize, search);
      }),
      catchError(err => {
        console.error('Error fetching ICItems from Sage 300:', err);
        return of({ items: [], total: 0, page: 1, totalPages: 1 });
      })
    );
  }

  private sliceItems(all: SageItem[], page: number, pageSize: number, search: string) {
    let filtered = all;
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = all.filter(it =>
        (it.Description && it.Description.toLowerCase().includes(term)) ||
        (it.ItemNumber && it.ItemNumber.toLowerCase().includes(term))
      );
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const safePage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (safePage - 1) * pageSize;
    const slice = filtered.slice(startIndex, startIndex + pageSize);

    return {
      items: slice,
      total,
      page: safePage,
      totalPages
    };
  }

  getAllItems(): Observable<SageItem[]> {
    if (this.allCachedItems.length > 0) {
      return of(this.allCachedItems);
    }
    const url = this.buildUrl('IC', 'ICItems');
    return this.http.get<SageODataResponse<SageItem>>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        this.allCachedItems = res.value || [];
        return this.allCachedItems;
      }),
      catchError(err => {
        console.error('Error fetching ICItems from Sage 300:', err);
        return of([]);
      })
    );
  }

  // ==========================================
  // 2. APVendors (Vendors Catalog)
  // ==========================================

  getVendors(search = ''): Observable<SageVendor[]> {
    if (this.allCachedVendors.length > 0 && !search.trim()) {
      return of(this.allCachedVendors);
    }

    const url = this.buildUrl('AP', 'APVendors');

    return this.http.get<SageODataResponse<SageVendor>>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        let all = res.value || [];
        this.allCachedVendors = all;
        if (search.trim()) {
          const term = search.trim().toLowerCase();
          all = all.filter(v =>
            (v.VendorName && v.VendorName.toLowerCase().includes(term)) ||
            (v.VendorNumber && v.VendorNumber.toLowerCase().includes(term)) ||
            (v.ShortName && v.ShortName.toLowerCase().includes(term))
          );
        }
        return all;
      }),
      catchError(err => {
        console.error('Error fetching APVendors from Sage 300:', err);
        return of([]);
      })
    );
  }

  getVendorsPage(page = 1, pageSize = 25, search = ''): Observable<{
    vendors: SageVendor[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.getVendors(search).pipe(
      map(all => {
        const total = all.length;
        const totalPages = Math.ceil(total / pageSize) || 1;
        const safePage = Math.max(1, Math.min(page, totalPages));
        const startIndex = (safePage - 1) * pageSize;
        const slice = all.slice(startIndex, startIndex + pageSize);

        return {
          vendors: slice,
          total,
          page: safePage,
          totalPages
        };
      })
    );
  }

  // ==========================================
  // 3. ICLocations (Locations / Warehouses)
  // ==========================================

  getLocations(): Observable<SageLocation[]> {
    if (this.allCachedLocations.length > 0) {
      return of(this.allCachedLocations);
    }

    const url = this.buildUrl('IC', 'ICLocations');

    return this.http.get<SageODataResponse<SageLocation>>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        this.allCachedLocations = res.value || [];
        return this.allCachedLocations;
      }),
      catchError(err => {
        console.error('Error fetching ICLocations from Sage 300:', err);
        return of([]);
      })
    );
  }

  // ==========================================
  // 4. CSCurrencyCodes (Currencies)
  // ==========================================

  getCurrencies(): Observable<SageCurrency[]> {
    if (this.allCachedCurrencies.length > 0) {
      return of(this.allCachedCurrencies);
    }

    const url = this.buildUrl('CS', 'CSCurrencyCodes');

    return this.http.get<SageODataResponse<SageCurrency>>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        this.allCachedCurrencies = res.value || [];
        return this.allCachedCurrencies;
      }),
      catchError(err => {
        console.error('Error fetching CSCurrencyCodes from Sage 300:', err);
        return of([]);
      })
    );
  }

  // ==========================================
  // 5. TXTaxAuthorities (Taxes / VAT)
  // ==========================================

  getTaxes(): Observable<SageTax[]> {
    if (this.allCachedTaxes.length > 0) {
      return of(this.allCachedTaxes);
    }

    const url = this.buildUrl('TX', 'TXTaxAuthorities');

    return this.http.get<SageODataResponse<SageTax>>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        this.allCachedTaxes = res.value || [];
        return this.allCachedTaxes;
      }),
      catchError(err => {
        console.error('Error fetching TXTaxAuthorities from Sage 300:', err);
        return of([]);
      })
    );
  }

  // ==========================================
  // 6. POPurchaseOrders (Purchase Orders)
  // ==========================================

  getPurchaseOrders(search = ''): Observable<SagePOPurchaseOrder[]> {
    if (this.allCachedPurchaseOrders.length > 0 && !search.trim()) {
      return of(this.allCachedPurchaseOrders);
    }

    const url = this.buildUrl('PO', 'POPurchaseOrders');

    return this.http.get<SageODataResponse<SagePOPurchaseOrder>>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        let all = res.value || [];
        this.allCachedPurchaseOrders = all;
        if (search.trim()) {
          const term = search.trim().toLowerCase();
          all = all.filter(po =>
            (po.PurchaseOrderNumber && po.PurchaseOrderNumber.toLowerCase().includes(term)) ||
            (po.Vendor && po.Vendor.toLowerCase().includes(term)) ||
            (po.Name && po.Name.toLowerCase().includes(term)) ||
            (po.Description && po.Description.toLowerCase().includes(term))
          );
        }
        return all;
      }),
      catchError(err => {
        console.error('Error fetching POPurchaseOrders from Sage 300:', err);
        return of([]);
      })
    );
  }

  // ==========================================
  // 7. POInvoices (Invoices)
  // ==========================================

  getInvoices(search = ''): Observable<SagePOInvoice[]> {
    if (this.allCachedInvoices.length > 0 && !search.trim()) {
      return of(this.allCachedInvoices);
    }

    const url = this.buildUrl('PO', 'POInvoices');

    return this.http.get<SageODataResponse<SagePOInvoice>>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        let all = res.value || [];
        this.allCachedInvoices = all;
        if (search.trim()) {
          const term = search.trim().toLowerCase();
          all = all.filter(inv =>
            (inv.InvoiceNumber && inv.InvoiceNumber.toLowerCase().includes(term)) ||
            (inv.PurchaseOrderNumber && inv.PurchaseOrderNumber.toLowerCase().includes(term)) ||
            (inv.Vendor && inv.Vendor.toLowerCase().includes(term)) ||
            (inv.Name && inv.Name.toLowerCase().includes(term))
          );
        }
        return all;
      }),
      catchError(err => {
        console.error('Error fetching POInvoices from Sage 300:', err);
        return of([]);
      })
    );
  }

  clearCache(): void {
    this.allCachedItems = [];
    this.allCachedVendors = [];
    this.allCachedLocations = [];
    this.allCachedCurrencies = [];
    this.allCachedTaxes = [];
    this.allCachedPurchaseOrders = [];
    this.allCachedInvoices = [];
  }
}
