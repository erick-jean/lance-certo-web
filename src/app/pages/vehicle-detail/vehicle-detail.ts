import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { StatusBadge, StatusBadgeTone } from '../../shared/components/status-badge/status-badge';
import {
  DamageType,
  EvaluationExpense,
  AuctionType,
  ExpenseCategory,
  ExpenseSource,
  FuelType,
  TransmissionType,
  VehicleStatus,
  VehicleType,
  Vehicle,
  Vehicles as VehiclesService,
} from '../../core/services/vehicles';
import {
  AUCTION_TYPE_LABEL,
  EXPENSE_CATEGORY_LABEL,
  EXPENSE_SOURCE_LABEL,
  FUEL_TYPE_LABEL,
  TRANSMISSION_LABEL,
  VEHICLE_DAMAGE_LABEL,
  VEHICLE_STATUS_LABEL,
  VEHICLE_TYPE_LABEL,
  formatDate,
  formatMileage,
  safeImageUrl,
  vehicleSubtitle,
  vehicleTitle,
} from '../vehicles/vehicle-labels';

type DetailTab = 'data' | 'evaluation' | 'checklist' | 'report';

const emptyVehicle: Vehicle = {
  id: '',
  userId: '',
  type: 'CAR',
  damageType: 'NONE',
  status: 'ANALYZING',
};

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  templateUrl: './vehicle-detail.html',
  styleUrl: './vehicle-detail.scss',
  imports: [MatIconModule, RouterLink, FormsModule, StatusBadge],
})
export class VehicleDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly vehiclesService = inject(VehiclesService);

  protected readonly loadedVehicle = signal<Vehicle | null>(null);
  protected readonly loading = signal(true);
  protected readonly loadError = signal('');
  protected readonly activeImageIndex = signal(0);
  protected readonly activeTab = signal<DetailTab>('data');
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

  protected readonly vehicle = computed(() => this.loadedVehicle() ?? emptyVehicle);

  protected readonly imageUrls = computed(() =>
    (this.vehicle().images ?? []).map((image) => safeImageUrl(image.url)).filter(Boolean),
  );
  protected readonly activeImage = computed(() => this.imageUrls()[this.activeImageIndex()] ?? '');
  protected readonly filteredExpenses = computed(() => {
    this.expenseVersion();
    const search = this.expenseSearch().trim().toLowerCase();
    const category = this.expenseCategoryFilter();
    const required = this.expenseRequiredFilter();

    return (this.vehicle().evaluation?.expenses ?? []).filter((expense) => {
      const matchesSearch =
        !search ||
        expense.name.toLowerCase().includes(search) ||
        expense.notes?.toLowerCase().includes(search);
      const matchesCategory = category === 'ALL' || expense.category === category;
      const matchesRequired =
        required === 'ALL' ||
        (required === 'REQUIRED' && expense.isRequired) ||
        (required === 'OPTIONAL' && !expense.isRequired);

      return matchesSearch && matchesCategory && matchesRequired;
    });
  });
  protected readonly isEditingExpense = computed(() => this.selectedExpenseId() !== null);
  protected readonly expenseDrawerTitle = computed(() =>
    this.isEditingExpense() ? 'Editar Gasto' : 'Adicionar Novo Gasto',
  );
  protected readonly expenseDrawerDescription = computed(() =>
    this.isEditingExpense()
      ? 'Atualize os dados do investimento previsto.'
      : 'Preencha os dados do investimento realizado.',
  );

  ngOnInit(): void {
    this.loadVehicle();
  }

  protected loadVehicle(): void {
    const vehicleId = this.route.snapshot.paramMap.get('id');

    if (!vehicleId) {
      this.loading.set(false);
      this.loadError.set('Veiculo nao encontrado.');
      return;
    }

    this.loading.set(true);
    this.loadError.set('');

    this.vehiclesService.getVehicle(vehicleId).subscribe({
      next: (vehicle) => {
        this.loadedVehicle.set(vehicle);
        this.loading.set(false);
        this.loadVehicleImages(vehicle.id);
        this.loadVehicleEvaluation(vehicle.id);
      },
      error: (error) => {
        console.error('Erro ao carregar veículo', error);
        this.loadedVehicle.set(null);
        this.loading.set(false);
        this.loadError.set('Não foi possível carregar os dados do veículo.');
      },
    });
  }

  protected vehicleTitle(): string {
    return vehicleTitle(this.vehicle());
  }

  protected vehicleSubtitle(): string {
    return vehicleSubtitle(this.vehicle());
  }

  protected statusLabel(status: VehicleStatus): string {
    return VEHICLE_STATUS_LABEL[status];
  }

  protected fuelTypeLabel(fuelType?: FuelType | null): string {
    if (!fuelType) return '-';

    return FUEL_TYPE_LABEL[fuelType];
  }

  protected transmissionLabel(transmission?: TransmissionType | null): string {
    if (!transmission) return '-';

    return TRANSMISSION_LABEL[transmission];
  }

  protected vehicleTypeLabel(type: VehicleType): string {
    return VEHICLE_TYPE_LABEL[type];
  }

  protected auctionTypeLabel(auctionType?: AuctionType | null): string {
    if (!auctionType) return '-';

    return AUCTION_TYPE_LABEL[auctionType];
  }

  protected damageLabel(damageType: DamageType): string {
    return VEHICLE_DAMAGE_LABEL[damageType];
  }

  protected statusTone(status: VehicleStatus): StatusBadgeTone {
    return status === 'ANALYZING' ? 'warning' : 'success';
  }

  protected damageTone(damageType: DamageType): StatusBadgeTone {
    if (damageType === 'MEDIUM_DAMAGE' || damageType === 'HIGH_DAMAGE' || damageType === 'FLOOD')
      return 'risk-medium';

    return 'risk-low';
  }

  protected expenseCategoryLabel(category: ExpenseCategory): string {
    return EXPENSE_CATEGORY_LABEL[category];
  }

  protected expenseCategoryClass(category: ExpenseCategory): string {
    return `category-pill category-${category.toLowerCase().replaceAll('_', '-')}`;
  }

  protected expenseSourceLabel(source: ExpenseSource): string {
    return EXPENSE_SOURCE_LABEL[source];
  }

  protected formatDate(date?: string | null): string {
    return formatDate(date);
  }

  protected formatMileage(mileage?: number | null): string {
    return formatMileage(mileage);
  }

  protected primaryActionLabel(): string {
    return this.vehicle().status === 'PURCHASED' ? 'Vender veículo' : 'Marcar como arrematado';
  }

  protected selectTab(tab: DetailTab): void {
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
    this.expenseAmount.set(String(expense.amount));
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
    const expenses = evaluation.expenses ?? [];
    const expenseData = {
      category: this.expenseCategory() || 'OTHER',
      name: this.expenseName() || 'Novo gasto',
      amount: this.formatExpenseAmount(this.expenseAmount()),
      isRequired: this.expenseIsRequired(),
      notes: this.expenseNotes() || undefined,
      updatedAt: now,
    };

    if (selectedExpenseId) {
      const expense = expenses.find((item) => item.id === selectedExpenseId);

      if (expense) {
        Object.assign(expense, expenseData);
      }
    } else {
      evaluation.expenses = expenses;
      expenses.unshift({
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

    evaluation.expenses = (evaluation.expenses ?? []).filter(
      (expense) => expense.id !== selectedExpenseId,
    );
    this.expenseVersion.update((version) => version + 1);
    this.closeExpenseDrawer();
  }

  protected selectImage(index: number): void {
    this.activeImageIndex.set(index);
  }

  protected showPreviousImage(): void {
    const imagesCount = this.imageUrls().length;
    if (!imagesCount) return;

    this.activeImageIndex.update((index) => (index - 1 + imagesCount) % imagesCount);
  }

  protected showNextImage(): void {
    const imagesCount = this.imageUrls().length;
    if (!imagesCount) return;

    this.activeImageIndex.update((index) => (index + 1) % imagesCount);
  }

  private loadVehicleImages(vehicleId: string): void {
    this.vehiclesService.getImages(vehicleId).subscribe({
      next: (images) => {
        this.loadedVehicle.update((vehicle) => (vehicle ? { ...vehicle, images } : vehicle));
      },
      error: () => {
        this.loadedVehicle.update((vehicle) => (vehicle ? { ...vehicle, images: [] } : vehicle));
      },
    });
  }

  private loadVehicleEvaluation(vehicleId: string): void {
    this.vehiclesService.getEvaluation(vehicleId).subscribe({
      next: (evaluation) => {
        this.loadedVehicle.update((vehicle) =>
          vehicle
            ? {
                ...vehicle,
                evaluation: {
                  ...evaluation,
                  suggestedBid: evaluation.maxRecommendedBid,
                  estimatedExpenses: evaluation.estimatedFinalCost,
                  expenses: evaluation.evaluationExpenses ?? [],
                },
              }
            : vehicle,
        );
      },
      error: () => {
        this.loadedVehicle.update((vehicle) =>
          vehicle ? { ...vehicle, evaluation: null } : vehicle,
        );
      },
    });
  }

  private formatExpenseAmount(amount: string): number {
    const cleanAmount = amount.trim();
    if (!cleanAmount) return 0;

    const parsed = Number(
      cleanAmount
        .replace(/[^\d,.-]/g, '')
        .replace(/\./g, '')
        .replace(',', '.'),
    );
    return Number.isFinite(parsed) ? parsed : 0;
  }
}
