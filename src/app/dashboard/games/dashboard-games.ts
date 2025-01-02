import { Component, computed } from '@angular/core';
import { BuzzerController } from '../../buzzers/buzzer-controller';
import { GamePreview } from '../../common/components/preview';
import { injectRouteData } from '../../common/utils';
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

    /**
     * The full URL to a browser source-compatible page that represents this
     * game, to be displayed in OBS/vMix.
     */
    protected gameUrl = computed(
        () => `${window.location.origin}/game/${this.gameDefinition().slug}`,
    );
}
