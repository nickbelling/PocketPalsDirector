import { computed, linkedSignal, signal } from '@angular/core';

/**
 * Used to monitor long-running processes and report their progress.
 *
 * Display using a `<progress-indicator>`.
 * */
export class ProgressMonitor {
    private _totalSteps = signal<number>(0);
    private _currentStep = signal<number>(0);
    private _description = linkedSignal<string>(() => {
        const step = this._currentStep();
        const total = this._totalSteps();

        // Output some default text if a description isn't supplied
        if (step === 0) {
            return '';
        } else if (step === total) {
            return 'Done.';
        } else {
            return 'Working...';
        }
    });

    /** The progress as a percentage. */
    public readonly progress = computed(() => {
        const total = this._totalSteps();
        const step = this._currentStep();

        if (total === 0) {
            return 0;
        } else {
            return (step / total) * 100;
        }
    });

    /**
     * True if the process has started (i.e. the total number of steps are set).
     */
    public readonly isWorking = computed(() => this._totalSteps() !== 0);

    /** The currently displayed step's description. */
    public readonly description = computed(() => this._description());

    /** Starts progress and sets the total number of steps. */
    public start(totalSteps: number): void {
        this._totalSteps.set(totalSteps + 1);
        this._currentStep.set(0);
    }

    /**
     * Progresses to the provided step.
     * @param stepNumber The current step number.
     * @param description An optional description of the step.
     */
    public set(stepNumber: number, description?: string): void {
        this._currentStep.set(stepNumber);

        if (stepNumber >= this._totalSteps()) {
            this._totalSteps.set(stepNumber + 1);
        }

        if (description) {
            this._description.set(description);
        }
    }

    /**
     * Progresses to the next step.
     * @param description An optional description of the next step.
     */
    public increment(description?: string): void {
        const step = this._currentStep();
        this.set(step + 1, description);
    }

    /** Finishes the process. */
    public finish(): void {
        this._currentStep.set(this._totalSteps());
    }

    /** Resets the process. */
    public reset(): void {
        this._currentStep.set(0);
        this._totalSteps.set(0);
    }
}
