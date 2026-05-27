import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-vehicle-create-header',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './vehicle-create-header.component.html',
  styleUrl: './vehicle-create-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleCreateHeaderComponent {
  @Input({ required: true }) submitLoading = false;
}
