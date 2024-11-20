import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';  // Perbaiki nama menjadi AuthGuard
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { of } from 'rxjs';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockRouter: Partial<Router>;
  let mockAuth: Partial<Auth>;

  beforeEach(() => {
    // Mock dependensi Router dan Auth
    mockRouter = {
      navigate: jasmine.createSpy('navigate'),
    };

    mockAuth = {
      onAuthStateChanged: jasmine.createSpy('onAuthStateChanged').and.callFake((callback) => {
        callback(null); // Simulasikan keadaan pengguna yang tidak terautentikasi
        return () => { }; // Unsubscribe mock
      }),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Router, useValue: mockRouter },
        { provide: Auth, useValue: mockAuth },
      ],
    });

    guard = TestBed.inject(AuthGuard);  // Injeksi AuthGuard ke dalam pengujian
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should navigate to login if not authenticated', (done) => {
    // Pengujian jika pengguna tidak terautentikasi
    guard.canActivate().subscribe((result) => {
      expect(result).toBeFalse();  // Harusnya false karena tidak ada pengguna
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);  // Harusnya mengarahkan ke login
      done();
    });
  });

  it('should allow navigation if authenticated', (done) => {
    // Simulasikan keadaan pengguna yang terautentikasi
    mockAuth.onAuthStateChanged = jasmine.createSpy('onAuthStateChanged').and.callFake((callback) => {
      callback({ uid: '123' });  // Pengguna terautentikasi
      return () => { };  // Unsubscribe mock
    });

    guard.canActivate().subscribe((result) => {
      expect(result).toBeTrue();  // Harusnya true karena pengguna terautentikasi
      done();
    });
  });
});
