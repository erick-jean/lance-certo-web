import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
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
import { VehiclesCache } from '../../core/services/vehicles-cache';
import { DashboardCache } from '../../core/services/dashboard-cache';
import {
  DeleteVehicleDialogComponent,
  DeleteVehicleDialogData,
} from './components/delete-vehicle-dialog/delete-vehicle-dialog';
import {
  CreateEvaluationDialogComponent,
  CreateEvaluationDialogData,
  CreateEvaluationDialogResult,
} from './components/create-evaluation-dialog/create-evaluation-dialog';
import {
  AUCTION_TYPE_LABEL,
  EXPENSE_CATEGORY_LABEL,
  EXPENSE_SOURCE_LABEL,
  FUEL_TYPE_LABEL,
  TRANSMISSION_LABEL,
  VEHICLE_DAMAGE_LABEL,
  VEHICLE_STATUS_LABEL,
  VEHICLE_TYPE_LABEL,
  formatCurrency,
  formatDate,
  formatMileage,
  safeImageUrl,
  vehicleSubtitle,
  vehicleTitle,
} from '../vehicles/vehicle-labels';

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
  imports: [MatButtonModule, MatIconModule, MatTabsModule, MatDialogModule, RouterLink, FormsModule, ReactiveFormsModule, StatusBadge],
})
export class VehicleDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly vehiclesService = inject(VehiclesService);
  private readonly vehiclesCache = inject(VehiclesCache);
  private readonly dashboardCache = inject(DashboardCache);

  protected readonly loadedVehicle = signal<Vehicle | null>(null);
  protected readonly loading = signal(true);
  protected readonly loadError = signal('');
  protected readonly deleting = signal(false);
  protected readonly activeImageIndex = signal(0);
  protected readonly expenseSearch = signal('');
  protected readonly expenseCategoryFilter = signal<'ALL' | ExpenseCategory>('ALL');
  protected readonly expenseRequiredFilter = signal<'ALL' | 'REQUIRED' | 'OPTIONAL'>('ALL');
  protected readonly isExpenseDrawerOpen = signal(false);
  protected readonly lightboxOpen = signal(false);
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
    const vehicleId = this.route.snapshot.paramMap.get('id');

    if (!vehicleId) {
      this.loading.set(false);
      this.loadError.set('Veículo não encontrado.');
      return;
    }

    // Pre-populate from list cache → render instantâneo quando vem da listagem
    const cached = this.vehiclesCache.getById(vehicleId);
    if (cached) {
      this.loadedVehicle.set(cached);
      this.loading.set(false);
    }

    // Sempre busca dados frescos (silencioso se já há cache, spinner se não)
    this.loadVehicle(vehicleId);
  }

  protected loadVehicle(vehicleId?: string): void {
    const id = vehicleId ?? this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.loading.set(false);
      this.loadError.set('Veículo não encontrado.');
      return;
    }

    // Mostra spinner só quando não há nada para exibir ainda
    if (!this.loadedVehicle()) this.loading.set(true);
    this.loadError.set('');

    this.vehiclesService.getVehicle(id).subscribe({
      next: (vehicle) => {
        this.loadedVehicle.set(vehicle);
        this.loading.set(false);
        this.loadVehicleImages(id);
        this.loadVehicleEvaluation(id);
      },
      error: (error) => {
        console.error('Erro ao carregar veículo', error);
        this.loading.set(false);
        // Só mostra erro se não há nenhum dado para exibir
        if (!this.loadedVehicle()) {
          this.loadError.set('Não foi possível carregar os dados do veículo.');
        }
      },
    });
  }

  protected vehicleTitle(): string {
    return vehicleTitle(this.vehicle());
  }

  protected vehicleSubtitle(): string {
    return vehicleSubtitle(this.vehicle());
  }

  protected formatCurrency(value?: number | null): string {
    return formatCurrency(value);
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

  protected confirmDelete(): void {
    const vehicle = this.vehicle();
    if (!vehicle.id) return;

    const ref = this.dialog.open<DeleteVehicleDialogComponent, DeleteVehicleDialogData, boolean>(
      DeleteVehicleDialogComponent,
      {
        data: { vehicleName: this.vehicleTitle() || 'este veículo' },
        panelClass: 'delete-vehicle-dialog-panel',
        disableClose: true,
      },
    );

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.deleting.set(true);

      this.vehiclesService.deleteVehicle(vehicle.id).subscribe({
        next: () => {
          this.vehiclesCache.invalidate();
          this.dashboardCache.invalidate();
          void this.router.navigate(['/veiculos']);
        },
        error: (err) => {
          console.error('Erro ao excluir veículo', err);
          this.deleting.set(false);
        },
      });
    });
  }

  @HostListener('document:keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if (!this.lightboxOpen()) return;

    if (event.key === 'Escape') {
      this.closeLightbox();
    } else if (event.key === 'ArrowLeft') {
      this.showPreviousImage();
    } else if (event.key === 'ArrowRight') {
      this.showNextImage();
    }
  }

  protected openLightbox(): void {
    if (!this.activeImage()) return;
    this.lightboxOpen.set(true);
  }

  protected closeLightbox(): void {
    this.lightboxOpen.set(false);
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
      error: (err: HttpErrorResponse) => {
        this.loadedVehicle.update((vehicle) =>
          vehicle ? { ...vehicle, evaluation: null } : vehicle,
        );

        // 404 = avaliação não existe ainda → propor criação
        if (err.status === 404) {
          this.openCreateEvaluationDialog(vehicleId);
        }
      },
    });
  }

  private openCreateEvaluationDialog(vehicleId: string): void {
    const ref = this.dialog.open<
      CreateEvaluationDialogComponent,
      CreateEvaluationDialogData,
      CreateEvaluationDialogResult | null
    >(CreateEvaluationDialogComponent, {
      data: { vehicleName: this.vehicleTitle() || 'este veículo' },
      panelClass: 'create-evaluation-dialog-panel',
      disableClose: false,
    });

    ref.afterClosed().subscribe((result) => {
      if (!result) return;

      this.vehiclesService
        .createEvaluation(vehicleId, {
          desiredProfitMarginPercent: result.desiredProfitMarginPercent,
          safetyMarginPercent: result.safetyMarginPercent,
        })
        .subscribe({
          next: () => this.loadVehicleEvaluation(vehicleId),
          error: (err) => console.error('Erro ao criar avaliação', err),
        });
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
