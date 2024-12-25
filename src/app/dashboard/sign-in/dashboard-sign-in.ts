import { Component, inject } from '@angular/core';
import { AuthService } from '../../common';

@Component({
    templateUrl: './dashboard-sign-in.html',
})
export class DashboardSignIn {
    protected auth = inject(AuthService);
}
