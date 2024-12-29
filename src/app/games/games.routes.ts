import { Route } from '@angular/router';
import { GAMES } from './games';

export const gameRoutes: Route[] = [
    ...GAMES.flatMap((gameDef) => [
        {
            path: gameDef.slug,
            title: `Pocket Pals: ${gameDef.name}`,
            component: gameDef.game,
        },
    ]),
];
