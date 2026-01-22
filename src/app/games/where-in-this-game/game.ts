import { Component, computed, effect, inject } from '@angular/core';
import { BuzzerDisplayDataStore } from '../../buzzers/data';
import { resolveStorageUrl } from '../../common/firestore';
import { preloadImage } from '../../common/utils';
import { BaseGame, CommonGameModule } from '../base/game';
import { WhereInThisGameDatabase } from './database';
import { Map, MapPin } from './map';
import {
    WHERE_IN_THIS_GAME_BASE_PATH,
    WhereInThisGameQuestion,
    WhereInThisGameState,
} from './model';

@Component({
    imports: [CommonGameModule, Map],
    templateUrl: './game.html',
    styleUrls: ['./game.scss', './effects.scss'],
    host: { class: 'pocket-pals-game-minimal' },
})
export class WhereInThisGameGame extends BaseGame<
    WhereInThisGameState,
    WhereInThisGameQuestion
> {
    protected readonly data: WhereInThisGameDatabase;
    protected readonly buzzers = inject(BuzzerDisplayDataStore);
    protected readonly baseUrl = `${WHERE_IN_THIS_GAME_BASE_PATH}/`;

    protected readonly currentLocation = computed(() => {
        const state = this.state();
        const question = this.currentQuestion();

        if (state.currentLocation !== null && question) {
            return question.locations[state.currentLocation];
        }

        return undefined;
    });

    protected readonly pins = computed<MapPin[]>(() => {
        const pins: MapPin[] = [];

        const teams = this.buzzers.teams();
        const state = this.state();
        const location = this.currentLocation();

        if (location) {
            for (const teamId of Object.keys(state.currentGuesses)) {
                const team = teams.find((t) => t.id === teamId);
                if (team) {
                    pins.push({
                        gridReference: state.currentGuesses[teamId],
                        color: team.color,
                        label: team.name,
                    });
                }
            }
        }

        return pins;
    });

    constructor() {
        const database = inject(WhereInThisGameDatabase);
        super(database);
        this.data = database;

        effect(() => {
            const question = this.currentQuestion();

            if (question) {
                const preloads: Promise<void>[] = question.locations.map((l) =>
                    preloadImage(
                        resolveStorageUrl(this.baseUrl + l.locationImageId),
                    ),
                );

                Promise.all(preloads)
                    .catch((err) => console.error(err))
                    .then(() => {
                        console.log(
                            `Preloaded all images for question "${question.gameId}".`,
                        );
                    });
            }
        });
    }
}
