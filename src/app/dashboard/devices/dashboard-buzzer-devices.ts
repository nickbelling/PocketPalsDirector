import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, inject } from '@angular/core';
import {
    BuzzerDevice,
    BuzzerDeviceHub,
    BuzzerDeviceService,
} from '../../buzzers/buzzer-devices';
import {
    BuzzerPlayer,
    BUZZERS_STORAGE_IMAGES_PATH,
} from '../../buzzers/data/model';
import { Player } from '../../common/components/player';
import { ConfirmDialog } from '../../common/dialog';
import { Entity } from '../../common/firestore';
import { ToastService } from '../../common/toast';
import { CommonControllerModule } from '../../games/base/controller';
import { BuzzerPlayerService } from './buzzer-player-service';

@Component({
    imports: [CommonControllerModule, Player],
    templateUrl: './dashboard-buzzer-devices.html',
    styleUrl: './dashboard-buzzer-devices.scss',
})
export class DashboardBuzzerDevices {
    private _toast = inject(ToastService);
    private _confirm = inject(ConfirmDialog);
    private _devices = inject(BuzzerDeviceService);
    private _service = inject(BuzzerPlayerService);

    protected imagesBasePath = BUZZERS_STORAGE_IMAGES_PATH;
    public canUseDevices = this._devices.canUseDevices;
    public hubs = this._devices.hubs;

    public devices = this._service.playerBuzzerMap;
    public unassignedPlayers = this._service.unassignedPlayers;

    public async connectHubs(): Promise<void> {
        return this._devices.connectHubs();
    }

    public async disconnectHub(hub: BuzzerDeviceHub): Promise<void> {
        this._confirm.open(
            'yesNo',
            'Disconnect and unpair hub',
            'Are you sure you want to disconnect this hub? You will have to re-pair it to use its controllers again.',
            {
                onYes: async () => {
                    await this._devices.disconnectHub(hub);
                },
            },
        );
    }

    public async identify(buzzer: BuzzerDevice): Promise<void> {
        this._toast.info(`Flashing the light on ${buzzer.name}.`);
        await buzzer.identify();
    }

    public playerDropped(
        event: CdkDragDrop<BuzzerDevice, unknown, Entity<BuzzerPlayer>>,
    ) {
        this._service.associatePlayerWithBuzzer(
            event.item.data,
            event.container.data,
        );
    }
}
