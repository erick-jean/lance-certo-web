import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

export interface VehicleCreateErrorDialogData {
  title: string;
  message: string;
  icon: string;
  actionLabel?: string;
  actionRoute?: string;
}

@Component({
  selector: 'app-vehicle-create-error-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatIconModule, RouterLink],
  templateUrl: './vehicle-create-error-dialog.html',
  styleUrl: './vehicle-create-error-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleCreateErrorDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) readonly data: VehicleCreateErrorDialogData) {}
}
