import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-vehicle-form-actions',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './vehicle-form-actions.html',
  styleUrl: './vehicle-form-actions.scss',
})
export class VehicleFormActions {
  @Input({ required: true }) submitLoading = false;
  @Input() submitError = '';
}
