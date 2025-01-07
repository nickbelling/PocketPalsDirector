import {
    Component,
    computed,
    DestroyRef,
    effect,
    inject,
    input,
    signal,
} from '@angular/core';

@Component({
    selector: 'player-warning-timer',
    templateUrl: './player-warning-timer.html',
    styleUrl: './player-warning-timer.scss',
})
export class PlayerWarningTimer {
    public readonly duration = input.required<number>();
    public readonly currentTime = signal(0);
    private _animationFrameId: number | null = null;
    private _countdownTick = new Audio('audio/1sec_timer_loop.webm');

    public numbers = computed<number[]>(() =>
        Array.from(
            { length: this.duration() + 1 },
            (_, i) => this.duration() - i,
        ),
    );

    public rotationDeg = computed<string>(() => {
        const elapsed = this.currentTime();
        const totalDuration = this.duration();
        const rotation = (elapsed / totalDuration) * 360;
        return `${rotation}deg`;
    });

    constructor() {
        this._countdownTick.loop = true;

        effect(() => {
            const totalDuration = this.duration();
            if (totalDuration > 0) {
                this.startTimer(totalDuration);
            }
        });

        const destroyRef = inject(DestroyRef);

        destroyRef.onDestroy(() => {
            this._countdownTick.pause();
            if (this._animationFrameId) {
                cancelAnimationFrame(this._animationFrameId);
            }
        });
    }

    private startTimer(duration: number): void {
        const startTime = performance.now();
        let elapsedTime = 0;

        this._countdownTick.play();

        const animate = (currentTime: number) => {
            elapsedTime = (currentTime - startTime) / 1000; // Elapsed time in seconds

            if (elapsedTime < duration) {
                this.currentTime.set(elapsedTime);
                this._animationFrameId = requestAnimationFrame(animate);
            } else {
                this.currentTime.set(duration);
                cancelAnimationFrame(this._animationFrameId!);
                this._countdownTick.pause();
            }

            // Fixes a bug where the countdown tick
            if (
                this._countdownTick.currentTime >
                this._countdownTick.duration - 0.1
            ) {
                this._countdownTick.currentTime = 0;
            }
        };

        this._animationFrameId = requestAnimationFrame(animate);
    }
}
