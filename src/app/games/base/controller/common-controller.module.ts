import { A11yModule } from '@angular/cdk/a11y';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import {
    MAT_FORM_FIELD_DEFAULT_OPTIONS,
    MatFormFieldModule,
} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Alert } from '../../../common/components/alert';
import {
    AudioFileField,
    ImageFileField,
} from '../../../common/components/file-fields';
import { Player } from '../../../common/components/player';
import {
    QuestionDisplay,
    QuestionSelector,
    QuestionTemplateDirective,
} from '../../../common/components/question-selector';
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
    A11yModule,
    ClipboardModule,
    DragDropModule,
    OverlayModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
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
    ImageFileField,
    AudioFileField,
    QuestionSelector,
    QuestionTemplateDirective,
    QuestionDisplay,
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
