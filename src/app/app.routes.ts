import { Routes } from '@angular/router';
import { StateYourBidnessController } from './games/state-your-bidness/controller';
import { GameSelectorComponent } from './games/game-selector';

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
                component: StateYourBidnessController,
            },
        ],
    },
];
