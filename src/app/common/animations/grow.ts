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

export function growInXAnimation(
    width: string = '100px',
    duration: number = 300,
): AnimationMetadata {
    const params = { width, duration };
    return trigger('growInX', [growInXTransition(params)]);
}

export function growOutXAnimation(duration: number = 300) {
    const params = { duration };
    return trigger('growOutX', [growOutXTransition(params)]);
}

export function growInOutXAnimation(width: '100px', duration: number = 300) {
    const params = { width, duration };

    return trigger('growInOutX', [
        growInXTransition(params),
        growOutXTransition(params),
    ]);
}
