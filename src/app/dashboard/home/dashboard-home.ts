import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { BuzzerController } from '../../buzzers/buzzer-controller';
import { GAMES } from '../../games/games';

@Component({
    templateUrl: './dashboard-home.html',
    imports: [RouterModule, MatButtonModule, BuzzerController],
})
export class DashboardHome {
    public games = GAMES;
}
