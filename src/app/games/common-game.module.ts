import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
    CardModule,
    FirebaseUploadedFileUrlPipe,
    FitTextDirective,
    NumberArrayPipe,
    SlideModule,
    SortPipe,
} from '../common';

const CONTROLLER_MODULES: Type<unknown>[] = [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatTooltipModule,
    NgOptimizedImage,
    SortPipe,
    FirebaseUploadedFileUrlPipe,
];

const GAME_MODULES: Type<unknown>[] = [
    CommonModule,
    NgOptimizedImage,
    FirebaseUploadedFileUrlPipe,
    SortPipe,
    NumberArrayPipe,
    FitTextDirective,
    SlideModule,
    CardModule,
];

/**
 * A module that collects common dependencies to make importing/exporting easier
 * for game controllers.
 */
@NgModule({
    imports: CONTROLLER_MODULES,
    exports: CONTROLLER_MODULES,
})
export class CommonControllerModule {}

@NgModule({
    imports: GAME_MODULES,
    exports: GAME_MODULES,
})
export class CommonGameModule {}
