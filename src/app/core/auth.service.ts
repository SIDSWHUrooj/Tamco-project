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
  Token?: string | null;
  accessToken?: string | null;
  AccessToken?: string | null;
  refreshToken?: string | null;
  tokenExpiration?: string | null;
  vendorBI_Data?: any;
  vendorBI_List?: any[];
  useR_Details?: any;
  user_Details?: any;
  useR_List?: any[];
  user_List?: any[];
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
        const token = res.token || res.Token || res.accessToken || res.AccessToken || res.data?.token || res.data?.Token || res.data?.accessToken || res.data?.AccessToken;
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
    const body: any = {
      coperation: 1,
      userid: payload.userid.trim(),
      userpwd: payload.userpwd,
      password: payload.userpwd
    };

    return this.http.post<AuthResponse>(`${this.baseUrl}/UserLogin`, body).pipe(
      map(res => {
        const token = res.token || res.Token || res.accessToken || res.AccessToken || res.data?.token || res.data?.Token || res.data?.accessToken || res.data?.AccessToken;
        // Backend returns HTTP 200 with status: "5" and token: null when user is not found
        if (!token) {
          throw new Error(res.message || 'Staff login failed. Invalid user ID or password.');
        }
        return res;
      }),
      tap(res => {
        const determinedRole = payload.targetRole || this.inferRoleFromResponse(res, payload.userid) || (payload.userid.toLowerCase().includes('admin') ? 'admin' : (payload.userid.toLowerCase().includes('finance') ? 'finance' : 'procurement'));
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
  vendorResetPassword(data: { email: string; otp: string; password: string; reseT_TOKEN?: string; resetToken?: string }): Observable<any> {
    const token = data.reseT_TOKEN || data.resetToken || '';
    return this.http.post(`${this.baseUrl}/VendorResetPassword`, {
      email: data.email.trim(),
      otp: data.otp.trim(),
      password: data.password,
      reseT_TOKEN: token,
      resetToken: token
    });
  }

  // ==========================================
  // TOKEN & SESSION HELPERS
  // ==========================================

  saveTokens(token: string, refreshToken?: string): void {
    try {
      if (typeof window !== 'undefined') {
        const clean = token.trim();
        sessionStorage?.setItem('tamco_jwt_token', clean);
        localStorage?.setItem('tamco_jwt_token', clean);
        if (refreshToken) {
          sessionStorage?.setItem('tamco_refresh_token', refreshToken.trim());
          localStorage?.setItem('tamco_refresh_token', refreshToken.trim());
        }
      }
    } catch {}
  }

  getToken(): string | null {
    try {
      if (typeof window !== 'undefined') {
        const s = sessionStorage?.getItem('tamco_jwt_token');
        const l = localStorage?.getItem('tamco_jwt_token');
        const t = (s && !s.startsWith('DEMO_TOKEN_')) ? s : ((l && !l.startsWith('DEMO_TOKEN_')) ? l : null);
        if (t && t !== 'undefined' && t !== 'null') {
          return t.trim();
        }
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
      if (typeof window !== 'undefined') {
        sessionStorage?.removeItem('tamco_jwt_token');
        sessionStorage?.removeItem('tamco_refresh_token');
        sessionStorage?.removeItem('tamco_portal_auth');
        localStorage?.removeItem('tamco_jwt_token');
        localStorage?.removeItem('tamco_refresh_token');
        localStorage?.removeItem('tamco_portal_auth');
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
    const token = res.token || res.Token || res.accessToken || res.AccessToken || res.data?.token || res.data?.Token || res.data?.accessToken || res.data?.AccessToken;
    const refreshToken = res.refreshToken || res.data?.refreshToken;

    if (typeof token === 'string' && token.length > 5) {
      this.saveTokens(token, refreshToken);
    }

    // Extract vendor and user details returned by .NET API
    const vendorData = res.vendorBI_Data || res.vendorBI_List?.[0] || {};
    const userData = res.useR_Details || res.useR_List?.[0] || res.user || res.data?.user || {};

    // Determine Vendor Lifecycle Mode (0: Draft Wizard, 1: Under Review, 3: Approved Partner)
    let vendorStatus = 3;
    if (role === 'vendor') {
      const activeFlag = vendorData.isactive !== undefined
        ? vendorData.isactive
        : (vendorData.active !== undefined ? vendorData.active : vendorData.Active);
      const isApproved = activeFlag === 1 || activeFlag === '1' || activeFlag === true;

      if (isApproved) {
        vendorStatus = 3;
      } else {
        // Check if registration was previously submitted for TAMCO review
        const isSubmitted = vendorData.submitted === true
          || vendorData.status === 'Submitted'
          || vendorData.status === 'Under Review'
          || vendorData.isactivE1 === 1
          || vendorData.isactivE1 === '1'
          || (typeof window !== 'undefined' && localStorage.getItem(`vreg_submitted_${usernameOrEmail}`) === 'true');
        vendorStatus = isSubmitted ? 1 : 0;
      }
    }

    const displayName = vendorData.vendoR_NAME
      || (userData.fname && userData.lname ? `${userData.fname} ${userData.lname}` : userData.fname)
      || userData.userid
      || usernameOrEmail;

    const organization = role === 'vendor'
      ? (vendorData.reQ_NO ? `${vendorData.reQ_NO} · Supplier` : (vendorData.vendorid ? `${vendorData.vendorid} · Supplier` : 'Vendor Supplier'))
      : (userData.deptid ? `${userData.deptid} · TAMCO` : 'TAMCO Enterprise');

    const account: AuthAccount = {
      username: usernameOrEmail,
      email: vendorData.email || userData.email || (usernameOrEmail.includes('@') ? usernameOrEmail : `${usernameOrEmail}@tamco.ae`),
      role,
      name: displayName,
      organization,
      initials: displayName.substring(0, 2).toUpperCase(),
      badge: role === 'vendor' ? (vendorStatus >= 3 ? 'Partner (Approved ERP)' : `Supplier (${vendorStatus === 0 ? 'Wizard' : (vendorStatus === 1 ? 'Review' : 'Pending')})`) : role.toUpperCase(),
      vendorStatus,
      securityGroup: (userData.securitygroup || userData.securityGroup || userData.securitY_GROUP || userData.SecurityGroup || '').toString().trim() || (role === 'admin' ? '1' : (role === 'procurement' ? '2' : (role === 'finance' ? '3' : '5')))
    };

    this.portalState.signIn(account);
  }

  private inferRoleFromResponse(res: AuthResponse, inputUsername?: string): Role | null {
    // 1. Decode token claims if a JWT token is present
    const token = res.token || res.Token || res.accessToken || res.AccessToken || res.data?.token || res.data?.Token || res.data?.accessToken || res.data?.AccessToken;
    if (typeof token === 'string' && token.includes('.')) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const base64Url = parts[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
          const payload = JSON.parse(jsonPayload);
          const tokenRole = (
            payload.role ||
            payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
            payload.SecurityGroup ||
            payload.securitygroup ||
            payload.groups ||
            ''
          ).toString().toLowerCase();

          if (tokenRole === '1' || tokenRole === '4' || tokenRole.includes('admin') || tokenRole.includes('manage')) return 'admin';
          if (tokenRole === '3' || tokenRole.includes('finance') || tokenRole.includes('account')) return 'finance';
          if (tokenRole === '2' || tokenRole.includes('procure') || tokenRole.includes('buyer') || tokenRole.includes('source')) return 'procurement';
          if (tokenRole === '5' || tokenRole.includes('vendor') || tokenRole.includes('supplier')) return 'vendor';
        }
      } catch {}
    }

    // 2. Check all possible user data objects returned by .NET API
    const u = res.useR_Details || res.useR_List?.[0] || res.user_List?.[0] || res.user || res.data?.user || res.data?.useR_Details || res.data || {};
    const group = (
      u.securitygroup ||
      u.securityGroup ||
      u.securitY_GROUP ||
      u.SecurityGroup ||
      u.grouP_NAME ||
      u.groupname ||
      u.role ||
      u.Role ||
      res.role ||
      res.data?.role ||
      ''
    ).toString().toLowerCase();

    if (group === '1' || group === '4' || group.includes('admin') || group.includes('manage')) return 'admin';
    if (group === '3' || group.includes('finance') || group.includes('account')) return 'finance';
    if (group === '2' || group.includes('procure') || group.includes('buyer') || group.includes('source')) return 'procurement';
    if (group === '5' || group.includes('vendor') || group.includes('supplier')) return 'vendor';

    // 3. Check Department / Dept ID
    const dept = (u.deptid || u.department || u.deptname || u.dept || '').toString().toLowerCase();
    if (dept.includes('admin') || dept.includes('it') || dept.includes('executive') || dept.includes('manage')) return 'admin';
    if (dept.includes('finance') || dept.includes('account')) return 'finance';
    if (dept.includes('procure') || dept.includes('buyer') || dept.includes('sourcing')) return 'procurement';

    // 4. Check Username / User ID
    const rawUser = (inputUsername || u.userid || u.useR_ID || u.UserID || u.email || '').toString().toLowerCase();
    if (rawUser === 'admin' || rawUser.startsWith('admin') || rawUser.includes('admin') || rawUser.includes('sidadmin')) return 'admin';
    if (rawUser.includes('finance') || rawUser.includes('accountant')) return 'finance';
    if (rawUser.includes('procure') || rawUser.includes('buyer')) return 'procurement';
    if (rawUser.includes('vendor') || rawUser.includes('supplier')) return 'vendor';

    return null;
  }
}
