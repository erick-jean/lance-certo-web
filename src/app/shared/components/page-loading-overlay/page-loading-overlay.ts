import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-loading-overlay',
  standalone: true,
  templateUrl: './page-loading-overlay.html',
  styleUrl: './page-loading-overlay.scss',
})
export class PageLoadingOverlay {
  @Input({ required: true }) title = '';
  @Input({ required: true }) description = '';
}
