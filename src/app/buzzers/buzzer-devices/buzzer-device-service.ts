import { computed, effect, Injectable, signal, untracked } from '@angular/core';
import { BuzzerDevice } from './buzzer-device';
import { BuzzerHub } from './buzzer-hub';

const SONY_BUZZ_CONTROLLER_INFO = {
    vendorId: 0x054c, // Sony Corp.
    productId: 0x1000, // Wireless Buzz! Receiver
};

/** Service that manages connected Sony Buzz! Controllers. */
@Injectable({
    providedIn: 'root',
})
export class BuzzerDeviceService {
    /** True if this browser supports WebHID devices. */
    public canUseDevices = signal<boolean>(navigator.hid !== undefined);

    /** The list of currently paired HIDDevices. */
    public hidDevices = signal<HIDDevice[]>([]);

    /**
     * A list of BuzzerHubs. Set asynchronously in an effect below, due to
     * needing asynchronous setup/teardown.
     */
    public hubs = signal<BuzzerHub[]>([]);

    /** A list of available buzzer devices. */
    public buzzers = computed<BuzzerDevice[]>(() => {
        const hubs = this.hubs();
        return hubs?.flatMap((hub) => hub.buzzers()) || [];
    });

    /** @constructor */
    constructor() {
        if (this.canUseDevices()) {
            this._addEventListeners();
        }

        // When we first determine we can use WebHID devices, find any which are
        // already paired and make their companion BuzzerHubs.
        effect(async () => {
            if (this.canUseDevices()) {
                const devices = await navigator.hid.getDevices();
                for (const device of devices) {
                    this._addHIDDevice(device);
                }
            }
        });

        // When the list of HIDDevices updates, check it against the currently
        // registered BuzzerHubs and asynchronously set up any new ones and
        // properly dispose of any removed ones.
        effect(async () => {
            const updatedDeviceList: HIDDevice[] = this.hidDevices();

            const updatedHubs = await untracked(async () => {
                const hubs: BuzzerHub[] = this.hubs() || [];

                // Figure out which devices don't already have hubs and require
                // asynchronous setup.
                const addedDevices = updatedDeviceList.filter(
                    (device) => !hubs.some((hub) => hub.device === device),
                );

                // Figure out which devices aren't in the list anymore and
                // require asynchronous teardown.
                const removedHubs = hubs.filter(
                    (hub) =>
                        !updatedDeviceList.some(
                            (device) => hub.device === device,
                        ),
                );

                // Set up the new devices.
                for (const addedDevice of addedDevices) {
                    const hub = await BuzzerHub.create(addedDevice);
                    hubs.push(hub);
                }

                // Tear down the old devices.
                for (const removedHub of removedHubs) {
                    await removedHub.dispose();
                    hubs.splice(hubs.indexOf(removedHub), 1);
                }

                return [...hubs];
            });

            this.hubs.set(updatedHubs);
        });
    }

    /** Opens a browser prompt to allow the user to pair a device. */
    public async connectHubs(): Promise<void> {
        // Prompt user to select a device
        const requestedDevices = await navigator.hid.requestDevice({
            filters: [SONY_BUZZ_CONTROLLER_INFO],
        });

        for (const device of requestedDevices) {
            this._addHIDDevice(device);
        }
    }

    /** Disconnects the given BrowserHub device. */
    public async disconnectHub(hub: BuzzerHub): Promise<void> {
        this._removeHIDDevice(hub.device);
    }

    /**
     * Hooks global WebHID listeners to react to devices connecting or
     * disconnecting.
     */
    private _addEventListeners(): void {
        navigator.hid.addEventListener(
            'connect',
            (event: HIDConnectionEvent) => {
                const device = event.device;
                this._addHIDDevice(device);
            },
        );

        navigator.hid.addEventListener(
            'disconnect',
            async (event: HIDConnectionEvent) => {
                const device = event.device;
                await this._removeHIDDevice(device);
            },
        );
    }

    /**
     * Given a HIDDevice, determines if it's a Buzz Wireless Receiver we don't
     * know about, and adds it to the list of HIDDevices if it's new.
     */
    private _addHIDDevice(device: HIDDevice): void {
        if (this._deviceIsBuzzReceiverHub(device)) {
            // Determine if device being added is a new one
            this.hidDevices.update((existingDevices) => {
                if (existingDevices.includes(device)) {
                    return existingDevices;
                } else {
                    return [...existingDevices, device];
                }
            });
        }
    }

    /**
     * Given a HIDDevice, removes it from the list of known devices if it's in
     * it.
     */
    private async _removeHIDDevice(device: HIDDevice): Promise<void> {
        if (this._deviceIsBuzzReceiverHub(device)) {
            this.hidDevices.update((existingDevices) => {
                return existingDevices.filter((d) => d !== device);
            });
        }
    }

    /**
     * Returns true if the given HIDDevice is a PS3 Buzz! Wireless Controller
     * Receiver.
     */
    private _deviceIsBuzzReceiverHub(device: HIDDevice): boolean {
        return (
            device.vendorId === SONY_BUZZ_CONTROLLER_INFO.vendorId &&
            device.productId === SONY_BUZZ_CONTROLLER_INFO.productId
        );
    }
}
