import type { Meta, StoryObj } from '@storybook/angular';

import { Alert } from './alert';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<Alert> = {
    title: 'Common/Components/Alert',
    component: Alert,
    tags: ['autodocs'],
    argTypes: {
        type: {
            control: 'select',
        },
        title: {
            control: 'text',
        },
    },
};

export default meta;
type Story = StoryObj<Alert>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
    args: {
        type: 'info',
        title: 'Basic alert',
    },
};

export const Info: Story = {
    args: {
        type: 'info',
        title: 'Info alert',
    },
};

export const Warning: Story = {
    args: {
        type: 'warning',
        title: 'Warning alert',
    },
};

export const Error: Story = {
    args: {
        type: 'error',
        title: 'Error alert',
    },
};
