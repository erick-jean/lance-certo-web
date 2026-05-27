import { Component, DestroyRef, inject, signal } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { Header } from './shared/components/header/header';
import { Sidebar } from './shared/components/sidebar/sidebar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly title = signal('lance-certo-web');
  protected readonly isAuthPage = signal(this.isAuthenticationRoute(this.router.url));
  protected readonly routeLoading = signal(false);

  constructor() {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationStart | NavigationEnd | NavigationCancel | NavigationError =>
            event instanceof NavigationStart ||
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.routeLoading.set(true);
          return;
        }

        this.routeLoading.set(false);

        if (event instanceof NavigationEnd) {
          this.isAuthPage.set(this.isAuthenticationRoute(event.urlAfterRedirects));
        }
      });
  }

  private isAuthenticationRoute(url: string): boolean {
    return url.startsWith('/login') || url.startsWith('/criar-conta');
  }
}
