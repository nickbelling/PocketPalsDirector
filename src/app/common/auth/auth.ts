import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    User,
} from 'firebase/auth';
import { AUTH } from '../firestore/tokens';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private _auth = inject(AUTH);
    private _router = inject(Router);
    private _destroyRef = inject(DestroyRef);

    public user = signal<User | null>(null);
    public isAdmin = signal<boolean>(false);

    constructor() {
        const unsubscribeAuth = onAuthStateChanged(
            this._auth,
            async (user: User | null) => {
                this.user.set(user);

                if (user) {
                    const token = await user.getIdTokenResult();
                    if (token.claims['admin']) {
                        this.isAdmin.set(true);
                    }
                    this._router.navigate(['/', 'admin']);
                } else {
                    this.isAdmin.set(false);
                }
            },
        );

        this._destroyRef.onDestroy(() => {
            unsubscribeAuth();
        });
    }

    public async signIn(): Promise<void> {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(this._auth, provider);
    }

    public async signOut(): Promise<void> {
        await signOut(this._auth);
        this._router.navigate(['/', 'admin', '403']);
    }
}
