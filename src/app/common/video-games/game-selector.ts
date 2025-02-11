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
import { filterByQuery } from '../utils';
import { VideogameNamePipe } from './game-name.pipe';
import {
    VideogameDatabaseItem,
    VideogameDatabaseService,
} from './videogame-database-service';

/**
 * A validator used to determine whether or not the autocomplete control's value
 * is a string (and therefore not a selected game object).
 */
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

/**
 * A component that wraps up an Angular Material Autocomplete form field control
 * with logic for selecting a game from the Videogame Database.
 */
@Component({
    selector: 'game-selector',
    imports: [
        CommonModule,
        FormsModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        GameSelectionValidator,
        VideogameNamePipe,
    ],
    templateUrl: './game-selector.html',
    styleUrl: './game-selector.scss',
})
export class GameSelector {
    private _vgDb = inject(VideogameDatabaseService);

    /** The selected game's ID. */
    public readonly gameId = model<string | null>();

    /** True if the control should be disabled. */
    public readonly disabled = input<boolean>(false);

    /** The list of games registered in the Videogame Database. */
    protected readonly games = this._vgDb.games;

    /** The currently selected game, or the typed filter text. */
    protected selectedGame = signal<
        string | null | Entity<VideogameDatabaseItem>
    >(null);

    /**
     * The list of filtered games that match the "selected game" string (if it
     * is a string).
     */
    protected filteredGames = computed(() => {
        const selectedGame = this.selectedGame();

        if (selectedGame === null) {
            return this.games();
        }

        const filterText =
            typeof selectedGame === 'string' ? selectedGame : selectedGame.name;

        return filterByQuery(this.games(), filterText, (game) => game.name);
    });

    constructor() {
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
    }

    /**
     * When the game is set in the Autocomplete control, formats its display
     * string.
     */
    public displayFn(game?: VideogameDatabaseItem): string {
        if (game) {
            if (game.year) {
                return `${game.name} (${game.year})`;
            }
            return game.name;
        } else {
            return '';
        }
    }
}
