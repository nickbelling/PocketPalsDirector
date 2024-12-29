import { Route } from '@angular/router';
import { DashboardGames } from '../dashboard';
import { GAMES } from './games';

export const controllerRoutes: Route[] = [
    ...GAMES.flatMap((gameDef) => [
        {
            path: gameDef.slug,
            title: `Pocket Pals Director: ${gameDef.name}`,
            component: DashboardGames,
            data: gameDef,
        },
    ]),
];
