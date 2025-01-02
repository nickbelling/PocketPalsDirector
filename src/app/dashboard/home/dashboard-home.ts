import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AudioVisualizer } from '../../common/audio/audio-visualizer';
import { GAMES } from '../../games/games';

@Component({
    templateUrl: './dashboard-home.html',
    imports: [RouterModule, MatButtonModule, MatIconModule, AudioVisualizer],
})
export class DashboardHome {
    public games = GAMES;
}
