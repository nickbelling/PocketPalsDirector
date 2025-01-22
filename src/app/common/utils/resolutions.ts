export interface Resolution {
    width: number;
    height: number;
}

function res(width: number, height: number): Resolution {
    return { width, height };
}

// 16:9
export const RESOLUTION_1920x1080 = res(1920, 1080);
export const RESOLUTION_1280x720 = res(1280, 720);
export const RESOLUTION_960x540 = res(960, 540);

// 9:16
export const RESOLUTION_1080x1920 = res(1080, 1920);
export const RESOLUTION_720x1280 = res(720, 1280);
export const RESOLUTION_540x960 = res(540, 960);

// 4:3
export const RESOLUTION_1440x1080 = res(1440, 1080);
export const RESOLUTION_960x720 = res(960, 720);
export const RESOLUTION_800x600 = res(800, 600);
export const RESOLUTION_640x480 = res(640, 480);

// 3:4
export const RESOLUTION_1080x1440 = res(1080, 1440);
export const RESOLUTION_720x960 = res(720, 960);
export const RESOLUTION_600x800 = res(600, 800);
export const RESOLUTION_480x640 = res(480, 640);

// 1:1
export const RESOLUTION_1000x1000 = res(1000, 1000);
export const RESOLUTION_750x750 = res(750, 750);
export const RESOLUTION_500x500 = res(500, 500);

export const RESOLUTIONS_16_9: Resolution[] = [
    RESOLUTION_1920x1080,
    RESOLUTION_1280x720,
    RESOLUTION_960x540,
];

export const RESOLUTIONS_9_16: Resolution[] = [
    RESOLUTION_1080x1920,
    RESOLUTION_720x1280,
    RESOLUTION_540x960,
];

export const RESOLUTIONS_4_3: Resolution[] = [
    RESOLUTION_1440x1080,
    RESOLUTION_960x720,
    RESOLUTION_800x600,
    RESOLUTION_640x480,
];

export const RESOLUTIONS_3_4: Resolution[] = [
    RESOLUTION_1080x1440,
    RESOLUTION_720x960,
    RESOLUTION_600x800,
    RESOLUTION_480x640,
];

export const RESOLUTIONS_1_1: Resolution[] = [
    RESOLUTION_1000x1000,
    RESOLUTION_750x750,
    RESOLUTION_500x500,
];

export const RESOLUTIONS: Record<string, Resolution[]> = {
    '16:9': RESOLUTIONS_16_9,
    '4:3': RESOLUTIONS_4_3,
    '1:1': RESOLUTIONS_1_1,
    '9:16': RESOLUTIONS_9_16,
    '3:4': RESOLUTIONS_3_4,
};
