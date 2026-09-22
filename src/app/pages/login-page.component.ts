import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Role } from '../core/models';
import { PortalStateService } from '../core/portal-state.service';

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
                  Email Id
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
                    placeholder="Enter your email address"
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
                [disabled]="!username.trim() || !password"
              >
                <span>Sign in</span>
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

        padding:
          0 15px;

      }

    }

  `]
})
export class LoginPageComponent {

  private readonly router = inject(Router);
  private readonly state = inject(PortalStateService);


  readonly roles: {
    value: Role;
    label: string;
    icon: string;
  }[] = [

    {
      value: 'vendor',
      label: 'Vendor',
      icon: ''
    },

    {
      value: 'admin',
      label: 'Admin',
      icon: ''
    },

    {
      value: 'procurement',
      label: 'Procurement',
      icon: ''
    },

    {
      value: 'finance',
      label: 'Finance',
      icon: ''
    }

  ];


  username = '';
  password = '';

  role: Role = 'vendor';

  rememberMe = true;
  showPassword = false;

  loginError = '';


  signIn(): void {

    const username =
      this.username
        .trim()
        .toLowerCase();


    const matchedRole =
      this.roles.find(
        option =>
          option.value === username ||
          username.startsWith(option.value) ||
          username.includes(option.value)
      )?.value || (username ? 'vendor' : undefined);

    if (
      !matchedRole ||
      (this.password !== '123' && this.password.length < 3)
    ) {

      this.loginError =
        'Invalid username or password. Please check your credentials and try again.';

      return;
    }


    this.role =
      matchedRole;


    this.state.signIn(
      this.role
    );


    this.router.navigate([
      '/',
      this.role,
      'dashboard'
    ]);

  }


  clearError(): void {

    if (this.loginError) {
      this.loginError = '';
    }

  }


  forgotPassword(): void {

    /*
      Add your password reset
      navigation/modal here.
    */

  }


  contactAdministrator(): void {

    /*
      Add TAMCO help desk,
      administrator contact,
      modal or support page here.
    */

  }


  selectRole(role: Role): void {

    this.role =
      role;

    this.username =
      role;

    this.loginError =
      '';

  }

}