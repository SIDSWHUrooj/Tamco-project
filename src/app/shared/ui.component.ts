import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  template: `
    <article class="stat-card">
      <div class="stat-head"><span>{{ label }}</span><span class="stat-icon">{{ icon }}</span></div>
      <strong>{{ value }}</strong>
      <small [class.danger]="tone === 'danger'" [class.good]="tone === 'good'">{{ note }}</small>
    </article>
  `
})
export class StatCardComponent {
  @Input({ required: true }) label = '';
  @Input({ required: true }) value = '';
  @Input() note = '';
  @Input() icon = '•';
  @Input() tone: 'normal' | 'danger' | 'good' = 'normal';
}

@Component({
  selector: 'app-page-heading',
  standalone: true,
  template: `
    <div class="page-heading">
      <div>
        @if (eyebrow) {
          <p class="eyebrow">{{ eyebrow }}</p>
        }
        <h1>{{ title }}</h1>
      </div>
      <ng-content />
    </div>
  `
})
export class PageHeadingComponent {
  @Input() eyebrow = 'VendorFlow';
  @Input({ required: true }) title = '';
  @Input() subtitle = '';
}

@Component({
  selector: 'app-status',
  standalone: true,
  template: `<span class="status" [class.good]="good" [class.bad]="bad" [class.warn]="warn">{{ text }}</span>`
})
export class StatusComponent {
  @Input({ required: true }) text = '';
  @Input() good = false;
  @Input() bad = false;
  @Input() warn = false;
}
