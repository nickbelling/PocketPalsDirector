import { CommonModule } from '@angular/common';
import {
    Component,
    computed,
    Directive,
    effect,
    inject,
    input,
    model,
    signal,
} from '@angular/core';
import {
    AbstractControl,
    FormsModule,
    NG_VALIDATORS,
    ValidationErrors,
    Validator,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Entity } from '../firestore';
import {
    VideogameDatabaseItem,
    VideogameDatabaseService,
} from './videogame-database-service';

@Directive({
    selector: '[gameSelectionValidator]',
    providers: [
        {
            provide: NG_VALIDATORS,
            useExisting: GameSelectionValidator,
            multi: true,
        },
    ],
})
export class GameSelectionValidator implements Validator {
    public validate(control: AbstractControl): ValidationErrors | null {
        if (typeof control.value === 'string') {
            // Control is filled with text, but an object hasn't been selected
            return { invalidSelection: true };
        } else {
            // Valid
            return null;
        }
    }
}

@Component({
    selector: 'game-selector',
    imports: [
        CommonModule,
        FormsModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        GameSelectionValidator,
    ],
    templateUrl: './game-selector.html',
    styleUrl: './game-selector.scss',
})
export class GameSelector {
    private _vgDb = inject(VideogameDatabaseService);

    public readonly gameId = model<string | null>();
    public readonly disabled = input<boolean>(false);

    protected readonly games = this._vgDb.games;
    protected selectedGame = signal<
        string | null | Entity<VideogameDatabaseItem>
    >(null);
    protected filteredGames = computed(() => {
        const selectedGame = this.selectedGame();

        if (selectedGame === null) {
            return this.games();
        }

        const filterText =
            typeof selectedGame === 'string' ? selectedGame : selectedGame.name;
        return this.games().filter((g) =>
            g.name.toLowerCase().includes(filterText.toLowerCase()),
        );
    });

    constructor() {
        // When selectedGame is set to a game, output the game ID to the
        // gameId model signal
        effect(() => {
            const selectedGame = this.selectedGame();

            if (selectedGame !== null && typeof selectedGame !== 'string') {
                this.gameId.set(selectedGame.id);
            } else {
                this.gameId.set(null);
            }
        });

        // When gameId is set (i.e. as model input) set the selected game
        effect(() => {
            const gameId = this.gameId();

            if (gameId) {
                const game = this.games().find((g) => g.id === gameId);

                if (game) {
                    this.selectedGame.set(game);
                } else {
                    this.selectedGame.set(null);
                }
            } else {
                this.selectedGame.set(null);
            }
        });
    }

    public displayFn(game: VideogameDatabaseItem): string {
        if (game) {
            return game.name;
        } else {
            return '';
        }
    }
}
