import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { AuthService } from '../common/auth';
import { SoundService } from '../common/files';
import { GlobalDataStore } from './global-data-store';

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
    ],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
    private _globalData = inject(GlobalDataStore);
    public auth = inject(AuthService);
    public sound = inject(SoundService);

    protected soundEnabled = this.sound.soundEnabled;
    protected activeGames = this._globalData.activeGames;
    protected inactiveGames = this._globalData.inactiveGames;

    constructor() {
        // By default, the admin interface should have sound turned off
        this.soundEnabled.set(false);
    }
}
