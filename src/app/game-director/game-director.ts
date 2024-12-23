import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GamePreview, injectRouteData } from '../common';
import { GameDefinition } from '../games/games';

/**
 * A frame that allows directing a single Pocket Pals game. Places the game's
 * controller on the left, and a preview of the game on the right, with its
 * browser source URL underneath.
 */
@Component({
    imports: [
        CommonModule,
        GamePreview,
        ClipboardModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatTooltipModule,
    ],
    templateUrl: './game-director.html',
    styleUrl: './game-director.scss',
})
export class GameDirector {
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
