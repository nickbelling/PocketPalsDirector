import { Component, computed, inject, signal } from '@angular/core';
import { v4 } from 'uuid';
import {
    hasAtLeast,
    isGreaterThanZero,
    isNotEmpty,
    isNotNull,
    isNotNullOrUndefined,
    resizeImage,
} from '../../common/utils';
import {
    BaseQuestionEditDialog,
    CommonControllerModule,
} from '../base/controller';
import { WhereInThisGameDatabase } from './database';
import { Map, MapPin } from './map';
import {
    WHERE_IN_THIS_GAME_BASE_PATH,
    WhereInThisGameQuestion,
    WhereInThisGameQuestionLocation,
} from './model';
import {
    fromGridRefString,
    gridRefStringIsValid,
    toGridRefString,
} from './utils';

interface WhereInThisGamePendingLocation {
    locationReference: number;
    name: string;
    image: File | null;
    imageId: string | null;
}

@Component({
    imports: [CommonControllerModule, Map],
    templateUrl: './question-edit.html',
    styleUrl: './question-edit.scss',
})
export class WhereInThisGameQuestionEditDialog extends BaseQuestionEditDialog<WhereInThisGameQuestion> {
    private _db: WhereInThisGameDatabase;

    protected readonly baseUrl = `${WHERE_IN_THIS_GAME_BASE_PATH}/`;

    protected readonly gameId = signal<string>('');
    protected readonly columns = signal<number>(10);
    protected readonly rows = signal<number>(10);
    protected readonly mapImageId = signal<string | null>(null);
    protected readonly mapImageFile = signal<File | null>(null);
    protected readonly locations = signal<WhereInThisGamePendingLocation[]>([]);

    protected readonly locationName = signal<string>('');
    protected readonly locationReference = signal<number>(0);
    protected readonly locationImage = signal<File | null>(null);

    protected readonly isValid = computed(
        () => this.baseIsValid() && hasAtLeast(1, this.locations),
    );

    protected readonly baseIsValid = computed(
        () =>
            isNotNullOrUndefined(this.gameId) &&
            (isNotNull(this.mapImageId) || isNotNull(this.mapImageFile)) &&
            isGreaterThanZero(this.columns) &&
            isGreaterThanZero(this.rows),
    );

    protected readonly locationIsValid = computed(
        () =>
            isNotEmpty(this.locationName) &&
            isGreaterThanZero(this.locationReference) &&
            isNotNullOrUndefined(this.locationImage),
    );

    protected readonly mapPins = computed(() => {
        const locations = this.locations().map((l) => {
            return {
                gridReference: l.locationReference,
                color: 'gold',
                label: '',
            } satisfies MapPin;
        });

        if (this.locationReference() !== 0) {
            locations.push({
                gridReference: this.locationReference(),
                color: 'gold',
                label: '',
            });
        }

        return locations;
    });

    protected readonly fromGridRef = fromGridRefString;
    protected readonly toGridRef = toGridRefString;
    protected readonly gridRefIsValid = gridRefStringIsValid;

    constructor() {
        const db = inject(WhereInThisGameDatabase);
        super(db);
        this._db = db;

        if (this.editing) {
            this.gameId.set(this.question?.gameId || '');
            this.rows.set(this.question?.rows || 10);
            this.columns.set(this.question?.columns || 10);
            this.mapImageId.set(this.question?.mapImageId || null);
            this.locations.set(
                (this.question?.locations ?? []).map((l) => ({
                    name: l.name,
                    locationReference: l.locationReference,
                    imageId: l.locationImageId,
                    image: null,
                })),
            );
        }
    }

    public addLocation(): void {
        if (this.locationIsValid()) {
            this.locations.update((existing) => {
                return [
                    ...existing,
                    {
                        name: this.locationName(),
                        locationReference: this.locationReference(),
                        image: this.locationImage(),
                        imageId: null,
                    },
                ];
            });

            this.locationName.set('');
            this.locationReference.set(0);
            this.locationImage.set(null);
        }
    }

    public deleteLocation(index: number): void {
        this.locations.update((existing) => {
            const item = existing[index];
            return existing.filter((location) => location !== item);
        });
    }

    public async submit(): Promise<void> {
        this.loading.set(true);

        try {
            const pendingLocations = this.locations();
            const locations: WhereInThisGameQuestionLocation[] = [];

            this.progress.start(pendingLocations.length + 2);

            const mapImageFile = this.mapImageFile();
            if (mapImageFile) {
                this.progress.increment(`Uploading map image...`);
                const resized = await resizeImage(
                    mapImageFile,
                    1080,
                    1080,
                    true,
                );
                const imageId = v4();
                await this.uploadFile(resized, imageId);
                this.mapImageId.set(imageId);
            } else {
                this.progress.increment('Skipping map image upload.');
            }

            // Upload images
            for (let i = 0; i < pendingLocations.length; i++) {
                const location = pendingLocations[i];

                if (location.image !== null) {
                    // Newly added image, has image file
                    this.progress.increment(`Uploading image ${i + 1}...`);
                    const resized = await resizeImage(
                        location.image,
                        500,
                        500,
                        true,
                    );
                    const imageId = v4();
                    await this.uploadFile(resized, imageId);
                    location.imageId = imageId;
                } else {
                    // else existing image, nothing to upload
                    this.progress.increment(
                        `Skipping upload for image ${i + 1}.`,
                    );
                }

                locations.push({
                    name: isNotEmpty(location.name)
                        ? location.name
                        : `Location ${i + 1}`,
                    locationReference: location.locationReference,
                    locationImageId: location.imageId!,
                });
            }

            const question: WhereInThisGameQuestion = {
                gameId: this.gameId(),
                mapImageId: this.mapImageId()!,
                columns: this.columns(),
                rows: this.rows(),
                locations,
            };

            if (this.editing) {
                this.progress.increment('Editing question...');
                await this.editQuestion(question);
            } else {
                this.progress.increment('Adding question...');
                await this.addQuestion(question);
            }
            this.dialog.close();
        } finally {
            this.loading.set(false);
        }
    }
}
