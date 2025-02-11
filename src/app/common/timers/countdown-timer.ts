import { Component, computed, input, signal } from '@angular/core';
import { CommonPipesModule } from '../pipes/pipes.module';
import {
    TIMER_2_MIN_DRAMATIC,
    TIMER_2_MIN_FUN,
    TIMER_30_SEC_DRAMATIC,
    TimerAudioDefinition,
    TimerLength,
} from './definitions';

@Component({
    selector: 'countdown-timer',
    imports: [CommonPipesModule],
    templateUrl: './countdown-timer.html',
    styleUrl: './countdown-timer.scss',
})
export class CountdownTimer {
    /** The length of the timer. */
    public length = input.required<TimerLength>();

    /** True if the audio used should be the "dramatic" variant. */
    public dramatic = input<boolean>(true);

    /** The current point in time of the playing audio. */
    public currentTime = signal<number>(0);

    /** True if the audio is muted (even when playing). */
    public muted = input<boolean>(false);

    /** The definition object for the currently configured timer. */
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

    /**
     * The current time as displayed, relative to the currently playing audio,
     * scaled appropriately.
     *
     * @description
     * An audio track that, for example, represents a 30 second timer, may in
     * reality be 35 seconds long. Musically, the "start" of the countdown might
     * be a beat at the 2 second mark and the "end" a beat at the 34 second
     * mark. This means the timer would *actually* run for 32 seconds from a
     * music perspective, but that doesn't make sense visually, so we do a
     * Mario-Bros-style "adjustment" to the timer so that it displays "0:30" at
     * the 2 second mark of the track, and counts down proportionately until it
     * hits "0:00" at the 34-second mark.
     *
     * Is that unfair? Maybe, but it's way more satisfying to have it follow the
     * music (within reason) than it is to be exactly to the mark time-wise.
     */
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

    /**
     * Fired when the template `<audio>` element updates its time - sets the
     * currentTime signal here.
     */
    public onTimeUpdate(event: Event): void {
        if (event.target instanceof HTMLAudioElement) {
            const audio = event.target;
            this.currentTime.set(audio.currentTime);
        }
    }
}
