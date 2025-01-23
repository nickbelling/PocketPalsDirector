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
import { GameDefinition } from '../../games/games';
import { GlobalDataStore, GlobalState } from '../global-data-store';

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
    private _activeGames = this._globalData.activeGames;
    private _inactiveGames = this._globalData.inactiveGames;

    public loading = signal<boolean>(false);

    public readonly activeGames = linkedSignal(() => {
        return this._activeGames();
    });

    public readonly inactiveGames = linkedSignal(() => {
        return this._inactiveGames();
    });

    public async drop(
        event: CdkDragDrop<WritableSignal<GameDefinition[]>>,
    ): Promise<void> {
        if (event.previousContainer === event.container) {
            const droppedArraySignal = event.container.data;
            const droppedArray = [...droppedArraySignal()];
            moveItemInArray(
                droppedArray,
                event.previousIndex,
                event.currentIndex,
            );
            droppedArraySignal.set(droppedArray);
        } else {
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

        const state: GlobalState = {
            activeGames: this.activeGames().map((g) => g.slug),
            inactiveGames: this.inactiveGames().map((g) => g.slug),
        };

        console.log(state);

        this.loading.set(true);
        try {
            await this._globalData.setState(state);
        } finally {
            this.loading.set(false);
        }
    }
}
