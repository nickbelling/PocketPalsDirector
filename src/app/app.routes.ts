import { Routes } from '@angular/router';
import { BuzzerDisplay, BuzzerPlayerButton } from './buzzers';
import { AdminAuthGuard } from './common';
import { Dashboard, DashboardHome, DashboardSignIn } from './dashboard';
import { DashboardPlayers } from './dashboard/players/dashboard-players';
import { GameDirector } from './game-director';
import { GAMES } from './games';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'admin',
        pathMatch: 'full',
    },
    {
        path: 'admin',
        component: Dashboard,
        children: [
            {
                path: '',
                redirectTo: 'home',
                pathMatch: 'full',
            },
            {
                path: 'home',
                component: DashboardHome,
                title: 'Pocket Pals Director | Home',
                canActivate: [AdminAuthGuard],
            },
            {
                path: '403',
                title: 'Pocket Pals Director | Sign in',
                component: DashboardSignIn,
            },
            // Create a "Director" for each game
            ...GAMES.flatMap((gameDef) => [
                {
                    path: `director/${gameDef.slug}`,
                    component: GameDirector,
                    title: `Pocket Pals Director | ${gameDef.name}`,
                    canActivate: [AdminAuthGuard],
                    data: gameDef,
                },
            ]),
            {
                path: 'players',
                title: 'Pocket Pals Director | Players',
                component: DashboardPlayers,
                canActivate: [AdminAuthGuard],
            },
        ],
    },
    // The raw game routes
    ...GAMES.flatMap((gameDef) => [
        {
            path: `game/${gameDef.slug}`,
            title: `Pocket Pals: ${gameDef.name}`,
            component: gameDef.game,
        },
    ]),
    {
        path: 'buzzer/:playerId',
        component: BuzzerPlayerButton,
    },
    {
        path: 'buzzer-display',
        title: 'Pocket Pals | Buzzer',
        component: BuzzerDisplay,
    },
];
