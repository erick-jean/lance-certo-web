import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { vehicles } from './vehicles-data';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.scss',
})
export class Vehicles {
  protected readonly vehicles = vehicles;
}
