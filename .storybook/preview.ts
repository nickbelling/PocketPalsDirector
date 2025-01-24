import { setCompodocJson } from '@storybook/addon-docs/angular';
import type { Preview } from '@storybook/angular';
import docJson from '../documentation.json';
setCompodocJson(docJson);

const preview: Preview = {
    // Enables auto-generated documentation for all stories
    tags: ['autodocs'],
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
};

export default preview;
