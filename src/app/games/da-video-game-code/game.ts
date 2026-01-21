import { Component, effect, inject } from '@angular/core';
import { fadeInOutAnimation } from '../../common/animations';
import { resolveStorageUrl } from '../../common/firestore';
import { preloadImage } from '../../common/utils';
import { BaseGame, CommonGameModule } from '../base/game';
import { DaVideoGameCodeDatabase } from './database';
import {
    DA_VIDEO_GAME_CODE_BASE_PATH,
    DaVideoGameCodeQuestion,
    DaVideoGameCodeState,
} from './model';

@Component({
    imports: [CommonGameModule],
    templateUrl: './game.html',
    styleUrl: './game.scss',
    host: { class: 'pocket-pals-game' },
    animations: [fadeInOutAnimation()],
})
export class DaVideoGameCodeGame extends BaseGame<
    DaVideoGameCodeState,
    DaVideoGameCodeQuestion
> {
    protected readonly baseUrl = `${DA_VIDEO_GAME_CODE_BASE_PATH}/`;
    protected data: DaVideoGameCodeDatabase;

    constructor() {
        const database = inject(DaVideoGameCodeDatabase);
        super(database);
        this.data = database;

        effect(() => {
            const question = this.currentQuestion();

            if (question) {
                const preloads: Promise<void>[] = question.clues.map((c) =>
                    preloadImage(resolveStorageUrl(this.baseUrl + c.imageId)),
                );

                Promise.all(preloads)
                    .catch((err) => console.error(err))
                    .then(() => {
                        console.log(
                            `Preloaded all images for question "${question.title}".`,
                        );
                    });
            }
        });
    }
}
