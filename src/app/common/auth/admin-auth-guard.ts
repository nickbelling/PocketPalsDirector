import { inject, Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from './auth';

@Injectable({
    providedIn: 'root',
})
export class AdminAuthGuard implements CanActivate {
    private _auth = inject(AuthService);
    private _router = inject(Router);

    public async canActivate(
        _: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): Promise<boolean> {
        // Ensure the first check of the sign-in state has occurred.
        await this._auth.waitForAuthInit();

        if (this._auth.isAdmin()) {
            // Can access this route.
            return true;
        } else {
            // Set the redirect URL to come back to once they successfully
            // sign-in as an admin
            this._auth.setRedirectUrl(state.url);

            // Boot them to the 403 page
            this._router.navigate(['/', 'dashboard', '403']);

            // Prevent visiting this guarded route
            return false;
        }
    }
}
