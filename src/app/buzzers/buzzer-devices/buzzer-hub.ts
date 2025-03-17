import { computed, signal } from '@angular/core';
import { BuzzerDevice } from './buzzer-device';
import { BuzzerHubButtonState } from './model';

interface BuzzerHubLightState {
    light1On: boolean;
    light2On: boolean;
    light3On: boolean;
    light4On: boolean;
}

/**
 * Represents a single Buzz Wireless Controller Receiver. Enables setting the
 * lights of all 4 controllers and interpreting when one of their buttons has
 * been pressed.
 *
 * Create by calling the {@link BuzzerHub.create} static factory method. The
 * resultant object will be fully set up to work with the currently plugged in
 * USB device.
 */
export class BuzzerHub {
    /** The WebHID USB device this BuzzerHub abstracts. */
    public readonly device: HIDDevice;

    /** The first controller device paired to this hub. */
    public readonly buzzer1 = signal<BuzzerDevice>(new BuzzerDevice(this, 1));

    /** The second controller device paired to this hub. */
    public readonly buzzer2 = signal<BuzzerDevice>(new BuzzerDevice(this, 2));

    /** The third controller device paired to this hub. */
    public readonly buzzer3 = signal<BuzzerDevice>(new BuzzerDevice(this, 3));

    /** The fourth controller device paired to this hub. */
    public readonly buzzer4 = signal<BuzzerDevice>(new BuzzerDevice(this, 4));

    /**
     * The current state of all of the lights on the controllers connected to
     * this hub.
     */
    public readonly lights = signal<BuzzerHubLightState>({
        light1On: false,
        light2On: false,
        light3On: false,
        light4On: false,
    });

    /** A list of all four buzzers connected to this hub. */
    public readonly buzzers = computed(() => [
        this.buzzer1(),
        this.buzzer2(),
        this.buzzer3(),
        this.buzzer4(),
    ]);

    /**
     * @constructor
     * @private - use the {@link BuzzerHub.create} method.
     */
    private constructor(device: HIDDevice) {
        this.device = device;
        device.addEventListener('inputreport', this.onInputReport.bind(this));
    }

    /**
     * Asynchronously creates a BuzzerHub object to represent the given USB
     * device.
     */
    static async create(device: HIDDevice): Promise<BuzzerHub> {
        const hub = new BuzzerHub(device);

        if (!device.opened) {
            await device.open();
            await hub.setAllLights(true);
        }

        return hub;
    }

    /** Asynchronously disposes this BuzzerHub. */
    public async dispose(): Promise<void> {
        if (this.device.opened) {
            this.device.removeEventListener(
                'inputreport',
                this.onInputReport.bind(this),
            );
            await this.device.close();
            await this.device.forget();
        }
    }

    /**
     * Sets the lights of all four controllers connected to this hub to either
     * on or off.
     */
    public async setAllLights(on: boolean): Promise<void> {
        await this.setLight(1, on);
        await this.setLight(2, on);
        await this.setLight(3, on);
        await this.setLight(4, on);
    }

    /**
     * Sets the light of a specific controller connected to this hub to either
     * be on or off.
     */
    public async setLight(buzzerIndex: number, on: boolean): Promise<void> {
        // Get the current state of all 4 lights
        const lightState = this.lights();

        // Work out which light's state needs to change
        lightState.light1On = buzzerIndex === 1 ? on : lightState.light1On;
        lightState.light2On = buzzerIndex === 2 ? on : lightState.light2On;
        lightState.light3On = buzzerIndex === 3 ? on : lightState.light3On;
        lightState.light4On = buzzerIndex === 4 ? on : lightState.light4On;

        // This USB device only accepts a single output report, which sets the
        // current state of all four lights on the device (hence why we need to
        // know what they all are).

        // Report is a 7-byte array with bytes 0, 5, 6 and 7 being 0, and bytes
        // 1, 2, 3 and 4 being either set or unset depending upon which lights
        // should be on.
        const buffer = new Uint8Array(7);
        buffer[1] = lightState.light1On ? 0xff : 0x00;
        buffer[2] = lightState.light2On ? 0xff : 0x00;
        buffer[3] = lightState.light3On ? 0xff : 0x00;
        buffer[4] = lightState.light4On ? 0xff : 0x00;

        try {
            if (this.device.opened) {
                // Send the output report to the device
                await this.device.sendReport(
                    0, // The output report ID
                    buffer,
                );
            }
        } catch (err) {
            console.error(err);
        }

        // Finally, update our idea of this hub's light state
        this.lights.set({ ...lightState });
    }

    /**
     * When the device makes an input (i.e. one of the controllers pressed or
     * released one of the buttons), interpret it and update our idea of the
     * currently pressed button state.
     */
    protected onInputReport(event: HIDInputReportEvent): void {
        const arrData = new Uint8Array(event.data.buffer);
        const state = this.parseReport(arrData);
        this.setButtonState(state);
    }

    /**
     * Given the contents of a Buzz Controller's input report fired when a
     * button is pressed or released, create a {@link BuzzerHubButtonState}
     * object to represent the pressed/unpressed state of all 20 buttons (5
     * buttons on 4 controllers).
     */
    protected parseReport(arrData: Uint8Array): BuzzerHubButtonState {
        return {
            buzzer1: {
                red: (arrData[2] & 0x01) !== 0,
                yellow: (arrData[2] & 0x02) !== 0,
                green: (arrData[2] & 0x04) !== 0,
                orange: (arrData[2] & 0x08) !== 0,
                blue: (arrData[2] & 0x10) !== 0,
            },
            buzzer2: {
                red: (arrData[2] & 0x20) !== 0,
                yellow: (arrData[2] & 0x40) !== 0,
                green: (arrData[2] & 0x80) !== 0,
                orange: (arrData[3] & 0x01) !== 0,
                blue: (arrData[3] & 0x02) !== 0,
            },
            buzzer3: {
                red: (arrData[3] & 0x04) !== 0,
                yellow: (arrData[3] & 0x08) !== 0,
                green: (arrData[3] & 0x10) !== 0,
                orange: (arrData[3] & 0x20) !== 0,
                blue: (arrData[3] & 0x40) !== 0,
            },
            buzzer4: {
                red: (arrData[3] & 0x80) !== 0,
                yellow: (arrData[4] & 0x01) !== 0,
                green: (arrData[4] & 0x02) !== 0,
                orange: (arrData[4] & 0x04) !== 0,
                blue: (arrData[4] & 0x08) !== 0,
            },
        };
    }

    /**
     * Given a parsed button state object for this entire hub, update each
     * controller's understanding of its current button state.
     */
    protected setButtonState(state: BuzzerHubButtonState): void {
        this.buzzer1().setButtonState(state.buzzer1);
        this.buzzer2().setButtonState(state.buzzer2);
        this.buzzer3().setButtonState(state.buzzer3);
        this.buzzer4().setButtonState(state.buzzer4);
    }
}
