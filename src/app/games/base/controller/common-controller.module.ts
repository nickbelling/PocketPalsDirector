import { ClipboardModule } from '@angular/cdk/clipboard';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import {
    MAT_FORM_FIELD_DEFAULT_OPTIONS,
    MatFormFieldModule,
} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Alert } from '../../../common/components/alert';
import { Player } from '../../../common/components/player';
import { FitTextDirective } from '../../../common/directives';
import { CommonFirebaseModule } from '../../../common/firestore';
import { CommonPipesModule } from '../../../common/pipes/pipes.module';
import {
    GameHero,
    GameSelector,
    VideogameNamePipe,
} from '../../../common/video-games';

const CONTROLLER_MODULES: Type<unknown>[] = [
    CommonModule,
    FormsModule,
    ClipboardModule,
    DragDropModule,
    OverlayModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatToolbarModule,
    MatTooltipModule,
    CommonFirebaseModule,
    CommonPipesModule,
    Alert,
    FitTextDirective,
    Player,
    GameHero,
    GameSelector,
    VideogameNamePipe,
];

/**
 * A module that collects common dependencies to make importing/exporting easier
 * for game controller components.
 */
@NgModule({
    imports: CONTROLLER_MODULES,
    exports: CONTROLLER_MODULES,
    providers: [
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: {
                subscriptSizing: 'dynamic',
            },
        },
    ],
})
export class CommonControllerModule {}
