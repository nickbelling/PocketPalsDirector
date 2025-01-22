import {
    Component,
    computed,
    DestroyRef,
    effect,
    ElementRef,
    inject,
    signal,
    viewChild,
} from '@angular/core';
import { fadeInOutAnimation } from '../../common/animations';
import { ImageService, SoundService, VideoService } from '../../common/files';
import { Entity } from '../../common/firestore';
import { BaseGame, CommonGameModule } from '../base/game';
import { ScreenshotInTheDarkDatabase } from './database';
import {
    SCREENSHOT_IN_THE_DARK_BASE_PATH,
    ScreenshotInTheDarkQuestion,
    ScreenshotInTheDarkState,
} from './model';

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

interface Resources {
    src1: string;
    src2: string;
    src3: string;
    src4: string;
    src5: string;
    src6: string;
}

@Component({
    imports: [CommonGameModule],
    templateUrl: './game.html',
    styleUrl: './game.scss',
    animations: [fadeInOutAnimation()],
    host: { class: 'pocket-pals-game' },
})
export class ScreenshotInTheDarkGame extends BaseGame<
    ScreenshotInTheDarkState,
    ScreenshotInTheDarkQuestion
> {
    private _destroyRef = inject(DestroyRef);
    private _images = inject(ImageService);
    private _videos = inject(VideoService);
    private _sounds = inject(SoundService);
    private _audioElement = viewChild<ElementRef<HTMLAudioElement>>('audio');
    private _animationFrameId: number | null = null;

    protected data: ScreenshotInTheDarkDatabase;
    protected resources = signal<Resources | null>(null);
    protected gameId = signal<string | null>(null);
    protected currentTime = signal<number>(0);
    protected muted = computed(() => !this._sounds.soundEnabled());

    protected currentScreenshot = computed<number>(() => {
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

    protected screenshotProgress = computed<number>(() => {
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

        effect(async () => {
            const currentQuestion = this.currentQuestion();
            const audioEl = this._audioElement()?.nativeElement;

            // Question changed
            this.currentTime.set(0);
            this.resources.set(null);

            if (currentQuestion && audioEl) {
                audioEl.pause();
                audioEl.currentTime = 0;

                // Preload this question's resources, and don't display them
                // until they have all been preloaded
                const resources = await this._preloadResources(currentQuestion);

                // Everything is loaded, now set the resources/gameId. By this
                // point everything should be reset and hidden behind the title
                // card.
                this.resources.set(resources);
                this.gameId.set(currentQuestion.gameId);
            }
        });

        effect(() => {
            const state = this.state();
            const audioEl = this._audioElement()?.nativeElement;

            if (audioEl) {
                if (state.isPlaying) {
                    audioEl.play();
                } else {
                    audioEl.pause();
                }

                if (state.isShowingAnswer) {
                    audioEl.currentTime = 65.0;
                }
            }
        });

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

    private async _preloadResources(
        question: Entity<ScreenshotInTheDarkQuestion>,
    ): Promise<Resources> {
        const url = `${SCREENSHOT_IN_THE_DARK_BASE_PATH}/${question.guessTheGameId}_`;

        const resourcePromises = {
            src1: this._images.preloadStorageImage(url + 1),
            src2: this._images.preloadStorageImage(url + 2),
            src3: this._images.preloadStorageImage(url + 3),
            src4: this._images.preloadStorageImage(url + 4),
            src5: this._images.preloadStorageImage(url + 5),
            src6: question?.finalIsVideo
                ? this._videos.preloadStorageVideo(url + 6)
                : this._images.preloadStorageImage(url + 6),
        };

        const resourcesEntries = await Promise.all(
            Object.entries(resourcePromises).map(async ([key, promise]) => [
                key,
                await promise,
            ]),
        );

        const resources = Object.fromEntries(resourcesEntries) as Resources;

        return resources;
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
