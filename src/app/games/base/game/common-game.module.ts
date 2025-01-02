import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AudioVisualizer } from '../../../common/audio';
import { CategoriesModule } from '../../../common/components/categories';
import { PlayingCardModule } from '../../../common/components/playing-card';
import { FitTextDirective } from '../../../common/directives';
import { FirebaseUploadedFileUrlPipe } from '../../../common/firestore';
import { CommonPipesModule } from '../../../common/pipes/pipes.module';
import { SlideModule } from '../../../common/slide';
import { GameHero } from '../../../common/video-games';

const GAME_MODULES: Type<unknown>[] = [
    CommonModule,
    MatCardModule,
    CommonPipesModule,
    FirebaseUploadedFileUrlPipe,
    FitTextDirective,
    SlideModule,
    PlayingCardModule,
    CategoriesModule,
    GameHero,
    AudioVisualizer,
];

/**
 * A module that collects common dependencies to make importing/exporting easier
 * for game components.
 */
@NgModule({
    imports: GAME_MODULES,
    exports: GAME_MODULES,
})
export class CommonGameModule {}
