import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface VREGModel {
  coperation?: number;
  reqno?: string;
  vendoR_NAME?: string;
  address?: string;
  city?: string;
  country?: string;
  email?: string;
  tel?: string;
  tlnum?: string;
  taxnum?: string;
  password?: string;
  businesstype?: string;
  yearbus?: string | number;
  incorplace?: string;
  companystatus?: string;
  zipcode?: string;
  faxnumber?: string;
  website?: string;
  isactive?: number;
  tL_EXPIRY?: string;
  corP_TAX?: string;
  auduser?: string;
  [key: string]: any;
}

export interface VCURRENCYModel {
  coperation?: number;
  reqno?: string;
  currencY_ID?: string;
  vendoR_NAME?: string;
  currencY_NAME?: string;
  bydefault?: boolean | number | string;
  isactive?: number;
  linenum?: number;
  [key: string]: any;
}

export interface MajorProductsModel {
  coperation?: number;
  producT_CODE?: string;
  producT_DESCRIPTION?: string;
  active?: number;
  audtdate?: string;
  audtuser?: string;
  [key: string]: any;
}

export interface MAJORCUSTOMERModel {
  coperation?: number;
  reqno?: string;
  majcusname?: string;
  majcontactname?: string;
  majcontact?: string;
  majcity?: string;
  majcountry?: string;
  dealingyears?: string | number;
  linenum?: number;
  isactive?: number;
  [key: string]: any;
}

export interface VCTCPModel {
  coperation?: number;
  reqno?: string;
  peR_NAME?: string;
  peR_DEPART?: string;
  peR_DESIG?: string;
  peR_EMAIL?: string;
  peR_MOBILE?: string;
  perofcadress?: string;
  country?: string;
  city?: string;
  whatsappno?: string;
  ladnlineno?: string;
  ext?: string;
  faxno?: string;
  peR_DEFAULT?: boolean | number | string;
  linenum?: number;
  isactive?: number;
  [key: string]: any;
}

export interface VDOCSModel {
  coperation?: number;
  reqno?: string;
  doC_NAME?: string;
  filename?: string;
  url?: string;
  expdate?: string;
  docdate?: string;
  exP_FLAG?: boolean | number | string;
  linenum?: number;
  isactive?: number;
  [key: string]: any;
}

export interface VBANKModel {
  coperation?: number;
  reqno?: string;
  banK_NAME?: string;
  vendoR_NAME?: string;
  country?: string;
  titlE_ACC?: string;
  accounT_IBAN?: string;
  accounT_NO?: string;
  currency?: string;
  swifT_CODE?: string;
  sorT_CODE?: string;
  banK_CERTIFICATE?: string;
  filE_NAME?: string;
  issuedate?: string;
  linenum?: number;
  status?: string;
  [key: string]: any;
}

export interface BANKVALIDATIONModel {
  coperation?: number;
  reqno?: string;
  vendoR_NAME?: string;
  bankname?: string;
  issueD_BY?: string;
  designation?: string;
  letteR_REF_NO?: string;
  letteR_DATE?: string;
  sourcE_REC?: string;
  doC_MODE?: string;
  remarks?: string;
  status?: string;
  letteR_DOC?: string;
  auddate?: string;
  auduser?: string;
  action?: number;
  [key: string]: any;
}

export interface VENDORVALIDATIONModel {
  coperation?: number;
  reqno?: string;
  vendoR_NAME?: string;
  type?: number;
  description?: string;
  bankname?: string;
  sendby?: string;
  date?: string;
  s_DESIGNATION?: string;
  teL_NO?: string;
  semail?: string;
  reC_DATE?: string;
  reC_BY?: string;
  reC_TEL_NO?: string;
  remail?: string;
  r_DESIGNATION?: string;
  faX_NO?: string;
  meeT_PLACE?: string;
  vendoR_STAFF?: string;
  remark?: string;
  status?: string;
  action?: number;
  upload?: string;
  auddate?: string;
  auduser?: string;
  time?: string;
  reC_TIME?: string;
  notes?: string;
  [key: string]: any;
}

export interface ACTIVEModel {
  coperation?: number;
  reqno?: string;
  isactivE1?: number;
  isactivE2?: number;
  isactivE3?: number;
  isactivE4?: number;
  isactivE5?: number;
  isactivE6?: number;
  isactivE7?: number;
  auddate?: string;
  auduser?: string;
  [key: string]: any;
}

export interface COUNTRIBANModel {
  coperation?: number;
  countrY_ID?: number;
  countrY_NAME?: string;
  ibaN_LENGTH?: number;
  [key: string]: any;
}

export interface USERModel {
  coperation?: number;
  userid?: string;
  userpwd?: string;
  fname?: string;
  lname?: string;
  email?: string;
  contactno?: string;
  gender?: string;
  city?: string;
  country?: string;
  deptid?: string;
  desid?: string;
  picture?: string;
  passchange?: string;
  isactive?: number;
  securitygroup?: string;
  phone?: string;
  audtdate?: string;
  audtuser?: string;
  [key: string]: any;
}

export interface ROLEModel {
  coperation?: number;
  rolE_ID?: number;
  rolename?: string;
  roleshortname?: string;
  roleisactive?: number;
  isdicountallowed?: number;
  israteallowed?: number;
  issalestypeallowed?: number;
  iswarehouseallowed?: number;
  istransactionmodeallowed?: number;
  isquantityallowed?: number;
  isexitallowed?: number;
  createdby?: string;
  createddatetime?: string;
  editedby?: string;
  editeddatetime?: string;
  [key: string]: any;
}

export interface SECURITYOPTIONSModel {
  coperation?: number;
  uM_OPTION_ID?: string;
  modulemastid?: string;
  moduleid?: number;
  useR_ALLOWED?: string;
  uM_OPTION_NAME?: string;
  uM_ROLE_CODE?: string;
  uM_OPTION_ORDER?: number;
  uM_OPTION_ACTIVE?: number;
  smflag?: number;
  optioN_ALLOWED?: number;
  audtdate?: string;
  audtuser?: string;
  [key: string]: any;
}

export interface CSMODULEModel {
  coperation?: number;
  moduleid?: number;
  modulename?: string;
  moduleshortname?: string;
  isactive?: number;
  [key: string]: any;
}

export interface DEPARTMENTModel {
  coperation?: number;
  deP_ID?: string;
  deP_NAME?: string;
  auduser?: string;
  auddate?: string;
  [key: string]: any;
}

export interface DESIGNATIONModel {
  coperation?: number;
  deS_ID?: string;
  deS_NAME?: string;
  deP_ID?: string;
  deP_NAME?: string;
  auduser?: string;
  auddate?: string;
  [key: string]: any;
}

export interface REQHModel {
  coperation?: number;
  reQ_NO?: string;
  reQ_FOR?: string;
  reQ_ENTER_BY?: string;
  reQ_DATE?: string;
  requirE_DATE?: string;
  loc?: string;
  shipvia?: string;
  reQ_DESC?: string;
  comments?: string;
  auduser?: string;
  auddate?: string;
  action?: number;
  [key: string]: any;
}

export interface REQDModel {
  coperation?: number;
  reQ_NO?: string;
  linenum?: number;
  itemno?: string;
  itemdesc?: string;
  uom?: string;
  qty?: number;
  project?: number | string | null;
  loc?: string;
  incoterm?: string;
  shipvia?: string;
  requiR_DATE?: string;
  comments?: string;
  brand?: string;
  mcountry?: string;
  auddate?: string;
  auduser?: string;
  action?: number;
  [key: string]: any;
}

export interface REVBIDModel {
  coperation?: number;
  reqno?: string;
  audtdate?: string;
  audtuser?: string;
  vendorid?: string;
  vendorname?: string;
  iteM_NO?: string;
  iteM_DESC?: string;
  uom?: string;
  price?: number;
  location?: string;
  comments?: string;
  validitY_DATE?: string;
  incoterm?: string;
  reqdate?: string;
  reqdesc?: string;
  action?: number;
  shipvia?: string;
  currency?: string;
  qty?: number;
  date?: string;
  cost?: number;
  [key: string]: any;
}

export interface PCOMPAREModel {
  coperation?: number;
  vendorid?: string;
  reqno?: string;
  itemnum?: string;
  type?: string;
  linenum?: number;
  vendoR_NAME?: string;
  currency?: string;
  qty?: number;
  price?: number | string;
  vat?: number | string;
  cost?: number | string;
  acosttotal?: number;
  total?: number;
  isactive?: number;
  action?: number;
  audtdate?: string;
  audtuser?: string;
  famount?: number | string;
  [key: string]: any;
}

export interface READDCOSTModel {
  coperation?: number;
  reQ_NO?: string;
  vendoR_ID?: string;
  type?: string;
  vendorname?: string;
  linenum?: number;
  itemnum?: string;
  vendoR_DES?: string;
  currency?: string;
  scurrency?: string;
  famount?: number | string;
  samount?: number | string;
  remarks?: string;
  audtdate?: string;
  audtuser?: string;
  [key: string]: any;
}

export interface WORKFLOWModel {
  coperation?: number;
  stepid?: number;
  action?: string;
  apsid?: number;
  apsentto?: string;
  apsuser?: string;
  apemail?: string;
  rjsid?: number;
  rjsentto?: string;
  rjsuser?: string;
  rjemail?: string;
  active?: number;
  auduser?: string;
  auddate?: string;
  [key: string]: any;
}

export interface ASDOCNUMModel {
  coperation?: number;
  module?: string;
  prefix?: string;
  number?: number;
  length?: string;
  audtuser?: string;
  audtdate?: string;
  [key: string]: any;
}

export interface CSDoctypeModel {
  coperation?: number;
  clienT_CODE?: string;
  companY_CODE?: string;
  doC_TYPECODE?: string;
  doC_TYPEDESC?: string;
  docdate?: string;
  expireablE_FLAG?: number;
  doC_TYPEGROUP?: string;
  expireablE_DATE?: string;
  mandatory?: number;
  audtdate?: string;
  audtuser?: string;
  [key: string]: any;
}

export interface REVITEMSModel {
  coperation?: number;
  reQ_NO?: string;
  linenum?: number;
  vendoR_ID?: string;
  vendoR_NAME?: string;
  itemno?: string;
  itemdesc?: string;
  qty?: number;
  auddate?: string;
  date?: string;
  auduser?: string;
  action?: number;
  [key: string]: any;
}

export interface SHIPVIAModel {
  coperation?: number;
  shipviA_CODE?: string;
  shipviA_NAME?: string;
  auduser?: string;
  auddate?: string;
  [key: string]: any;
}

export interface UAEBANKSModel {
  coperation?: number;
  banK_ID?: string;
  banK_NAME?: string;
  auduser?: string;
  auddate?: string;
  isactive?: number;
  [key: string]: any;
}

export interface CurrenyModel {
  coperation?: number;
  clientcode?: string;
  companycode?: string;
  branchcode?: string;
  currencyid?: string;
  currencyname?: string;
  symbol?: string;
  audtdate?: string;
  audtuser?: string;
  [key: string]: any;
}

export interface GeneralBankModel {
  coperation?: number;
  banK_ID?: string;
  brancH_CODE?: string;
  banK_CODE?: string;
  banK_NAME?: string;
  citY_NAME?: string;
  statE_NAME?: string;
  countrY_NAME?: string;
  currency?: string;
  audtdate?: string;
  audtuser?: string;
  [key: string]: any;
}

export interface VREGMPModel {
  coperation?: number;
  reqno?: string;
  linenum?: number;
  majorproduct?: string;
  vendoR_NAME?: string;
  description?: string;
  brands?: string;
  isactive?: number;
  auddate?: string;
  auduser?: string;
  [key: string]: any;
}

export interface EMAILModel {
  coperation?: number;
  emailhost?: string;
  emailport?: string;
  emailusername?: string;
  emailpass?: string;
  emailfromaddress?: string;
  emailccaddress?: string;
  testemail?: string;
  [key: string]: any;
}

export interface ASTYPEModel {
  coperation?: number;
  tid?: string;
  tname?: string;
  auduser?: string;
  auddate?: string;
  [key: string]: any;
}

export interface REQCURACTModel {
  coperation?: number;
  reQ_NO?: string;
  action?: number;
  currenT_ACTION?: string;
  startdate?: string;
  enddate?: string;
  isfinal?: number;
  auduser?: string;
  auddate?: string;
  [key: string]: any;
}

export interface REQLOGModel {
  coperation?: number;
  reQ_NO?: string;
  linenum?: number;
  auddate?: string;
  auduser?: string;
  action?: number;
  currentaction?: string;
  [key: string]: any;
}

export interface REVCURACTModel {
  coperation?: string | number;
  vendoR_ID?: string;
  reQ_NO?: string;
  vendoR_NAME?: string;
  auddate?: string;
  auduser?: string;
  action?: number;
  currentaction?: string;
  expirydate?: string;
  startdate?: string;
  enddate?: string;
  isfinal?: number;
  [key: string]: any;
}

export interface VCURACTACTIONModel {
  coperation?: number;
  vendoR_ID?: string;
  reqno?: string;
  clienT_CODE?: number;
  companY_CODE?: number;
  vendoR_NAME?: string;
  audtdate?: string;
  audtuser?: string;
  action?: number;
  currentaction?: string;
  expirydate?: string;
  startdate?: string;
  enddate?: string;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class VendorApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/Vendor`;
  private readonly mgmtUrl = `${environment.apiUrl}/api/Management`;
  private readonly reqUrl = `${environment.apiUrl}/api/Request`;

  // ==========================================
  // STEP 1: Basic Information & Registration
  // ==========================================

  getVendorRegistration(reqno?: string): Observable<any> {
    const body = { coperation: 1, reqno: reqno || '' };
    return this.http.post(`${this.baseUrl}/GetVendorRegistrationList`, body).pipe(
      catchError(err => {
        console.warn('GetVendorRegistrationList fallback:', err);
        return of({ data: null, message: err?.message });
      })
    );
  }

  saveVendorRegistration(data: Partial<VREGModel>, op: number = 2): Observable<any> {
    const body: VREGModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.baseUrl}/AUDVendorRegistration`, body);
  }

  getVendorBasicInfo(reqno?: string): Observable<any> {
    const body = { coperation: 1, reQ_NO: reqno || '' };
    return this.http.post(`${this.baseUrl}/GetVendorBIList`, body).pipe(
      catchError(err => {
        console.warn('GetVendorBIList fallback:', err);
        return of({ data: null, message: err?.message });
      })
    );
  }

  saveVendorBasicInfo(data: any, op: number = 2): Observable<any> {
    const body = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.baseUrl}/AUDVendorBIDetails`, body);
  }

  // ==========================================
  // STEP 2: Currencies
  // ==========================================

  getVendorCurrencies(reqno?: string): Observable<any> {
    const body = { coperation: 1, reqno: reqno || '' };
    return this.http.post(`${this.baseUrl}/GetVendorCurrencyList`, body).pipe(
      catchError(err => {
        console.warn('GetVendorCurrencyList fallback:', err);
        return of({ data: [], message: err?.message });
      })
    );
  }

  saveVendorCurrency(data: Partial<VCURRENCYModel>, op: number = 2): Observable<any> {
    const body: VCURRENCYModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.baseUrl}/AUDVendorCurrency`, body);
  }

  // ==========================================
  // STEP 3 & 4: Products & Categories
  // ==========================================

  getMajorProducts(reqno?: string): Observable<any> {
    const body = { coperation: 1, producT_CODE: reqno || '' };
    return this.http.post(`${this.baseUrl}/GetVMajorProductList`, body).pipe(
      catchError(err => {
        console.warn('GetVMajorProductList fallback:', err);
        return of({ data: [], message: err?.message });
      })
    );
  }

  saveMajorProduct(data: Partial<MajorProductsModel>, op: number = 2): Observable<any> {
    const body: MajorProductsModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.baseUrl}/AUDVMajorProductsDetails`, body);
  }

  // ==========================================
  // STEP 5: Major Customers / References
  // ==========================================

  getMajorCustomers(reqno?: string): Observable<any> {
    const body = { coperation: 1, reqno: reqno || '' };
    return this.http.post(`${this.baseUrl}/GetVMAJCUSTOMERList`, body).pipe(
      catchError(err => {
        console.warn('GetVMAJCUSTOMERList fallback:', err);
        return of({ data: [], message: err?.message });
      })
    );
  }

  saveMajorCustomer(data: Partial<MAJORCUSTOMERModel>, op: number = 2): Observable<any> {
    const body: MAJORCUSTOMERModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.baseUrl}/AUDMAJCUSTOMERS`, body);
  }

  // ==========================================
  // STEP 6: Contact Persons
  // ==========================================

  getVendorContacts(reqno?: string): Observable<any> {
    const body = { coperation: 1, reqno: reqno || '' };
    return this.http.post(`${this.baseUrl}/GetVendorContactsList`, body).pipe(
      catchError(err => {
        console.warn('GetVendorContactsList fallback:', err);
        return of({ data: [], message: err?.message });
      })
    );
  }

  saveVendorContact(data: Partial<VCTCPModel>, op: number = 2): Observable<any> {
    const body: VCTCPModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.baseUrl}/AUDVendorContacts`, body);
  }

  // ==========================================
  // STEP 7: Document Attachments
  // ==========================================

  getVendorDocuments(reqno?: string): Observable<any> {
    const body = { coperation: 1, reqno: reqno || '' };
    return this.http.post(`${this.baseUrl}/GetVendorDocumentList`, body).pipe(
      catchError(err => {
        console.warn('GetVendorDocumentList fallback:', err);
        return of({ data: [], message: err?.message });
      })
    );
  }

  saveVendorDocument(data: Partial<VDOCSModel>, op: number = 2): Observable<any> {
    const body: VDOCSModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.baseUrl}/AUDVendorDocument`, body);
  }

  // ==========================================
  // STEP 8: Bank Accounts & IBAN
  // ==========================================

  getVendorBanks(reqno?: string): Observable<any> {
    const body = { coperation: 1, reqno: reqno || '' };
    return this.http.post(`${this.baseUrl}/GetVendorBankList`, body).pipe(
      catchError(err => {
        console.warn('GetVendorBankList fallback:', err);
        return of({ data: [], message: err?.message });
      })
    );
  }

  saveVendorBank(data: Partial<VBANKModel>, op: number = 2): Observable<any> {
    const body: VBANKModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.baseUrl}/AUDVendorBank`, body);
  }

  // ==========================================
  // MASTER DATA LOOKUPS (Management Controller)
  // ==========================================

  getCountries(): Observable<any> {
    return this.http.post(`${this.mgmtUrl}/GetCOUNTRYList`, { coperation: 1 }).pipe(
      catchError(() => of([]))
    );
  }

  getCities(): Observable<any> {
    return this.http.post(`${this.mgmtUrl}/GetCITYList`, { coperation: 1 }).pipe(
      catchError(() => of([]))
    );
  }

  getCurrencies(): Observable<any> {
    return this.http.post(`${this.mgmtUrl}/GetCURRENCYList`, { coperation: 1 }).pipe(
      catchError(() => of([]))
    );
  }

  getUaeBanks(): Observable<any> {
    return this.http.post(`${this.mgmtUrl}/GetUAEBANKSList`, { coperation: 1 }).pipe(
      catchError(() => of([]))
    );
  }

  getBrands(): Observable<any> {
    return this.http.post(`${this.mgmtUrl}/GetBRANDList`, { coperation: 1 }).pipe(
      catchError(() => of([]))
    );
  }

  getShipViaList(): Observable<any> {
    return this.http.post(`${this.mgmtUrl}/GetSHIPVIAList`, { coperation: 1 }).pipe(
      catchError(() => of([]))
    );
  }

  saveBrand(data: any, op: number = 2): Observable<any> {
    const body = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.mgmtUrl}/AUDBRAND`, body);
  }

  // ==========================================
  // VENDOR VALIDATION & APPROVAL (Procurement)
  // ==========================================

  getVendorValidations(reqno?: string): Observable<any> {
    const body = { coperation: 1, reqno: reqno || '' };
    return this.http.post(`${this.baseUrl}/GetVENDORVALIDATIONList`, body).pipe(
      catchError(err => {
        console.warn('GetVENDORVALIDATIONList fallback:', err);
        return of({ data: [], message: err?.message });
      })
    );
  }

  saveVendorValidation(data: Partial<VENDORVALIDATIONModel>, op: number = 2): Observable<any> {
    const body: VENDORVALIDATIONModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.baseUrl}/AUDVENDORVALIDATION`, body);
  }

  // ==========================================
  // BANK VALIDATION & VERIFICATION (Finance)
  // ==========================================

  getBankValidations(reqno?: string): Observable<any> {
    const body = { coperation: 1, reqno: reqno || '' };
    return this.http.post(`${this.baseUrl}/GetBANKVALIDATIONList`, body).pipe(
      catchError(err => {
        console.warn('GetBANKVALIDATIONList fallback:', err);
        return of({ data: [], message: err?.message });
      })
    );
  }

  saveBankValidation(data: Partial<BANKVALIDATIONModel>, op: number = 2): Observable<any> {
    const body: BANKVALIDATIONModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.baseUrl}/AUBANKVALIDATION`, body);
  }

  // ==========================================
  // ACTIVE VENDORS & COUNTRY IBAN LISTS
  // ==========================================

  getActiveVendors(reqno?: string): Observable<any> {
    const body = { coperation: 1, reqno: reqno || '' };
    return this.http.post(`${this.baseUrl}/GetACTIVEList`, body).pipe(
      catchError(err => {
        console.warn('GetACTIVEList fallback:', err);
        return of({ data: [], message: err?.message });
      })
    );
  }

  getCountryIbans(): Observable<any> {
    return this.http.post(`${this.baseUrl}/GetCOUNTRYIBANList`, { coperation: 1 }).pipe(
      catchError(err => {
        console.warn('GetCOUNTRYIBANList fallback:', err);
        return of({ data: [], message: err?.message });
      })
    );
  }

  getAllVendorRegistrations(): Observable<any> {
    return this.http.post(`${this.baseUrl}/GetVendorRegistrationList`, { coperation: 1, reqno: '' }).pipe(
      catchError(err => {
        console.warn('GetAllVendorRegistrationList fallback:', err);
        return of({ data: [], message: err?.message });
      })
    );
  }

  getAllVendorBanks(): Observable<any> {
    return this.http.post(`${this.baseUrl}/GetVendorBankList`, { coperation: 1, reqno: '' }).pipe(
      catchError(err => {
        console.warn('GetAllVendorBankList fallback:', err);
        return of({ data: [], message: err?.message });
      })
    );
  }

  // ==========================================
  // USER MANAGEMENT & SECURITY ROLES (Management)
  // ==========================================

  getUsers(userid?: string): Observable<any> {
    const body = { coperation: 1, userid: userid || '' };
    return this.http.post(`${this.mgmtUrl}/GetUSERList`, body).pipe(
      catchError(err => {
        console.warn('GetUSERList fallback:', err);
        return of({ data: [], message: err?.message });
      })
    );
  }

  saveUser(data: Partial<USERModel>, op: number = 2): Observable<any> {
    const pwd = data.userpwd || (data as any).password;
    const body: any = {
      coperation: op,
      ...data,
      userpwd: pwd,
      password: pwd
    };
    return this.http.post(`${this.mgmtUrl}/AUDUSER`, body);
  }

  deleteUser(userid: string): Observable<any> {
    const body: USERModel = {
      coperation: 4,
      userid
    };
    return this.http.post(`${this.mgmtUrl}/AUDUSER`, body);
  }

  getRoles(): Observable<any> {
    return this.http.post(`${this.mgmtUrl}/GetROLEList`, { coperation: 1 }).pipe(
      catchError(err => {
        console.warn('GetROLEList fallback:', err);
        return of({ data: [], message: err?.message });
      })
    );
  }

  saveRole(data: Partial<ROLEModel>, op: number = 2): Observable<any> {
    const body: ROLEModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.mgmtUrl}/AUDROLE`, body);
  }

  deleteRole(roleId: number | string): Observable<any> {
    const body: Partial<ROLEModel> = {
      coperation: 4,
      rolE_ID: Number(roleId)
    };
    return this.http.post(`${this.mgmtUrl}/AUDROLE`, body);
  }

  getSecurityOptions(roleCode?: string | number): Observable<any> {
    const body: Partial<SECURITYOPTIONSModel> = {
      coperation: 1,
      uM_ROLE_CODE: roleCode !== undefined && roleCode !== null ? String(roleCode) : ''
    };
    return this.http.post(`${this.mgmtUrl}/GetSECURITYOPTIONSList`, body).pipe(
      catchError(err => {
        console.warn('GetSECURITYOPTIONSList fallback:', err);
        return of({ data: [], message: err?.message });
      })
    );
  }

  saveSecurityOption(data: Partial<SECURITYOPTIONSModel>, op: number = 2): Observable<any> {
    const body: SECURITYOPTIONSModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.mgmtUrl}/AUDSECURITYOPTIONS`, body);
  }

  getModules(): Observable<any> {
    return this.http.post(`${this.mgmtUrl}/GetCSMODULEList`, { coperation: 1 }).pipe(
      catchError(err => {
        console.warn('GetCSMODULEList fallback:', err);
        return of({ data: [], message: err?.message });
      })
    );
  }

  getDepartments(): Observable<any> {
    return this.http.post(`${this.mgmtUrl}/GetDEPARTMENTList`, { coperation: 1 }).pipe(
      catchError(err => {
        console.warn('GetDEPARTMENTList fallback:', err);
        return of({ data: [], message: err?.message });
      })
    );
  }

  saveDepartment(data: Partial<DEPARTMENTModel>, op: number = 2): Observable<any> {
    const body: DEPARTMENTModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.mgmtUrl}/AUDDEPARTMENT`, body);
  }

  getDesignations(deptId?: string): Observable<any> {
    const body = { coperation: 1, deP_ID: deptId || '' };
    return this.http.post(`${this.mgmtUrl}/GetDESIGNATIONList`, body).pipe(
      catchError(err => {
        console.warn('GetDESIGNATIONList fallback:', err);
        return of({ data: [], message: err?.message });
      })
    );
  }

  saveDesignation(data: Partial<DESIGNATIONModel>, op: number = 2): Observable<any> {
    const body: DESIGNATIONModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.mgmtUrl}/AUDDESIGNATION`, body);
  }

  // ==========================================
  // REQUISITIONS & LINE ITEMS (Request Controller)
  // ==========================================

  getRequestHeaders(reqno?: string): Observable<any> {
    const body = { coperation: 1, reQ_NO: reqno || '', reqno: reqno || '' };
    return this.http.post(`${this.reqUrl}/GetRequestHeaderList`, body).pipe(
      catchError(() => this.http.post(`${this.reqUrl}/GetREQHList`, body)),
      catchError(() => this.http.post(`${this.baseUrl}/GetREQHList`, body)),
      catchError(() => this.http.post(`${this.baseUrl}/GetRequestHeaderList`, body)),
      catchError(err => {
        console.warn('Requisition headers API fallback:', err);
        return of({ data: [], message: err?.message });
      })
    );
  }

  saveRequestHeader(data: Partial<REQHModel>, op: number = 2): Observable<any> {
    const body: REQHModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.reqUrl}/AUDRequestHeader`, body).pipe(
      catchError(() => this.http.post(`${this.reqUrl}/AUDREQH`, body)),
      catchError(() => this.http.post(`${this.baseUrl}/AUDREQH`, body))
    );
  }

  deleteRequestHeader(reqno: string): Observable<any> {
    const body: REQHModel = {
      coperation: 4,
      reQ_NO: reqno,
      reqno: reqno
    };
    return this.http.post(`${this.reqUrl}/AUDRequestHeader`, body).pipe(
      catchError(() => this.http.post(`${this.reqUrl}/AUDREQH`, body)),
      catchError(() => this.http.post(`${this.baseUrl}/AUDREQH`, body))
    );
  }

  getRequestDetails(reqno?: string): Observable<any> {
    const body = { coperation: 1, reQ_NO: reqno || '', reqno: reqno || '' };
    return this.http.post(`${this.reqUrl}/GetRequestDetailList`, body).pipe(
      catchError(() => this.http.post(`${this.reqUrl}/GetREQDList`, body)),
      catchError(() => this.http.post(`${this.baseUrl}/GetREQDList`, body)),
      catchError(() => this.http.post(`${this.baseUrl}/GetRequestDetailList`, body)),
      catchError(err => {
        console.warn('Requisition details API fallback:', err);
        return of({ data: [], message: err?.message });
      })
    );
  }

  saveRequestDetail(data: Partial<REQDModel>, op: number = 2): Observable<any> {
    const cleanProject = (data.project !== undefined && data.project !== '' && data.project !== null && !isNaN(Number(data.project)))
      ? Number(data.project)
      : null;
    const body: REQDModel = {
      coperation: op,
      ...data,
      project: cleanProject
    };
    return this.http.post(`${this.reqUrl}/AUDRequestDetail`, body);
  }

  deleteRequestDetail(reqno: string, linenum?: number): Observable<any> {
    const body: REQDModel = {
      coperation: 4,
      reQ_NO: reqno,
      linenum: linenum || 1
    };
    return this.http.post(`${this.reqUrl}/AUDRequestDetail`, body);
  }

  // ==========================================
  // VENDOR BIDDING & QUOTES (Vendor Controller)
  // ==========================================

  getVendorBiddingList(reqno?: string, vendorid?: string): Observable<any> {
    const body: Partial<REVBIDModel> = {
      coperation: 1,
      reqno: reqno || '',
      vendorid: vendorid || ''
    };
    return this.http.post(`${this.baseUrl}/GetVENDORBiddingList`, body).pipe(
      catchError(err => {
        console.warn('GetVENDORBiddingList fallback:', err);
        return of({ data: [], revbid_List: [], message: err?.message });
      })
    );
  }

  saveVendorBidding(data: Partial<REVBIDModel>, op: number = 2): Observable<any> {
    const body: REVBIDModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.baseUrl}/AUDVENDORBidding`, body);
  }

  deleteVendorBidding(reqno: string, vendorid: string, itemNo?: string): Observable<any> {
    const body: REVBIDModel = {
      coperation: 4,
      reqno: reqno,
      vendorid: vendorid,
      iteM_NO: itemNo || ''
    };
    return this.http.post(`${this.baseUrl}/AUDVENDORBidding`, body);
  }

  // ==========================================
  // WORKFLOW PIPELINES (Management Controller)
  // ==========================================

  getWorkflowList(): Observable<any> {
    return this.http.post(`${this.mgmtUrl}/GetWORKFLOWList`, { coperation: 1 }).pipe(
      catchError(err => {
        console.warn('GetWORKFLOWList fallback:', err);
        return of({ data: [], workflow_List: [], message: err?.message });
      })
    );
  }

  saveWorkflow(data: Partial<WORKFLOWModel>, op: number = 2): Observable<any> {
    const body: WORKFLOWModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.mgmtUrl}/AUDWORKFLOW`, body);
  }

  deleteWorkflow(stepid: number): Observable<any> {
    const body: WORKFLOWModel = {
      coperation: 4,
      stepid: stepid
    };
    return this.http.post(`${this.mgmtUrl}/AUDWORKFLOW`, body);
  }

  // ==========================================
  // DOCUMENT NUMBERING RULES (Management Controller)
  // ==========================================

  getDocumentNumberList(): Observable<any> {
    return this.http.post(`${this.mgmtUrl}/GetDOCNUMBERList`, { coperation: 1 }).pipe(
      catchError(err => {
        console.warn('GetDOCNUMBERList fallback:', err);
        return of({ data: [], asdocnum_List: [], message: err?.message });
      })
    );
  }

  saveDocumentNumber(data: Partial<ASDOCNUMModel>, op: number = 2): Observable<any> {
    const body: ASDOCNUMModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.mgmtUrl}/AUDDOCNUMBERDETAILS`, body);
  }

  deleteDocumentNumber(module: string): Observable<any> {
    const body: ASDOCNUMModel = {
      coperation: 4,
      module: module
    };
    return this.http.post(`${this.mgmtUrl}/AUDDOCNUMBERDETAILS`, body);
  }

  // ==========================================
  // DOCUMENT TYPES (Management Controller)
  // ==========================================

  getDocumentTypeList(): Observable<any> {
    return this.http.post(`${this.mgmtUrl}/GetCSDOCTYPEList`, { coperation: 1 }).pipe(
      catchError(err => {
        console.warn('GetCSDOCTYPEList fallback:', err);
        return of({ data: [], csdoctype_List: [], message: err?.message });
      })
    );
  }

  saveDocumentType(data: Partial<CSDoctypeModel>, op: number = 2): Observable<any> {
    const body: CSDoctypeModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.mgmtUrl}/AUDCSDOCTYPEDETAILS`, body);
  }

  deleteDocumentType(typeCode: string): Observable<any> {
    const body: CSDoctypeModel = {
      coperation: 4,
      doC_TYPECODE: typeCode
    };
    return this.http.post(`${this.mgmtUrl}/AUDCSDOCTYPEDETAILS`, body);
  }

  // ==========================================
  // PRICE COMPARISON (Request Controller)
  // ==========================================

  getPriceCompareList(reqno?: string): Observable<any> {
    const body = { coperation: 1, reqno: reqno || '' };
    return this.http.post(`${this.reqUrl}/GetPriceComapreList`, body).pipe(
      catchError(err => {
        console.warn('GetPriceComapreList fallback:', err);
        return of({ data: [], pcomparE_List: [], message: err?.message });
      })
    );
  }

  savePriceCompare(data: Partial<PCOMPAREModel>, op: number = 2): Observable<any> {
    const body: PCOMPAREModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.reqUrl}/AUDPriceCompareDetails`, body);
  }

  // ==========================================
  // LOGISTICS & LANDED COST (Request Controller)
  // ==========================================

  getLogisticsList(reqno?: string): Observable<any> {
    const body = { coperation: 1, reQ_NO: reqno || '' };
    return this.http.post(`${this.reqUrl}/GetLogisticsList`, body).pipe(
      catchError(err => {
        console.warn('GetLogisticsList fallback:', err);
        return of({ data: [], readdcostList: [], message: err?.message });
      })
    );
  }

  saveLogistics(data: Partial<READDCOSTModel>, op: number = 2): Observable<any> {
    const body: READDCOSTModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.reqUrl}/AUDLogistics`, body);
  }

  deleteLogistics(reqno: string, vendorId: string, itemnum: string, linenum?: number): Observable<any> {
    const body: READDCOSTModel = {
      coperation: 4,
      reQ_NO: reqno,
      vendoR_ID: vendorId,
      itemnum: itemnum,
      linenum: linenum
    };
    return this.http.post(`${this.reqUrl}/AUDLogistics`, body);
  }

  // ==========================================
  // REQUISITION VENDOR ITEMS (REVITEMS)
  // ==========================================

  getREVITEMSList(reqno: string = ''): Observable<any> {
    const body = { coperation: 1, reQ_NO: reqno };
    return this.http.post(`${this.reqUrl}/GetREVITEMSList`, body).pipe(
      map((res: any) => res?.revitemS_LIST || res?.revitemS_DETAILS || res?.data || (Array.isArray(res) ? res : [])),
      catchError(err => {
        console.warn('GetREVITEMSList fallback:', err);
        return of([]);
      })
    );
  }

  saveVendorItems(data: Partial<REVITEMSModel>, op: number = 2): Observable<any> {
    const body: REVITEMSModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.reqUrl}/AUDVendorItems`, body);
  }

  // ==========================================
  // ADMINISTRATIVE MASTER DATA AUD
  // ==========================================

  saveShipVia(data: Partial<SHIPVIAModel>, op: number = 2): Observable<any> {
    const body: SHIPVIAModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.mgmtUrl}/AUDSHIPVIA`, body);
  }

  saveUaeBank(data: Partial<UAEBANKSModel>, op: number = 2): Observable<any> {
    const body: UAEBANKSModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.mgmtUrl}/AUDUAEBANKS`, body);
  }

  saveCurrency(data: Partial<CurrenyModel>, op: number = 2): Observable<any> {
    const body: CurrenyModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.mgmtUrl}/AUDCURRENCYDETAILS`, body);
  }

  saveModule(data: Partial<CSMODULEModel>, op: number = 2): Observable<any> {
    const body: CSMODULEModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.mgmtUrl}/AUDCSMODULE`, body);
  }

  getGeneralBankList(): Observable<any> {
    return this.http.post(`${this.mgmtUrl}/GetBANKList`, { coperation: 1 }).pipe(
      map((res: any) => res?.banK_List || res?.banK_Details || res?.data || (Array.isArray(res) ? res : [])),
      catchError(err => {
        console.warn('GetBANKList fallback:', err);
        return of([]);
      })
    );
  }

  // ==========================================
  // VENDOR MAJOR PRODUCTS (VREGMP)
  // ==========================================

  getVendorMajorProductList(reqno: string = ''): Observable<any> {
    return this.http.post(`${this.baseUrl}/GetVendorMajorProductList`, { coperation: 1, reqno }).pipe(
      map((res: any) => res?.vregmP_List || res?.vregmP_Details || res?.data || (Array.isArray(res) ? res : [])),
      catchError(err => {
        console.warn('GetVendorMajorProductList fallback:', err);
        return of([]);
      })
    );
  }

  saveVendorMajorProductAUD(data: Partial<VREGMPModel>, op: number = 2): Observable<any> {
    const body: VREGMPModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.baseUrl}/AUDVendorMajorProduct`, body);
  }

  // ==========================================
  // EMAIL SETUP & SMTP (Management Controller)
  // ==========================================

  getEmailList(): Observable<any> {
    return this.http.post(`${this.mgmtUrl}/GetEMAILList`, { coperation: 1 }).pipe(
      map((res: any) => res?.emaiL_LIST || res?.emaiL_DETAILS || res?.data || (Array.isArray(res) ? res : [])),
      catchError(err => {
        console.warn('GetEMAILList fallback:', err);
        return of([]);
      })
    );
  }

  saveEmailConfig(data: Partial<EMAILModel>, op: number = 2): Observable<any> {
    const body: EMAILModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.mgmtUrl}/AUDEMAIL`, body);
  }

  // ==========================================
  // REQUISITION ACTIVITY & AUDIT TRAILS (Request Controller)
  // ==========================================

  getRequestCuractList(reqno: string = ''): Observable<any> {
    const body = { coperation: 1, reQ_NO: reqno };
    return this.http.post(`${this.reqUrl}/GetRequestCuractList`, body).pipe(
      map((res: any) => res?.reqcuracT_List || res?.reqcuracT_Details || res?.data || (Array.isArray(res) ? res : [])),
      catchError(err => {
        console.warn('GetRequestCuractList fallback:', err);
        return of([]);
      })
    );
  }

  saveRequestCuract(data: Partial<REQCURACTModel>, op: number = 2): Observable<any> {
    const body: REQCURACTModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.reqUrl}/AUDRequestCuract`, body);
  }

  getRequestLogList(reqno: string = ''): Observable<any> {
    const body = { coperation: 1, reQ_NO: reqno };
    return this.http.post(`${this.reqUrl}/GetRequestLogList`, body).pipe(
      map((res: any) => res?.reqlogList || res?.reqlogDetails || res?.data || (Array.isArray(res) ? res : [])),
      catchError(err => {
        console.warn('GetRequestLogList fallback:', err);
        return of([]);
      })
    );
  }

  saveRequestLog(data: Partial<REQLOGModel>, op: number = 2): Observable<any> {
    const body: REQLOGModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.reqUrl}/AUDRequestLog`, body);
  }

  getVendorCuractList(reqno: string = ''): Observable<any> {
    const body = { coperation: '1', reQ_NO: reqno };
    return this.http.post(`${this.reqUrl}/GetVendorCuractList`, body).pipe(
      map((res: any) => res?.revcuracT_List || res?.revcuracT_Details || res?.data || (Array.isArray(res) ? res : [])),
      catchError(err => {
        console.warn('GetVendorCuractList fallback:', err);
        return of([]);
      })
    );
  }

  saveVendorCuractItems(data: Partial<REVCURACTModel>, op: number = 2): Observable<any> {
    const body: REVCURACTModel = {
      coperation: String(op),
      ...data
    };
    return this.http.post(`${this.reqUrl}/AUDVendorCuractItems`, body);
  }

  // ==========================================
  // VENDOR ONBOARDING REVIEW ACTIONS (Vendor Controller)
  // ==========================================

  getVCURACTACTIONList(reqno: string = ''): Observable<any> {
    const body = { coperation: 1, reqno: reqno };
    return this.http.post(`${this.baseUrl}/GetVCURACTACTIONList`, body).pipe(
      map((res: any) => res?.vcuractactioN_List || res?.vcuractactioN_Data || res?.data || (Array.isArray(res) ? res : [])),
      catchError(err => {
        console.warn('GetVCURACTACTIONList fallback:', err);
        return of([]);
      })
    );
  }

  saveVCURACTACTIONDetails(data: Partial<VCURACTACTIONModel>, op: number = 2): Observable<any> {
    const body: VCURACTACTIONModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.baseUrl}/AUDVCURACTACTIONDetails`, body);
  }

  // ==========================================
  // ASSET / ACCOUNT TYPES (Management Controller)
  // ==========================================

  getASTYPEList(): Observable<any> {
    return this.http.post(`${this.mgmtUrl}/GetASTYPEList`, { coperation: 1 }).pipe(
      map((res: any) => res?.astypE_List || res?.astypE_Details || res?.data || (Array.isArray(res) ? res : [])),
      catchError(err => {
        console.warn('GetASTYPEList fallback:', err);
        return of([]);
      })
    );
  }

  saveASTYPE(data: Partial<ASTYPEModel>, op: number = 2): Observable<any> {
    const body: ASTYPEModel = {
      coperation: op,
      ...data
    };
    return this.http.post(`${this.mgmtUrl}/AUDASTYPE`, body);
  }
}
