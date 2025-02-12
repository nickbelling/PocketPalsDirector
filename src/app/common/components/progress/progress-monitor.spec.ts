import { ProgressMonitor } from './progress-monitor';

describe('ProgressMonitor', () => {
    let monitor: ProgressMonitor;

    beforeEach(() => {
        monitor = new ProgressMonitor();
    });

    describe('initial state', () => {
        it('should not be working, have no description, and progress is 0', () => {
            expect(monitor.isWorking()).toBe(false);
            expect(monitor.description()).toBe('');
            // Since no process is started, totalSteps is 0 and (0/0)*100 is NaN.
            expect(monitor.progress()).toBe(0);
        });
    });

    describe('start()', () => {
        it('should initialize progress with the given total steps', () => {
            monitor.start(5);
            // start() sets totalSteps to (5 + 1) = 6 and resets the current step to 0.
            expect(monitor.isWorking()).toBe(true);
            expect(monitor.progress()).toBe(0); // 0/6 * 100 === 0
            expect(monitor.description()).toBe(''); // current step is 0 so default description is ''
        });
    });

    describe('set()', () => {
        beforeEach(() => {
            monitor.start(5); // totalSteps becomes 6
        });

        it('should update the current step and keep the default description when no description is provided', () => {
            monitor.set(3);
            // currentStep is now 3 and totalSteps remains 6 (since 3 < 6).
            expect(monitor.progress()).toBeCloseTo((3 / 6) * 100);
            // Linked signal computes "Working..." when step > 0 and not equal to totalSteps.
            expect(monitor.description()).toBe('Working...');
        });

        it('should update total steps when the provided step is >= the current total', () => {
            // With start(5), totalSteps is 6. Calling set(6) means 6 >= 6, so totalSteps becomes 6 + 1 = 7.
            monitor.set(6);
            expect(monitor.progress()).toBeCloseTo((6 / 7) * 100);
            // Even though the step was updated, the default computed description is used.
            expect(monitor.description()).toBe('Working...');
        });

        it('should update the description when provided', () => {
            monitor.set(3, 'Step 3 in progress');
            expect(monitor.progress()).toBeCloseTo((3 / 6) * 100);
            expect(monitor.description()).toBe('Step 3 in progress');
        });
    });

    describe('increment()', () => {
        beforeEach(() => {
            monitor.start(5); // totalSteps becomes 6, currentStep is 0
        });

        it('should increment the current step by one with the default description', () => {
            monitor.increment();
            // currentStep goes from 0 to 1.
            expect(monitor.progress()).toBeCloseTo((1 / 6) * 100);
            expect(monitor.description()).toBe('Working...');
        });

        it('should update the description when a description is provided', () => {
            monitor.increment('Incremented step');
            expect(monitor.progress()).toBeCloseTo((1 / 6) * 100);
            expect(monitor.description()).toBe('Incremented step');
        });
    });

    describe('finish()', () => {
        beforeEach(() => {
            monitor.start(5); // totalSteps = 6, currentStep = 0
            monitor.set(3); // currentStep becomes 3
        });

        it('should set the current step to equal the total steps and update the description', () => {
            monitor.finish();
            // finish() sets currentStep to totalSteps.
            expect(monitor.progress()).toBe(100);
            // Since no manual override is provided (or if the manual
            // description is cleared when dependencies change), the
            // linkedSignal computed function returns "Done." when
            // currentStep === totalSteps.
            expect(monitor.description()).toBe('Done.');
        });

        it('should override a previously manually set description when dependencies change', () => {
            monitor.start(5);
            monitor.set(3, 'Halfway');
            // At this point, description is "Halfway".
            expect(monitor.description()).toBe('Halfway');
            monitor.finish();
            // Changing the current step (via finish) is a dependency change,
            // so the computed function runs and now returns "Done.".
            expect(monitor.description()).toBe('Done.');
        });
    });

    describe('reset()', () => {
        beforeEach(() => {
            monitor.start(5);
            monitor.set(3, 'In progress');
        });

        it('should clear the progress', () => {
            monitor.reset();
            // reset() sets both currentStep and totalSteps back to 0.
            expect(monitor.isWorking()).toBe(false);
            expect(monitor.description()).toBe('');
            expect(monitor.progress()).toBe(0);
        });
    });
});
