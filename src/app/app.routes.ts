import { Routes } from '@angular/router';
import { BuzzerDisplay, BuzzerPlayerButton } from './buzzers';
import { Dashboard, DashboardHome } from './dashboard';
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
            },
            // Create a "Director" for each game
            ...GAMES.flatMap((gameDef) => [
                {
                    path: `director/${gameDef.slug}`,
                    component: GameDirector,
                    data: gameDef,
                },
            ]),
        ],
    },
    // The raw game routes
    ...GAMES.flatMap((gameDef) => [
        {
            path: `game/${gameDef.slug}`,
            component: gameDef.game,
        },
    ]),
    {
        path: 'buzzer/:playerId',
        component: BuzzerPlayerButton,
    },
    {
        path: 'buzzer-display',
        component: BuzzerDisplay,
    },
];
