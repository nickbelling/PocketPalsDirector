import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { AudioService } from '../common/audio';
import { AuthService } from '../common/auth';
import { GlobalDataStore } from './global-data-store';

/** The main dashboard component, showing the top toolbar. */
@Component({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        MatSlideToggleModule,
        MatToolbarModule,
        MatTooltipModule,
    ],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
    private _globalData = inject(GlobalDataStore);
    private _audio = inject(AudioService);
    public auth = inject(AuthService);

    protected audioEnabled = this._audio.audioEnabled;
    protected activeGames = this._globalData.activeGames;
    protected inactiveGames = this._globalData.inactiveGames;

    constructor() {
        // By default, the admin interface should have sound turned off
        this.audioEnabled.set(false);
    }
}
