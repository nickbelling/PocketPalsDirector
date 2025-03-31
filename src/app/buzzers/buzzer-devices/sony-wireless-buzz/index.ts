import { SONY_WIRELESS_BUZZ_CONTROLLER_HID_FILTER } from './model';

export * from './model';
export * from './sony-buzz-device-service';
export * from './sony-wireless-buzz-controller';
export * from './sony-wireless-buzz-controller-hub';

/**
 * Returns true if the given HIDDevice is a PS3 Buzz! Wireless Controller
 * Receiver.
 */
export function deviceIsSonyBuzzDevice(device: HIDDevice): boolean {
    return (
        device.vendorId === SONY_WIRELESS_BUZZ_CONTROLLER_HID_FILTER.vendorId &&
        device.productId === SONY_WIRELESS_BUZZ_CONTROLLER_HID_FILTER.productId
    );
}
