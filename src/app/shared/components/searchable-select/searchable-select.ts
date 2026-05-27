import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-searchable-select',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatOptionModule,
  ],
  templateUrl: './searchable-select.html',
  styleUrl: './searchable-select.scss',
})
export class SearchableSelectComponent {
  @Input({ required: true }) control!: FormControl;
  @Input({ required: true }) items: readonly unknown[] = [];
  @Input({ required: true }) label = '';
  @Input({ required: true }) placeholder = '';
  @Input({ required: true }) searchPlaceholder = '';
  @Input({ required: true }) loadingText = '';
  @Input({ required: true }) emptyText = '';

  @Input() error = '';
  @Input() loading = false;
  @Input() requiredErrorText = '';
  @Input() searchValue = '';
  @Input() panelClass: string | string[] = 'vehicle-select-panel';
  @Input() optionValueKey?: string;
  @Input() optionLabelKey?: string;
  @Input() optionLabelFn?: (item: any) => string;
  @Input() optionValueFn?: (item: any) => unknown;

  @Output() openedChange = new EventEmitter<boolean>();
  @Output() selectionChange = new EventEmitter<unknown>();
  @Output() searchChange = new EventEmitter<string>();

  get selectPlaceholder(): string {
    return this.loading ? this.loadingText : this.placeholder;
  }

  getOptionValue(item: unknown): unknown {
    if (this.optionValueFn) {
      return this.optionValueFn(item);
    }

    if (this.optionValueKey && this.isObjectRecord(item)) {
      return item[this.optionValueKey];
    }

    return item;
  }

  getOptionLabel(item: unknown): string {
    if (this.optionLabelFn) {
      return this.optionLabelFn(item);
    }

    if (this.optionLabelKey && this.isObjectRecord(item)) {
      return String(item[this.optionLabelKey] ?? '');
    }

    return String(item);
  }

  trackByOption = (_index: number, item: unknown): unknown => this.getOptionValue(item);

  private isObjectRecord(item: unknown): item is Record<string, unknown> {
    return item !== null && typeof item === 'object';
  }
}
