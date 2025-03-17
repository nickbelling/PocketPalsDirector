export type BuzzerDeviceButton = 'red' | 'blue' | 'orange' | 'green' | 'yellow';

/**
 * The current state of the buttons on a single buzzer device connected to a hub.
 */
export interface BuzzerDeviceButtonState {
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
export interface BuzzerHubButtonState {
    /** The current state of the buttons on buzzer 1. */
    buzzer1: BuzzerDeviceButtonState;
    /** The current state of the buttons on buzzer 2. */
    buzzer2: BuzzerDeviceButtonState;
    /** The current state of the buttons on buzzer 3. */
    buzzer3: BuzzerDeviceButtonState;
    /** The current state of the buttons on buzzer 4. */
    buzzer4: BuzzerDeviceButtonState;
}
