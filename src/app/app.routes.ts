import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
    },
    {
        path: 'dashboard',
        loadComponent: () =>
            import('./dashboard/dashboard').then((x) => x.Dashboard),
        loadChildren: () =>
            import('./dashboard/dashboard.routes').then(
                (x) => x.dashboardChildRoutes,
            ),
    },
    {
        path: 'game',
        loadChildren: () =>
            import('./games/games.routes').then((x) => x.gameRoutes),
    },
    {
        path: 'buzzer/:playerId',
        loadComponent: () =>
            import('./buzzers/buzzer-player/buzzer-player').then(
                (x) => x.BuzzerPlayerButton,
            ),
    },
    {
        path: 'buzzer-display',
        title: 'Pocket Pals | Buzzer',
        loadComponent: () =>
            import('./buzzers/buzzer-display/buzzer-display').then(
                (x) => x.BuzzerDisplay,
            ),
    },
];
