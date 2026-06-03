import { AfterViewInit, Directive, ElementRef, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

import { formatCurrencyBRL, onlyDigits } from '../../core/utils/form-formatters';

@Directive({
  selector: 'input[appCurrencyMask]',
  standalone: true,
})
export class CurrencyMaskDirective implements AfterViewInit {
  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly ngControl = inject(NgControl, { optional: true });

  ngAfterViewInit(): void {
    const raw = this.el.nativeElement.value;
    if (!raw) return;

    // Valor vindo do binding [value] ou [ngModel] — converte para o formato R$ X.XXX,XX
    const formatted = this.formatInitial(raw);
    if (formatted && formatted !== raw) {
      this.el.nativeElement.value = formatted;
      this.ngControl?.control?.setValue(formatted, { emitEvent: false });
    }
  }

  @HostListener('input')
  onInput(): void {
    const input = this.el.nativeElement;
    const digits = onlyDigits(input.value);
    // Dígitos são tratados como centavos (÷100): "20000" → R$ 200,00
    const value = digits ? formatCurrencyBRL(Number(digits) / 100) : '';
    input.value = value;
    this.ngControl?.control?.setValue(value);
  }

  private formatInitial(raw: string): string {
    if (!raw) return '';

    // Já formatado (contém vírgula ou R$): re-parseia como centavos
    if (raw.includes(',') || raw.includes('R$')) {
      const digits = onlyDigits(raw);
      return digits ? formatCurrencyBRL(Number(digits) / 100) : '';
    }

    // Número puro vindo da API ou binding (ex: 85000 → R$ 85.000,00)
    const num = Number(raw.replace(',', '.'));
    return Number.isFinite(num) && num > 0 ? formatCurrencyBRL(num) : '';
  }
}
