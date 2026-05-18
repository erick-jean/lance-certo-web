import { Component, input } from '@angular/core';

export type StatusBadgeTone = 'neutral' | 'warning' | 'success' | 'risk-low' | 'risk-medium';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
})
export class StatusBadge {
  readonly label = input.required<string>();
  readonly tone = input<StatusBadgeTone>('neutral');
  readonly showDot = input(false);
}
