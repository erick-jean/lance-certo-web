import { Directive, ElementRef, HostListener, Input, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[appUppercase]',
  standalone: true,
})
export class UppercaseDirective {
  private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly ngControl = inject(NgControl, { optional: true });

  @Input() maxLength?: number;
  @Input() lettersOnly = false;

  @HostListener('input')
  onInput(): void {
    const input = this.elementRef.nativeElement;
    let value = input.value.toUpperCase();

    if (this.lettersOnly) {
      value = value.replace(/[^A-Z]/g, '');
    }

    if (this.maxLength) {
      value = value.slice(0, this.maxLength);
    }

    input.value = value;
    this.ngControl?.control?.setValue(value);
  }
}
