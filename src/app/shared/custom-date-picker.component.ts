import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  computed,
  forwardRef,
  signal
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface CalendarDay {
  day: number;
  month: number; // 0-11
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isoDate: string; // YYYY-MM-DD
}

@Component({
  selector: 'app-custom-date-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDatePickerComponent),
      multi: true
    }
  ],
  template: `
    <div
      class="date-picker-wrapper"
      [class.is-open]="isOpen()"
      [class.is-disabled]="disabled"
      [class.is-readonly]="readonly"
      [class.compact]="compact"
      [style.min-width]="minWidth || (compact ? '120px' : '150px')"
    >
      <!-- Trigger Box (States 1, 2, 3, 4, 5) -->
      <button
        type="button"
        class="date-picker-trigger"
        [disabled]="disabled"
        (click)="toggleOpen($event)"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-label]="placeholder || 'Choose date'"
      >
        <!-- Calendar Grid Icon -->
        <span class="calendar-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <circle cx="8" cy="14" r="1" fill="currentColor" />
            <circle cx="12" cy="14" r="1" fill="currentColor" />
            <circle cx="16" cy="14" r="1" fill="currentColor" />
            <circle cx="8" cy="18" r="1" fill="currentColor" />
            <circle cx="12" cy="18" r="1" fill="currentColor" />
            <circle cx="16" cy="18" r="1" fill="currentColor" />
          </svg>
        </span>

        <!-- Displayed Date Text -->
        <span class="date-text" [class.is-placeholder]="!hasValue()">
          {{ formattedDisplayDate() }}
        </span>

        <!-- Chevron / Disabled Indicator -->
        @if (disabled) {
          <span class="status-indicator">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </span>
        } @else {
          <span class="chevron-icon" [class.rotated]="isOpen()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        }
      </button>

      <!-- Floating Calendar Popover Card (Outside Cards & Tables via Viewport Fixed Positioning) -->
      @if (isOpen()) {
        <div
          class="calendar-popover"
          [class.open-upwards]="openUpwards()"
          [style.top.px]="popoverTop()"
          [style.left.px]="popoverLeft()"
          (click)="$event.stopPropagation()"
        >
          <!-- Popover Header: Month/Year Dropdowns & Nav Arrows -->
          <div class="calendar-header">
            <div class="selectors-group">
              <!-- Month Selector Pill with true dropdown list -->
              <div class="selector-pill">
                <select
                  [ngModel]="displayedMonth()"
                  (ngModelChange)="onMonthSelect($event)"
                  (click)="$event.stopPropagation()"
                  aria-label="Select month"
                >
                  @for (m of monthNames; track $index) {
                    <option [value]="$index">{{ m }}</option>
                  }
                </select>
                <span class="pill-arrow">▼</span>
              </div>

              <!-- Year Selector Pill with true dropdown list -->
              <div class="selector-pill">
                <select
                  [ngModel]="displayedYear()"
                  (ngModelChange)="onYearSelect($event)"
                  (click)="$event.stopPropagation()"
                  aria-label="Select year"
                >
                  @for (y of availableYears; track y) {
                    <option [value]="y">{{ y }}</option>
                  }
                </select>
                <span class="pill-arrow">▼</span>
              </div>
            </div>

            <!-- Month Nav Buttons (‹ and ›) -->
            <div class="nav-group">
              <button type="button" class="nav-btn" (click)="prevMonth($event)" title="Previous Month">‹</button>
              <button type="button" class="nav-btn" (click)="nextMonth($event)" title="Next Month">›</button>
            </div>
          </div>

          <!-- Weekday Header: Mo Tu We Th Fr Sa Su -->
          <div class="weekday-row">
            @for (wd of weekdays; track wd) {
              <div class="weekday-cell">{{ wd }}</div>
            }
          </div>

          <!-- 42-Day Calendar Grid -->
          <div class="calendar-grid">
            @for (cDay of calendarDays(); track cDay.isoDate) {
              <div
                class="day-cell"
                [class.other-month]="!cDay.isCurrentMonth"
                [class.today]="cDay.isToday"
                [class.selected]="cDay.isSelected"
                (click)="selectDate(cDay, $event)"
              >
                <span class="day-number">{{ cDay.day }}</span>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
      position: relative;
      user-select: none;
      font-family: var(--font-family, inherit);
      vertical-align: middle;
      width: 100%;
    }

    .date-picker-wrapper {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;

      &.compact .date-picker-trigger {
        height: 34px;
        padding: 4px 10px;
        font-size: 12px;
      }
    }

    /* Trigger Button (Reference: 1. Placeholder, 2. Hover, 3. Filled, 4. Disabled, 5. Focused) */
    .date-picker-trigger {
      display: flex;
      align-items: center;
      gap: 9px;
      width: 100%;
      height: 38px;
      padding: 7px 12px;
      background: #ffffff;
      border: 1px solid var(--line-strong, #cbd5e1);
      border-radius: var(--radius-sm, 8px);
      cursor: pointer;
      font-size: 12.5px;
      font-weight: 500;
      color: var(--text, #0f172a);
      text-align: left;
      outline: none;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
      transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
      box-sizing: border-box;

      /* Hover State (Reference Item 2) */
      &:hover:not(:disabled) {
        border-color: var(--role-accent, #2563eb);
        background: #ffffff;
        box-shadow: 0 2px 6px rgba(37, 99, 235, 0.08);

        .calendar-icon {
          color: var(--role-accent, #2563eb);
        }
      }

      &:disabled {
        background: #f8fafc;
        border-color: var(--line, #e2e8f0);
        cursor: not-allowed;
        opacity: 0.75;
      }
    }

    /* Focused / Open State (Reference Item 5) */
    .is-open .date-picker-trigger {
      border: 1.5px solid var(--role-accent, #2563eb);
      box-shadow: 0 0 0 3px var(--role-soft, rgba(37, 99, 235, 0.16));
      background: #ffffff;

      .calendar-icon {
        color: var(--role-accent, #2563eb);
      }
    }

    .calendar-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--role-accent, #16a34a);
      flex-shrink: 0;
      transition: color 0.18s ease;
    }

    .date-text {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-variant-numeric: tabular-nums;

      &.is-placeholder {
        color: #94a3b8;
        font-weight: 400;
      }
    }

    .chevron-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      flex-shrink: 0;
      transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), color 0.15s ease;

      &.rotated {
        transform: rotate(180deg);
        color: var(--role-accent, #2563eb);
      }
    }

    .status-indicator {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #cbd5e1;
      flex-shrink: 0;
    }

    /* Floating Calendar Popover (Escapes all cards & tables using Fixed Positioning) */
    .calendar-popover {
      position: fixed;
      z-index: 999999;
      width: 236px;
      background: #ffffff;
      border: 1px solid var(--line, #e2e8f0);
      border-radius: 10px;
      box-shadow: 0 12px 32px -4px rgba(15, 23, 42, 0.2), 0 4px 12px -2px rgba(15, 23, 42, 0.08);
      padding: 10px 10px 8px;
      animation: popoverFadeIn 0.05s cubic-bezier(0.16, 1, 0.3, 1);
      box-sizing: border-box;
      will-change: transform, opacity;
    }

    @keyframes popoverFadeIn {
      from {
        opacity: 0.8;
        transform: translateY(-2px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Calendar Header */
    .calendar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
      gap: 4px;
    }

    .selectors-group {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .selector-pill {
      position: relative;
      display: inline-flex;
      align-items: center;
      background: #f1f5f9;
      border: 1px solid transparent;
      border-radius: 6px;
      transition: all 0.15s ease;

      &:hover {
        background: var(--role-soft, #eff6ff);
        border-color: var(--role-border, #bfdbfe);
      }

      select {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        background: transparent;
        border: 0;
        padding: 3px 18px 3px 6px;
        font-size: 11.5px;
        font-weight: 600;
        color: var(--text, #0f172a);
        cursor: pointer;
        outline: none;
        width: auto;
        line-height: 1.2;

        &:focus {
          color: var(--role-accent, #2563eb);
        }

        option {
          background: #ffffff;
          color: #0f172a;
          font-size: 12px;
          padding: 4px;
        }
      }

      .pill-arrow {
        position: absolute;
        right: 6px;
        pointer-events: none;
        font-size: 8px;
        color: #64748b;
        transform: scaleY(0.7);
      }
    }

    .nav-group {
      display: flex;
      align-items: center;
      gap: 3px;
    }

    .nav-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 1px solid var(--line, #e2e8f0);
      background: #ffffff;
      color: #64748b;
      font-size: 14px;
      font-weight: 700;
      line-height: 1;
      padding: 0;
      cursor: pointer;
      transition: all 0.14s ease;

      &:hover {
        background: var(--role-soft, #eff6ff);
        color: var(--role-accent, #2563eb);
        border-color: var(--role-border, #bfdbfe);
      }
    }

    /* Weekday Header */
    .weekday-row {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
      margin-bottom: 4px;
    }

    .weekday-cell {
      font-size: 10px;
      font-weight: 600;
      color: #94a3b8;
      padding: 2px 0;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    /* Calendar Grid Matrix */
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
    }

    .day-cell {
      height: 26px;
      width: 26px;
      margin: 0 auto;
      display: grid;
      place-items: center;
      border-radius: 50%;
      cursor: pointer;
      font-size: 11px;
      font-weight: 500;
      color: var(--text, #0f172a);
      transition: all 0.14s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      border: 1.5px solid transparent;

      &:hover:not(.selected) {
        border-color: var(--role-accent, #2563eb);
        color: var(--role-accent, #2563eb);
      }

      &.other-month {
        color: #cbd5e1;
        font-weight: 400;

        &:hover:not(.selected) {
          color: #94a3b8;
          border-color: #cbd5e1;
        }
      }

      &.today:not(.selected) {
        font-weight: 700;
        border-color: var(--role-accent, #2563eb);
      }

      &.selected {
        background: var(--role-accent, #2563eb) !important;
        color: #ffffff !important;
        border-color: var(--role-accent, #2563eb) !important;
        font-weight: 700;
        box-shadow: 0 2px 5px rgba(37, 99, 235, 0.35);
      }
    }
  `]
})
export class CustomDatePickerComponent implements ControlValueAccessor, OnDestroy {
  @Input() placeholder = 'dd/mm/yyyy';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() compact = false;
  @Input() minWidth?: string;

  @Output() dateChange = new EventEmitter<string>();

  private static activePicker: CustomDatePickerComponent | null = null;

  readonly monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  readonly weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  readonly availableYears: number[] = [];

  readonly isOpen = signal(false);
  readonly openUpwards = signal(false);
  readonly popoverTop = signal<number>(0);
  readonly popoverLeft = signal<number>(0);

  // Current calendar view state
  readonly displayedMonth = signal<number>(new Date().getMonth());
  readonly displayedYear = signal<number>(new Date().getFullYear());
  readonly selectedDateIso = signal<string>('');

  // Internal value in YYYY-MM-DD
  private innerValue: string = '';

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef) {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear - 10; y <= currentYear + 10; y++) {
      this.availableYears.push(y);
    }
  }

  ngOnDestroy(): void {
    if (CustomDatePickerComponent.activePicker === this) {
      CustomDatePickerComponent.activePicker = null;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (this.isOpen()) {
      this.repositionPopover();
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.isOpen()) {
      this.repositionPopover();
    }
  }

  writeValue(val: any): void {
    if (val) {
      const parsed = this.parseDateString(String(val));
      if (parsed) {
        this.innerValue = this.formatIso(parsed);
        this.selectedDateIso.set(this.innerValue);
        this.displayedMonth.set(parsed.getMonth());
        this.displayedYear.set(parsed.getFullYear());
        return;
      }
    }
    this.innerValue = '';
    this.selectedDateIso.set('');
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  hasValue(): boolean {
    return !!this.selectedDateIso();
  }

  readonly formattedDisplayDate = computed<string>(() => {
    const val = this.selectedDateIso();
    if (!val) return this.placeholder;
    const parsed = this.parseDateString(val);
    if (!parsed) return this.placeholder;
    const dd = String(parsed.getDate()).padStart(2, '0');
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const yyyy = parsed.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  });

  toggleOpen(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.disabled || this.readonly) return;
    if (this.isOpen()) {
      this.close();
    } else {
      if (CustomDatePickerComponent.activePicker && CustomDatePickerComponent.activePicker !== this) {
        CustomDatePickerComponent.activePicker.close();
      }
      CustomDatePickerComponent.activePicker = this;

      if (this.innerValue) {
        const parsed = this.parseDateString(this.innerValue);
        if (parsed) {
          this.displayedMonth.set(parsed.getMonth());
          this.displayedYear.set(parsed.getFullYear());
        }
      }
      this.repositionPopover();
      this.isOpen.set(true);
      this.onTouched();
    }
  }

  repositionPopover(): void {
    const triggerEl = this.elementRef.nativeElement.querySelector('.date-picker-trigger') || this.elementRef.nativeElement;
    const rect = triggerEl.getBoundingClientRect();

    // If trigger has scrolled completely off view, close it
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      this.close();
      return;
    }

    const popoverWidth = 236;
    const popoverHeight = 220;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let top = 0;
    if (spaceBelow < popoverHeight + 10 && spaceAbove > popoverHeight + 10) {
      top = Math.max(8, rect.top - popoverHeight - 6);
      this.openUpwards.set(true);
    } else {
      top = rect.bottom + 6;
      this.openUpwards.set(false);
    }

    let left = rect.left;
    if (left + popoverWidth > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - popoverWidth - 12);
    }
    if (left < 12) {
      left = 12;
    }

    this.popoverTop.set(Math.round(top));
    this.popoverLeft.set(Math.round(left));
  }

  close(): void {
    if (CustomDatePickerComponent.activePicker === this) {
      CustomDatePickerComponent.activePicker = null;
    }
    this.isOpen.set(false);
  }

  onMonthSelect(val: any): void {
    const month = parseInt(val, 10);
    if (!isNaN(month)) {
      this.displayedMonth.set(month);
    }
  }

  onYearSelect(val: any): void {
    const year = parseInt(val, 10);
    if (!isNaN(year)) {
      this.displayedYear.set(year);
    }
  }

  prevMonth(event: MouseEvent): void {
    event.stopPropagation();
    if (this.displayedMonth() === 0) {
      this.displayedMonth.set(11);
      this.displayedYear.update(y => y - 1);
    } else {
      this.displayedMonth.update(m => m - 1);
    }
  }

  nextMonth(event: MouseEvent): void {
    event.stopPropagation();
    if (this.displayedMonth() === 11) {
      this.displayedMonth.set(0);
      this.displayedYear.update(y => y + 1);
    } else {
      this.displayedMonth.update(m => m + 1);
    }
  }

  readonly calendarDays = computed<CalendarDay[]>(() => {
    const year = this.displayedYear();
    const month = this.displayedMonth();
    const selectedIso = this.selectedDateIso();

    const today = new Date();
    const todayIso = this.formatIso(today);

    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    // Monday-based indexing: (day + 6) % 7
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;

    const days: CalendarDay[] = [];

    // 1. Leading days from previous month
    const prevMonthDays = new Date(year, month, 0).getDate();
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonth = month === 0 ? 11 : month - 1;

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const iso = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        day: d,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
        isToday: iso === todayIso,
        isSelected: iso === selectedIso,
        isoDate: iso
      });
    }

    // 2. Days of current month
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        day: d,
        month,
        year,
        isCurrentMonth: true,
        isToday: iso === todayIso,
        isSelected: iso === selectedIso,
        isoDate: iso
      });
    }

    // 3. Trailing days from next month (fill up to 42 cells)
    const nextYear = month === 11 ? year + 1 : year;
    const nextMonth = month === 11 ? 0 : month + 1;
    const remaining = 42 - days.length;

    for (let d = 1; d <= remaining; d++) {
      const iso = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        day: d,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
        isToday: iso === todayIso,
        isSelected: iso === selectedIso,
        isoDate: iso
      });
    }

    return days;
  });

  selectDate(cDay: CalendarDay, event: MouseEvent): void {
    event.stopPropagation();
    this.innerValue = cDay.isoDate;
    this.selectedDateIso.set(this.innerValue);
    this.onChange(this.innerValue);
    this.dateChange.emit(this.innerValue);
    this.close();
  }

  selectToday(event: MouseEvent): void {
    event.stopPropagation();
    const today = new Date();
    const iso = this.formatIso(today);
    this.innerValue = iso;
    this.selectedDateIso.set(this.innerValue);
    this.displayedMonth.set(today.getMonth());
    this.displayedYear.set(today.getFullYear());
    this.onChange(this.innerValue);
    this.dateChange.emit(this.innerValue);
    this.close();
  }

  clearDate(event: MouseEvent): void {
    event.stopPropagation();
    this.innerValue = '';
    this.selectedDateIso.set('');
    this.onChange('');
    this.dateChange.emit('');
    this.close();
  }

  private parseDateString(str: string): Date | null {
    if (!str) return null;
    const parts = str.split('T')[0].split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const dt = new Date(y, m, d);
      if (!isNaN(dt.getTime())) return dt;
    }
    const fallback = new Date(str);
    return isNaN(fallback.getTime()) ? null : fallback;
  }

  private formatIso(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
