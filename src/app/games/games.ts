import { Type } from '@angular/core';
import { AvoidingTheDmcaController } from './avoiding-the-dmca/controller';
import { AvoidingTheDmcaGame } from './avoiding-the-dmca/game';
import { RankyPankyController } from './ranky-panky/controller';
import { RankyPankyGame } from './ranky-panky/game';
import { ScreenshotInTheDarkController } from './screenshot-in-the-dark/controller';
import { ScreenshotInTheDarkGame } from './screenshot-in-the-dark/game';
import { StateYourBidnessController } from './state-your-bidness/controller';
import { StateYourBidnessGame } from './state-your-bidness/game';

export interface GameDefinition {
    name: string;
    slug: string;
    icon?: string;
    game: Type<unknown>;
    controller: Type<unknown>;
    supportsBuzzers: boolean;
}

export const GAMES: GameDefinition[] = [
    {
        name: 'Avoiding the DMCA',
        slug: 'avoiding-the-dmca',
        icon: 'music_note',
        game: AvoidingTheDmcaGame,
        controller: AvoidingTheDmcaController,
        supportsBuzzers: true,
    },
    {
        name: 'Ranky Panky',
        slug: 'ranky-panky',
        icon: 'low_priority',
        game: RankyPankyGame,
        controller: RankyPankyController,
        supportsBuzzers: false,
    },
    {
        name: 'Screenshot in the Dark',
        slug: 'screenshot-in-the-dark',
        icon: 'photo_library',
        game: ScreenshotInTheDarkGame,
        controller: ScreenshotInTheDarkController,
        supportsBuzzers: true,
    },
    {
        name: 'State Your Bidness',
        slug: 'state-your-bidness',
        icon: 'bid_landscape',
        game: StateYourBidnessGame,
        controller: StateYourBidnessController,
        supportsBuzzers: false,
    },
];
