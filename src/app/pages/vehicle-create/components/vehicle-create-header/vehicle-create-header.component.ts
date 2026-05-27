import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-vehicle-create-header',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './vehicle-create-header.component.html',
  styleUrl: './vehicle-create-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleCreateHeaderComponent {
  @Input({ required: true }) submitLoading = false;
  @Input() formInvalid = false;
}
