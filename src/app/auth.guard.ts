import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router) { }

  canActivate(): Observable<boolean> {
    // Gunakan RxJS `from` untuk mengubah `onAuthStateChanged` menjadi Observable
    return from(
      new Promise<boolean>((resolve) => {
        this.auth.onAuthStateChanged((user) => {
          if (user) {
            resolve(true); 
          } else {
            this.router.navigate(['/login']); 
            resolve(false);
          }
        });
      })
    );
  }
}
