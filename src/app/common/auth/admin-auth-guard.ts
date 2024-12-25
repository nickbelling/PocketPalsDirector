import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth';

@Injectable({
    providedIn: 'root',
})
export class AdminAuthGuard implements CanActivate {
    private _auth = inject(AuthService);
    private _router = inject(Router);

    public canActivate(): boolean {
        if (this._auth.isAdmin()) {
            return true;
        } else {
            this._router.navigate(['/', 'admin', '403']);
            return false;
        }
    }
}
