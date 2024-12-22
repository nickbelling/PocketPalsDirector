import { Type } from '@angular/core';
import { RankyPankyController } from './ranky-panky/controller';
import { RankyPankyGame } from './ranky-panky/game';
import { StateYourBidnessController } from './state-your-bidness/controller';
import { StateYourBidnessGame } from './state-your-bidness/game';

export interface GameDefinition {
    name: string;
    slug: string;
    game: Type<unknown>;
    controller: Type<unknown>;
}

export const GAMES: GameDefinition[] = [
    {
        name: 'State Your Bidness',
        slug: 'state-your-bidness',
        game: StateYourBidnessGame,
        controller: StateYourBidnessController,
    },
    {
        name: 'Ranky Panky',
        slug: 'ranky-panky',
        game: RankyPankyGame,
        controller: RankyPankyController,
    },
];
