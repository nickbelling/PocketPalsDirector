import {
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    effect,
    ElementRef,
    inject,
    input,
    output,
    signal,
    viewChild,
} from '@angular/core';

/**
 * A component that visualizes the provided audio source by displaying a series
 * of bars that animate to the frequency of the audio.
 *
 * Play the audio by calling this component's `play()` function, and stop it
 * with `stop()`.
 *
 * Because it plays sound, the page this element is being displayed on requires
 * interaction before the sound can play. OBS's Browser Source takes care of
 * pushing an interaction event to the page if being displayed in OBS.
 *
 * @description
 * This component works by analyzing the waveform of the currently playing audio,
 * and then producing an array of frequencies (see `frequencies` Signal). The
 * frequencies are then averaged to produce a set of bars (see `barCount`
 * Signal), where the value of each bar is a percentage (0-100). We use this
 * Signal to create an array of `<div class="bar">`s in the template, and set
 * their height percentage to the value of that bar.
 *
 * However instead of using that Signal as-is, we also create another Signal,
 * `barsCapped`, which caps the maximum height of some of the bars on either
 * end on a curve, to create a more visually-pleasing effect.
 *
 * Ordinarily this effect is achieved by drawing shapes on a canvas every frame,
 * but Angular's new Signals are *shockingly* performant, so rather than having
 * to write any Canvas drawing code we can do it all in the template's HTML/CSS,
 * and it still runs at an amazingly smooth 60fps with near-negligible CPU usage.
 */
@Component({
    selector: 'audio-visualizer',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './audio-visualizer.html',
    styleUrl: './audio-visualizer.scss',
})
export class AudioVisualizer {
    private _destroyRef = inject(DestroyRef);

    /**
     * The context of the playing audio. Used to connect the analyzer to the
     * source.
     */
    private _audioContext?: AudioContext;

    /** The analyzer currently monitoring the audio source for frequency data. */
    private _analyser?: AnalyserNode;

    /** The audio analyzer dumps frequency values into this array. */
    private _dataArray: Uint8Array = new Uint8Array();

    /** A reference to the animation frame request to enable cancelling. */
    private _animationId?: number;

    /** Reference to the template's <audio> element that is holding the src. */
    private _audio = viewChild<ElementRef<HTMLAudioElement>>('audio');

    /** The source URL to the audio source to visualize. */
    public readonly src = input.required<string>();

    /** The amount of bars to display. Defaults to 64. */
    public readonly barCount = input<number>(64);

    /** Set to true if the component should be muted. */
    public readonly muted = input<boolean>(false);

    /** True if this component is currently playing audio. */
    public readonly playing = signal<boolean>(false);

    /** Fired when the audio finishes playing. */
    public readonly ended = output<void>();

    /**
     * Set to true to display a button that allows you to stop/start the audio
     * by clicking it, rather than calling this component's `play()` method.
     */
    public readonly debugging = input<boolean>(false);

    /**
     * The audio frequencies for the current frame, as produced by the audio
     * analyser
     */
    public readonly frequencies = signal<number[]>([]);

    /**
     * Computed - the set of bars for display (as percentages), their heights
     * calculated by averaging the frequencies.
     */
    public readonly bars = computed(() => {
        const rawBars = this.frequencies();
        const barCount = this.barCount();
        const totalBins = rawBars.length;
        const chunkSize = Math.floor(totalBins / barCount);

        const barsOut: number[] = [];

        for (let i = 0; i < barCount; i++) {
            let sum = 0;
            for (let j = 0; j < chunkSize; j++) {
                const binIndex = i * chunkSize + j;
                sum += rawBars[binIndex];
            }

            const avg = sum / chunkSize; // average across that chunk
            barsOut.push(Math.log10(1 + 9 * (avg / 255)) * 100);
        }

        return barsOut;
    });

    /**
     * Visually, most of the bars will be "stacked" up one end, making the graph
     * look "unbalanced". This caps the first and last CAP_COUNT bars along a
     * parabolic curve, so the bars look more "grouped" along the middle.
     */
    public readonly barsCapped = computed(() => {
        // Get the original log-frequency bars
        const originalBars = this.bars();
        const cappedBars = [...originalBars];

        const n = cappedBars.length;
        const CAP_COUNT = 10;

        function capScale(index: number): number {
            const fraction = index / (CAP_COUNT - 1);
            // "ease out" polynomial fade:
            //   fraction=0 => 0 => scaled=0.1
            //   fraction=1 => 1 => scaled=1.0
            // (uses sqrt instead of squaring)
            const scaled = 0.1 + 0.9 * Math.sqrt(fraction);
            return scaled;
        }

        // Curve off first CAP_COUNT bars
        for (let i = 0; i < CAP_COUNT && i < n; i++) {
            cappedBars[i] *= capScale(i);
        }

        // Curve off last CAP_COUNT bars
        for (let i = 0; i < CAP_COUNT && i < n; i++) {
            const j = n - 1 - i;
            cappedBars[j] *= capScale(i);
        }

        return cappedBars;
    });

    /** @constructor */
    constructor() {
        effect(() => {
            if (this.playing()) {
                // Make sure we have an audioContext and analyser
                if (this._audioContext && this._analyser) {
                    this._startVisualizer();
                }
            } else {
                this._stopVisualizer();
            }
        });

        this._destroyRef.onDestroy(() => {
            this._stopVisualizer();
            this._audioContext?.close();
        });
    }

    /** Fired when the audio source starts playing. Sets the "playing" Signal. */
    protected onPlay(): void {
        this.playing.set(true);
    }

    /** Fired when the audio source pauses. Sets the "playing" Signal. */
    protected onPause(): void {
        this.playing.set(false);
    }

    /**
     * Fired when the audio source finishes playing the track. Emits the
     * relevant events.
     */
    protected onEnded(): void {
        this.ended.emit();
        this.playing.set(false);
        this._stopVisualizer();
        this.frequencies.set(Array(this.barCount()).fill(0));
    }

    /** Begins playing the audio loaded into the visualizer. */
    public play(): void {
        const audioElement = this._audio()!.nativeElement;

        // Create the audio context + analyser if it has not already been set up
        if (!this._audioContext) {
            this._audioContext = new AudioContext();
            this._analyser = this._audioContext.createAnalyser();

            const source =
                this._audioContext.createMediaElementSource(audioElement);

            source.connect(this._analyser);
            this._analyser.connect(this._audioContext.destination);

            this._analyser.fftSize = 512;

            // Prepare the dataArray based on the new analyser
            this._dataArray = new Uint8Array(this._analyser.frequencyBinCount);
        }

        // If context is suspended (common before user gesture), resume it
        if (this._audioContext.state === 'suspended') {
            this._audioContext.resume().catch((err) => {
                console.error('Failed to resume audio context', err);
            });
        }

        // Finally, play the internal <audio> element
        if (!this.playing() && this.src()) {
            audioElement.play();
        }
    }

    /** Stops (pauses) the currently playing audio. */
    public stop(): void {
        if (this.playing()) {
            this._audio()!.nativeElement.pause();
        }
    }

    /**
     * Begins monitoring the audio for frequency information used to update the
     * bars. Note this will continually loop animation frame requests until
     * stopped.
     */
    private _startVisualizer(): void {
        this._updateBars();
    }

    /**
     * Stops monitoring the audio for frequency information used to update the
     * bars, and cancels any pending animation loops.
     */
    private _stopVisualizer(): void {
        if (this._animationId !== undefined) {
            cancelAnimationFrame(this._animationId);
            this._animationId = undefined;
        }
    }

    /**
     * Updates the frequency Signal array with the current frequencies.
     */
    private _updateBars(): void {
        if (this._analyser) {
            this._analyser.getByteFrequencyData(this._dataArray);
            this.frequencies.set([...this._dataArray]);

            this._animationId = requestAnimationFrame(() => this._updateBars());
        }
    }
}
