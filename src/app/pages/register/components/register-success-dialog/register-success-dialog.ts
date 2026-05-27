import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-register-success-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './register-success-dialog.html',
  styleUrl: './register-success-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterSuccessDialogComponent {}
