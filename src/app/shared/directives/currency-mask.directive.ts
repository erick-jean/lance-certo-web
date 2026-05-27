import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

import { formatCurrencyBRL, onlyDigits } from '../../core/utils/form-formatters';

@Directive({
  selector: 'input[appCurrencyMask]',
  standalone: true,
})
export class CurrencyMaskDirective {
  private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly ngControl = inject(NgControl, { optional: true });

  @HostListener('input')
  onInput(): void {
    const input = this.elementRef.nativeElement;
    const digits = onlyDigits(input.value);
    const value = digits ? formatCurrencyBRL(Number(digits)) : '';

    input.value = value;
    this.ngControl?.control?.setValue(value);
  }
}
