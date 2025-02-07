import { inject, Injectable } from '@angular/core';
import { httpsCallable } from 'firebase/functions';
import { FUNCTIONS } from '../firestore';

export interface UserRecord {
    uid: string;
    email?: string;
    displayName?: string;
    photoUrl?: string;
    admin: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class AdminService {
    private _functions = inject(FUNCTIONS);

    public async listUsers(): Promise<UserRecord[]> {
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

    public async setAdmin(uid: string, isAdmin: boolean): Promise<void> {
        const setAdminFunc = httpsCallable(this._functions, 'setAdmin');
        await setAdminFunc({ uid, isAdmin });
    }
}
