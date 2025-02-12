import { Component, computed, input } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ProgressMonitor } from './progress-monitor';

/** A component for visualizing a {@link ProgressMonitor}. */
@Component({
    selector: 'progress-indicator',
    imports: [MatFormFieldModule, MatProgressBarModule],
    templateUrl: './progress-indicator.html',
})
export class ProgressIndicator {
    /** The ProgressMonitor this indicator is using. */
    public readonly monitor = input.required<ProgressMonitor>();

    protected progress = computed(() => this.monitor().progress());
    protected description = computed(() => this.monitor().description());
    protected isWorking = computed(() => this.monitor().isWorking());
}
