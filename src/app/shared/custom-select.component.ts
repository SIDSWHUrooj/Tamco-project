import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
  forwardRef,
  signal
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface SelectOption {
  value: any;
  label: string;
  badge?: string;
}

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true
    }
  ],
  template: `
    <div
      class="custom-select-container"
      [class.has-label]="!!label"
      [class.is-open]="isOpen()"
      [class.is-disabled]="disabled"
      [style.min-width]="minWidth"
    >
      @if (label) {
        <label class="floating-label">{{ label }}</label>
      }

      <!-- Trigger Box (Option 1) -->
      <button
        type="button"
        class="custom-select-trigger"
        [disabled]="disabled"
        (click)="toggleOpen($event)"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-label]="label || placeholder"
      >
        <span class="selected-text" [class.is-placeholder]="!hasSelection()">
          {{ currentLabel() }}
        </span>

        <span class="chevron-icon" [class.rotated]="isOpen()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      <!-- Dropdown Menu Popover (Option 1 - Floats Outside Card) -->
      @if (isOpen()) {
        <div class="custom-select-menu" [class.open-upward]="openUpward()" role="listbox">
          @for (opt of normalizedOptions(); track opt.value) {
            <div
              class="custom-select-option"
              [class.is-selected]="isSelected(opt.value)"
              role="option"
              [attr.aria-selected]="isSelected(opt.value)"
              (click)="selectOption(opt, $event)"
            >
              <span class="option-label">{{ opt.label }}</span>

              @if (opt.badge) {
                <span class="option-badge">{{ opt.badge }}</span>
              }

              @if (isSelected(opt.value)) {
                <span class="check-icon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
      user-select: none;
      font-family: inherit;
      width: 100%;
      z-index: 1;

      &.is-open {
        z-index: 1050;
      }
    }

    .custom-select-container {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;

      &.is-open {
        z-index: 1050;
      }
    }

    /* Option 1 Clean Top Label */
    .floating-label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 6px;
      letter-spacing: 0.01em;
      transition: color 0.15s ease;
    }

    .is-open .floating-label {
      color: var(--role-accent, #50ae9b);
    }

    /* Option 1 Trigger Box */
    .custom-select-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      width: 100%;
      height: 38px;
      padding: 8px 14px;
      background: #ffffff;
      border: 1px solid var(--line-strong, #cbd5e1);
      border-radius: 10px;
      cursor: pointer;
      font-size: 13.5px;
      font-weight: 500;
      color: var(--text, #1e293b);
      text-align: left;
      outline: none;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
      box-sizing: border-box;
      transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover:not(:disabled) {
        border-color: var(--role-accent, #50ae9b);
        background-color: #f8fafc;
      }

      &:focus,
      &:focus-visible {
        border-color: var(--role-accent, #50ae9b);
        box-shadow: 0 0 0 3px var(--role-soft, rgba(80, 174, 155, 0.2));
      }

      &:disabled {
        background: #f1f5f9;
        color: #94a3b8;
        cursor: not-allowed;
        border-color: #e2e8f0;
      }
    }

    .is-open .custom-select-trigger {
      border-color: var(--role-accent, #50ae9b);
      box-shadow: 0 0 0 3px var(--role-soft, rgba(80, 174, 155, 0.2));
    }

    .selected-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;

      &.is-placeholder {
        color: #94a3b8;
        font-weight: 400;
      }
    }

    /* Chevron Icon with Rotation */
    .chevron-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #334155;
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), color 0.15s ease;
      flex-shrink: 0;

      &.rotated {
        transform: rotate(180deg);
        color: var(--role-accent, #50ae9b);
      }
    }

    /* Option 1 Dropdown Popover Menu (Floats cleanly outside over cards) */
    .custom-select-menu {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      right: 0;
      min-width: 100%;
      max-height: 240px;
      overflow-y: auto;
      background: #ffffff;
      border: 1px solid var(--line-strong, #cbd5e1);
      border-radius: 12px;
      box-shadow: 0 12px 30px -4px rgba(0, 0, 0, 0.16), 0 4px 10px -2px rgba(0, 0, 0, 0.08);
      z-index: 1050;
      padding: 6px;
      box-sizing: border-box;
      animation: selectDropdownIn 0.15s ease forwards;
      scrollbar-width: thin;
      scrollbar-color: var(--role-accent, #50ae9b) transparent;

      &.open-upward {
        top: auto;
        bottom: calc(100% + 6px);
        animation: selectDropdownInUp 0.15s ease forwards;
      }

      /* Option 1 Pill Scrollbar matching role theme */
      &::-webkit-scrollbar {
        width: 5px;
      }
      &::-webkit-scrollbar-track {
        background: transparent;
        margin: 6px 0;
      }
      &::-webkit-scrollbar-thumb {
        background: var(--role-accent, #50ae9b);
        border-radius: 9999px;
      }
    }

    @keyframes selectDropdownIn {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes selectDropdownInUp {
      from {
        opacity: 0;
        transform: translateY(4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Option 1 Items matching role theme */
    .custom-select-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 8px 12px;
      margin-bottom: 2px;
      border-radius: 8px;
      font-size: 13.5px;
      font-weight: 500;
      color: #334155;
      cursor: pointer;
      transition: all 0.12s ease;

      &:last-child {
        margin-bottom: 0;
      }

      /* Hover state */
      &:hover {
        background: var(--surface-2, #f8fafc);
        color: #1e293b;
      }

      /* Selected state (matching role theme: soft accent pill highlight with bold text) */
      &.is-selected {
        background: var(--role-soft, rgba(80, 174, 155, 0.14));
        color: var(--role-accent, #50ae9b);
        font-weight: 600;

        &:hover {
          background: var(--role-soft, rgba(80, 174, 155, 0.22));
        }

        .check-icon {
          color: var(--role-accent, #50ae9b);
        }
      }
    }

    .option-label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    .option-badge {
      font-size: 10.5px;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 999px;
      background: var(--role-accent, #50ae9b);
      color: #ffffff;
      line-height: 1.2;
    }

    .check-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--role-accent, #50ae9b);
      flex-shrink: 0;
    }
  `]
})
export class CustomSelectComponent implements ControlValueAccessor {
  @Input() options: (string | number | SelectOption | any)[] = [];
  @Input() placeholder = 'Select an option';
  @Input() label?: string;
  @Input() minWidth?: string;
  @Input() disabled = false;
  @Output() selectionChange = new EventEmitter<any>();

  isOpen = signal(false);
  openUpward = signal(false);
  currentValue: any = null;

  @HostBinding('class.is-open') get hostIsOpen() {
    return this.isOpen();
  }

  private onChange: (val: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef) {}

  normalizedOptions(): SelectOption[] {
    if (!Array.isArray(this.options)) return [];
    return this.options.map((opt: any) => {
      if (typeof opt === 'string' || typeof opt === 'number') {
        return { value: opt, label: String(opt) };
      }
      if (opt && typeof opt === 'object') {
        return {
          value: opt.value !== undefined ? opt.value : (opt.id !== undefined ? opt.id : (opt.key !== undefined ? opt.key : opt)),
          label: opt.label !== undefined ? opt.label : (opt.name !== undefined ? opt.name : (opt.title !== undefined ? opt.title : String(opt.value))),
          badge: opt.badge
        };
      }
      return { value: opt, label: String(opt) };
    });
  }

  hasSelection(): boolean {
    return this.currentValue !== null && this.currentValue !== undefined && this.currentValue !== '';
  }

  currentLabel(): string {
    if (!this.hasSelection()) {
      return this.placeholder;
    }
    const found = this.normalizedOptions().find((o) => o.value === this.currentValue);
    return found ? found.label : String(this.currentValue);
  }

  isSelected(val: any): boolean {
    return this.currentValue === val;
  }

  toggleOpen(event: Event): void {
    event.stopPropagation();
    if (!this.disabled) {
      if (!this.isOpen()) {
        const rect = this.elementRef.nativeElement.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        this.openUpward.set(spaceBelow < 230 && rect.top > 230);
      }
      this.isOpen.update((v) => !v);
    }
  }

  selectOption(opt: SelectOption, event: Event): void {
    event.stopPropagation();
    this.currentValue = opt.value;
    this.onChange(this.currentValue);
    this.onTouched();
    this.selectionChange.emit(this.currentValue);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isOpen.set(false);
  }

  writeValue(value: any): void {
    this.currentValue = value;
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
}
