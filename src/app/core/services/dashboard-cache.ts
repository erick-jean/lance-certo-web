import { Injectable, inject, signal } from '@angular/core';

import { Dashboard, DashboardSummary } from './dashboard';

const STORAGE_KEY = 'lc_dashboard_v1';
const TTL_MS = 2 * 60 * 1000; // 2 minutes

interface StoredCache {
  data: DashboardSummary;
  timestamp: number;
}

/**
 * Stale-while-revalidate cache for the dashboard summary.
 * Mirrors the VehiclesCache pattern: in-memory Signal + sessionStorage fallback.
 */
@Injectable({ providedIn: 'root' })
export class DashboardCache {
  private readonly dashboardService = inject(Dashboard);

  private readonly _summary = signal<DashboardSummary | null>(null);
  private readonly _loading = signal(true);
  private readonly _error = signal('');
  private fetchedAt: number | null = null;
  private fetchInProgress = false;

  readonly summary = this._summary.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor() {
    const restored = this.hydrateFromStorage();
    if (restored) this._loading.set(false);
  }

  fetch(force = false): void {
    const age = this.fetchedAt ? Date.now() - this.fetchedAt : Infinity;
    const isStale = age > TTL_MS;
    const hasCached = this._summary() !== null;

    if (hasCached && !isStale && !force) return;
    if (this.fetchInProgress) return;

    if (!hasCached) this._loading.set(true);
    this._error.set('');
    this.fetchInProgress = true;

    this.dashboardService.getSummary().subscribe({
      next: (summary) => {
        this._summary.set(summary);
        this.fetchedAt = Date.now();
        this._loading.set(false);
        this.fetchInProgress = false;
        this.persistToStorage(summary);
      },
      error: (err) => {
        console.error('[DashboardCache] fetch error', err);
        this._loading.set(false);
        this.fetchInProgress = false;
        if (!hasCached) {
          this._error.set(
            err.status === 401
              ? 'Sessão expirada. Faça login novamente.'
              : 'Erro ao carregar o dashboard.',
          );
        }
      },
    });
  }

  invalidate(): void {
    this.fetchedAt = null;
    sessionStorage.removeItem(STORAGE_KEY);
  }

  private hydrateFromStorage(): boolean {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return false;

      const stored = JSON.parse(raw) as StoredCache;
      if (!stored?.data || !stored.timestamp) return false;

      this._summary.set(stored.data);
      this.fetchedAt = stored.timestamp;
      return true;
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
      return false;
    }
  }

  private persistToStorage(summary: DashboardSummary): void {
    try {
      const payload: StoredCache = { data: summary, timestamp: Date.now() };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }
}
