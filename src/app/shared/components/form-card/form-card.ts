import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-form-card',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './form-card.html',
  styleUrl: './form-card.scss',
})
export class FormCardComponent {
  @Input({ required: true }) icon = '';
  @Input({ required: true }) title = '';
  @Input({ required: true }) description = '';
}
