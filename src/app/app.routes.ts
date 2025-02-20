import { Routes } from '@angular/router';

/**
 * Routes used by the Angular router at the application root.
 *
 * Note that we use `import()` statements from `loadComponent` or `loadChildren`
 * callbacks rather than direct usage to facilitate chunking and lazy loading.
 */
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
