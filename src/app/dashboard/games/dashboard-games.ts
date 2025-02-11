import { Component, computed, linkedSignal } from '@angular/core';
import { BuzzerController } from '../../buzzers/buzzer-controller';
import { GamePreview } from '../../common/components/preview';
import { injectRouteData, RESOLUTIONS } from '../../common/utils';
import { CommonControllerModule } from '../../games/base/controller';
import { GameDefinition } from '../../games/games';

/**
 * A frame that allows directing a single Pocket Pals game. Places the game's
 * controller on the left, and a preview of the game on the right, with its
 * browser source URL underneath.
 */
@Component({
    imports: [CommonControllerModule, BuzzerController, GamePreview],
    templateUrl: './dashboard-games.html',
    styleUrl: './dashboard-games.scss',
})
export class DashboardGames {
    /** The current game's definition (from the current route). */
    protected gameDefinition = injectRouteData<GameDefinition>();

    /** The list of possible resolutions. */
    protected RESOLUTIONS = RESOLUTIONS;
    /** An array of supported aspect ratios. */
    protected aspectRatios = Object.keys(RESOLUTIONS);

    /**
     * The currently selected resolution. When the game changes, automatically
     * sets it to that game's default resolution.
     */
    protected currentResolution = linkedSignal(
        () => this.gameDefinition().defaultResolution,
    );

    /**
     * The full URL to a browser source-compatible page that represents this
     * game, to be displayed in OBS/vMix.
     */
    protected gameUrl = computed(
        () => `${window.location.origin}/game/${this.gameDefinition().slug}`,
    );
}
