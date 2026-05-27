import { Directive, ElementRef, HostListener, Input, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

import { onlyDigits } from '../../core/utils/form-formatters';

@Directive({
  selector: 'input[appDigitsOnly]',
  standalone: true,
})
export class DigitsOnlyDirective {
  private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly ngControl = inject(NgControl, { optional: true });

  @Input() maxDigits?: number;
  @Input() numericValue = true;

  @HostListener('input')
  onInput(): void {
    const input = this.elementRef.nativeElement;
    const value = onlyDigits(input.value, this.maxDigits);

    input.value = value;
    this.ngControl?.control?.setValue(this.numericValue ? this.toNumber(value) : value);
  }

  private toNumber(value: string): number | null {
    return value ? Number(value) : null;
  }
}
