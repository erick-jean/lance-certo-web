import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { Auth } from '../../../core/services/auth';
import { Sidebar } from './sidebar';

@Component({
  standalone: true,
  template: '',
})
class LoginRouteStub {}

describe('Sidebar', () => {
  it('redirects to login after logout', () => {
    const authSpy = {
      logout: vi.fn(() => of(null)),
    };

    TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [
        provideRouter([{ path: 'login', component: LoginRouteStub }]),
        { provide: Auth, useValue: authSpy },
      ],
    });

    const fixture = TestBed.createComponent(Sidebar);
    fixture.detectChanges();

    fixture.componentInstance.logout();

    expect(authSpy.logout).toHaveBeenCalledTimes(1);
  });
});
