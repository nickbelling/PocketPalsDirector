import { Route } from '@angular/router';
import { AdminAuthGuard } from '../common/auth';
import { DashboardAdmin } from './admin/dashboard-admin';
import { Dashboard } from './dashboard';
import { DashboardGamesDatabase } from './database/dashboard-database';
import { DashboardHome } from './home/dashboard-home';
import { DashboardPlayers } from './players/dashboard-players';
import { DashboardSignIn } from './sign-in/dashboard-sign-in';

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
        path: 'game-database',
        title: 'Pocket Pals Director | Videogame Database',
        component: DashboardGamesDatabase,
        canActivate: [AdminAuthGuard],
    },
    {
        path: 'players',
        title: 'Pocket Pals Director | Players',
        component: DashboardPlayers,
        canActivate: [AdminAuthGuard],
    },
    {
        path: 'admin',
        title: 'Pocket Pals Director | Administration',
        component: DashboardAdmin,
        canActivate: [AdminAuthGuard],
    },
];
