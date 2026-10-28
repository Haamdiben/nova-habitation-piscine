import { Component, ElementRef, HostListener, forwardRef, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Dropdown drawn by the site instead of the browser's native <select> list, so it looks the same
 * everywhere (native lists turn black in some browsers when the computer is in dark mode).
 * Works with [(ngModel)] and the `required` validator like a normal form field.
 */
@Component({
  selector: 'app-select-field',
  standalone: true,
  host: { class: 'block' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectFieldComponent), multi: true }],
  template: `
    <div class="relative" (focusout)="onFocusOut($event)">
      <button
        type="button"
        [id]="inputId()"
        class="field-dark flex items-center justify-between gap-3 text-left"
        [class.!border-sea-400]="open()"
        [disabled]="disabled()"
        aria-haspopup="listbox"
        [attr.aria-expanded]="open()"
        (click)="toggle()"
        (keydown)="onKeydown($event)"
      >
        <span [class.text-sea-100/70]="!value()">{{ value() || placeholder() }}</span>
        <svg class="h-4 w-4 flex-shrink-0 text-sea-500 transition-transform duration-300" [class.rotate-180]="open()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      @if (open()) {
        <ul
          role="listbox"
          class="absolute z-30 mt-2 w-full overflow-hidden rounded-xl bg-white py-2 shadow-[0_18px_40px_-16px_rgba(20,40,70,0.35)] ring-1 ring-sea-500/15"
        >
          @for (option of options(); track option; let i = $index) {
            <li
              role="option"
              [attr.aria-selected]="option === value()"
              class="flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sea-50 transition-colors"
              [class.bg-ink-700]="i === activeIndex()"
              (mouseenter)="activeIndex.set(i)"
              (mousedown)="$event.preventDefault()"
              (click)="select(option)"
            >
              {{ option }}
              @if (option === value()) {
                <svg class="h-4 w-4 text-sea-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              }
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: `
    :host(.ng-touched.ng-invalid) .field-dark {
      border-color: #f87171 !important;
    }
  `,
})
export class SelectFieldComponent implements ControlValueAccessor {
  options = input.required<string[]>();
  placeholder = input('Sélectionnez');
  inputId = input<string>();

  value = signal('');
  open = signal(false);
  activeIndex = signal(-1);
  disabled = signal(false);

  private host = inject(ElementRef<HTMLElement>);
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  toggle() {
    this.open() ? this.close() : this.openList();
  }

  select(option: string) {
    this.value.set(option);
    this.onChange(option);
    this.close();
  }

  onKeydown(event: KeyboardEvent) {
    const count = this.options().length;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        if (!this.open()) return this.openList();
        const step = event.key === 'ArrowDown' ? 1 : -1;
        this.activeIndex.set((this.activeIndex() + step + count) % count);
        break;
      }
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.open() && this.activeIndex() >= 0) this.select(this.options()[this.activeIndex()]);
        else this.toggle();
        break;
      case 'Escape':
        if (this.open()) {
          event.preventDefault();
          this.close();
        }
        break;
    }
  }

  onFocusOut(event: FocusEvent) {
    if (!this.host.nativeElement.contains(event.relatedTarget as Node)) {
      this.close();
      this.onTouched();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) this.close();
  }

  private openList() {
    this.open.set(true);
    this.activeIndex.set(Math.max(0, this.options().indexOf(this.value())));
  }

  private close() {
    this.open.set(false);
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
