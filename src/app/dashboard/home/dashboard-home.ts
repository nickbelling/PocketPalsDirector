import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { GAMES } from '../../games/games';

@Component({
    templateUrl: './dashboard-home.html',
    imports: [RouterModule, MatButtonModule],
})
export class DashboardHome {
    public games = GAMES;
}
