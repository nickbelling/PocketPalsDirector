import { Type } from '@angular/core';
import { AvoidingTheDmcaController } from './avoiding-the-dmca/controller';
import { AvoidingTheDmcaGame } from './avoiding-the-dmca/game';
import { BeatItController } from './beat-it/controller';
import { BeatItGame } from './beat-it/game';
import { ImpockstersController } from './impocksters/controller';
import { ImpockstersGame } from './impocksters/game';
import { LightlySteamedController } from './lightly-steamed/controller';
import { LightlySteamedGame } from './lightly-steamed/game';
import { OrderUpController } from './order-up/controller';
import { OrderUpGame } from './order-up/game';
import { RankyPankyController } from './ranky-panky/controller';
import { RankyPankyGame } from './ranky-panky/game';
import { ScreenshotInTheDarkController } from './screenshot-in-the-dark/controller';
import { ScreenshotInTheDarkGame } from './screenshot-in-the-dark/game';
import { StateYourBidnessController } from './state-your-bidness/controller';
import { StateYourBidnessGame } from './state-your-bidness/game';
import { VideogameCentipedeController } from './videogame-centipede/controller';
import { VideogameCentipedeGame } from './videogame-centipede/game';

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
        name: 'Beat It',
        slug: 'beat-it',
        icon: 'timer',
        game: BeatItGame,
        controller: BeatItController,
        supportsBuzzers: false,
    },
    {
        name: 'Impocksters',
        slug: 'impocksters',
        icon: 'theater_comedy',
        game: ImpockstersGame,
        controller: ImpockstersController,
        supportsBuzzers: true,
    },
    {
        name: 'Lightly Steamed',
        slug: 'lightly-steamed',
        icon: 'reviews',
        game: LightlySteamedGame,
        controller: LightlySteamedController,
        supportsBuzzers: true,
    },
    {
        name: 'Order Up',
        slug: 'order-up',
        icon: 'view_carousel',
        game: OrderUpGame,
        controller: OrderUpController,
        supportsBuzzers: false,
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
    {
        name: 'Videogame Centipede',
        slug: 'videogame-centipede',
        icon: 'join',
        game: VideogameCentipedeGame,
        controller: VideogameCentipedeController,
        supportsBuzzers: true,
    },
];
