import { Component, computed, input, signal } from '@angular/core';
import { CommonPipesModule } from '../pipes/pipes.module';

interface TimerAudioDefinition {
    srcFile: string;
    durationSeconds: number;
    startTimestamp: number;
    endTimestamp: number;
}

const TIMER_30_SEC_DRAMATIC: TimerAudioDefinition = {
    srcFile: 'audio/timer_30sec.webm',
    durationSeconds: 30,
    startTimestamp: 1,
    endTimestamp: 33,
};

const TIMER_2_MIN_DRAMATIC: TimerAudioDefinition = {
    srcFile: 'audio/timer_2min.webm',
    durationSeconds: 120,
    startTimestamp: 1,
    endTimestamp: 129,
};

const TIMER_2_MIN_FUN: TimerAudioDefinition = {
    srcFile: 'audio/timer_2min_fun.webm',
    durationSeconds: 120,
    startTimestamp: 1,
    endTimestamp: 116,
};

export type TimerLength = 30 | 120;

@Component({
    selector: 'countdown-timer',
    imports: [CommonPipesModule],
    templateUrl: './countdown-timer.html',
    styleUrl: './countdown-timer.scss',
})
export class CountdownTimer {
    public length = input.required<TimerLength>();
    public dramatic = input<boolean>(true);
    public currentTime = signal<number>(0);
    public muted = input<boolean>(false);

    public timerDefinition = computed<TimerAudioDefinition>(() => {
        const length = this.length();
        const dramatic = this.dramatic();
        if (length === 30) {
            return TIMER_30_SEC_DRAMATIC;
        } else if (length === 120) {
            if (dramatic) {
                return TIMER_2_MIN_DRAMATIC;
            } else {
                return TIMER_2_MIN_FUN;
            }
        } else {
            throw new Error('Unsupported time.');
        }
    });

    public displayTime = computed(() => {
        const timerDef = this.timerDefinition();
        const currentTime = this.currentTime();

        // Ensure currentTime is within the valid range of startTimestamp and endTimestamp
        const clampedTime = Math.max(
            timerDef.startTimestamp,
            Math.min(timerDef.endTimestamp, currentTime),
        );

        // Map clampedTime from [startTimestamp, endTimestamp] to [durationSeconds, 0]
        const progress =
            (clampedTime - timerDef.startTimestamp) /
            (timerDef.endTimestamp - timerDef.startTimestamp);
        const countdownTime = Math.round(
            timerDef.durationSeconds * (1 - progress),
        );

        return countdownTime;
    });

    public onTimeUpdate(event: Event): void {
        if (event.target instanceof HTMLAudioElement) {
            const audio = event.target;
            this.currentTime.set(audio.currentTime);
        }
    }
}
