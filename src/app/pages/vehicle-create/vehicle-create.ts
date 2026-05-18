import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { safeImageUrl } from '../vehicles/vehicle-labels';

@Component({
  selector: 'app-vehicle-create',
  standalone: true,
  imports: [FormsModule, MatIconModule, RouterLink],
  templateUrl: './vehicle-create.html',
  styleUrl: './vehicle-create.scss',
})
export class VehicleCreate {
  protected readonly previewImages = [
    'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80',
  ].map((image) => safeImageUrl(image));
}
