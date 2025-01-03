import {
    Component,
    computed,
    DestroyRef,
    ElementRef,
    inject,
    signal,
    viewChild,
} from '@angular/core';
import { BaseGame, CommonGameModule } from '../base/game';
import { ScreenshotInTheDarkDatabase } from './database';
import { ScreenshotInTheDarkQuestion, ScreenshotInTheDarkState } from './model';

/**
 * Mapping of the points in time of the audio track where the template should
 * transition to showing the next screenshot. 0 is the title, 1 is screenshot 1,
 * 2 is screenshot 2, etc. Since the game has 6 screenshots per question, "7" is
 * the "answer".
 */
const TIMESTAMPS: Record<number, number> = {
    // < 1: showing "title"
    1: 1.5,
    2: 11.5,
    3: 21.5,
    4: 31.5,
    5: 41.5,
    6: 51.5,
    // >= 7: showing "answer"
    7: 61.5,
};

@Component({
    imports: [CommonGameModule],
    templateUrl: './game.html',
    styleUrl: './game.scss',
    host: { class: 'pocket-pals-game size-1920x1080' },
})
export class ScreenshotInTheDarkGame extends BaseGame<
    ScreenshotInTheDarkState,
    ScreenshotInTheDarkQuestion
> {
    private _destroyRef = inject(DestroyRef);
    private _audioElement = viewChild<ElementRef<HTMLAudioElement>>('audio');
    private _animationFrameId: number | null = null;

    protected data: ScreenshotInTheDarkDatabase;

    public readonly currentTime = signal<number>(0);
    public readonly currentScreenshot = computed<number>(() => {
        const currentTime = this.currentTime();
        let bestMatch = 0;

        for (const [key, timestamp] of Object.entries(TIMESTAMPS)) {
            if (timestamp <= currentTime) {
                bestMatch = +key;
            } else {
                break;
            }
        }

        return bestMatch;
    });

    public readonly screenshotProgress = computed<number>(() => {
        const time = this.currentTime();
        const currentId = this.currentScreenshot();
        const currentTimestamp = TIMESTAMPS[currentId] ?? 0;
        const nextTimestamp = TIMESTAMPS[currentId + 1] ?? currentTimestamp;

        if (currentId === 0) {
            // Don't animate anything until the first screenshot is showing
            return 0;
        }

        if (currentTimestamp === nextTimestamp) {
            // If there's no next screenshot, the countdown is complete
            return 0;
        }

        // Calculate the percentage of progress
        const elapsed = time - currentTimestamp;
        const interval = nextTimestamp - currentTimestamp;

        return Math.min(100, Math.max(0, (elapsed / interval) * 100));
    });

    constructor() {
        const database = inject(ScreenshotInTheDarkDatabase);
        super(database);
        this.data = database;

        this._destroyRef.onDestroy(() => {
            this._stopAnimation();
        });
    }

    public onPlay(): void {
        this._startAnimation();
    }

    public onPause(): void {
        this._stopAnimation();
    }

    public onSeek(): void {
        this._setCurrentTime();
    }

    private _setCurrentTime(): void {
        const audioEl = this._audioElement()?.nativeElement;

        if (audioEl) {
            const currentTime = audioEl.currentTime;
            this.currentTime.set(currentTime);
        }
    }

    private _startAnimation(): void {
        const animate = () => {
            this._setCurrentTime();
            this._animationFrameId = requestAnimationFrame(animate);
        };

        this._animationFrameId = requestAnimationFrame(animate);
    }

    private _stopAnimation(): void {
        if (this._animationFrameId !== null) {
            cancelAnimationFrame(this._animationFrameId);
            this._animationFrameId = null;
        }
    }
}
