import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  templateUrl: './subscription.html',
  styleUrl: './subscription.scss',
})
export class Subscription {}
