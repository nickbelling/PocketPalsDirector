export const SONY_WIRELESS_BUZZ_CONTROLLER_HID_FILTER: HIDDeviceFilter = {
    vendorId: 0x054c, // Sony Corp.
    productId: 0x1000, // Wireless Buzz! Receiver
};

export type SonyBuzzControllerButton =
    | 'red'
    | 'blue'
    | 'orange'
    | 'green'
    | 'yellow';

/**
 * The current state of the buttons on a single Sony Buzz! Controller connected
 * to a hub.
 */
export interface SonyBuzzControllerButtonState {
    /** True if the red button is currently pressed. */
    red: boolean;
    /** True if the yellow button is currently pressed. */
    yellow: boolean;
    /** True if the green button is currently pressed. */
    green: boolean;
    /** True if the orange button is currently pressed. */
    orange: boolean;
    /** True if the blue button is currently pressed. */
    blue: boolean;
}

/** The current state of the buttons on a Buzzer Hub. */
export interface SonyBuzzControllerHubButtonState {
    /** The current state of the buttons on buzzer 1. */
    buzzer1: SonyBuzzControllerButtonState;
    /** The current state of the buttons on buzzer 2. */
    buzzer2: SonyBuzzControllerButtonState;
    /** The current state of the buttons on buzzer 3. */
    buzzer3: SonyBuzzControllerButtonState;
    /** The current state of the buttons on buzzer 4. */
    buzzer4: SonyBuzzControllerButtonState;
}
