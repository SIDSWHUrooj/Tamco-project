import {
  Component,
  ElementRef,
  EventEmitter,
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
      [style.min-width]="minWidth || '170px'"
    >
      @if (label) {
        <span class="floating-label">{{ label }}</span>
      }

      <!-- Trigger Box -->
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

      <!-- Dropdown Menu Popover -->
      @if (isOpen()) {
        <div class="custom-select-menu" role="listbox">
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
      display: inline-block;
      position: relative;
      user-select: none;
      font-family: inherit;
    }

    .custom-select-container {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    /* Floating/Top Label (Matching reference image) */
    .floating-label {
      font-size: 11.5px;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 4px;
      letter-spacing: 0.01em;
      transition: color 0.15s ease;
    }

    .is-open .floating-label {
      color: var(--role-accent, #2563eb);
    }

    /* Trigger Button */
    .custom-select-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      width: 100%;
      height: 38px;
      padding: 7px 14px;
      background: #ffffff;
      border: 1px solid var(--line-strong, #cbd5e1);
      border-radius: 8px;
      cursor: pointer;
      font-size: 12.5px;
      font-weight: 500;
      color: var(--text, #1e293b);
      text-align: left;
      outline: none;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
      transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover:not(:disabled) {
        border-color: #94a3b8;
        background-color: #f8fafc;
      }

      &:focus,
      &:focus-visible {
        border-color: var(--role-accent, #2563eb);
        box-shadow: 0 0 0 3px var(--role-soft, rgba(37, 99, 235, 0.12));
      }

      &:disabled {
        background: #f1f5f9;
        color: #94a3b8;
        cursor: not-allowed;
        border-color: #e2e8f0;
      }
    }

    .is-open .custom-select-trigger {
      border-color: var(--role-accent, #2563eb);
      box-shadow: 0 0 0 3px var(--role-soft, rgba(37, 99, 235, 0.12));
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
      color: #64748b;
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), color 0.15s ease;
      flex-shrink: 0;

      &.rotated {
        transform: rotate(180deg);
        color: var(--role-accent, #2563eb);
      }
    }

    /* Dropdown Popover Menu */
    .custom-select-menu {
      position: absolute;
      top: calc(100% + 5px);
      left: 0;
      right: 0;
      min-width: 100%;
      max-height: 230px;
      overflow-y: auto;
      background: #ffffff;
      border: 1px solid var(--line-strong, #cbd5e1);
      border-radius: 9px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
      z-index: 1050;
      padding: 4px;
      animation: selectDropdownIn 0.15s ease forwards;

      /* Custom scrollbar with active theme pill (matching reference image) */
      &::-webkit-scrollbar {
        width: 6px;
      }
      &::-webkit-scrollbar-track {
        background: transparent;
      }
      &::-webkit-scrollbar-thumb {
        background: var(--role-accent, #2563eb);
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

    /* Option Items */
    .custom-select-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12.5px;
      font-weight: 500;
      color: var(--text, #334155);
      cursor: pointer;
      transition: all 0.12s ease;

      /* Hover state according to theme */
      &:hover {
        background: var(--role-soft, #eff6ff);
        color: var(--role-accent, #2563eb);
      }

      /* Selected state according to theme */
      &.is-selected {
        background: var(--role-soft, #eff6ff);
        color: var(--role-accent, #2563eb);
        font-weight: 600;
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
      background: var(--role-accent, #2563eb);
      color: #ffffff;
      line-height: 1.2;
    }

    .check-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--role-accent, #2563eb);
      flex-shrink: 0;
    }
  `]
})
export class CustomSelectComponent implements ControlValueAccessor {
  @Input() options: (string | SelectOption)[] = [];
  @Input() placeholder = 'Select an option';
  @Input() label?: string;
  @Input() minWidth?: string;
  @Input() disabled = false;
  @Output() selectionChange = new EventEmitter<any>();

  isOpen = signal(false);
  currentValue: any = null;

  private onChange: (val: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef) {}

  normalizedOptions(): SelectOption[] {
    return this.options.map((opt) => {
      if (typeof opt === 'string') {
        return { value: opt, label: opt };
      }
      return opt;
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
