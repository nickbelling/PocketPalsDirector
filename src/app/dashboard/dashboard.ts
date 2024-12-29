import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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
import { GAMES } from '../games/games';

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
})
export class Dashboard {
    public games = GAMES;
    public auth = inject(AuthService);
    public sound = inject(SoundService);

    protected soundEnabled = this.sound.soundEnabled;

    constructor() {
        // By default, the admin interface should have sound turned off
        this.soundEnabled.set(false);
    }
}
