import { Injectable, computed, signal } from '@angular/core';
import { Bid, Invoice, PurchaseOrder, Requisition, RequisitionHeader, RequisitionLineItem, RequisitionAssignedVendor, Rfq, Role, Vendor, VendorRegistrationReq, BankRecord, MasterVendor, LogisticCost, ItemBidComparison, VendorBidDetail, DocumentTypeItem, BrandItem, ProductItem, DesignationItem, DepartmentItem, LegacyUserItem, EmailSetupConfig, AuthAccount, PORTAL_ACCOUNTS } from './models';

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
  readonly currentVendorId = signal<string>('VEN-10024');
  readonly currentVendorName = signal<string>('ABC Supplies Pvt. Ltd.');


  readonly masterVendors = signal<MasterVendor[]>([
    {
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
    },
    {
      vendorId: 'VEN-10031',
      vendorName: 'Global Traders LLC',
      email: 'procurement@globaltraders.com',
      contact: '+971 4 223 9988',
      address: 'Baniyas Square, Deira',
      city: 'Dubai',
      stateProvince: 'Dubai',
      country: 'United Arab Emirates',
      telephone: '+971 4 223 9900',
      terms: 'Net 60 Days',
      website: 'https://www.globaltraders.ae',
      contactName: 'Zainab Bibi',
      bankCode: 'MUCB-AE',
      taxRegistrationCode: '100482910400003',
      startDate: '2024-03-20',
      inactiveDate: '',
      status: 'Active',
      tradeLicenseNumber: 'CN-2048192',
      tradeLicenseExpiry: '2026-11-15',
      vatTrn: '100482910400003',
      corporateTax: 'CT-773120',
      contacts: [
        { id: 1, name: 'Zainab Bibi', email: 'zainab@globaltraders.com', number: '+971 55 987 6543', designation: 'Procurement Specialist' }
      ],
      documents: [
        { id: 1, name: 'Trade License.pdf', type: 'Trade License', expiry: '2026-11-15' },
        { id: 2, name: 'VAT Registration.pdf', type: 'TRN Certificate', expiry: '2027-08-20' }
      ]
    },
    {
      vendorId: 'VEN-10039',
      vendorName: 'Tech Solutions FZ-LLC',
      email: 'contact@techsolutions.ae',
      contact: '+971 4 501 5555',
      address: 'Building A3, Dubai Silicon Oasis',
      city: 'Dubai',
      stateProvince: 'Dubai',
      country: 'United Arab Emirates',
      telephone: '+971 4 501 5500',
      terms: 'Immediate (COD)',
      website: 'https://www.techsolutions.ae',
      contactName: 'Salman Ahmed',
      bankCode: 'MEZN-AE',
      taxRegistrationCode: '100918237400003',
      startDate: '2024-06-10',
      inactiveDate: '',
      status: 'Active',
      tradeLicenseNumber: 'DSO-88231',
      tradeLicenseExpiry: '2027-02-28',
      vatTrn: '100918237400003',
      corporateTax: 'CT-334189',
      contacts: [
        { id: 1, name: 'Salman Ahmed', email: 'salman@techsolutions.ae', number: '+971 50 445 6677', designation: 'General Manager' }
      ],
      documents: [
        { id: 1, name: 'Freezone License.pdf', type: 'Trade License', expiry: '2027-02-28' }
      ]
    },
    {
      vendorId: 'VEN-10044',
      vendorName: 'Perfect Industrial Corporation',
      email: 'sales@perfectindustrial.ae',
      contact: '+971 4 340 8812',
      address: 'Plot 48, Al Quoz Industrial Area 3',
      city: 'Dubai',
      stateProvince: 'Dubai',
      country: 'United Arab Emirates',
      telephone: '+971 4 340 8800',
      terms: 'Net 45 Days',
      website: 'https://www.perfectindustrial.ae',
      contactName: 'Kamran Akram',
      bankCode: 'ABPA-AE',
      taxRegistrationCode: '100554433200003',
      startDate: '2023-11-01',
      inactiveDate: '',
      status: 'Active',
      tradeLicenseNumber: 'CN-339182',
      tradeLicenseExpiry: '2026-12-31',
      vatTrn: '100554433200003',
      corporateTax: 'CT-551029',
      contacts: [
        { id: 1, name: 'Kamran Akram', email: 'kamran@perfectindustrial.ae', number: '+971 50 778 9900', designation: 'Technical Director' }
      ],
      documents: [
        { id: 1, name: 'Commercial Trade License.pdf', type: 'Trade License', expiry: '2026-12-31' },
        { id: 2, name: 'ISO 9001 Quality Certificate.pdf', type: 'Quality Certification', expiry: '2028-05-15' }
      ]
    },
    {
      vendorId: 'VEN-10055',
      vendorName: 'Gulf Electrical Works LLC',
      email: 'info@gulfelectrical.ae',
      contact: '+971 6 543 2100',
      address: 'Industrial Area 10, PO Box 4521',
      city: 'Sharjah',
      stateProvince: 'Sharjah',
      country: 'United Arab Emirates',
      telephone: '+971 6 543 2111',
      terms: 'Net 30 Days',
      website: 'https://www.gulfelectrical.ae',
      contactName: 'Rashid Al-Nuaimi',
      bankCode: 'ENBD-AE',
      taxRegistrationCode: '100778899000003',
      startDate: '2024-02-01',
      inactiveDate: '',
      status: 'Active',
      tradeLicenseNumber: 'SHJ-44819',
      tradeLicenseExpiry: '2027-04-10',
      vatTrn: '100778899000003',
      corporateTax: 'CT-667104',
      contacts: [
        { id: 1, name: 'Rashid Al-Nuaimi', email: 'rashid@gulfelectrical.ae', number: '+971 50 665 4321', designation: 'Partner' }
      ],
      documents: [
        { id: 1, name: 'Sharjah Trade License.pdf', type: 'Trade License', expiry: '2027-04-10' }
      ]
    }
  ]);

  readonly logisticCosts = signal<LogisticCost[]>([
    { id: 'LC-001', reqNo: 'REQ-2024-001', itemNo: 'IC-1001', vendorName: 'ABC Supplies Pvt. Ltd.', type: 'Freight', currency: 'AED', amount: 850, remarks: 'Air cargo freight to Bay 4' },
    { id: 'LC-002', reqNo: 'REQ-2024-001', itemNo: 'IC-1001', vendorName: 'ABC Supplies Pvt. Ltd.', type: 'Insurance', currency: 'AED', amount: 320, remarks: 'Transit comprehensive coverage' },
    { id: 'LC-003', reqNo: 'REQ-2024-001', itemNo: 'IC-1001', vendorName: 'ABC Supplies Pvt. Ltd.', type: 'Other', currency: 'AED', amount: 250, remarks: 'Port clearance & handling' },
    { id: 'LC-004', reqNo: 'REQ-2024-001', itemNo: 'IC-1001', vendorName: 'Perfect Industrial', type: 'Freight', currency: 'AED', amount: 1100, remarks: 'Express transport' },
    { id: 'LC-005', reqNo: 'REQ-2024-001', itemNo: 'IC-1001', vendorName: 'Perfect Industrial', type: 'Insurance', currency: 'AED', amount: 400, remarks: 'Standard cargo insurance' },
    { id: 'LC-006', reqNo: 'REQ-2024-001', itemNo: 'IC-1002', vendorName: 'ABC Supplies Pvt. Ltd.', type: 'Freight', currency: 'AED', amount: 2400, remarks: 'Heavy equipment air cargo' },
    { id: 'LC-007', reqNo: 'REQ-2024-001', itemNo: 'IC-1002', vendorName: 'ABC Supplies Pvt. Ltd.', type: 'Insurance', currency: 'AED', amount: 650, remarks: 'Marine & transit insurance' },
    { id: 'LC-008', reqNo: 'REQ-2024-002', itemNo: 'IC-1006', vendorName: 'Global Traders LLC', type: 'Freight', currency: 'AED', amount: 1800, remarks: 'Sea shipment delivery to Abu Dhabi hub' }
  ]);

  readonly documentTypes = signal<DocumentTypeItem[]>([
    { id: 'dt-1', docId: 'DOC-01', docName: 'Trade License', expirable: true, group: false, mandatory: true },
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
    { id: 'br-5', brandId: 'BR-05', brandName: 'Eaton Power' }
  ]);

  readonly products = signal<ProductItem[]>([
    { id: 'prd-1', productId: 'PRD-01', productName: 'Medium Voltage Switchgear & Panels', category: 'Electrical' },
    { id: 'prd-2', productId: 'PRD-02', productName: 'Copper Wiring Harness 12mm', category: 'Cabling' },
    { id: 'prd-3', productId: 'PRD-03', productName: 'Air Circuit Breakers (ACB) 400V', category: 'Switchgear' },
    { id: 'prd-4', productId: 'PRD-04', productName: 'Oil Immersed Power Transformers', category: 'Transformers' },
    { id: 'prd-5', productId: 'PRD-05', productName: 'Industrial Relays & Auxiliaries', category: 'Control' }
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
    { id: 'des-5', desigId: 'DES-05', desigName: 'Managing Director', deptId: 'DEP-05', deptName: 'Executive Management' }
  ]);

  readonly legacyUsers = signal<LegacyUserItem[]>([
    {
      id: 'usr-1',
      userId: 'USR-1001',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      country: 'United Arab Emirates',
      city: 'Dubai',
      phoneNo: '+971 4 398 2210',
      cellNo: '+971 50 123 4567',
      department: 'Procurement & Sourcing',
      designation: 'Procurement Manager',
      email: 'sarah.jenkins@tamco.ae',
      securityGroup: 'Admin',
      status: 'Active'
    },
    {
      id: 'usr-2',
      userId: 'USR-1002',
      firstName: 'Rashid',
      lastName: 'Al-Nuaimi',
      country: 'United Arab Emirates',
      city: 'Dubai',
      phoneNo: '+971 4 398 2215',
      cellNo: '+971 52 987 6543',
      department: 'Accounts Payable & Finance',
      designation: 'Finance Controller',
      email: 'rashid.finance@tamco.ae',
      securityGroup: 'Finance',
      status: 'Active'
    },
    {
      id: 'usr-3',
      userId: 'USR-1003',
      firstName: 'Tariq',
      lastName: 'Mansoor',
      country: 'United Arab Emirates',
      city: 'Sharjah',
      phoneNo: '+971 6 554 1120',
      cellNo: '+971 55 456 7890',
      department: 'Procurement & Sourcing',
      designation: 'Senior Sourcing Buyer',
      email: 'tariq.buyer@tamco.ae',
      securityGroup: 'Procurement',
      status: 'Active'
    }
  ]);

  readonly emailConfig = signal<EmailSetupConfig>({
    host: 'smtp.office365.com',
    port: 587,
    username: 'procurement@tamco.ae',
    fromAddress: 'procurement@tamco.ae',
    ccAddress: 'cfo@tamco.ae'
  });

  readonly itemBidComparisons = signal<ItemBidComparison[]>([
    {
      reqNo: 'REQ-2024-001',
      itemNo: 'IC-1001',
      itemDesc: 'Copper Wiring Harness 12mm',
      qty: 250,
      deliveryDate: '2026-10-15',
      winningVendorId: 'VEN-10024',
      status: 'Approved',
      bids: [
        {
          vendorId: 'VEN-10024',
          vendorName: 'ABC Supplies Pvt. Ltd.',
          currency: 'USD',
          price: 14200,
          exchangeRateToAed: 3.6725,
          validityDate: '2026-10-10',
          deliveryDate: '2026-10-12',
          insuranceCost: 320,
          insuranceCurrency: 'AED',
          freightCost: 850,
          freightCurrency: 'AED',
          otherCost: 250,
          otherCurrency: 'AED',
          remarks: 'Includes manufacturer warranty & test certs',
          selected: true
        },
        {
          vendorId: 'VEN-10044',
          vendorName: 'Perfect Industrial',
          currency: 'USD',
          price: 15400,
          exchangeRateToAed: 3.6725,
          validityDate: '2026-10-14',
          deliveryDate: '2026-10-18',
          insuranceCost: 400,
          insuranceCurrency: 'AED',
          freightCost: 1100,
          freightCurrency: 'AED',
          otherCost: 300,
          otherCurrency: 'AED',
          remarks: 'Standard factory delivery',
          selected: false
        },
        {
          vendorId: 'VEN-10055',
          vendorName: 'Gulf Electrical Works LLC',
          currency: 'AED',
          price: 54900,
          exchangeRateToAed: 1.0,
          validityDate: '2026-10-08',
          deliveryDate: '2026-10-10',
          insuranceCost: 280,
          insuranceCurrency: 'AED',
          freightCost: 750,
          freightCurrency: 'AED',
          otherCost: 200,
          otherCurrency: 'AED',
          remarks: 'Local stock available immediately',
          selected: false
        }
      ]
    },
    {
      reqNo: 'REQ-2024-001',
      itemNo: 'IC-1002',
      itemDesc: 'Industrial Switchgear 400V',
      qty: 4,
      deliveryDate: '2026-10-15',
      winningVendorId: '',
      status: 'Pending',
      bids: [
        {
          vendorId: 'VEN-10024',
          vendorName: 'ABC Supplies Pvt. Ltd.',
          currency: 'USD',
          price: 37800,
          exchangeRateToAed: 3.6725,
          validityDate: '2026-10-12',
          deliveryDate: '2026-10-14',
          insuranceCost: 650,
          insuranceCurrency: 'AED',
          freightCost: 2400,
          freightCurrency: 'AED',
          otherCost: 500,
          otherCurrency: 'AED',
          remarks: 'Siemens certified panels',
          selected: false
        },
        {
          vendorId: 'VEN-10044',
          vendorName: 'Perfect Industrial',
          currency: 'USD',
          price: 39400,
          exchangeRateToAed: 3.6725,
          validityDate: '2026-10-15',
          deliveryDate: '2026-10-20',
          insuranceCost: 700,
          insuranceCurrency: 'AED',
          freightCost: 2600,
          freightCurrency: 'AED',
          otherCost: 450,
          otherCurrency: 'AED',
          remarks: 'ABB assembled switchgear',
          selected: false
        }
      ]
    },
    {
      reqNo: 'REQ-2024-002',
      itemNo: 'IC-1006',
      itemDesc: 'Hydraulic Pressure Valve',
      qty: 80,
      deliveryDate: '2026-10-30',
      winningVendorId: '',
      status: 'Pending',
      bids: [
        {
          vendorId: 'VEN-10031',
          vendorName: 'Global Traders LLC',
          currency: 'AED',
          price: 41000,
          exchangeRateToAed: 1.0,
          validityDate: '2026-10-25',
          deliveryDate: '2026-10-28',
          insuranceCost: 350,
          insuranceCurrency: 'AED',
          freightCost: 1800,
          freightCurrency: 'AED',
          otherCost: 200,
          otherCurrency: 'AED',
          remarks: 'Direct Bosch import',
          selected: false
        },
        {
          vendorId: 'VEN-10044',
          vendorName: 'Perfect Industrial',
          currency: 'USD',
          price: 11800,
          exchangeRateToAed: 3.6725,
          validityDate: '2026-10-28',
          deliveryDate: '2026-10-26',
          insuranceCost: 400,
          insuranceCurrency: 'AED',
          freightCost: 1950,
          freightCurrency: 'AED',
          otherCost: 250,
          otherCurrency: 'AED',
          remarks: 'German certified hydraulic valves',
          selected: false
        }
      ]
    }
  ]);

  readonly vendors = signal<Vendor[]>([
    { id: 'VEN-10024', name: 'ABC Supplies Pvt. Ltd.', location: 'Karachi', categories: ['Electrical', 'Safety Equipment'], procurementStatus: 'Approved', financeStatus: 'Approved', bank: 'Habib Bank Limited', rating: 4.8, onTime: 94, qcPass: 98 },
    { id: 'VEN-10031', name: 'Global Traders', location: 'Lahore', categories: ['Mechanical'], procurementStatus: 'Pending', financeStatus: 'Approved', bank: 'MCB Bank', rating: 4.2, onTime: 88, qcPass: 92 },
    { id: 'VEN-10039', name: 'Tech Solutions', location: 'Islamabad', categories: ['IT & Hardware'], procurementStatus: 'Approved', financeStatus: 'Pending', bank: 'Meezan Bank', rating: 4.6, onTime: 96, qcPass: 99 },
    { id: 'VEN-10044', name: 'Perfect Industrial', location: 'Karachi', categories: ['Mechanical', 'Raw Materials'], procurementStatus: 'Approved', financeStatus: 'Approved', bank: 'Bank Alfalah', rating: 4.5, onTime: 90, qcPass: 95 }
  ]);

  readonly bankRecords = signal<BankRecord[]>([
    { id: 'BNK-2026-011', vendorId: 'VEN-10024', vendorName: 'ABC Supplies Pvt. Ltd.', bankName: 'Habib Bank Limited', iban: 'PK36 HABB 0000 1234 5678 9012', accountTitle: 'ABC Supplies Pvt. Ltd.', branchCode: 'Korangi Main · 0892', verificationStatus: 'Approved', verifiedDate: '18 May 2026', notes: 'IBAN matched to SECP title' },
    { id: 'BNK-2026-012', vendorId: 'VEN-10031', vendorName: 'Global Traders', bankName: 'MCB Bank', iban: 'PK55 MUCB 0000 9988 7766 5544', accountTitle: 'Global Traders', branchCode: 'Gulberg · 0211', verificationStatus: 'Approved', verifiedDate: '16 May 2026', notes: 'Verified via bank certificate' },
    { id: 'BNK-2026-013', vendorId: 'VEN-10044', vendorName: 'Perfect Industrial', bankName: 'Bank Alfalah', iban: 'PK77 ABPA 0000 1122 3344 5566', accountTitle: 'Perfect Industrial', branchCode: 'SITE Karachi · 0308', verificationStatus: 'Approved', verifiedDate: '20 May 2026', notes: 'Title verified' },
    { id: 'BNK-2026-014', vendorId: 'VEN-10039', vendorName: 'Tech Solutions', bankName: 'Meezan Bank', iban: 'PK21 MEZN 0000 6677 8899 0011', accountTitle: 'Tech Solutions (Pvt) Ltd.', branchCode: 'Blue Area · 0155', verificationStatus: 'Pending', verifiedDate: '', notes: 'Awaiting original bank letter scan' }
  ]);

  readonly vendorRegistrationRequests = signal<VendorRegistrationReq[]>([
    {
      id: 'REQ-2024-001',
      vendorName: 'ABC Supplies Pvt. Ltd.',
      email: 'onboarding@abcsupplies.com',
      phone: '+971 50 123 4567',
      contactPerson: 'Tariq Mehmood',
      status: 'Profile Completed',
      createdAt: '2026-09-01 10:30'
    },
    {
      id: 'REQ-2024-002',
      vendorName: 'Global Traders',
      email: 'procurement@globaltraders.com',
      phone: '+971 55 987 6543',
      contactPerson: 'Zainab Bibi',
      status: 'Profile Completed',
      createdAt: '2026-09-05 14:15'
    },
    {
      id: 'REQ-2024-003',
      vendorName: 'Tech Solutions',
      email: 'vendor-contact@techsolutions.pk',
      phone: '+92 300 1234567',
      contactPerson: 'Salman Ahmed',
      status: 'Email Sent',
      createdAt: '2026-09-15 09:20',
      tempPassword: '8492Xy'
    },
    {
      id: 'REQ-2024-004',
      vendorName: 'Gulf Electrical Works LLC',
      email: 'info@gulfelectrical.ae',
      phone: '+971 4 234 5678',
      contactPerson: 'Rashid Al-Nuaimi',
      status: 'Email Sent',
      createdAt: '2026-09-20 16:45',
      tempPassword: '3190Ab'
    }
  ]);

  readonly requisitions = signal<Requisition[]>([
    {
      header: {
        documentNumber: 'REQ-2024-001',
        requiredFor: 'Job In Hand',
        enteredBy: 'Procurement Officer',
        date: '2026-09-18',
        dateRequired: '2026-10-15',
        shipVia: 'By Air',
        location: 'Dubai HQ - Main Warehouse',
        requestDescription: 'Urgent electrical switchgear and panel accessories for Terminal Expansion.',
        comments: 'Deliver directly to Bay 4 with QC certificates.',
        status: 'Approved'
      },
      items: [
        {
          sr: 1,
          itemNo: 'IC-1001',
          itemDesc: 'Copper Wiring Harness 12mm',
          uom: 'MTR',
          quantity: 250,
          location: 'Dubai HQ - Main Warehouse',
          projectId: 'PRJ-DXB-01',
          incoTerm: 'DDP - Delivered Duty Paid',
          shipVia: 'By Air',
          brand: 'Schneider Electric',
          country: 'Germany',
          dateRequired: '2026-10-15',
          comments: 'High heat resistant'
        },
        {
          sr: 2,
          itemNo: 'IC-1002',
          itemDesc: 'Industrial Switchgear 400V',
          uom: 'SET',
          quantity: 4,
          location: 'Dubai HQ - Main Warehouse',
          projectId: 'PRJ-DXB-01',
          incoTerm: 'CIP - Carriage and Insurance Paid To',
          shipVia: 'By Air',
          brand: 'Siemens',
          country: 'Germany',
          dateRequired: '2026-10-15',
          comments: 'Factory tested'
        }
      ]
    },
    {
      header: {
        documentNumber: 'REQ-2024-002',
        requiredFor: 'Inventory',
        enteredBy: 'Procurement Officer',
        date: '2026-09-22',
        dateRequired: '2026-10-30',
        shipVia: 'By Sea',
        location: 'Abu Dhabi Logistics Hub',
        requestDescription: 'Standard quarterly replenishment for hydraulic valves and safety gear.',
        comments: 'Routine inventory restock.',
        status: 'Submitted'
      },
      items: [
        {
          sr: 1,
          itemNo: 'IC-1006',
          itemDesc: 'Hydraulic Pressure Valve',
          uom: 'PCS',
          quantity: 80,
          location: 'Abu Dhabi Logistics Hub',
          projectId: 'PRJ-AUH-04',
          incoTerm: 'FOB - Free on Board',
          shipVia: 'By Sea',
          brand: 'Bosch Industrial',
          country: 'Germany',
          dateRequired: '2026-10-30',
          comments: 'Batch inspection required'
        }
      ]
    }
  ]);

  readonly rfqs = signal<Rfq[]>([
    { id: 'RFQ-0061', title: 'Electrical Panels', category: 'Electrical', requiredDate: '2026-09-10', closeDate: '2026-08-26', status: 'Open', bids: [
      { vendorId: 'VEN-10024', vendor: 'ABC Supplies Pvt. Ltd.', price: 52000, location: 'Karachi', deliveryDays: 8, historyScore: 94, submitted: true },
      { vendorId: 'VEN-10044', vendor: 'Perfect Industrial', price: 54800, location: 'Karachi', deliveryDays: 6, historyScore: 91, submitted: true }
    ]},
    { id: 'RFQ-0060', title: 'Safety Equipment', category: 'Safety Equipment', requiredDate: '2026-09-02', closeDate: '2026-08-23', status: 'Open', bids: [
      { vendorId: 'VEN-10024', vendor: 'ABC Supplies Pvt. Ltd.', price: 18600, location: 'Karachi', deliveryDays: 5, historyScore: 96, submitted: true }
    ]},
    { id: 'RFQ-0059', title: 'Mechanical Parts', category: 'Mechanical', requiredDate: '2026-08-30', closeDate: '2026-08-15', status: 'Evaluating', bids: [
      { vendorId: 'VEN-10031', vendor: 'Global Traders', price: 41000, location: 'Lahore', deliveryDays: 9, historyScore: 83, submitted: true },
      { vendorId: 'VEN-10044', vendor: 'Perfect Industrial', price: 43800, location: 'Karachi', deliveryDays: 6, historyScore: 91, submitted: true }
    ]}
  ]);

  readonly purchaseOrders = signal<PurchaseOrder[]>([
    { id: 'PO-002345', vendor: 'ABC Supplies Pvt. Ltd.', category: 'Electrical', amount: 52000, requiredDate: '2026-08-25', arrivalDate: '2026-08-27', approval: 'Pending', grn: 'Pending', qc: 'Pending' },
    { id: 'PO-002334', vendor: 'ABC Supplies Pvt. Ltd.', category: 'Safety Equipment', amount: 18600, requiredDate: '2026-08-22', arrivalDate: '2026-08-22', approval: 'Approved', grn: 'Passed', qc: 'Passed' },
    { id: 'PO-002321', vendor: 'Perfect Industrial', category: 'Mechanical', amount: 43800, requiredDate: '2026-08-19', arrivalDate: '2026-08-21', approval: 'Approved', grn: 'Passed', qc: 'Pending' }
  ]);

  readonly invoices = signal<Invoice[]>([
    { id: 'INV-00245', poId: 'PO-002334', vendor: 'ABC Supplies Pvt. Ltd.', amount: 18600, status: 'Pending', match: 'Matched' },
    { id: 'INV-00246', poId: 'PO-002301', vendor: 'Global Traders', amount: 8750, status: 'Approved', match: 'Matched' },
    { id: 'INV-00247', poId: 'PO-002299', vendor: 'Tech Solutions', amount: 12900, status: 'Rejected', match: 'Mismatch' }
  ]);

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
          password: `${accountOrRole}123`,
          role: accountOrRole,
          name: accountOrRole.toUpperCase(),
          organization: 'TAMCO Portal',
          initials: accountOrRole.substring(0, 2).toUpperCase(),
          badge: accountOrRole
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
      this.setVendorStatusCode(code);
    }

    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem('tamco_portal_auth', JSON.stringify(account));
        sessionStorage.setItem('tamco_jwt_token', `DEMO_TOKEN_${account.role}_${account.username}`);
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

  setVendorStatusCode(code: number): void {
    this.vendorStatusCode.set(code);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem('tamco_vendor_status', code.toString());
      }
    } catch {}

    const descriptions: Record<number, string> = {
      0: 'Status 0: Incomplete Registration Wizard (VendorsStepByStep2)',
      1: 'Status 1: Wizard Review Mode (showReview=true)',
      2: 'Status 2: Pending Approval & Signed Form (ReviewForm.cshtml)',
      3: 'Status 3: Sage 300 ERP Active Certified Partner (Home/Dashboard)'
    };
    this.notify(descriptions[code] || `Vendor Status set to ${code}`);
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
    this.rfqs.update(items => items.map(r => {
      if (r.id !== rfqId) return r;
      const existing = r.bids.some(b => b.vendorId === 'VEN-10024');
      const bid: Bid = { vendorId: 'VEN-10024', vendor: 'ABC Supplies Pvt. Ltd.', price, location: 'Karachi', deliveryDays, historyScore: 94, submitted: true };
      return { ...r, bids: existing ? r.bids.map(b => b.vendorId === 'VEN-10024' ? bid : b) : [...r.bids, bid] };
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
    const invoice: Invoice = { id: `INV-${Math.floor(30000 + Math.random() * 5000)}`, poId, vendor: po.vendor, amount, status: 'Pending', match: amount === po.amount ? 'Matched' : 'Mismatch' };
    this.invoices.update(items => [invoice, ...items.filter(x => x.poId !== poId)]);
    this.notify(`Invoice uploaded for ${poId}; 3-way match ${invoice.match.toLowerCase()}.`);
  }

  approveInvoice(id: string): void {
    this.invoices.update(items => items.map(inv => inv.id === id && inv.match === 'Matched' ? { ...inv, status: 'Approved' } : inv));
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

  saveRequisition(req: Requisition): Requisition {
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
    this.notify(`Requisition ${docNo} submitted successfully!`);
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

