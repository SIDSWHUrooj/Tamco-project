import { Injectable, computed, signal } from '@angular/core';

export type ThemePreference = 'light' | 'dark' | 'system';
const KEY = 'vp.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly preference = signal<ThemePreference>(this.read());
  private readonly systemDark = signal<boolean>(this.mql()?.matches ?? false);
  readonly effective = computed<'light' | 'dark'>(() =>
    this.preference() === 'system' ? (this.systemDark() ? 'dark' : 'light') : (this.preference() as 'light' | 'dark'));

  constructor() {
    this.apply();
    this.mql()?.addEventListener?.('change', e => { this.systemDark.set(e.matches); this.apply(); });
  }

  set(pref: ThemePreference): void {
    this.preference.set(pref);
    try { localStorage.setItem(KEY, pref); } catch {}
    this.apply();
  }

  toggle(): void { this.set(this.effective() === 'dark' ? 'light' : 'dark'); }

  private apply(): void {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', this.effective());
  }
  private mql(): MediaQueryList | null {
    return typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  }
  private read(): ThemePreference {
    try { const v = localStorage.getItem(KEY); if (v === 'light' || v === 'dark' || v === 'system') return v; } catch {}
    return 'system';
  }
}
