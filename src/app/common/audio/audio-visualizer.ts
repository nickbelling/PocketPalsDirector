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
    public readonly playing = signal<boolean>(false);
    public readonly frequencies = signal<number[]>([]);

    public readonly bars = computed(() => {
        // Typically 0..255. You can choose another range or transformation logic.
        const rawFrequencies = this.frequencies();
        return rawFrequencies.map((value) => {
            // A simple "log-ish" formula. Tweak as desired.
            // E.g. scale from 0..255 into 0..1, then apply log10, then scale 0..100
            const fraction = value / 255; // 0..1
            const scaled = Math.log10(1 + 9 * fraction); // ~0..1
            return scaled * 100; // 0..100
        });
    });

    constructor() {
        this._audio.onplay = () => {
            this.playing.set(true);
        };

        this._audio.onended = () => {
            this.playing.set(false);
            this.frequencies.set([]);
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
