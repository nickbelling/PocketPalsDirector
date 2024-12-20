import { animate, style, transition, trigger } from '@angular/animations';

export function fadeInOutAnimation(duration: number = 300) {
    const params = {
        duration: duration,
    };

    return trigger('fadeInOut', [
        transition(
            ':leave',
            [animate('{{duration}}ms ease-out', style({ opacity: 0 }))],
            { params: params },
        ),
        transition(
            ':enter',
            [
                style({ opacity: 0 }),
                animate('{{duration}}ms ease-in', style({ opacity: 1 })),
            ],
            { params: params },
        ),
    ]);
}
