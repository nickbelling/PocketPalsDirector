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
    selector: 'audio-visualizer',
    templateUrl: './audio-visualizer.html',
    styleUrl: './audio-visualizer.scss',
})
export class AudioVisualizer {
    private _destroyRef = inject(DestroyRef);
    private _audio = new Audio();
    private _audioContext?: AudioContext;
    private _analyser?: AnalyserNode;
    private _animationId?: number;
    private _dataArray: Uint8Array = new Uint8Array();

    public readonly src = input.required<string>();
    public readonly barCount = input<number>(32);
    public readonly playing = signal<boolean>(false);
    public readonly frequencies = signal<number[]>([]);

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
            // Now apply a log or other scale to `avg` if you want
            barsOut.push(Math.log10(1 + 9 * (avg / 255)) * 100);
        }

        return barsOut;
    });

    public readonly barsCapped = computed(() => {
        // Get your original log-frequency bars
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

    constructor() {
        this._audio.onplay = () => {
            this.playing.set(true);
        };

        this._audio.onended = () => {
            this.playing.set(false);
            this._stopVisualizer();
            this.frequencies.set(Array(this.barCount()).fill(0));
        };

        this._audio.onpause = () => {
            this.playing.set(false);
        };

        effect(() => {
            const src = this.src();

            if (src) {
                this._audio.src = src;
                this._audio.load();
            }
        });

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

    public play(): void {
        // Only create the AudioContext + Analyser when the user explicitly clicks to play
        if (!this._audioContext) {
            this._audioContext = new AudioContext();
            this._analyser = this._audioContext.createAnalyser();

            const source = this._audioContext.createMediaElementSource(
                this._audio,
            );

            source.connect(this._analyser);
            this._analyser.connect(this._audioContext.destination);

            this._analyser.fftSize = 64;

            // Prepare the dataArray based on the new analyser
            this._dataArray = new Uint8Array(this._analyser.frequencyBinCount);
        }

        // If context is suspended (common before user gesture), resume it
        if (this._audioContext.state === 'suspended') {
            this._audioContext.resume().catch((err) => {
                console.error('Failed to resume audio context', err);
            });
        }

        if (!this.playing() && this.src()) {
            this._audio.play();
        }
    }

    public stop(): void {
        console.log('clicked stop');
        if (this.playing()) {
            this._audio.pause();
        }
    }

    private _startVisualizer(): void {
        this._updateBars();
    }

    private _updateBars(): void {
        if (!this._analyser) return;

        this._analyser.getByteFrequencyData(this._dataArray);
        this.frequencies.set([...this._dataArray]);

        this._animationId = requestAnimationFrame(() => this._updateBars());
    }

    private _stopVisualizer(): void {
        if (this._animationId !== undefined) {
            cancelAnimationFrame(this._animationId);
            this._animationId = undefined;
        }
    }
}
