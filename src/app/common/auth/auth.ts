import {
    computed,
    DestroyRef,
    effect,
    inject,
    Injectable,
    signal,
} from '@angular/core';
import { Router } from '@angular/router';
import {
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    User,
} from 'firebase/auth';
import { firstValueFrom, ReplaySubject } from 'rxjs';
import { AUTH } from '../firestore/tokens';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private _auth = inject(AUTH);
    private _router = inject(Router);
    private _destroyRef = inject(DestroyRef);
    private _loadedWaiter = new ReplaySubject<void>(1);
    private _redirectUrl?: string;

    public user = signal<User | null>(null);
    public isSignedIn = computed(() => this.user() !== null);
    public isAdmin = signal<boolean>(false);
    public isLoaded = signal<boolean>(false);

    constructor() {
        // Monitor Firebase's auth change event
        const unsubscribeAuth = onAuthStateChanged(
            this._auth,
            async (user: User | null) => {
                // Set the user (even if it's null, i.e. they have signed out)
                this.user.set(user);

                if (user) {
                    // User has just signed in.
                    const token = await user.getIdTokenResult();
                    if (token.claims['admin']) {
                        // User is an admin
                        this.isAdmin.set(true);
                    }
                } else {
                    // User is signed-out, definitely not an admin
                    this.isAdmin.set(false);
                }

                this.isLoaded.set(true);
            },
        );

        // Monitor the isLoaded signal for changes, and complete the
        // _loadedWaiter subject. This will only ever happen once, as isLoaded
        // is only ever set to true.
        effect(() => {
            const isLoaded = this.isLoaded();

            if (isLoaded) {
                this._loadedWaiter.next();
                this._loadedWaiter.complete();
            }
        });

        // When the user is successfully set, if a previous redirect URL was
        // stored, navigate to it.
        effect(() => {
            const user = this.user();

            if (user) {
                if (this._redirectUrl) {
                    this._router.navigateByUrl(this._redirectUrl);
                    this._redirectUrl = undefined;
                }
            }
        });

        this._destroyRef.onDestroy(() => {
            unsubscribeAuth();
        });
    }

    /**
     * An awaitable method (usable by a router guard) to determine if the first
     * load of the sign-in state has occurred.
     */
    public async waitForAuthInit(): Promise<void> {
        // If it’s already loaded, return a resolved promise:
        if (this.isLoaded()) {
            return;
        }

        // Otherwise, wait until the effect above emits on _loadedSubject:
        await firstValueFrom(this._loadedWaiter);
    }

    /**
     * Initiates the Google sign-in popup that signs in the user.
     */
    public async signIn(): Promise<void> {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(this._auth, provider);
    }

    /**
     * Signs-out the user.
     */
    public async signOut(): Promise<void> {
        await signOut(this._auth);
        this._router.navigate(['/', 'admin', '403']);
    }

    /**
     * If a route transition was unsuccessful, a route guard can use this method
     * to store the `RouterStateSnapshot`'s `.url` property here. Successful
     * sign-in later will allow the user to redirect to this page.
     * @param url The URL to redirect to upon successful sign-in.
     */
    public setRedirectUrl(url: string): void {
        this._redirectUrl = url;
    }
}
