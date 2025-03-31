import { computed, EventEmitter } from '@angular/core';
import { sleep } from '../../../common/utils';
import { BuzzerDevice, SupportedBuzzerDeviceType } from '../model';
import {
    SonyBuzzControllerButton,
    SonyBuzzControllerButtonState,
} from './model';
import { SonyWirelessBuzzControllerHub } from './sony-wireless-buzz-controller-hub';

/**
 * Represents a single Sony Buzz! Wireless Controller, paired to a
 * {@link SonyWirelessBuzzControllerHub}.
 */
export class SonyWirelessBuzzController implements BuzzerDevice {
    public type: SupportedBuzzerDeviceType = 'sonyWirelessBuzz';

    /**
     * The last known state of each button on the controller. Used to determine
     * if it just transitioned from "pressed" to "unpressed".
     */
    private _lastState: SonyBuzzControllerButtonState = {
        red: false,
        yellow: false,
        orange: false,
        green: false,
        blue: false,
    };

    /** A signal that shows whether or not this controller's light is on. */
    public isLit = computed<boolean>(() => {
        switch (this.buzzerIndex) {
            case 1:
                return this.hub.lights().light1On;
            case 2:
                return this.hub.lights().light2On;
            case 3:
                return this.hub.lights().light3On;
            case 4:
                return this.hub.lights().light4On;
            default:
                return false;
        }
    });

    /**
     * Emits when a button on the controller has been pressed (with the argument
     * describing which one was).
     */
    public readonly buttonPressed =
        new EventEmitter<SonyBuzzControllerButton>();

    /** @inheritdoc */
    public get name(): string {
        return `Buzz Controller ${this.buzzerIndex}`;
    }

    /** @inheritdoc */
    public readonly buzzed = new EventEmitter<void>();

    /** @constructor */
    constructor(
        private hub: SonyWirelessBuzzControllerHub,
        public readonly buzzerIndex: number,
    ) {}

    /** @inheritdoc */
    public enable(): Promise<void> {
        return this.setLight(true);
    }

    /** @inheritdoc */
    public disable(): Promise<void> {
        return this.setLight(false);
    }

    /** @inheritdoc */
    public identify(): Promise<void> {
        return this.flash();
    }

    /** Turns this controller's light on or off. */
    public async setLight(on: boolean): Promise<void> {
        this.hub.setLight(this.buzzerIndex, on);
    }

    /** Flashes this controller's light 3 times. */
    public async flash(): Promise<void> {
        // Store the existing state so we can reset it
        const existingState = this.isLit();

        // Flash the light 3 times
        for (let i = 0; i < 3; i++) {
            await this.setLight(true);
            await sleep(200);
            await this.setLight(false);
            await sleep(200);
        }

        // Restore the existing state
        this.setLight(existingState);
    }

    /**
     * Called by the hub, this function updates this buzzer controller's known
     * button press state. If the previous state shows that a button was pressed
     * and the new state shows that it isn't, we can infer it has just been
     * released, and emit the {@link buttonPressed} event.
     */
    public setButtonState(newState: SonyBuzzControllerButtonState): void {
        // Check if each button was just released
        if (this._lastState.red && !newState.red) {
            this.buttonPressed.emit('red');
        }

        if (this._lastState.yellow && !newState.yellow) {
            this.buttonPressed.emit('yellow');
        }

        if (this._lastState.orange && !newState.orange) {
            this.buttonPressed.emit('orange');
        }

        if (this._lastState.green && !newState.green) {
            this.buttonPressed.emit('green');
        }

        if (this._lastState.blue && !newState.blue) {
            this.buttonPressed.emit('blue');
        }

        // Finally, store this updated state
        this._lastState = newState;
    }
}
