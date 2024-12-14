import { Routes } from '@angular/router';
import { StateYourBidnessControllerComponent } from './games/state-your-bidness/controller.component';
import { GameSelectorComponent } from './games/game-selector.component';

export const routes: Routes = [
    {
        path: '**',
        redirectTo: 'game-selector',
    },
    {
        path: 'game-selector',
        component: GameSelectorComponent,
    },
    {
        path: 'controller',
        children: [
            {
                path: 'state-your-bidness',
                component: StateYourBidnessControllerComponent,
            },
        ],
    },
];
