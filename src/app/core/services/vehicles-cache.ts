import { Injectable, inject, signal } from '@angular/core';

import { Vehicle, Vehicles } from './vehicles';

const STORAGE_KEY = 'lc_vehicles_v1';
const TTL_MS = 3 * 60 * 1000; // 3 minutes — after this, a silent background refresh runs

interface StoredCache {
  data: Vehicle[];
  timestamp: number;
}

/**
 * Stale-while-revalidate cache for the vehicles list.
 *
 * Strategy:
 *  - On service creation: hydrate in-memory signal from sessionStorage (survives F5).
 *  - On fetch(): if data is fresh (<TTL) → skip; if stale → show existing + refresh silently;
 *    if empty → show spinner + fetch.
 *  - Images are loaded in parallel after each list fetch and persisted in the same cache entry.
 */
@Injectable({ providedIn: 'root' })
export class VehiclesCache {
  private readonly vehiclesService = inject(Vehicles);

  private readonly _vehicles = signal<Vehicle[]>([]);
  private readonly _loading = signal(true); // true until first data arrives or storage hydrates
  private readonly _error = signal('');
  private fetchedAt: number | null = null;
  private fetchInProgress = false;

  readonly vehicles = this._vehicles.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor() {
    const restored = this.hydrateFromStorage();
    if (restored) this._loading.set(false);
  }

  /**
   * Request vehicles. Pass `force = true` to bypass the TTL and always fetch.
   * If cached data exists and is stale, data is shown immediately while
   * a background request updates it silently.
   */
  fetch(force = false): void {
    const age = this.fetchedAt ? Date.now() - this.fetchedAt : Infinity;
    const isStale = age > TTL_MS;
    const hasCached = this._vehicles().length > 0;

    if (hasCached && !isStale && !force) return; // still fresh, nothing to do
    if (this.fetchInProgress) return;            // already in flight

    // Only show the loading spinner when there is no data to display yet
    if (!hasCached) this._loading.set(true);
    this._error.set('');
    this.fetchInProgress = true;

    this.vehiclesService.getVehicles({ limit: 100 }).subscribe({
      next: (response) => {
        this._vehicles.set(response.data);
        this.fetchedAt = Date.now();
        this._loading.set(false);
        this.fetchInProgress = false;
        this.persistToStorage(response.data);
        this.loadCoverImages(response.data);
      },
      error: (err) => {
        console.error('[VehiclesCache] fetch error', err);
        this._loading.set(false);
        this.fetchInProgress = false;
        // Only surface the error when we have nothing cached to show
        if (!hasCached) {
          this._error.set('Não foi possível carregar seus veículos agora.');
        }
      },
    });
  }

  /** Look up a single vehicle from the in-memory list (no HTTP call). */
  getById(id: string): Vehicle | null {
    return this._vehicles().find((v) => v.id === id) ?? null;
  }

  /** Force-invalidate cache (e.g. after creating or deleting a vehicle). */
  invalidate(): void {
    this.fetchedAt = null;
    sessionStorage.removeItem(STORAGE_KEY);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /** Load cache entry from sessionStorage. Returns true if data was restored. */
  private hydrateFromStorage(): boolean {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return false;

      const stored = JSON.parse(raw) as StoredCache;
      if (!Array.isArray(stored?.data) || !stored.timestamp) return false;

      this._vehicles.set(stored.data);
      this.fetchedAt = stored.timestamp;
      return true;
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
      return false;
    }
  }

  /** Persist the current vehicles list to sessionStorage. */
  private persistToStorage(vehicles: Vehicle[]): void {
    try {
      const payload: StoredCache = { data: vehicles, timestamp: Date.now() };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Quota exceeded or storage unavailable — silent fail
    }
  }

  /**
   * Load cover images for each vehicle in parallel.
   * Updates the in-memory signal and re-persists to storage as each response arrives.
   */
  private loadCoverImages(vehicles: Vehicle[]): void {
    vehicles.forEach((vehicle) => {
      this.vehiclesService.getImages(vehicle.id).subscribe({
        next: (images) => {
          if (!images.length) return;

          this._vehicles.update((list) =>
            list.map((v) => (v.id === vehicle.id ? { ...v, images } : v)),
          );

          // Re-persist so images are also available after F5
          this.persistToStorage(this._vehicles());
        },
        error: () => {},
      });
    });
  }
}
