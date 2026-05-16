import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {
  AuctionType,
  EvaluationExpense,
  ExpenseCategory,
  ExpenseSource,
  FuelType,
  TransmissionType,
  VehicleDamageType,
  VehicleStatus,
  VehicleType,
  vehicles,
} from '../vehicles/vehicles-data';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  templateUrl: './vehicle-detail.html',
  styleUrl: './vehicle-detail.scss',
  imports: [MatIconModule, RouterLink, FormsModule],
})
export class VehicleDetail {
  private readonly route = inject(ActivatedRoute);
  protected readonly activeImageIndex = signal(0);
  protected readonly activeTab = signal<'data' | 'evaluation' | 'checklist' | 'report'>('data');
  protected readonly expenseSearch = signal('');
  protected readonly expenseCategoryFilter = signal<'ALL' | ExpenseCategory>('ALL');
  protected readonly expenseRequiredFilter = signal<'ALL' | 'REQUIRED' | 'OPTIONAL'>('ALL');
  protected readonly isExpenseDrawerOpen = signal(false);
  protected readonly selectedExpenseId = signal<string | null>(null);
  protected readonly expenseVersion = signal(0);
  protected readonly expenseName = signal('');
  protected readonly expenseCategory = signal<ExpenseCategory | ''>('');
  protected readonly expenseAmount = signal('');
  protected readonly expenseNotes = signal('');
  protected readonly expenseIsRequired = signal(false);

  protected readonly vehicle = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return vehicles.find((vehicle) => vehicle.id === id) ?? vehicles[0];
  });

  protected readonly imageUrls = computed(() => this.vehicle().images.map((image) => image.url));
  protected readonly activeImage = computed(() => this.imageUrls()[this.activeImageIndex()] ?? '');
  protected readonly filteredExpenses = computed(() => {
    this.expenseVersion();
    const search = this.expenseSearch().trim().toLowerCase();
    const category = this.expenseCategoryFilter();
    const required = this.expenseRequiredFilter();

    return (this.vehicle().evaluation?.expenses ?? []).filter((expense) => {
      const matchesSearch = !search || expense.name.toLowerCase().includes(search) || expense.notes?.toLowerCase().includes(search);
      const matchesCategory = category === 'ALL' || expense.category === category;
      const matchesRequired =
        required === 'ALL' ||
        (required === 'REQUIRED' && expense.isRequired) ||
        (required === 'OPTIONAL' && !expense.isRequired);

      return matchesSearch && matchesCategory && matchesRequired;
    });
  });
  protected readonly isEditingExpense = computed(() => this.selectedExpenseId() !== null);
  protected readonly expenseDrawerTitle = computed(() => (this.isEditingExpense() ? 'Editar Gasto' : 'Adicionar Novo Gasto'));
  protected readonly expenseDrawerDescription = computed(() =>
    this.isEditingExpense() ? 'Atualize os dados do investimento previsto.' : 'Preencha os dados do investimento realizado.',
  );

  protected vehicleTitle(): string {
    const vehicle = this.vehicle();
    return [vehicle.brand, vehicle.model, vehicle.version].filter(Boolean).join(' ');
  }

  protected vehicleSubtitle(): string {
    const vehicle = this.vehicle();
    const year = [vehicle.yearManufacture, vehicle.yearModel].filter(Boolean).join('/');
    const location = [vehicle.city, vehicle.state].filter(Boolean).join(', ');
    return [year, location].filter(Boolean).join(' • ');
  }

  protected statusLabel(status: VehicleStatus): string {
    return {
      ANALYZING: 'Em análise',
      PURCHASED: 'Arrematado',
      SOLD: 'Vendido',
    }[status];
  }

  protected fuelTypeLabel(fuelType?: FuelType): string {
    if (!fuelType) return '-';

    return {
      FLEX: 'Flex',
      GASOLINE: 'Gasolina',
      DIESEL: 'Diesel',
      ELECTRIC: 'Elétrico',
      HYBRID: 'Híbrido',
    }[fuelType];
  }

  protected transmissionLabel(transmission?: TransmissionType): string {
    if (!transmission) return '-';

    return {
      MANUAL: 'Manual',
      AUTOMATIC: 'Automático',
    }[transmission];
  }

  protected vehicleTypeLabel(type: VehicleType): string {
    return {
      CAR: 'Carro',
      MOTORCYCLE: 'Moto',
      TRUCK: 'Caminhão',
    }[type];
  }

  protected auctionTypeLabel(auctionType?: AuctionType): string {
    if (!auctionType) return '-';

    return {
      ONLINE: 'Online',
      IN_PERSON: 'Presencial',
      HYBRID: 'Híbrido',
    }[auctionType];
  }

  protected damageLabel(damageType: VehicleDamageType): string {
    return {
      NONE: 'Sem avaria',
      LIGHT: 'Avaria leve',
      MEDIUM: 'Avaria média',
      HEAVY: 'Avaria grave',
    }[damageType];
  }

  protected expenseCategoryLabel(category: ExpenseCategory): string {
    return {
      DOCUMENTATION: 'Documentação',
      REPAIR: 'Mecânica',
      AUCTION_FEE: 'Taxa de leilão',
      TRANSPORT: 'Transporte',
      INSPECTION: 'Vistoria',
      DEBT: 'Débitos',
      REGULARIZATION: 'Regularização',
      PREPARATION_SALE: 'Estética',
      OTHER: 'Outro',
    }[category];
  }

  protected expenseCategoryClass(category: ExpenseCategory): string {
    return `category-pill category-${category.toLowerCase().replaceAll('_', '-')}`;
  }

  protected expenseSourceLabel(source: ExpenseSource): string {
    return {
      SYSTEM: 'Sistema',
      USER: 'Usuário',
      PARTNER: 'Parceiro',
    }[source];
  }

  protected formatDate(date?: string): string {
    if (!date) return '-';

    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(date));
  }

  protected formatMileage(mileage?: number): string {
    if (mileage === undefined || mileage === null) return '-';

    return `${new Intl.NumberFormat('pt-BR').format(mileage)} km`;
  }

  protected primaryActionLabel(): string {
    return this.vehicle().status === 'PURCHASED' ? 'Vender veículo' : 'Marcar como arrematado';
  }

  protected selectTab(tab: 'data' | 'evaluation' | 'checklist' | 'report'): void {
    this.activeTab.set(tab);
  }

  protected openExpenseDrawer(): void {
    this.selectedExpenseId.set(null);
    this.expenseName.set('');
    this.expenseCategory.set('');
    this.expenseAmount.set('');
    this.expenseNotes.set('');
    this.expenseIsRequired.set(false);
    this.isExpenseDrawerOpen.set(true);
  }

  protected editExpense(expense: EvaluationExpense): void {
    this.selectedExpenseId.set(expense.id);
    this.expenseName.set(expense.name);
    this.expenseCategory.set(expense.category);
    this.expenseAmount.set(expense.amount);
    this.expenseNotes.set(expense.notes ?? '');
    this.expenseIsRequired.set(expense.isRequired);
    this.isExpenseDrawerOpen.set(true);
  }

  protected closeExpenseDrawer(): void {
    this.isExpenseDrawerOpen.set(false);
  }

  protected saveExpense(): void {
    const evaluation = this.vehicle().evaluation;
    if (!evaluation) {
      this.closeExpenseDrawer();
      return;
    }

    const now = new Date().toISOString();
    const selectedExpenseId = this.selectedExpenseId();
    const expenseData = {
      category: this.expenseCategory() || 'OTHER',
      name: this.expenseName() || 'Novo gasto',
      amount: this.formatExpenseAmount(this.expenseAmount()),
      isRequired: this.expenseIsRequired(),
      notes: this.expenseNotes() || undefined,
      updatedAt: now,
    };

    if (selectedExpenseId) {
      const expense = evaluation.expenses.find((item) => item.id === selectedExpenseId);

      if (expense) {
        Object.assign(expense, expenseData);
      }
    } else {
      evaluation.expenses.unshift({
        id: `expense-${Date.now()}`,
        evaluationId: `evaluation-${this.vehicle().id}`,
        source: 'USER',
        createdAt: now,
        ...expenseData,
      });
    }

    this.expenseVersion.update((version) => version + 1);
    this.closeExpenseDrawer();
  }

  protected deleteExpense(): void {
    const evaluation = this.vehicle().evaluation;
    const selectedExpenseId = this.selectedExpenseId();

    if (!evaluation || !selectedExpenseId) {
      return;
    }

    evaluation.expenses = evaluation.expenses.filter((expense) => expense.id !== selectedExpenseId);
    this.expenseVersion.update((version) => version + 1);
    this.closeExpenseDrawer();
  }

  private formatExpenseAmount(amount: string): string {
    const cleanAmount = amount.trim();
    if (!cleanAmount) return 'R$ 0,00';

    return cleanAmount.startsWith('R$') ? cleanAmount : `R$ ${cleanAmount}`;
  }

  protected selectImage(index: number): void {
    this.activeImageIndex.set(index);
  }

  protected showPreviousImage(): void {
    const imagesCount = this.imageUrls().length;
    this.activeImageIndex.update((index) => (index - 1 + imagesCount) % imagesCount);
  }

  protected showNextImage(): void {
    const imagesCount = this.imageUrls().length;
    this.activeImageIndex.update((index) => (index + 1) % imagesCount);
  }
}
