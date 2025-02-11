import { Component, inject } from '@angular/core';
import { AuthService } from '../../common/auth';

/** Displayed when the user does not have admin permissions. Acts as a 403 page. */
@Component({
    templateUrl: './dashboard-sign-in.html',
})
export class DashboardSignIn {
    protected auth = inject(AuthService);
}
