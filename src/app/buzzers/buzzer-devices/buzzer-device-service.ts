import {
    computed,
    effect,
    inject,
    Injectable,
    signal,
    untracked,
} from '@angular/core';
import { BuzzerDevice, BuzzerDeviceHub } from './model';
import {
    deviceIsSonyBuzzDevice,
    SONY_WIRELESS_BUZZ_CONTROLLER_HID_FILTER,
    SonyBuzzDeviceService,
} from './sony-wireless-buzz';

@Injectable({
    providedIn: 'root',
})
export class BuzzerDeviceService {
    private _sonyDevices = inject(SonyBuzzDeviceService);

    /** True if this browser supports WebHID devices. */
    public canUseDevices = signal<boolean>(navigator.hid !== undefined);

    /** The list of currently paired HIDDevices. */
    public hidDevices = signal<HIDDevice[]>([]);

    /**
     * The list of currently configured BuzzerDeviceHubs, based on each
     * device-specific service's list of hubs. Used to match HIDDevices to their
     * device-specific handling.
     */
    public hubs = computed<BuzzerDeviceHub[]>(() => {
        return [...this._sonyDevices.hubs()];
    });

    /**
     * The list of currently configured BuzzerDevices, based on each
     * device-specific service's list of buzzers.
     */
    public buzzers = computed<BuzzerDevice[]>(() => {
        return [...this._sonyDevices.buzzers()];
    });

    constructor() {
        this._addEventListeners();

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

            await untracked(async () => {
                const hubs: BuzzerDeviceHub[] = this.hubs() || [];

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
                    if (deviceIsSonyBuzzDevice(addedDevice)) {
                        await this._sonyDevices.addHub(addedDevice);
                    }
                }

                // Tear down the old devices.
                for (const removedHub of removedHubs) {
                    if (deviceIsSonyBuzzDevice(removedHub.device)) {
                        await this._sonyDevices.removeHub(removedHub);
                    }
                }
            });
        });
    }

    /** Opens a browser prompt to allow the user to pair a device. */
    public async connectHubs(): Promise<void> {
        // Prompt user to select a device
        const requestedDevices = await navigator.hid.requestDevice({
            filters: [SONY_WIRELESS_BUZZ_CONTROLLER_HID_FILTER],
        });

        for (const device of requestedDevices) {
            this._addHIDDevice(device);
        }
    }

    /** Disconnects the given BrowserHub device. */
    public async disconnectHub(hub: BuzzerDeviceHub): Promise<void> {
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

    /** Returns true if the device is a supported device. */
    private _deviceIsSupported(device: HIDDevice): boolean {
        return deviceIsSonyBuzzDevice(device); // or some other device
    }

    /**
     * Given a HIDDevice, determines if it's a Buzz Wireless Receiver we don't
     * know about, and adds it to the list of HIDDevices if it's new.
     */
    private _addHIDDevice(device: HIDDevice): void {
        if (this._deviceIsSupported(device)) {
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
        if (this._deviceIsSupported(device)) {
            this.hidDevices.update((existingDevices) => {
                return existingDevices.filter((d) => d !== device);
            });
        }
    }
}
