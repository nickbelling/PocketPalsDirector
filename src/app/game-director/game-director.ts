import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GamePreview } from '../common/preview/preview';
import { injectRouteData } from '../common/utils';
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
        () => `${window.location.origin}/game/${this.gameDefinition().slug}`
    );
}
