import type { Config } from 'jest';

const config: Config = {
    verbose: true,
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                allowSyntheticDefaultImports: true,
            },
        ],
        '^.+\\.js$': 'babel-jest',
    },
};

export default config;
