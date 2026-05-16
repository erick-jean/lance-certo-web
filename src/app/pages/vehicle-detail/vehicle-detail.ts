import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {
  AuctionType,
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

  protected readonly vehicle = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return vehicles.find((vehicle) => vehicle.id === id) ?? vehicles[0];
  });

  protected readonly imageUrls = computed(() => this.vehicle().images.map((image) => image.url));
  protected readonly activeImage = computed(() => this.imageUrls()[this.activeImageIndex()] ?? '');
  protected readonly filteredExpenses = computed(() => {
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
