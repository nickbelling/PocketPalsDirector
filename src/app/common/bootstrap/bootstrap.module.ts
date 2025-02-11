import { inject, NgModule } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';

/**
 * Standalone module used to configure the `MatIconRegistry` outside of the main
 * application. This is so that other standalone components, e.g. Storybook
 * stories, have the correct value set.
 */
@NgModule({
    imports: [MatIconModule],
})
export class BootstrapModule {
    constructor() {
        inject(MatIconRegistry).setDefaultFontSetClass(
            'material-symbols-outlined',
        );
    }
}
