// progress-indicator.spec.ts
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { render, screen } from '@testing-library/angular';
import { ProgressIndicator } from './progress-indicator';
import { ProgressMonitor } from './progress-monitor';

describe('ProgressIndicator', () => {
    const imports = [MatFormFieldModule, MatProgressBarModule];

    it('should display a determinate progress bar and empty hint when monitor is not working', async () => {
        // initial monitor: not started (totalSteps = 0)
        const monitor = new ProgressMonitor();

        await render(ProgressIndicator, {
            inputs: { monitor: monitor },
            imports,
        });

        // Query the progress bar via its element.
        // Angular Material adds debug attributes like "ng-reflect-mode".
        const progressBar = screen.getByRole('progressbar');
        // When the monitor is not working, the computed isWorking() is false,
        // so the mode is "determinate".
        expect(progressBar.getAttribute('ng-reflect-mode')).toBe('determinate');

        // The hint should be empty.
        const hint = screen.getByText('', { selector: 'mat-hint' });
        expect(hint).toBeTruthy();
    });

    it('should display a buffer progress bar when the monitor is working', async () => {
        const monitor = new ProgressMonitor();
        // totalSteps becomes 11; currentStep is 0 so isWorking() returns true
        monitor.start(10);

        await render(ProgressIndicator, {
            inputs: { monitor: monitor },
            imports,
        });

        const progressBar = screen.getByRole('progressbar');
        // With working progress, the mode should be "buffer".
        expect(progressBar.getAttribute('ng-reflect-mode')).toBe('buffer');
        // Initially the progress is 0.
        expect(progressBar.getAttribute('ng-reflect-value')).toBe('0');

        // The hint remains empty when no description is provided.
        const hint = screen.getByText('', { selector: 'mat-hint' });
        expect(hint).toBeTruthy();
    });

    it('should update the progress bar value and hint when the monitor updates', async () => {
        const monitor = new ProgressMonitor();
        // totalSteps becomes 11
        monitor.start(10);

        const { fixture } = await render(ProgressIndicator, {
            inputs: { monitor: monitor },
            imports,
        });

        // Initially, the progress value is 0.
        let progressBar = screen.getByRole('progressbar');
        expect(progressBar.getAttribute('ng-reflect-value')).toBe('0');

        // Update the monitor: set step 5 with a custom description.
        monitor.set(5, 'Halfway there');

        await fixture.whenStable();

        // Expected progress is (5/11) * 100.
        const expectedProgress = (5 / 11) * 100;
        progressBar = screen.getByRole('progressbar');
        expect(
            parseFloat(progressBar.getAttribute('ng-reflect-value')!),
        ).toBeCloseTo(expectedProgress);

        // The hint should now show the provided description.
        const hint = screen.getByText('Halfway there', {
            selector: 'mat-hint',
        });
        expect(hint).toBeTruthy();

        // Now finish the process: finish() sets the current step to totalSteps,
        // so progress becomes 100.
        monitor.finish();

        await fixture.whenStable();

        progressBar = screen.getByRole('progressbar');
        expect(parseFloat(progressBar.getAttribute('ng-reflect-value')!)).toBe(
            100,
        );

        // When finished, the default computed description becomes "Done.".
        const doneHint = screen.getByText('Done.', { selector: 'mat-hint' });
        expect(doneHint).toBeTruthy();
    });

    it('should change the progress bar mode to determinate when the monitor is reset', async () => {
        const monitor = new ProgressMonitor();
        monitor.start(10);

        const { fixture } = await render(ProgressIndicator, {
            inputs: { monitor: monitor },
            imports,
        });

        let progressBar = screen.getByRole('progressbar');
        // While the monitor is active, mode is "buffer".
        expect(progressBar.getAttribute('ng-reflect-mode')).toBe('buffer');

        // Reset the monitor.
        monitor.reset();

        await fixture.whenStable();

        progressBar = screen.getByRole('progressbar');
        // After reset, isWorking() returns false so mode becomes "determinate".
        expect(progressBar.getAttribute('ng-reflect-mode')).toBe('determinate');
    });
});
