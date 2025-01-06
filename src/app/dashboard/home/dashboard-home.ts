import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { BuzzerController } from '../../buzzers/buzzer-controller/buzzer-controller';
import { BuzzerDisplay } from '../../buzzers/buzzer-display/buzzer-display';
import { GamePreview } from '../../common/components/preview/preview';
import { PlayerWarningTimer } from '../../common/timer/player-warning-timer';
import { GAMES } from '../../games/games';

@Component({
    imports: [
        RouterModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        BuzzerController,
        BuzzerDisplay,
        GamePreview,
        PlayerWarningTimer,
    ],
    templateUrl: './dashboard-home.html',
    styleUrl: './dashboard-home.scss',
})
export class DashboardHome {
    public games = GAMES;
}
