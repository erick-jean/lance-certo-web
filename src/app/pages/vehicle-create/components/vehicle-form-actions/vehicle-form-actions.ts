import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-vehicle-form-actions',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './vehicle-form-actions.html',
  styleUrl: './vehicle-form-actions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleFormActionsComponent {
  @Input({ required: true }) submitLoading = false;
  @Input() submitError = '';
  @Input() formInvalid = false;
}
