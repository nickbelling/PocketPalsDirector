import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SimpleDialogService } from '../common/dialog/simple-dialog.service';

const MODULES: Type<unknown>[] = [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
];

/**
 * A module that collects common dependencies to make importing/exporting easier
 * for game controllers.
 */
@NgModule({
    imports: MODULES,
    exports: MODULES,
    providers: [SimpleDialogService],
})
export class CommonGameControllerModule {}
