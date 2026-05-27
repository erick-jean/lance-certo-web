import { Component, AfterViewInit, OnDestroy, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { SubscriptionsService } from '../../services/subscriptions.service';

type MercadoPagoConstructor = new (
  publicKey: string,
  options: { locale: 'pt-BR' },
) => MercadoPagoInstance;

interface MercadoPagoWindow extends Window {
  MercadoPago?: MercadoPagoConstructor;
}

interface MercadoPagoInstance {
  cardForm(config: CardFormConfig): CardFormInstance;
}

interface CardFormInstance {
  getCardFormData(): CardFormData;
  unmount?: () => void;
}

interface CardFormData {
  token?: string;
}

interface CardFormFieldConfig {
  id: string;
  placeholder: string;
  style?: CardFormFieldStyle;
}

interface CardFormFieldStyle {
  color: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  placeholderColor: string;
}

interface CardFormConfig {
  amount: string;
  iframe: boolean;
  form: {
    id: string;
    cardNumber: CardFormFieldConfig;
    expirationDate: CardFormFieldConfig;
    securityCode: CardFormFieldConfig;
    cardholderName: CardFormFieldConfig;
    issuer: CardFormFieldConfig;
    installments: CardFormFieldConfig;
    identificationType: CardFormFieldConfig;
    identificationNumber: CardFormFieldConfig;
    cardholderEmail: CardFormFieldConfig;
  };
  callbacks: {
    onFormMounted: (error?: unknown) => void;
    onSubmit: (event: Event) => void;
    onFetching: (resource: string) => () => void;
  };
}

@Component({
  selector: 'app-premium-checkout',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './premium-checkout.component.html',
  styleUrl: './premium-checkout.component.scss',
})
export class PremiumCheckoutComponent implements AfterViewInit, OnDestroy {
  private readonly subscriptionsService = inject(SubscriptionsService);
  private cardForm?: CardFormInstance;
  private cardFormInitialized = false;

  protected readonly isCardFormFetching = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly isLoading = computed(() => this.isCardFormFetching() || this.isSubmitting());
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly documentType = signal<'CPF' | 'CNPJ'>('CPF');
  protected readonly documentNumberPlaceholder = signal('000.000.000-00');
  protected readonly cardNumberError = signal('');
  protected readonly expirationDateError = signal('');
  protected readonly cardPreviewNumber = signal('0000 0000 0000 0000');
  protected readonly cardPreviewName = signal('NOME DO TITULAR');
  protected readonly cardPreviewExpiration = signal('MM/AA');
  private readonly secureFieldStyle: CardFormFieldStyle = {
    color: '#172033',
    fontFamily: 'Inter, Arial, sans-serif',
    fontSize: '16px',
    fontWeight: '400',
    placeholderColor: '#667085',
  };

  async ngAfterViewInit(): Promise<void> {
    if (this.cardFormInitialized) {
      return;
    }

    this.cardFormInitialized = true;

    try {
      const { loadMercadoPago } = await import('@mercadopago/sdk-js');

      await loadMercadoPago();

      const MercadoPago = (window as MercadoPagoWindow).MercadoPago;

      if (!MercadoPago) {
        this.showCardValidationError();
        return;
      }

      const mp = new MercadoPago(environment.mercadoPagoPublicKey, {
        locale: 'pt-BR',
      });

      this.cardForm = mp.cardForm({
        amount: '29.90',
        iframe: false,
        form: {
          id: 'form-checkout',
          cardNumber: {
            id: 'form-checkout__cardNumber',
            placeholder: '0000 0000 0000 0000',
            style: this.secureFieldStyle,
          },
          expirationDate: {
            id: 'form-checkout__expirationDate',
            placeholder: 'MM/AA',
            style: this.secureFieldStyle,
          },
          securityCode: {
            id: 'form-checkout__securityCode',
            placeholder: '000',
            style: this.secureFieldStyle,
          },
          cardholderName: {
            id: 'form-checkout__cardholderName',
            placeholder: 'Ex.: Maria Lopes',
          },
          issuer: {
            id: 'form-checkout__issuer',
            placeholder: 'Banco emissor',
          },
          installments: {
            id: 'form-checkout__installments',
            placeholder: 'Parcelas',
          },
          identificationType: {
            id: 'form-checkout__identificationType',
            placeholder: 'CPF',
          },
          identificationNumber: {
            id: 'form-checkout__identificationNumber',
            placeholder: '000.000.000-00',
          },
          cardholderEmail: {
            id: 'form-checkout__cardholderEmail',
            placeholder: 'E-mail',
          },
        },
        callbacks: {
          onFormMounted: (error?: unknown) => {
            if (error) {
              console.error('Erro ao montar CardForm.');
              this.showCardValidationError();
              return;
            }

            this.normalizeDocumentTypeOptions();
          },
          onSubmit: (event: Event) => {
            event.preventDefault();
            this.submitSubscription();
          },
          onFetching: () => {
            this.isCardFormFetching.set(true);

            return () => {
              this.isCardFormFetching.set(false);
            };
          },
        },
      });
    } catch {
      this.showCardValidationError();
    }
  }

  ngOnDestroy(): void {
    this.cardForm?.unmount?.();
    this.cardForm = undefined;
  }

  protected updateDocumentPlaceholder(event: Event): void {
    const documentType = (event.target as HTMLSelectElement).value === 'CNPJ' ? 'CNPJ' : 'CPF';
    const placeholder = documentType === 'CNPJ' ? '00.000.000/0000-00' : '000.000.000-00';

    this.documentType.set(documentType);
    this.documentNumberPlaceholder.set(placeholder);

    const documentNumberInput = document.getElementById(
      'form-checkout__identificationNumber',
    ) as HTMLInputElement | null;

    if (documentNumberInput) {
      documentNumberInput.value = this.formatDocumentNumber(
        documentNumberInput.value,
        documentType,
      );
    }
  }

  protected formatDocumentNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = this.formatDocumentNumber(input.value, this.documentType());
  }

  protected formatCardNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 16);

    input.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    this.cardPreviewNumber.set(this.formatCardPreviewNumber(digits));
    this.cardNumberError.set('');
  }

  protected updateCardholderNamePreview(event: Event): void {
    const input = event.target as HTMLInputElement;
    const name = input.value.trim();

    this.cardPreviewName.set(name ? name.toUpperCase() : 'NOME DO TITULAR');
  }

  protected validateCardNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.validateCardNumber(input.value);
  }

  protected formatSecurityCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '').slice(0, 4);
  }

  protected formatExpirationDateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 4);

    input.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    this.cardPreviewExpiration.set(input.value || 'MM/AA');
    this.expirationDateError.set('');
  }

  protected validateExpirationDateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.validateExpirationDate(input.value);
  }

  private formatDocumentNumber(value: string, documentType: 'CPF' | 'CNPJ'): string {
    const digits = value.replace(/\D/g, '');

    if (documentType === 'CNPJ') {
      return digits
        .slice(0, 14)
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }

    return digits
      .slice(0, 11)
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2');
  }

  private formatCardPreviewNumber(digits: string): string {
    const paddedDigits = digits.padEnd(16, '0');

    return paddedDigits.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  private validateExpirationDate(value: string): boolean {
    const digits = value.replace(/\D/g, '');

    if (digits.length !== 4) {
      this.expirationDateError.set('Informe o vencimento no formato MM/AA.');
      return false;
    }

    const month = Number(digits.slice(0, 2));
    const year = Number(`20${digits.slice(2)}`);

    if (month < 1 || month > 12) {
      this.expirationDateError.set('Informe um mês válido entre 01 e 12.');
      return false;
    }

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      this.expirationDateError.set('Informe uma data de vencimento válida.');
      return false;
    }

    this.expirationDateError.set('');
    return true;
  }

  private validateCardNumber(value: string): boolean {
    const digits = value.replace(/\D/g, '');

    if (digits.length !== 16) {
      this.cardNumberError.set('Informe os 16 números do cartão.');
      return false;
    }

    this.cardNumberError.set('');
    return true;
  }

  private normalizeDocumentTypeOptions(): void {
    window.setTimeout(() => {
      const documentTypeSelect = document.getElementById(
        'form-checkout__identificationType',
      ) as HTMLSelectElement | null;

      if (!documentTypeSelect) {
        return;
      }

      documentTypeSelect.innerHTML = '';
      documentTypeSelect.append(new Option('CPF', 'CPF'), new Option('CNPJ', 'CNPJ'));
      documentTypeSelect.value = this.documentType();
    });
  }

  private submitSubscription(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    const expirationDateInput = document.getElementById(
      'form-checkout__expirationDate',
    ) as HTMLInputElement | null;
    const cardNumberInput = document.getElementById(
      'form-checkout__cardNumber',
    ) as HTMLInputElement | null;

    if (cardNumberInput && !this.validateCardNumber(cardNumberInput.value)) {
      return;
    }

    if (expirationDateInput && !this.validateExpirationDate(expirationDateInput.value)) {
      return;
    }

    const cardTokenId = this.cardForm?.getCardFormData().token;

    if (!cardTokenId) {
      this.showCardValidationError();
      return;
    }

    this.isSubmitting.set(true);

    this.subscriptionsService
      .createSubscription(cardTokenId)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.successMessage.set(
            'Assinatura criada com sucesso. Estamos confirmando seu acesso Premium.',
          );
        },
        error: () => {
          this.errorMessage.set(
            'Não foi possível criar sua assinatura agora. Tente novamente em alguns instantes.',
          );
        },
      });
  }

  private showCardValidationError(): void {
    this.errorMessage.set(
      'Não foi possível validar os dados do cartão. Confira as informações e tente novamente.',
    );
  }
}
