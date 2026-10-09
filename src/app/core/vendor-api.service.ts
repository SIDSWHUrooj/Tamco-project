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

@Injectable({ providedIn: 'root' })
export class VendorApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/Vendor`;
  private readonly mgmtUrl = `${environment.apiUrl}/api/Management`;

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
}
