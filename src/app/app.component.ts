import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule, MatIconModule],
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    private _matIconRegistry = inject(MatIconRegistry);

    constructor() {
        this._matIconRegistry.setDefaultFontSetClass(
            'material-symbols-outlined',
        );
    }
}
