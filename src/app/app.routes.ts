import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { DashboardHome } from './dashboard/home/dashboard-home';
import { GameDirector } from './game-director/game-director';
import { GAMES } from './games/games';

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
];
