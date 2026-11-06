import { Component, inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Role } from '../core/models';
import { PortalStateService } from '../core/portal-state.service';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule],

  template: `
    <main class="login-page">

      <!-- =====================================================
           CORPORATE / BRAND SIDE
      ====================================================== -->
      <section class="brand-side">

        <!-- Decorative corporate background -->
        <div class="background-grid"></div>
        <div class="background-ring ring-one"></div>
        <div class="background-ring ring-two"></div>
        <div class="orange-glow"></div>

        <!-- Brand Header -->
        <header class="brand-header">

          <div class="company-logo-wrap">
            <img
              src="/tamco-logo.png"
              alt="TAMCO Middle East Ltd."
              class="company-logo"
            />
          </div>

          <div class="portal-tag">
            Vendor Portal
          </div>

        </header>


        <!-- Brand Content -->
        <div class="brand-content">

          <div class="brand-eyebrow">
            <span class="orange-line"></span>
            BUSINESS PARTNER PLATFORM
          </div>

          <h1>
            Building stronger
            <span>business partnerships.</span>
          </h1>

          <p class="brand-description">
            Welcome to the TAMCO Vendor Portal — a secure and efficient
            platform designed to simplify collaboration between TAMCO and
            our valued business partners.
          </p>


          <!-- Portal capabilities -->
          <div class="capabilities">

            <div class="capability">

              <div class="capability-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 3h12a2 2 0 0 1 2 2v16l-8-4-8 4V5a2 2 0 0 1 2-2"></path>
                </svg>
              </div>

              <div>
                <strong>Purchase Orders</strong>
                <span>Access and manage your purchase orders</span>
              </div>

            </div>


            <div class="capability">

              <div class="capability-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="4" y="3" width="16" height="18" rx="1"></rect>
                  <path d="M8 8h8"></path>
                  <path d="M8 12h8"></path>
                  <path d="M8 16h5"></path>
                </svg>
              </div>

              <div>
                <strong>Invoices & Payments</strong>
                <span>Submit invoices and review their status</span>
              </div>

            </div>


            <div class="capability">

              <div class="capability-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 7h11v10H3z"></path>
                  <path d="M14 10h4l3 3v4h-7z"></path>
                  <circle cx="7" cy="18" r="2"></circle>
                  <circle cx="18" cy="18" r="2"></circle>
                </svg>
              </div>

              <div>
                <strong>Delivery Coordination</strong>
                <span>Track and coordinate delivery activities</span>
              </div>

            </div>

          </div>

        </div>


        <!-- Brand Footer -->
        <footer class="brand-footer">

          <span>
            © 2026 TAMCO Middle East Ltd.
          </span>

          <span class="security-text">

            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="5" y="10" width="14" height="11" rx="2"></rect>
              <path d="M8 10V7a4 4 0 0 1 8 0v3"></path>
            </svg>

            Secure Business Portal

          </span>

        </footer>

      </section>


      <!-- =====================================================
           LOGIN SIDE
      ====================================================== -->
      <section class="login-side">

        <!-- Top accent -->
        <div class="login-top-accent">
          <span class="blue-accent"></span>
          <span class="orange-accent"></span>
        </div>


        <!-- Mobile Branding -->
        <div class="mobile-brand">

          <img
            src="/tamco-logo.png"
            alt="TAMCO Middle East Ltd."
          />

          <span>Vendor Portal</span>

        </div>


        <!-- Login is centered inside this wrapper -->
        <div class="login-center">

          <div class="login-container">

            <!-- Portal identity -->
            <div class="portal-identity">

              <div class="portal-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3 4 7v5c0 4.9 3.4 8.5 8 9.8 4.6-1.3 8-4.9 8-9.8V7l-8-4Z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </div>

              <span>SECURE VENDOR ACCESS</span>

            </div>


            <!-- Heading -->
            <div class="login-heading">

              <h2>Welcome back</h2>

              <p>
                Sign in to your TAMCO Vendor Portal account
                using your registered credentials.
              </p>

            </div>

            <!-- Form -->
            <form
              #loginForm="ngForm"
              (ngSubmit)="signIn()"
            >

              <!-- Username / Email -->
              <div class="form-field">

                <label for="username">
                  Username or Email
                </label>

                <div
                  class="input-box"
                  [class.error-border]="loginError"
                >

                  <span class="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                    </svg>
                  </span>

                  <input
                    id="username"
                    name="username"
                    type="text"
                    [(ngModel)]="username"
                    (ngModelChange)="clearError()"
                    placeholder="e.g. admin, procurement, finance, vendor"
                    autocomplete="username"
                    required
                  />

                </div>

              </div>


              <!-- Password -->
              <div class="form-field">

                <label for="password">
                  Password
                </label>

                <div
                  class="input-box"
                  [class.error-border]="loginError"
                >

                  <span class="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </span>

                  <input
                    id="password"
                    name="password"
                    [type]="showPassword ? 'text' : 'password'"
                    [(ngModel)]="password"
                    (ngModelChange)="clearError()"
                    placeholder="Enter your password"
                    autocomplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    class="password-toggle"
                    (click)="showPassword = !showPassword"
                    [attr.aria-label]="
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    "
                  >
                    @if (showPassword) {
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                        <line x1="2" y1="2" x2="22" y2="22"></line>
                      </svg>
                    } @else {
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    }
                  </button>

                </div>

                <div class="field-meta-row">
                  <label class="remember-me" for="rememberMeCheck">
                    <input
                      id="rememberMeCheck"
                      type="checkbox"
                      name="remember"
                      [(ngModel)]="rememberMe"
                    />
                    <span class="custom-checkbox" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span class="remember-text">Keep me signed in</span>
                  </label>

                  <button
                    type="button"
                    class="forgot-password"
                    (click)="forgotPassword()"
                  >
                    Forgot Password?
                  </button>
                </div>

              </div>


              <!-- Success -->
              @if (loginSuccess) {
                <div
                  class="login-success-banner"
                  role="status"
                  aria-live="polite"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>{{ loginSuccess }}</span>
                </div>
              }

              <!-- Error -->
              @if (loginError) {
                <div
                  class="login-error"
                  role="alert"
                  aria-live="polite"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="9"></circle>
                    <path d="M12 7v6"></path>
                    <path d="M12 17h.01"></path>
                  </svg>
                  <span>{{ loginError }}</span>
                </div>
              }


              <!-- Sign In -->
              <button
                class="sign-in-button"
                type="submit"
                [disabled]="!username.trim() || !password || loading"
              >
                <span>{{ loading ? 'Signing in...' : 'Sign in' }}</span>
              </button>

            </form>


            <!-- Security Info -->
            <div class="security-panel">

              <div class="security-icon">

                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3 4 7v5c0 4.9 3.4 8.5 8 9.8 4.6-1.3 8-4.9 8-9.8V7l-8-4Z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>

              </div>

              <div>
                <strong>Secure corporate access</strong>

                <p>
                  This portal is intended for authorized TAMCO
                  business partners only.
                </p>
              </div>

            </div>


            <!-- Help -->
            <div class="help-section">

              <span>Need help accessing your account?</span>

              <button
                type="button"
                (click)="contactAdministrator()"
              >
                Contact your administrator
              </button>

            </div>

            <!-- Supplier Onboarding -->
            <div class="help-section" style="margin-top: 14px; padding-top: 14px; border-top: 1px dashed var(--line, #e2e8f0);">
              <span>Prospective vendor partner?</span>
              <button
                type="button"
                (click)="goToVendorRegistration()"
                style="color: var(--role-accent, #2563eb); font-weight: 700;"
              >
                Register as Supplier (8-Step Wizard) →
              </button>
            </div>

          </div>

        </div>


        <!-- Login Footer -->
        <footer class="login-footer">

          <span>
            TAMCO Middle East Ltd.
          </span>

          <div>

            <a
              href="#"
              (click)="$event.preventDefault()"
            >
              Privacy
            </a>

            <span class="footer-divider"></span>

            <a
              href="#"
              (click)="$event.preventDefault()"
            >
              Terms of Use
            </a>

          </div>

        </footer>

      </section>

      <!-- =====================================================
           VENDOR FORGOT PASSWORD / OTP MODAL
      ====================================================== -->
      @if (showForgotModal) {
        <div class="modal-backdrop" (click)="closeForgotModal()">
          <div class="modal-card" (click)="$event.stopPropagation()" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
            
            <!-- Modal Header -->
            <div class="modal-header">
              <div class="modal-steps-indicator">
                <span class="step-pill" [class.active]="forgotStep === 'email'" [class.done]="forgotStep !== 'email'">
                  1. Email
                </span>
                <span class="step-arrow">→</span>
                <span class="step-pill" [class.active]="forgotStep === 'otp'" [class.done]="forgotStep === 'reset' || forgotStep === 'success'">
                  2. OTP
                </span>
                <span class="step-arrow">→</span>
                <span class="step-pill" [class.active]="forgotStep === 'reset'" [class.done]="forgotStep === 'success'">
                  3. Password
                </span>
              </div>
              <button type="button" class="modal-close-btn" (click)="closeForgotModal()" aria-label="Close modal">
                ✕
              </button>
            </div>

            <!-- STEP 1: REQUEST OTP (EMAIL) -->
            @if (forgotStep === 'email') {
              <div class="modal-body">
                <div class="modal-icon-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                </div>

                <h2 id="modalTitle" class="modal-title">Reset Vendor Password</h2>
                <p class="modal-subtitle">
                  Enter your registered vendor email address. We will transmit a 6-digit One-Time Password (OTP) to verify your identity.
                </p>

                @if (forgotError) {
                  <div class="modal-alert error" role="alert">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>{{ forgotError }}</span>
                  </div>
                }

                <div class="modal-form-group">
                  <label for="forgotEmailInput">Registered Vendor Email *</label>
                  <div class="modal-input-wrap">
                    <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                    </svg>
                    <input
                      id="forgotEmailInput"
                      type="email"
                      [(ngModel)]="forgotEmail"
                      (ngModelChange)="forgotError = ''"
                      (keydown.enter)="requestOtp()"
                      placeholder="e.g. vendor@tamco.ae"
                      autocomplete="email"
                      autofocus
                    />
                  </div>
                  <span class="field-hint">Must match the email address associated with your vendor account.</span>
                </div>

                <div class="modal-actions">
                  <button type="button" class="btn-modal secondary" (click)="closeForgotModal()">
                    Cancel
                  </button>
                  <button
                    type="button"
                    class="btn-modal primary"
                    [disabled]="!forgotEmail.trim() || forgotLoading"
                    (click)="requestOtp()"
                  >
                    @if (forgotLoading) {
                      <span class="btn-spinner"></span>
                      <span>Sending Code...</span>
                    } @else {
                      <span>Send Verification Code →</span>
                    }
                  </button>
                </div>
              </div>
            }

            <!-- STEP 2: VERIFY OTP -->
            @if (forgotStep === 'otp') {
              <div class="modal-body">
                <div class="modal-icon-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    <path d="m9 12 2 2 4-4"></path>
                  </svg>
                </div>

                <h2 id="modalTitle" class="modal-title">Verify One-Time Password</h2>
                <p class="modal-subtitle">
                  Enter the 6-digit verification code sent to
                  <strong class="highlight-email">{{ forgotEmail }}</strong>
                </p>

                <div class="change-email-row">
                  <button type="button" class="btn-text-link" (click)="forgotStep = 'email'">
                    ← Change Email Address
                  </button>
                </div>

                @if (forgotSuccessMsg) {
                  <div class="modal-alert info" role="status">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <span>{{ forgotSuccessMsg }}</span>
                  </div>
                }

                @if (forgotError) {
                  <div class="modal-alert error" role="alert">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>{{ forgotError }}</span>
                  </div>
                }

                <div class="modal-form-group">
                  <label for="forgotOtpInput">6-Digit Verification Code</label>
                  <div class="otp-input-wrapper">
                    <input
                      id="forgotOtpInput"
                      type="text"
                      class="otp-hidden-input"
                      [(ngModel)]="forgotOtp"
                      (ngModelChange)="onOtpChange()"
                      (keydown.enter)="verifyOtp()"
                      maxlength="6"
                      inputmode="numeric"
                      autocomplete="one-time-code"
                      autofocus
                    />
                    <div class="otp-boxes" aria-hidden="true">
                      @for (idx of [0, 1, 2, 3, 4, 5]; track idx) {
                        <div
                          class="otp-box"
                          [class.filled]="forgotOtp.length > idx"
                          [class.active]="forgotOtp.length === idx"
                        >
                          {{ forgotOtp[idx] || '' }}
                        </div>
                      }
                    </div>
                  </div>
                </div>

                <div class="resend-row">
                  @if (resendCountdown > 0) {
                    <span class="resend-countdown">
                      Resend code available in <strong>{{ resendCountdown }}s</strong>
                    </span>
                  } @else {
                    <button type="button" class="btn-resend" [disabled]="forgotLoading" (click)="resendOtp()">
                      ↻ Didn't receive code? Resend Code
                    </button>
                  }
                </div>

                <div class="modal-actions">
                  <button type="button" class="btn-modal secondary" (click)="forgotStep = 'email'">
                    ← Back
                  </button>
                  <button
                    type="button"
                    class="btn-modal primary"
                    [disabled]="forgotOtp.length < 6 || forgotLoading"
                    (click)="verifyOtp()"
                  >
                    @if (forgotLoading) {
                      <span class="btn-spinner"></span>
                      <span>Verifying Code...</span>
                    } @else {
                      <span>Verify Code →</span>
                    }
                  </button>
                </div>
              </div>
            }

            <!-- STEP 3: RESET PASSWORD -->
            @if (forgotStep === 'reset') {
              <div class="modal-body">
                <div class="modal-icon-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>

                <h2 id="modalTitle" class="modal-title">Create New Password</h2>
                <p class="modal-subtitle">
                  Your identity has been verified. Enter a secure new password for vendor account
                  <strong class="highlight-email">{{ forgotEmail }}</strong>.
                </p>

                @if (forgotError) {
                  <div class="modal-alert error" role="alert">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>{{ forgotError }}</span>
                  </div>
                }

                <!-- New Password -->
                <div class="modal-form-group">
                  <label for="forgotNewPass">New Password *</label>
                  <div class="modal-input-wrap">
                    <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <input
                      id="forgotNewPass"
                      [type]="forgotShowNewPassword ? 'text' : 'password'"
                      [(ngModel)]="forgotNewPassword"
                      (ngModelChange)="forgotError = ''"
                      placeholder="Enter at least 6 characters"
                      autocomplete="new-password"
                      autofocus
                    />
                    <button
                      type="button"
                      class="field-toggle-btn"
                      (click)="forgotShowNewPassword = !forgotShowNewPassword"
                      [attr.aria-label]="forgotShowNewPassword ? 'Hide password' : 'Show password'"
                    >
                      @if (forgotShowNewPassword) {
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                          <line x1="2" y1="2" x2="22" y2="22"></line>
                        </svg>
                      } @else {
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      }
                    </button>
                  </div>

                  <!-- Password strength bar -->
                  @if (forgotNewPassword) {
                    <div class="strength-meter">
                      <div class="strength-bar-track">
                        <div
                          class="strength-bar-fill"
                          [style.width.%]="passwordStrength.score"
                          [style.background-color]="passwordStrength.color"
                        ></div>
                      </div>
                      <span class="strength-label" [style.color]="passwordStrength.color">
                        {{ passwordStrength.label }}
                      </span>
                    </div>
                  }
                </div>

                <!-- Confirm New Password -->
                <div class="modal-form-group">
                  <label for="forgotConfirmPass">Confirm New Password *</label>
                  <div class="modal-input-wrap">
                    <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <input
                      id="forgotConfirmPass"
                      [type]="forgotShowConfirmPassword ? 'text' : 'password'"
                      [(ngModel)]="forgotConfirmPassword"
                      (ngModelChange)="forgotError = ''"
                      (keydown.enter)="resetPassword()"
                      placeholder="Re-enter your new password"
                      autocomplete="new-password"
                    />
                    <button
                      type="button"
                      class="field-toggle-btn"
                      (click)="forgotShowConfirmPassword = !forgotShowConfirmPassword"
                      [attr.aria-label]="forgotShowConfirmPassword ? 'Hide password' : 'Show password'"
                    >
                      @if (forgotShowConfirmPassword) {
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                          <line x1="2" y1="2" x2="22" y2="22"></line>
                        </svg>
                      } @else {
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      }
                    </button>
                  </div>

                  @if (forgotConfirmPassword && forgotNewPassword !== forgotConfirmPassword) {
                    <span class="field-error-text">Passwords do not match</span>
                  } @else if (forgotConfirmPassword && forgotNewPassword === forgotConfirmPassword) {
                    <span class="field-match-text">✓ Passwords match</span>
                  }
                </div>

                <div class="modal-actions">
                  <button type="button" class="btn-modal secondary" (click)="closeForgotModal()">
                    Cancel
                  </button>
                  <button
                    type="button"
                    class="btn-modal primary"
                    [disabled]="!forgotNewPassword || forgotNewPassword.length < 6 || forgotNewPassword !== forgotConfirmPassword || forgotLoading"
                    (click)="resetPassword()"
                  >
                    @if (forgotLoading) {
                      <span class="btn-spinner"></span>
                      <span>Updating Password...</span>
                    } @else {
                      <span>Reset Password & Sign In →</span>
                    }
                  </button>
                </div>
              </div>
            }

            <!-- STEP 4: SUCCESS -->
            @if (forgotStep === 'success') {
              <div class="modal-body text-center">
                <div class="modal-success-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>

                <h2 id="modalTitle" class="modal-title">Password Reset Complete!</h2>
                <p class="modal-subtitle">
                  Your vendor password has been securely updated. You can now sign in immediately using your new password.
                </p>

                <div class="modal-actions-centered">
                  <button type="button" class="btn-modal primary full-width" (click)="finishReset()">
                    Sign in to Vendor Portal →
                  </button>
                </div>
              </div>
            }

          </div>
        </div>
      }

    </main>
  `,

  styles: [`

    /* =========================================================
       TAMCO CORPORATE DESIGN SYSTEM
    ========================================================== */

    :host {

      display: block;
      height: 100vh;
      overflow: hidden;

      --tamco-blue: #0876b9;
      --tamco-blue-light: #1593d0;
      --tamco-blue-dark: #00588d;
      --tamco-blue-deep: #003f69;

      --tamco-orange: #f05a24;
      --tamco-orange-dark: #d94914;

      --text-primary: #172737;
      --text-secondary: #667788;
      --text-muted: #8c99a5;

      --border: #d9e2e9;
      --border-light: #e9eef2;

      --surface: #ffffff;
      --page: #f5f7f9;

      font-family:
        Inter,
        "Segoe UI",
        Roboto,
        Helvetica,
        Arial,
        sans-serif;

    }


    * {
      box-sizing: border-box;
    }


    button,
    input {
      font-family: inherit;
    }


    button {
      -webkit-tap-highlight-color: transparent;
    }


    /* =========================================================
       PAGE
    ========================================================== */

    .login-page {

      width: 100%;
      height: 100vh;
      min-height: 0;

      display: grid;

      grid-template-columns:
        minmax(0, 1.06fr)
        minmax(0, .94fr);

      overflow: hidden;

      color:
        var(--text-primary);

      background:
        var(--page);

    }


    /* =========================================================
       LEFT / CORPORATE
    ========================================================== */

    .brand-side {

      position: relative;

      min-height: 100vh;

      display: flex;
      flex-direction: column;

      overflow: hidden;

      padding:
        40px
        clamp(48px, 5vw, 82px)
        32px;

      color: #ffffff;

      background:
        linear-gradient(
          145deg,
          #0879bd 0%,
          #056fac 34%,
          #005a90 68%,
          #004876 100%
        );

    }


    /* =========================================================
       BACKGROUND GRAPHICS
    ========================================================== */

    .background-grid {

      position: absolute;
      inset: 0;

      opacity: .05;

      pointer-events: none;

      background-image:

        linear-gradient(
          rgba(255,255,255,.8) 1px,
          transparent 1px
        ),

        linear-gradient(
          90deg,
          rgba(255,255,255,.8) 1px,
          transparent 1px
        );

      background-size:
        58px 58px;

      mask-image:
        linear-gradient(
          135deg,
          rgba(0,0,0,1),
          rgba(0,0,0,.1)
        );

    }


    .background-ring {

      position: absolute;

      border-radius:
        50%;

      pointer-events:
        none;

    }


    .ring-one {

      width: 550px;
      height: 550px;

      top: -260px;
      right: -220px;

      border:
        1px solid
        rgba(255,255,255,.14);

      box-shadow:

        0 0 0 70px
        rgba(255,255,255,.025),

        0 0 0 145px
        rgba(255,255,255,.016);

    }


    .ring-two {

      width: 290px;
      height: 290px;

      left: -170px;
      bottom: 40px;

      border:
        1px solid
        rgba(255,255,255,.1);

    }


    .orange-glow {

      position: absolute;

      width: 390px;
      height: 390px;

      left: -190px;
      bottom: -230px;

      border-radius: 50%;

      background:
        rgba(240,90,36,.16);

      filter:
        blur(18px);

      pointer-events:
        none;

    }


    .brand-side::after {

      content: '';

      position: absolute;

      left: 0;
      bottom: 0;

      width: 300px;
      height: 7px;

      background:
        var(--tamco-orange);

    }


    /* =========================================================
       BRAND HEADER
    ========================================================== */

    .brand-header {

      position: relative;
      z-index: 5;

      display: flex;
      align-items: center;
      justify-content: space-between;

      gap: 28px;

    }


    .company-logo-wrap {

      width: 185px;

      min-height: 58px;

      display: flex;
      align-items: center;
      justify-content: center;

      padding:
        10px 14px;

      border-radius:
        7px;

      background:
        #ffffff;

      box-shadow:

        0 10px 28px
        rgba(0,35,62,.18);

    }


    .company-logo {

      display:
        block;

      width:
        100%;

      height:
        auto;

      object-fit:
        contain;

    }


    .portal-tag {

      padding:
        8px 15px;

      border:
        1px solid
        rgba(255,255,255,.22);

      border-radius:
        4px;

      color:
        rgba(255,255,255,.9);

      background:
        rgba(255,255,255,.06);

      font-size:
        10px;

      font-weight:
        700;

      letter-spacing:
        .13em;

      text-transform:
        uppercase;

    }


    /* =========================================================
       BRAND BODY
    ========================================================== */

    .brand-content {

      position: relative;
      z-index: 4;

      width:
        min(100%, 650px);

      margin:
        auto 0;

      padding:
        70px 0 55px;

    }


    .brand-eyebrow {

      display:
        flex;

      align-items:
        center;

      gap:
        11px;

      margin-bottom:
        20px;

      color:
        rgba(255,255,255,.72);

      font-size:
        10px;

      font-weight:
        700;

      letter-spacing:
        .16em;

    }


    .orange-line {

      display:
        block;

      width:
        30px;

      height:
        3px;

      border-radius:
        4px;

      background:
        var(--tamco-orange);

    }


    .brand-content h1 {

      max-width:
        650px;

      margin:
        0;

      color:
        #ffffff;

      font-size:
        clamp(45px, 4.8vw, 69px);

      line-height:
        1.045;

      font-weight:
        620;

      letter-spacing:
        -.045em;

    }


    .brand-content h1 span {

      display:
        block;

      color:
        #c9e9fb;

    }


    .brand-description {

      max-width:
        560px;

      margin:
        26px 0 0;

      color:
        rgba(255,255,255,.73);

      font-size:
        14px;

      line-height:
        1.8;

    }


    /* =========================================================
       CAPABILITIES
    ========================================================== */

    .capabilities {

      max-width:
        580px;

      display:
        grid;

      grid-template-columns:
        repeat(3, 1fr);

      gap:
        12px;

      margin-top:
        43px;

    }


    .capability {

      display:
        flex;

      flex-direction:
        column;

      min-width:
        0;

      padding:
        17px;

      border:
        1px solid
        rgba(255,255,255,.15);

      border-radius:
        7px;

      background:
        rgba(255,255,255,.065);

      backdrop-filter:
        blur(5px);

    }


    .capability-icon {

      width:
        35px;

      height:
        35px;

      display:
        grid;

      place-items:
        center;

      margin-bottom:
        14px;

      border:
        1px solid
        rgba(255,255,255,.18);

      border-radius:
        5px;

      color:
        #ffffff;

      background:
        rgba(255,255,255,.07);

    }


    .capability-icon svg {

      width:
        17px;

      height:
        17px;

      fill:
        none;

      stroke:
        currentColor;

      stroke-width:
        1.6;

      stroke-linecap:
        round;

      stroke-linejoin:
        round;

    }


    .capability strong {

      display:
        block;

      color:
        #ffffff;

      font-size:
        11px;

      font-weight:
        650;

      line-height:
        1.4;

    }


    .capability span {

      display:
        block;

      margin-top:
        6px;

      color:
        rgba(255,255,255,.55);

      font-size:
        9px;

      line-height:
        1.55;

    }


    /* =========================================================
       BRAND FOOTER
    ========================================================== */

    .brand-footer {

      position:
        relative;

      z-index:
        4;

      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      gap:
        25px;

      color:
        rgba(255,255,255,.5);

      font-size:
        9px;

    }


    .security-text {

      display:
        inline-flex;

      align-items:
        center;

      gap:
        7px;

    }


    .security-text svg {

      width:
        13px;

      height:
        13px;

      fill:
        none;

      stroke:
        currentColor;

      stroke-width:
        1.7;

      stroke-linecap:
        round;

      stroke-linejoin:
        round;

    }


    /* =========================================================
       LOGIN SIDE
    ========================================================== */

    .login-side {

      position:
        relative;

      min-height:
        100vh;

      display:
        flex;

      flex-direction:
        column;

      overflow:
        hidden;

      padding:
        35px
        clamp(38px, 5vw, 70px)
        25px;

      background:

        radial-gradient(
          circle at 100% 0%,
          rgba(8,118,185,.07),
          transparent 27%
        ),

        linear-gradient(
          135deg,
          #ffffff 0%,
          #f8fafc 100%
        );

    }


    /*
       Right side top corporate color signature.
    */

    .login-top-accent {

      position:
        absolute;

      top:
        0;

      right:
        0;

      display:
        flex;

      height:
        4px;

      width:
        190px;

    }


    .blue-accent {

      flex:
        1;

      background:
        var(--tamco-blue);

    }


    .orange-accent {

      width:
        55px;

      background:
        var(--tamco-orange);

    }


    /* =========================================================
       LOGIN CENTERING
    ========================================================== */

    .login-center {

      flex:
        1;

      width:
        100%;

      display:
        flex;

      align-items:
        center;

      justify-content:
        center;

      padding:
        30px 0;

    }


    .login-container {

      width:
        min(100%, 430px);

      margin:
        auto;

    }


    /*
       No oversized floating card.
       Clean enterprise surface with just
       enough structure.
    */

    .login-container {

      padding:
        38px 38px 34px;
    
      border:
        1px solid
        var(--border-light);

      border-radius:
        12px;

      background:
        rgba(255,255,255,.97);

      box-shadow:

        0 28px 70px
        rgba(27,53,73,.08),

        0 4px 14px
        rgba(27,53,73,.035);

    }


    /* =========================================================
       MOBILE BRAND
    ========================================================== */

    .mobile-brand {

      display:
        none;

    }


    /* =========================================================
       PORTAL IDENTITY
    ========================================================== */

    .portal-identity {

      display:
        flex;

      align-items:
        center;

      gap:
        10px;

      margin-bottom:
        22px;

      color:
        var(--tamco-blue);

      font-size:
        9px;

      font-weight:
        750;

      letter-spacing:
        .15em;

    }


    .portal-icon {

      width:
        31px;

      height:
        31px;

      display:
        grid;

      place-items:
        center;

      border-radius:
        6px;

      color:
        var(--tamco-blue);

      background:
        #edf7fc;

    }


    .portal-icon svg {

      width:
        17px;

      height:
        17px;

      fill:
        none;

      stroke:
        currentColor;

      stroke-width:
        1.7;

      stroke-linecap:
        round;

      stroke-linejoin:
        round;

    }


    /* =========================================================
       LOGIN HEADING
    ========================================================== */

    .login-heading {

      margin-bottom:
        31px;

    }


    .login-heading h2 {

      margin:
        0;

      color:
        #172838;

      font-size:
        34px;

      line-height:
        1.12;

      font-weight:
        650;

      letter-spacing:
        -.035em;

    }


    .login-heading p {

      max-width:
        345px;

      margin:
        11px 0 0;

      color:
        var(--text-secondary);

      font-size:
        12px;

      line-height:
        1.65;

    }


    /* =========================================================
       FORM FIELDS & MODERN INPUTS
    ========================================================== */

    .form-field {
      margin-bottom: 18px;
    }

    .form-field label {
      display: block;
      margin-bottom: 7px;
      color: #475569;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.01em;
    }

    .input-box {
      width: 100%;
      height: 48px;
      display: flex;
      align-items: center;
      padding: 0 15px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      background: #f8fafc;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
      transition: border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
                  box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1),
                  background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        border-color: #cbd5e1;
        background-color: #ffffff;
      }

      &:focus-within {
        border-color: #0876b9;
        background-color: #ffffff;
        box-shadow: 0 0 0 3.5px rgba(8, 118, 185, 0.14), 0 1px 2px rgba(15, 23, 42, 0.04);

        .input-icon {
          color: #0876b9;
        }
      }

      &.error-border {
        border-color: #ef4444 !important;
        background-color: #fffafa !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12) !important;
      }
    }

    .input-icon {
      width: 20px;
      height: 20px;
      flex: 0 0 20px;
      display: grid;
      place-items: center;
      margin-right: 12px;
      color: #0876b9;
      transition: color 0.2s ease;

      svg {
        width: 18px;
        height: 18px;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
    }

    .input-box input {
      min-width: 0;
      flex: 1;
      height: 100% !important;
      padding: 0 !important;
      border: none !important;
      border-style: none !important;
      outline: none !important;
      color: #0f172a !important;
      background: transparent !important;
      background-color: transparent !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      font-size: 13px !important;
      font-weight: 500 !important;
      line-height: normal !important;
      letter-spacing: -0.01em;

      &::placeholder {
        color: #94a3af !important;
        font-size: 13px !important;
        font-weight: 400 !important;
      }

      &:hover,
      &:focus,
      &:active {
        border: none !important;
        border-style: none !important;
        box-shadow: none !important;
        background: transparent !important;
        background-color: transparent !important;
        outline: none !important;
      }
    }

    .password-toggle {
      width: 32px;
      height: 32px;
      display: grid;
      place-items: center;
      margin-right: -4px;
      border: 0;
      border-radius: 6px;
      color: #94a3af;
      background: transparent;
      cursor: pointer;
      transition: color 0.18s ease, background-color 0.18s ease;

      &:hover {
        color: #0876b9;
        background: #edf7fc;
      }

      svg {
        width: 17px;
        height: 17px;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
    }

    .field-meta-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 10px 0 20px;
    }

    .forgot-password {
      padding: 0;
      border: 0;
      color: #0876b9;
      background: transparent;
      font-size: 11.5px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: color 0.18s ease;

      &:hover {
        color: #00588d;
        text-decoration: underline;
      }
    }

    /* =========================================================
       ERROR
    ========================================================== */

    .login-error {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: -5px 0 18px;
      padding: 10px 14px;
      border: 1px solid #fca5a5;
      border-radius: 8px;
      color: #b91c1c;
      background: #fef2f2;
      font-size: 11.5px;
      line-height: 1.5;

      svg {
        width: 16px;
        height: 16px;
        flex: 0 0 16px;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
    }

    /* =========================================================
       OPTIONS / IMPROVED REMEMBER ME
    ========================================================== */

    .remember-me {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      cursor: pointer;
      user-select: none;
      position: relative;

      input[type="checkbox"] {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
        margin: 0;
        pointer-events: none;
      }

      .custom-checkbox {
        width: 18px;
        height: 18px;
        border-radius: 5px;
        border: 1.5px solid #cbd5e1;
        background: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
        flex-shrink: 0;

        svg {
          width: 12px;
          height: 12px;
          color: #ffffff;
          stroke: #ffffff;
          opacity: 0;
          transform: scale(0.6);
          transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.15s ease;
        }
      }

      &:hover .custom-checkbox {
        border-color: #0876b9;
        background: #f0f8fc;
      }

      input[type="checkbox"]:checked + .custom-checkbox {
        background: #0876b9;
        border-color: #0876b9;
        box-shadow: 0 2px 6px rgba(8, 118, 185, 0.32);

        svg {
          opacity: 1;
          transform: scale(1);
        }
      }

      input[type="checkbox"]:focus-visible + .custom-checkbox {
        box-shadow: 0 0 0 3px rgba(8, 118, 185, 0.22);
      }

      .remember-text {
        font-size: 12px;
        font-weight: 500;
        color: #475569;
        transition: color 0.15s ease;
      }

      &:hover .remember-text {
        color: #1e293b;
      }
    }

    /* =========================================================
       SIGN-IN BUTTON (BLUE THEME)
    ========================================================== */

    .sign-in-button {
      width: 100%;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 0 20px;
      border: 0;
      border-radius: 10px;
      color: #ffffff;
      background: linear-gradient(135deg, #0876b9 0%, #00588d 100%);
      box-shadow: 0 4px 14px rgba(8, 118, 185, 0.28);
      font-size: 13.5px;
      font-weight: 700;
      letter-spacing: 0.01em;
      cursor: pointer;
      transition: transform 0.16s ease, box-shadow 0.16s ease, opacity 0.16s ease;

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(8, 118, 185, 0.36);
        background: linear-gradient(135deg, #066ca9 0%, #004b77 100%);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(8, 118, 185, 0.25);
      }

      &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
        box-shadow: none;
      }
    }


    /* =========================================================
       SECURITY PANEL
    ========================================================== */

    .security-panel {

      display:
        flex;

      align-items:
        flex-start;

      gap:
        11px;

      margin-top:
        26px;

      padding:
        14px;

      border:
        1px solid
        #ddebf3;

      border-radius:
        6px;

      background:
        #f6fafc;

    }


    .security-icon {

      width:
        31px;

      height:
        31px;

      flex:
        0 0 31px;

      display:
        grid;

      place-items:
        center;

      border-radius:
        5px;

      color:
        var(--tamco-blue);

      background:
        #e6f3fa;

    }


    .security-icon svg {

      width:
        17px;

      height:
        17px;

      fill:
        none;

      stroke:
        currentColor;

      stroke-width:
        1.7;

      stroke-linecap:
        round;

      stroke-linejoin:
        round;

    }


    .security-panel strong {

      display:
        block;

      margin-bottom:
        3px;

      color:
        #314758;

      font-size:
        10px;

      font-weight:
        700;

    }


    .security-panel p {

      margin:
        0;

      color:
        #7a8996;

      font-size:
        9px;

      line-height:
        1.55;

    }


    /* =========================================================
       HELP
    ========================================================== */

    .help-section {

      display:
        flex;

      justify-content:
        center;

      align-items:
        center;

      flex-wrap:
        wrap;

      gap:
        5px;

      margin-top:
        19px;

      color:
        #8a96a1;

      font-size:
        9px;

    }


    .help-section button {

      padding:
        0;

      border:
        0;

      color:
        var(--tamco-blue);

      background:
        transparent;

      font-size:
        9px;

      font-weight:
        650;

      cursor:
        pointer;

    }


    .help-section button:hover {

      text-decoration:
        underline;

    }


    /* =========================================================
       LOGIN FOOTER
    ========================================================== */

    .login-footer {

      min-height:
        30px;

      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      gap:
        20px;

      width:
        100%;

      color:
        #99a3ac;

      font-size:
        9px;

    }


    .login-footer div {

      display:
        flex;

      align-items:
        center;

      gap:
        8px;

    }


    .login-footer a {

      color:
        #87939e;

      text-decoration:
        none;

    }


    .login-footer a:hover {

      color:
        var(--tamco-blue);

    }


    .footer-divider {

      width:
        3px;

      height:
        3px;

      border-radius:
        50%;

      background:
        #b9c2ca;

    }


    /* Keep the complete desktop login experience inside the viewport. */
    @media (min-width: 821px) {

      .brand-side {
        padding-top: 24px;
        padding-bottom: 20px;
      }

      .brand-content {
        padding: 28px 0 24px;
      }

      .brand-eyebrow {
        margin-bottom: 13px;
      }

      .brand-content h1 {
        font-size: clamp(38px, 4vw, 56px);
      }

      .brand-description {
        margin-top: 16px;
        line-height: 1.55;
      }

      .capabilities {
        margin-top: 24px;
      }

      .capability {
        padding: 12px;
      }

      .capability-icon {
        width: 30px;
        height: 30px;
        margin-bottom: 9px;
      }

      .login-side {
        padding-top: 20px;
        padding-bottom: 14px;
      }

      .login-center {
        padding: 12px 0;
      }

      .login-container {
        padding: 25px 30px 22px;
      }

      .portal-identity {
        margin-bottom: 14px;
      }

      .login-heading {
        margin-bottom: 20px;
      }

      .login-heading h2 {
        font-size: 30px;
      }

      .form-field {
        margin-bottom: 14px;
      }

      .input-box {
        height: 46px;
      }

      .form-options {
        margin-bottom: 15px;
      }

      .sign-in-button {
        height: 46px;
      }

      .security-panel {
        margin-top: 17px;
        padding: 10px;
      }

      .help-section {
        margin-top: 12px;
      }

    }


    /* =========================================================
       RESPONSIVE - LAPTOP
    ========================================================== */

    @media (max-width: 1100px) {

      .login-page {

        grid-template-columns:
          minmax(0, .92fr)
          minmax(0, 1.08fr);

      }


      .brand-side {

        padding-left:
          42px;

        padding-right:
          42px;

      }


      .company-logo-wrap {

        width:
          160px;

      }


      .brand-content h1 {

        font-size:
          46px;

      }


      .capabilities {

        grid-template-columns:
          1fr;

        max-width:
          360px;

      }


      .capability {

        flex-direction:
          row;

        align-items:
          center;

      }


      .capability-icon {

        margin:
          0 13px 0 0;

        flex:
          0 0 35px;

      }

    }


    /* =========================================================
       TABLET / MOBILE
    ========================================================== */

    @media (max-width: 820px) {

      :host {

        height:
          auto;

        overflow:
          visible;

      }

      .login-page {

        display:
          block;

        width:
          100%;

        min-height:
          100vh;

        overflow:
          visible;

        overflow-x:
          hidden;

      }


      .brand-side {

        min-height:
          auto;

        padding:
          30px 28px
          38px;

      }


      .brand-header,
      .capabilities,
      .brand-footer {

        display:
          none;

      }


      .brand-content {

        width:
          100%;

        padding:
          22px 0 0;

      }


      .brand-content h1 {

        max-width:
          600px;

        font-size:
          38px;

      }


      .brand-content h1 span {

        display:
          inline;

      }


      .brand-description {

        max-width:
          580px;

        margin-top:
          14px;

        font-size:
          12px;

        line-height:
          1.65;

      }


      .brand-eyebrow {

        margin-bottom:
          14px;

      }


      .login-side {

        min-height:
          auto;
        padding:
          28px 22px 35px;

      }


      .mobile-brand {

        width:
          min(100%, 480px);

        display:
          flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          20px;

        margin:
          0 auto;

        padding-bottom:
          20px;

        border-bottom:
          1px solid
          var(--border-light);

      }


      .mobile-brand img {

        display:
          block;

        width:
          190px;

        height:
          auto;

      }


      .mobile-brand span {

        color:
          var(--tamco-blue-dark);

        font-size:
          9px;

        font-weight:
          750;

        letter-spacing:
          .11em;

        text-transform:
          uppercase;

      }


      .login-center {

        padding:
          28px 0 20px;

      }


      .login-container {

        width:
          min(100%, 480px);

      }


      .login-footer {

        width:
          min(100%, 480px);

        margin:
          0 auto;

      }

    }


    /* =========================================================
       MOBILE
    ========================================================== */

    @media (max-width: 520px) {

      .brand-side {

        padding:
          24px 20px
          30px;

      }


      .brand-content {

        padding-top:
          16px;

      }


      .brand-eyebrow {

        font-size:
          8px;

      }


      .orange-line {

        width:
          22px;

      }


      .brand-content h1 {

        font-size:
          31px;

        line-height:
          1.08;

      }


      .brand-description {

        font-size:
          11px;

      }


      .login-side {

        padding:
          23px 15px
          28px;

      }


      .mobile-brand {

        padding:
          0 3px 17px;

      }


      .mobile-brand img {

        width:
          155px;

      }


      .mobile-brand span {

        font-size:
          8px;

      }


      .login-center {

        padding:
          22px 0 17px;

      }


      .login-container {

        padding:
          29px 22px
          27px;

        border-radius:
          9px;

      }


      .portal-identity {

        margin-bottom:
          18px;

      }


      .login-heading {

        margin-bottom:
          26px;

      }


      .login-heading h2 {

        font-size:
          29px;

      }


      .login-heading p {

        font-size:
          11px;

      }


      .input-box {

        height:
          49px;

      }


      .security-panel {

        padding:
          12px;

      }


      .login-footer {

        flex-direction:
          column;

        justify-content:
          center;

        gap:
          7px;

        text-align:
          center;

      }

    }


    /* =========================================================
       VERY SMALL DEVICES
    ========================================================== */

    @media (max-width: 360px) {

      .brand-content h1 {

        font-size:
          27px;

      }


      .login-container {

        padding:
          25px 17px;

      }


      .field-heading {

        gap:
          8px;

      }


      .forgot-password {

        font-size:
          9px;

      }


      .sign-in-button {
        padding: 0 15px;
      }
    }

    /* =========================================================
       LOGIN SUCCESS BANNER
    ========================================================== */
    .login-success-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 12px;
      animation: fadeIn 0.2s ease-out;
    }

    .login-success-banner svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      color: #059669;
    }

    /* =========================================================
       VENDOR FORGOT PASSWORD / OTP MODAL
    ========================================================== */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      box-sizing: border-box;
      animation: fadeIn 0.2s ease-out;
    }

    .modal-card {
      position: relative;
      background: #ffffff;
      border-radius: 18px;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.3), 0 0 0 1px rgba(15, 23, 42, 0.08);
      overflow: hidden;
      animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #f1f5f9;
      background: #fafbfc;
    }

    .modal-steps-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
    }

    .step-pill {
      display: inline-flex;
      align-items: center;
      padding: 3px 10px;
      border-radius: 12px;
      font-weight: 600;
      color: #64748b;
      background: #e2e8f0;
      transition: all 0.2s ease;
    }

    .step-pill.active {
      background: #fff0eb;
      color: #f05a24;
      border: 1px solid rgba(240, 90, 36, 0.25);
    }

    .step-pill.done {
      background: #ecfdf5;
      color: #059669;
    }

    .step-arrow {
      color: #94a3b8;
      font-size: 12px;
    }

    .modal-close-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      color: #64748b;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }

    .modal-close-btn:hover {
      background: #f1f5f9;
      color: #0f172a;
      border-color: #cbd5e1;
    }

    .modal-body {
      padding: 24px 28px 28px;
    }

    .modal-body.text-center {
      text-align: center;
      padding: 36px 28px;
    }

    .modal-icon-badge {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: #fff0eb;
      color: #f05a24;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      border: 1px solid rgba(240, 90, 36, 0.2);
    }

    .modal-icon-badge svg {
      width: 26px;
      height: 26px;
    }

    .modal-success-badge {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #d1fae5;
      color: #059669;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      border: 2px solid #a7f3d0;
    }

    .modal-success-badge svg {
      width: 34px;
      height: 34px;
    }

    .modal-title {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 6px;
    }

    .modal-subtitle {
      font-size: 13.5px;
      color: #64748b;
      line-height: 1.5;
      margin: 0 0 18px;
    }

    .highlight-email {
      color: #0f172a;
      font-weight: 600;
      word-break: break-all;
    }

    .change-email-row {
      margin-top: -10px;
      margin-bottom: 16px;
    }

    .btn-text-link {
      background: none;
      border: none;
      color: #f05a24;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      text-decoration: underline;
    }

    .modal-alert {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      line-height: 1.4;
      margin-bottom: 16px;
    }

    .modal-alert.error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
    }

    .modal-alert.info {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1e40af;
    }

    .modal-alert svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .modal-form-group {
      margin-bottom: 18px;
    }

    .modal-form-group label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #334155;
      margin-bottom: 6px;
    }

    .modal-input-wrap {
      position: relative;
      display: flex;
      align-items: center;
      background: #ffffff;
      border: 1.5px solid #cbd5e1;
      border-radius: 10px;
      transition: all 0.2s ease;
    }

    .modal-input-wrap:focus-within {
      border-color: #f05a24;
      box-shadow: 0 0 0 3px rgba(240, 90, 36, 0.15);
    }

    .modal-input-wrap .field-icon {
      width: 18px;
      height: 18px;
      color: #94a3b8;
      margin-left: 14px;
      flex-shrink: 0;
    }

    .modal-input-wrap input {
      width: 100%;
      padding: 12px 14px;
      border: none;
      background: transparent;
      outline: none;
      font-size: 14px;
      color: #0f172a;
    }

    .field-toggle-btn {
      background: none;
      border: none;
      padding: 8px 12px;
      cursor: pointer;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .field-toggle-btn svg {
      width: 18px;
      height: 18px;
    }

    .field-hint {
      display: block;
      font-size: 11.5px;
      color: #64748b;
      margin-top: 5px;
    }

    .field-error-text {
      display: block;
      font-size: 12px;
      color: #dc2626;
      margin-top: 5px;
      font-weight: 500;
    }

    .field-match-text {
      display: block;
      font-size: 12px;
      color: #059669;
      margin-top: 5px;
      font-weight: 500;
    }

    /* 6-DIGIT OTP BOXES */
    .otp-input-wrapper {
      position: relative;
      width: 100%;
      margin: 8px 0;
    }

    .otp-hidden-input {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
      z-index: 10;
    }

    .otp-boxes {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 8px;
      width: 100%;
    }

    .otp-box {
      height: 56px;
      border: 1.5px solid #cbd5e1;
      border-radius: 10px;
      background: #fafbfc;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      font-family: monospace;
      transition: all 0.15s ease;
      user-select: none;
    }

    .otp-box.filled {
      border-color: #0876b9;
      background: #ffffff;
      color: #0876b9;
    }

    .otp-box.active {
      border-color: #f05a24;
      background: #fff;
      box-shadow: 0 0 0 3px rgba(240, 90, 36, 0.15);
    }

    .resend-row {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 14px;
      font-size: 13px;
    }

    .resend-countdown {
      color: #64748b;
    }

    .resend-countdown strong {
      color: #0f172a;
    }

    .btn-resend {
      background: none;
      border: none;
      color: #f05a24;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
      transition: background 0.15s;
    }

    .btn-resend:hover {
      background: #fff0eb;
    }

    /* PASSWORD STRENGTH */
    .strength-meter {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 8px;
    }

    .strength-bar-track {
      flex: 1;
      height: 5px;
      background: #e2e8f0;
      border-radius: 3px;
      overflow: hidden;
    }

    .strength-bar-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s ease, background-color 0.3s ease;
    }

    .strength-label {
      font-size: 11.5px;
      font-weight: 600;
      min-width: 48px;
      text-align: right;
    }

    /* MODAL ACTIONS */
    .modal-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }

    .modal-actions-centered {
      margin-top: 24px;
    }

    .btn-modal {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 11px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }

    .btn-modal.primary {
      background: #f05a24;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(240, 90, 36, 0.25);
    }

    .btn-modal.primary:hover:not(:disabled) {
      background: #d94914;
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(240, 90, 36, 0.35);
    }

    .btn-modal.primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .btn-modal.secondary {
      background: #f1f5f9;
      color: #475569;
    }

    .btn-modal.secondary:hover {
      background: #e2e8f0;
      color: #1e293b;
    }

    .btn-modal.full-width {
      width: 100%;
      padding: 13px 20px;
      font-size: 15px;
    }

    .btn-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(12px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

  `]
})
export class LoginPageComponent implements OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly state = inject(PortalStateService);
  private readonly auth = inject(AuthService);

  username = '';
  password = '';
  rememberMe = true;
  showPassword = false;
  loginError = '';
  loginSuccess = '';
  loading = false;

  // Forgot Password / OTP Flow State
  showForgotModal = false;
  forgotStep: 'email' | 'otp' | 'reset' | 'success' = 'email';
  forgotEmail = '';
  forgotOtp = '';
  forgotResetToken = '';
  forgotNewPassword = '';
  forgotConfirmPassword = '';
  forgotShowNewPassword = false;
  forgotShowConfirmPassword = false;
  forgotLoading = false;
  forgotError = '';
  forgotSuccessMsg = '';
  resendCountdown = 0;
  private resendTimer: any = null;

  private navigatePostLogin(role: Role): void {
    if (role === 'vendor') {
      const code = this.state.vendorStatusCode();
      if (code === 0) {
        this.router.navigate(['/vendor/profile']);
      } else if (code === 1) {
        this.router.navigate(['/vendor/profile'], { queryParams: { mode: 'review' } });
      } else if (code === 2) {
        this.router.navigate(['/vendor/profile'], { queryParams: { mode: 'pending' } });
      } else {
        this.router.navigate(['/vendor/dashboard']);
      }
      return;
    }

    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    if (returnUrl && returnUrl.startsWith(`/${role}`)) {
      this.router.navigateByUrl(returnUrl);
    } else {
      this.router.navigate(['/', role, 'dashboard']);
    }
  }

  signIn(): void {
    const inputUser = this.username.trim();
    const inputPass = this.password.trim();

    if (!inputUser || !inputPass) {
      this.loginError = 'Please enter both username and password.';
      return;
    }

    this.loading = true;
    this.loginError = '';

    const isExplicitVendor = inputUser.toLowerCase().includes('vendor') || inputUser.toUpperCase().startsWith('VEN-');
    const hasEmail = inputUser.includes('@');

    // If an email was entered, try VendorLogin first; if not found, fall back to UserLogin for staff
    if (hasEmail && !isExplicitVendor) {
      this.auth.vendorLogin({ usernameOrEmail: inputUser, password: inputPass }).subscribe({
        next: () => {
          this.loading = false;
          this.navigatePostLogin('vendor');
        },
        error: () => {
          this.auth.userLogin({ userid: inputUser, userpwd: inputPass }).subscribe({
            next: () => {
              this.loading = false;
              this.navigatePostLogin(this.state.role());
            },
            error: () => {
              this.loading = false;
              this.loginError = 'Login failed. If you are an internal staff member (Procurement, Finance, or Admin), please sign in using your User ID (e.g. PRO001) instead of your email address.';
            }
          });
        }
      });
      return;
    }

    const login$ = isExplicitVendor
      ? this.auth.vendorLogin({ usernameOrEmail: inputUser, password: inputPass })
      : this.auth.userLogin({ userid: inputUser, userpwd: inputPass });

    login$.subscribe({
      next: () => {
        this.loading = false;
        const role = isExplicitVendor ? 'vendor' : this.state.role();
        this.navigatePostLogin(role);
      },
      error: (err) => {
        this.loading = false;
        const errMsg = err?.message || err?.error?.message || err?.error?.title || (err?.status === 0 ? 'Unable to reach API server. Please check your network connection or CORS settings.' : 'Invalid credentials. Please verify your login details.');
        this.loginError = errMsg;
      }
    });
  }

  clearError(): void {
    if (this.loginError) {
      this.loginError = '';
    }
  }

  forgotPassword(): void {
    const trimmedUser = this.username.trim();
    if (trimmedUser.includes('@')) {
      this.forgotEmail = trimmedUser;
    
    } else {
      this.forgotEmail = '';
    }
    this.forgotStep = 'email';
    this.forgotOtp = '';
    this.forgotResetToken = '';
    this.forgotNewPassword = '';
    this.forgotConfirmPassword = '';
    this.forgotShowNewPassword = false;
    this.forgotShowConfirmPassword = false;
    this.forgotError = '';
    this.forgotSuccessMsg = '';
    this.clearResendTimer();
    this.showForgotModal = true;
  }

  closeForgotModal(): void {
    this.showForgotModal = false;
    this.clearResendTimer();
  }

  requestOtp(): void {
    const email = this.forgotEmail.trim();
    if (!email || !email.includes('@')) {
      this.forgotError = 'Please enter a valid vendor email address.';
      return;
    }

    this.forgotLoading = true;
    this.forgotError = '';
    this.forgotSuccessMsg = '';

    this.auth.vendorForgotPassword(email).subscribe({
      next: (res) => {
        this.forgotLoading = false;
        if (res?.status === '2' || res?.status === 2) {
          this.forgotError = res?.message || 'No registered vendor found with this email.';
          return;
        }
        this.forgotResetToken = res?.resetToken || res?.reseT_TOKEN || '';
        this.forgotSuccessMsg = res?.message || `A 6-digit verification code has been transmitted to ${email}.`;
        this.forgotStep = 'otp';
        this.startResendCountdown(60);
      },
      error: (err) => {
        this.forgotLoading = false;
        this.forgotError = err?.error?.message || 'Failed to send OTP code. Please check your email and network connection.';
      }
    });
  }

  onOtpChange(): void {
    this.forgotOtp = this.forgotOtp.replace(/[^0-9]/g, '');
    this.forgotError = '';
    if (this.forgotOtp.length === 6) {
      this.verifyOtp();
    }
  }

  verifyOtp(): void {
    const otp = this.forgotOtp.trim();
    if (otp.length < 6) {
      this.forgotError = 'Please enter the complete 6-digit verification code.';
      return;
    }

    this.forgotLoading = true;
    this.forgotError = '';

    this.auth.vendorVerifyOtp(this.forgotEmail.trim(), otp).subscribe({
      next: (res) => {
        this.forgotLoading = false;
        if (res?.status === '2' || res?.status === 2) {
          this.forgotError = res?.message || 'Invalid or expired OTP. Please verify the code and try again.';
          return;
        }
        if (res?.resetToken || res?.reseT_TOKEN) {
          this.forgotResetToken = res?.resetToken || res?.reseT_TOKEN;
        }
        this.forgotStep = 'reset';
        this.clearResendTimer();
      },
      error: (err) => {
        this.forgotLoading = false;
        this.forgotError = err?.error?.message || 'Invalid or expired OTP code.';
      }
    });
  }

  resendOtp(): void {
    if (this.resendCountdown > 0 || this.forgotLoading) return;
    this.forgotOtp = '';
    this.requestOtp();
  }

  resetPassword(): void {
    const p1 = this.forgotNewPassword;
    const p2 = this.forgotConfirmPassword;

    if (!p1 || p1.length < 6) {
      this.forgotError = 'Password must be at least 6 characters.';
      return;
    }
    if (p1 !== p2) {
      this.forgotError = 'Passwords do not match.';
      return;
    }

    this.forgotLoading = true;
    this.forgotError = '';

    this.auth.vendorResetPassword({
      email: this.forgotEmail.trim(),
      otp: this.forgotOtp.trim(),
      password: p1,
      reseT_TOKEN: this.forgotResetToken,
      resetToken: this.forgotResetToken
    }).subscribe({
      next: (res) => {
        this.forgotLoading = false;
        if (res?.status === '2' || res?.status === 2) {
          this.forgotError = res?.message || 'Password reset session expired. Please request a new OTP.';
          return;
        }
        this.forgotStep = 'success';
        this.username = this.forgotEmail;
        this.password = p1;
      },
      error: (err) => {
        this.forgotLoading = false;
        this.forgotError = err?.error?.message || 'Password reset failed. Please try again.';
      }
    });
  }

  finishReset(): void {
    this.showForgotModal = false;
    this.clearResendTimer();
    this.loginSuccess = 'Password updated successfully! Please sign in with your new credentials.';
    this.loginError = '';
  }

  startResendCountdown(seconds: number = 60): void {
    this.clearResendTimer();
    this.resendCountdown = seconds;
    this.resendTimer = setInterval(() => {
      if (this.resendCountdown > 0) {
        this.resendCountdown--;
      } else {
        this.clearResendTimer();
      }
    }, 1000);
  }

  clearResendTimer(): void {
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
      this.resendTimer = null;
    }
  }

  get passwordStrength(): { score: number; label: string; color: string } {
    const p = this.forgotNewPassword;
    if (!p) return { score: 0, label: '', color: '#d9e2e9' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 1) return { score: 25, label: 'Weak', color: '#dc2626' };
    if (score === 2) return { score: 50, label: 'Fair', color: '#f59e0b' };
    if (score === 3) return { score: 75, label: 'Good', color: '#10b981' };
    return { score: 100, label: 'Strong', color: '#059669' };
  }

  ngOnDestroy(): void {
    this.clearResendTimer();
  }

  contactAdministrator(): void {
    alert('TAMCO Help Desk: support@tamco.ae / Tel: +971 4 398 2200');
  }

  goToVendorRegistration(): void {
    this.state.setRole('vendor');
    this.router.navigate(['/vendor/profile']);
  }
}