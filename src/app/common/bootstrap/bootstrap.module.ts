import { inject, NgModule } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';

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
