import { Component, Input, OnChanges, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from './icon.component';

const nf = (n: number) => n.toLocaleString('en-US');

/* =========================================================
   KPI CARD — icon tile, animated number, optional progress
   ========================================================= */
@Component({
  selector: 'app-kpi',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <article class="kpi" [attr.data-tone]="tone">
      <div class="kpi-head">
        <span class="kpi-icon"><app-icon [name]="icon" [size]="18" /></span>
        <span class="kpi-label">{{ label }}</span>
      </div>
      <div class="kpi-value" [attr.aria-label]="label + ': ' + display()">{{ display() }}</div>
      <div class="kpi-note">{{ note }}</div>
      @if (pct !== null) {
        <div class="kpi-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" [attr.aria-valuenow]="pct" [attr.aria-label]="barLabel">
          <i [style.width.%]="pct"></i>
        </div>
        <div class="kpi-bar-label">{{ barLabel }}</div>
      }
      @if (link) { <a class="kpi-link" [routerLink]="link">{{ linkText }} <span aria-hidden="true">→</span></a> }
    </article>
  `,
  styles: [`
    :host { display: block; min-width: 0; }
    .kpi { --t: var(--role-accent); --t-soft: var(--role-soft); position: relative; height: 100%; overflow: hidden;
      padding: 16px 16px 14px; border-radius: 14px; background: var(--panel); border: 1px solid var(--line); box-shadow: var(--shadow-xs);
      display: flex; flex-direction: column; gap: 2px;
      transition: transform .18s var(--ease), box-shadow .18s var(--ease), border-color .18s var(--ease); }
    .kpi::before { content: ''; position: absolute; inset: 0 0 auto 0; height: 3px; background: var(--t); opacity: .9; }
    .kpi::after { content: ''; position: absolute; right: -34px; top: -34px; width: 110px; height: 110px; border-radius: 50%;
      background: radial-gradient(closest-side, var(--t-soft), transparent); pointer-events: none; }
    .kpi:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: var(--t); }
    .kpi[data-tone="good"] { --t: var(--green); --t-soft: var(--green-soft); }
    .kpi[data-tone="warn"] { --t: var(--amber); --t-soft: var(--amber-soft); }
    .kpi[data-tone="bad"] { --t: var(--red); --t-soft: var(--red-soft); }
    .kpi[data-tone="info"] { --t: var(--blue); --t-soft: var(--blue-soft); }
    .kpi[data-tone="violet"] { --t: var(--purple); --t-soft: var(--purple-soft); }
    .kpi-head { display: flex; align-items: center; gap: 10px; position: relative; z-index: 1; }
    .kpi-icon { width: 34px; height: 34px; flex: none; display: grid; place-items: center; border-radius: 10px; color: var(--t); background: var(--t-soft); border: 1px solid color-mix(in srgb, var(--t) 28%, transparent); }
    .kpi-label { font-size: 11.5px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; color: var(--muted); line-height: 1.25; }
    .kpi-value { margin-top: 10px; font-size: 32px; font-weight: 800; letter-spacing: -.03em; line-height: 1.1; color: var(--text); font-variant-numeric: tabular-nums; position: relative; z-index: 1; overflow-wrap: anywhere; }
    .kpi-note { font-size: 12px; color: var(--muted); position: relative; z-index: 1; }
    .kpi-bar { margin-top: 12px; height: 6px; border-radius: 999px; background: var(--surface-3); overflow: hidden; }
    .kpi-bar i { display: block; height: 100%; border-radius: 999px; background: var(--t); transform-origin: left; animation: kgrow .8s var(--ease); }
    .kpi-bar-label { margin-top: 4px; font-size: 11px; color: var(--text-2); }
    .kpi-link { margin-top: auto; padding-top: 10px; font-size: 12px; font-weight: 700; color: var(--t); position: relative; z-index: 1; }
    .kpi-link:hover { text-decoration: underline; }
    @keyframes kgrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  `]
})
export class KpiComponent implements OnChanges {
  @Input({ required: true }) label = '';
  @Input({ required: true }) value: number | string = 0;
  @Input() prefix = '';
  @Input() suffix = '';
  @Input() note = '';
  @Input() icon = 'dashboard';
  @Input() tone: 'brand' | 'good' | 'warn' | 'bad' | 'info' | 'violet' = 'brand';
  @Input() link: any[] | null = null;
  @Input() linkText = 'Open';
  @Input() pct: number | null = null;
  @Input() barLabel = '';
  readonly display = signal('0');
  private raf = 0;

  ngOnChanges(): void {
    cancelAnimationFrame(this.raf);
    const v = this.value;
    if (typeof v !== 'number') { this.display.set(String(v)); return; }
    const fmt = (n: number) => this.prefix + nf(n) + this.suffix;
    if (typeof window === 'undefined' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { this.display.set(fmt(v)); return; }
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / 700);
      this.display.set(fmt(Math.round(v * (1 - Math.pow(1 - p, 3)))));
      if (p < 1) this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }
}

/* =========================================================
   DONUT — part-to-whole, hover/focus reads value in the centre
   ========================================================= */
export interface Datum { label: string; value: number; color: string; }

@Component({
  selector: 'app-donut',
  standalone: true,
  template: `
    <div class="dn">
      <div class="dring">
        <svg viewBox="0 0 140 140" role="img" [attr.aria-label]="ariaLabel">
          <circle cx="70" cy="70" r="54" class="track" />
          @for (s of segs; track s.label; let i = $index) {
            <circle cx="70" cy="70" r="54" class="seg" [class.dim]="hover() !== null && hover() !== i"
                    [attr.stroke]="s.color" [attr.stroke-dasharray]="s.dash" [attr.stroke-dashoffset]="s.offset"
                    tabindex="0" [attr.aria-label]="s.label + ': ' + s.value + ' (' + s.pct + '%)'"
                    (mouseenter)="hover.set(i)" (mouseleave)="hover.set(null)" (focus)="hover.set(i)" (blur)="hover.set(null)" />
          }
        </svg>
        <div class="dcentre">
          @if (hover() !== null && segs[hover()!]) {
            <b>{{ segs[hover()!].value }}</b><small>{{ segs[hover()!].label }} · {{ segs[hover()!].pct }}%</small>
          } @else {
            <b>{{ centerValue }}</b><small>{{ centerLabel }}</small>
          }
        </div>
      </div>
      <ul class="dlegend">
        @for (s of segs; track s.label; let i = $index) {
          <li (mouseenter)="hover.set(i)" (mouseleave)="hover.set(null)" [class.on]="hover() === i">
            <i [style.background]="s.color"></i><span>{{ s.label }}</span><b>{{ s.value }}</b>
          </li>
        } @empty { <li class="none">No records yet</li> }
      </ul>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .dn { display: grid; justify-items: center; gap: 14px; }
    .dring { position: relative; width: 150px; height: 150px; }
    svg { width: 100%; height: 100%; transform: rotate(-90deg); }
    circle { fill: none; stroke-width: 15; }
    .track { stroke: var(--surface-3); }
    .seg { stroke-linecap: butt; cursor: pointer; transition: opacity .15s, stroke-width .15s; animation: dsweep .9s var(--ease); outline: none; }
    .seg:hover, .seg:focus-visible { stroke-width: 18; }
    .seg.dim { opacity: .35; }
    @keyframes dsweep { from { stroke-dasharray: 0 400; } }
    .dcentre { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 26px; pointer-events: none; }
    .dcentre b { font-size: 26px; font-weight: 800; letter-spacing: -.02em; color: var(--text); line-height: 1.1; }
    .dcentre small { font-size: 10.5px; color: var(--muted); line-height: 1.25; margin-top: 2px; }
    .dlegend { list-style: none; margin: 0; padding: 0; width: 100%; display: grid; gap: 2px; }
    .dlegend li { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 8px; font-size: 12.5px; color: var(--text-2); transition: background .12s; }
    .dlegend li.on, .dlegend li:hover { background: var(--surface-3); }
    .dlegend i { width: 10px; height: 10px; border-radius: 3px; flex: none; }
    .dlegend span { flex: 1; min-width: 0; overflow-wrap: anywhere; }
    .dlegend b { color: var(--text); font-variant-numeric: tabular-nums; }
    .none { color: var(--muted); }
  `]
})
export class DonutComponent implements OnChanges {
  @Input() data: Datum[] = [];
  @Input() centerValue: string | number = '';
  @Input() centerLabel = '';
  @Input() ariaLabel = 'Distribution chart';
  segs: { label: string; value: number; color: string; pct: number; dash: string; offset: number }[] = [];
  readonly hover = signal<number | null>(null);

  ngOnChanges(): void {
    const rows = this.data.filter(d => d.value > 0);
    const total = rows.reduce((a, d) => a + d.value, 0);
    const C = 2 * Math.PI * 54;
    const gap = rows.length > 1 ? 2.5 : 0;
    let cum = 0;
    this.segs = rows.map(d => {
      const len = (d.value / total) * C;
      const seg = { label: d.label, value: d.value, color: d.color, pct: Math.round((d.value / total) * 100),
        dash: `${Math.max(len - gap, 0.5)} ${C}`, offset: -cum };
      cum += len;
      return seg;
    });
    if (this.centerValue === '') this.centerValue = total;
  }
}

/* =========================================================
   BAR LIST — ranked horizontal bars with direct values
   ========================================================= */
export interface BarDatum { label: string; value: number; sub?: string; color?: string; }

@Component({
  selector: 'app-bar-list',
  standalone: true,
  template: `
    <ul class="bars" [attr.aria-label]="ariaLabel">
      @for (d of data; track d.label; let i = $index) {
        <li [title]="d.label + ': ' + prefix + fmt(d.value) + suffix" tabindex="0">
          <div class="row"><span class="name">{{ d.label }}</span><b>{{ prefix }}{{ fmt(d.value) }}{{ suffix }}</b></div>
          <div class="track"><i [style.width.%]="max ? (d.value / max) * 100 : 0" [style.background]="d.color || 'var(--viz-1)'" [style.animation-delay.ms]="i * 70"></i></div>
          @if (d.sub) { <small>{{ d.sub }}</small> }
        </li>
      } @empty { <li class="none">No records yet</li> }
    </ul>
  `,
  styles: [`
    :host { display: block; }
    .bars { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
    li { outline: none; border-radius: 8px; padding: 2px 4px; margin: 0 -4px; transition: background .12s; }
    li:hover, li:focus-visible { background: var(--surface-2); }
    .row { display: flex; justify-content: space-between; gap: 10px; font-size: 12.5px; color: var(--text-2); margin-bottom: 5px; }
    .name { min-width: 0; overflow-wrap: anywhere; }
    .row b { color: var(--text); font-variant-numeric: tabular-nums; white-space: nowrap; }
    .track { height: 8px; border-radius: 4px; background: var(--surface-3); overflow: hidden; }
    .track i { display: block; height: 100%; border-radius: 4px; transform-origin: left; animation: bgrow .8s var(--ease) backwards; }
    small { display: block; margin-top: 3px; font-size: 11px; color: var(--muted); }
    .none { color: var(--muted); font-size: 12.5px; }
    @keyframes bgrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  `]
})
export class BarListComponent implements OnChanges {
  @Input() data: BarDatum[] = [];
  @Input() prefix = '';
  @Input() suffix = '';
  @Input() ariaLabel = 'Ranked bars';
  max = 0;
  fmt = nf;
  ngOnChanges(): void { this.max = Math.max(0, ...this.data.map(d => d.value)); }
}

/* =========================================================
   COLUMN CHART — vertical bars, 4px rounded tops, hover value
   ========================================================= */
@Component({
  selector: 'app-columns',
  standalone: true,
  template: `
    <svg [attr.viewBox]="'0 0 ' + W + ' ' + H" class="cols" role="img" [attr.aria-label]="ariaLabel">
      @for (g of grid; track g.y) {
        <line [attr.x1]="L" [attr.x2]="W - 6" [attr.y1]="g.y" [attr.y2]="g.y" class="grid" />
        <text [attr.x]="L - 6" [attr.y]="g.y + 3.5" text-anchor="end" class="ax">{{ g.label }}</text>
      }
      @for (b of bars; track b.label; let i = $index) {
        <g class="bar" tabindex="0" [class.dim]="hover() !== null && hover() !== i"
           (mouseenter)="hover.set(i)" (mouseleave)="hover.set(null)" (focus)="hover.set(i)" (blur)="hover.set(null)"
           [attr.aria-label]="b.label + ': ' + prefix + fmt(b.value)">
          <rect [attr.x]="b.x - 4" [attr.y]="T" [attr.width]="b.w + 8" [attr.height]="H - T - B" fill="transparent" />
          <path [attr.d]="b.path" [attr.fill]="b.color" [style.animation-delay.ms]="i * 60" />
          @if (bars.length <= 6 || hover() === i) {
            <text [attr.x]="b.x + b.w / 2" [attr.y]="b.top - 6" text-anchor="middle" class="val">{{ prefix }}{{ fmtC(b.value) }}</text>
          }
          <text [attr.x]="b.x + b.w / 2" [attr.y]="H - B + 15" text-anchor="middle" class="ax">{{ b.short }}</text>
        </g>
      }
    </svg>
    @if (!bars.length) { <p class="none">No records yet</p> }
  `,
  styles: [`
    :host { display: block; }
    .cols { width: 100%; height: auto; display: block; overflow: visible; }
    .grid { stroke: var(--line); stroke-width: 1; stroke-dasharray: 3 4; }
    .ax { font-size: 10px; fill: var(--muted); }
    .val { font-size: 11px; font-weight: 700; fill: var(--text); font-variant-numeric: tabular-nums; }
    .bar { outline: none; cursor: pointer; transition: opacity .15s; }
    .bar.dim { opacity: .4; }
    .bar path { transform-box: fill-box; transform-origin: bottom; animation: cgrow .8s var(--ease) backwards; }
    .bar:focus-visible path { stroke: var(--text); stroke-width: 1.5; }
    .none { color: var(--muted); font-size: 12.5px; margin: 0; }
    @keyframes cgrow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
  `]
})
export class ColumnsComponent implements OnChanges {
  @Input() data: BarDatum[] = [];
  @Input() prefix = '';
  @Input() ariaLabel = 'Column chart';
  readonly W = 440; readonly H = 210; readonly L = 44; readonly T = 22; readonly B = 30;
  bars: { label: string; short: string; value: number; x: number; w: number; top: number; path: string; color: string }[] = [];
  grid: { y: number; label: string }[] = [];
  readonly hover = signal<number | null>(null);
  fmt = nf;
  fmtC = (n: number) => n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M' : n >= 10_000 ? Math.round(n / 1000) + 'k' : n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);

  ngOnChanges(): void {
    const rows = this.data;
    const rawMax = Math.max(1, ...rows.map(d => d.value));
    const mag = Math.pow(10, Math.floor(Math.log10(rawMax)));
    const max = Math.ceil(rawMax / mag * 2) / 2 * mag || 1;   // nice ceiling
    const ph = this.H - this.T - this.B, pw = this.W - this.L - 6;
    this.grid = [0, 1, 2, 3, 4].map(i => ({ y: this.T + ph - (ph * i) / 4, label: this.fmtC(Math.round((max * i) / 4)) }));
    const slot = pw / Math.max(rows.length, 1), w = Math.min(46, slot * 0.58);
    this.bars = rows.map((d, i) => {
      const h = Math.max(2, (d.value / max) * ph), x = this.L + slot * i + (slot - w) / 2, y = this.T + ph - h, r = Math.min(4, h, w / 2);
      return { label: d.label, short: d.label.length > 11 ? d.label.slice(0, 10) + '…' : d.label, value: d.value, x, w, top: y,
        color: d.color || 'var(--viz-1)',
        path: `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z` };
    });
  }
}
