import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { PortalStateService } from './portal-state.service';
import { Role, AuthAccount } from './models';

export interface VendorLoginRequest {
  coperation?: number;
  email?: string;
  reQ_NO?: string;
  vendoR_NAME?: string;
  password?: string;
  contact?: string;
  cT_PERSON?: string;
  otp?: string;
  auduser?: string;
  active?: number;
}

export interface UserLoginRequest {
  coperation?: number;
  userid: string;
  userpwd: string;
  fname?: string;
  lname?: string;
  email?: string;
  securitygroup?: string;
}

export interface AuthResponse {
  token?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenExpiration?: string | null;
  vendorBI_Data?: any;
  vendorBI_List?: any[];
  useR_Details?: any;
  useR_List?: any[];
  user?: any;
  role?: string;
  message?: string;
  status?: string | number;
  data?: any;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly portalState = inject(PortalStateService);
  private readonly baseUrl = `${environment.apiUrl}/api/Account`;

  /**
   * Vendor / Supplier Login
   * POST /api/Account/VendorLogin
   */
  vendorLogin(payload: { usernameOrEmail: string; password: string }): Observable<AuthResponse> {
    const input = payload.usernameOrEmail.trim();
    const body: VendorLoginRequest = {
      coperation: 1,
      email: input,
      reQ_NO: input,
      password: payload.password
    };

    return this.http.post<AuthResponse>(`${this.baseUrl}/VendorLogin`, body).pipe(
      map(res => {
        const token = res.token || res.accessToken || res.data?.token || res.data?.accessToken;
        // Backend returns HTTP 200 with status: "2" and token: null when credentials fail
        if (!token) {
          throw new Error(res.message || 'Vendor login failed. Invalid email, Vendor ID or password.');
        }
        return res;
      }),
      tap(res => this.handleAuthSuccess(res, 'vendor', payload.usernameOrEmail))
    );
  }

  /**
   * Internal Staff Login (Admin, Procurement, Finance)
   * POST /api/Account/UserLogin
   */
  userLogin(payload: { userid: string; userpwd: string; targetRole?: Role }): Observable<AuthResponse> {
    const body: UserLoginRequest = {
      coperation: 1,
      userid: payload.userid.trim(),
      userpwd: payload.userpwd
    };

    return this.http.post<AuthResponse>(`${this.baseUrl}/UserLogin`, body).pipe(
      map(res => {
        const token = res.token || res.accessToken || res.data?.token || res.data?.accessToken;
        // Backend returns HTTP 200 with status: "5" and token: null when user is not found
        if (!token) {
          throw new Error(res.message || 'Staff login failed. Invalid user ID or password.');
        }
        return res;
      }),
      tap(res => {
        const determinedRole = payload.targetRole || this.inferRoleFromResponse(res) || 'procurement';
        this.handleAuthSuccess(res, determinedRole, payload.userid);
      })
    );
  }

  /**
   * Validate Session
   * GET /api/Account/ValidateSession
   */
  validateSession(): Observable<any> {
    return this.http.get(`${this.baseUrl}/ValidateSession`);
  }

  /**
   * Refresh Token
   * POST /api/Account/RefreshToken
   */
  refreshToken(): Observable<AuthResponse> {
    const body = {
      accessToken: this.getToken() || '',
      refreshToken: this.getRefreshToken() || ''
    };
    return this.http.post<AuthResponse>(`${this.baseUrl}/RefreshToken`, body).pipe(
      tap(res => {
        const token = res.accessToken || res.token || res.data?.accessToken || res.data?.token;
        const refreshToken = res.refreshToken || res.data?.refreshToken;
        if (token) this.saveTokens(token, refreshToken);
      })
    );
  }

  /**
   * Revoke Token / Logout on Backend
   * POST /api/Account/RevokeToken
   */
  revokeToken(): Observable<any> {
    const body = {
      accessToken: this.getToken() || '',
      refreshToken: this.getRefreshToken() || ''
    };
    return this.http.post(`${this.baseUrl}/RevokeToken`, body);
  }

  /**
   * Vendor Forgot Password
   * POST /api/Account/VendorForgotPassword
   */
  vendorForgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/VendorForgotPassword`, { email: email.trim() });
  }

  /**
   * Vendor Verify OTP
   * POST /api/Account/VendorVerifyOtp
   */
  vendorVerifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/VendorVerifyOtp`, { email: email.trim(), otp: otp.trim() });
  }

  /**
   * Vendor Reset Password
   * POST /api/Account/VendorResetPassword
   */
  vendorResetPassword(data: { email: string; otp: string; password: string; reseT_TOKEN?: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/VendorResetPassword`, {
      email: data.email.trim(),
      otp: data.otp.trim(),
      password: data.password,
      reseT_TOKEN: data.reseT_TOKEN || ''
    });
  }

  // ==========================================
  // TOKEN & SESSION HELPERS
  // ==========================================

  saveTokens(token: string, refreshToken?: string): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem('tamco_jwt_token', token);
        if (refreshToken) {
          sessionStorage.setItem('tamco_refresh_token', refreshToken);
        }
      }
    } catch {}
  }

  getToken(): string | null {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return sessionStorage.getItem('tamco_jwt_token');
      }
    } catch {}
    return null;
  }

  getRefreshToken(): string | null {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return sessionStorage.getItem('tamco_refresh_token');
      }
    } catch {}
    return null;
  }

  clearSession(): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem('tamco_jwt_token');
        sessionStorage.removeItem('tamco_refresh_token');
        sessionStorage.removeItem('tamco_portal_auth');
      }
    } catch {}
    this.portalState.signOut();
  }

  isLoggedIn(): boolean {
    return !!this.getToken() || this.portalState.authenticated();
  }

  isTokenExpired(token?: string | null): boolean {
    const t = token || this.getToken();
    if (!t) return false;
    if (t.includes('DEMO_TOKEN')) return false;
    try {
      const parts = t.split('.');
      if (parts.length !== 3) return false;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const parsed = JSON.parse(jsonPayload);
      if (!parsed.exp) return false;
      return Date.now() >= parsed.exp * 1000;
    } catch {
      return false;
    }
  }

  private handleAuthSuccess(res: AuthResponse, role: Role, usernameOrEmail: string): void {
    const token = res.token || res.accessToken || res.data?.token || res.data?.accessToken;
    const refreshToken = res.refreshToken || res.data?.refreshToken;

    if (typeof token === 'string' && token.length > 5) {
      this.saveTokens(token, refreshToken);
    }

    // Extract vendor and user details returned by .NET API
    const vendorData = res.vendorBI_Data || res.vendorBI_List?.[0] || {};
    const userData = res.useR_Details || res.useR_List?.[0] || res.user || res.data?.user || {};
    const rawActive = vendorData.active !== undefined ? vendorData.active : (vendorData.Active !== undefined ? vendorData.Active : undefined);
    const vendorStatus = rawActive !== undefined ? Number(rawActive) : 3;

    const displayName = vendorData.vendoR_NAME
      || (userData.fname && userData.lname ? `${userData.fname} ${userData.lname}` : userData.fname)
      || userData.userid
      || usernameOrEmail;

    const organization = role === 'vendor'
      ? (vendorData.reQ_NO ? `${vendorData.reQ_NO} · Supplier` : 'VEN-10024 · Supplier')
      : (userData.deptid ? `${userData.deptid} · TAMCO` : 'TAMCO Enterprise');

    const account: AuthAccount = {
      username: usernameOrEmail,
      email: vendorData.email || userData.email || (usernameOrEmail.includes('@') ? usernameOrEmail : `${usernameOrEmail}@tamco.ae`),
      password: '***',
      role,
      name: displayName,
      organization,
      initials: displayName.substring(0, 2).toUpperCase(),
      badge: role === 'vendor' ? (vendorStatus >= 3 ? 'Partner (Approved ERP)' : `Supplier (${vendorStatus === 0 ? 'Wizard' : (vendorStatus === 1 ? 'Review' : 'Pending')})`) : role.toUpperCase(),
      vendorStatus
    };

    this.portalState.signIn(account);
  }

  private inferRoleFromResponse(res: AuthResponse): Role | null {
    const group = (res.user?.securitygroup || res.data?.securitygroup || res.role || '').toLowerCase();
    if (group.includes('admin')) return 'admin';
    if (group.includes('procurement')) return 'procurement';
    if (group.includes('finance')) return 'finance';
    if (group.includes('vendor')) return 'vendor';
    return null;
  }
}
