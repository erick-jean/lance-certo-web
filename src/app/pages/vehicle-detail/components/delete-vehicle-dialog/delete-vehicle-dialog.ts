import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface DeleteVehicleDialogData {
  vehicleName: string;
}

@Component({
  selector: 'app-delete-vehicle-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './delete-vehicle-dialog.html',
  styleUrl: './delete-vehicle-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteVehicleDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) readonly data: DeleteVehicleDialogData) {}
}
