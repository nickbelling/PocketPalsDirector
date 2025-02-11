export type TimerLength = 30 | 120;

export interface TimerAudioDefinition {
    /** The audio file to play. */
    srcFile: string;

    /**
     * The duration of the timer, which may be slightly scaled, based on the
     * {@link startTimestamp} and {@link endTimestamp}.
     */
    durationSeconds: number;

    /** The point in time in the audio file where the timer should start. */
    startTimestamp: number;

    /** The point in time in the audio file where the timer should hit 0. */
    endTimestamp: number;
}

// These audio files currently live in /public, and are static. They could be
// dynamic in future (i.e. uploaded to Firebase Storage).

export const TIMER_30_SEC_DRAMATIC: TimerAudioDefinition = {
    srcFile: 'audio/timer_30sec.webm',
    durationSeconds: 30,
    startTimestamp: 1,
    endTimestamp: 33,
};

export const TIMER_2_MIN_DRAMATIC: TimerAudioDefinition = {
    srcFile: 'audio/timer_2min.webm',
    durationSeconds: 120,
    startTimestamp: 1,
    endTimestamp: 129,
};

export const TIMER_2_MIN_FUN: TimerAudioDefinition = {
    srcFile: 'audio/timer_2min_fun.webm',
    durationSeconds: 120,
    startTimestamp: 1,
    endTimestamp: 116,
};
