import { Directive, ElementRef, HostListener, Input, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

import { onlyDigits } from '../../core/utils/form-formatters';

@Directive({
  selector: 'input[appPercentMask]',
  standalone: true,
})
export class PercentMaskDirective {
  private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly ngControl = inject(NgControl, { optional: true });

  @Input() maxPercent = 100;

  @HostListener('input')
  onInput(): void {
    const input = this.elementRef.nativeElement;
    const digits = onlyDigits(input.value, 3);
    const value = digits ? Math.min(Number(digits), this.maxPercent) : null;

    input.value = value === null ? '' : String(value);
    this.ngControl?.control?.setValue(value);
  }
}
