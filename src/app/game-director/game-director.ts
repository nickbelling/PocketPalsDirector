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
    protected gameDefinition = injectRouteData<GameDefinition>();

    protected gameUrl = computed(
        () => `${window.location.origin}/game/${this.gameDefinition().slug}`,
    );
}
