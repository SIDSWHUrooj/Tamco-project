import { Injectable, computed, signal } from '@angular/core';
import { Bid, Invoice, PurchaseOrder, Requisition, RequisitionHeader, RequisitionLineItem, RequisitionAssignedVendor, Rfq, Role, Vendor, VendorRegistrationReq, BankRecord, MasterVendor, LogisticCost, ItemBidComparison, VendorBidDetail, DocumentTypeItem, BrandItem, ProductItem, DesignationItem, DepartmentItem, DocNumberItem, ShipViaItem, ASTypeItem, CurrencyItem, SecurityModuleItem, CountryIbanItem, LegacyUserItem, EmailSetupConfig, AuthAccount, PORTAL_ACCOUNTS } from './models';

@Injectable({ providedIn: 'root' })
export class PortalStateService {
  private getInitialAccount(): AuthAccount | null {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const raw = sessionStorage.getItem('tamco_portal_auth');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.role) return parsed;
        }
      }
    } catch {}
    return null;
  }

  private getInitialVendorStatus(): number {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const stored = sessionStorage.getItem('tamco_vendor_status');
        if (stored !== null) return parseInt(stored, 10);
        const auth = this.getInitialAccount();
        if (auth && auth.vendorStatus !== undefined) return auth.vendorStatus;
      }
    } catch {}
    return 3;
  }

  readonly currentUser = signal<AuthAccount | null>(this.getInitialAccount());
  readonly role = signal<Role>(this.getInitialAccount()?.role || 'procurement');
  readonly authenticated = signal<boolean>(!!this.getInitialAccount());
  readonly toast = signal<string>('');

  // 4-Tier Vendor Lifecycle Status (Matching Legacy .NET active code 0, 1, 2, 3+)
  // 0 = Incomplete Wizard (VendorsStepByStep2)
  // 1 = Review Mode (VendorsStepByStep2?showReview=true)
  // 2 = Pending Approval & Signed Form (ReviewForm.cshtml)
  // 3+ = Approved Partner with Sage 300 ERP Sync (Home/Dashboard.cshtml)
  readonly vendorStatusCode = signal<number>(this.getInitialVendorStatus());
  readonly vendorLifecycleState = computed<'onboarding' | 'active_partner'>(() =>
    this.vendorStatusCode() >= 3 ? 'active_partner' : 'onboarding'
  );
  readonly vendorMode = computed<'draft' | 'review' | 'approved'>(() => {
    const code = this.vendorStatusCode();
    if (code >= 3) return 'approved';
    if (code >= 1) return 'review';
    return 'draft';
  });
  readonly currentVendorId = signal<string>('');
  readonly currentVendorName = signal<string>('');

  readonly masterVendors = signal<MasterVendor[]>([]);
  readonly logisticCosts = signal<LogisticCost[]>([]);
  readonly documentTypes = signal<DocumentTypeItem[]>([
    { id: 'dt-1', docId: 'DOC-01', docName: 'Commercial Trade License', expirable: true, group: false, mandatory: true },
    { id: 'dt-2', docId: 'DOC-02', docName: 'VAT Certificate (TRN)', expirable: false, group: false, mandatory: true },
    { id: 'dt-3', docId: 'DOC-03', docName: 'Corporate Tax Registration', expirable: false, group: false, mandatory: false },
    { id: 'dt-4', docId: 'DOC-04', docName: 'Bank Account Certificate', expirable: false, group: false, mandatory: true },
    { id: 'dt-5', docId: 'DOC-05', docName: 'ISO 9001 Compliance Certificate', expirable: true, group: false, mandatory: false },
    { id: 'dt-6', docId: 'DOC-06', docName: 'Power of Attorney / Signatory ID', expirable: true, group: false, mandatory: true }
  ]);
  readonly brands = signal<BrandItem[]>([
    { id: 'br-1', brandId: 'BR-01', brandName: 'Schneider Electric' },
    { id: 'br-2', brandId: 'BR-02', brandName: 'Siemens' },
    { id: 'br-3', brandId: 'BR-03', brandName: 'ABB Ltd.' },
    { id: 'br-4', brandId: 'BR-04', brandName: 'Legrand' },
    { id: 'br-5', brandId: 'BR-05', brandName: 'Eaton Power' },
    { id: 'br-6', brandId: 'BR-06', brandName: 'Honeywell' },
    { id: 'br-7', brandId: 'BR-07', brandName: '3M' }
  ]);
  readonly products = signal<ProductItem[]>([
    { id: 'prd-1', productId: 'PRD-01', productName: 'Medium Voltage Switchgear & Panels', category: 'Electrical' },
    { id: 'prd-2', productId: 'PRD-02', productName: 'Copper Wiring Harness 12mm', category: 'Cabling' },
    { id: 'prd-3', productId: 'PRD-03', productName: 'Air Circuit Breakers (ACB) 400V', category: 'Switchgear' },
    { id: 'prd-4', productId: 'PRD-04', productName: 'Oil Immersed Power Transformers', category: 'Transformers' },
    { id: 'prd-5', productId: 'PRD-05', productName: 'Industrial Relays & Auxiliaries', category: 'Control' },
    { id: 'prd-6', productId: 'PRD-06', productName: 'HVAC Chillers & Air Handling Units', category: 'HVAC' }
  ]);
  readonly departments = signal<DepartmentItem[]>([
    { id: 'dep-1', deptId: 'DEP-01', deptName: 'Procurement & Sourcing' },
    { id: 'dep-2', deptId: 'DEP-02', deptName: 'Accounts Payable & Finance' },
    { id: 'dep-3', deptId: 'DEP-03', deptName: 'Supply Chain & Logistics' },
    { id: 'dep-4', deptId: 'DEP-04', deptName: 'Quality Assurance & Warehouse' },
    { id: 'dep-5', deptId: 'DEP-05', deptName: 'Executive Management' }
  ]);
  readonly designations = signal<DesignationItem[]>([
    { id: 'des-1', desigId: 'DES-01', desigName: 'Procurement Manager', deptId: 'DEP-01', deptName: 'Procurement & Sourcing' },
    { id: 'des-2', desigId: 'DES-02', desigName: 'Senior Sourcing Buyer', deptId: 'DEP-01', deptName: 'Procurement & Sourcing' },
    { id: 'des-3', desigId: 'DES-03', desigName: 'Finance Controller', deptId: 'DEP-02', deptName: 'Accounts Payable & Finance' },
    { id: 'des-4', desigId: 'DES-04', desigName: 'Warehouse Logistics Officer', deptId: 'DEP-03', deptName: 'Supply Chain & Logistics' },
    { id: 'des-5', desigId: 'DES-05', desigName: 'Managing Director', deptId: 'DEP-05', deptName: 'Executive Management' },
    { id: 'des-6', desigId: 'DES-06', desigName: 'Sales & Technical Director', deptId: 'DEP-01', deptName: 'Procurement & Sourcing' }
  ]);
  readonly docNumbers = signal<DocNumberItem[]>([
    { id: 'dn-1', module: 'REQ', prefix: 'REQ-2026-', number: 101, length: '4' },
    { id: 'dn-2', module: 'PO', prefix: 'PO-2026-', number: 205, length: '5' },
    { id: 'dn-3', module: 'INV', prefix: 'INV-', number: 450, length: '5' },
    { id: 'dn-4', module: 'RFQ', prefix: 'RFQ-2026-', number: 62, length: '3' },
    { id: 'dn-5', module: 'VEN', prefix: 'VEN-', number: 1080, length: '5' }
  ]);
  readonly shipViaList = signal<ShipViaItem[]>([
    { id: 'sv-1', shipViaCode: 'SV-01', shipViaName: 'DHL Express Global' },
    { id: 'sv-2', shipViaCode: 'SV-02', shipViaName: 'Aramex Priority Air' },
    { id: 'sv-3', shipViaCode: 'SV-03', shipViaName: 'FedEx International Freight' },
    { id: 'sv-4', shipViaCode: 'SV-04', shipViaName: 'Sea Cargo Consolidated' },
    { id: 'sv-5', shipViaCode: 'SV-05', shipViaName: 'Land Transport Fleet (GCC)' }
  ]);
  readonly asTypes = signal<ASTypeItem[]>([
    { id: 'ast-1', tid: 'AST-01', tname: 'Capital Assets (Equipment & Machinery)' },
    { id: 'ast-2', tid: 'AST-02', tname: 'IT & Network Infrastructure' },
    { id: 'ast-3', tid: 'AST-03', tname: 'Consumables & Operational Spares' },
    { id: 'ast-4', tid: 'AST-04', tname: 'Facilities & Building Maintenance' },
    { id: 'ast-5', tid: 'AST-05', tname: 'Specialized Consulting & Services' }
  ]);
  readonly currencies = signal<CurrencyItem[]>([
    { id: 'cur-1', currencyId: 'AED', currencyName: 'United Arab Emirates Dirham', symbol: 'AED' },
    { id: 'cur-2', currencyId: 'USD', currencyName: 'US Dollar', symbol: '$' },
    { id: 'cur-3', currencyId: 'EUR', currencyName: 'Euro', symbol: '€' },
    { id: 'cur-4', currencyId: 'GBP', currencyName: 'British Pound', symbol: '£' },
    { id: 'cur-5', currencyId: 'SAR', currencyName: 'Saudi Riyal', symbol: 'SAR' }
  ]);
  readonly securityModules = signal<SecurityModuleItem[]>([
    { id: 'mod-1', moduleId: 1, moduleName: 'Vendor Registration & KYC', moduleShortName: 'VREG', isActive: true },
    { id: 'mod-2', moduleId: 2, moduleName: 'Requisition & Sourcing', moduleShortName: 'REQ', isActive: true },
    { id: 'mod-3', moduleId: 3, moduleName: 'Purchase Orders & Dispatch', moduleShortName: 'PO', isActive: true },
    { id: 'mod-4', moduleId: 4, moduleName: 'AP Invoicing & 3-Way Match', moduleShortName: 'INV', isActive: true },
    { id: 'mod-5', moduleId: 5, moduleName: 'Master Setup & Administration', moduleShortName: 'MGMT', isActive: true }
  ]);
  readonly countryIbans = signal<CountryIbanItem[]>([
    { id: 'iban-1', countryId: 1, countryName: 'United Arab Emirates', ibanLength: 23 },
    { id: 'iban-2', countryId: 2, countryName: 'Saudi Arabia', ibanLength: 24 },
    { id: 'iban-3', countryId: 3, countryName: 'Bahrain', ibanLength: 22 },
    { id: 'iban-4', countryId: 4, countryName: 'Kuwait', ibanLength: 30 },
    { id: 'iban-5', countryId: 5, countryName: 'Oman', ibanLength: 23 },
    { id: 'iban-6', countryId: 6, countryName: 'Qatar', ibanLength: 29 },
    { id: 'iban-7', countryId: 7, countryName: 'United Kingdom', ibanLength: 22 },
    { id: 'iban-8', countryId: 8, countryName: 'Pakistan', ibanLength: 24 },
    { id: 'iban-9', countryId: 9, countryName: 'India', ibanLength: 22 },
    { id: 'iban-10', countryId: 10, countryName: 'Germany', ibanLength: 22 }
  ]);
  readonly legacyUsers = signal<LegacyUserItem[]>([]);

  readonly emailConfig = signal<EmailSetupConfig>({
    host: '',
    port: 587,
    username: '',
    fromAddress: '',
    ccAddress: ''
  });

  readonly itemBidComparisons = signal<ItemBidComparison[]>([]);
  readonly vendors = signal<Vendor[]>([]);
  readonly bankRecords = signal<BankRecord[]>([]);
  readonly vendorRegistrationRequests = signal<VendorRegistrationReq[]>([]);
  readonly requisitions = signal<Requisition[]>([]);
  readonly rfqs = signal<Rfq[]>([]);
  readonly purchaseOrders = signal<PurchaseOrder[]>([]);
  readonly invoices = signal<Invoice[]>([]);

  readonly approvedVendors = computed(() => this.vendors().filter(v => v.procurementStatus === 'Approved' && v.financeStatus === 'Approved'));
  readonly pendingProcurement = computed(() => this.vendors().filter(v => v.procurementStatus === 'Pending'));
  readonly pendingFinance = computed(() => this.vendors().filter(v => v.financeStatus === 'Pending'));
  readonly overdueOrders = computed(() => this.purchaseOrders().filter(po => po.arrivalDate > po.requiredDate));

  setRole(role: Role): void { this.role.set(role); }

  signIn(accountOrRole: AuthAccount | Role): void {
    let account: AuthAccount | undefined;
    if (typeof accountOrRole === 'string') {
      account = PORTAL_ACCOUNTS.find(a => a.role === accountOrRole);
      if (!account) {
        account = {
          username: accountOrRole,
          email: `${accountOrRole}@tamco.ae`,
          role: accountOrRole,
          name: accountOrRole.toUpperCase(),
          organization: 'TAMCO Portal',
          initials: accountOrRole.substring(0, 2).toUpperCase(),
          badge: accountOrRole,
          securityGroup: accountOrRole === 'admin' ? '1' : (accountOrRole === 'procurement' ? '2' : (accountOrRole === 'finance' ? '3' : '5'))
        };
      }
    } else {
      account = accountOrRole;
    }

    this.currentUser.set(account);
    this.role.set(account.role);
    this.authenticated.set(true);

    if (account.role === 'vendor') {
      const code = account.vendorStatus !== undefined ? account.vendorStatus : 3;
      this.setVendorStatusCode(code, true);
    }

    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem('tamco_portal_auth', JSON.stringify(account));
      }
    } catch {}
  }

  signOut(): void {
    this.currentUser.set(null);
    this.authenticated.set(false);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem('tamco_portal_auth');
        sessionStorage.removeItem('tamco_jwt_token');
        sessionStorage.removeItem('tamco_refresh_token');
        sessionStorage.removeItem('tamco_vendor_status');
      }
    } catch {}
  }

  setVendorStatusCode(code: number, silent = false): void {
    this.vendorStatusCode.set(code);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem('tamco_vendor_status', code.toString());
      }
    } catch {}

    if (!silent) {
      const descriptions: Record<number, string> = {
        0: 'Status 0: Incomplete Registration Wizard (Draft Mode)',
        1: 'Status 1: Wizard Review Mode (Under Review)',
        2: 'Status 2: Pending Approval & Verification',
        3: 'Status 3: Sage 300 ERP Active Certified Partner'
      };
      this.notify(descriptions[code] || `Vendor Status set to ${code}`);
    }
  }

  toggleVendorMode(): void {
    const next = this.vendorStatusCode() >= 3 ? 0 : 3;
    this.setVendorStatusCode(next);
  }

  notify(message: string): void {
    this.toast.set(message);
    setTimeout(() => this.toast.set(''), 2800);
  }

  approveVendor(id: string, side: 'procurement' | 'finance', status: 'Approved' | 'Pending' | 'Rejected' = 'Approved'): void {
    this.vendors.update(items => items.map(v => v.id === id ? {
      ...v,
      procurementStatus: side === 'procurement' ? status : v.procurementStatus,
      financeStatus: side === 'finance' ? status : v.financeStatus
    } : v));
    this.notify(`${side === 'procurement' ? 'Procurement' : 'Finance'} verification set to ${status} for ${id}`);
  }

  acknowledgePurchaseOrder(poId: string): void {
    this.purchaseOrders.update(list => list.map(po => po.id === poId ? { ...po, approval: 'Approved' } : po));
    this.notify(`Purchase Order ${poId} acknowledged and accepted by supplier.`);
  }

  submitVendorBid(rfqId: string, quotePrice: number, leadDays: number = 7): void {
    this.rfqs.update(list => list.map(rfq => {
      if (rfq.id === rfqId) {
        let matched = false;
        const bids = rfq.bids.map(b => {
          if (b.vendorId === this.currentVendorId() || b.vendor.toLowerCase() === this.currentVendorName().toLowerCase()) {
            matched = true;
            return { ...b, price: quotePrice, deliveryDays: leadDays, submitted: true };
          }
          return b;
        });
        if (!matched) {
          bids.push({
            vendorId: this.currentVendorId(),
            vendor: this.currentVendorName(),
            price: quotePrice,
            location: 'Dubai',
            deliveryDays: leadDays,
            historyScore: 95,
            submitted: true
          });
        }
        return { ...rfq, bids };
      }
      return rfq;
    }));
    this.notify(`Binding quotation submitted successfully for ${rfqId}!`);
  }

  submitVendorInvoice(poId: string, invoiceNo: string, amount: number): void {
    const newInv: Invoice = {
      id: invoiceNo || `INV-00${Math.floor(200 + Math.random() * 800)}`,
      poId,
      vendor: this.currentVendorName(),
      amount,
      status: 'Pending',
      match: 'Matched'
    };
    this.invoices.update(list => [newInv, ...list]);
    this.notify(`Tax Invoice ${newInv.id} registered against PO ${poId} and routed to Finance AP!`);
  }

  saveVendor(vendor: Vendor): void {
    this.vendors.update(items => items.map(v => v.id === vendor.id ? vendor : v));
    this.notify(`Vendor details for "${vendor.name}" updated successfully.`);
  }

  deleteVendor(id: string): void {
    const item = this.vendors().find(v => v.id === id);
    this.vendors.update(items => items.filter(v => v.id !== id));
    this.notify(`Vendor ${item ? item.name : id} removed.`);
  }

  submitBid(rfqId: string, price: number, deliveryDays: number): void {
    const vId = this.currentVendorId() || this.currentUser()?.organization || 'VEN';
    const vName = this.currentVendorName() || this.currentUser()?.name || 'Vendor';
    this.rfqs.update(items => items.map(r => {
      if (r.id !== rfqId) return r;
      const existing = r.bids.some(b => b.vendorId === vId);
      const bid: Bid = { vendorId: vId, vendor: vName, price, location: 'United Arab Emirates', deliveryDays, historyScore: 100, submitted: true };
      return { ...r, bids: existing ? r.bids.map(b => b.vendorId === vId ? bid : b) : [...r.bids, bid] };
    }));
    this.notify(`Bid submitted for ${rfqId}`);
  }

  approvePo(id: string): void {
    this.purchaseOrders.update(items => items.map(po => po.id === id ? { ...po, approval: 'Approved' } : po));
    this.notify(`${id} approved and released to supplier`);
  }

  updateArrival(id: string, arrivalDate: string): void {
    let late = false;
    this.purchaseOrders.update(items => items.map(po => {
      if (po.id !== id) return po;
      late = arrivalDate > po.requiredDate;
      return { ...po, arrivalDate };
    }));
    this.notify(late ? `Arrival date updated. Internal delay alert triggered for ${id}.` : `Arrival date updated for ${id}`);
  }

  setQc(id: string, status: 'Passed' | 'Rejected'): void {
    this.purchaseOrders.update(items => items.map(po => po.id === id ? { ...po, grn: 'Passed', qc: status } : po));
    this.notify(`QC ${status.toLowerCase()} for ${id}`);
  }

  uploadInvoice(poId: string, amount: number): void {
    const po = this.purchaseOrders().find(x => x.id === poId);
    if (!po || po.qc !== 'Passed') {
      this.notify('Invoice blocked: GRN and QC must be passed first.');
      return;
    }
    const invoice: Invoice = { id: `INV-${Math.floor(30000 + Math.random() * 5000)}`, poId, vendor: po.vendor, amount, status: 'Pending', match: 'Matched' };
    this.invoices.update(items => [invoice, ...items.filter(x => x.poId !== poId)]);
    this.notify(`Invoice uploaded for ${poId}.`);
  }

  approveInvoice(id: string): void {
    this.invoices.update(items => items.map(inv => inv.id === id ? { ...inv, status: 'Approved' } : inv));
    this.notify(`Invoice ${id} approved`);
  }

  saveVendorRegistrationReq(data: { vendorName: string; email: string; phone: string; contactPerson: string; id?: string }): VendorRegistrationReq {
    let reqId = data.id;
    if (!reqId || reqId === '*** NEW ***') {
      const nextNum = this.vendorRegistrationRequests().length + 1;
      reqId = `REQ-2024-${String(nextNum).padStart(3, '0')}`;
    }

    const existingIndex = this.vendorRegistrationRequests().findIndex(r => r.id === reqId);
    let record: VendorRegistrationReq;

    if (existingIndex >= 0) {
      record = {
        ...this.vendorRegistrationRequests()[existingIndex],
        vendorName: data.vendorName,
        email: data.email,
        phone: data.phone,
        contactPerson: data.contactPerson
      };
      this.vendorRegistrationRequests.update(list => list.map(item => item.id === reqId ? record : item));
    } else {
      record = {
        id: reqId,
        vendorName: data.vendorName,
        email: data.email,
        phone: data.phone,
        contactPerson: data.contactPerson,
        status: 'Draft',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      this.vendorRegistrationRequests.update(list => [record, ...list]);
    }

    // Automatically create or update a matching pending vendor in the master directory
    const existingVendor = this.vendors().find(v => v.name.toLowerCase() === data.vendorName.trim().toLowerCase());
    if (!existingVendor) {
      const nextVenNum = 10020 + this.vendors().length + 5;
      const vendorRecord: Vendor = {
        id: `VEN-${nextVenNum}`,
        name: data.vendorName.trim(),
        location: 'Pending Onboarding',
        categories: ['General'],
        procurementStatus: 'Pending',
        financeStatus: 'Pending',
        bank: 'Pending Submission',
        rating: 4.5,
        onTime: 90,
        qcPass: 95
      };
      this.vendors.update(list => [vendorRecord, ...list]);
    }

    this.notify(`Vendor registration request saved for ${data.vendorName} (${reqId})`);
    return record;
  }

  sendVendorInvitationEmail(reqId: string, customPassword?: string): { password: string } {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const numberPart = Math.floor(1000 + Math.random() * 9000);
    let letterPart = '';
    for (let i = 0; i < 2; i++) {
      letterPart += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    const tempPassword = customPassword || `${numberPart}${letterPart}`;

    this.vendorRegistrationRequests.update(list => list.map(item => {
      if (item.id === reqId) {
        return {
          ...item,
          status: 'Email Sent',
          tempPassword
        };
      }
      return item;
    }));

    const found = this.vendorRegistrationRequests().find(r => r.id === reqId);
    this.notify(`Invitation email & credentials sent to ${found ? found.email : reqId}`);
    return { password: tempPassword };
  }

  skipVendorInvitation(reqId: string): void {
    this.vendorRegistrationRequests.update(list => list.map(item => {
      if (item.id === reqId) {
        return { ...item, status: 'Draft' };
      }
      return item;
    }));
    this.notify(`Email skipped. Request saved as draft (${reqId})`);
  }

  submitVendorProfile(data: {
    id: string;
    company: string;
    location: string;
    categories: string[];
    bank: string;
    iban: string;
    accountTitle: string;
    branch: string;
    notes?: string;
  }): void {
    // 1. Update vendor in vendors list
    this.vendors.update(list => list.map(v => {
      if (v.id === data.id || v.name.toLowerCase() === data.company.toLowerCase()) {
        return {
          ...v,
          name: data.company,
          location: data.location || v.location,
          categories: data.categories.length ? data.categories : v.categories,
          bank: data.bank || v.bank
        };
      }
      return v;
    }));

    // 2. Mark vendor registration request as 'Profile Completed'
    this.vendorRegistrationRequests.update(list => list.map(req => {
      if (req.vendorName.toLowerCase() === data.company.toLowerCase() || req.id === data.id) {
        return { ...req, status: 'Profile Completed' };
      }
      return req;
    }));

    // 3. Push or update bank details in the Finance Bank Verification queue
    if (data.bank && data.iban) {
      const existingBankIndex = this.bankRecords().findIndex(b => b.vendorId === data.id || b.vendorName.toLowerCase() === data.company.toLowerCase());
      if (existingBankIndex >= 0) {
        this.bankRecords.update(list => list.map((b, idx) => idx === existingBankIndex ? {
          ...b,
          vendorName: data.company,
          bankName: data.bank,
          iban: data.iban,
          accountTitle: data.accountTitle,
          branchCode: data.branch,
          verificationStatus: 'Pending',
          notes: data.notes || 'Updated via vendor profile submission'
        } : b));
      } else {
        const newBankRec: BankRecord = {
          id: `BNK-2026-${Math.floor(100 + Math.random() * 900)}`,
          vendorId: data.id,
          vendorName: data.company,
          bankName: data.bank,
          iban: data.iban,
          accountTitle: data.accountTitle,
          branchCode: data.branch,
          verificationStatus: 'Pending',
          verifiedDate: '',
          notes: data.notes || 'Submitted by vendor via profile'
        };
        this.bankRecords.update(list => [newBankRec, ...list]);
      }
    }

    this.notify(`Profile submitted successfully! Banking details routed to Finance for verification.`);
  }

  setBankVerificationStatus(bankRecordId: string, status: 'Approved' | 'Pending' | 'Rejected'): void {
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    let targetRec: BankRecord | undefined;

    this.bankRecords.update(list => list.map(rec => {
      if (rec.id === bankRecordId) {
        targetRec = {
          ...rec,
          verificationStatus: status,
          verifiedDate: status === 'Approved' ? today : ''
        };
        return targetRec;
      }
      return rec;
    }));

    if (targetRec) {
      // Update vendor financeStatus
      this.vendors.update(list => list.map(v => {
        if (v.id === targetRec!.vendorId || v.name.toLowerCase() === targetRec!.vendorName.toLowerCase()) {
          return {
            ...v,
            financeStatus: status,
            bank: status === 'Approved' ? targetRec!.bankName : v.bank
          };
        }
        return v;
      }));

      if (status === 'Approved') {
        this.notify(`Bank verification approved for ${targetRec.vendorName}. Finance status is now Approved.`);
      } else if (status === 'Rejected') {
        this.notify(`Bank verification rejected for ${targetRec.vendorName}.`);
      } else {
        this.notify(`Bank verification reverted to Pending for ${targetRec.vendorName}.`);
      }
    }
  }

  addBankRecord(record: BankRecord): void {
    this.bankRecords.update(list => [record, ...list]);
    this.notify(`Bank record registered for ${record.vendorName}.`);
  }

  deleteBankRecord(id: string): void {
    const item = this.bankRecords().find(r => r.id === id);
    this.bankRecords.update(list => list.filter(r => r.id !== id));
    this.notify(`Bank record for ${item ? item.vendorName : id} deleted.`);
  }

  saveRequisition(req: Requisition, notifyUser: boolean = true): Requisition {
    let docNo = req.header.documentNumber;
    if (!docNo || docNo === '*** NEW ***' || docNo.trim() === '') {
      const nextNum = this.requisitions().length + 1;
      docNo = `REQ-2024-${String(nextNum).padStart(3, '0')}`;
      req.header.documentNumber = docNo;
    }
    req.header.status = req.header.status || 'Submitted';

    const existingIndex = this.requisitions().findIndex(r => r.header.documentNumber === docNo);
    if (existingIndex >= 0) {
      this.requisitions.update(list => list.map(r => r.header.documentNumber === docNo ? req : r));
    } else {
      this.requisitions.update(list => [req, ...list]);
    }
    if (notifyUser) {
      this.notify(`Requisition ${docNo} submitted successfully!`);
    }
    return req;
  }

  deleteRequisition(docNo: string): void {
    this.requisitions.update(list => list.filter(r => r.header.documentNumber !== docNo));
    this.notify(`Requisition ${docNo} removed.`);
  }

  createRfqFromRequisition(reqDocNo: string, title: string, category: string, invitedVendorIds: string[], deadlineDays: number = 14): Rfq {
    const req = this.requisitions().find(r => r.header.documentNumber === reqDocNo);
    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + deadlineDays);
    const deadlineStr = deadlineDate.toISOString().substring(0, 10);
    const todayStr = new Date().toISOString().substring(0, 10);

    const rfqId = `RFQ-2026-0${this.rfqs().length + 62}`;
    
    // Create initial invited bids for the selected approved vendors
    const initialBids: Bid[] = invitedVendorIds.map(vId => {
      const v = this.vendors().find(item => item.id === vId);
      return {
        vendorId: vId,
        vendor: v ? v.name : vId,
        price: 0,
        location: v ? v.location : '',
        deliveryDays: 0,
        historyScore: v ? Math.round(v.rating * 20) : 90,
        submitted: false
      };
    });

    const newRfq: Rfq = {
      id: rfqId,
      title: title || (req ? req.header.requestDescription : `Tender Sourcing for ${reqDocNo}`),
      category: category || 'General',
      requiredDate: req ? req.header.dateRequired : todayStr,
      closeDate: deadlineStr,
      status: 'Open',
      bids: initialBids
    };

    this.rfqs.update(list => [newRfq, ...list]);

    // Update requisition status to 'Approved'
    if (req) {
      this.requisitions.update(list => list.map(r => r.header.documentNumber === reqDocNo ? {
        ...r,
        header: { ...r.header, status: 'Approved' }
      } : r));
    }

    this.notify(`RFQ ${rfqId} created for Requisition ${reqDocNo}! Sourcing quotes from ${invitedVendorIds.length} approved vendor(s).`);
    return newRfq;
  }

  assignVendorsToRequisition(reqDocNo: string, assignments: RequisitionAssignedVendor[]): void {
    const req = this.requisitions().find(r => r.header.documentNumber === reqDocNo);
    if (!req) return;

    this.requisitions.update(list => list.map(r => r.header.documentNumber === reqDocNo ? {
      ...r,
      assignedVendors: assignments,
      header: {
        ...r.header,
        status: assignments.length > 0 ? 'Vendors Assigned' : r.header.status
      }
    } : r));
    this.notify(`Assigned ${assignments.length} vendor association(s) to ${reqDocNo}.`);
  }

  approveRequisitionSourcing(reqDocNo: string): void {
    const req = this.requisitions().find(r => r.header.documentNumber === reqDocNo);
    if (!req) return;

    const assignedVendorIds = Array.from(new Set((req.assignedVendors || []).map(a => a.vendorId)));
    const vendorIdsToInvite = assignedVendorIds.length > 0
      ? assignedVendorIds
      : this.approvedVendors().map(v => v.id);

    this.createRfqFromRequisition(
      reqDocNo,
      req.header.requestDescription || `Tender Sourcing for ${reqDocNo}`,
      req.items[0]?.itemDesc || 'General Procurement',
      vendorIdsToInvite
    );

    this.requisitions.update(list => list.map(r => r.header.documentNumber === reqDocNo ? {
      ...r,
      header: { ...r.header, status: 'Approved' }
    } : r));

    this.notify(`Manager Approval granted! Sourcing authorized and RFQ dispatched for ${reqDocNo}.`);
  }

  rejectRequisitionSourcing(reqDocNo: string): void {
    const req = this.requisitions().find(r => r.header.documentNumber === reqDocNo);
    if (!req) return;

    this.requisitions.update(list => list.map(r => r.header.documentNumber === reqDocNo ? {
      ...r,
      header: { ...r.header, status: 'Draft' }
    } : r));

    this.notify(`Sourcing plan for ${reqDocNo} returned to Draft for re-selection.`);
  }

  saveMasterVendor(mv: MasterVendor): void {
    if (!mv.vendorId || mv.vendorId === '*** NEW ***' || mv.vendorId.trim() === '') {
      const nextId = `VEN-${Math.floor(10000 + Math.random() * 90000)}`;
      mv.vendorId = nextId;
    }
    const existing = this.masterVendors().findIndex(v => v.vendorId === mv.vendorId);
    if (existing >= 0) {
      this.masterVendors.update(list => list.map(v => v.vendorId === mv.vendorId ? mv : v));
    } else {
      this.masterVendors.update(list => [mv, ...list]);
    }

    // Synchronize into directory vendors list
    const dirExisting = this.vendors().findIndex(v => v.id === mv.vendorId);
    const dirVendor: Vendor = {
      id: mv.vendorId,
      name: mv.vendorName,
      location: mv.city || mv.country || 'Dubai',
      categories: ['Procurement Master Record'],
      procurementStatus: mv.status === 'Active' || mv.status === 'Approved' ? 'Approved' : 'Pending',
      financeStatus: mv.status === 'Active' || mv.status === 'Approved' ? 'Approved' : 'Pending',
      bank: mv.bankCode || 'Sage Verified',
      rating: 4.8,
      onTime: 95,
      qcPass: 98
    };
    if (dirExisting >= 0) {
      this.vendors.update(list => list.map(v => v.id === mv.vendorId ? dirVendor : v));
    } else {
      this.vendors.update(list => [dirVendor, ...list]);
    }

    this.notify(`Master Vendor "${mv.vendorName}" (${mv.vendorId}) saved successfully.`);
  }

  approveMasterVendor(vendorId: string): void {
    this.masterVendors.update(list => list.map(v => v.vendorId === vendorId ? { ...v, status: 'Active' } : v));
    this.vendors.update(list => list.map(v => v.id === vendorId ? { ...v, procurementStatus: 'Approved', financeStatus: 'Approved' } : v));
    this.notify(`Master Vendor ${vendorId} approved successfully and activated in Sage ERP.`);
  }

  rejectMasterVendor(vendorId: string): void {
    this.masterVendors.update(list => list.map(v => v.vendorId === vendorId ? { ...v, status: 'Inactive' } : v));
    this.vendors.update(list => list.map(v => v.id === vendorId ? { ...v, procurementStatus: 'Rejected' } : v));
    this.notify(`Master Vendor ${vendorId} status set to Inactive / Rejected.`);
  }

  saveLogisticCost(cost: LogisticCost): void {
    if (!cost.id || cost.id.startsWith('temp_')) {
      cost.id = `LC-${Math.floor(100 + Math.random() * 900)}`;
    }
    const idx = this.logisticCosts().findIndex(c => c.id === cost.id);
    if (idx >= 0) {
      this.logisticCosts.update(list => list.map(c => c.id === cost.id ? cost : c));
    } else {
      this.logisticCosts.update(list => [...list, cost]);
    }
    this.notify(`Logistic cost (${cost.type}: ${cost.currency} ${cost.amount}) saved for ${cost.vendorName}.`);
  }

  deleteLogisticCost(costId: string): void {
    this.logisticCosts.update(list => list.filter(c => c.id !== costId));
    this.notify(`Logistic cost record ${costId} deleted.`);
  }

  approveItemComparison(reqNo: string, itemNo: string, winningVendorId: string): void {
    let winningVendorName = '';
    let totalLandedCostAed = 0;

    this.itemBidComparisons.update(list => list.map(comp => {
      if (comp.reqNo === reqNo && comp.itemNo === itemNo) {
        const updatedBids = comp.bids.map(b => {
          const isWinner = b.vendorId === winningVendorId;
          if (isWinner) {
            winningVendorName = b.vendorName;
            const aedBase = b.currency === 'AED' ? b.price : (b.price * (b.exchangeRateToAed || 3.6725));
            const vatAed = aedBase * 0.05;
            const addCost = (b.insuranceCost || 0) + (b.freightCost || 0) + (b.otherCost || 0);
            totalLandedCostAed = Math.round(aedBase + vatAed + addCost);
          }
          return { ...b, selected: isWinner };
        });
        return {
          ...comp,
          winningVendorId,
          status: 'Approved',
          bids: updatedBids
        };
      }
      return comp;
    }));

    // Automatically draft or approve PO matching Screenshot 27 & 29
    const poNum = `PO-2026-00${this.purchaseOrders().length + 88}`;
    const todayStr = new Date().toISOString().substring(0, 10);
    const arrivalDate = new Date();
    arrivalDate.setDate(arrivalDate.getDate() + 14);
    const arrivalStr = arrivalDate.toISOString().substring(0, 10);

    const newPo: PurchaseOrder = {
      id: poNum,
      vendor: winningVendorName || winningVendorId,
      category: 'Strategic Sourcing',
      amount: totalLandedCostAed || 52000,
      requiredDate: todayStr,
      arrivalDate: arrivalStr,
      approval: 'Approved',
      grn: 'Pending',
      qc: 'Pending'
    };
    this.purchaseOrders.update(list => [newPo, ...list]);

    this.notify(`Comparison approved for ${itemNo}! Winning vendor: ${winningVendorName}. Release PO ${poNum} generated.`);
  }

  saveDocumentType(dt: DocumentTypeItem): void {
    const existingIdx = this.documentTypes().findIndex(x => x.id === dt.id || x.docId.toLowerCase() === dt.docId.toLowerCase());
    if (existingIdx >= 0) {
      this.documentTypes.update(list => list.map((item, idx) => idx === existingIdx ? { ...item, ...dt } : item));
      this.notify(`Document Type ${dt.docName} (${dt.docId}) updated successfully.`);
    } else {
      this.documentTypes.update(list => [dt, ...list]);
      this.notify(`Document Type ${dt.docName} (${dt.docId}) created successfully.`);
    }
  }

  deleteDocumentType(id: string): void {
    this.documentTypes.update(list => list.filter(x => x.id !== id && x.docId !== id));
    this.notify('Document Type removed.');
  }

  saveBrand(br: BrandItem): void {
    const existingIdx = this.brands().findIndex(x => x.id === br.id || x.brandId.toLowerCase() === br.brandId.toLowerCase());
    if (existingIdx >= 0) {
      this.brands.update(list => list.map((item, idx) => idx === existingIdx ? { ...item, ...br } : item));
      this.notify(`Brand ${br.brandName} (${br.brandId}) updated successfully.`);
    } else {
      this.brands.update(list => [br, ...list]);
      this.notify(`Brand ${br.brandName} (${br.brandId}) created successfully.`);
    }
  }

  deleteBrand(id: string): void {
    this.brands.update(list => list.filter(x => x.id !== id && x.brandId !== id));
    this.notify('Brand removed.');
  }

  saveProduct(prd: ProductItem): void {
    const existingIdx = this.products().findIndex(x => x.id === prd.id || x.productId.toLowerCase() === prd.productId.toLowerCase());
    if (existingIdx >= 0) {
      this.products.update(list => list.map((item, idx) => idx === existingIdx ? { ...item, ...prd } : item));
      this.notify(`Product ${prd.productName} (${prd.productId}) updated successfully.`);
    } else {
      this.products.update(list => [prd, ...list]);
      this.notify(`Product ${prd.productName} (${prd.productId}) created successfully.`);
    }
  }

  deleteProduct(id: string): void {
    this.products.update(list => list.filter(x => x.id !== id && x.productId !== id));
    this.notify('Product removed.');
  }

  saveDesignation(des: DesignationItem): void {
    const existingIdx = this.designations().findIndex(x => x.id === des.id || x.desigId.toLowerCase() === des.desigId.toLowerCase());
    if (existingIdx >= 0) {
      this.designations.update(list => list.map((item, idx) => idx === existingIdx ? { ...item, ...des } : item));
      this.notify(`Designation ${des.desigName} (${des.desigId}) updated successfully.`);
    } else {
      this.designations.update(list => [des, ...list]);
      this.notify(`Designation ${des.desigName} (${des.desigId}) created successfully.`);
    }
  }

  deleteDesignation(id: string): void {
    this.designations.update(list => list.filter(x => x.id !== id && x.desigId !== id));
    this.notify('Designation removed.');
  }

  saveDepartment(dept: DepartmentItem): void {
    const existingIdx = this.departments().findIndex(x => x.id === dept.id || x.deptId.toLowerCase() === dept.deptId.toLowerCase());
    if (existingIdx >= 0) {
      this.departments.update(list => list.map((item, idx) => idx === existingIdx ? { ...item, ...dept } : item));
      this.notify(`Department ${dept.deptName} (${dept.deptId}) updated.`);
    } else {
      this.departments.update(list => [dept, ...list]);
      this.notify(`Department ${dept.deptName} (${dept.deptId}) created.`);
    }
  }

  deleteDepartment(id: string): void {
    this.departments.update(list => list.filter(x => x.id !== id && x.deptId !== id));
    this.notify('Department removed.');
  }

  saveDocNumber(dn: DocNumberItem): void {
    const existingIdx = this.docNumbers().findIndex(x => x.id === dn.id || x.module.toLowerCase() === dn.module.toLowerCase());
    if (existingIdx >= 0) {
      this.docNumbers.update(list => list.map((item, idx) => idx === existingIdx ? { ...item, ...dn } : item));
      this.notify(`Document Numbering for ${dn.module} updated.`);
    } else {
      this.docNumbers.update(list => [dn, ...list]);
      this.notify(`Document Numbering for ${dn.module} registered.`);
    }
  }

  deleteDocNumber(idOrModule: string): void {
    this.docNumbers.update(list => list.filter(x => x.id !== idOrModule && x.module.toLowerCase() !== idOrModule.toLowerCase()));
    this.notify('Document numbering rule removed.');
  }

  saveShipVia(sv: ShipViaItem): void {
    const existingIdx = this.shipViaList().findIndex(x => x.id === sv.id || x.shipViaCode.toLowerCase() === sv.shipViaCode.toLowerCase());
    if (existingIdx >= 0) {
      this.shipViaList.update(list => list.map((item, idx) => idx === existingIdx ? { ...item, ...sv } : item));
      this.notify(`Shipping carrier ${sv.shipViaName} (${sv.shipViaCode}) updated.`);
    } else {
      this.shipViaList.update(list => [sv, ...list]);
      this.notify(`Shipping carrier ${sv.shipViaName} (${sv.shipViaCode}) created.`);
    }
  }

  deleteShipVia(idOrCode: string): void {
    this.shipViaList.update(list => list.filter(x => x.id !== idOrCode && x.shipViaCode.toLowerCase() !== idOrCode.toLowerCase()));
    this.notify('Shipping carrier removed.');
  }

  saveASType(ast: ASTypeItem): void {
    const existingIdx = this.asTypes().findIndex(x => x.id === ast.id || x.tid.toLowerCase() === ast.tid.toLowerCase());
    if (existingIdx >= 0) {
      this.asTypes.update(list => list.map((item, idx) => idx === existingIdx ? { ...item, ...ast } : item));
      this.notify(`Asset category ${ast.tname} (${ast.tid}) updated.`);
    } else {
      this.asTypes.update(list => [ast, ...list]);
      this.notify(`Asset category ${ast.tname} (${ast.tid}) registered.`);
    }
  }

  deleteASType(idOrTid: string): void {
    this.asTypes.update(list => list.filter(x => x.id !== idOrTid && x.tid.toLowerCase() !== idOrTid.toLowerCase()));
    this.notify('Asset category removed.');
  }

  saveCurrency(cur: CurrencyItem): void {
    const existingIdx = this.currencies().findIndex(x => x.id === cur.id || x.currencyId.toLowerCase() === cur.currencyId.toLowerCase());
    if (existingIdx >= 0) {
      this.currencies.update(list => list.map((item, idx) => idx === existingIdx ? { ...item, ...cur } : item));
      this.notify(`Currency ${cur.currencyName} (${cur.currencyId}) updated.`);
    } else {
      this.currencies.update(list => [cur, ...list]);
      this.notify(`Currency ${cur.currencyName} (${cur.currencyId}) registered.`);
    }
  }

  deleteCurrency(idOrCode: string): void {
    this.currencies.update(list => list.filter(x => x.id !== idOrCode && x.currencyId.toLowerCase() !== idOrCode.toLowerCase()));
    this.notify('Currency removed.');
  }

  saveSecurityModule(mod: SecurityModuleItem): void {
    const existingIdx = this.securityModules().findIndex(x => x.id === mod.id || x.moduleId === mod.moduleId || x.moduleShortName.toLowerCase() === mod.moduleShortName.toLowerCase());
    if (existingIdx >= 0) {
      this.securityModules.update(list => list.map((item, idx) => idx === existingIdx ? { ...item, ...mod } : item));
      this.notify(`Security Module "${mod.moduleName}" updated.`);
    } else {
      this.securityModules.update(list => [mod, ...list]);
      this.notify(`Security Module "${mod.moduleName}" registered.`);
    }
  }

  deleteSecurityModule(idOrModId: string | number): void {
    this.securityModules.update(list => list.filter(x => x.id !== String(idOrModId) && x.moduleId !== Number(idOrModId)));
    this.notify('Security module removed.');
  }

  saveCountryIban(iban: CountryIbanItem): void {
    const existingIdx = this.countryIbans().findIndex(x => x.id === iban.id || x.countryName.toLowerCase() === iban.countryName.toLowerCase());
    if (existingIdx >= 0) {
      this.countryIbans.update(list => list.map((item, idx) => idx === existingIdx ? { ...item, ...iban } : item));
      this.notify(`IBAN rule for ${iban.countryName} (${iban.ibanLength} digits) updated.`);
    } else {
      this.countryIbans.update(list => [iban, ...list]);
      this.notify(`IBAN rule for ${iban.countryName} (${iban.ibanLength} digits) registered.`);
    }
  }

  deleteCountryIban(idOrCountry: string): void {
    this.countryIbans.update(list => list.filter(x => x.id !== idOrCountry && x.countryName.toLowerCase() !== idOrCountry.toLowerCase()));
    this.notify('IBAN rule removed.');
  }

  saveLegacyUser(usr: LegacyUserItem): void {
    const existingIdx = this.legacyUsers().findIndex(x => x.id === usr.id || x.userId.toLowerCase() === usr.userId.toLowerCase());
    if (existingIdx >= 0) {
      this.legacyUsers.update(list => list.map((item, idx) => idx === existingIdx ? { ...item, ...usr } : item));
      this.notify(`User ${usr.firstName} ${usr.lastName} (${usr.userId}) updated.`);
    } else {
      this.legacyUsers.update(list => [usr, ...list]);
      this.notify(`User ${usr.firstName} ${usr.lastName} (${usr.userId}) registered successfully.`);
    }
  }

  deleteLegacyUser(id: string): void {
    this.legacyUsers.update(list => list.filter(x => x.id !== id && x.userId !== id));
    this.notify('User account deleted.');
  }

  saveEmailConfig(cfg: EmailSetupConfig): void {
    this.emailConfig.set(cfg);
    this.notify('Email SMTP configuration saved successfully.');
  }
}

