import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SimpleDialogService } from '../common/dialog/simple-dialog.service';
import { SortPipe } from '../common/pipes/sort.pipe';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

const EXPORTS: Type<unknown>[] = [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatTooltipModule,
    SortPipe,
];

/**
 * A module that collects common dependencies to make importing/exporting easier
 * for game controllers.
 */
@NgModule({
    imports: EXPORTS,
    exports: EXPORTS,
    providers: [SimpleDialogService, SortPipe],
})
export class CommonGameControllerModule {}
