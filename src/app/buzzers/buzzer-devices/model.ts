import { EventEmitter } from '@angular/core';

export type SupportedBuzzerDeviceType = 'sonyWirelessBuzz';

export interface BuzzerDevice {
    type: SupportedBuzzerDeviceType;

    get name(): string;

    /** Fired when the player buzzes in (i.e. presses the button). */
    buzzed: EventEmitter<void>;

    /** Identifies the buzzer (usually by flashing its light). */
    identify(): Promise<void>;

    /** Enables the buzzer for the current player (usually turning on its light). */
    enable(): Promise<void>;

    /** Disables the buzzer for the current player (usually turning off its light). */
    disable(): Promise<void>;
}

export interface BuzzerDeviceHub {
    type: SupportedBuzzerDeviceType;

    /** The physical USB HID device this hub represents. */
    device: HIDDevice;
}

export class UnsupportedDeviceError extends Error {
    constructor(public device: HIDDevice) {
        super(`${device.productName} is unsupported.`);
    }
}
