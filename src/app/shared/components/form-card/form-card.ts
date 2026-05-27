import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-form-card',
  imports: [MatIcon],
  templateUrl: './form-card.html',
  styleUrl: './form-card.css',
})
export class FormCard {
  @Input({ required: true }) icon = '';
  @Input({ required: true }) title = '';
  @Input({ required: true }) description = '';
}
