import { isNotNullOrUndefined } from '../../common/utils';

export const TAG_YOURE_IT_BASE_PATH = 'games/tag-youre-it';

export interface SteamSpyAppResponse {
    appid: number;
    name: string;
    tags: Record<string, number>;
}

export function isSteamSpyAppResponse(
    value: unknown,
): value is SteamSpyAppResponse {
    if (!value) return false;
    if (typeof value !== 'object') return false;

    const typed = value as SteamSpyAppResponse;
    return (
        isNotNullOrUndefined(typed.appid) &&
        isNotNullOrUndefined(typed.name) &&
        isNotNullOrUndefined(typed.tags) &&
        typeof typed.tags === 'object'
    );
}

export const TAG_GROUPS = [
    [0, 0],
    [0, 3],
    [3, 6],
    [6, 10],
    [10, 15],
    [15, 20],
];

export interface TagYoureItState {
    /**
     * The current question ID. Null if no question selected.
     */
    currentQuestion: string | null;

    /**
     * The index of TAG_GROUPS which have been revealed from the set the player is
     * able to manipulate.
     */
    revealedTagIndex: number;

    /** True if the answer is showing. */
    showingAnswer: boolean;
}

export const TAG_YOURE_IT_STATE_DEFAULT: TagYoureItState = {
    currentQuestion: null,
    revealedTagIndex: 0,
    showingAnswer: false,
};

export interface TagYoureItQuestion {
    /** The VGDB game ID for the game these tags are from. */
    gameId: string;

    /** The app ID of the game as it appears on Steam. */
    steamAppId: number;

    /** The Steam user tags. */
    tags: string[];
}
