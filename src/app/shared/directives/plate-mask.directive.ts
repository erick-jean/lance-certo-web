import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

import { formatPlateValue } from '../../core/utils/form-formatters';

@Directive({
  selector: 'input[appPlateMask]',
  standalone: true,
})
export class PlateMaskDirective {
  private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly ngControl = inject(NgControl, { optional: true });

  @HostListener('input')
  onInput(): void {
    const input = this.elementRef.nativeElement;
    const value = formatPlateValue(input.value);

    input.value = value;
    this.ngControl?.control?.setValue(value);
  }
}
