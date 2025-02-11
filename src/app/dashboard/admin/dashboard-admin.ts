import { CommonModule } from '@angular/common';
import { Component, inject, resource } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { AdminService, AuthService, UserRecord } from '../../common/auth';
import { ToastService } from '../../common/toast';

/** User management screen. Allows conversion of other users to/from admin. */
@Component({
    imports: [
        CommonModule,
        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        MatIconModule,
        MatMenuModule,
        MatTableModule,
    ],
    templateUrl: './dashboard-admin.html',
    styleUrl: './dashboard-admin.scss',
})
export class DashboardAdmin {
    private _auth = inject(AuthService);
    private _admin = inject(AdminService);
    private _toast = inject(ToastService);

    /** The currently logged-in user. */
    protected readonly user = this._auth.user;

    /** The full user list. */
    protected readonly userList = resource({
        loader: async () => {
            const users = await this._admin.listUsers();
            return users;
        },
    });

    /**
     * Grants or revokes admin permissions from the given user.
     * @param user The user to change.
     * @param isAdmin Whether to grant or revoke admin permissions.
     */
    public async setAdmin(user: UserRecord, isAdmin: boolean): Promise<void> {
        try {
            await this._admin.setAdmin(user.uid, isAdmin);
            this.userList.reload();
            if (isAdmin) {
                this._toast.info(
                    `Granted admin permissions to ${user.displayName}.`,
                );
            } else {
                this._toast.info(
                    `Revoked admin permissions from ${user.displayName}.`,
                );
            }
        } catch (error) {
            if (isAdmin) {
                this._toast.error(
                    `Failed to grant admin permissions to ${user.displayName}.`,
                );
            } else {
                this._toast.error(
                    `Failed to revoke admin permissions from ${user.displayName}.`,
                );
            }
        }
    }
}
