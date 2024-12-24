import { Component, computed, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { BuzzerDisplayDataStore } from '../data/display-data';

@Component({
    selector: 'buzzer-display',
    imports: [MatCardModule],
    templateUrl: './buzzer-display.html',
})
export class BuzzerDisplay {
    private _data = inject(BuzzerDisplayDataStore);

    protected players = this._data.players;

    protected buzzedInPlayers = computed(() => {
        const players = this.players();
        return players
            .filter((p) => p.buzzTimestamp !== null)
            .sort(
                (a, b) =>
                    a.buzzTimestamp!.toMillis() - b.buzzTimestamp!.toMillis(),
            );
    });
}
