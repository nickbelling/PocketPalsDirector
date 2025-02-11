import {
    CdkDragDrop,
    DragDropModule,
    moveItemInArray,
    transferArrayItem,
} from '@angular/cdk/drag-drop';
import {
    Component,
    inject,
    linkedSignal,
    signal,
    WritableSignal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ToastService } from '../../common/toast';
import { GameDefinition } from '../../games/games';
import { GlobalDataStore } from '../global-data-store';

/**
 * The director's home page. Allows setting games to be active or inactive,
 * and determine their order.
 */
@Component({
    imports: [
        RouterModule,
        DragDropModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
    ],
    templateUrl: './dashboard-home.html',
    styleUrl: './dashboard-home.scss',
})
export class DashboardHome {
    private _globalData = inject(GlobalDataStore);
    private _toast = inject(ToastService);
    private _activeGames = this._globalData.activeGames;
    private _inactiveGames = this._globalData.inactiveGames;

    /** True if data is loading. */
    public loading = signal<boolean>(false);

    /** The list of active games. */
    public readonly activeGames = linkedSignal(() => {
        return this._activeGames();
    });

    /** The list of inactive games. */
    public readonly inactiveGames = linkedSignal(() => {
        return this._inactiveGames();
    });

    /** Fired when a game is drag/dropped to a new position in either array. */
    public async drop(
        event: CdkDragDrop<WritableSignal<GameDefinition[]>>,
    ): Promise<void> {
        if (event.previousContainer === event.container) {
            // Reordered within the same array
            const droppedArraySignal = event.container.data;
            const droppedArray = [...droppedArraySignal()];
            moveItemInArray(
                droppedArray,
                event.previousIndex,
                event.currentIndex,
            );
            droppedArraySignal.set(droppedArray);
        } else {
            // Moved from active to inactive or vice versa
            const prevArraySignal = event.previousContainer.data;
            const droppedArraySignal = event.container.data;

            const prevArray = [...prevArraySignal()];
            const droppedArray = [...droppedArraySignal()];

            transferArrayItem(
                prevArray,
                droppedArray,
                event.previousIndex,
                event.currentIndex,
            );

            prevArraySignal.set(prevArray);
            droppedArraySignal.set(droppedArray);
        }

        // Update the global state with the new active/inactive games
        this.loading.set(true);
        try {
            await this._globalData.setState({
                activeGames: this.activeGames().map((g) => g.slug),
                inactiveGames: this.inactiveGames().map((g) => g.slug),
            });
        } catch (error) {
            this._toast.error('Failed to update game order.', error);
        } finally {
            this.loading.set(false);
        }
    }
}
