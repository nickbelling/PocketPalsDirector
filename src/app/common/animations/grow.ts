import {
    animate,
    AnimationMetadata,
    style,
    transition,
    trigger,
} from '@angular/animations';

interface GrowParams {
    width?: string;
    duration?: number;
}

function growInXTransition(params: GrowParams): AnimationMetadata {
    return transition(
        ':enter',
        [
            style({ width: '0px' }),
            animate('{{duration}}ms ease-in', style({ width: '{{width}}' })),
        ],
        { params: params },
    );
}

function growOutXTransition(params: GrowParams): AnimationMetadata {
    return transition(
        ':leave',
        [animate('{{duration}}ms ease-out', style({ width: 0 }))],
        { params: params },
    );
}

/**
 * An Angular animation that grows an element in size along the x-axis from 0px
 * to the provided width when it is added to the DOM.
 * @param width The final width of the element when the animation completes.
 * @param duration The duration in ms of the animation.
 * @returns AnimationMetadata
 */
export function growInXAnimation(
    width: string = '100px',
    duration: number = 300,
): AnimationMetadata {
    const params = { width, duration };
    return trigger('growInX', [growInXTransition(params)]);
}

/**
 * An Angular animation that shrinks an element in size from its current width
 * to 0px wide when it is removed from the DOM.
 * @param duration The duration in ms of the animation.
 * @returns AnimationMetadata
 */
export function growOutXAnimation(duration: number = 300) {
    const params = { duration };
    return trigger('growOutX', [growOutXTransition(params)]);
}

/**
 * An Angular animation that combines {@link growInXAnimation} and
 * {@link growOutXAnimation}.
 * @param width The final width of the element when the entry animation completes.
 * @param duration The duration in ms of the animation.
 * @returns AnimationMetadata
 */
export function growInOutXAnimation(width: '100px', duration: number = 300) {
    const params = { width, duration };

    return trigger('growInOutX', [
        growInXTransition(params),
        growOutXTransition(params),
    ]);
}
