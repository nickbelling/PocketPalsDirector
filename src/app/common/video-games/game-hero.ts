import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { GameHeroSrcPipe, GameLogoSrcPipe } from './logo-src.pipe';
import { VideogameDatabaseService } from './videogame-database-service';

@Component({
    selector: 'game-hero',
    imports: [CommonModule, GameHeroSrcPipe, GameLogoSrcPipe],
    templateUrl: './game-hero.html',
    styleUrl: './game-hero.scss',
})
export class GameHero {
    private _vgDb = inject(VideogameDatabaseService);

    public gameId = input.required<string>();

    public game = computed(() => {
        const games = this._vgDb.games();
        const gameId = this.gameId();

        return games.find((g) => g.id === gameId);
    });
}
