import { Type } from '@angular/core';
import {
    Resolution,
    RESOLUTION_1280x720,
    RESOLUTION_1920x1080,
    RESOLUTION_540x960,
    RESOLUTION_960x720,
} from '../common/utils/resolutions';
import { AvoidingTheDmcaController } from './avoiding-the-dmca/controller';
import { AvoidingTheDmcaGame } from './avoiding-the-dmca/game';
import { BeatItController } from './beat-it/controller';
import { BeatItGame } from './beat-it/game';
import { EmojionalDamageController } from './emojional-damage/controller';
import { EmojionalDamageGame } from './emojional-damage/game';
import { FakeNewsFactCheckersController } from './fake-news/controller';
import { FakeNewsFactCheckersGame } from './fake-news/game';
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
import { SwitchThatReverseItController } from './switch-that-reverse-it/controller';
import { SwitchThatReverseItGame } from './switch-that-reverse-it/game';
import { TagYoureItController } from './tag-youre-it/controller';
import { TagYoureItGame } from './tag-youre-it/game';
import { VideogameCentipedeController } from './videogame-centipede/controller';
import { VideogameCentipedeGame } from './videogame-centipede/game';
import { WhereInThisGameController } from './where-in-this-game/controller';
import { WhereInThisGameGame } from './where-in-this-game/game';

export interface GameDefinition {
    /** The game's canonical name. */
    name: string;

    /**
     * A "slugged" version of the game's name - used for routing to the game's
     * browser source link for OBS/vMix.
     */
    slug: string;

    /** An icon representing the game. */
    icon?: string;

    /** The game's Angular component. */
    game: Type<unknown>;

    /** The game's director controller Angular component. */
    controller: Type<unknown>;

    /**
     * True if the game supports buzzers and therefore should add those controls
     * to the controller.
     */
    supportsBuzzers: boolean;

    /**
     * The default resolution for the game as it should appear in the director's
     * preview for this game.
     */
    defaultResolution: Resolution;
}

/**
 * Definitions for each game, used as route data to both list the available
 * games but also define their slug
 */
export const GAMES: GameDefinition[] = [
    {
        name: 'Avoiding the DMCA',
        slug: 'avoiding-the-dmca',
        icon: 'music_note',
        game: AvoidingTheDmcaGame,
        controller: AvoidingTheDmcaController,
        supportsBuzzers: true,
        defaultResolution: RESOLUTION_960x720,
    },
    {
        name: 'Beat It',
        slug: 'beat-it',
        icon: 'timer',
        game: BeatItGame,
        controller: BeatItController,
        supportsBuzzers: false,
        defaultResolution: RESOLUTION_1280x720,
    },
    {
        name: 'Emojional Damage',
        slug: 'emojional-damage',
        icon: 'mood',
        game: EmojionalDamageGame,
        controller: EmojionalDamageController,
        supportsBuzzers: true,
        defaultResolution: RESOLUTION_960x720,
    },
    {
        name: 'Fake News Fact Checkers',
        slug: 'fake-news',
        icon: 'newspaper',
        game: FakeNewsFactCheckersGame,
        controller: FakeNewsFactCheckersController,
        supportsBuzzers: true,
        defaultResolution: RESOLUTION_1280x720,
    },
    {
        name: 'Impocksters',
        slug: 'impocksters',
        icon: 'theater_comedy',
        game: ImpockstersGame,
        controller: ImpockstersController,
        supportsBuzzers: true,
        defaultResolution: RESOLUTION_540x960,
    },
    {
        name: 'Lightly Steamed',
        slug: 'lightly-steamed',
        icon: 'reviews',
        game: LightlySteamedGame,
        controller: LightlySteamedController,
        supportsBuzzers: true,
        defaultResolution: RESOLUTION_1280x720,
    },
    {
        name: 'Order Up',
        slug: 'order-up',
        icon: 'view_carousel',
        game: OrderUpGame,
        controller: OrderUpController,
        supportsBuzzers: false,
        defaultResolution: RESOLUTION_1280x720,
    },
    {
        name: 'Ranky Panky',
        slug: 'ranky-panky',
        icon: 'low_priority',
        game: RankyPankyGame,
        controller: RankyPankyController,
        supportsBuzzers: false,
        defaultResolution: RESOLUTION_960x720,
    },
    {
        name: 'Screenshot in the Dark',
        slug: 'screenshot-in-the-dark',
        icon: 'photo_library',
        game: ScreenshotInTheDarkGame,
        controller: ScreenshotInTheDarkController,
        supportsBuzzers: true,
        defaultResolution: RESOLUTION_1280x720,
    },
    {
        name: 'State Your Bidness',
        slug: 'state-your-bidness',
        icon: 'bid_landscape',
        game: StateYourBidnessGame,
        controller: StateYourBidnessController,
        supportsBuzzers: false,
        defaultResolution: RESOLUTION_1280x720,
    },
    {
        name: 'Switch That, Reverse It',
        slug: 'switch-that-reverse-it',
        icon: 'swap_horiz',
        game: SwitchThatReverseItGame,
        controller: SwitchThatReverseItController,
        supportsBuzzers: true,
        defaultResolution: RESOLUTION_960x720,
    },
    {
        name: "Tag, You're It!",
        slug: 'tag-youre-it',
        icon: 'sell',
        game: TagYoureItGame,
        controller: TagYoureItController,
        supportsBuzzers: true,
        defaultResolution: RESOLUTION_1280x720,
    },
    {
        name: 'Videogame Centipede',
        slug: 'videogame-centipede',
        icon: 'join',
        game: VideogameCentipedeGame,
        controller: VideogameCentipedeController,
        supportsBuzzers: true,
        defaultResolution: RESOLUTION_960x720,
    },
    {
        name: 'Where in This Game is Carmen Sandiego?',
        slug: 'where-in-this-game',
        icon: 'globe_location_pin',
        game: WhereInThisGameGame,
        controller: WhereInThisGameController,
        supportsBuzzers: true,
        defaultResolution: RESOLUTION_1920x1080,
    },
];
