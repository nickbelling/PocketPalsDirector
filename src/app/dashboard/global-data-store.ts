import { computed, Injectable, signal } from '@angular/core';
import { DocumentReference, setDoc } from 'firebase/firestore';
import { subscribeToDocument } from '../common/firestore';
import { GameDefinition, GAMES } from '../games/games';

export interface GlobalState {
    activeGames: string[];
    inactiveGames: string[];
}

export const DEFAULT_GLOBAL_STATE: GlobalState = {
    activeGames: [],
    inactiveGames: [...GAMES.map((g) => g.slug)],
};

const DOC_PATH = 'global/state';

function getGamesFromSlugs(slugs: string[]): GameDefinition[] {
    return slugs
        .map((slug) => GAMES.find((g) => g.slug === slug))
        .filter<GameDefinition>((g) => g !== undefined);
}

/** Global data store for determining the current list of active/inactive games. */
@Injectable({
    providedIn: 'root',
})
export class GlobalDataStore {
    private _stateRef: DocumentReference<GlobalState>;

    /** The current global state. */
    public readonly state = signal<GlobalState>(DEFAULT_GLOBAL_STATE);

    /** The list of active games. */
    public readonly activeGames = computed(() => {
        const state = this.state();
        return getGamesFromSlugs(state.activeGames);
    });

    /** The list of inactive games. */
    public readonly inactiveGames = computed(() => {
        const state = this.state();
        return getGamesFromSlugs(state.inactiveGames);
    });

    constructor() {
        // Subscribe to state updates
        this._stateRef = subscribeToDocument<GlobalState>(DOC_PATH, (state) => {
            if (state) {
                // If any games are missing from the state object, work out what
                // they are, and then add them to the inactive array
                const missingGameSlugs = this._getMissingGameSlugs(state);

                if (missingGameSlugs) {
                    state.inactiveGames = [
                        ...state.inactiveGames,
                        ...missingGameSlugs,
                    ];
                }

                this.state.set(state);
            }
        });
    }

    /** Sets the global state. */
    public async setState(state: GlobalState): Promise<void> {
        // If any games are present in both arrays, remove them from the
        // inactive one
        state.inactiveGames = state.inactiveGames.filter(
            (slug) => state.activeGames.indexOf(slug) === -1,
        );

        await setDoc(this._stateRef, state);
    }

    /** Gets any game slugs that are missing from the provided GlobalState. */
    private _getMissingGameSlugs(state: GlobalState): string[] | null {
        // Get all the game slugs first
        let missingGameSlugs = GAMES.map((g) => g.slug);

        // Check the active games array and remove any that are in there
        missingGameSlugs = missingGameSlugs.filter(
            (slug) => state.activeGames.indexOf(slug) === -1,
        );

        // Check the inactive games array and remove any that are in there
        missingGameSlugs = missingGameSlugs.filter(
            (slug) => state.inactiveGames.indexOf(slug) === -1,
        );

        if (missingGameSlugs.length > 0) {
            return missingGameSlugs;
        } else {
            return null;
        }
    }
}
