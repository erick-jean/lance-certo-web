import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export const VEHICLE_CREATE_INFO_DISMISSED_KEY = 'lc_vehicle_create_info_v1';

@Component({
  selector: 'app-vehicle-create-info-dialog',
  standalone: true,
  imports: [MatButtonModule, MatCheckboxModule, MatDialogModule, MatIconModule],
  templateUrl: './vehicle-create-info-dialog.html',
  styleUrl: './vehicle-create-info-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleCreateInfoDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<VehicleCreateInfoDialogComponent>);

  readonly dontShowAgain = signal(false);

  confirm(): void {
    if (this.dontShowAgain()) {
      localStorage.setItem(VEHICLE_CREATE_INFO_DISMISSED_KEY, 'true');
    }
    this.dialogRef.close();
  }
}
