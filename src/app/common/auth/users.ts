import { inject, Injectable } from '@angular/core';
import { httpsCallable } from 'firebase/functions';
import { FUNCTIONS } from '../firestore';

export interface UserRecord {
    /** User's unique Firebase Auth ID. */
    uid: string;

    /** Optional: User's email address. */
    email?: string;

    /** Optional: User's display name. */
    displayName?: string;

    /** Optional: User's avatar image URL. */
    photoUrl?: string;

    /** True if the user is an administrator. */
    admin: boolean;
}

/** Service for administrators to manage other users. */
@Injectable({
    providedIn: 'root',
})
export class AdminService {
    private _functions = inject(FUNCTIONS);

    /** Lists all of the currently registered users. */
    public async listUsers(): Promise<UserRecord[]> {
        // This is defined as a Firebase function (see /functions in this repo's
        // root directory).
        const listUsersFunc = httpsCallable<UserRecord[]>(
            this._functions,
            'listUsers',
        );

        const result = await listUsersFunc();

        if (Array.isArray(result.data)) {
            return result.data as UserRecord[];
        } else {
            throw new Error(`Unexpected response format: ${result}`);
        }
    }

    /** Grants or removes the given user's administrator privileges. */
    public async setAdmin(uid: string, isAdmin: boolean): Promise<void> {
        const setAdminFunc = httpsCallable(this._functions, 'setAdmin');
        await setAdminFunc({ uid, isAdmin });
    }
}
