import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

type FinanceRow = {
  vehicle: string;
  status: 'Arrematado' | 'Vendido';
  purchase: number;
  expenses: number;
  sale?: number;
};

type CategoryExpense = {
  name: string;
  value: number;
  color: string;
};

type MonthlyResult = {
  month: string;
  value: number;
};

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [FormsModule, MatIconModule, RouterLink],
  templateUrl: './finance.html',
  styleUrl: './finance.scss',
})
export class Finance {
  protected readonly rows: FinanceRow[] = [
    { vehicle: 'Honda Civic EXL', status: 'Vendido', purchase: 98500, expenses: 7800, sale: 124700 },
    { vehicle: 'Jeep Compass Longitude', status: 'Arrematado', purchase: 115000, expenses: 9500 },
    { vehicle: 'VW Nivus Highline', status: 'Vendido', purchase: 92000, expenses: 6300, sale: 118800 },
    { vehicle: 'Fiat Uno 2018', status: 'Vendido', purchase: 21500, expenses: 2600, sale: 20000 },
    { vehicle: 'Gol 1.0 2020', status: 'Arrematado', purchase: 28000, expenses: 4200 },
  ];

  protected readonly categoryExpenses: CategoryExpense[] = [
    { name: 'Mecânica', value: 5800, color: '#007a58' },
    { name: 'Documentação', value: 3450, color: '#f6a440' },
    { name: 'Pneus', value: 2200, color: '#2563eb' },
    { name: 'Transporte', value: 1850, color: '#7c3aed' },
    { name: 'Funilaria', value: 4100, color: '#dc2626' },
    { name: 'Outros', value: 1100, color: '#64748b' },
  ];

  protected readonly monthlyResults: MonthlyResult[] = [
    { month: 'Janeiro', value: 5000 },
    { month: 'Fevereiro', value: 2300 },
    { month: 'Março', value: -800 },
    { month: 'Abril', value: 9400 },
    { month: 'Maio', value: 16100 },
  ];

  protected readonly vehicleSearch = signal('');
  protected readonly statusFilter = signal<'ALL' | FinanceRow['status']>('ALL');
  protected readonly resultFilter = signal<'ALL' | 'PROFIT' | 'LOSS' | 'OPEN'>('ALL');

  protected readonly hasFinancialData = computed(() => this.rows.length > 0);
  protected readonly filteredRows = computed(() => {
    const search = this.vehicleSearch().trim().toLowerCase();
    const status = this.statusFilter();
    const result = this.resultFilter();

    return this.rows.filter((row) => {
      const rowResult = this.resultByRow(row);
      const matchesSearch = !search || row.vehicle.toLowerCase().includes(search);
      const matchesStatus = status === 'ALL' || row.status === status;
      const matchesResult =
        result === 'ALL' ||
        (result === 'PROFIT' && row.sale && rowResult > 0) ||
        (result === 'LOSS' && row.sale && rowResult < 0) ||
        (result === 'OPEN' && !row.sale);

      return matchesSearch && matchesStatus && matchesResult;
    });
  });
  protected readonly soldRows = computed(() => this.rows.filter((row) => row.status === 'Vendido'));
  protected readonly purchasedRows = computed(() => this.rows.filter((row) => row.status === 'Arrematado'));
  protected readonly totalInvested = computed(() => this.rows.reduce((total, row) => total + this.totalInvestedByRow(row), 0));
  protected readonly totalExpenses = computed(() => this.rows.reduce((total, row) => total + row.expenses, 0));
  protected readonly totalSold = computed(() => this.soldRows().reduce((total, row) => total + (row.sale ?? 0), 0));
  protected readonly totalProfit = computed(() => this.rows.reduce((total, row) => total + this.resultByRow(row), 0));
  protected readonly averageMargin = computed(() => {
    const margins = this.soldRows().map((row) => this.marginByRow(row));
    if (!margins.length) return 0;

    return margins.reduce((total, margin) => total + margin, 0) / margins.length;
  });
  protected readonly maxProfitAbs = computed(() => Math.max(...this.soldRows().map((row) => Math.abs(this.resultByRow(row))), 1));
  protected readonly maxCategoryExpense = computed(() => Math.max(...this.categoryExpenses.map((category) => category.value), 1));
  protected readonly maxMonthlyResultAbs = computed(() => Math.max(...this.monthlyResults.map((month) => Math.abs(month.value)), 1));

  protected totalInvestedByRow(row: FinanceRow): number {
    return row.purchase + row.expenses;
  }

  protected resultByRow(row: FinanceRow): number {
    if (!row.sale) return 0;

    return row.sale - this.totalInvestedByRow(row);
  }

  protected marginByRow(row: FinanceRow): number {
    if (!row.sale) return 0;

    return (this.resultByRow(row) / this.totalInvestedByRow(row)) * 100;
  }

  protected formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  protected formatSignedCurrency(value: number): string {
    const formatted = this.formatCurrency(Math.abs(value));
    return value > 0 ? `+${formatted}` : value < 0 ? `-${formatted}` : formatted;
  }

  protected formatPercent(value: number): string {
    return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value)}%`;
  }

  protected barWidth(value: number, max: number): string {
    return `${Math.max((Math.abs(value) / max) * 100, 4)}%`;
  }
}
