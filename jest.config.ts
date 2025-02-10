import type { Config } from 'jest';
import presets from 'jest-preset-angular/presets';

const preset = presets.createCjsPreset();

const config: Config = {
    ...preset,
    verbose: true,
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
};

export default config;
