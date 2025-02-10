import {
    animate,
    AnimationMetadata,
    style,
    transition,
    trigger,
} from '@angular/animations';

interface DurationParams {
    duration?: number;
}

function fadeInTransition(params?: DurationParams): AnimationMetadata {
    return transition(
        ':enter',
        [
            style({ opacity: 0 }),
            animate('{{duration}}ms ease-in', style({ opacity: 1 })),
        ],
        { params: params },
    );
}

function fadeOutTransition(params?: DurationParams): AnimationMetadata {
    return transition(
        ':leave',
        [animate('{{duration}}ms ease-out', style({ opacity: 0 }))],
        { params: params },
    );
}

/**
 * An Angular animation that can be used to fade in an item when it is added to
 * the DOM.
 * @param duration The duration of the animation in ms.
 * @returns AnimationMetadata
 */
export function fadeInAnimation(duration: number = 300) {
    const params = { duration };
    return trigger('fadeIn', [fadeInTransition(params)]);
}

/**
 * An Angular animation that can be used to fade out an item when it leaves the
 * DOM.
 * @param duration The duration of the animation in ms.
 * @returns AnimationMetadata
 */
export function fadeOutAnimation(duration: number = 300) {
    const params = { duration };
    return trigger('fadeOut', [fadeOutTransition(params)]);
}

/**
 * An Angular animation that can be used to fade in an item when it is added to
 * the DOM, and fade it out when it leaves.
 * @param duration The duration of the animation in ms.
 * @returns AnimationMetadata
 */
export function fadeInOutAnimation(duration: number = 300) {
    const params = { duration };

    return trigger('fadeInOut', [
        fadeInTransition(params),
        fadeOutTransition(params),
    ]);
}
