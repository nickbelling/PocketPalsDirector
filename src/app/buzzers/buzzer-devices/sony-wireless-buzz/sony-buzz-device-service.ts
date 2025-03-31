import { computed, Injectable, signal } from '@angular/core';
import { deviceIsSonyBuzzDevice } from '.';
import { BuzzerDeviceHub, UnsupportedDeviceError } from '../model';
import { SonyWirelessBuzzController } from './sony-wireless-buzz-controller';
import {
    hubIsSonyWirelessHub,
    SonyWirelessBuzzControllerHub,
} from './sony-wireless-buzz-controller-hub';

/** Service that manages connected Sony Wireless Buzz! Controllers. */
@Injectable({
    providedIn: 'root',
})
export class SonyBuzzDeviceService {
    /**
     * A list of BuzzerHubs. Set asynchronously in an effect below, due to
     * needing asynchronous setup/teardown.
     */
    public hubs = signal<SonyWirelessBuzzControllerHub[]>([]);

    /** A list of available buzzer devices. */
    public buzzers = computed<SonyWirelessBuzzController[]>(() => {
        const hubs = this.hubs();
        return hubs?.flatMap((hub) => hub.buzzers()) || [];
    });

    public async addHub(device: HIDDevice): Promise<void> {
        if (deviceIsSonyBuzzDevice(device)) {
            const hub = await SonyWirelessBuzzControllerHub.create(device);
            this.hubs.update((existing) => [...existing, hub]);
        } else {
            throw new UnsupportedDeviceError(device);
        }
    }

    public async removeHub(hub: BuzzerDeviceHub): Promise<void> {
        if (hubIsSonyWirelessHub(hub)) {
            await hub.dispose();
            this.hubs.update((existing) =>
                existing.filter((h) => h.device !== hub.device),
            );
        } else {
            throw new UnsupportedDeviceError(hub.device);
        }
    }
}
