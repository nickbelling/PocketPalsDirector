import { Route } from '@angular/router';
import { AdminAuthGuard } from '../common/auth';
import { Dashboard } from './dashboard';
import { DashboardHome } from './home/dashboard-home';
import { DashboardPlayers } from './players/dashboard-players';
import { DashboardSignIn } from './sign-in/dashboard-sign-in';

export const dashboardChildRoutes: Route[] = [
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
    {
        path: 'director',
        canActivate: [AdminAuthGuard],
        loadChildren: () =>
            import('./../games/controllers.routes').then(
                (x) => x.controllerRoutes,
            ),
    },
    {
        path: 'players',
        title: 'Pocket Pals Director | Players',
        component: DashboardPlayers,
        canActivate: [AdminAuthGuard],
    },
];

export const dashboardRoutes: Route[] = [
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
                title: 'Pocket Pals Director | Home',
                component: DashboardHome,
            },
        ],
    },
];
