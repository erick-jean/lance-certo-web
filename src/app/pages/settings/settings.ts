import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, MatIconModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {}
