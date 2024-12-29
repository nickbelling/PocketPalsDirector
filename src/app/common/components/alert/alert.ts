import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type AlertType = 'error' | 'warning' | 'info';

/**
 * A component that displays an alert box at a given level.
 */
@Component({
    selector: 'alert',
    imports: [MatIconModule],
    templateUrl: './alert.html',
    styleUrl: './alert.scss',
})
export class Alert {
    /** The type of alert this is (info/warning/error). */
    public readonly type = input<AlertType>('info');

    /** An optional title to display as a 'heading' for the alert. */
    public readonly title = input<string | undefined>(undefined);
}
